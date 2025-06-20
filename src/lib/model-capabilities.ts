/**
 * RECOMMENDED MODELS FOR PRODUCTION USE:
 * 
 * For general stages (cost-effective):
 * - gemini-2.5-flash (newest, stable, cheapest with full features)
 * - gemini-2.0-flash (stable, good balance)
 * 
 * For export/complex stages (higher quality):
 * - gemini-2.5-pro (newest, highest quality)
 * - gemini-2.5-flash (can also work well for exports)
 * 
 * For image generation:
 * - imagen-3.0-generate-002 (latest)
 * 
 * AVOID using:
 * - Preview/experimental versions in production
 * - Gemini 1.5 models (older generation)
 */

export interface ModelAbilities {
  toolUse?: boolean; // Corresponds to 'toolNames' or general function calling
  thinking?: boolean; // Corresponds to 'thinkingSettings.enabled'
  grounding?: boolean; // Corresponds to 'groundingSettings' (Google Search or URL Context)
  codeExecution?: boolean; // Corresponds to 'codeExecutionSettings.enabled'
  imageGeneration?: boolean; // Corresponds to 'outputType: "image"' or 'imageGenerationSettings'
}

export const modelCapabilities: Record<string, ModelAbilities> = {
  // --- Gemini 2.5 Series ---
  'gemini-2.5-pro': {
    toolUse: true,
    thinking: true,
    grounding: true,
    codeExecution: true,
    imageGeneration: false,
  },
  'gemini-2.5-flash': {
    toolUse: true,
    thinking: true,
    grounding: true,
    codeExecution: true,
    imageGeneration: false,
  },
  'gemini-2.5-flash-lite-preview-06-17': {
    toolUse: true,
    thinking: true,
    grounding: true,
    codeExecution: true,
    imageGeneration: false,
  },

  // --- Gemini 2.0 Series ---
  'gemini-2.0-flash': {
    toolUse: true,
    thinking: false, // Experimental in 2.0, full support in 2.5
    grounding: true,
    codeExecution: true,
    imageGeneration: false,
  },
  'gemini-2.0-flash-exp': {
    toolUse: true,
    thinking: true, // Experimental thinking mode
    grounding: true,
    codeExecution: true,
    imageGeneration: false,
  },
  'gemini-2.0-flash-preview-image-generation': {
    toolUse: false,
    thinking: false,
    grounding: false,
    codeExecution: false,
    imageGeneration: true,
  },
  'gemini-2.0-flash-lite': {
    toolUse: false,
    thinking: false,
    grounding: false,
    codeExecution: false,
    imageGeneration: false,
  },

  // --- Gemini 1.5 Series ---
  'gemini-1.5-pro': {
    toolUse: true,
    thinking: false,
    grounding: false, // Updated based on project-specific support decision
    codeExecution: true,
    imageGeneration: false,
  },
  'gemini-1.5-flash': {
    toolUse: true,
    thinking: false,
    grounding: false, // Updated based on project-specific support decision
    codeExecution: true,
    imageGeneration: false,
  },

  // Aliases/specific versions found in workflows, mapped to their base capabilities
  'gemini-2.5-pro-preview': { // Maps to gemini-2.5-pro
    toolUse: true,
    thinking: true,
    grounding: true,
    codeExecution: true,
    imageGeneration: false,
  },
  'gemini-2.5-flash-preview': { // Maps to gemini-2.5-flash
    toolUse: true,
    thinking: true,
    grounding: true,
    codeExecution: true,
    imageGeneration: false,
  },
  'gemini-2.5-pro-preview-03-25': { // Specific preview version
    toolUse: true,
    thinking: true,
    grounding: true,
    codeExecution: true,
    imageGeneration: false,
  },
  
  // --- Imagen Models ---
  'imagen-3.0-generate-002': {
    toolUse: false,
    thinking: false,
    grounding: false,
    codeExecution: false,
    imageGeneration: true,
  },
  'imagen-3.0-generate-001': {
    toolUse: false,
    thinking: false,
    grounding: false,
    codeExecution: false,
    imageGeneration: true,
  },

  // --- Legacy/Deprecated Models ---
  'gemini-1.5-pro-002': {
    toolUse: true,
    thinking: false,
    grounding: false,
    codeExecution: true,
    imageGeneration: false,
  },
  'gemini-1.5-flash-002': {
    toolUse: true,
    thinking: false,
    grounding: false,
    codeExecution: true,
    imageGeneration: false,
  },
};

/**
 * Retrieves the capabilities of a given model.
 * It handles base model names (e.g., 'gemini-2.0-flash') and prefixed names (e.g., 'googleai/gemini-2.0-flash').
 * It also provides a fallback for experimental/preview model names to their closest stable or known equivalents if not directly listed.
 * @param modelId The full model ID, possibly with a prefix like 'googleai/'.
 * @returns The capabilities of the model, or undefined if not found.
 */
export function getModelCapabilities(modelId?: string): ModelAbilities | undefined {
  if (!modelId) {
    return undefined;
  }

  let baseModelId = modelId;
  if (modelId.startsWith('googleai/')) {
    baseModelId = modelId.substring('googleai/'.length);
  }

  // Direct match
  if (modelCapabilities[baseModelId]) {
    return modelCapabilities[baseModelId];
  }

  // Handle known preview/experimental versions by mapping them if not directly in the list above
  if (baseModelId.startsWith('gemini-2.5-pro-preview')) {
    return modelCapabilities['gemini-2.5-pro'] || modelCapabilities['gemini-2.5-pro-preview'];
  }
  if (baseModelId.startsWith('gemini-2.5-flash-preview') && baseModelId !== 'gemini-2.5-flash-lite-preview-06-17' && baseModelId !== 'gemini-2.5-flash-preview-image-generation') {
    return modelCapabilities['gemini-2.5-flash'] || modelCapabilities['gemini-2.5-flash-preview'];
  }

  // If a workflow uses a specific -exp or -latest that's not directly in the map, try to map to its base.
  if (baseModelId === 'gemini-2.0-flash-exp') {
    return modelCapabilities['gemini-2.0-flash-exp'] || modelCapabilities['gemini-2.0-flash'];
  }
  if (baseModelId === 'gemini-1.5-pro-latest') {
    return modelCapabilities['gemini-1.5-pro'];
  }
  if (baseModelId === 'gemini-1.5-flash-latest') {
    return modelCapabilities['gemini-1.5-flash'];
  }

  // Fallback for other -exp or -preview if not explicitly mapped, try removing suffix
  const previewSuffixes = ['-exp', '-preview'];
  for (const suffix of previewSuffixes) {
    if (baseModelId.endsWith(suffix)) {
      const coreModel = baseModelId.substring(0, baseModelId.length - suffix.length);
      if (modelCapabilities[coreModel]) {
        return modelCapabilities[coreModel];
      }
    }
  }

  // Fallback for numeric suffixes like -001
  const numericSuffixMatch = baseModelId.match(/^(.*)-\d{3}$/);
  if (numericSuffixMatch && numericSuffixMatch[1]) {
    const coreModel = numericSuffixMatch[1];
    if (modelCapabilities[coreModel]) {
      return modelCapabilities[coreModel];
    }
  }

  return undefined; // Not found
}
