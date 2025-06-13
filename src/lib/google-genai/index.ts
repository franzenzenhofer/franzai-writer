/**
 * Google Generative AI SDK - Main Export
 * Modular implementation replacing Genkit
 */

// Core
export { GoogleGenAICore, getGoogleGenAI } from './core';

// Types
export * from './types';

// Modules
export { TextGenerationModule } from './modules/text-generation';
export { StreamingModule } from './modules/streaming';
export { StructuredOutputModule } from './modules/structured-output';
export { ToolsModule } from './modules/tools';

// AI Stage Execution
export { AIStageExecution, type ExecutionResult } from './ai-stage-execution';

// Advanced features modules (to be implemented)
export const AdvancedFeatures = {
  googleSearch: async (prompt: string, model = 'gemini-2.0-flash') => {
    const { getGoogleGenAI } = await import('./core');
    const genAI = getGoogleGenAI();
    const genModel = genAI.getModel(model, {
      tools: [{ googleSearch: {} }]
    });
    return genModel.generateContent(prompt);
  },
  
  codeExecution: async (prompt: string, model = 'gemini-2.0-flash') => {
    const { getGoogleGenAI } = await import('./core');
    const genAI = getGoogleGenAI();
    const genModel = genAI.getModel(model, {
      tools: [{ codeExecution: {} }]
    });
    return genModel.generateContent(prompt);
  },
  
  imageGeneration: async (prompt: string) => {
    const { getGoogleGenAI } = await import('./core');
    const genAI = getGoogleGenAI();
    const genModel = genAI.getModel('gemini-2.0-flash', {
      generationConfig: {
        responseModalities: ['TEXT', 'IMAGE']
      }
    });
    return genModel.generateContent(prompt);
  }
};