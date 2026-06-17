# ─────────────────────────────────────────────
#  Root Outputs
#  Values shown after terraform apply
#  These are what you use to access your app
# ─────────────────────────────────────────────

output "alb_dns_name" {
  description = "ALB DNS name - use this to access your app"
  value       = module.alb.alb_dns_name
}

output "alb_zone_id" {
  description = "ALB Zone ID for Route 53"
  value       = module.alb.alb_zone_id
}

output "backend_ecr_url" {
  description = "Backend ECR repository URL"
  value       = module.ecr.backend_repository_url
}

output "frontend_ecr_url" {
  description = "Frontend ECR repository URL"
  value       = module.ecr.frontend_repository_url
}

output "ecs_cluster_name" {
  description = "ECS cluster name"
  value       = module.ecs.cluster_name
}

output "ecs_service_name" {
  description = "ECS service name"
  value       = module.ecs.service_name
}

output "vpc_id" {
  description = "VPC ID"
  value       = module.networking.vpc_id
}

output "nat_gateway_ip" {
  description = "NAT Gateway IP - whitelist this in MongoDB Atlas"
  value       = module.networking.nat_gateway_ip
}

output "alb_certificate_validation_options" {
  description = "DNS records needed to validate the SSL certificate"
  value       = module.alb.certificate_validation_options
}