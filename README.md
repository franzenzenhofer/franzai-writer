
# Franz AI Writer

An AI-powered multi-stage document generation platform built with Next.js, Firebase, and Google Genkit.

## Quick Start

```bash
# Install dependencies
npm install --legacy-peer-deps

# Run development server
npm run dev

# Run all quality checks
npm run lint:all
```

## Development Scripts

```bash
npm run dev          # Start Next.js dev server on port 9002
npm run build        # Build for production
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript type checking
npm run lint:unused  # Check for unused code (non-blocking)
npm run lint:all     # Run all quality checks
```

## Code Quality

This project uses automated tools to maintain code quality:

### Unused Code Detection (Knip)
We use [Knip](https://knip.dev) to detect unused files, dependencies, and exports. This runs as a non-blocking check during:
- Local development: `npm run lint:unused`
- Build process: Automatically during `npm run build`
- CI/CD: GitHub Actions on all PRs

**Note**: Unused code warnings are informational only and won't block builds or deployments. Review the ticket at `open-tickets/051-unused-code-analysis-report.md` for current status.

### Running Code Analysis
```bash
# Check for unused code
npm run lint:unused

# Run all checks (lint, typecheck, unused code)
npm run lint:all
```

## Project Structure

- `/src/app` - Next.js App Router pages and API routes
- `/src/components` - React components including UI library
- `/src/workflows` - AI workflow definitions
- `/src/lib` - Utility functions and Firebase integration
- `/open-tickets` - Active development tasks
- `/closed-tickets` - Completed tasks for reference
