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
      const genAI = getGoogleGenAI().getRawClient();
      
      const contents: any[] = [];
      if (modelConfig.systemInstruction) {
        contents.push({ text: modelConfig.systemInstruction });
      }
      contents.push({ text: prompt });
      
      const result = await genAI.models.generateContent({
        model: modelConfig.model,
        contents,
        config: {
          temperature: modelConfig.temperature,
          maxOutputTokens: modelConfig.maxOutputTokens,
          topP: modelConfig.topP,
          topK: modelConfig.topK,
          stopSequences: modelConfig.stopSequences,
          candidateCount: modelConfig.candidateCount
        }
      });
      
      return {
        text: result.text || '',
        usageMetadata: result.usageMetadata ? {
          promptTokenCount: result.usageMetadata.promptTokens || 0,
          candidatesTokenCount: result.usageMetadata.candidateTokens || 0,
          totalTokenCount: result.usageMetadata.totalTokens || 0,
          thoughtsTokenCount: result.usageMetadata.thoughtsTokens
        } : undefined,
        finishReason: result.candidates?.[0]?.finishReason,
        safetyRatings: result.candidates?.[0]?.safetyRatings,
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
      
      const streamPromise = genAI.models.generateContentStream({
        model: modelConfig.model,
        contents,
        config: {
          temperature: modelConfig.temperature,
          maxOutputTokens: modelConfig.maxOutputTokens,
          topP: modelConfig.topP,
          topK: modelConfig.topK,
          stopSequences: modelConfig.stopSequences
        }
      });
      
      const result = await streamPromise;
      
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
      // For @google/genai, token counting might be different
      // This is a placeholder - you may need to check the actual API
      const result = await genAI.models.countTokens({
        model,
        contents: [{ role: 'user', parts: [{ text }] }]
      });
      return result.totalTokens || 0;
    } catch (error) {
      console.error('Token counting error:', error);
      throw error;
    }
  }
}