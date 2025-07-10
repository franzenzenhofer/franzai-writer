/**
 * Lazy-loaded AI processing modules
 * This file provides lazy loading for AI-related modules to reduce initial bundle size
 */

// Cache for loaded modules to avoid re-importing
const moduleCache = new Map<string, any>();

/**
 * Lazy load the AI stage runner
 */
export async function loadAiStageRunner() {
  const cacheKey = 'ai-stage-runner';
  
  if (moduleCache.has(cacheKey)) {
    return moduleCache.get(cacheKey);
  }

  try {
    const module = await import('./ai-stage-runner');
    moduleCache.set(cacheKey, module);
    return module;
  } catch (error) {
    console.error('Failed to load AI stage runner:', error);
    throw new Error(`AI stage runner failed to load: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Lazy load the AI image generator
 */
export async function loadAiImageGenerator() {
  const cacheKey = 'ai-image-generator';
  
  if (moduleCache.has(cacheKey)) {
    return moduleCache.get(cacheKey);
  }

  try {
    const module = await import('./ai-image-generator');
    moduleCache.set(cacheKey, module);
    return module;
  } catch (error) {
    console.error('Failed to load AI image generator:', error);
    throw new Error(`AI image generator failed to load: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Lazy load the export stage execution
 */
export async function loadExportStageExecution() {
  const cacheKey = 'export-stage-execution';
  
  if (moduleCache.has(cacheKey)) {
    return moduleCache.get(cacheKey);
  }

  try {
    const module = await import('../ai/flows/export-stage-execution');
    moduleCache.set(cacheKey, module);
    return module;
  } catch (error) {
    console.error('Failed to load export stage execution:', error);
    throw new Error(`Export stage execution failed to load: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Lazy load the Google GenAI core module
 */
export async function loadGoogleGenAICore() {
  const cacheKey = 'google-genai-core';
  
  if (moduleCache.has(cacheKey)) {
    return moduleCache.get(cacheKey);
  }

  try {
    const module = await import('./google-genai/core');
    moduleCache.set(cacheKey, module);
    return module;
  } catch (error) {
    console.error('Failed to load Google GenAI core:', error);
    throw new Error(`Google GenAI core failed to load: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Lazy load the AI HTML generator
 */
export async function loadAiHtmlGenerator() {
  const cacheKey = 'ai-html-generator';
  
  if (moduleCache.has(cacheKey)) {
    return moduleCache.get(cacheKey);
  }

  try {
    const module = await import('./export/ai-html-generator');
    moduleCache.set(cacheKey, module);
    return module;
  } catch (error) {
    console.error('Failed to load AI HTML generator:', error);
    throw new Error(`AI HTML generator failed to load: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Preload critical AI modules (can be called during app initialization)
 */
export async function preloadCriticalAiModules() {
  try {
    // Preload the most commonly used modules
    await Promise.all([
      loadAiStageRunner(),
      loadGoogleGenAICore(),
    ]);
    
    console.log('Critical AI modules preloaded successfully');
  } catch (error) {
    console.warn('Failed to preload some AI modules:', error);
    // Don't throw here - modules will be loaded on demand
  }
}

/**
 * Clear the module cache (useful for testing or memory management)
 */
export function clearModuleCache() {
  moduleCache.clear();
}

/**
 * Get cache status for debugging
 */
export function getCacheStatus() {
  return {
    cacheSize: moduleCache.size,
    cachedModules: Array.from(moduleCache.keys()),
  };
}