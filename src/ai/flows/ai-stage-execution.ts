
'use server';

/**
 * @fileOverview Implements AI-powered content generation through prompt templates,
 * allowing for stage-specific model and temperature settings.
 *
 * - aiStageExecution - A function that handles the AI-powered content generation.
 * - AiStageExecutionInput - The input type for the aiStageExecution function.
 * - AiStageExecutionOutput - The return type for the aiStageExecution function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiStageExecutionInputSchema = z.object({
  promptTemplate: z
    .string()
    .describe('The template used to generate the prompt for the AI model.'),
  model: z.string().optional().describe('The AI model to use for content generation. If undefined, Genkit default is used.'),
  temperature: z.number().optional().describe('The temperature to use for content generation. If undefined, model default is used.'),
});
export type AiStageExecutionInput = z.infer<typeof AiStageExecutionInputSchema>;

const AiStageOutputSchema = z.object({
  content: z.string().describe('The AI-generated content.'),
});
export type AiStageExecutionOutput = z.infer<typeof AiStageOutputSchema>;

export async function aiStageExecution(input: AiStageExecutionInput): Promise<AiStageExecutionOutput> {
  try {
    console.log('[AI Stage] Starting execution with input:', input);
    const result = await aiStageExecutionFlow(input);
    console.log('[AI Stage] Execution successful');
    return result;
  } catch (error) {
    console.error('[AI Stage] Execution failed:', error);
    throw error;
  }
}

const aiStageExecutionFlow = ai.defineFlow(
  {
    name: 'aiStageExecutionFlow',
    inputSchema: AiStageExecutionInputSchema,
    outputSchema: AiStageOutputSchema,
  },
  async (input) => {
    const generateOptions: {
        prompt: string;
        model?: string;
        config?: { temperature?: number };
    } = {
        prompt: input.promptTemplate,
    };

    if (input.model) {
        generateOptions.model = input.model;
    }
    if (input.temperature !== undefined) {
        generateOptions.config = { ...generateOptions.config, temperature: input.temperature };
    }

    const response = await ai.generate(generateOptions);
    
    const content = response.text;
    if (content === undefined) {
      throw new Error('AI generation returned no content.');
    }
    return { content };
  }
);
