import type { Workflow, StageState } from '@/types';

/**
 * Initialize proper StageState objects for each stage in the workflow
 * This ensures that every stage has a valid StageState object with all required properties
 */
export function initializeStageStates(workflow: Workflow): Record<string, StageState> {
  console.log('[initializeStageStates] Starting initialization for workflow:', workflow.id);
  const stageStates: Record<string, StageState> = {};
  
  workflow.stages.forEach(stage => {
    console.log('[initializeStageStates] Initializing stage:', stage.id);
    stageStates[stage.id] = {
      stageId: stage.id,
      status: 'idle',
      depsAreMet: !(stage.dependencies && stage.dependencies.length > 0), // true if no dependencies
      isEditingOutput: false,
      shouldAutoRun: false, // Will be properly calculated by evaluateDependenciesLogic
      isStale: false,
      staleDismissed: false,
      userInput: undefined,
      output: undefined,
      error: undefined,
      completedAt: undefined,
      groundingInfo: undefined,
      thinkingSteps: undefined,
      chatHistory: undefined,
      currentStreamOutput: undefined,
      outputImages: undefined
    };
  });
  
  console.log('[initializeStageStates] Completed initialization:', {
    workflowId: workflow.id,
    stageCount: Object.keys(stageStates).length,
    stageIds: Object.keys(stageStates)
  });
  
  return stageStates;
}

/**
 * Validate that loaded stage states match the current workflow
 * Returns validation result with valid and mismatched stage IDs
 */
export function validateStageStatesMatchWorkflow(
  workflow: Workflow, 
  loadedStageStates: Record<string, StageState>
): { isValid: boolean; validIds: string[]; mismatchedIds: string[] } {
  console.log('[validateStageStatesMatchWorkflow] Starting validation', {
    workflowId: workflow.id,
    workflowStageCount: workflow.stages.length,
    loadedStageCount: Object.keys(loadedStageStates).length
  });
  
  const currentStageIds = new Set(workflow.stages.map(stage => stage.id));
  const loadedStageIds = Object.keys(loadedStageStates);
  
  console.log('[validateStageStatesMatchWorkflow] Stage ID comparison', {
    currentStageIds: Array.from(currentStageIds),
    loadedStageIds: loadedStageIds
  });
  
  const validIds: string[] = [];
  const mismatchedIds: string[] = [];
  
  // Check each loaded stage ID against current workflow
  loadedStageIds.forEach(loadedId => {
    if (currentStageIds.has(loadedId)) {
      validIds.push(loadedId);
    } else {
      mismatchedIds.push(loadedId);
    }
  });
  
  const isValid = mismatchedIds.length === 0 && validIds.length === currentStageIds.size;
  
  console.log('[validateStageStatesMatchWorkflow] Validation completed', {
    isValid,
    validIds,
    mismatchedIds,
    currentStageCount: currentStageIds.size,
    validCount: validIds.length
  });
  
  return {
    isValid,
    validIds,
    mismatchedIds
  };
} 