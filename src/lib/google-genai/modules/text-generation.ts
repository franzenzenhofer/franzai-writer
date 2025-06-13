/**
 * Text Generation Module
 * Core text generation functionality with streaming support
 */

import { getGoogleGenAI } from '../core';
import type { 
  ModelConfig, 
  GenerationRequest, 
  GenerationResponse,
  StreamOptions 
} from '../types';

export class TextGenerationModule {
  /**
   * Generate text content
   */
  static async generate(
    prompt: string,
    modelConfig: ModelConfig = { model: 'gemini-2.0-flash' }
  ): Promise<GenerationResponse> {
    try {
      const genAI = getGoogleGenAI();
      const model = genAI.getModel(modelConfig.model, {
        generationConfig: {
          temperature: modelConfig.temperature,
          maxOutputTokens: modelConfig.maxOutputTokens,
          topP: modelConfig.topP,
          topK: modelConfig.topK,
          stopSequences: modelConfig.stopSequences,
          candidateCount: modelConfig.candidateCount,
        }
      });

      // Add system instruction if provided
      if (modelConfig.systemInstruction) {
        model.systemInstruction = modelConfig.systemInstruction;
      }

      const result = await model.generateContent(prompt);
      const response = await result.response;
      
      return {
        text: response.text(),
        usageMetadata: response.usageMetadata,
        finishReason: response.candidates?.[0]?.finishReason,
        safetyRatings: response.candidates?.[0]?.safetyRatings,
      };
    } catch (error) {
      console.error('Text generation error:', error);
      throw error;
    }
  }

  /**
   * Generate text with streaming
   */
  static async generateStream(
    prompt: string,
    modelConfig: ModelConfig = { model: 'gemini-2.0-flash' },
    streamOptions: StreamOptions = {}
  ): Promise<void> {
    try {
      const genAI = getGoogleGenAI();
      const model = genAI.getModel(modelConfig.model, {
        generationConfig: {
          temperature: modelConfig.temperature,
          maxOutputTokens: modelConfig.maxOutputTokens,
          topP: modelConfig.topP,
          topK: modelConfig.topK,
          stopSequences: modelConfig.stopSequences,
        }
      });

      if (modelConfig.systemInstruction) {
        model.systemInstruction = modelConfig.systemInstruction;
      }

      const result = await model.generateContentStream(prompt);
      
      let fullText = '';
      
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        fullText += chunkText;
        
        if (streamOptions.onChunk) {
          streamOptions.onChunk(chunkText);
        }
      }
      
      if (streamOptions.onComplete) {
        streamOptions.onComplete(fullText);
      }
    } catch (error) {
      console.error('Stream generation error:', error);
      if (streamOptions.onError) {
        streamOptions.onError(error as Error);
      } else {
        throw error;
      }
    }
  }

  /**
   * Count tokens for a given text
   */
  static async countTokens(
    text: string,
    model: string = 'gemini-2.0-flash'
  ): Promise<number> {
    try {
      const genAI = getGoogleGenAI();
      const genModel = genAI.getModel(model);
      const result = await genModel.countTokens(text);
      return result.totalTokens;
    } catch (error) {
      console.error('Token counting error:', error);
      throw error;
    }
  }
}