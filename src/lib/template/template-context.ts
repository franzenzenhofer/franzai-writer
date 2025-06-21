import type { Workflow, StageState } from '@/types';

export type TemplateContext = {
  workflow: {
    id: string;
    type: string;
    title?: string;
  };
  stages: Record<string, any>;
};

/**
 * Builds a unified template context from workflow and stage states
 * This provides a consistent data structure for all template processing
 */
export function buildContext(
  workflow: Workflow,
  stageStates: Record<string, StageState>
): TemplateContext {
  return {
    workflow: {
      id: workflow.id,
      type: workflow.id, // Use id as type since there's no type property
      title: workflow.name, // Use name instead of title
    },
    stages: Object.fromEntries(
      Object.entries(stageStates).map(([id, stageState]) => [
        id,
        stageState?.output ?? null
      ])
    ),
  };
}

/**
 * Helper to safely extract nested values from stage outputs
 */
export function safeGet(obj: any, path: string): any {
  if (!obj || !path) return null;
  
  return path.split('.').reduce((current, key) => {
    if (current === null || current === undefined) return null;
    
    // Handle array access like images[0]
    const arrayMatch = key.match(/^(.+)\[(\d+)\]$/);
    if (arrayMatch) {
      const [, arrayKey, index] = arrayMatch;
      const array = current[arrayKey];
      if (Array.isArray(array)) {
        return array[parseInt(index)] ?? null;
      }
      return null;
    }
    
    return current[key] ?? null;
  }, obj);
} 