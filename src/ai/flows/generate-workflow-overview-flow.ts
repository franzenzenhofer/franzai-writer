'use server';
/**
 * @fileOverview Generates an overview of a given workflow.
 *
 * - generateWorkflowOverview - A function that handles the workflow overview generation.
 * - GenerateWorkflowOverviewInput - The input type for the generateWorkflowOverview function.
 * - GenerateWorkflowOverviewOutput - The return type for the generateWorkflowOverview function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const StageInfoSchema = z.object({
  title: z.string().describe('The title of the stage.'),
  description: z.string().describe('The description of the stage.'),
});
export type StageInfo = z.infer<typeof StageInfoSchema>;

const GenerateWorkflowOverviewInputSchema = z.object({
  workflowName: z.string().describe('The name of the workflow.'),
  workflowDescription: z.string().describe('The description of the workflow.'),
  stages: z.array(StageInfoSchema).describe('A list of stages in the workflow, including their titles and descriptions.'),
  finalOutputStageTitle: z.string().optional().describe('The title of the stage that produces the final document output for the workflow. This is a key stage to highlight.')
});
export type GenerateWorkflowOverviewInput = z.infer<typeof GenerateWorkflowOverviewInputSchema>;

const GenerateWorkflowOverviewOutputSchema = z.object({
  overview: z.string().describe('A concise, engaging summary of what this workflow typically produces and its key benefits or purpose. Should be 1-2 paragraphs long, formatted as Markdown.'),
});
export type GenerateWorkflowOverviewOutput = z.infer<typeof GenerateWorkflowOverviewOutputSchema>;

export async function generateWorkflowOverview(input: GenerateWorkflowOverviewInput): Promise<GenerateWorkflowOverviewOutput> {
  return generateWorkflowOverviewFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateWorkflowOverviewPrompt',
  input: {schema: GenerateWorkflowOverviewInputSchema},
  output: {schema: GenerateWorkflowOverviewOutputSchema},
  prompt: `
You are an expert technical writer tasked with creating a compelling overview for a software workflow.
Based on the following workflow details, generate a concise and engaging summary (1-2 paragraphs, formatted as Markdown) of what this workflow typically produces and its key benefits or purpose.
Focus on the end result and value for the user. Make it sound appealing and useful.

Workflow Name: {{workflowName}}
Workflow Description: {{workflowDescription}}

{{#if finalOutputStageTitle}}
The workflow culminates in the '{{finalOutputStageTitle}}' stage, which typically delivers the primary output.
{{/if}}

Here's a brief look at the stages involved:
{{#each stages}}
- {{title}}: {{description}}
{{/each}}

Please provide the Markdown summary.
  `,
});

const generateWorkflowOverviewFlow = ai.defineFlow(
  {
    name: 'generateWorkflowOverviewFlow',
    inputSchema: GenerateWorkflowOverviewInputSchema,
    outputSchema: GenerateWorkflowOverviewOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

