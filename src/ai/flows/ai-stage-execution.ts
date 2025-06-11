'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit'; // Assuming Genkit's Zod is exported this way or from 'genkit/zod'

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


export async function aiStageExecution(input: AiStageExecutionInput): Promise<AiStageOutputSchema> {
  try {
    // The streamingCallback is implicitly passed by Genkit when a flow is defined with it.
    // For direct calls to this function (e.g. from tests not using the flow directly),
    // it might be undefined. This function might need to be refactored if called directly
    // without the flow context when streaming is expected.
    // For now, assume it's always called as a Genkit flow.
    // const result = await aiStageExecutionFlow(input, undefined); // This line is problematic
    // The actual execution happens via the flow definition below.
    // This exported function is more of a wrapper if needed, or could be removed if only flow is used.
    // For now, let's assume this function IS the flow logic for simplicity of a single file.
    // The 'defineFlow' wrapper will handle the streamingCallback injection.
     console.log('[AI Stage] Starting execution with input:', input);
     // Directly call the core logic, assuming this function itself is what gets wrapped by defineFlow.
     // This means removing the separate aiStageExecutionFlow variable if this is the primary export.
     // Or, ensure this function is NOT exported and only the flow is.
     // Let's assume the defineFlow wraps the logic within this async function directly.
     // This will be clarified when we define the flow.
     throw new Error("This function should not be called directly if it's meant to be wrapped by ai.defineFlow with a streaming callback. Call the flow instead.");

  } catch (error) {
    console.error('[AI Stage] Execution failed:', error);
    throw error;
  }
}

// Define the flow
export const aiStageExecutionFlow = ai.defineFlow(
  {
    name: 'aiStageExecutionFlow',
    inputSchema: AiStageExecutionInputSchema,
    outputSchema: AiStageOutputSchema,
    // No explicit streaming config here; it's enabled by using ai.stream()
  },
  async (input, streamingCallback): Promise<AiStageOutputSchema> => {
    const {
        promptTemplate, model, temperature, imageData,
        thinkingSettings, toolNames, fileInputs,
        systemInstructions, chatHistory
    } = input;

    const availableTools = await import('@/ai/tools/sample-tools').then(module => module.allTools);
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
    // Gemini API usually prefers system instructions either as the very first message in history
    // or as a dedicated 'system' parameter in the generation request.
    // Genkit's GoogleAI plugin might abstract this. If it expects it in history:
    if (systemInstructions) {
        if (callHistory.length > 0 && callHistory[0].role === 'system') {
            callHistory[0] = { role: 'system', parts: [{ text: systemInstructions }] }; // Replace if exists
        } else {
            callHistory.unshift({ role: 'system', parts: [{ text: systemInstructions }] }); // Prepend
        }
    }

    const toolsToUse = toolNames ? availableTools.filter(t => toolNames.includes(t.name)) : [];
    const maxLoops = 5;
    let currentLoop = 0;

    while (currentLoop < maxLoops) {
      currentLoop++;
      let modelResponseAccumulatedParts: any[] = []; // Parts for the current model response message

      const generateOptions: any = {
        history: callHistory,
        model: model || undefined, // Use default from genkit.ts if not set
        config: { temperature: temperature !== undefined ? temperature : undefined },
        tools: toolsToUse.length > 0 ? toolsToUse : undefined,
        // System instructions might be passed here if the plugin supports it, e.g.:
        // ...(systemInstructions && { systemInstruction: { parts: [{ text: systemInstructions }] } })
      };
      if (!generateOptions.config.temperature) delete generateOptions.config.temperature;
      if (Object.keys(generateOptions.config).length === 0) delete generateOptions.config;

      console.log(`[AI Stage Flow Loop ${currentLoop}] Streaming with options:`, JSON.stringify(generateOptions, null, 2));
      const stream = await ai.stream(generateOptions);
      let hadToolRequestInTurn = false;

      for await (const chunk of stream) {
        if (chunk.content) {
          accumulatedContent += chunk.content;
          modelResponseAccumulatedParts.push({ text: chunk.content });
          if (streamingCallback) {
            streamingCallback({ chunk: chunk.content, currentTurnContent: accumulatedContent, thinkingSteps: currentThinkingSteps, outputImages: finalOutputImages, updatedChatHistory: callHistory });
          }
        }
        if (chunk.toolRequests && chunk.toolRequests.length > 0) {
          hadToolRequestInTurn = true;
          currentThinkingSteps.push(...chunk.toolRequests.map(tr => ({ type: 'toolRequest' as const, toolName: tr.name, input: tr.input })));
          if (streamingCallback) streamingCallback({ thinkingSteps: currentThinkingSteps, currentTurnContent: accumulatedContent });

          const toolResponses = await Promise.all(
            chunk.toolRequests.map(async (toolRequest) => {
              const tool = toolsToUse.find(t => t.name === toolRequest.name);
              let toolOutputData: any;
              if (!tool) {
                toolOutputData = { error: `Tool ${toolRequest.name} not found or not allowed.` };
              } else {
                try {
                  toolOutputData = await tool.fn(toolRequest.input);
                  if (tool.name === 'codeInterpreter' && (toolOutputData as any).outputFiles) {
                    (toolOutputData as any).outputFiles.forEach((file: any) => {
                      if (file.base64Data && file.mimeType?.startsWith('image/')) {
                        if(!finalOutputImages) finalOutputImages = [];
                        const existingImg = finalOutputImages.find(img => img.name === file.name && img.base64Data.length === file.base64Data.length);
                        if (!existingImg) finalOutputImages.push({ name: file.name, base64Data: file.base64Data, mimeType: file.mimeType });
                      }
                    });
                    if (streamingCallback && finalOutputImages?.length) streamingCallback({ outputImages: finalOutputImages });
                  }
                } catch (e: any) {
                  toolOutputData = { error: e.message };
                }
              }
              currentThinkingSteps.push({ type: 'toolResponse' as const, toolName: toolRequest.name, output: toolOutputData });
              if (streamingCallback) streamingCallback({ thinkingSteps: currentThinkingSteps });
              return { tool_request_id: toolRequest.ref!, output: toolOutputData };
            })
          );
          if (modelResponseAccumulatedParts.length > 0) { // Add any text model said before calling tools
            callHistory.push({ role: 'model', parts: modelResponseAccumulatedParts });
            modelResponseAccumulatedParts = [];
          }
          callHistory.push({ role: 'user', parts: toolResponses.map(tr => ({tool_response: tr})) });
          accumulatedContent = ""; // Reset for next model response
        }
      } // End of stream chunks for one turn

      if (modelResponseAccumulatedParts.length > 0) { // Add the last model message from the stream
         callHistory.push({ role: 'model', parts: modelResponseAccumulatedParts });
      }

      if (!hadToolRequestInTurn) { // If this turn didn't involve any tool calls, it's the final answer
        currentThinkingSteps.push({ type: 'textLog', message: "Final response received." });
        if (streamingCallback) streamingCallback({ thinkingSteps: currentThinkingSteps });

        // Aggregate images from all thinkingSteps (in case multiple tool calls produced images)
        finalOutputImages = currentThinkingSteps.reduce((acc: AiStageOutputSchema['outputImages'], step) => {
            acc = acc || [];
            if (step.type === 'toolResponse' && step.toolName === 'codeInterpreter' && (step.output as any).outputFiles) {
                (step.output as any).outputFiles.forEach((file: any) => {
                    if (file.base64Data && file.mimeType?.startsWith('image/')) {
                        const existing = acc!.find(img => img.name === file.name && img.base64Data.length === file.base64Data.length);
                        if (!existing) acc!.push({ name: file.name, base64Data: file.base64Data, mimeType: file.mimeType });
                    }
                });
            }
            return acc;
        }, finalOutputImages || []);

        return { content: accumulatedContent, thinkingSteps: currentThinkingSteps, outputImages: finalOutputImages.length > 0 ? finalOutputImages : undefined, updatedChatHistory: callHistory };
      }
      // If there was a tool request, loop continues
      if (currentLoop >= maxLoops) break; // Safety break if loop somehow didn't exit
    } // End of while loop

    currentThinkingSteps.push({ type: 'textLog', message: "Reached max iterations for tool calls or loop ended unexpectedly."});
    const lastModelResponse = callHistory.filter(m => m.role === 'model').pop();
    const finalContent = lastModelResponse?.parts?.find((p:any) => p.text)?.text || accumulatedContent || "Max tool call iterations reached. No final text answer.";
    
    finalOutputImages = currentThinkingSteps.reduce((acc: AiStageOutputSchema['outputImages'], step) => {
        acc = acc || [];
        if (step.type === 'toolResponse' && step.toolName === 'codeInterpreter' && (step.output as any).outputFiles) {
            (step.output as any).outputFiles.forEach((file: any) => {
                 if (file.base64Data && file.mimeType?.startsWith('image/')) {
                    const existing = acc!.find(img => img.name === file.name && img.base64Data.length === file.base64Data.length);
                    if (!existing) acc!.push({ name: file.name, base64Data: file.base64Data, mimeType: file.mimeType });
                }
            });
        }
        return acc;
    }, finalOutputImages || []);

    return {
        content: finalContent,
        thinkingSteps: currentThinkingSteps,
        outputImages: finalOutputImages.length > 0 ? finalOutputImages : undefined,
        updatedChatHistory: callHistory,
    };
  }
);

// Remove the direct export of aiStageExecution if it's only meant to be used via the flow.
// export { aiStageExecution }; // Comment out or remove if only flow is entry point.
// Keeping it for now as it might be used by tests directly, but ideally tests should target the flow.
// For the purpose of this refactoring, we assume aiStageExecutionFlow is the primary export.
// The direct export of `async function aiStageExecution` is removed.
// The `aiStageExecutionFlow` is the main export for this functionality.
