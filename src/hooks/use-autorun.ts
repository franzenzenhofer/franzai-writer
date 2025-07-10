import { useEffect } from 'react';
import type { WizardInstance } from '@/types';

interface UseAutorunProps {
  instance: WizardInstance;
  handleRunStage: (stageId: string, userInput?: any) => void;
}

/**
 * Hook for managing autorun logic - automatically runs stages when their conditions are met
 */
export function useAutorun({ instance, handleRunStage }: UseAutorunProps): void {
  // Effect to handle autorun stages
  useEffect(() => {
    instance.workflow.stages.forEach(stage => {
      const stageState = instance.stageStates[stage.id];
      // Defensive check: ensure stageState exists before accessing its properties
      if (stageState && stageState.shouldAutoRun && stageState.status === 'idle' && stageState.depsAreMet && !stageState.isEditingOutput) {
        console.log(`[Autorun] Triggering autorun for stage ${stage.id}`);
        handleRunStage(stage.id, stageState.userInput);
      }
    });
  }, [instance.stageStates, instance.workflow.stages, handleRunStage]);
}