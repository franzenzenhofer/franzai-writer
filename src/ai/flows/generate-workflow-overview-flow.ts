'use server';
/**
 * @fileOverview Generates an overview of a given workflow.
 *
 * - generateWorkflowOverview - A function that handles the workflow overview generation.
 * - GenerateWorkflowOverviewInput - The input type for the generateWorkflowOverview function.
 * - GenerateWorkflowOverviewOutput - The return type for the generateWorkflowOverview function.
 */

import { StructuredOutputModule } from '@/lib/google-genai';
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
  console.log('[generateWorkflowOverview] STEP 1: Function called at', new Date().toISOString());
  console.log('[generateWorkflowOverview] STEP 2: Input received:', JSON.stringify(input, null, 2));
  
  try {
    console.log('[generateWorkflowOverview] STEP 3: Generating workflow overview with @google/genai...');
    const startTime = Date.now();
    
    // Build the prompt from the template
    const prompt = buildPrompt(input);
    
    // Use StructuredOutputModule to generate JSON response
    const result = await StructuredOutputModule.generateJSON<GenerateWorkflowOverviewOutput>(
      prompt,
      {
        type: 'object',
        properties: {
          overview: {
            type: 'string',
            description: 'A concise, engaging summary of what this workflow typically produces and its key benefits or purpose. Should be 1-2 paragraphs long, formatted as Markdown.'
          }
        },
        required: ['overview']
      },
      {
        model: 'gemini-2.0-flash',
        temperature: 0.7
      }
    );
    
    const endTime = Date.now();
    console.log('[generateWorkflowOverview] STEP 4: Generation completed in', endTime - startTime, 'ms');
    console.log('[generateWorkflowOverview] STEP 5: Result:', JSON.stringify(result, null, 2));
    
    return result;
  } catch (error) {
    console.error('[generateWorkflowOverview] ERROR:', error);
    console.error('[generateWorkflowOverview] Error stack:', error instanceof Error ? error.stack : 'No stack');
    throw error;
  }
}

function buildPrompt(input: GenerateWorkflowOverviewInput): string {
  let prompt = `You are an expert technical writer tasked with creating a compelling overview for a software workflow.
Based on the following workflow details, generate a concise and engaging summary (1-2 paragraphs, formatted as Markdown) of what this workflow typically produces and its key benefits or purpose.
Focus on the end result and value for the user. Make it sound appealing and useful.

Workflow Name: ${input.workflowName}
Workflow Description: ${input.workflowDescription}

`;

  if (input.finalOutputStageTitle) {
    prompt += `The workflow culminates in the '${input.finalOutputStageTitle}' stage, which typically delivers the primary output.\n\n`;
  }

  prompt += `Here's a brief look at the stages involved:\n`;
  
  for (const stage of input.stages) {
    prompt += `- ${stage.title}: ${stage.description}\n`;
  }
  
  prompt += `\nPlease provide the Markdown summary.`;
  
  return prompt;
}

