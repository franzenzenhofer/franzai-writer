import type { StageState } from '@/types';

/**
 * Validates stage state to prevent invalid combinations
 * Fixes common bugs where stages have inconsistent status/output/timestamp
 */
export function validateStageState(stageState: StageState): StageState {
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
  
  // CRITICAL: Only completed stages can be stale
  if (stageState.status !== 'completed' && stageState.isStale) {
    console.warn('[StateValidation] Fixing non-completed stage marked as stale:', stageState.stageId);
    return {
      ...stageState,
      isStale: false,
      staleDismissed: false
    };
  }
  
  return stageState;
}

/**
 * Validates all stage states in a record
 */
export function validateAllStageStates(
  stageStates: Record<string, StageState>
): Record<string, StageState> {
  const validated: Record<string, StageState> = {};
  
  for (const [stageId, state] of Object.entries(stageStates)) {
    validated[stageId] = validateStageState(state);
  }
  
  return validated;
}