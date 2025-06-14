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
    console.log('📤 [AI REQUEST] Text Generation:', {
      model: modelConfig.model,
      promptLength: prompt.length,
      temperature: modelConfig.temperature,
      systemInstruction: modelConfig.systemInstruction?.substring(0, 100) + '...'
    });
    
    try {
      const genAI = getGoogleGenAI().getRawClient();
      
      const contents: any[] = [];
      if (modelConfig.systemInstruction) {
        contents.push({ text: modelConfig.systemInstruction });
      }
      contents.push({ text: prompt });
      
      // For @google/genai, use models.generateContent directly
      const result = await genAI.models.generateContent({
        model: modelConfig.model,
        contents: prompt,
        config: {
          temperature: modelConfig.temperature,
          maxTokens: modelConfig.maxOutputTokens,
          topP: modelConfig.topP,
          topK: modelConfig.topK,
          stopSequences: modelConfig.stopSequences,
          candidateCount: modelConfig.candidateCount
        },
        systemInstruction: modelConfig.systemInstruction
      });
      
      return {
        text: result.text || '',
        usageMetadata: result.usage as any,
        finishReason: result.finishReason,
        safetyRatings: result.safetyRatings,
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
      const genAI = getGoogleGenAI().getRawClient();
      
      const contents: any[] = [];
      if (modelConfig.systemInstruction) {
        contents.push({ text: modelConfig.systemInstruction });
      }
      contents.push({ text: prompt });
      
      // For @google/genai, use models.generateContentStream directly
      const result = await genAI.models.generateContentStream({
        model: modelConfig.model,
        contents: prompt,
        config: {
          temperature: modelConfig.temperature,
          maxTokens: modelConfig.maxOutputTokens,
          topP: modelConfig.topP,
          topK: modelConfig.topK,
          stopSequences: modelConfig.stopSequences
        },
        systemInstruction: modelConfig.systemInstruction
      });
      
      let fullText = '';
      
      for await (const chunk of result) {
        const chunkText = chunk.text || '';
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
      const genAI = getGoogleGenAI().getRawClient();
      
      const result = await genAI.models.countTokens({
        model: model,
        contents: text
      });
      return result.totalTokens || 0;
    } catch (error) {
      console.error('Token counting error:', error);
      throw error;
    }
  }
}