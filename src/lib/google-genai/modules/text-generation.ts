/**
 * Text Generation Module
 * Core text generation functionality with streaming support
 */

import { getGoogleGenAI } from '../core';
import { logAI } from '@/lib/ai-logger';
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
    modelConfig: ModelConfig & { 
      workflowName?: string; 
      stageName?: string; 
      stageId?: string;
      contextVars?: any;
    } = { model: 'gemini-2.0-flash' }
  ): Promise<GenerationResponse> {
    const requestLog = {
      model: modelConfig.model,
      promptLength: prompt.length,
      temperature: modelConfig.temperature,
      systemInstruction: modelConfig.systemInstruction?.substring(0, 100) + '...',
      workflowName: modelConfig.workflowName,
      stageName: modelConfig.stageName,
      stageId: modelConfig.stageId,
      contextVars: modelConfig.contextVars,
      hasGroundingConfig: (modelConfig as any).enableGoogleSearch
    };
    console.log('📤 [AI REQUEST] Text Generation:', requestLog);
    logAI('REQUEST', { type: 'Text Generation', ...requestLog, prompt });
    
    try {
      const genAI = getGoogleGenAI().getRawClient();
      
      const contents: any[] = [];
      if (modelConfig.systemInstruction) {
        contents.push({ text: modelConfig.systemInstruction });
      }
      contents.push({ text: prompt });
      
      // Configure tools
      const tools: any[] = [];
      if ((modelConfig as any).enableGoogleSearch) {
        tools.push({ googleSearch: {} });
      }
      
      // For @google/genai, use models.generateContent directly
      const result = await genAI.models.generateContent({
        model: modelConfig.model,
        contents,
        config: {
          temperature: modelConfig.temperature,
          maxTokens: modelConfig.maxOutputTokens,
          topP: modelConfig.topP,
          topK: modelConfig.topK,
          stopSequences: modelConfig.stopSequences,
          candidateCount: modelConfig.candidateCount,
          ...(tools.length > 0 ? { tools } : {})
        },
        systemInstruction: modelConfig.systemInstruction
      });
      
      const response = {
        text: result.text || '',
        usageMetadata: result.usage as any,
        finishReason: result.finishReason,
        safetyRatings: result.safetyRatings,
        groundingMetadata: result.groundingMetadata || result.candidates?.[0]?.groundingMetadata,
        groundingSources: (result.groundingMetadata?.groundingChunks || result.candidates?.[0]?.groundingMetadata?.groundingChunks)?.map((chunk: any) => ({
          title: chunk.web?.title || 'Unknown',
          uri: chunk.web?.uri || '',
          snippet: chunk.web?.snippet || ''
        })) || []
      };
      
      // DEBUG: Log grounding status
      if (response.groundingMetadata) {
        console.log('✅ [TextGeneration] Grounding metadata found');
      } else {
        console.log('❌ [TextGeneration] No grounding metadata - checking raw result structure');
        console.log('🔍 [TextGeneration] Result keys:', Object.keys(result));
        console.log('🔍 [TextGeneration] Raw result:', JSON.stringify(result, null, 2).substring(0, 500));
      }
      
      const responseLog = {
        textLength: response.text.length,
        textPreview: response.text.substring(0, 100) + '...',
        usageMetadata: response.usageMetadata,
        finishReason: response.finishReason,
        hasGroundingMetadata: !!response.groundingMetadata,
        groundingSourcesCount: response.groundingSources?.length || 0,
        workflowName: modelConfig.workflowName,
        stageName: modelConfig.stageName,
        stageId: modelConfig.stageId,
        model: modelConfig.model
      };
      console.log('📥 [AI RESPONSE] Text Generation:', responseLog);
      logAI('RESPONSE', { type: 'Text Generation', ...responseLog, fullText: response.text });
      
      // 🔥 NEW: Use enhanced logging for grounding data
      if (response.groundingMetadata) {
        const { logGroundingMetadata } = await import('@/lib/ai-logger');
        logGroundingMetadata(response.groundingMetadata);
      }
      
      if (response.groundingSources && response.groundingSources.length > 0) {
        const { logGroundingSources } = await import('@/lib/ai-logger');
        logGroundingSources(response.groundingSources);
      }
      
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
    const streamRequestLog = {
      model: modelConfig.model,
      promptLength: prompt.length,
      temperature: modelConfig.temperature,
      systemInstruction: modelConfig.systemInstruction?.substring(0, 100) + '...'
    };
    console.log('📤 [AI REQUEST] Text Generation Stream:', streamRequestLog);
    logAI('REQUEST', { type: 'Text Generation Stream', ...streamRequestLog, prompt: prompt.substring(0, 500) });
    
    try {
      const genAI = getGoogleGenAI().getRawClient();
      
      const contents: any[] = [];
      if (modelConfig.systemInstruction) {
        contents.push({ text: modelConfig.systemInstruction });
      }
      contents.push({ text: prompt });
      
      // Configure tools
      const tools: any[] = [];
      if ((modelConfig as any).enableGoogleSearch) {
        tools.push({ googleSearch: {} });
      }
      
      // For @google/genai, use models.generateContentStream directly
      const result = await genAI.models.generateContentStream({
        model: modelConfig.model,
        contents,
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