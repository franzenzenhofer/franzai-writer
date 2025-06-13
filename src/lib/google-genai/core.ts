/**
 * Core Google Generative AI Service
 * Singleton pattern for efficient API usage
 * Modular design for easy feature extension
 */

import { GoogleGenerativeAI, GenerativeModel, ModelParams } from '@google/genai';

export class GoogleGenAICore {
  private static instance: GoogleGenAICore;
  private genAI: GoogleGenerativeAI;
  private models: Map<string, GenerativeModel> = new Map();

  private constructor() {
    const apiKey = process.env.GOOGLE_GENAI_API_KEY;
    if (!apiKey) {
      throw new Error('GOOGLE_GENAI_API_KEY environment variable is required');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  static getInstance(): GoogleGenAICore {
    if (!GoogleGenAICore.instance) {
      GoogleGenAICore.instance = new GoogleGenAICore();
    }
    return GoogleGenAICore.instance;
  }

  /**
   * Get or create a model instance with caching
   */
  getModel(modelName: string, modelParams?: ModelParams): GenerativeModel {
    const cacheKey = `${modelName}_${JSON.stringify(modelParams || {})}`;
    
    if (!this.models.has(cacheKey)) {
      const model = this.genAI.getGenerativeModel({ 
        model: modelName,
        ...modelParams 
      });
      this.models.set(cacheKey, model);
    }
    
    return this.models.get(cacheKey)!;
  }

  /**
   * Get the raw GoogleGenerativeAI instance for advanced usage
   */
  getRawClient(): GoogleGenerativeAI {
    return this.genAI;
  }

  /**
   * Clear model cache (useful for testing)
   */
  clearCache(): void {
    this.models.clear();
  }
}

// Export singleton instance getter
export const getGoogleGenAI = () => GoogleGenAICore.getInstance();