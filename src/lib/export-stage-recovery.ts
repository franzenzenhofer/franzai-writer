import type { StageState, Workflow } from '@/types';

/**
 * Reset any export stages stuck in "running" to "idle".
 * Returns a new shallow-cloned stageStates object (immutable-friendly).
 * 
 * This solves the critical bug where export stages get permanently stuck
 * in "running" status after page reload, preventing users from re-running exports.
 */
export function resetStuckExportStages(
  stageStates: Record<string, StageState>,
  workflow: Workflow
): Record<string, StageState> {
  const result: Record<string, StageState> = { ...stageStates };
  let recoveredStages = 0;

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
        console.warn('[ExportRecovery] Reset stuck export stage:', stage.id);
        recoveredStages++;
      }
    }
  });

  if (recoveredStages > 0) {
    console.log(`[ExportRecovery] Recovered ${recoveredStages} stuck export stages`);
  }

  return result;
}