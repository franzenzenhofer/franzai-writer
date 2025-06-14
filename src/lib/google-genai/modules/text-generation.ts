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
      
      const response = {
        text: result.text || '',
        usageMetadata: result.usage as any,
        finishReason: result.finishReason,
        safetyRatings: result.safetyRatings,
      };
      
      console.log('📥 [AI RESPONSE] Text Generation:', {
        textLength: response.text.length,
        textPreview: response.text.substring(0, 100) + '...',
        usageMetadata: response.usageMetadata,
        finishReason: response.finishReason
      });
      
      return response;
    } catch (error) {
      console.error('❌ [AI ERROR] Text generation failed:', error);
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
    console.log('📤 [AI REQUEST] Text Generation Stream:', {
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
      let chunkCount = 0;
      
      for await (const chunk of result) {
        const chunkText = chunk.text || '';
        fullText += chunkText;
        chunkCount++;
        
        if (streamOptions.onChunk) {
          streamOptions.onChunk(chunkText);
        }
      }
      
      console.log('📥 [AI RESPONSE] Text Generation Stream Complete:', {
        totalChunks: chunkCount,
        fullTextLength: fullText.length,
        textPreview: fullText.substring(0, 100) + '...'
      });
      
      if (streamOptions.onComplete) {
        streamOptions.onComplete(fullText);
      }
    } catch (error) {
      console.error('❌ [AI ERROR] Stream generation failed:', error);
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
      
      // @google/genai doesn't have a direct countTokens method
      // We'll use a simple approximation for now
      // Average tokens per character ratio is roughly 0.25 for English text
      const approximateTokens = Math.ceil(text.length * 0.25);
      
      console.log(`📊 [Token Count] Approximated ${approximateTokens} tokens for ${text.length} characters`);
      return approximateTokens;
    } catch (error) {
      console.error('Token counting error:', error);
      throw error;
    }
  }
}