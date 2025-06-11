'use server';

import {ai} from '@/ai/genkit';
import {z} from 'zod'; // Use standard zod instead of genkit's z

// Input Schema including chat and system instructions
const AiStageExecutionInputSchema = z.object({
  promptTemplate: z.string().describe('The template used to generate the prompt for the AI model.'),
  model: z.string().optional().describe('The AI model to use for content generation.'),
  temperature: z.number().optional().describe('The temperature for content generation.'),
  imageData: z.object({
    fileName: z.string(),
    mimeType: z.string(),
    data: z.string(), // Base64 encoded
  }).optional(),
  thinkingSettings: z.object({
    enabled: z.boolean().optional().default(false),
  }).optional(),
  toolNames: z.array(z.string()).optional(),
  fileInputs: z.array(z.object({
    uri: z.string(),
    mimeType: z.string(),
  })).optional(),
  systemInstructions: z.string().optional(),
  chatHistory: z.array(z.object({
    role: z.enum(['user', 'model', 'system']), // System role for history if needed
    parts: z.array(z.any()), // text, inlineData, fileData parts
  })).optional(),
});
export type AiStageExecutionInput = z.infer<typeof AiStageExecutionInputSchema>;

// Structured Thinking Steps
const ToolCallRequestSchema = z.object({ type: z.literal('toolRequest'), toolName: z.string(), input: z.any() });
const CodeInterpreterOutputSchema = z.object({ // Example for a specific tool's structured output
  stdout: z.string().optional(),
  stderr: z.string().optional(),
  result: z.string().optional(),
  outputFiles: z.array(z.object({ name: z.string(), uri: z.string().optional(), base64Data: z.string().optional(), mimeType: z.string().optional() })).optional(),
});
const ToolCallResponseSchema = z.object({ type: z.literal('toolResponse'), toolName: z.string(), output: z.any() });
const TextLogSchema = z.object({ type: z.literal('textLog'), message: z.string() });
const ThinkingStepSchema = z.union([ToolCallRequestSchema, ToolCallResponseSchema, TextLogSchema]);
export type ThinkingStep = z.infer<typeof ThinkingStepSchema>;

// Output Schema including updated history and images
const AiStageOutputSchema = z.object({
  content: z.string().describe('Final accumulated response if streaming, or direct response.'),
  thinkingSteps: z.array(ThinkingStepSchema).optional(),
  outputImages: z.array(z.object({ name: z.string().optional(), base64Data: z.string(), mimeType: z.string() })).optional(),
  updatedChatHistory: z.array(z.object({ role: z.enum(['user', 'model', 'system']), parts: z.array(z.any()) })).optional(),
});
export type AiStageOutputSchema = z.infer<typeof AiStageOutputSchema>;

// Define the main AI stage execution flow - this is the only function needed
export const aiStageExecutionFlow = ai.defineFlow(
  {
    name: 'aiStageExecutionFlow',
    inputSchema: AiStageExecutionInputSchema,
    outputSchema: AiStageOutputSchema,
  },
  async (input, streamingCallback): Promise<AiStageOutputSchema> => {
    const {
        promptTemplate, model, temperature, imageData,
        thinkingSettings, toolNames, fileInputs,
        systemInstructions, chatHistory
    } = input;

    // Simplify by not loading tools dynamically to avoid getStore issues
    // Tools can be added back later once context issues are resolved
    let currentThinkingSteps: ThinkingStep[] = [];
    let accumulatedContent = "";
    let finalOutputImages: AiStageOutputSchema['outputImages'] = [];

    const currentPromptMessageParts: any[] = [];
    if (promptTemplate) currentPromptMessageParts.push({ text: promptTemplate });
    if (imageData?.data) currentPromptMessageParts.push({ inlineData: { mimeType: imageData.mimeType, data: imageData.data } });
    if (fileInputs?.length) fileInputs.forEach(file => currentPromptMessageParts.push({ fileData: { uri: file.uri, mimeType: file.mimeType } }));

    let callHistory = chatHistory ? [...chatHistory] : [];
    if (currentPromptMessageParts.length > 0) {
        callHistory.push({ role: 'user', parts: currentPromptMessageParts });
    }

    // System instructions handling:
    if (systemInstructions) {
        if (callHistory.length > 0 && callHistory[0].role === 'system') {
            callHistory[0] = { role: 'system', parts: [{ text: systemInstructions }] }; // Replace if exists
        } else {
            callHistory.unshift({ role: 'system', parts: [{ text: systemInstructions }] }); // Prepend
        }
    }

    // Use the correct Genkit API with ai.generate() method
    const generateOptions: any = {
        prompt: promptTemplate,
        model: model, // Pass the model string directly - Genkit will resolve it
        config: {
            ...(temperature !== undefined ? { temperature } : {})
        }
    };

    console.log(`[AI Stage Flow] Generating with options:`, JSON.stringify(generateOptions, null, 2));
    
    try {
        // Use ai.generate() method which has access to the configured registry
        const response = await ai.generate(generateOptions);
        accumulatedContent = response.text || '';
        
        // Add the final model response to history
        if (accumulatedContent) {
            callHistory.push({ role: 'model', parts: [{ text: accumulatedContent }] });
        }

        currentThinkingSteps.push({ type: 'textLog', message: "Response generated successfully." });
        if (streamingCallback) {
            streamingCallback({ 
                chunk: accumulatedContent, 
                currentTurnContent: accumulatedContent, 
                thinkingSteps: currentThinkingSteps, 
                outputImages: finalOutputImages, 
                updatedChatHistory: callHistory 
            });
        }

        return { 
            content: accumulatedContent, 
            thinkingSteps: currentThinkingSteps, 
            outputImages: finalOutputImages?.length ? finalOutputImages : undefined, 
            updatedChatHistory: callHistory 
        };
    } catch (error) {
        console.error('[AI Stage Flow] Generation failed:', error);
        throw error;
    }
  }
);

// Export for compatibility
export { aiStageExecutionFlow as aiStageExecution };
