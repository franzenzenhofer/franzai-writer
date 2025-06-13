# Systematic Debug Plan for Wizard Page Compilation Hang

## Current State
- URL: http://localhost:9002/w/poem/tADbgd83bSCAw1JqnQRL
- Symptom: Page stuck compiling, no error messages
- Last change: Migration from Genkit to @google/genai SDK

## Debugging Strategy

### Phase 1: Create Isolated Test Environment
1. Create `/test-wizard/page.tsx` - exact copy of the problematic page
2. Verify the test page also hangs (confirm issue is reproducible)
3. Create a minimal version that just returns "Hello World"
4. Verify minimal version works

### Phase 2: Binary Search for Problematic Import
Starting from the minimal working version, add back one import at a time:

1. **Test 1**: Add only the type imports
   ```typescript
   import type { WizardDocument, WizardInstance, StageState, Workflow } from '@/types';
   ```

2. **Test 2**: Add workflow loader
   ```typescript
   import { getWorkflowByShortName } from '@/lib/workflow-loader';
   ```

3. **Test 3**: Add document persistence
   ```typescript
   import { documentPersistence } from '@/lib/document-persistence';
   ```

4. **Test 4**: Add WizardPageContent
   ```typescript
   import WizardPageContent from './wizard-page-content';
   ```

### Phase 3: Deep Dive into WizardPageContent
If Phase 2 identifies WizardPageContent as the issue:

1. Create a minimal WizardPageContent that just returns a div
2. Add back imports one by one:
   - AuthGuard
   - useAuth hook
   - WizardShell
   - ErrorBoundary

### Phase 4: Trace WizardShell Dependencies
If WizardShell is the issue:

1. Check what WizardShell imports
2. Specifically check: `import { runAiStage } from '@/app/actions/aiActions-new';`
3. Create dependency graph of aiActions-new -> ai-stage-execution-new -> google-genai

### Phase 5: Check for Circular Dependencies
1. Map out the full import chain
2. Look for any module that imports from a module that imports from it
3. Check for server/client boundary violations

### Phase 6: Validate Findings
1. Once problematic import is found, understand WHY it causes hanging
2. Check if it's:
   - Circular dependency
   - Server code in client component
   - Dynamic import issue
   - Module resolution problem

### Phase 7: Implement Fix
Based on findings, implement proper solution (not a workaround)

## Documentation Template for Each Test

```
Test #: [number]
File: [file being tested]
Added: [what was added]
Result: [compiles/hangs]
Time to hang: [immediate/after X seconds]
Console output: [any messages]
Network tab: [any requests]
```