/**
 * Structured Output Module
 * Handles JSON schema-based generation
 */

import { getGoogleGenAI } from '../core';
import { logAI } from '@/lib/ai-logger';
// Define SchemaType enum for @google/genai
enum SchemaType {
  STRING = 'string',
  NUMBER = 'number',
  INTEGER = 'integer',
  BOOLEAN = 'boolean',
  ARRAY = 'array',
  OBJECT = 'object'
}
import type { ModelConfig } from '../types';

export class StructuredOutputModule {
  /**
   * Generate structured JSON output based on schema
   */
  static async generateJSON<T = any>(
    prompt: string,
    schema: any,
    modelConfig: ModelConfig = { model: 'gemini-2.0-flash' }
  ): Promise<T> {
    const structuredRequestLog = {
      model: modelConfig.model,
      promptLength: prompt.length,
      temperature: modelConfig.temperature,
      schema: JSON.stringify(schema).substring(0, 100) + '...',
      systemInstruction: modelConfig.systemInstruction?.substring(0, 100) + '...'
    };
    console.log('📤 [AI REQUEST] Structured JSON Generation:', structuredRequestLog);
    logAI('REQUEST', { type: 'Structured JSON Generation', ...structuredRequestLog, prompt: prompt.substring(0, 500), fullSchema: schema });
    
    try {
      const genAI = getGoogleGenAI().getRawClient();
      
      const contents: any[] = [];
      if (modelConfig.systemInstruction) {
        contents.push({ text: modelConfig.systemInstruction });
      }
      contents.push({ text: prompt });
      
      const result = await genAI.models.generateContent({
        model: modelConfig.model,
        contents: prompt,
        config: {
          temperature: modelConfig.temperature,
          maxTokens: modelConfig.maxOutputTokens,
          topP: modelConfig.topP,
          topK: modelConfig.topK,
          responseMimeType: 'application/json',
          responseSchema: schema
        },
        systemInstruction: modelConfig.systemInstruction
      });
      
      const text = result.text || '';
      const parsed = JSON.parse(text) as T;
      
      const structuredResponseLog = {
        textLength: text.length,
        parsedKeys: Object.keys(parsed as any),
        preview: JSON.stringify(parsed).substring(0, 200) + '...'
      };
      console.log('📥 [AI RESPONSE] Structured JSON Generation:', structuredResponseLog);
      logAI('RESPONSE', { type: 'Structured JSON Generation', ...structuredResponseLog, fullResult: parsed });
      
      return parsed;
    } catch (error) {
      console.error('❌ [AI ERROR] Structured output generation failed:', error);
      throw error;
    }
  }

  /**
   * Generate structured JSON with streaming (returns complete JSON at end)
   */
  static async generateJSONStream<T = any>(
    prompt: string,
    schema: any,
    modelConfig: ModelConfig = { model: 'gemini-2.0-flash' },
    onProgress?: (partial: string) => void
  ): Promise<T> {
    const streamStructuredRequestLog = {
      model: modelConfig.model,
      promptLength: prompt.length,
      temperature: modelConfig.temperature,
      schema: JSON.stringify(schema).substring(0, 100) + '...',
      systemInstruction: modelConfig.systemInstruction?.substring(0, 100) + '...'
    };
    console.log('📤 [AI REQUEST] Structured JSON Stream:', streamStructuredRequestLog);
    logAI('REQUEST', { type: 'Structured JSON Stream', ...streamStructuredRequestLog, prompt: prompt.substring(0, 500), fullSchema: schema });
    
    try {
      const genAI = getGoogleGenAI().getRawClient();
      
      const contents: any[] = [];
      if (modelConfig.systemInstruction) {
        contents.push({ text: modelConfig.systemInstruction });
      }
      contents.push({ text: prompt });
      
      const result = await genAI.models.generateContentStream({
        model: modelConfig.model,
        contents: prompt,
        config: {
          temperature: modelConfig.temperature,
          maxTokens: modelConfig.maxOutputTokens,
          topP: modelConfig.topP,
          topK: modelConfig.topK,
          responseMimeType: 'application/json',
          responseSchema: schema
        },
        systemInstruction: modelConfig.systemInstruction
      });
      
      let fullText = '';
      for await (const chunk of result) {
        const chunkText = chunk.text || '';
        fullText += chunkText;
        if (onProgress) {
          onProgress(fullText);
        }
      }
      
      const parsed = JSON.parse(fullText) as T;
      
      const streamStructuredResponseLog = {
        fullTextLength: fullText.length,
        parsedKeys: Object.keys(parsed as any),
        preview: JSON.stringify(parsed).substring(0, 200) + '...'
      };
      console.log('📥 [AI RESPONSE] Structured JSON Stream Complete:', streamStructuredResponseLog);
      logAI('RESPONSE', { type: 'Structured JSON Stream', ...streamStructuredResponseLog, fullResult: parsed });
      
      return parsed;
    } catch (error) {
      console.error('❌ [AI ERROR] Structured output stream failed:', error);
      throw error;
    }
  }

  /**
   * Helper to convert simple schema to Google schema format
   */
  static createSchema(properties: Record<string, any>, required?: string[]): any {
    const convertType = (type: string): SchemaType => {
      const typeMap: Record<string, SchemaType> = {
        'string': SchemaType.STRING,
        'number': SchemaType.NUMBER,
        'integer': SchemaType.INTEGER,
        'boolean': SchemaType.BOOLEAN,
        'array': SchemaType.ARRAY,
        'object': SchemaType.OBJECT
      };
      return typeMap[type] || SchemaType.STRING;
    };

    const convertProperty = (prop: any): any => {
      if (prop.type === 'array' && prop.items) {
        return {
          type: SchemaType.ARRAY,
          items: convertProperty(prop.items)
        };
      }
      
      if (prop.type === 'object' && prop.properties) {
        return {
          type: SchemaType.OBJECT,
          properties: Object.entries(prop.properties).reduce((acc, [key, value]) => {
            acc[key] = convertProperty(value as any);
            return acc;
          }, {} as any),
          required: prop.required
        };
      }
      
      const result: any = {
        type: convertType(prop.type)
      };
      
      if (prop.description) result.description = prop.description;
      if (prop.enum) result.enum = prop.enum;
      if (prop.format) result.format = prop.format;
      
      return result;
    };

    return {
      type: SchemaType.OBJECT,
      properties: Object.entries(properties).reduce((acc, [key, value]) => {
        acc[key] = convertProperty(value);
        return acc;
      }, {} as any),
      required
    };
  }
}