# ─────────────────────────────────────────────
#  ECS/Fargate Module
#
#  Creates:
#  - ECS Cluster
#  - ECS Task Definition (Sidecar Pattern)
#    Container 1: backend  (Node.js)
#    Container 2: frontend (React + Nginx)
#    Container 3: prometheus-exporter (sidecar)
#  - ECS Service
#  - Auto Scaling
# ─────────────────────────────────────────────

variable "project_name"       { type = string }
variable "environment"        { type = string }
variable "aws_region"         { type = string }
variable "vpc_id"             { type = string }
variable "private_subnet_ids" { type = list(string) }
variable "fargate_sg_id"      { type = string }
variable "execution_role_arn" { type = string }
variable "task_role_arn"      { type = string }
variable "target_group_arn"   { type = string }
variable "backend_image"      { type = string }
variable "frontend_image"     { type = string }
variable "mongo_uri"          { 
  type = string 
  sensitive = true
}
variable "jwt_secret"         { 
  type = string 
  sensitive = true 
}
variable "jwt_expire"         { type = string }
variable "frontend_url"       { type = string }

# ── ECS Cluster ──────────────────────────────
resource "aws_ecs_cluster" "main" {
  name = "${var.project_name}-cluster"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  tags = {
    Name = "${var.project_name}-cluster"
  }
}

# ── ECS Task Definition ──────────────────────
# Blueprint for your containers
# Sidecar pattern: multiple containers in one task
# They share the same network namespace
resource "aws_ecs_task_definition" "app" {
  family                   = "${var.project_name}-task"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = 512
  memory                   = 1024
  execution_role_arn       = var.execution_role_arn
  task_role_arn            = var.task_role_arn

  container_definitions = jsonencode([

    # ── Container 1: Backend ─────────────────
    {
      name      = "backend"
      image     = var.backend_image
      essential = true

      portMappings = [
        {
          containerPort = 5000
          protocol      = "tcp"
        }
      ]

      environment = [
        { name = "NODE_ENV",      value = "production" },
        { name = "PORT",          value = "5000" },
        { name = "JWT_EXPIRE",    value = var.jwt_expire },
        { name = "FRONTEND_URL",  value = var.frontend_url }
      ]

      secrets = [
        {
          name      = "MONGO_URI"
          valueFrom = aws_ssm_parameter.mongo_uri.arn
        },
        {
          name      = "JWT_SECRET"
          valueFrom = aws_ssm_parameter.jwt_secret.arn
        }
      ]

      healthCheck = {
        command     = ["CMD-SHELL", "wget -qO- http://localhost:5000/api/health || exit 1"]
        interval    = 30
        timeout     = 10
        retries     = 3
        startPeriod = 40
      }

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = "/ecs/${var.project_name}"
          awslogs-region        = var.aws_region
          awslogs-stream-prefix = "backend"
        }
      }
    },

    # ── Container 2: Frontend ─────────────────
    {
      name      = "frontend"
      image     = var.frontend_image
      essential = true

      portMappings = [
        {
          containerPort = 80
          protocol      = "tcp"
        }
      ]

      healthCheck = {
        command     = ["CMD-SHELL", "wget -qO- http://localhost:80 || exit 1"]
        interval    = 30
        timeout     = 10
        retries     = 3
        startPeriod = 20
      }

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = "/ecs/${var.project_name}"
          awslogs-region        = var.aws_region
          awslogs-stream-prefix = "frontend"
        }
      }
    },

    # ── Container 3: Prometheus Exporter ──────
    # Sidecar pattern
    # Runs alongside app containers
    # Scrapes metrics from backend
    # Same network = localhost access
    {
      name      = "prometheus-exporter"
      image     = "prom/node-exporter:latest"
      essential = false

      portMappings = [
        {
          containerPort = 9100
          protocol      = "tcp"
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = "/ecs/${var.project_name}"
          awslogs-region        = var.aws_region
          awslogs-stream-prefix = "prometheus"
        }
      }
    }
  ])

  tags = {
    Name = "${var.project_name}-task"
  }
}

# ── SSM Parameters for Secrets ───────────────
# Stores secrets in AWS Systems Manager
# Much safer than environment variables
# ECS pulls these at runtime
resource "aws_ssm_parameter" "mongo_uri" {
  name  = "/${var.project_name}/mongo_uri"
  type  = "SecureString"
  value = var.mongo_uri

  tags = {
    Name = "${var.project_name}-mongo-uri"
  }
}

resource "aws_ssm_parameter" "jwt_secret" {
  name  = "/${var.project_name}/jwt_secret"
  type  = "SecureString"
  value = var.jwt_secret

  tags = {
    Name = "${var.project_name}-jwt-secret"
  }
}

# ── IAM Policy for SSM Access ────────────────
# Execution role needs permission to read SSM parameters
resource "aws_iam_role_policy" "ssm_access" {
  name = "${var.project_name}-ssm-access"
  role = split("/", var.execution_role_arn)[1]

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ssm:GetParameters",
          "ssm:GetParameter"
        ]
        Resource = [
          aws_ssm_parameter.mongo_uri.arn,
          aws_ssm_parameter.jwt_secret.arn
        ]
      }
    ]
  })
}

# ── ECS Service ───────────────────────────────
# Keeps your tasks running
# Handles rolling deployments
# Registers tasks with ALB target group
resource "aws_ecs_service" "main" {
  name            = "${var.project_name}-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.app.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = var.private_subnet_ids
    security_groups  = [var.fargate_sg_id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = var.target_group_arn
    container_name   = "frontend"
    container_port   = 80
  }

  deployment_controller {
    type = "ECS"
  }

  deployment_circuit_breaker {
    enable   = true
    rollback = true
  }

  depends_on = [
    aws_ecs_task_definition.app
  ]

  tags = {
    Name = "${var.project_name}-service"
  }
}

# ── Auto Scaling ──────────────────────────────
# Scale from 1 to 4 tasks based on CPU usage
resource "aws_appautoscaling_target" "ecs" {
  max_capacity       = 4
  min_capacity       = 1
  resource_id        = "service/${aws_ecs_cluster.main.name}/${aws_ecs_service.main.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

resource "aws_appautoscaling_policy" "cpu" {
  name               = "${var.project_name}-cpu-scaling"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.ecs.resource_id
  scalable_dimension = aws_appautoscaling_target.ecs.scalable_dimension
  service_namespace  = aws_appautoscaling_target.ecs.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
    target_value = 70.0
  }
}

# ── Outputs ──────────────────────────────────
output "cluster_name" {
  value = aws_ecs_cluster.main.name
}

output "service_name" {
  value = aws_ecs_service.main.name
}

output "task_definition_arn" {
  value = aws_ecs_task_definition.app.arn
}