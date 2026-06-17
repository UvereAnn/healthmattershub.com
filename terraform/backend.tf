# ─────────────────────────────────────────────
#  Terraform Backend Configuration
#
#  Stores state file in S3 instead of locally
#  Uses DynamoDB for state locking
#
#  Why remote state?
#  - State survives laptop loss
#  - Multiple people can collaborate
#  - State history with S3 versioning
#  - DynamoDB prevents concurrent applies
# ─────────────────────────────────────────────

terraform {
  required_version = ">= 1.0.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket         = "healthmattershub-terraform-state"
    key            = "production/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "healthmattershub-terraform-locks"
  }
}

# ── AWS Provider ─────────────────────────────
# Tells Terraform to use AWS
# Reads credentials from:
# 1. Environment variables (AWS_ACCESS_KEY_ID etc)
# 2. AWS CLI config (~/.aws/credentials)
# 3. IAM instance profile (when running on EC2)
provider "aws" {
  region = var.aws_region

  # Tags applied to every resource created
  # Makes it easy to find all your resources in AWS Console
  default_tags {
    tags = {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "Terraform"
      Repository  = "github.com/UvereAnn/healthmattershub.com"
    }
  }
}