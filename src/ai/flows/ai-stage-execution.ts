'use server';

import {ai} from '@/ai/genkit';
import {z} from 'zod';

// Input Schema including all Gemini features
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
    thinkingBudget: z.number().optional(),
  }).optional(),
  toolNames: z.array(z.string()).optional(),
  fileInputs: z.array(z.object({
    uri: z.string(),
    mimeType: z.string(),
  })).optional(),
  systemInstructions: z.string().optional(),
  chatHistory: z.array(z.object({
    role: z.enum(['user', 'model', 'system']),
    parts: z.array(z.any()),
  })).optional(),
  groundingSettings: z.object({
    googleSearch: z.object({
      enabled: z.boolean(),
      dynamicThreshold: z.number().optional(),
    }).optional(),
    urlContext: z.object({
      enabled: z.boolean(),
      urls: z.array(z.string()),
    }).optional(),
  }).optional(),
  functionCallingMode: z.enum(['AUTO', 'ANY', 'NONE']).optional(),
  streamingSettings: z.object({
    enabled: z.boolean(),
    chunkSize: z.number().optional(),
  }).optional(),
});
export type AiStageExecutionInput = z.infer<typeof AiStageExecutionInputSchema>;

// Structured Thinking Steps
const ToolCallRequestSchema = z.object({ type: z.literal('toolRequest'), toolName: z.string(), input: z.any() });
const ToolCallResponseSchema = z.object({ type: z.literal('toolResponse'), toolName: z.string(), output: z.any() });
const TextLogSchema = z.object({ type: z.literal('textLog'), message: z.string() });
const ThinkingStepSchema = z.union([ToolCallRequestSchema, ToolCallResponseSchema, TextLogSchema]);
export type ThinkingStep = z.infer<typeof ThinkingStepSchema>;

// Output Schema including all response types
const AiStageOutputSchema = z.object({
  content: z.string().describe('Final accumulated response if streaming, or direct response.'),
  thinkingSteps: z.array(ThinkingStepSchema).optional(),
  outputImages: z.array(z.object({ name: z.string().optional(), base64Data: z.string(), mimeType: z.string() })).optional(),
  updatedChatHistory: z.array(z.object({ role: z.enum(['user', 'model', 'system']), parts: z.array(z.any()) })).optional(),
  groundingSources: z.array(z.object({
    type: z.enum(['search', 'url']),
    title: z.string(),
    url: z.string().optional(),
    snippet: z.string().optional(),
  })).optional(),
  functionCalls: z.array(z.object({
    toolName: z.string(),
    input: z.any(),
    output: z.any(),
    timestamp: z.string().optional(),
  })).optional(),
  codeExecutionResults: z.object({
    code: z.string(),
    stdout: z.string().optional(),
    stderr: z.string().optional(),
    images: z.array(z.object({
      name: z.string(),
      base64Data: z.string(),
      mimeType: z.string(),
    })).optional(),
  }).optional(),
});
export type AiStageOutputSchema = z.infer<typeof AiStageOutputSchema>;

// Enhanced AI stage execution flow with all Gemini features
export const aiStageExecutionFlow = ai.defineFlow(
  {
    name: 'aiStageExecutionFlow',
    inputSchema: AiStageExecutionInputSchema,
    outputSchema: AiStageOutputSchema,
  },
  async (input, streamingCallback): Promise<AiStageOutputSchema> => {
    let {
      promptTemplate, model, temperature, imageData,
      thinkingSettings, toolNames, fileInputs,
      systemInstructions, chatHistory, groundingSettings,
      functionCallingMode, streamingSettings
    } = input;

    console.log('[AI Stage Flow Enhanced] Starting with input:', {
      model: model || 'default',
      hasTools: !!(toolNames?.length),
      hasGrounding: !!(groundingSettings?.googleSearch?.enabled || groundingSettings?.urlContext?.enabled),
      hasThinking: thinkingSettings?.enabled,
      isStreaming: streamingSettings?.enabled,
    });

    // Initialize response tracking
    let currentThinkingSteps: ThinkingStep[] = [];
    let accumulatedContent = "";
    let finalOutputImages: AiStageOutputSchema['outputImages'] = [];
    let groundingSources: AiStageOutputSchema['groundingSources'] = [];
    let functionCalls: AiStageOutputSchema['functionCalls'] = [];
    let codeExecutionResults: AiStageOutputSchema['codeExecutionResults'];

    // Load tools if requested
    let availableTools: any[] = [];
    if (toolNames && toolNames.length > 0) {
      try {
        const { allTools } = await import('@/ai/tools/sample-tools');
        availableTools = allTools.filter(tool => toolNames.includes(tool.name));
        
        // Add code interpreter if requested
        if (toolNames.includes('codeInterpreter')) {
          // Code interpreter is a built-in tool, we'll handle it specially
          availableTools.push({
            name: 'codeInterpreter',
            description: 'Execute Python code and return results',
            // The actual implementation will be handled by Gemini
          });
        }
        
        console.log(`[AI Stage Flow Enhanced] Loaded ${availableTools.length} tools:`, availableTools.map(t => t.name));
      } catch (error) {
        console.error('[AI Stage Flow Enhanced] Failed to load tools:', error);
      }
    }

    // Handle URL grounding if enabled
    if (groundingSettings?.urlContext?.enabled && groundingSettings.urlContext.urls.length > 0) {
      try {
        console.log('[AI Stage Flow Enhanced] Fetching URL context:', groundingSettings.urlContext.urls);
        for (const url of groundingSettings.urlContext.urls) {
          const response = await fetch('/api/fetch-url', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url }),
          });
          
          if (response.ok) {
            const urlData = await response.json();
            groundingSources.push({
              type: 'url',
              title: urlData.title || url,
              url: url,
              snippet: urlData.content?.substring(0, 200) + '...',
            });
            
            // Add URL content to the prompt
            promptTemplate += `\n\n[Context from ${url}]:\n${urlData.content}`;
          }
        }
      } catch (error) {
        console.error('[AI Stage Flow Enhanced] URL grounding failed:', error);
      }
    }

    // Build prompt parts
    const currentPromptMessageParts: any[] = [];
    if (promptTemplate) currentPromptMessageParts.push({ text: promptTemplate });
    if (imageData?.data) currentPromptMessageParts.push({ inlineData: { mimeType: imageData.mimeType, data: imageData.data } });
    if (fileInputs?.length) fileInputs.forEach(file => currentPromptMessageParts.push({ fileData: { uri: file.uri, mimeType: file.mimeType } }));

    // Build chat history
    let callHistory = chatHistory ? [...chatHistory] : [];
    if (currentPromptMessageParts.length > 0) {
      callHistory.push({ role: 'user', parts: currentPromptMessageParts });
    }

    // Handle system instructions
    if (systemInstructions) {
      if (callHistory.length > 0 && callHistory[0].role === 'system') {
        callHistory[0] = { role: 'system', parts: [{ text: systemInstructions }] };
      } else {
        callHistory.unshift({ role: 'system', parts: [{ text: systemInstructions }] });
      }
    }

    // Determine the model to use
    let modelToUse = model || 'googleai/gemini-2.0-flash-exp';
    
    // Use thinking model if thinking is enabled
    if (thinkingSettings?.enabled && modelToUse.includes('gemini-2.0-flash')) {
      modelToUse = 'googleai/gemini-2.0-flash-thinking-exp';
      console.log('[AI Stage Flow Enhanced] Switched to thinking model:', modelToUse);
    }

    // Build generation options
    const generateOptions: any = {
      model: modelToUse,
      config: {
        temperature: temperature ?? 0.7,
      },
    };

    // Add thinking configuration
    if (thinkingSettings?.enabled) {
      generateOptions.config.thinkingBudget = thinkingSettings.thinkingBudget || 8192;
      currentThinkingSteps.push({ type: 'textLog', message: 'Thinking mode enabled' });
    }

    // Add grounding for Google Search (Gemini 2.0+ uses tools approach)
    if (groundingSettings?.googleSearch?.enabled) {
      if (!availableTools.find(t => t.name === 'googleSearch')) {
        availableTools.push({
          name: 'googleSearch',
          description: 'Search Google for current information',
        });
      }
      generateOptions.config.temperature = 0.0; // Recommended for grounding
      currentThinkingSteps.push({ type: 'textLog', message: 'Google Search grounding enabled' });
    }

    // Configure function calling mode
    if (availableTools.length > 0) {
      generateOptions.tools = availableTools;
      if (functionCallingMode) {
        generateOptions.config.functionCallingMode = functionCallingMode;
      }
    }

    // Use streaming or regular generation
    if (streamingSettings?.enabled || callHistory.length > 0) {
      // Use streaming for chat or when explicitly enabled
      return await executeWithStreaming(
        generateOptions,
        callHistory,
        availableTools,
        currentThinkingSteps,
        streamingCallback
      );
    } else {
      // Use simple generation for single-turn requests
      return await executeSimpleGeneration(
        generateOptions,
        promptTemplate,
        currentThinkingSteps
      );
    }
  }
);

// Simple generation for non-streaming, non-chat requests
async function executeSimpleGeneration(
  generateOptions: any,
  promptTemplate: string,
  thinkingSteps: ThinkingStep[]
): Promise<AiStageOutputSchema> {
  try {
    generateOptions.prompt = promptTemplate;
    console.log('[AI Stage Flow Enhanced] Simple generation with options:', generateOptions);
    
    const response = await ai.generate(generateOptions);
    const content = response.text || '';
    
    // Extract any grounding sources from the response
    const groundingSources = extractGroundingSources(response);
    
    return {
      content,
      thinkingSteps: thinkingSteps.length > 0 ? thinkingSteps : undefined,
      groundingSources: groundingSources.length > 0 ? groundingSources : undefined,
    };
  } catch (error) {
    console.error('[AI Stage Flow Enhanced] Generation failed:', error);
    throw error;
  }
}

// Streaming generation with tool support
async function executeWithStreaming(
  generateOptions: any,
  callHistory: any[],
  availableTools: any[],
  thinkingSteps: ThinkingStep[],
  streamingCallback?: any
): Promise<AiStageOutputSchema> {
  let accumulatedContent = "";
  let finalOutputImages: any[] = [];
  let groundingSources: any[] = [];
  let functionCalls: any[] = [];
  let codeExecutionResults: any;
  
  const maxLoops = 5;
  let currentLoop = 0;

  while (currentLoop < maxLoops) {
    currentLoop++;
    let modelResponseAccumulatedParts: any[] = [];

    generateOptions.history = callHistory;
    
    console.log(`[AI Stage Flow Enhanced] Streaming loop ${currentLoop}`);
    
    try {
      // Check if ai.stream exists, otherwise fall back to generate
      const stream = ai.stream ? 
        await ai.stream(generateOptions) : 
        await simulateStream(await ai.generate(generateOptions));
      
      let hadToolRequestInTurn = false;

      for await (const chunk of stream) {
        if (chunk.content) {
          accumulatedContent += chunk.content;
          modelResponseAccumulatedParts.push({ text: chunk.content });
          
          if (streamingCallback) {
            streamingCallback({
              chunk: chunk.content,
              currentTurnContent: accumulatedContent,
              thinkingSteps,
              outputImages: finalOutputImages,
              updatedChatHistory: callHistory,
            });
          }
        }

        // Handle tool requests
        if (chunk.toolRequests && chunk.toolRequests.length > 0) {
          hadToolRequestInTurn = true;
          
          for (const toolRequest of chunk.toolRequests) {
            thinkingSteps.push({
              type: 'toolRequest',
              toolName: toolRequest.name,
              input: toolRequest.input,
            });

            // Execute the tool
            const tool = availableTools.find(t => t.name === toolRequest.name);
            let toolOutput: any;
            
            if (!tool || !tool.fn) {
              toolOutput = { error: `Tool ${toolRequest.name} not found or not executable` };
            } else {
              try {
                toolOutput = await tool.fn(toolRequest.input);
                
                // Record function call
                functionCalls.push({
                  toolName: toolRequest.name,
                  input: toolRequest.input,
                  output: toolOutput,
                  timestamp: new Date().toISOString(),
                });
                
                // Handle code interpreter results
                if (toolRequest.name === 'codeInterpreter' && toolOutput.outputFiles) {
                  if (!codeExecutionResults) {
                    codeExecutionResults = {
                      code: toolRequest.input.code || '',
                      stdout: toolOutput.stdout,
                      stderr: toolOutput.stderr,
                      images: [],
                    };
                  }
                  
                  // Extract images from output files
                  for (const file of toolOutput.outputFiles) {
                    if (file.mimeType?.startsWith('image/')) {
                      codeExecutionResults.images!.push({
                        name: file.name,
                        base64Data: file.base64Data,
                        mimeType: file.mimeType,
                      });
                      
                      finalOutputImages.push({
                        name: file.name,
                        base64Data: file.base64Data,
                        mimeType: file.mimeType,
                      });
                    }
                  }
                }
              } catch (error: any) {
                toolOutput = { error: error.message };
              }
            }

            thinkingSteps.push({
              type: 'toolResponse',
              toolName: toolRequest.name,
              output: toolOutput,
            });

            // Add tool response to history
            callHistory.push({
              role: 'user',
              parts: [{
                tool_response: {
                  tool_request_id: toolRequest.ref,
                  output: toolOutput,
                }
              }],
            });
          }
        }

        // Extract grounding sources from chunks
        if (chunk.groundingSources) {
          groundingSources.push(...chunk.groundingSources);
        }
      }

      // Add model response to history
      if (modelResponseAccumulatedParts.length > 0) {
        callHistory.push({ role: 'model', parts: modelResponseAccumulatedParts });
      }

      // If no tool requests, we're done
      if (!hadToolRequestInTurn) {
        thinkingSteps.push({ type: 'textLog', message: 'Final response received.' });
        break;
      }
    } catch (error) {
      console.error('[AI Stage Flow Enhanced] Stream error:', error);
      throw error;
    }
  }

  return {
    content: accumulatedContent,
    thinkingSteps: thinkingSteps.length > 0 ? thinkingSteps : undefined,
    outputImages: finalOutputImages.length > 0 ? finalOutputImages : undefined,
    updatedChatHistory: callHistory,
    groundingSources: groundingSources.length > 0 ? groundingSources : undefined,
    functionCalls: functionCalls.length > 0 ? functionCalls : undefined,
    codeExecutionResults,
  };
}

// Helper to simulate streaming from a regular response
async function* simulateStream(response: any) {
  yield {
    content: response.text || '',
    toolRequests: response.toolRequests || [],
    groundingSources: extractGroundingSources(response),
  };
}

// Extract grounding sources from response metadata
function extractGroundingSources(response: any): any[] {
  const sources: any[] = [];
  
  // Check for grounding metadata in response
  if (response.metadata?.groundingMetadata) {
    const metadata = response.metadata.groundingMetadata;
    
    // Extract search results
    if (metadata.searchQueries) {
      for (const query of metadata.searchQueries) {
        sources.push({
          type: 'search' as const,
          title: query.query,
          snippet: query.snippet,
        });
      }
    }
    
    // Extract web results
    if (metadata.webSearchResults) {
      for (const result of metadata.webSearchResults) {
        sources.push({
          type: 'search' as const,
          title: result.title,
          url: result.url,
          snippet: result.snippet,
        });
      }
    }
  }
  
  return sources;
}

// Export for compatibility
export { aiStageExecutionFlow as aiStageExecution };