/**
 * AI Stage Execution with Native Google Generative AI SDK
 * Replaces Genkit-based implementation
 */

import { TextGenerationModule } from './modules/text-generation';
import { StructuredOutputModule } from './modules/structured-output';
import { ToolsModule } from './modules/tools';
import type { 
  Workflow, 
  Stage, 
  StageInput, 
  StageOutput,
  StageContext 
} from '@/types';

// Define SchemaType enum for @google/genai
enum SchemaType {
  STRING = 'string',
  NUMBER = 'number',
  INTEGER = 'integer',
  BOOLEAN = 'boolean',
  ARRAY = 'array',
  OBJECT = 'object'
}

export interface ExecutionResult {
  output: StageOutput;
  error?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export class AIStageExecution {
  /**
   * Execute a workflow stage
   */
  static async execute(
    workflow: Workflow,
    stage: Stage,
    input: StageInput,
    context: StageContext
  ): Promise<ExecutionResult> {
    try {
      // Prepare the prompt
      const prompt = this.buildPrompt(stage, input, context);
      
      // Configure model
      const modelConfig = {
        model: stage.model || workflow.defaultModel || 'gemini-2.0-flash',
        temperature: stage.temperature ?? workflow.temperature ?? 0.7,
        maxOutputTokens: stage.maxTokens || 8192,
        systemInstruction: stage.systemInstruction
      };

      let result: any;
      let usage: any;

      // Handle different output types
      switch (stage.outputType) {
        case 'json':
          // Use structured output for JSON
          const schema = this.buildJsonSchema(stage);
          result = await StructuredOutputModule.generateJSON(
            prompt,
            schema,
            modelConfig
          );
          break;

        case 'markdown':
        case 'text':
        default:
          // Use regular text generation
          const response = await TextGenerationModule.generate(prompt, modelConfig);
          result = response.text;
          usage = response.usageMetadata;
          break;
      }

      // Handle tool usage if specified
      if (stage.tools && stage.tools.length > 0) {
        const toolResult = await this.executeWithTools(
          prompt,
          stage.tools,
          modelConfig
        );
        result = toolResult.text;
        usage = toolResult.usageMetadata;
      }

      // Process the output
      const output = this.processOutput(result, stage.outputType);

      return {
        output,
        usage: usage ? {
          promptTokens: usage.promptTokenCount || 0,
          completionTokens: usage.candidatesTokenCount || 0,
          totalTokens: usage.totalTokenCount || 0
        } : undefined
      };

    } catch (error) {
      console.error('AI Stage Execution Error:', error);
      return {
        output: { text: '' },
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Build prompt from stage configuration
   */
  private static buildPrompt(
    stage: Stage,
    input: StageInput,
    context: StageContext
  ): string {
    let prompt = stage.prompt || stage.promptTemplate || '';

    // Replace placeholders
    if (context) {
      Object.entries(context).forEach(([key, value]) => {
        const placeholder = `{{${key}}}`;
        if (typeof value === 'string') {
          prompt = prompt.replace(new RegExp(placeholder, 'g'), value);
        } else if (typeof value === 'object' && value !== null) {
          // Handle nested context values
          if ('output' in value && typeof value.output === 'string') {
            prompt = prompt.replace(new RegExp(placeholder + '.output', 'g'), value.output);
          }
          if ('userInput' in value && typeof value.userInput === 'string') {
            prompt = prompt.replace(new RegExp(placeholder + '.userInput', 'g'), value.userInput);
          }
        }
      });
    }

    // Add user input if applicable
    if (stage.inputType !== 'none' && input.text) {
      prompt = prompt.replace(/{{userInput}}/g, input.text);
    }

    return prompt;
  }

  /**
   * Build JSON schema from stage configuration
   */
  private static buildJsonSchema(stage: Stage): any {
    // If stage has explicit schema, use it
    if (stage.jsonSchema) {
      return stage.jsonSchema;
    }

    // Otherwise, build a simple schema
    return {
      type: SchemaType.OBJECT,
      properties: {
        content: { type: SchemaType.STRING }
      }
    };
  }

  /**
   * Execute with tools/functions
   */
  private static async executeWithTools(
    prompt: string,
    tools: any[],
    modelConfig: any
  ): Promise<any> {
    // Convert tools to proper format
    const toolDefinitions = tools.map(tool => ({
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters
    }));

    const result = await ToolsModule.callWithTools(
      prompt,
      toolDefinitions,
      modelConfig
    );

    return result;
  }

  /**
   * Process output based on type
   */
  private static processOutput(
    result: any,
    outputType: string = 'text'
  ): StageOutput {
    switch (outputType) {
      case 'json':
        return {
          json: result,
          text: JSON.stringify(result, null, 2)
        };
      
      case 'markdown':
        return {
          markdown: result,
          text: result
        };
      
      default:
        return {
          text: result
        };
    }
  }

  /**
   * Stream generation for a stage
   */
  static async *stream(
    workflow: Workflow,
    stage: Stage,
    input: StageInput,
    context: StageContext
  ): AsyncGenerator<string, void, unknown> {
    const prompt = this.buildPrompt(stage, input, context);
    
    const modelConfig = {
      model: stage.model || workflow.defaultModel || 'gemini-2.0-flash',
      temperature: stage.temperature ?? workflow.temperature ?? 0.7,
      maxOutputTokens: stage.maxTokens || 8192,
      systemInstruction: stage.systemInstruction
    };

    const chunks: string[] = [];
    
    await TextGenerationModule.generateStream(
      prompt,
      modelConfig,
      {
        onChunk: (chunk) => {
          chunks.push(chunk);
        }
      }
    );

    for (const chunk of chunks) {
      yield chunk;
    }
  }
}