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
- **MIGRATION IN PROGRESS**: Moving from Google Genkit to native @google/genai SDK (branch: `backup/genkit-to-genai-attempt-1`)
- Primary model: `gemini-2.0-flash` (with support for all Gemini models)
- Enhanced features:
  - Google Search grounding
  - URL Context grounding
  - Thinking mode (Gemini 2.5)
  - Enhanced AI logging at `logs/ai.log`
- Supports multiple input types: textarea, form, context, none
- Output formats: text, json, markdown

**CRITICAL**: Always use `@google/genai` package, NEVER use `@google/generative-ai`
**IMPORTANT**: Always consult the official Gemini docs at https://ai.google.dev/gemini-api/docs/ for the latest API usage

## Error Handling Policy - FAIL FAST!

**CRITICAL**: NO FALLBACKS, NO MOCK DATA, NO DEFENSIVE CODING!
- If an AI request fails, we FAIL EARLY, we FAIL LOUD, we FAIL HARD!
- Never use mock data or fallback responses when AI fails
- NO FALLBACK LOGIC - if something fails, let it fail completely
- NO DEFENSIVE CODING - don't try to handle every edge case
- Always propagate errors to the user with clear error messages
- Log ALL errors with full stack traces
- This applies EVERYWHERE in the codebase
- If Firebase Storage fails, FIX IT, don't fall back to data URLs
- If an API fails, FIX IT, don't add retry logic

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

## Testing Guidelines

**CRITICAL**: All Playwright tests MUST be run in headless mode to avoid interfering with development work.

**CRITICAL**: All UI interactions MUST use specific element IDs instead of generic selectors:
- Use `#process-stage-{stage-id}` for stage action buttons (e.g., `#process-stage-poem-topic`, `#process-stage-image-briefing`)
- Use `[data-testid="stage-card-{stage-id}"]` for stage cards
- NEVER use generic selectors like `button:has-text("Continue")` or `button:has-text("Continue").nth(1)`
- For form controls (Radix UI/shadcn components), use specific approaches for dropdowns and selects
- This ensures tests click the correct buttons and don't fail due to multiple matches

**MAIN TEST**: Use `tests/e2e/export-simple-test.spec.ts` as the primary test for the poem workflow. This test verifies:
- Complete workflow execution from poem topic to export
- Export stage functionality and completion
- Live Preview generation
- Publishing functionality with HTML formats
- Export persistence across page reloads
- Uses robust selectors that actually work

## Image Generation Implementation Status

✅ **COMPLETED**: Image generation with Google Imagen 3 is fully working
- Successfully integrated Imagen 3 API (models/imagen-3.0-generate-002)
- Supports all standard aspect ratios: 1:1, 3:4, 4:3, 16:9, 9:16
- Custom image briefing stage for user control over generated images
- Multiple image generation and selection interface
- Proper error handling and logging
- Template variable resolution for dynamic prompts

✅ **VERIFIED**: Core functionality tested and working in poem generation workflow
- Poem topic → poem generation → image briefing → image generation → HTML export
- AI logs confirm successful Imagen API calls and image generation
- Basic Playwright tests demonstrate end-to-end workflow functionality

## E2E Testing Guidelines

**CRITICAL**: All Playwright tests MUST follow these strict guidelines to maintain performance and reliability.

### Test File Constraints
- **Maximum 5 tests per file** - Never exceed this limit
  - **EXCEPTION**: `poem-workflow-comprehensive.spec.ts` is our SUPER POWERFUL test and is exempt from this limit
- **Chrome only execution** - All tests must include browser restriction
- **Focused and essential tests only** - No debug, redundant, or development tests

### Special Tests
- **poem-workflow-comprehensive.spec.ts** - Our most powerful test that exercises ALL features
  - Tests complete workflow with all stages
  - Tests error recovery and edge cases
  - Tests concurrent workflows
  - Tests all image formats and export options
  - Tests AI attribution compliance
  - This test MUST remain comprehensive and powerful!

### Chrome-Only Requirement
Add this to every test file's describe block:
```typescript
test.describe('Test Suite Name (Chrome Only)', () => {
  test.skip(({ browserName }) => browserName !== 'chromium', 'Chrome only per CLAUDE.md guidelines');
  // ... tests
});
```

### Specific Element Selectors
- Use `#process-stage-{stage-id}` for stage action buttons
- Use `[data-testid="stage-card-{stage-id}"]` for stage cards  
- **NEVER** use generic selectors like `button:has-text("Continue")`
- For shadcn/ui components, use specific data-testid approaches

### Test Organization
- **Core workflows**: poem, press-release, recipe, article (1 file each)
- **Export functionality**: comprehensive export testing (1-2 files max)
- **Utility functions**: auth, dashboard, admin (1 file each)
- **No cross-browser testing** - Chrome coverage is sufficient

### Performance Impact
- Reduced from 49 → 17 test files (65% reduction)
- Each test runs only on Chrome to save execution time
- Essential test coverage maintained while eliminating redundancy

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

## Git Branches - MANDATORY for Parallel Development



### Why This Is Required
Multiple Claude sessions may be working on different features simultaneously. 

### Branches Requirements

1. **BEFORE starting a big task**: 
   - Create a new branc
   - Claude MUST create a task list using TodoWrite tool
   
2. **DURING development**: 
   - Work in the isolated worktree
   - Track progress using the todo list
   
3. **AFTER task completion**: 
   - When ALL todos are marked as completed
   - IMMEDIATELY merge the branch, do not delete it.
   - This is MANDATORY - 



**Claude MUST:**
1. Always create a todo list at the start of new branch
2. Track progress by updating todo statuses
3. Initiate cleanup immediately when all todos are completed



## Task Management with TodoWrite/TodoRead

**MANDATORY**: Claude MUST use the TodoWrite tool to create and manage task lists for every significant piece of work.

### When to Use TodoWrite
- ALWAYS at the start of a new worktree
- For any task requiring multiple steps
- When working on features, bug fixes, or refactoring
- To track progress and ensure nothing is missed

### Task List Lifecycle

1. **Start of Work**: Create comprehensive todo list
   ```
   TodoWrite with items like:

   - Implement feature X
   - Add tests for feature X
   - Update documentation
   - Run linting and type checks

   ```

2. **During Work**: Update statuses
   - Mark items as "in_progress" when starting
   - Mark as "completed" when done
   - Add new todos if discovering additional work

3. **Completion Trigger**: When ALL todos are "completed"
   - This triggers the MANDATORY branch review
   - No exceptions - completed todos = cleanup time
