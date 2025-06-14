/**
 * Structured Output Module
 * Handles JSON schema-based generation
 */

import { getGoogleGenAI } from '../core';
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
    try {
      const genAI = getGoogleGenAI().getRawClient();
      
      const contents: any[] = [];
      if (modelConfig.systemInstruction) {
        contents.push({ text: modelConfig.systemInstruction });
      }
      contents.push({ text: prompt });
      
      const model = genAI.getGenerativeModel({ 
        model: modelConfig.model,
        generationConfig: {
          temperature: modelConfig.temperature,
          maxOutputTokens: modelConfig.maxOutputTokens,
          topP: modelConfig.topP,
          topK: modelConfig.topK,
          responseMimeType: 'application/json',
          responseSchema: schema
        }
      });
      
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: contents }]
      });
      
      const response = result.response;
      const text = response.text() || '';
      
      return JSON.parse(text) as T;
    } catch (error) {
      console.error('Structured output generation error:', error);
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
    try {
      const genAI = getGoogleGenAI().getRawClient();
      
      const contents: any[] = [];
      if (modelConfig.systemInstruction) {
        contents.push({ text: modelConfig.systemInstruction });
      }
      contents.push({ text: prompt });
      
      const model = genAI.getGenerativeModel({ 
        model: modelConfig.model,
        generationConfig: {
          temperature: modelConfig.temperature,
          maxOutputTokens: modelConfig.maxOutputTokens,
          topP: modelConfig.topP,
          topK: modelConfig.topK,
          responseMimeType: 'application/json',
          responseSchema: schema
        }
      });
      
      const result = await model.generateContentStream({
        contents: [{ role: 'user', parts: contents }]
      });
      
      let fullText = '';
      for await (const chunk of result) {
        const chunkText = chunk.text || '';
        fullText += chunkText;
        if (onProgress) {
          onProgress(fullText);
        }
      }
      
      return JSON.parse(fullText) as T;
    } catch (error) {
      console.error('Structured output stream error:', error);
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