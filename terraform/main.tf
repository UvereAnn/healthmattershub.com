# ─────────────────────────────────────────────
#  Root Module
#  Calls all child modules in order
#  Each module is responsible for one concern
# ─────────────────────────────────────────────

# ── Networking ───────────────────────────────
module "networking" {
  source       = "./modules/networking"
  project_name = var.project_name
  environment  = var.environment
  aws_region   = var.aws_region
}

# ── Security ─────────────────────────────────
module "security" {
  source       = "./modules/security"
  project_name = var.project_name
  environment  = var.environment
  vpc_id       = module.networking.vpc_id
  nat_gateway_ip = module.networking.nat_gateway_ip
}

# ── ECR ──────────────────────────────────────
module "ecr" {
  source       = "./modules/ecr"
  project_name = var.project_name
  environment  = var.environment
}

# ── ALB ──────────────────────────────────────
module "alb" {
  source            = "./modules/alb"
  project_name      = var.project_name
  environment       = var.environment
  vpc_id            = module.networking.vpc_id
  public_subnet_ids = module.networking.public_subnet_ids
  alb_sg_id         = module.security.alb_sg_id
  domain_name       = var.domain_name
}

# ── ECS/Fargate ──────────────────────────────
module "ecs" {
  source              = "./modules/ecs"
  project_name        = var.project_name
  environment         = var.environment
  aws_region          = var.aws_region
  vpc_id              = module.networking.vpc_id
  private_subnet_ids  = module.networking.private_subnet_ids
  fargate_sg_id       = module.security.fargate_sg_id
  execution_role_arn  = module.security.ecs_execution_role_arn
  task_role_arn       = module.security.ecs_task_role_arn
  target_group_arn    = module.alb.target_group_arn
  backend_image       = var.backend_image != "" ? var.backend_image : module.ecr.backend_repository_url
  frontend_image      = var.frontend_image != "" ? var.frontend_image : module.ecr.frontend_repository_url
  mongo_uri           = var.mongo_uri
  jwt_secret          = var.jwt_secret
  jwt_expire          = var.jwt_expire
  frontend_url        = var.frontend_url
}