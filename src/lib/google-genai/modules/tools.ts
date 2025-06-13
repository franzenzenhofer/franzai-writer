/**
 * Tools Module
 * Handles function calling and tool definitions
 */

import { getGoogleGenAI } from '../core';
import type { FunctionDeclaration, Tool } from '../types';

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

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
}

export interface FunctionCall {
  name: string;
  args: any;
}

export interface ToolResponse {
  text: string;
  functionCalls?: FunctionCall[];
  usageMetadata?: any;
}

export class ToolsModule {
  /**
   * Convert tool definition to Google format
   */
  static convertToGoogleFormat(tool: ToolDefinition): FunctionDeclaration {
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
      if (!prop || typeof prop !== 'object') {
        return { type: SchemaType.STRING };
      }

      const result: any = {
        type: convertType(prop.type || 'string')
      };

      if (prop.description) result.description = prop.description;
      if (prop.enum) result.enum = prop.enum;
      
      if (prop.type === 'array' && prop.items) {
        result.items = convertProperty(prop.items);
      }
      
      if (prop.type === 'object' && prop.properties) {
        result.properties = Object.entries(prop.properties).reduce((acc, [key, value]) => {
          acc[key] = convertProperty(value);
          return acc;
        }, {} as any);
        if (prop.required) result.required = prop.required;
      }

      return result;
    };

    return {
      name: tool.name,
      description: tool.description,
      parameters: {
        type: SchemaType.OBJECT,
        properties: Object.entries(tool.parameters.properties).reduce((acc, [key, value]) => {
          acc[key] = convertProperty(value);
          return acc;
        }, {} as any),
        required: tool.parameters.required || []
      }
    };
  }

  /**
   * Execute function calling
   */
  static async callWithTools(
    prompt: string,
    tools: ToolDefinition[],
    modelConfig: ModelConfig = { model: 'gemini-2.0-flash' }
  ): Promise<ToolResponse> {
    try {
      const genAI = getGoogleGenAI().getRawClient();
      const functionDeclarations = tools.map(tool => this.convertToGoogleFormat(tool));
      
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
          tools: [{
            functionDeclarations
          }]
        }
      });
      // result is the response for @google/genai
      
      // Extract function calls
      const functionCalls: FunctionCall[] = [];
      const candidates = result.candidates || [];
      
      for (const candidate of candidates) {
        const parts = candidate.content?.parts || [];
        for (const part of parts) {
          if (part.functionCall) {
            functionCalls.push({
              name: part.functionCall.name || '',
              args: part.functionCall.args
            });
          }
        }
      }

      return {
        text: result.text || '',
        functionCalls: functionCalls.length > 0 ? functionCalls : undefined,
        usageMetadata: result.usageMetadata
      };
    } catch (error) {
      console.error('Tool calling error:', error);
      throw error;
    }
  }

  /**
   * Execute function and send response back to model
   */
  static async executeAndRespond(
    prompt: string,
    tools: ToolDefinition[],
    toolHandlers: Record<string, (args: any) => Promise<any>>,
    modelConfig: ModelConfig = { model: 'gemini-2.0-flash' }
  ): Promise<string> {
    try {
      // First, get the function calls
      const initialResponse = await this.callWithTools(prompt, tools, modelConfig);
      
      if (!initialResponse.functionCalls || initialResponse.functionCalls.length === 0) {
        return initialResponse.text;
      }

      // Execute the function calls
      const functionResponses: any[] = [];
      for (const call of initialResponse.functionCalls) {
        const handler = toolHandlers[call.name];
        if (handler) {
          try {
            const result = await handler(call.args);
            functionResponses.push({
              name: call.name,
              response: result
            });
          } catch (error) {
            functionResponses.push({
              name: call.name,
              response: { error: (error as Error).message }
            });
          }
        }
      }

      // Send function responses back to the model
      const genAI = getGoogleGenAI();
      const model = genAI.getModel(modelConfig.model);
      
      const contents = [
        { role: 'user', parts: [{ text: prompt }] },
        { 
          role: 'model', 
          parts: initialResponse.functionCalls.map(call => ({
            functionCall: call
          }))
        },
        {
          role: 'function',
          parts: functionResponses.map(resp => ({
            functionResponse: {
              name: resp.name,
              response: resp.response
            }
          }))
        }
      ];

      const finalResult = await model.generateContent({ contents });
      const finalResponse = await finalResult.response;
      
      return finalResponse.text();
    } catch (error) {
      console.error('Tool execution error:', error);
      throw error;
    }
  }

  /**
   * Create a tool definition helper
   */
  static createTool(
    name: string,
    description: string,
    parameters: Record<string, any>,
    required?: string[]
  ): ToolDefinition {
    return {
      name,
      description,
      parameters: {
        type: 'object',
        properties: parameters,
        required
      }
    };
  }
}