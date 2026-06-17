# ─────────────────────────────────────────────
#  Global Variables
#  Used across all Terraform modules
# ─────────────────────────────────────────────

variable "aws_region" {
  description = "AWS region for all resources"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project name used as prefix for all resources"
  type        = string
  default     = "healthmattershub"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

variable "mongo_uri" {
  description = "MongoDB Atlas connection string"
  type        = string
  sensitive   = true
}

variable "jwt_secret" {
  description = "JWT secret key"
  type        = string
  sensitive   = true
}

variable "jwt_expire" {
  description = "JWT expiry duration"
  type        = string
  default     = "30d"
}

variable "frontend_url" {
  description = "Frontend URL for CORS"
  type        = string
  default     = "https://healthmattershub.com"
}

variable "domain_name" {
  description = "Your domain name"
  type        = string
  default     = "healthmattershub.com"
}

variable "backend_image" {
  description = "Backend Docker image URI from ECR"
  type        = string
  default     = ""
}

variable "frontend_image" {
  description = "Frontend Docker image URI from ECR"
  type        = string
  default     = ""
}