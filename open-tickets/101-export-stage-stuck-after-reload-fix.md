# Export Stage Stuck After Page Reload - Critical Bug Fix

**Created:** 2025-01-18
**Priority:** Critical (P0)
**Component:** Export Stage, Document Persistence, Wizard Shell
**Type:** Bug Fix
**Status:** Open
**Affects:** All Workflows with Export Stages

## Executive Summary

The export stage gets permanently stuck in "running" status after page reload, preventing users from accessing export functionality and breaking the document workflow. This is a critical persistence and state management bug that affects all export operations across the application.

## Problem Statement

When a user:
1. Clicks the "Export & Publish" button (triggering `status: 'running'`)
2. The page is reloaded (either intentionally or accidentally)
3. The export stage remains stuck in "running" status forever
4. No way to reset or retry the export operation
5. Document becomes unusable for export functionality

From the logs, we can see:
```
"export-publish": {
  "status": "running",
  "staleDismissed": false,
  "isStale": false,
  "shouldAutoRun": false,
  "stageId": "export-publish",
  "isEditingOutput": false,
  "depsAreMet": true
}
```

## Root Cause Analysis - "7 Times Why"

### Why #1: Why does the export stage get stuck in "running" status?
**Answer:** Because the export stage execution is not properly persisted during the running state, and on reload, the system doesn't know how to handle a "running" export stage.

### Why #2: Why is the export stage execution not properly persisted?
**Answer:** Because export stages have asynchronous execution with progress callbacks, but the document persistence system only saves the initial "running" state, not the execution context or ability to resume.

### Why #3: Why doesn't the system handle "running" export stages on reload?
**Answer:** Because the `wizard-shell.tsx` logic only checks for `status === 'idle'` and `shouldAutoRun === true` for automatic execution, but export stages have `autoRun: false` and get stuck in "running" state.

### Why #4: Why don't export stages have proper state recovery mechanisms?
**Answer:** Because the export stage execution flow in `handleRunStage` doesn't implement recovery logic for interrupted executions, unlike regular AI stages.

### Why #5: Why is the export stage different from other stages in persistence?
**Answer:** Because export stages use a completely different execution path (`executeExportStage` vs `runAiStage`) and have special state properties like `generationProgress` that get cleaned during persistence.

### Why #6: Why does the document persistence clean away execution state?
**Answer:** Because the `cleanStageStates` function in `document-persistence.ts` specifically removes `generationProgress` and other transient properties that are needed for export stage recovery.

### Why #7: Why wasn't this caught in testing?
**Answer:** Because the E2E tests don't simulate page reloads during export execution, and the export stage testing focused on successful completion paths rather than interruption scenarios.

## "7 Times How to Fix It"

### How #1: Implement Export Stage Recovery Logic
Add specific logic in `wizard-shell.tsx` to detect and recover stuck export stages:
```typescript
// In evaluateDependenciesLogic or separate recovery function
if (stage.stageType === 'export' && stageState.status === 'running') {
  // Reset to idle if no active execution context
  stageState.status = 'idle';
  stageState.generationProgress = undefined;
}
```

### How #2: Add Export Stage State Validation on Load
Implement validation in document loading to catch and fix invalid export states:
```typescript
// In document-persistence.ts loadDocument
if (stageState.status === 'running' && stage.stageType === 'export') {
  console.log('[Recovery] Resetting stuck export stage:', stageId);
  stageState.status = 'idle';
  stageState.error = undefined;
}
```

### How #3: Implement Export-Specific Auto-Recovery
Add recovery logic specifically for export stages in the wizard shell initialization:
```typescript
// In WizardShell useEffect
useEffect(() => {
  // Recovery logic for stuck export stages
  Object.entries(instance.stageStates).forEach(([stageId, stageState]) => {
    const stage = instance.workflow.stages.find(s => s.id === stageId);
    if (stage?.stageType === 'export' && stageState.status === 'running') {
      console.log('[Recovery] Auto-recovering stuck export stage:', stageId);
      updateStageState(stageId, { 
        status: 'idle', 
        generationProgress: undefined,
        error: undefined 
      });
    }
  });
}, []);
```

### How #4: Add Manual Recovery UI
Add a "Reset Export" button when export stage is stuck:
```typescript
// In ExportStageCard component
{stageState.status === "running" && (
  <Button
    variant="outline"
    onClick={() => onUpdateStageState?.(stage.id, { 
      status: 'idle', 
      generationProgress: undefined 
    })}
  >
    Reset Export
  </Button>
)}
```

### How #5: Implement Export State Timeout
Add automatic timeout for export stages to prevent permanent stuck state:
```typescript
// In handleRunStage for export stages
const exportTimeout = setTimeout(() => {
  updateStageState(stageId, {
    status: 'error',
    error: 'Export timed out. Please try again.'
  });
}, 300000); // 5 minutes timeout
```

### How #6: Preserve Export Context for Recovery
Modify document persistence to save export recovery context:
```typescript
// In cleanStageStates - special handling for export stages
if (stage.stageType === 'export' && state.status === 'running') {
  // Save minimal recovery context
  cleaned.exportRecoveryContext = {
    startedAt: new Date().toISOString(),
    canRecover: true
  };
}
```

### How #7: Add Export Stage Health Checks
Implement periodic health checks for running export stages:
```typescript
// In WizardShell
useEffect(() => {
  const healthCheck = setInterval(() => {
    Object.entries(instance.stageStates).forEach(([stageId, state]) => {
      if (state.status === 'running' && stage?.stageType === 'export') {
        // Check if export has been running too long without progress
        const runningTime = Date.now() - new Date(state.startedAt || 0).getTime();
        if (runningTime > 300000) { // 5 minutes
          updateStageState(stageId, { 
            status: 'error', 
            error: 'Export timed out. Please try again.' 
          });
        }
      }
    });
  }, 30000); // Check every 30 seconds

  return () => clearInterval(healthCheck);
}, [instance.stageStates]);
```

## "7 Times Challenges"

### Challenge #1: State Consistency
**Problem:** Export stages have complex state transitions that need to remain consistent across persistence and recovery.
**Mitigation:** Implement comprehensive state validation and recovery logic with extensive logging.

### Challenge #2: User Experience Impact
**Problem:** Users might lose work or get confused by automatic state resets.
**Mitigation:** Add clear messaging and confirmation dialogs for recovery operations.

### Challenge #3: Race Conditions
**Problem:** Multiple recovery mechanisms might conflict with each other.
**Mitigation:** Implement centralized recovery coordinator with mutex-like controls.

### Challenge #4: Export Progress Loss
**Problem:** Users lose export progress when state is reset.
**Mitigation:** Cache export results and implement resume functionality where possible.

### Challenge #5: Testing Complexity
**Problem:** Testing all edge cases of export stage recovery is complex.
**Mitigation:** Add comprehensive E2E tests covering reload scenarios and edge cases.

### Challenge #6: Backward Compatibility
**Problem:** Changes to export stage behavior might affect existing documents.
**Mitigation:** Implement graceful migration and fallback mechanisms for existing stuck stages.

### Challenge #7: Performance Impact
**Problem:** Recovery mechanisms and health checks might impact application performance.
**Mitigation:** Optimize recovery logic and implement efficient state checking algorithms.

## Perfect Solution Architecture

### Phase 1: Immediate Fix (Hot Fix)
1. **Export Stage Recovery on Load**
   - Add recovery logic in `WizardShell` initialization
   - Reset any export stages stuck in "running" status to "idle"
   - Add logging for recovery operations

2. **Manual Recovery UI**
   - Add "Reset Export" button in `ExportStageCard` for stuck stages
   - Clear visual indication when export stage needs recovery

### Phase 2: Robust Recovery System
1. **State Validation Pipeline**
   - Implement comprehensive export stage state validation
   - Add recovery context preservation in document persistence
   - Create export stage health monitoring

2. **Smart Recovery Logic**
   - Implement timeout-based recovery
   - Add progress-aware recovery (resume vs restart)
   - Create user-friendly recovery notifications

### Phase 3: Prevention & Monitoring
1. **Export Stage Reliability**
   - Add comprehensive E2E tests for reload scenarios
   - Implement export stage execution monitoring
   - Add analytics for export stage failure patterns

2. **Enhanced User Experience**
   - Add export progress persistence
   - Implement partial result caching
   - Create export stage status dashboard

## Implementation Priority

### P0 (Immediate - This Week)
- [ ] Add export stage recovery logic in `WizardShell`
- [ ] Implement manual reset button in `ExportStageCard`
- [ ] Add state validation in document loading

### P1 (Critical - Next Week)
- [ ] Implement export timeout mechanisms
- [ ] Add comprehensive logging and monitoring
- [ ] Create E2E tests for reload scenarios

### P2 (Important - Following Sprint)
- [ ] Implement export progress persistence
- [ ] Add export stage health monitoring
- [ ] Create user-friendly recovery UX

## Acceptance Criteria

### Must Have
- ✅ Export stages never get permanently stuck in "running" status
- ✅ Page reload during export operation doesn't break functionality
- ✅ Users can manually reset stuck export stages
- ✅ Clear feedback when export recovery happens

### Should Have
- ✅ Export stages automatically recover on page load
- ✅ Export timeout prevents indefinite running state
- ✅ Comprehensive logging for debugging

### Could Have
- ✅ Export progress preservation across reloads
- ✅ Smart recovery with partial results
- ✅ Export stage health dashboard

## Testing Requirements

1. **Unit Tests**
   - Export stage state transitions
   - Recovery logic validation
   - Timeout mechanism testing

2. **Integration Tests**
   - Document persistence with stuck export stages
   - Recovery UI functionality
   - State validation pipeline

3. **E2E Tests**
   - Export stage execution with page reload
   - Recovery from stuck state
   - User workflow completion after recovery

## Success Metrics

- **Zero stuck export stages** after implementation
- **100% export stage recovery rate** on page reload
- **<1 second recovery time** for stuck stages
- **Zero user-reported export stage issues** after deployment

## Final Notes

This bug represents a critical failure in the export stage lifecycle management. The fix requires careful coordination between state management, document persistence, and user interface layers. The solution must be both robust (handling all edge cases) and user-friendly (clear feedback and recovery options).

The export stage is the culmination of user workflows - getting stuck here breaks the entire user experience and undermines confidence in the platform. This fix is essential for production stability and user satisfaction.

**Priority:** This must be fixed before any new export features are developed, as it affects the core reliability of the export system.

## DRY & KISS Improvement Proposal

The above plan is intentionally exhaustive, but it introduces overlapping recovery logic in multiple layers (wizard shell, document loader, persistence cleaner, UI). To honour **DRY** and **KISS** principles, we can consolidate recovery into a *single* deterministic pathway and remove redundant mechanisms.

### Single-Entry Recovery Strategy

1. **Canonical Recovery Function** – `resetStuckExportStages(stageStates, workflow)`
   - Pure utility (no side-effects) located in `lib/export-stage-recovery.ts`.
   - Accepts stageStates + workflow, returns a *new* stageStates object with any `export` stages in `running` state reset to `idle`.
   - This keeps recovery logic in one place, making it easier to maintain and test.

2. **Invoke Once, Early**
   - Call the function **once** immediately after loading stageStates from persistence **and** once right before saving.
   - This guarantees documents never persist an invalid `running` export state and the UI never renders one.

```ts
// Example usage in document-persistence.ts (loadDocument & saveDocument)
import { resetStuckExportStages } from '@/lib/export-stage-recovery';

const cleanedStageStates = resetStuckExportStages(rawStageStates, workflow);
```

3. **UI Simplicity**
   - Because recovery happens before the UI sees the data, `ExportStageCard` never needs a special "Reset" button.
   - The stage simply shows the regular **idle** interface if it was stuck, keeping the component lean.

4. **Timeout Eliminated**
   - By removing the possibility of persisting a `running` export state, a timeout watchdog becomes unnecessary.

5. **Progress Persistence (Optional, Still Simple)**
   - If we later want to resume progress, store a minimal `exportRecoveryContext` (e.g.
     `{ executing: true, startedAt }`). Recovery can choose to *resume* instead of *restart* based on this flag – still handled by the same utility.

### Net Result

• **Zero duplication** – recovery code lives in one utility.<br/>
• **Predictable state** – the app never renders an impossible `running` export after reload.<br/>
• **Smaller surface area** – no extra hooks, health checks, or UI controls.<br/>
• **Easier tests** – unit-test the utility once, integration-test load/save flow once.

> "If you have to debug the same bug in three places, you designed it twice." – Unknown

Adopting this streamlined approach still satisfies all acceptance criteria while cutting ~70 % of new code and cognitive overhead. 

## Implementation TODO / Task List (Code-Level)

> The following tasks reference *actual file paths* in the repository and include skeleton code where relevant.  PRs should keep commits small and atomic.

### 1. Core Recovery Utility

- [ ] **Create** `src/lib/export-stage-recovery.ts`
  ```ts
  // src/lib/export-stage-recovery.ts
  import type { StageState, Workflow } from '@/types';

  /**
   * Reset any export stages stuck in "running" to "idle".
   * Returns a *new* shallow-cloned stageStates object (immutable-friendly).
   */
  export function resetStuckExportStages(
    stageStates: Record<string, StageState>,
    workflow: Workflow
  ): Record<string, StageState> {
    const result: Record<string, StageState> = { ...stageStates };
    workflow.stages.forEach((stage) => {
      if (stage.stageType === 'export') {
        const state = result[stage.id];
        if (state?.status === 'running') {
          result[stage.id] = {
            ...state,
            status: 'idle',
            generationProgress: undefined,
            error: undefined,
          };
          console.warn('[ExportRecovery] Reset stuck export stage', stage.id);
        }
      }
    });
    return result;
  }
  ```

### 2. Integrate Recovery **on Load**

- [ ] **Edit** `src/lib/document-persistence.ts`
  - At the top, add:
    ```ts
    import { resetStuckExportStages } from '@/lib/export-stage-recovery';
    ```
  - Inside `loadDocument` **after** stageStates are fetched but **before** returning success:
    ```ts
    const safeStageStates = resetStuckExportStages(stageStates, document.workflow);
    return {
      success: true,
      document,
      stageStates: safeStageStates,
    };
    ```
    > ⚠️ `document.workflow` is not currently available here – fetch workflow via `getWorkflowById(document.workflowId)` or pass from caller.

### 3. Integrate Recovery **on Save**

- [ ] In the same file, inside `saveDocument` **before** calling `cleanStageStates`:
    ```ts
    stageStates = resetStuckExportStages(stageStates, workflow);
    ```
    - `workflow` can be passed in by adding a simple helper to retrieve it once at function start.

### 4. Wire Workflow Lookup Helper

- [ ] **Add** helper `getWorkflowById` to `src/workflows/index.ts` if not already exported.
- [ ] Import it in `document-persistence.ts` to resolve workflow meta without circular import.

### 5. Unit Tests

- [ ] **Create** `tests/unit/export-stage-recovery.spec.ts`
  ```ts
  import { resetStuckExportStages } from '@/lib/export-stage-recovery';

  test('resets running export stage to idle', () => {
    const stageStates = { 'export-publish': { stageId: 'export-publish', status: 'running' } } as any;
    const workflow = { id: 'test', stages: [{ id: 'export-publish', stageType: 'export' }] } as any;
    const result = resetStuckExportStages(stageStates, workflow);
    expect(result['export-publish'].status).toBe('idle');
  });
  ```

### 6. Integration Test (E2E)

- [ ] Update `tests/e2e/export-stage-comprehensive.spec.ts`
  - Add step: trigger export, reload page immediately, expect stage to show **idle** (not stuck).

### 7. Documentation

- [ ] Update `docs/blueprint.md` recovery section.
- [ ] Changelog entry: "fix: export stage no longer stuck after reload (Ticket #101)".

### 8. Cleanup (Optional)

- [ ] Remove any existing timeout/watchdog code related to export stage recovery once utility is verified.

---

**Definition of Done**: All checkboxes above are complete, CI tests pass, and manual QA verifies export stage behaves correctly across reloads in all supported workflows. 