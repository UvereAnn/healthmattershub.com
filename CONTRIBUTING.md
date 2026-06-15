# Contributing to HealthMattersHub

## Branch Strategy
We follow a streamlined branching model consisting of a single permanent branch (`main`) and short-lived feature or fix branches.

### Permanent Branch
* **main** — Production-ready code. Protected. Never push directly to this branch.

### Short-lived Branches
Created directly from `main` and merged back into `main` exclusively via Pull Request:
* `feature/*` — New features (e.g., `feature/user-profile`)
* `bugfix/*`  — Bug fixes (e.g., `bugfix/login-error`)
* `devops/*`  — Infrastructure, Docker, and CI/CD changes (e.g., `devops/add-prometheus`)
* `hotfix/*`  — Urgent production fixes (e.g., `hotfix/fix-auth-token`)

---

## Commit Message Format
We follow Conventional Commits: https://www.conventionalcommits.org
Format: `type: short description in present tense`

### Core Types
* `feat`: A new feature
* `fix`: A bug fix
* `chore`: Configuration updates, dependencies, tooling
* `docs`: Documentation updates only
* `devops`: Infrastructure, Docker, or CI/CD pipelines
* `refactor`: Code restructure without changing behavior

### Examples
```bash
feat: add nested comment replies
fix: resolve JWT token not clearing on logout
chore: update mongoose to v8.1.0
devops: add Prometheus metrics exporter service
