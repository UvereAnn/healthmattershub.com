# ─────────────────────────────────────────────
#  Security Module
#
#  Creates:
#  - IAM execution role (ECS pulls images, writes logs)
#  - IAM task role (app permissions at runtime)
#  - Security Group for ALB
#  - Security Group for Fargate
# ─────────────────────────────────────────────

variable "project_name"    { type = string }
variable "environment"     { type = string }
variable "vpc_id"          { type = string }
variable "nat_gateway_ip"  { type = string }

# ── IAM Execution Role ───────────────────────
# Used by ECS to:
# - Pull Docker images from ECR
# - Write logs to CloudWatch
# - Read secrets from Secrets Manager
resource "aws_iam_role" "ecs_execution" {
  name = "${var.project_name}-ecs-execution-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })

  tags = {
    Name = "${var.project_name}-ecs-execution-role"
  }
}

# Attach AWS managed policy for ECS task execution
# Grants: ECR pull, CloudWatch logs, Secrets Manager read
resource "aws_iam_role_policy_attachment" "ecs_execution" {
  role       = aws_iam_role.ecs_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# ── IAM Task Role ────────────────────────────
# Used by your running application
# What your app is allowed to do in AWS
resource "aws_iam_role" "ecs_task" {
  name = "${var.project_name}-ecs-task-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })

  tags = {
    Name = "${var.project_name}-ecs-task-role"
  }
}

# Inline policy for task role
# Only grant what the app actually needs
resource "aws_iam_role_policy" "ecs_task" {
  name = "${var.project_name}-ecs-task-policy"
  role = aws_iam_role.ecs_task.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "*"
      }
    ]
  })
}

# ── Security Group: ALB ──────────────────────
# What traffic can reach the Load Balancer
resource "aws_security_group" "alb" {
  name        = "${var.project_name}-alb-sg"
  description = "Security group for Application Load Balancer"
  vpc_id      = var.vpc_id

  # Allow HTTP from anywhere (redirects to HTTPS)
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTP from internet"
  }

  # Allow HTTPS from anywhere
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTPS from internet"
  }

  # Allow all outbound (to reach Fargate)
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "All outbound traffic"
  }

  tags = {
    Name = "${var.project_name}-alb-sg"
  }
}

# ── Security Group: Fargate ──────────────────
# What traffic can reach Fargate containers
resource "aws_security_group" "fargate" {
  name        = "${var.project_name}-fargate-sg"
  description = "Security group for Fargate containers"
  vpc_id      = var.vpc_id

  # Only allow traffic FROM the ALB security group
  # Not from the internet directly
  ingress {
    from_port       = 80
    to_port         = 80
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
    description     = "HTTP from ALB only"
  }

  ingress {
    from_port       = 5000
    to_port         = 5000
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
    description     = "Backend API from ALB only"
  }

  # Allow Prometheus scraping between containers
  ingress {
    from_port = 9090
    to_port   = 9090
    protocol  = "tcp"
    self      = true
    description = "Prometheus between containers"
  }

  # Allow all outbound
  # Needed for: ECR image pulls, MongoDB Atlas, npm
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "All outbound traffic"
  }

  tags = {
    Name = "${var.project_name}-fargate-sg"
  }
}

# ── CloudWatch Log Group ─────────────────────
# Where container logs are stored
resource "aws_cloudwatch_log_group" "app" {
  name              = "/ecs/${var.project_name}"
  retention_in_days = 7

  tags = {
    Name = "${var.project_name}-logs"
  }
}

# ── Outputs ──────────────────────────────────
output "alb_sg_id" {
  value = aws_security_group.alb.id
}

output "fargate_sg_id" {
  value = aws_security_group.fargate.id
}

output "ecs_execution_role_arn" {
  value = aws_iam_role.ecs_execution.arn
}

output "ecs_task_role_arn" {
  value = aws_iam_role.ecs_task.arn
}

output "log_group_name" {
  value = aws_cloudwatch_log_group.app.name
}