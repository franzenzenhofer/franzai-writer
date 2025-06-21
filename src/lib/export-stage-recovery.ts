import type { StageState, Workflow } from '@/types';

/**
 * Reset any stages stuck in "running" state after page reload.
 * Returns a new shallow-cloned stageStates object (immutable-friendly).
 * 
 * This solves the critical bug where stages get permanently stuck
 * in "running" status after page reload, preventing users from continuing workflows.
 * 
 * For export stages: Reset to "idle" so they can be re-triggered
 * For other stages with output: Reset to "completed" to preserve results
 * For other stages without output: Reset to "idle"
 */
export function resetStuckExportStages(
  stageStates: Record<string, StageState>,
  workflow: Workflow
): Record<string, StageState> {
  const result: Record<string, StageState> = { ...stageStates };
  let recoveredStages = 0;

  workflow.stages.forEach((stage) => {
    const state = result[stage.id];
    
    // Handle export stages specially - ensure they're never in invalid states
    if (stage.stageType === 'export') {
      // Export stages should ALWAYS reset to clean idle state if no valid output
      if (!state || !state.output || !state.completedAt || state.status === 'running') {
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
        console.warn('[ExportRecovery] Reset export stage to clean idle state:', stage.id);
      }
    } else if (state?.status === 'running') {
      if (state.output) {
        // Non-export stages with output: Reset to completed to preserve results
        result[stage.id] = {
          ...state,
          status: 'completed',
          generationProgress: undefined,
          error: undefined,
        };
        console.warn('[ExportRecovery] Reset stuck stage to completed (had output):', stage.id);
      } else {
        // Non-export stages without output: Reset to idle
        result[stage.id] = {
          ...state,
          status: 'idle',
          generationProgress: undefined,
          error: undefined,
        };
        console.warn('[ExportRecovery] Reset stuck stage to idle (no output):', stage.id);
      }
      recoveredStages++;
    }
  });

  if (recoveredStages > 0) {
    console.log(`[ExportRecovery] Recovered ${recoveredStages} stuck stages`);
  }

  return result;
}