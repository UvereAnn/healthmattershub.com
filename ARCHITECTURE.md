# 🧠 Architecture Decisions

This document explains the major technical decisions behind the HealthMattersHub platform.

The goal of this architecture is to demonstrate a production-style DevOps workflow using modern cloud infrastructure, automation, security practices and observability.

---

# 1. Why AWS Fargate instead of EC2?

## Decision

The application uses Amazon ECS with AWS Fargate for container deployment.

## Reason

Traditional EC2 deployment requires:

- Managing servers
- Operating system updates
- Security patching
- Capacity planning
- Manual scaling

Fargate provides:

- Serverless container execution
- No server management
- Automatic container placement
- Better isolation
- Easier scaling

The application runs as containers instead of depending on individual servers.

## Trade-off

Fargate costs more per compute unit compared to managing EC2 manually.

For a portfolio project and modern application deployment workflow, the reduction in operational overhead is more valuable.

---

# 2. Why Terraform instead of Manual AWS Setup?

## Decision

All cloud infrastructure is defined using Terraform.

## Reason

Manual AWS Console configuration creates problems:

- Difficult to reproduce
- Easy to make mistakes
- No version history
- Harder to review changes

Terraform provides:

- Infrastructure as Code
- Repeatable environments
- Version controlled infrastructure
- Planned changes before deployment
- Automated provisioning


Example:

```bash
terraform plan
```

shows exactly what infrastructure changes will happen before applying.


## Trade-off

Terraform introduces another tool that requires learning and state management.

The benefit is consistency and automation.

---

# 3. Why GitHub Actions for CI/CD?

## Decision

GitHub Actions is used for continuous integration and deployment.

## CI Pipeline

The CI workflow validates:

- Backend code
- Frontend build
- Docker builds


## CD Pipeline

The deployment workflow:

1. Builds Docker images
2. Scans images
3. Pushes images to Amazon ECR
4. Updates ECS task definition
5. Deploys new containers
6. Verifies application health


## Reason

GitHub Actions was selected because:

- It integrates directly with GitHub
- Workflows live with the source code
- Secrets management is built in
- No additional CI server is required

---

# 4. Why Trivy for Security Scanning?

## Decision

Docker images are scanned using Trivy before deployment.

## Reason

Security scanning happens before images reach production infrastructure.

The pipeline checks for:

- Operating system vulnerabilities
- Dependency vulnerabilities
- Known security issues


The deployment process stops if critical vulnerabilities are detected.

## Benefit

This creates a security gate inside the deployment pipeline.

Instead of discovering vulnerabilities after deployment, they are caught during the build process.

---

# 5. Why MongoDB Atlas?

## Decision

MongoDB Atlas is used as the database service.

## Reason

The application is built using MongoDB and Mongoose.

Using MongoDB Atlas provides:

- Managed database operations
- Automated maintenance
- Secure connection handling
- Easy scalability


The application does not manage database servers directly.

## Trade-off

A self-managed MongoDB cluster would provide more infrastructure control but would require:

- Server management
- Backup configuration
- Maintenance work

Atlas reduces operational complexity.

---

# 6. Why Sidecar Monitoring Pattern?

## Decision

Monitoring uses a sidecar container approach.

## Architecture

The ECS task contains:

```
ECS Task

├── Backend Container
│
├── Frontend Container
│
└── Monitoring Sidecar
```

The monitoring container runs alongside the application containers.

---

## Why?

The sidecar pattern provides:

- Separation of monitoring and application logic
- Independent monitoring components
- Shared network communication
- Easier maintenance


The exporter collects application metrics without modifying the main application runtime.

---

# 7. Why Docker Multi-Stage Builds?

## Decision

Docker images use multi-stage builds.

## Backend

The build process separates:

- Dependency installation
- Production runtime


## Frontend

The frontend:

1. Builds the React application
2. Copies the final static files into Nginx


Benefits:

- Smaller images
- Faster deployments
- Reduced attack surface
- No unnecessary build tools in production

---

# 8. Why Application Load Balancer?

## Decision

Traffic enters through AWS Application Load Balancer.

## Responsibilities

ALB handles:

- HTTPS termination
- Traffic routing
- Health checks
- Container availability


The load balancer checks:

```
GET /api/health
```

before sending traffic to containers.

---

# 9. Why Secure Secret Management?

## Decision

Secrets are never stored inside source code.

Sensitive values are handled through:

Development:

```
.env files
```

CI/CD:

```
GitHub Secrets
```

Runtime:

```
AWS SSM Parameter Store
```

Benefits:

- Prevents accidental exposure
- Centralizes secret handling
- Keeps credentials outside repositories

---

# 10. Deployment Strategy

## Decision

The application uses rolling deployments.

During deployment:

1. New containers start
2. Health checks run
3. Traffic moves to healthy containers
4. Previous containers are replaced


This minimizes downtime during updates.

---

# Summary

HealthMattersHub demonstrates:

✅ Cloud infrastructure design  
✅ Infrastructure as Code  
✅ Container orchestration  
✅ Automated deployment  
✅ Security automation  
✅ Monitoring architecture  
✅ Production-style engineering decisions  


This architecture balances:

- Reliability
- Security
- Maintainability
- Cost awareness