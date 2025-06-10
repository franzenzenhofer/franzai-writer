'use server';

/**
 * @fileOverview Implements AI-powered content generation through prompt templates.
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
  model: z.string().describe('The AI model to use for content generation.'),
  temperature: z.number().describe('The temperature to use for content generation.'),
});
export type AiStageExecutionInput = z.infer<typeof AiStageExecutionInputSchema>;

const AiStageExecutionOutputSchema = z.object({
  content: z.string().describe('The AI-generated content.'),
});
export type AiStageExecutionOutput = z.infer<typeof AiStageExecutionOutputSchema>;

export async function aiStageExecution(input: AiStageExecutionInput): Promise<AiStageExecutionOutput> {
  return aiStageExecutionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiStageExecutionPrompt',
  input: {schema: AiStageExecutionInputSchema},
  output: {schema: AiStageExecutionOutputSchema},
  prompt: `{{promptTemplate}}`,
});

const aiStageExecutionFlow = ai.defineFlow(
  {
    name: 'aiStageExecutionFlow',
    inputSchema: AiStageExecutionInputSchema,
    outputSchema: AiStageExecutionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
