# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Franz AI Writer is a Next.js application that provides AI-powered multi-stage document generation workflows. It uses Google Genkit with Gemini 2.0 Flash to process workflow templates and generate content through an interactive wizard interface.

## ABSOLUTE FINAL GOAL

**CRITICAL**: The ultimate goal is to successfully generate and publish a complete FranzAI Writer press release using the press release workflow, with:
- All workflow stages working correctly
- Perfect HTML, clean HTML, and Markdown exports
- Fully functional published URLs that display flawlessly
- This demonstrates the platform's capabilities with real-world content

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

**IMPORTANT**: The poem-generator workflow is our baseline test workflow. All dependency system features should be tested against it first.

### Key Components
- **Wizard Shell** (`src/components/wizard/wizard-shell.tsx`): Main UI for workflow execution
- **AI Stage Execution** (`src/ai/flows/ai-stage-execution.ts`): Core AI processing logic using Genkit
- **Workflow Loader** (`src/lib/workflow-loader.ts`): Dynamic workflow loading system

### Stage Structure Rules
**CRITICAL**: A stage can NEVER be both Human Input AND AI Output at the same time!
- ✅ **Allowed**: AI Output stage followed by Edit capability with AI Redo
- ✅ **Allowed**: Human Input stage followed by Edit capability
- ❌ **FORBIDDEN**: Human Input stage that also generates AI output
- **Exception**: Export stages are special cases and may combine input/output functionality

**Pattern to Follow**:
1. For AI-generated content that needs human review:
   - First stage: AI generation (`inputType: "none"`, `outputType: "json/text/etc"`)
   - Second stage: Human edit form (`inputType: "form"`, `outputType: "json"`)
2. For human input that needs AI processing:
   - First stage: Human input form (`inputType: "form"`, `outputType: "json"`)
   - Second stage: AI processing (`inputType: "none"`, `outputType: "json/text/etc"`)

### Workflow Dependency System
Workflows use a sophisticated dependency system for stage activation and autorun:
- **`dependencies`**: Legacy field (backward compatible) - controls both activation and autorun
- **`activationDependencies`**: When a stage becomes active/enabled for manual processing
- **`autorunDependencies`**: When an active stage automatically runs (if `autoRun: true`)

Example from poem workflow (our BASELINE test workflow - all features must work here):
```json
{
  "id": "generate-html-preview",
  "activationDependencies": ["generate-poem-with-title", "generate-poem-image", "image-briefing"],
  "autorunDependencies": ["generate-poem-with-title", "generate-poem-image"],
  "autoRun": true
}
```
This means HTML preview becomes active when all 3 deps are met, but autoruns when just poem+image are done.

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

**BASELINE WORKFLOW**: The poem workflow (`src/workflows/poem-generator/workflow.json`) is our baseline test workflow demonstrating all features including the dependency system and proper stage separation (input vs output).

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

### Workflow Testing Requirements

**MANDATORY**: Each workflow MUST have ONE comprehensive master test that:
- Tests the COMPLETE workflow from start to finish
- Tests ALL stages and features of the workflow
- Includes a **page reload test** to verify persistence
- Verifies data is preserved after browser refresh
- Tests export functionality if applicable
- Uses Chrome only for performance

### Master Workflow Tests

1. **poem-workflow-comprehensive.spec.ts** - Poem workflow master test
   - Complete workflow: topic → poem → image → HTML → export
   - Multiple image formats and artistic styles
   - Document persistence after reload
   - Export in all formats
   - AI attribution compliance

2. **press-release-workflow.spec.ts** - Press release master test
   - Complete workflow: basic info → tone → research → key facts → contact → final → photo → export
   - File uploads and web search
   - Multiple quotes and international content
   - Persistence after reload
   - Comprehensive export

3. **recipe-workflow-complete.spec.ts** - Recipe workflow master test
   - Complete workflow: dish → ingredients → instructions → details → compilation
   - Complex ingredient parsing
   - Dietary restrictions and substitutions
   - Persistence after reload
   - Recipe export formats

4. **article-workflow.spec.ts** - Article workflow master test
   - Complete workflow with all stages
   - Research integration
   - Persistence after reload
   - Article export

### Additional Test Guidelines
- **Chrome only execution** - All tests must skip non-Chrome browsers
- **No redundant tests** - One comprehensive test per workflow is better than many partial tests
- **Focus on critical paths** - Test what users actually do
- **Always test persistence** - Every master test MUST include reload verification

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
- **One master test per workflow** - Comprehensive end-to-end coverage
- **Utility tests** - Dashboard, auth, admin (focused, specific tests)
- **Export tests** - Comprehensive export functionality coverage
- **Image generation tests** - Critical Imagen 3 integration

### Reload Testing Pattern
Every workflow master test MUST include this pattern:
```typescript
// Complete the workflow
await completeFullWorkflow(page);

// Get current URL or document ID
const currentUrl = page.url();

// Reload the page
await page.reload();
await page.waitForLoadState('networkidle');

// Verify all data persisted
await verifyWorkflowDataPersisted(page);
await verifyExportDataPersisted(page);
```

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

## Development Guidelines - ALWAYS CHECK LOGS AND TAKE SCREENSHOTS

**CRITICAL**: During development and debugging, Claude MUST:

1. **Always take screenshots** using BOTH:
   - Playwright screenshot tools (`mcp__playwright__playwright_screenshot`) for browser-specific content
   - Desktop screenshot via visual feedback MCP (`mcp__visual-desktop-control__vision`) when content should be visible on desktop
2. **Always check logs** (ai.log, nextjs-dev.log) when something doesn't work as expected
3. **State what you see** in the screenshot/logs briefly
4. **State your next step** to provide full context

**IMPORTANT**: Use desktop screenshots to double-check when:
- Playwright might be showing cached/old content
- Errors or popups might be visible on desktop but not captured by Playwright
- You need to see the full desktop context (multiple windows, system dialogs, etc.)
- Browser window might be minimized or hidden

**MANDATORY SCREENSHOT PATTERN**: At least every third screenshot MUST be a desktop screenshot via visual feedback MCP (`mcp__visual-desktop-control__vision`) IF the browser/application we're working on should be visible on the desktop. This ensures you're seeing the actual state of the application, not cached Playwright views, and prevents missing critical errors that Playwright might not capture.

This is MANDATORY for:
- When errors occur (especially red error screens)
- When testing workflows
- When UI behavior seems unexpected
- Before and after making changes
- When autorun or cascade behavior needs verification

**PLAYWRIGHT TESTING REQUIREMENTS**: During all Playwright tests, you MUST:
1. Take regular screenshots (both Playwright and desktop)
2. **CHECK LOGS CONTINUOUSLY** - Monitor ai.log and nextjs-dev.log throughout the test
3. Look for errors, warnings, or unexpected behavior in logs
4. Cross-reference what you see in screenshots with what's happening in logs
5. If logs show errors but screenshots look fine, investigate further - Playwright might be showing cached state

Example workflow:
1. Take Playwright screenshot → "Shows workflow at stage 5"
2. Take desktop screenshot → "Actually see red error overlay on desktop"
3. Check logs → "AI returned nested objects instead of strings"
4. Next step → "I'll fix the prompt to ensure flat string output"
