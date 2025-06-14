# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Franz AI Writer is a Next.js application that provides AI-powered multi-stage document generation workflows. It uses Google Genkit with Gemini 2.0 Flash to process workflow templates and generate content through an interactive wizard interface.

## Common Development Commands

```bash
# Development
npm run dev          # Start Next.js dev server on port 9002 with Turbopack
npm run genkit:dev   # Start Genkit dev server for AI development
npm run genkit:watch # Start Genkit with file watching

# Production
npm run build        # Build Next.js application
npm run start        # Start production server

# Code Quality
npm run lint         # Run Next.js linter
npm run typecheck    # Run TypeScript type checking

# Firebase CLI (preferred for Firebase operations)
firebase login       # Authenticate with Firebase
firebase init        # Initialize Firebase services
firebase deploy      # Deploy to Firebase App Hosting
firebase emulators:start # Start local Firebase emulators
firebase firestore:indexes:deploy # Deploy Firestore indexes
```

## Architecture Overview

### AI Workflow System
The core feature is a JSON-based workflow system where each workflow:
- Lives in `src/workflows/[workflow-name]/workflow.json`
- Contains multiple stages with prompts in `prompts/` subdirectory
- Each stage can specify its own AI model, temperature, and input/output types
- Stages can depend on other stages and auto-run based on dependencies

### Key Components
- **Wizard Shell** (`src/components/wizard/wizard-shell.tsx`): Main UI for workflow execution
- **AI Stage Execution** (`src/ai/flows/ai-stage-execution.ts`): Core AI processing logic using Genkit
- **Workflow Loader** (`src/lib/workflow-loader.ts`): Dynamic workflow loading system

### Frontend Stack
- Next.js 15 with App Router
- TypeScript with path alias `@/*` for src imports
- Tailwind CSS with shadcn/ui components (Radix UI primitives)
- React Hook Form for form handling
- React Dropzone for file uploads

### AI Integration
- Google Genkit framework for AI orchestration
- Primary model: `googleai/gemini-2.0-flash-exp`
- Supports multiple input types: textarea, form, context, none
- Output formats: text, json, markdown

**CRITICAL**: Always use `@google/genai` package, NEVER use `@google/generative-ai`
**IMPORTANT**: Always consult the official Gemini docs at https://ai.google.dev/gemini-api/docs/ for the latest API usage

## Firebase Ecosystem Guidelines

- **Stay within Firebase ecosystem**: Use Firebase services for all backend needs (Firestore, Auth, Storage, Functions)
- **Use Firebase CLI**: Prefer Firebase CLI commands over other deployment methods
- **Firebase Local Development**: Use Firebase emulators for local development to match production environment
- **Authentication**: Use Firebase Auth for all authentication needs
- **Database**: Use Firestore for all data storage requirements
- **File Storage**: Use Firebase Storage for file uploads and media storage
- **Deployment**: Deploy through Firebase App Hosting (configured in `apphosting.yaml`)

## Development Notes

- Firebase App Hosting deployment configured in `apphosting.yaml`
- TypeScript and ESLint errors are ignored during build (see `next.config.ts`)
- The project uses a blue-based design system with Space Grotesk for headlines

## Ticket Management System

This project uses a simple file-based ticket system for tracking tasks and issues:

- **open-tickets/**: Contains all active tickets and TODOs
- **closed-tickets/**: Contains completed tickets (moved from open-tickets when done)

### Ticket Format
Each ticket is a markdown file with:
- Unique ID prefix (e.g., 001-, 002-)
- Descriptive filename
- Standard headers: Created date, Priority, Component, Description, Tasks, Acceptance Criteria

### Working with Tickets
1. Check `open-tickets/` directory for current tasks
2. When starting work on a ticket, update its task checklist
3. When completing a ticket, move it to `closed-tickets/`
4. Create new tickets for discovered issues or requested features

### Current Priority
The highest priority ticket should be at the top of the numerical order in open-tickets/

## Git Workflow - Atomic Commits

**IMPORTANT**: Make atomic commits after every small to medium change:
- Commit after implementing each feature or fixing each bug
- Use descriptive commit messages
- Push to GitHub regularly
- Never batch multiple unrelated changes in one commit
- Commit frequently to maintain a clear history