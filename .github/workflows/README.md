# GitHub Actions Workflows

This directory contains automated workflows that run on GitHub Actions.

## Active Workflows

### 🔧 CI/CD Pipeline (`ci.yml`)
- **Triggers**: Push to main, Pull requests
- **Jobs**:
  - Lint & TypeScript checks
  - Build verification
  - Playwright E2E tests
  - Firebase preview deployments (PRs)
  - Production deployment (main branch)

### 🔒 Security Checks (`security.yml`)
- **Triggers**: Push, PRs, Weekly schedule
- **Jobs**:
  - Dependency vulnerability scanning
  - CodeQL security analysis
  - npm audit checks

### ⚡ Performance Monitoring (`performance.yml`)
- **Triggers**: Push to main, Pull requests
- **Jobs**:
  - Lighthouse CI performance tests
  - Bundle size analysis

### 🤖 PR Automation (`pr-automation.yml`)
- **Triggers**: PR events
- **Features**:
  - Auto-labeling based on changed files
  - Size labels (XS/S/M/L/XL)
  - Auto-assign reviewers

## Required Secrets

Add these in your GitHub repository settings under Settings → Secrets:

- `FIREBASE_PROJECT_ID`: Your Firebase project ID
- `FIREBASE_TOKEN`: Firebase CI token (get with `firebase login:ci`)
- `FIREBASE_CONFIG`: Your Firebase configuration JSON (optional)

## Status Badges

Add these to your README.md:

```markdown
![CI/CD](https://github.com/[YOUR-USERNAME]/franzai-writer/workflows/CI%2FCD%20Pipeline/badge.svg)
![Security](https://github.com/[YOUR-USERNAME]/franzai-writer/workflows/Security%20Checks/badge.svg)
![Performance](https://github.com/[YOUR-USERNAME]/franzai-writer/workflows/Performance%20Monitoring/badge.svg)
```

## Local Testing

Test workflows locally with [act](https://github.com/nektos/act):

```bash
# Test CI workflow
act -W .github/workflows/ci.yml

# Test with secrets
act -W .github/workflows/ci.yml -s FIREBASE_TOKEN=your-token
```