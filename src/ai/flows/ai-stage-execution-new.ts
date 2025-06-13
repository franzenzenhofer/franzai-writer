/**
 * AI Stage Execution - New Implementation
 * Uses native Google Generative AI SDK instead of Genkit
 */

'use server';

import { z } from 'zod';
import { AIStageExecution } from '@/lib/google-genai';
import type { Workflow, Stage, StageInput, StageContext } from '@/types';

// Input Schema
const AiStageExecutionInputSchema = z.object({
  workflow: z.any(), // Workflow object
  stage: z.any(), // Stage object
  input: z.object({
    text: z.string().optional(),
    files: z.array(z.any()).optional(),
  }),
  context: z.record(z.string(), z.any()),
});

export type AiStageExecutionInput = z.infer<typeof AiStageExecutionInputSchema>;

// Output Schema
const AiStageExecutionOutputSchema = z.object({
  output: z.object({
    text: z.string(),
    markdown: z.string().optional(),
    json: z.any().optional(),
  }),
  error: z.string().optional(),
  usage: z.object({
    promptTokens: z.number(),
    completionTokens: z.number(),
    totalTokens: z.number(),
  }).optional(),
});

export type AiStageExecutionOutput = z.infer<typeof AiStageExecutionOutputSchema>;

/**
 * Execute AI stage with new SDK
 */
export async function executeAIStage(
  input: AiStageExecutionInput
): Promise<AiStageExecutionOutput> {
  try {
    const { workflow, stage, input: stageInput, context } = input;
    
    // Execute using new SDK
    const result = await AIStageExecution.execute(
      workflow as Workflow,
      stage as Stage,
      stageInput as StageInput,
      context as StageContext
    );
    
    return {
      output: result.output,
      error: result.error,
      usage: result.usage
    };
  } catch (error) {
    console.error('AI Stage execution error:', error);
    return {
      output: { text: '' },
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Stream AI stage execution
 */
export async function* streamAIStage(
  input: AiStageExecutionInput
): AsyncGenerator<string, void, unknown> {
  try {
    const { workflow, stage, input: stageInput, context } = input;
    
    // Stream using new SDK
    const stream = AIStageExecution.stream(
      workflow as Workflow,
      stage as Stage,
      stageInput as StageInput,
      context as StageContext
    );
    
    for await (const chunk of stream) {
      yield chunk;
    }
  } catch (error) {
    console.error('AI Stage streaming error:', error);
    yield `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`;
  }
}