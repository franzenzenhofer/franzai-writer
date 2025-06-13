# Root Cause Analysis: Wizard Page Compilation Hang

## Problem Statement
The wizard page at `/w/poem/tADbgd83bSCAw1JqnQRL` gets stuck during compilation after migrating from Genkit to @google/genai SDK. Even a minimal test page doesn't compile.

## 7 Whys Analysis

### Why #1: Why is the page stuck compiling?
**Answer**: The Next.js development server is hanging during the module bundling/compilation phase.
**Evidence**: 
- No response from curl with timeout
- No error messages in logs
- Server shows "compiling" but never completes

### Why #2: Why is the Next.js dev server hanging during compilation?
**Answer**: There's likely a module resolution issue that causes Webpack to enter an infinite loop or deadlock.
**Evidence**:
- This started after the SDK migration
- Even minimal pages are affected
- No TypeScript or ESLint errors

### Why #3: Why would module resolution cause an infinite loop?
**Answer**: Most commonly due to circular dependencies where Module A imports Module B, and Module B imports Module A (directly or indirectly).
**Possible scenarios**:
1. `aiActions-new.ts` -> `ai-stage-execution-new.ts` -> `@/lib/google-genai` -> (back to something)
2. Server-side code importing client-side code that imports server-side code
3. Dynamic imports creating resolution loops

### Why #4: Why would the SDK migration introduce circular dependencies?
**Answer**: The new module structure might have different import patterns than Genkit.
**Key changes**:
- New file: `aiActions-new.ts` (server action)
- New file: `ai-stage-execution-new.ts` 
- New directory: `src/lib/google-genai/` with multiple modules
- These new files might be importing each other in ways Genkit didn't

### Why #5: Why don't we see error messages for circular dependencies?
**Answer**: Webpack's module resolution can hang indefinitely on certain types of circular dependencies without throwing errors.
**Explanation**: 
- Static analysis tools (TypeScript, ESLint) don't catch runtime circular dependencies
- Webpack tries to resolve the dependency graph but gets stuck in a loop
- The process doesn't crash, it just hangs

### Why #6: Why does even a minimal test page hang?
**Answer**: This suggests the issue is triggered at the application initialization level, not page-specific.
**Possibilities**:
1. A root-level import in `_app.tsx` or `layout.tsx`
2. A provider or context that's imported globally
3. A server component importing client code at the module level
4. An import in `next.config.ts` or other config files

### Why #7: Why did this work before the migration but not after?
**Answer**: The Genkit architecture likely had better separation between server and client code, or used different import patterns that avoided cycles.
**Genkit patterns**:
- Used dependency injection
- Had clear flow definitions
- Separated AI logic from UI components
**New SDK patterns**:
- Direct imports of modules
- Might be mixing server/client boundaries
- Could have initialization code that runs at import time

## Most Likely Root Causes

Based on this analysis, the most probable causes are:

1. **Circular Import Chain**: 
   - `wizard-shell.tsx` imports `aiActions-new.ts`
   - `aiActions-new.ts` imports `ai-stage-execution-new.ts`
   - `ai-stage-execution-new.ts` imports `@/lib/google-genai`
   - Something in `@/lib/google-genai` might import back up the chain

2. **Server/Client Boundary Violation**:
   - Client component importing server-only code
   - Server action importing client-only code
   - Initialization code running in wrong context

3. **Module-Level Side Effects**:
   - Code executing during import (not inside functions)
   - Dynamic imports at module level
   - Singleton initialization causing issues

## Next Steps

1. Check if the dev server starts fresh without accessing any pages
2. Examine the import chain starting from the wizard components
3. Look for any module-level code execution in the new SDK files
4. Check for server/client boundary violations
5. Create a dependency graph to visualize potential cycles