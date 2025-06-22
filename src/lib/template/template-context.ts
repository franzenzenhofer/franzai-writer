import type { Workflow, StageState } from '@/types';

export type ImageAttribution = {
  provider: string;
  text: string;
  placement: 'below_image' | 'footer' | 'caption';
  style: 'muted' | 'normal' | 'hidden';
};

export type TemplateContext = {
  workflow: {
    id: string;
    type: string;
    title?: string;
  };
  stages: Record<string, any>;
  imageAttribution?: ImageAttribution;
};

/**
 * Builds a unified template context from workflow and stage states
 * This provides a consistent data structure for all template processing
 */
export function buildContext(
  workflow: Workflow,
  stageStates: Record<string, StageState>
): TemplateContext {
  const context: TemplateContext = {
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

  // Check if any stages use Imagen for image generation
  const imagenAttribution = detectImagenUsage(workflow, stageStates);
  if (imagenAttribution) {
    context.imageAttribution = imagenAttribution;
  }

  return context;
}

/**
 * Detects if any workflow stages use Imagen for image generation
 * and returns appropriate attribution information
 */
function detectImagenUsage(
  workflow: Workflow,
  stageStates: Record<string, StageState>
): ImageAttribution | null {
  // Check all workflow stages for Imagen usage
  for (const stage of workflow.stages) {
    if (stage.outputType === 'image' && stage.imageGenerationSettings?.provider === 'imagen') {
      // Found an Imagen stage - check if it has actually generated images
      const stageOutput = stageStates[stage.id]?.output;
      if (stageOutput && stageOutput.images && Array.isArray(stageOutput.images) && stageOutput.images.length > 0) {
        return {
          provider: 'Imagen',
          text: 'Generated with AI using Google Imagen',
          placement: 'below_image',
          style: 'muted'
        };
      }
    }
  }
  
  return null;
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