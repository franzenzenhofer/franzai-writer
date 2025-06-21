# Ticket #114: Fix Export Stage Phantom "Update Recommended" Bug

## Priority: High

## Type: Critical Bug Fix

## Description
**CRITICAL BUG**: After page reload, export stages that were never executed incorrectly show an "Update recommended" button and appear empty, even though their dependencies are met. This creates a confusing UX where users see a stale warning for content that was never generated.

## Bug Reproduction Steps
1. Complete a poem workflow up to the point where export stage dependencies are met
2. **Do NOT trigger the export stage** - leave it untouched
3. Reload the page
4. **BUG**: Export stage shows "Update recommended" button despite never being executed
5. **BUG**: Export stage appears empty but shows stale state

## Root Cause Analysis

### Expected State After Reload
```typescript
{
  stageId: 'export-publish',
  status: 'idle',           // ✅ Never executed
  isStale: false,          // ✅ Cannot be stale if never completed
  staleDismissed: false,   // ✅ No warning to dismiss
  output: undefined,       // ✅ No output because never executed
  completedAt: undefined   // ✅ Never completed
}
```

### Actual Buggy State After Reload
```typescript
{
  stageId: 'export-publish',
  status: 'completed',     // ❌ WRONG - Never executed!
  isStale: true,          // ❌ WRONG - Cannot be stale if never completed!
  staleDismissed: false,  // ❌ Shows stale warning incorrectly
  output: undefined,      // ❌ INCONSISTENT - Completed but no output
  completedAt: undefined  // ❌ INCONSISTENT - Completed but no timestamp
}
```

## Technical Root Causes

### 1. **Invalid State Combination**
The system allows an invalid state where:
- `status === 'completed'` 
- `output === undefined`
- `completedAt === undefined`

This should **NEVER** happen. A completed stage must have output and timestamp.

### 2. **Staleness Logic Bug**
**Location**: `src/components/wizard/wizard-shell.tsx` lines 347-373

The staleness detection runs on stages with `status === 'completed'`, but there's a bug where export stages get marked as completed when they shouldn't be.

### 3. **State Initialization Bug**
**Location**: Document loading logic in page.tsx

During page reload, stage states might be incorrectly merged or initialized, causing never-executed stages to appear completed.

### 4. **Export Stage Recovery Bug**
**Location**: `src/lib/export-stage-recovery.ts`

The recovery logic might be setting incorrect states during reload.

## Required Fixes

### Fix 1: Add State Validation
**File**: `src/lib/workflow-utils.ts`

Add validation to prevent invalid state combinations:

```typescript
function validateStageState(stageState: StageState): StageState {
  // CRITICAL: Completed stages MUST have output and timestamp
  if (stageState.status === 'completed') {
    if (!stageState.output || !stageState.completedAt) {
      console.warn('[StateValidation] Fixing invalid completed stage without output:', stageState.stageId);
      return {
        ...stageState,
        status: 'idle',
        isStale: false,
        staleDismissed: false,
        output: undefined,
        completedAt: undefined
      };
    }
  }
  
  // CRITICAL: Idle stages cannot be stale
  if (stageState.status === 'idle' && stageState.isStale) {
    console.warn('[StateValidation] Fixing idle stage marked as stale:', stageState.stageId);
    return {
      ...stageState,
      isStale: false,
      staleDismissed: false
    };
  }
  
  return stageState;
}
```

### Fix 2: Update Staleness Logic
**File**: `src/components/wizard/wizard-shell.tsx` lines 347-373

Add additional safety checks:

```typescript
let isStale = false;
if (currentState.status === 'completed' && currentState.output && currentState.completedAt) {
  // ONLY check staleness for truly completed stages
  const stageCompletedAt = new Date(currentState.completedAt).getTime();
  
  // ... existing staleness logic
}
```

### Fix 3: Fix State Loading
**File**: `src/app/w/[shortName]/[documentId]/page.tsx` lines 130-140

Add validation during state merging:

```typescript
// Only merge stage states that passed validation AND are in valid state
validation.validIds.forEach(stageId => {
  if (loadResult.stageStates) {
    const loadedState = loadResult.stageStates[stageId];
    mergedStageStates[stageId] = validateStageState(loadedState);
  }
});
```

### Fix 4: Update Export Recovery Logic
**File**: `src/lib/export-stage-recovery.ts`

Ensure export stages are properly reset to idle:

```typescript
if (stage.stageType === 'export') {
  // Export stages: Always reset to clean idle state
  result[stage.id] = {
    ...state,
    status: 'idle',
    isStale: false,
    staleDismissed: false,
    output: undefined,
    completedAt: undefined,
    generationProgress: undefined,
    error: undefined,
  };
}
```

## Validation Requirements

### 1. **State Consistency Rules**
- `status === 'completed'` ↔ `output !== undefined && completedAt !== undefined`
- `status === 'idle'` ↔ `isStale === false`
- `status !== 'completed'` ↔ `isStale === false`

### 2. **Export Stage Rules** 
- Export stages start as `idle` with no output
- Only become `completed` after successful execution
- Never show "Update recommended" unless actually completed and dependencies changed

### 3. **Reload Behavior**
- Never-executed stages remain `idle` after reload
- Only truly completed stages can be marked as stale
- Invalid state combinations are automatically corrected

## Testing Requirements

### 1. **E2E Test**: Never-Executed Export Stage
```typescript
test('never-executed export stage remains idle after reload', async () => {
  // Complete dependencies but do NOT trigger export
  // Reload page
  // Verify export stage is idle, not stale
});
```

### 2. **Unit Test**: State Validation
```typescript
test('validateStageState fixes invalid completed stage', () => {
  const invalidState = { status: 'completed', output: undefined };
  const fixed = validateStageState(invalidState);
  expect(fixed.status).toBe('idle');
});
```

### 3. **Integration Test**: Dependency Evaluation
```typescript
test('staleness logic ignores never-completed stages', () => {
  // Stage with dependencies met but never executed
  // Should NOT be marked as stale
});
```

## Acceptance Criteria

- [ ] **NEVER** show "Update recommended" for never-executed stages
- [ ] Export stages remain `idle` until explicitly triggered
- [ ] State validation prevents invalid combinations
- [ ] Reload preserves correct stage states
- [ ] Staleness only applies to truly completed stages
- [ ] No breaking changes to existing functionality
- [ ] All existing tests pass
- [ ] New tests cover edge cases

## Risk Assessment

- **Impact**: High - Affects core workflow UX and user understanding
- **Complexity**: Medium - Requires careful state management fixes
- **Breaking Changes**: None - Only fixes invalid states
- **Testing**: Critical - Must verify no regressions

## Definition of Done

1. ✅ Invalid state combinations are prevented
2. ✅ Never-executed export stages remain idle after reload
3. ✅ "Update recommended" only shows for truly stale content
4. ✅ All state transitions are valid and consistent
5. ✅ E2E tests verify correct behavior
6. ✅ No user confusion about phantom stale states

---

**CRITICAL**: This bug creates significant user confusion and breaks the fundamental expectation that only executed content can be stale. Must be fixed before any new workflow releases. 