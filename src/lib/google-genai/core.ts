/**
 * Core Google Generative AI Service
 * Singleton pattern for efficient API usage
 * Modular design for easy feature extension
 */

import { GoogleGenAI } from '@google/genai';

export class GoogleGenAICore {
  private static instance: GoogleGenAICore;
  private genAI: GoogleGenAI;
  private models: Map<string, any> = new Map();

  private constructor() {
    const apiKey = process.env.GOOGLE_GENAI_API_KEY;
    if (!apiKey) {
      throw new Error('GOOGLE_GENAI_API_KEY environment variable is required');
    }
    this.genAI = new GoogleGenAI({ apiKey });
  }

  static getInstance(): GoogleGenAICore {
    if (!GoogleGenAICore.instance) {
      GoogleGenAICore.instance = new GoogleGenAICore();
    }
    return GoogleGenAICore.instance;
  }

  /**
   * Get or create a model instance with caching
   * Note: @google/genai doesn't support model caching the same way
   */
  getModel(modelName: string, modelParams?: any): any {
    // For @google/genai, we return the models API directly
    // The actual model instance is created when calling generate methods
    return {
      modelName,
      modelParams,
      genAI: this.genAI
    };
  }

  /**
   * Get the raw GoogleGenerativeAI instance for advanced usage
   */
  getRawClient(): GoogleGenAI {
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