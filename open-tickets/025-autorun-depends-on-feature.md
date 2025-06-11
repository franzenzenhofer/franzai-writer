# Ticket: Add autorunDependsOn Field for Separate Auto-Run Control

**Created**: 2025-06-11  
**Priority**: High  
**Component**: Workflow System  

## Problem Statement

Currently, the `dependencies` field in workflow stages serves a dual purpose:
1. Determines when a stage becomes **active** (available to run manually)
2. Determines when a stage **auto-runs** (if autoRun is true)

This creates a limitation where we cannot have different conditions for activation vs auto-running. 

### Specific Use Case
In the poem-generator workflow:
- "Generate HTML Preview" should become **active** when "Generate Poem" is completed (user can manually run it)
- "Generate HTML Preview" should only **auto-run** when BOTH "Generate Poem" AND "HTML Briefing" are completed

Currently, if we add "HTML Briefing" to dependencies, the stage won't be active until both are complete, preventing manual runs.

## Proposed Solution

Add a new optional field `autorunDependsOn` to the Stage schema that specifically controls auto-run behavior:

```typescript
interface Stage {
  // ... existing fields ...
  dependencies?: string[];  // Controls when stage becomes active
  autorunDependsOn?: string[];  // Controls when stage auto-runs (optional)
  autoRun?: boolean;
}
```

### Behavior Rules
1. If `autorunDependsOn` is NOT specified:
   - Auto-run behavior uses `dependencies` (current behavior, backward compatible)
2. If `autorunDependsOn` IS specified:
   - Stage becomes **active** when `dependencies` are met
   - Stage **auto-runs** when `autorunDependsOn` are met
3. For a stage to auto-run, it must be both active AND meet autorunDependsOn conditions

## Technical Implementation

### 1. Update Types (src/types/index.ts)
```typescript
export interface Stage {
  // ... existing fields ...
  dependencies?: string[];
  autorunDependsOn?: string[];  // New field
  autoRun?: boolean;
}
```

### 2. Update Dependency Evaluation Logic (wizard-shell.tsx)
Modify `evaluateDependenciesLogic` function to:
- Keep existing `depsAreMet` logic for stage activation
- Add separate `autorunDepsMet` logic that checks `autorunDependsOn` if present
- Update `shouldAutoRun` calculation to use `autorunDepsMet`

### 3. Update Staleness Logic
- Staleness should consider BOTH `dependencies` and `autorunDependsOn`
- A stage is stale if ANY of its activation or autorun dependencies have been updated

## Implementation Details

### Code Changes Required

1. **src/types/index.ts**: Add `autorunDependsOn?: string[]` to Stage interface

2. **src/components/wizard/wizard-shell.tsx**: Update `evaluateDependenciesLogic`:
```typescript
// Evaluate basic dependencies (for activation)
let depsMet = true;
if (stage.dependencies && stage.dependencies.length > 0) {
  depsMet = stage.dependencies.every(depId => 
    newStageStates[depId]?.status === 'completed'
  );
}

// Evaluate autorun dependencies (for auto-running)
let autorunDepsMet = true;
if (stage.autorunDependsOn && stage.autorunDependsOn.length > 0) {
  autorunDepsMet = stage.autorunDependsOn.every(depId => 
    newStageStates[depId]?.status === 'completed'
  );
} else {
  // If not specified, use regular dependencies
  autorunDepsMet = depsMet;
}

// Determine if stage should auto-run
let shouldAutoRun = false;
if (stage.autoRun && currentState.status === 'idle' && !currentState.isEditingOutput) {
  // Stage must be active (depsMet) AND autorun conditions met
  shouldAutoRun = depsMet && autorunDepsMet;
}
```

3. **Update staleness calculation** to include autorunDependsOn

4. **Update poem-generator workflow.json**:
```json
{
  "id": "generate-html-preview",
  "dependencies": ["generate-poem"],
  "autorunDependsOn": ["generate-poem", "html-briefing"],
  "autoRun": true
}
```

## Testing Plan

1. **Backward Compatibility**: Ensure existing workflows without `autorunDependsOn` work exactly as before
2. **New Behavior**: Test poem-generator workflow:
   - HTML Preview becomes active after poem generation
   - HTML Preview only auto-runs when both poem and briefing are complete
   - Manual run works with just poem completed
3. **Edge Cases**:
   - Empty autorunDependsOn array
   - autorunDependsOn with non-existent stage IDs
   - Circular dependencies
   - Optional stages in autorunDependsOn

## Documentation Updates

1. Update workflow-schema-reference.md with new field
2. Add examples showing the difference between dependencies and autorunDependsOn
3. Update any workflow creation guides

## Acceptance Criteria

- [ ] autorunDependsOn field added to Stage type
- [ ] Dependency evaluation logic updated to handle new field
- [ ] Backward compatibility maintained (no breaking changes)
- [ ] Poem generator workflow updated and working as specified
- [ ] Documentation updated with clear examples
- [ ] No regression in existing workflows
- [ ] TypeScript compilation passes
- [ ] Staleness logic accounts for both dependency types

## Risk Assessment

- **Low Risk**: Feature is additive and backward compatible
- **Complexity**: Moderate - requires careful handling of dependency logic
- **Testing**: Comprehensive testing needed for edge cases

## Alternative Approaches Considered

1. **Modify autoRunConditions**: Could extend existing autoRunConditions, but that's more complex and less intuitive
2. **New stage type**: Could create a new stage type, but that's overkill for this use case
3. **Workflow-level config**: Could add workflow-level rules, but stage-level control is more flexible

## Decision
Proceed with the `autorunDependsOn` field as it's:
- Simple and intuitive
- Backward compatible
- Minimal code changes
- Clear separation of concerns