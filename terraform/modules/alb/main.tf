# ─────────────────────────────────────────────
#  ALB Module
#
#  Creates:
#  - Application Load Balancer
#  - Target Group (points to Fargate tasks)
#  - HTTP Listener (redirects to HTTPS)
#  - HTTPS Listener (serves traffic)
#  - ACM SSL Certificate (free HTTPS)
# ─────────────────────────────────────────────

variable "project_name"      { type = string }
variable "environment"       { type = string }
variable "vpc_id"            { type = string }
variable "public_subnet_ids" { type = list(string) }
variable "alb_sg_id"         { type = string }
variable "domain_name"       { type = string }

# ── SSL Certificate ──────────────────────────
# Free SSL from AWS Certificate Manager
# Validates via DNS (you add CNAME to your DNS)
resource "aws_acm_certificate" "main" {
  domain_name               = var.domain_name
  subject_alternative_names = ["www.${var.domain_name}"]
  validation_method         = "DNS"

  lifecycle {
    create_before_destroy = true
  }

  tags = {
    Name = "${var.project_name}-ssl-cert"
  }
}

# ── Application Load Balancer ────────────────
resource "aws_lb" "main" {
  name               = "${var.project_name}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [var.alb_sg_id]
  subnets            = var.public_subnet_ids

  enable_deletion_protection = false

  tags = {
    Name = "${var.project_name}-alb"
  }
}

# ── Target Group ─────────────────────────────
# Fargate tasks register here
# ALB sends traffic to healthy targets
resource "aws_lb_target_group" "main" {
  name        = "${var.project_name}-tg"
  port        = 80
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "ip"

  health_check {
    enabled             = true
    healthy_threshold   = 2
    unhealthy_threshold = 3
    timeout             = 10
    interval            = 30
    path                = "/api/health"
    matcher             = "200"
  }

  tags = {
    Name = "${var.project_name}-target-group"
  }
}

# ── HTTP Listener ────────────────────────────
# Redirects all HTTP to HTTPS
# Best practice: never serve over plain HTTP
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.main.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type = "redirect"
    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }
}

# ── HTTPS Listener ───────────────────────────
# Serves actual traffic
# Uses ACM certificate for SSL
resource "aws_lb_listener" "https" {
  load_balancer_arn = aws_lb.main.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS13-1-2-2021-06"
  certificate_arn   = aws_acm_certificate.main.arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.main.arn
  }

  depends_on = [aws_acm_certificate.main]
}

# ── Outputs ──────────────────────────────────
output "alb_dns_name" {
  value = aws_lb.main.dns_name
}

output "alb_zone_id" {
  value = aws_lb.main.zone_id
}

output "target_group_arn" {
  value = aws_lb_target_group.main.arn
}

output "certificate_arn" {
  value = aws_acm_certificate.main.arn
}

output "certificate_validation_options" {
  description = "Add these DNS records to validate SSL certificate"
  value       = aws_acm_certificate.main.domain_validation_options
}