import { useState, useCallback, useEffect } from 'react';
import type { WizardInstance, Stage, StageState } from '@/types';

interface UseWizardInstanceProps {
  initialInstance: WizardInstance;
}

interface UseWizardInstanceReturn {
  instance: WizardInstance;
  setInstance: React.Dispatch<React.SetStateAction<WizardInstance>>;
  updateStageState: (stageId: string, updates: Partial<StageState>) => void;
  evaluateDependencies: () => void;
  pageTitle: string;
  setPageTitle: (title: string) => void;
}

/**
 * Hook for managing the wizard instance state, including stage states and dependencies
 */
export function useWizardInstance({ initialInstance }: UseWizardInstanceProps): UseWizardInstanceReturn {
  const [instance, setInstance] = useState<WizardInstance>(initialInstance);
  const [pageTitle, setPageTitle] = useState(initialInstance.document.title);

  // Enhanced dependency evaluation logic with support for autoRunConditions
  const evaluateDependenciesLogic = useCallback((currentStageStates: Record<string, StageState>, stages: Stage[]): Record<string, StageState> => {
    const newStageStates = { ...currentStageStates };
    let changed = false;

    stages.forEach(stage => {
      const currentState = newStageStates[stage.id];
      if (!currentState) return; // Should not happen if initialized correctly

      // Evaluate basic dependencies
      let depsMet = true;
      if (stage.dependencies && stage.dependencies.length > 0) {
        depsMet = stage.dependencies.every(depId => 
          newStageStates[depId]?.status === 'completed'
        );
      }

      // Evaluate autorun conditions (more complex dependency logic)
      let autoRunConditionsMet = true;
      if (stage.autoRunConditions) {
        if (stage.autoRunConditions.requiresAll) {
          autoRunConditionsMet = stage.autoRunConditions.requiresAll.every(depId => 
            newStageStates[depId]?.status === 'completed'
          );
        }
        if (autoRunConditionsMet && stage.autoRunConditions.requiresAny) {
          autoRunConditionsMet = stage.autoRunConditions.requiresAny.some(depId => 
            newStageStates[depId]?.status === 'completed'
          );
        }
      }
      
      let isStale = false;
      if (currentState.status === 'completed' && currentState.output && currentState.completedAt) {
        // ONLY check staleness for truly completed stages
        const stageCompletedAt = new Date(currentState.completedAt).getTime();
        
        // Check staleness based on basic dependencies
        if (stage.dependencies && stage.dependencies.length > 0) {
          isStale = stage.dependencies.some(depId => {
            const depCompletedAt = newStageStates[depId]?.completedAt ? new Date(newStageStates[depId].completedAt).getTime() : 0;
            return depCompletedAt > stageCompletedAt || newStageStates[depId]?.isStale === true;
          });
        }
        
        // Also check staleness based on autorun conditions
        if (!isStale && stage.autoRunConditions?.requiresAll) {
          isStale = stage.autoRunConditions.requiresAll.some(depId => {
            const depCompletedAt = newStageStates[depId]?.completedAt ? new Date(newStageStates[depId].completedAt).getTime() : 0;
            return depCompletedAt > stageCompletedAt || newStageStates[depId]?.isStale === true;
          });
        }
        
        // Also check staleness based on autorun dependencies
        if (!isStale && stage.autorunDependsOn && stage.autorunDependsOn.length > 0) {
          isStale = stage.autorunDependsOn.some(depId => {
            const depCompletedAt = newStageStates[depId]?.completedAt ? new Date(newStageStates[depId].completedAt).getTime() : 0;
            return depCompletedAt > stageCompletedAt || newStageStates[depId]?.isStale === true;
          });
        }
      }

      // Evaluate autorun dependencies (separate from activation dependencies)
      let autorunDepsMet = true;
      if (stage.autorunDependsOn && stage.autorunDependsOn.length > 0) {
        // Use explicit autorun dependencies
        autorunDepsMet = stage.autorunDependsOn.every(depId => 
          newStageStates[depId]?.status === 'completed'
        );
      } else {
        // Fall back to regular dependencies (backward compatibility)
        autorunDepsMet = depsMet;
      }

      // Determine if stage should auto-run
      let shouldAutoRun = false;
      if (stage.autoRun && currentState.status === 'idle' && !currentState.isEditingOutput) {
        if (stage.autoRunConditions) {
          // Use complex autorun conditions AND autorun dependencies
          shouldAutoRun = depsMet && autoRunConditionsMet && autorunDepsMet;
        } else {
          // Use simple dependency logic - stage must be active (depsMet) AND autorun deps met
          shouldAutoRun = depsMet && autorunDepsMet;
        }
      }

      if (
        currentState.depsAreMet !== depsMet ||
        currentState.isStale !== isStale ||
        currentState.shouldAutoRun !== shouldAutoRun
      ) {
        newStageStates[stage.id] = {
          ...currentState,
          depsAreMet: depsMet,
          isStale: isStale,
          shouldAutoRun: shouldAutoRun,
          // Reset staleDismissed when stage is no longer stale
          staleDismissed: isStale ? currentState.staleDismissed : false,
        };
        changed = true;
      }
    });
    return changed ? newStageStates : currentStageStates; // Return original if no change to avoid re-render
  }, []);

  const updateStageState = useCallback((stageId: string, updates: Partial<StageState>) => {
    setInstance(prevInstance => {
      const newStageStates = {
        ...prevInstance.stageStates,
        [stageId]: {
          ...prevInstance.stageStates[stageId],
          ...updates,
        },
      };
      const evaluatedStageStates = evaluateDependenciesLogic(newStageStates, prevInstance.workflow.stages);
      return { ...prevInstance, stageStates: evaluatedStageStates };
    });
  }, [evaluateDependenciesLogic]);

  const evaluateDependencies = useCallback(() => {
    setInstance(prevInstance => ({
      ...prevInstance,
      stageStates: evaluateDependenciesLogic(prevInstance.stageStates, prevInstance.workflow.stages)
    }));
  }, [evaluateDependenciesLogic]);

  // Effect for initial dependency evaluation
  useEffect(() => {
    evaluateDependencies();
  }, []); // Runs once on mount

  return {
    instance,
    setInstance,
    updateStageState,
    evaluateDependencies,
    pageTitle,
    setPageTitle,
  };
}