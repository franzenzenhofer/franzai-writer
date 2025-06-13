'use server';

import {ai} from '@/ai/genkit';
import {z} from 'zod';

// Input Schema including all Gemini features with proper grounding implementation
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
  // Flag to force Google Search grounding for AI Redo functionality
  forceGoogleSearchGrounding: z.boolean().optional(),
});
export type AiStageExecutionInput = z.infer<typeof AiStageExecutionInputSchema>;

// Structured Thinking Steps
const ToolCallRequestSchema = z.object({ type: z.literal('toolRequest'), toolName: z.string(), input: z.any() });
const ToolCallResponseSchema = z.object({ type: z.literal('toolResponse'), toolName: z.string(), output: z.any() });
const TextLogSchema = z.object({ type: z.literal('textLog'), message: z.string() });
const ThinkingStepSchema = z.union([ToolCallRequestSchema, ToolCallResponseSchema, TextLogSchema]);
export type ThinkingStep = z.infer<typeof ThinkingStepSchema>;

// Output Schema including proper grounding metadata structure
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
  // Proper grounding metadata structure as per Google documentation
  groundingMetadata: z.object({
    searchEntryPoint: z.object({
      renderedContent: z.string().describe('HTML/CSS for rendering Google Search Suggestions'),
    }).optional(),
    groundingChunks: z.array(z.object({
      web: z.object({
        uri: z.string(),
        title: z.string(),
      }),
    })).optional(),
    groundingSupports: z.array(z.object({
      segment: z.object({
        startIndex: z.number().optional(),
        endIndex: z.number(),
        text: z.string(),
      }),
      groundingChunkIndices: z.array(z.number()),
      confidenceScores: z.array(z.number()),
    })).optional(),
    webSearchQueries: z.array(z.string()).optional(),
  }).optional(),
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

// Enhanced AI stage execution flow with proper Google Search grounding implementation
export const aiStageExecutionFlow = ai.defineFlow(
  {
    name: 'aiStageExecutionFlow',
    inputSchema: AiStageExecutionInputSchema,
    outputSchema: AiStageOutputSchema,
  },
  async (input: AiStageExecutionInput, streamingCallback?: any): Promise<AiStageOutputSchema> => {
    let {
      promptTemplate, model, temperature, imageData,
      thinkingSettings, toolNames, fileInputs,
      systemInstructions, chatHistory, groundingSettings,
      functionCallingMode, streamingSettings, forceGoogleSearchGrounding
    } = input;

    console.log('[AI Stage Flow Enhanced] Starting with input:', {
      model: model || 'default',
      hasTools: !!(toolNames?.length),
      hasGrounding: !!(groundingSettings?.googleSearch?.enabled || groundingSettings?.urlContext?.enabled),
      forceGoogleSearchGrounding: !!forceGoogleSearchGrounding,
      hasThinking: thinkingSettings?.enabled,
      isStreaming: streamingSettings?.enabled,
      promptTemplate: promptTemplate ? `${promptTemplate.substring(0, 100)}...` : 'EMPTY',
      chatHistory: chatHistory ? `${chatHistory.length} messages` : 'none'
    });

    // Initialize response tracking
    let currentThinkingSteps: ThinkingStep[] = [];
    let accumulatedContent = "";
    let finalOutputImages: AiStageOutputSchema['outputImages'] = [];
    let groundingSources: AiStageOutputSchema['groundingSources'] = [];
    let groundingMetadata: AiStageOutputSchema['groundingMetadata'];
    let functionCalls: AiStageOutputSchema['functionCalls'] = [];
    let codeExecutionResults: AiStageOutputSchema['codeExecutionResults'];

    // Load tools if requested
    let availableTools: any[] = [];
    if (toolNames && toolNames.length > 0) {
      try {
        // Import tool definitions (not actual tools)
        const { toolDefinitions } = await import('@/ai/tools/tool-definitions');
        
        // Filter and prepare tools for Gemini
        const requestedTools = toolDefinitions.filter(def => toolNames.includes(def.name));
        
        // Convert to format expected by Gemini
        availableTools = requestedTools.map(def => ({
          name: def.name,
          description: def.description,
          // Include the function for execution
          fn: def.fn
        }));
        
        // Add code interpreter if requested
        if (toolNames.includes('codeInterpreter')) {
          // Code interpreter is a built-in tool, we'll handle it specially
          availableTools.push({
            name: 'codeInterpreter',
            description: 'Execute Python code and return results',
            // The actual implementation will be handled by Gemini
          });
        }
        
        console.log(`[AI Stage Flow Enhanced] Prepared ${availableTools.length} tools:`, availableTools.map(t => t.name));
      } catch (error) {
        console.error('[AI Stage Flow Enhanced] Failed to prepare tools:', error);
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
    if (fileInputs?.length) fileInputs.forEach((file: any) => currentPromptMessageParts.push({ fileData: { uri: file.uri, mimeType: file.mimeType } }));

    // Build chat history
    let callHistory = chatHistory ? [...chatHistory] : [];
    if (currentPromptMessageParts.length > 0) {
      callHistory.push({ role: 'user', parts: currentPromptMessageParts });
    }
    
    console.log('[AI Stage Flow Enhanced] Chat history built:', {
      hasExistingHistory: !!chatHistory,
      currentPromptParts: currentPromptMessageParts.length,
      callHistoryLength: callHistory.length,
      promptTemplateLength: promptTemplate?.length || 0
    });

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

    // CRITICAL: Implement proper Google Search grounding as per documentation
    // For Gemini 2.0+ models, use the Search as Tool approach
    const shouldEnableGoogleSearch = 
      forceGoogleSearchGrounding || 
      groundingSettings?.googleSearch?.enabled;

    if (shouldEnableGoogleSearch) {
      // Determine if this is a Gemini 2.0+ model
      const isGemini20Plus = modelToUse.includes('2.0') || modelToUse.includes('2.5');
      
      console.log('[AI Stage Flow Enhanced] Google Search Grounding Configuration:', {
        shouldEnableGoogleSearch,
        isGemini20Plus,
        modelToUse,
        forceGoogleSearchGrounding,
        groundingSettingsEnabled: groundingSettings?.googleSearch?.enabled,
        temperature: temperature ?? 0.7
      });
      
      if (isGemini20Plus) {
        // For Gemini 2.0+, use Search as Tool (recommended approach)
        console.log('[AI Stage Flow Enhanced] Enabling Google Search grounding for Gemini 2.0+ model using Search as Tool');
        
        // Add Google Search as a tool
        if (!generateOptions.tools) {
          generateOptions.tools = [];
        }
        generateOptions.tools.push({ googleSearch: {} });
        
        // Set temperature to 0.0 as recommended for grounding
        generateOptions.config.temperature = 0.0;
        
        console.log('[AI Stage Flow Enhanced] Google Search tool added:', generateOptions.tools);
        
        currentThinkingSteps.push({ 
          type: 'textLog', 
          message: `Google Search grounding enabled with Search as Tool approach for model ${modelToUse}` 
        });
      } else {
        // For Gemini 1.5 models, use Dynamic Retrieval (legacy approach)
        console.log('[AI Stage Flow Enhanced] Enabling Google Search grounding for Gemini 1.5 model with Dynamic Retrieval');
        
        generateOptions.config.googleSearchRetrieval = {
          dynamicRetrievalConfig: {
            dynamicThreshold: groundingSettings?.googleSearch?.dynamicThreshold ?? 0.3,
            mode: 'MODE_DYNAMIC'
          }
        };
        
        // Set temperature to 0.0 as recommended for grounding
        generateOptions.config.temperature = 0.0;
        
        console.log('[AI Stage Flow Enhanced] Google Search Retrieval config:', generateOptions.config.googleSearchRetrieval);
        
        currentThinkingSteps.push({ 
          type: 'textLog', 
          message: `Google Search grounding enabled with Dynamic Retrieval (threshold: ${groundingSettings?.googleSearch?.dynamicThreshold ?? 0.3}) for model ${modelToUse}` 
        });
      }
      
      // CRITICAL: Add explicit system instruction for Google Search grounding
      const groundingSystemInstruction = "IMPORTANT: You have access to Google Search grounding. When answering questions about current events, recent information, or factual data that may change over time, automatically use Google Search to find up-to-date information. Do NOT generate code to search - use the built-in Google Search capability instead. Provide actual search results and cite your sources.";
      
      if (systemInstructions) {
        systemInstructions = systemInstructions + "\n\n" + groundingSystemInstruction;
      } else {
        systemInstructions = groundingSystemInstruction; 
      }
      
      console.log('[AI Stage Flow Enhanced] Enhanced system instructions with grounding guidance');
    }

    // Configure function calling mode
    if (availableTools.length > 0 || generateOptions.tools?.length > 0) {
      if (!generateOptions.tools) {
        generateOptions.tools = availableTools;
      } else {
        generateOptions.tools.push(...availableTools);
      }
      
      if (functionCallingMode) {
        generateOptions.config.functionCallingMode = functionCallingMode;
      }
    }

    // Use streaming or regular generation
    const shouldUseStreaming = streamingSettings?.enabled || callHistory.length > 0 || generateOptions.tools?.length > 0;
    
    console.log('[AI Stage Flow Enhanced] Generation path decision:', {
      shouldUseStreaming,
      streamingEnabled: streamingSettings?.enabled,
      hasHistory: callHistory.length > 0,
      hasTools: generateOptions.tools?.length > 0,
      googleSearchEnabled: shouldEnableGoogleSearch,
      modelUsed: modelToUse
    });
    
    if (shouldUseStreaming) {
      // Use streaming for chat, tools, or when explicitly enabled
      return await executeWithStreaming(
        generateOptions,
        callHistory,
        availableTools,
        currentThinkingSteps,
        streamingCallback,
        promptTemplate,
        input
      );
    } else {
      // Use simple generation for non-streaming, non-chat requests
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
    
    // Enhanced logging for simple generation
    console.log('[AI Stage Flow Enhanced] ===== SIMPLE GENERATION REQUEST =====');
    console.log('[AI Stage Flow Enhanced] Simple generation with options:', JSON.stringify(generateOptions, null, 2));
    
    const response = await ai.generate(generateOptions);
    
    // Enhanced logging for simple generation response
    console.log('[AI Stage Flow Enhanced] ===== SIMPLE GENERATION RESPONSE =====');
    console.log('[AI Stage Flow Enhanced] Simple generation response:', JSON.stringify(response, null, 2));
    
    const content = response.text || '';
    
    // Extract proper grounding metadata from the response
    const groundingMetadata = extractGroundingMetadata(response);
    const groundingSources = extractGroundingSources(response);
    
    // Log grounding detection for simple generation
    if (groundingMetadata || groundingSources.length > 0) {
      console.log('[AI Stage Flow Enhanced] ===== SIMPLE GENERATION: GOOGLE SEARCH GROUNDING DETECTED =====');
      console.log('[AI Stage Flow Enhanced] ✅ Simple Generation: Google Search Grounding IS WORKING!');
    } else {
      console.log('[AI Stage Flow Enhanced] ===== SIMPLE GENERATION: NO GOOGLE SEARCH GROUNDING FOUND =====');
      console.log('[AI Stage Flow Enhanced] ❌ Simple Generation: Google Search Grounding NOT working');
    }
    
    return {
      content,
      thinkingSteps: thinkingSteps.length > 0 ? thinkingSteps : undefined,
      groundingSources: groundingSources.length > 0 ? groundingSources : undefined,
      groundingMetadata,
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
  streamingCallback?: any,
  promptTemplate?: string,
  originalInput?: AiStageExecutionInput
): Promise<AiStageOutputSchema> {
  let accumulatedContent = "";
  let finalOutputImages: any[] = [];
  let groundingSources: any[] = [];
  let groundingMetadata: AiStageOutputSchema['groundingMetadata'];
  let functionCalls: any[] = [];
  let codeExecutionResults: any;
  
  const maxLoops = 5;
  let iterationCount = 0;
  
  try {
    while (iterationCount < maxLoops) {
      iterationCount++;
      console.log(`[AI Stage Flow Enhanced] Streaming iteration ${iterationCount}/${maxLoops}`);
      
      // Debug: Log exactly what we're sending to the API
      console.log('[AI Stage Flow Enhanced] ===== API REQUEST DETAILS =====');
      console.log('[AI Stage Flow Enhanced] Full API Request Configuration:', {
        model: generateOptions.model,
        temperature: generateOptions.config?.temperature,
        hasTools: !!generateOptions.tools?.length,
        toolsCount: generateOptions.tools?.length || 0,
        toolNames: generateOptions.tools?.map((t: any) => t.name) || [],
        hasGoogleSearchRetrieval: !!generateOptions.config?.googleSearchRetrieval,
        googleSearchRetrieval: generateOptions.config?.googleSearchRetrieval,
        hasGoogleSearchGrounding: !!generateOptions.config?.googleSearchGrounding,
        googleSearchGrounding: generateOptions.config?.googleSearchGrounding,
        systemInstruction: generateOptions.config?.systemInstruction,
        callHistoryLength: callHistory.length,
        fullCallHistory: callHistory,
        forceGoogleSearchGrounding: originalInput?.forceGoogleSearchGrounding
      });
      
      // Log the complete request being sent to Google
      const fullRequest = {
        model: generateOptions.model,
        config: generateOptions.config,
        tools: generateOptions.tools,
        messages: callHistory
      };
      console.log('[AI Stage Flow Enhanced] Complete Google API Request:', JSON.stringify(fullRequest, null, 2));
      
      // Perform the API call
      const response = await ai.chat({
        model: generateOptions.model,
        config: generateOptions.config,
        tools: generateOptions.tools,
        messages: callHistory
      });
      
      // Debug: Log the complete response structure
      console.log('[AI Stage Flow Enhanced] ===== API RESPONSE DETAILS =====');
      console.log('[AI Stage Flow Enhanced] Raw API Response Summary:', {
        hasText: !!response.text,
        textLength: response.text?.length || 0,
        textPreview: response.text?.substring(0, 200) + '...',
        hasResponse: !!response.response,
        responseKeys: response.response ? Object.keys(response.response) : [],
        hasToolRequests: !!response.toolRequests?.length,
        toolRequestsCount: response.toolRequests?.length || 0,
        hasGroundingMetadata: !!(response.response?.groundingMetadata || response.groundingMetadata),
        groundingMetadataKeys: (response.response?.groundingMetadata || response.groundingMetadata) ? 
          Object.keys(response.response?.groundingMetadata || response.groundingMetadata) : [],
        hasOutputImages: !!response.outputImages?.length,
        outputImagesCount: response.outputImages?.length || 0,
        hasCodeExecutionResults: !!response.codeExecutionResults
      });
      
      // Log the complete raw response from Google
      console.log('[AI Stage Flow Enhanced] Complete Google API Response:', JSON.stringify(response, null, 2));
      
      // Extract grounding metadata from response
      groundingMetadata = extractGroundingMetadata(response);
      groundingSources = extractGroundingSources(response);
      
      if (groundingMetadata || groundingSources.length > 0) {
        console.log('[AI Stage Flow Enhanced] ===== GOOGLE SEARCH GROUNDING DETECTED =====');
        console.log('[AI Stage Flow Enhanced] ✅ Google Search Grounding IS WORKING!');
        console.log('[AI Stage Flow Enhanced] Grounding Data Extracted:', {
          hasGroundingMetadata: !!groundingMetadata,
          groundingMetadataKeys: groundingMetadata ? Object.keys(groundingMetadata) : [],
          groundingSourcesCount: groundingSources.length,
          groundingSources: groundingSources.map(s => ({ type: s.type, title: s.title, url: s.url })),
          searchQueries: groundingMetadata?.webSearchQueries || [],
          groundingChunksCount: groundingMetadata?.groundingChunks?.length || 0,
          groundingSupportsCount: groundingMetadata?.groundingSupports?.length || 0
        });
        console.log('[AI Stage Flow Enhanced] Full Grounding Metadata:', JSON.stringify(groundingMetadata, null, 2));
      } else {
        console.log('[AI Stage Flow Enhanced] ===== NO GOOGLE SEARCH GROUNDING FOUND =====');
        console.log('[AI Stage Flow Enhanced] ❌ Google Search Grounding NOT working - response has no grounding data');
        console.log('[AI Stage Flow Enhanced] This might indicate:');
        console.log('[AI Stage Flow Enhanced] 1. Google Search grounding is not properly configured');
        console.log('[AI Stage Flow Enhanced] 2. The model did not need to search for this query');
        console.log('[AI Stage Flow Enhanced] 3. There was an issue with the grounding service');
      }
      
      // Handle streaming response
      const textContent = response.text || '';
      accumulatedContent += textContent;
      
      // Handle output images
      if (response.outputImages && response.outputImages.length > 0) {
        finalOutputImages = response.outputImages;
        console.log(`[AI Stage Flow Enhanced] Output images found: ${response.outputImages.length}`);
      }
      
      // Handle code execution results
      if (response.codeExecutionResults) {
        codeExecutionResults = response.codeExecutionResults;
        console.log('[AI Stage Flow Enhanced] Code execution results found');
      }
      
      // Handle tool requests
      if (response.toolRequests && response.toolRequests.length > 0) {
        console.log(`[AI Stage Flow Enhanced] Tool requests: ${response.toolRequests.length}`);
        
        // Log each tool request
        for (const toolRequest of response.toolRequests) {
          console.log(`[AI Stage Flow Enhanced] Tool request: ${toolRequest.name}`, toolRequest.input);
          thinkingSteps.push({
            type: 'toolRequest',
            toolName: toolRequest.name,
            input: toolRequest.input
          });
        }
        
        // Execute all tool requests
        const toolResults = [];
        for (const toolRequest of response.toolRequests) {
          try {
            let toolResult;
            
            // Handle built-in tools
            if (toolRequest.name === 'codeInterpreter') {
              // Code interpreter is handled by Gemini
              toolResult = `Code interpreter executed for: ${JSON.stringify(toolRequest.input)}`;
            } else {
              // Handle custom tools
              const toolDefinition = availableTools.find(t => t.name === toolRequest.name);
              if (toolDefinition && toolDefinition.fn) {
                toolResult = await toolDefinition.fn(toolRequest.input);
              } else {
                toolResult = `Tool ${toolRequest.name} not found or not executable`;
              }
            }
            
            toolResults.push({
              toolRequestId: toolRequest.toolRequestId,
              output: toolResult
            });
            
            functionCalls.push({
              toolName: toolRequest.name,
              input: toolRequest.input,
              output: toolResult,
              timestamp: new Date().toISOString()
            });
            
            thinkingSteps.push({
              type: 'toolResponse',
              toolName: toolRequest.name,
              output: toolResult
            });
            
            console.log(`[AI Stage Flow Enhanced] Tool ${toolRequest.name} executed successfully`);
          } catch (error) {
            console.error(`[AI Stage Flow Enhanced] Tool ${toolRequest.name} failed:`, error);
            const errorResult = `Tool execution failed: ${error instanceof Error ? error.message : String(error)}`;
            
            toolResults.push({
              toolRequestId: toolRequest.toolRequestId,
              output: errorResult
            });
            
            thinkingSteps.push({
              type: 'toolResponse',
              toolName: toolRequest.name,
              output: errorResult
            });
          }
        }
        
        // Add tool results to chat history
        callHistory.push({
          role: 'model',
          parts: [{ text: textContent }]
        });
        
        if (toolResults.length > 0) {
          callHistory.push({
            role: 'user',
            parts: toolResults.map(result => ({
              toolResponse: {
                toolRequestId: result.toolRequestId,
                output: result.output
              }
            }))
          });
        }
        
        // Continue to next iteration to get final response
        continue;
      }
      
      // If no tool requests, we're done
      callHistory.push({
        role: 'model',
        parts: [{ text: textContent }]
      });
      
      break; // Exit the loop
    }
    
    // Stream the final response if callback provided
    if (streamingCallback && accumulatedContent) {
      await streamingCallback(accumulatedContent);
    }
    
    return {
      content: accumulatedContent,
      thinkingSteps: thinkingSteps.length > 0 ? thinkingSteps : undefined,
      outputImages: finalOutputImages.length > 0 ? finalOutputImages : undefined,
      updatedChatHistory: callHistory,
      groundingSources: groundingSources.length > 0 ? groundingSources : undefined,
      groundingMetadata,
      functionCalls: functionCalls.length > 0 ? functionCalls : undefined,
      codeExecutionResults
    };
    
  } catch (error) {
    console.error('[AI Stage Flow Enhanced] Streaming execution failed:', error);
    throw error;
  }
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

// Extract grounding metadata from response metadata
function extractGroundingMetadata(response: any): AiStageOutputSchema['groundingMetadata'] {
  const metadata = response.metadata?.groundingMetadata;
  if (!metadata) return undefined;

  const groundingMetadata: AiStageOutputSchema['groundingMetadata'] = {
    searchEntryPoint: {
      renderedContent: metadata.searchEntryPoint?.renderedContent || '',
    },
    groundingChunks: metadata.groundingChunks?.map((chunk: any) => ({
      web: {
        uri: chunk.web?.uri || '',
        title: chunk.web?.title || '',
      },
    })) || [],
    groundingSupports: metadata.groundingSupports?.map((support: any) => ({
      segment: {
        startIndex: support.segment?.startIndex,
        endIndex: support.segment?.endIndex,
        text: support.segment?.text || '',
      },
      groundingChunkIndices: support.groundingChunkIndices || [],
      confidenceScores: support.confidenceScores || [],
    })) || [],
    webSearchQueries: metadata.webSearchQueries || [],
  };

  return groundingMetadata;
}

// Export for compatibility
export { aiStageExecutionFlow as aiStageExecution };