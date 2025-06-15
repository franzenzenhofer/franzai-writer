'use server';
import 'server-only';

import {z} from 'zod';
import { generateWithDirectGemini, generateStreamWithDirectGemini, type DirectGeminiRequest, type DirectGeminiResponse } from '@/ai/direct-gemini';
import { appendFileSync } from 'fs';
import { join } from 'path';

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
export async function aiStageExecutionFlow(
  input: AiStageExecutionInput, 
  streamingCallback?: any
): Promise<AiStageOutputSchema> {
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
      chatHistory: chatHistory ? `${chatHistory.length} messages` : 'none',
      // CRITICAL: Debug groundingSettings in detail
      groundingSettings: groundingSettings,
      googleSearchSettings: groundingSettings?.googleSearch,
    });

    // 🚨 CRITICAL GROUNDING DEBUG 🚨
    console.log('🚨🚨🚨 === GOOGLE SEARCH GROUNDING DEBUG === 🚨🚨🚨');
    console.log('🔍 forceGoogleSearchGrounding:', forceGoogleSearchGrounding);
    console.log('🔍 groundingSettings?.googleSearch?.enabled:', groundingSettings?.googleSearch?.enabled);
    console.log('🔍 Full groundingSettings object:', JSON.stringify(groundingSettings, null, 2));
    console.log('🚨🚨🚨 ================================== 🚨🚨🚨');

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
      } catch (error: unknown) {
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
      } catch (error: unknown) {
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
    let modelToUse = model || 'googleai/gemini-2.0-flash';
    
    // Use thinking model if thinking is enabled
    if (thinkingSettings?.enabled && modelToUse.includes('gemini-2.0-flash')) {
      modelToUse = 'googleai/gemini-2.5-flash-preview';
      console.log('[AI Stage Flow Enhanced] Switched to thinking model:', modelToUse);
    }

    // CRITICAL: Implement proper Google Search grounding using direct API
    const shouldEnableGoogleSearch = 
      forceGoogleSearchGrounding || 
      groundingSettings?.googleSearch?.enabled;

    // Configure generation options
    const generateOptions = {
      model: modelToUse,
      config: {
        temperature: temperature ?? 0.7,
        ...(thinkingSettings?.enabled && {
          thinkingConfig: {
            includeThoughts: true,
            thinkingBudget: thinkingSettings.thinkingBudget || 2048
          }
        })
      },
      tools: [] as any[],
      // CRITICAL: Pass grounding settings through to generateOptions for fallback paths
      enableGoogleSearch: shouldEnableGoogleSearch,
      forceGoogleSearchGrounding: forceGoogleSearchGrounding,
      googleSearchGrounding: {
        enabled: shouldEnableGoogleSearch,
        dynamicRetrievalThreshold: groundingSettings?.googleSearch?.dynamicThreshold
      }
    };

    // Add thinking configuration
    if (thinkingSettings?.enabled) {
      generateOptions.config.thinkingConfig = {
        includeThoughts: true,
        thinkingBudget: thinkingSettings.thinkingBudget || 8192
      };
      currentThinkingSteps.push({ type: 'textLog', message: 'Thinking mode enabled' });
    }

    // 🚀 NEW: Use direct Gemini API for Google Search grounding (bypassing Genkit)
    if (shouldEnableGoogleSearch) {
      console.log('🚀🚀🚀 GOOGLE SEARCH GROUNDING REQUESTED! 🚀🚀🚀');
      console.log('🔧 Using Direct Gemini API with proper googleSearch tool...');
      
      // Use direct API path for Google Search grounding
      return await executeWithDirectGeminiAPI(
        {
          model: modelToUse,
          prompt: promptTemplate,
          temperature: temperature ?? 0.1, // Low temperature for grounding accuracy
          systemInstruction: systemInstructions,
          enableGoogleSearch: true,
          dynamicRetrievalThreshold: groundingSettings?.googleSearch?.dynamicThreshold,
          tools: availableTools
        },
        currentThinkingSteps,
        streamingCallback,
        input
      );
    }

    // Configure function calling mode
    if (availableTools.length > 0 || generateOptions.tools?.length > 0) {
      if (!generateOptions.tools) {
        generateOptions.tools = availableTools;
      } else {
        generateOptions.tools.push(...availableTools);
      }
      
      if (functionCallingMode) {
        // Store functionCallingMode for later use in direct API
        (generateOptions as any).functionCallingMode = functionCallingMode;
      }
    }

    // Use streaming or regular generation
    const shouldUseStreaming = streamingSettings?.enabled || callHistory.length > 0 || 
                              generateOptions.tools?.length > 0;
    
    console.log('[AI Stage Flow Enhanced] Generation path decision:', {
      shouldUseStreaming,
      streamingEnabled: streamingSettings?.enabled,
      hasHistory: callHistory.length > 0,
      hasTools: (generateOptions.tools?.length || 0) > 0,
      googleSearchEnabled: shouldEnableGoogleSearch,
      modelUsed: modelToUse
    });

    // 🚨 FINAL TOOLS CHECK: Show exactly what tools are going to the API
    console.log('🔧🔧🔧 FINAL API REQUEST TOOLS CHECK 🔧🔧🔧');
    console.log('📋 generateOptions.tools:', JSON.stringify(generateOptions.tools, null, 2));
    console.log('📋 generateOptions.config:', JSON.stringify(generateOptions.config, null, 2));
    console.log('📊 Total tools count:', generateOptions.tools?.length || 0);
    if (generateOptions.tools?.some((tool: any) => tool.google_search !== undefined)) {
      console.log('✅✅✅ GOOGLE SEARCH TOOL IS PRESENT IN API REQUEST! ✅✅✅');
      console.log('🎯 Using Gemini 2.0+ Search as Tool approach');
    } else {
      console.log('❌❌❌ NO GOOGLE SEARCH GROUNDING CONFIGURED ❌❌❌');
    }
    console.log('🔧🔧🔧 ================================= 🔧🔧🔧');
    
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

// Simple generation for non-streaming, non-chat requests
async function executeSimpleGeneration(
  generateOptions: any,
  promptTemplate: string,
  thinkingSteps: ThinkingStep[]
): Promise<AiStageOutputSchema> {
  try {
    console.log('[AI Stage Flow Enhanced] Using simple generation with @google/genai');
    
    // CRITICAL FIX: Check if grounding is enabled properly
    const groundingEnabled = generateOptions.enableGoogleSearch || 
                            generateOptions.googleSearchGrounding?.enabled ||
                            generateOptions.forceGoogleSearchGrounding;

    console.log('[AI Stage Flow Enhanced] 🔍 Simple Generation Grounding Check:');
    console.log('[AI Stage Flow Enhanced]   - generateOptions.enableGoogleSearch:', generateOptions.enableGoogleSearch);
    console.log('[AI Stage Flow Enhanced]   - generateOptions.googleSearchGrounding?.enabled:', generateOptions.googleSearchGrounding?.enabled);
    console.log('[AI Stage Flow Enhanced]   - generateOptions.forceGoogleSearchGrounding:', generateOptions.forceGoogleSearchGrounding);
    console.log('[AI Stage Flow Enhanced]   - Final groundingEnabled:', groundingEnabled);

    // Use direct Gemini API instead of genkit
    const request: DirectGeminiRequest = {
      model: generateOptions.model,
      prompt: promptTemplate,
      temperature: generateOptions.config?.temperature,
      systemInstruction: generateOptions.config?.systemInstruction,
      maxOutputTokens: generateOptions.config?.maxOutputTokens,
      enableGoogleSearch: groundingEnabled,
      dynamicRetrievalThreshold: generateOptions.googleSearchGrounding?.dynamicRetrievalThreshold,
      tools: generateOptions.tools,
    };
    
    const response = await generateWithDirectGemini(request);

    const content = response.content || '';
    
    // Direct-gemini already provides grounding metadata in the expected format
    const groundingMetadata = response.groundingMetadata;
    const groundingSources = response.groundingSources?.map(source => ({
      type: 'search' as const,
      title: source.title,
      url: source.uri,
      snippet: source.snippet,
    })) || [];
    
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
  } catch (error: unknown) {
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
  let groundingMetadata: AiStageOutputSchema['groundingMetadata'] = undefined;
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
        toolNames: generateOptions.tools?.map((t: any) => t.name || Object.keys(t)[0]) || [],
        hasGoogleSearchTool: !!generateOptions.tools?.some((tool: any) => tool.google_search !== undefined),
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
      
      // Convert callHistory to prompt format expected by Genkit
      const promptParts = [];
      for (const message of callHistory) {
        if (message.role === 'user' || message.role === 'model') {
          for (const part of message.parts) {
            if (part.text) {
              promptParts.push({ text: part.text });
            } else if (part.inlineData) {
              promptParts.push({ inlineData: part.inlineData });
            } else if (part.fileData) {
              promptParts.push({ fileData: part.fileData });
            }
          }
        }
      }
      
      // Use direct Gemini API for streaming
      console.log('[AI Stage Flow Enhanced] Using streaming generation with @google/genai');
      
      // Convert promptParts to a single prompt string
      const promptString = promptParts.map(part => 
        typeof part === 'string' ? part : part.text || JSON.stringify(part)
      ).join('\n\n');
      
      const request: DirectGeminiRequest = {
        model: generateOptions.model,
        prompt: promptString,
        temperature: generateOptions.config?.temperature,
        systemInstruction: generateOptions.config?.systemInstruction,
        maxOutputTokens: generateOptions.config?.maxOutputTokens,
        enableGoogleSearch: generateOptions.googleSearchGrounding?.enabled,
        dynamicRetrievalThreshold: generateOptions.googleSearchGrounding?.dynamicRetrievalThreshold,
        tools: generateOptions.tools,
      };
      
      // Handle streaming with async iterable
      let finalResponse: DirectGeminiResponse | null = null;
      const streamIterator = await generateStreamWithDirectGemini(request);
      
      for await (const chunk of streamIterator) {
        if (chunk.content && streamingCallback) {
          streamingCallback({ type: 'text', text: chunk.content });
        }
        // Keep the last chunk as the final response with all metadata
        finalResponse = chunk;
      }
      
      const response = finalResponse || { content: '' };
      
      // Debug: Log the complete response structure
      console.log('[AI Stage Flow Enhanced] ===== API RESPONSE DETAILS =====');
      console.log('[AI Stage Flow Enhanced] Raw API Response Summary:', {
        hasContent: !!response.content,
        contentLength: response.content?.length || 0,
        contentPreview: response.content?.substring(0, 200) + '...',
        hasGroundingMetadata: !!response.groundingMetadata,
        groundingMetadataKeys: response.groundingMetadata ? Object.keys(response.groundingMetadata) : [],
        hasGroundingSources: !!response.groundingSources?.length,
        groundingSourcesCount: response.groundingSources?.length || 0,
        hasUsageMetadata: !!response.usageMetadata,
        modelVersion: response.modelVersion
      });
      
      // Log the complete raw response from Google
      console.log('[AI Stage Flow Enhanced] Complete Google API Response:', JSON.stringify(response, null, 2));
      
      // Direct-gemini already provides grounding metadata in the expected format
      groundingMetadata = response.groundingMetadata;
      groundingSources = response.groundingSources?.map(source => ({
        type: 'search' as const,
        title: source.title,
        url: source.uri,
        snippet: source.snippet,
      })) || [];
      
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
      const textContent = response.content || '';
      accumulatedContent = textContent; // Direct-gemini already accumulates content
      
      // Note: Direct-gemini doesn't provide output images, code execution results, or tool requests
      // in the current implementation. These would need to be extracted from candidates if available.
      
      // Tool requests are not currently supported with direct-gemini
      // Skip tool handling for now
      if (false) {
        
        // Log each tool request
        for (const toolRequest of (response as any).toolRequests) {
          console.log(`[AI Stage Flow Enhanced] Tool request: ${toolRequest.name}`, toolRequest.input);
          thinkingSteps.push({
            type: 'toolRequest',
            toolName: toolRequest.name,
            input: toolRequest.input
          });
        }
        
        // Execute all tool requests
        const toolResults = [];
        for (const toolRequest of (response as any).toolRequests) {
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
            const errorMessage = (error as any)?.message || String(error);
            const errorResult = `Tool execution failed: ${errorMessage}`;
            
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
        
      }
      
      // Exit the loop since we're done
      break;
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
    
  } catch (error: unknown) {
    console.error('[AI Stage Flow Enhanced] Streaming execution failed:', error);
    throw error;
  }
}

// Direct Gemini API execution for Google Search grounding
async function executeWithDirectGeminiAPI(
  request: DirectGeminiRequest,
  thinkingSteps: ThinkingStep[],
  streamingCallback?: any,
  originalInput?: AiStageExecutionInput
): Promise<AiStageOutputSchema> {
  console.log('🎯 [Direct Gemini API] Starting execution for Google Search grounding');
  
  // 🔥 LOG FULL REQUEST TO DIRECT GEMINI API
  logToAiLog('🎯 [DIRECT GEMINI API REQUEST - FULL]', {
    request: {
      ...request,
      // Don't log the full system prompt, just structure
      system: request.system ? request.system.substring(0, 100) + '...' : undefined,
      prompt: request.prompt ? request.prompt.substring(0, 200) + '...' : undefined,
      model: request.model,
      temperature: request.temperature,
      maxOutputTokens: request.maxOutputTokens,
      hasGroundingConfig: !!request.groundingConfig,
      groundingConfig: request.groundingConfig
    },
    originalInput: originalInput ? {
      model: originalInput.model,
      hasGroundingSettings: !!originalInput.groundingSettings,
      groundingSettings: originalInput.groundingSettings
    } : undefined
  });
  
  try {
    // Use streaming if callback is provided
    if (streamingCallback) {
      console.log('🌊 [Direct Gemini API] Using streaming mode');
      
      const stream = await generateStreamWithDirectGemini(request);
      let finalResult: DirectGeminiResponse | null = null;
      
      for await (const chunk of stream) {
        finalResult = chunk;
        
        // 🔥 LOG STREAMING CHUNK
        logToAiLog('🌊 [DIRECT GEMINI STREAMING CHUNK]', {
          hasContent: !!chunk.content,
          contentLength: chunk.content?.length || 0,
          contentPreview: chunk.content?.substring(0, 100) + '...' || '',
          hasGroundingMetadata: !!chunk.groundingMetadata,
          hasGroundingSources: !!chunk.groundingSources,
          groundingSourcesCount: chunk.groundingSources?.length || 0,
          allChunkKeys: Object.keys(chunk)
        });
        
        // Send streaming callback
        if (streamingCallback) {
          streamingCallback({
            content: chunk.content,
            groundingMetadata: chunk.groundingMetadata,
            groundingSources: chunk.groundingSources,
            isComplete: false
          });
        }
      }
      
      if (!finalResult) {
        throw new Error('No final result from streaming');
      }
      
      // 🔥 LOG FINAL STREAMING RESULT
      logToAiLog('✅ [DIRECT GEMINI STREAMING FINAL RESULT]', {
        hasContent: !!finalResult.content,
        contentLength: finalResult.content?.length || 0,
        contentPreview: finalResult.content?.substring(0, 200) + '...' || '',
        hasGroundingMetadata: !!finalResult.groundingMetadata,
        groundingMetadataKeys: finalResult.groundingMetadata ? Object.keys(finalResult.groundingMetadata) : [],
        hasGroundingSources: !!finalResult.groundingSources,
        groundingSourcesCount: finalResult.groundingSources?.length || 0,
        groundingSourcesPreview: finalResult.groundingSources?.slice(0, 2),
        allFinalResultKeys: Object.keys(finalResult)
      });
      
      // 🔥 LOG FULL GROUNDING METADATA IF PRESENT
      if (finalResult.groundingMetadata) {
        logToAiLog('🔍 [DIRECT GEMINI GROUNDING METADATA - FULL]', finalResult.groundingMetadata);
      }
      
      // 🔥 LOG FULL GROUNDING SOURCES IF PRESENT
      if (finalResult.groundingSources) {
        logToAiLog('📖 [DIRECT GEMINI GROUNDING SOURCES - FULL]', finalResult.groundingSources);
      }
      
      console.log('✅ [Direct Gemini API] Streaming completed successfully');
      
      const processedResult = {
        content: finalResult.content,
        thinkingSteps: thinkingSteps.length > 0 ? thinkingSteps : undefined,
        groundingMetadata: finalResult.groundingMetadata,
        groundingSources: finalResult.groundingSources?.map(source => ({
          type: 'search' as const,
          title: source.title,
          url: source.uri,
          snippet: source.snippet
        })),
      };
      
      // 🔥 LOG PROCESSED RESULT BEING RETURNED
      logToAiLog('🎯 [DIRECT GEMINI PROCESSED RESULT - STREAMING]', {
        hasContent: !!processedResult.content,
        hasGroundingMetadata: !!processedResult.groundingMetadata,
        hasGroundingSources: !!processedResult.groundingSources,
        groundingSourcesCount: processedResult.groundingSources?.length || 0,
        allProcessedKeys: Object.keys(processedResult)
      });
      
      return processedResult;
      
    } else {
      console.log('📝 [Direct Gemini API] Using non-streaming mode');
      
      const result = await generateWithDirectGemini(request);
      
      // 🔥 LOG FULL NON-STREAMING RESULT
      logToAiLog('📝 [DIRECT GEMINI NON-STREAMING RESULT]', {
        hasContent: !!result.content,
        contentLength: result.content?.length || 0,
        contentPreview: result.content?.substring(0, 200) + '...' || '',
        hasGroundingMetadata: !!result.groundingMetadata,
        groundingMetadataKeys: result.groundingMetadata ? Object.keys(result.groundingMetadata) : [],
        hasGroundingSources: !!result.groundingSources,
        groundingSourcesCount: result.groundingSources?.length || 0,
        groundingSourcesPreview: result.groundingSources?.slice(0, 2),
        allResultKeys: Object.keys(result)
      });
      
      // 🔥 LOG FULL GROUNDING METADATA IF PRESENT
      if (result.groundingMetadata) {
        logToAiLog('🔍 [DIRECT GEMINI GROUNDING METADATA - FULL]', result.groundingMetadata);
      }
      
      // 🔥 LOG FULL GROUNDING SOURCES IF PRESENT
      if (result.groundingSources) {
        logToAiLog('📖 [DIRECT GEMINI GROUNDING SOURCES - FULL]', result.groundingSources);
      }
      
      console.log('✅ [Direct Gemini API] Generation completed successfully');
      
      const processedResult = {
        content: result.content,
        thinkingSteps: thinkingSteps.length > 0 ? thinkingSteps : undefined,
        groundingMetadata: result.groundingMetadata,
        groundingSources: result.groundingSources?.map(source => ({
          type: 'search' as const,
          title: source.title,
          url: source.uri,
          snippet: source.snippet
        })),
      };
      
      // 🔥 LOG PROCESSED RESULT BEING RETURNED
      logToAiLog('🎯 [DIRECT GEMINI PROCESSED RESULT - NON-STREAMING]', {
        hasContent: !!processedResult.content,
        hasGroundingMetadata: !!processedResult.groundingMetadata,
        hasGroundingSources: !!processedResult.groundingSources,
        groundingSourcesCount: processedResult.groundingSources?.length || 0,
        allProcessedKeys: Object.keys(processedResult)
      });
      
      return processedResult;
    }
    
  } catch (error: unknown) {
    // 🔥 LOG DIRECT GEMINI ERROR
    logToAiLog('❌ [DIRECT GEMINI API ERROR]', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    
    console.error('[Direct Gemini API] Execution failed:', error);
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

  // Also check for citationMetadata which is how Search as Tool grounding data comes through
  const citationMetadata = response.custom?.candidates?.[0]?.citationMetadata || response.citationMetadata;
  if (citationMetadata && citationMetadata.citationSources?.length > 0) {
    console.log('[AI Stage Flow Enhanced] Extracting sources from citationMetadata');
    
    for (const citation of citationMetadata.citationSources) {
      sources.push({
        type: 'search' as const,
        title: citation.uri, // Use URI as title since title is not provided in citations
        url: citation.uri,
        snippet: `Cited content from index ${citation.startIndex} to ${citation.endIndex}`,
      });
    }
  }
  
  return sources;
}

// Extract grounding metadata from response metadata
function extractGroundingMetadata(response: any): AiStageOutputSchema['groundingMetadata'] {
  // The actual grounding metadata might be nested differently by the Genkit SDK
  // Check common locations: response.metadata.groundingMetadata, response.groundingMetadata, response.response?.groundingMetadata
  const rawMetadata = response.groundingMetadata || response.response?.groundingMetadata || response.metadata?.groundingMetadata;

  if (!rawMetadata) {
    console.log('[AI Stage Flow Enhanced] No raw grounding metadata found in the response object.');
    
    // Check for citationMetadata which seems to be how grounding data comes through for Search as Tool
    const citationMetadata = response.custom?.candidates?.[0]?.citationMetadata || response.citationMetadata;
    if (citationMetadata && citationMetadata.citationSources?.length > 0) {
      console.log('[AI Stage Flow Enhanced] Found citationMetadata with sources:', JSON.stringify(citationMetadata, null, 2));
      
      // Convert citationMetadata to groundingMetadata format
      const groundingMetadata: AiStageOutputSchema['groundingMetadata'] = {
        groundingChunks: citationMetadata.citationSources.map((source: any) => ({
          web: {
            uri: source.uri || '',
            title: '', // Citation sources don't typically include titles, we'll extract from content if needed
          },
        })).filter((chunk: any) => chunk.web.uri), // Filter out empty chunks
        groundingSupports: citationMetadata.citationSources.map((source: any, index: number) => ({
          segment: {
            startIndex: source.startIndex,
            endIndex: source.endIndex,
            text: '', // We'd need to extract this from the response text based on indices
          },
          groundingChunkIndices: [index],
          confidenceScores: [],
        })),
        webSearchQueries: [], // Not available in citation metadata
      };

      console.log('[AI Stage Flow Enhanced] Converted citationMetadata to groundingMetadata:', JSON.stringify(groundingMetadata, null, 2));
      return groundingMetadata;
    }
    
    return undefined;
  }
  
  console.log('[AI Stage Flow Enhanced] Raw grounding metadata found:', JSON.stringify(rawMetadata, null, 2));

  // Defensive check for crucial parts
  if (!rawMetadata.searchEntryPoint && !rawMetadata.webSearchQueries && !rawMetadata.groundingChunks) {
    console.log('[AI Stage Flow Enhanced] Raw metadata does not contain expected grounding fields (searchEntryPoint, webSearchQueries, groundingChunks).');
    return undefined;
  }
  
  const extracted: AiStageOutputSchema['groundingMetadata'] = {
    searchEntryPoint: rawMetadata.searchEntryPoint ? {
      renderedContent: rawMetadata.searchEntryPoint.renderedContent || '',
      // map other searchEntryPoint fields if they exist
    } : undefined,
    groundingChunks: (rawMetadata.groundingChunks || []).map((chunk: any) => ({
      web: {
        uri: chunk.web?.uri || (typeof chunk.uri === 'string' ? chunk.uri : ''), // Handle slightly different structures
        title: chunk.web?.title || (typeof chunk.title === 'string' ? chunk.title : ''),
      },
    })).filter((chunk:any) => chunk.web.uri), // Filter out empty chunks
    groundingSupports: (rawMetadata.groundingSupports || []).map((support: any) => ({
      segment: {
        startIndex: support.segment?.startIndex,
        endIndex: support.segment?.endIndex,
        text: support.segment?.text || '',
      },
      groundingChunkIndices: support.groundingChunkIndices || [],
      confidenceScores: support.confidenceScores || [],
    })),
    webSearchQueries: rawMetadata.webSearchQueries || [],
  };

  // Only return the object if it has meaningful data
  if (extracted.webSearchQueries?.length || extracted.groundingChunks?.length || extracted.searchEntryPoint?.renderedContent) {
    console.log('[AI Stage Flow Enhanced] Successfully extracted grounding metadata:', JSON.stringify(extracted, null, 2));
    return extracted;
  }
  console.log('[AI Stage Flow Enhanced] Extracted grounding metadata was empty.');
  return undefined;
}

function logToAiLog(message: string, data?: any) {
  const timestamp = new Date().toISOString();
  const logEntry = data 
    ? `${timestamp} ${message} ${JSON.stringify(data, null, 2)}\n`
    : `${timestamp} ${message}\n`;
  
  try {
    const logPath = join(process.cwd(), 'logs', 'ai.log');
    appendFileSync(logPath, logEntry);
  } catch (error) {
    console.error('Failed to write to ai.log:', error);
  }
}

// Export for compatibility
export { aiStageExecutionFlow as aiStageExecution };