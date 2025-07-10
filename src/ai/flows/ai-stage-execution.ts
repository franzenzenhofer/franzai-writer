'use server';
import 'server-only';

import {z} from 'zod';
import { generateWithDirectGemini, type DirectGeminiRequest } from '@/ai/direct-gemini';
import { appendFileSync } from 'fs';
import { join } from 'path';
import { cleanAiResponse } from '@/lib/ai-content-cleaner';

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
      urls: z.array(z.string()).optional(),
      extractUrlsFromInput: z.boolean().optional(),
    }).optional(),
  }).optional(),
  functionCallingMode: z.enum(['AUTO', 'ANY', 'NONE']).optional(),
  // Streaming removed
  // Flag to force Google Search grounding for AI Redo functionality
  forceGoogleSearchGrounding: z.boolean().optional(),
  // Image generation settings
  imageGenerationSettings: z.object({
    provider: z.enum(['gemini', 'imagen']).optional(),
    aspectRatio: z.string().optional(),
    numberOfImages: z.number().optional(),
    style: z.string().optional(),
    negativePrompt: z.string().optional(),
    gemini: z.object({
      responseModalities: z.array(z.string()).optional(),
    }).optional(),
    imagen: z.object({
      personGeneration: z.enum(['dont_allow', 'allow_adult', 'allow_all']).optional(),
    }).optional(),
  }).optional(),
  stageOutputType: z.string().optional(), // To know if this is an image generation stage
  // CRITICAL: Asset management parameters for image generation
  userId: z.string().optional(),
  documentId: z.string().optional(),
  stageId: z.string().optional(),
  // Add workflow and stage context for logging
  workflow: z.object({
    id: z.string().optional(),
    name: z.string(),
    description: z.string().optional(),
  }).optional(),
  stage: z.object({
    id: z.string().optional(),
    name: z.string(),
    description: z.string().optional(),
  }).optional(),
  // Add context variables for template resolution
  contextVars: z.record(z.any()).optional(),
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
  content: z.any().describe('Final accumulated response if streaming, or direct response. Can be string or ImageOutputData.'),
  thinkingSteps: z.array(ThinkingStepSchema).optional(),
  outputImages: z.array(z.object({ name: z.string().optional(), base64Data: z.string(), mimeType: z.string() })).optional(),

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
  // URL Context metadata structure
  urlContextMetadata: z.object({
    urlMetadata: z.array(z.object({
      retrievedUrl: z.string(),
      urlRetrievalStatus: z.string(),
    })).optional(),
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
  usageMetadata: z.object({
    thoughtsTokenCount: z.number().optional(),
    candidatesTokenCount: z.number().optional(),
    totalTokenCount: z.number().optional(),
    promptTokenCount: z.number().optional(),
  }).optional(),
});
export type AiStageOutputSchema = z.infer<typeof AiStageOutputSchema>;

// Enhanced AI stage execution flow with proper Google Search grounding implementation
export async function aiStageExecutionFlow(
  input: AiStageExecutionInput
): Promise<AiStageOutputSchema> {
    // Input validation - fail fast if essential data is missing
    if (!input) {
      const error = new Error('AI Stage Execution: No input provided');
      logToAiLog('[AI STAGE EXECUTION ERROR]', {
        error: error.message,
        stack: error.stack
      });
      throw error;
    }

    let {
      promptTemplate, model, temperature, imageData,
      thinkingSettings, toolNames, fileInputs,
      systemInstructions, chatHistory, groundingSettings,
      functionCallingMode, forceGoogleSearchGrounding,
      imageGenerationSettings, stageOutputType,
      userId, documentId, stageId,
      workflow, stage
    } = input;

    // Create context string for error messages
    const contextInfo = {
      workflowName: workflow?.name || 'unknown',
      stageName: stage?.name || 'unknown',
      stageId: stage?.id || stageId || 'unknown',
      model: model || 'default'
    };

    try {

    console.log('[AI Stage Flow Enhanced] Starting with input:', {
      model: model || 'default',
      hasTools: !!(toolNames?.length),
      hasGrounding: !!(groundingSettings?.googleSearch?.enabled || groundingSettings?.urlContext?.enabled),
      forceGoogleSearchGrounding: !!forceGoogleSearchGrounding,
      hasThinking: thinkingSettings?.enabled,
      isStreaming: false, // Streaming removed
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

    // Check if this is an image generation stage
    if (stageOutputType === 'image' && imageGenerationSettings) {
      console.log('[AI Stage Flow Enhanced] Image generation requested', {
        hasUserId: !!userId,
        hasDocumentId: !!documentId,
        hasStageId: !!stageId
      });
      
      try {
        const { generateImages } = await import('@/lib/ai-image-generator');
        
        // Validate required parameters for image generation
        if (!promptTemplate) {
          const error = new Error(`Image generation failed: No prompt template provided for stage '${contextInfo.stageName}' in workflow '${contextInfo.workflowName}'`);
          logToAiLog('[AI STAGE EXECUTION ERROR - IMAGE GENERATION]', {
            error: error.message,
            stack: error.stack,
            context: contextInfo,
            issue: 'missing_prompt_template'
          });
          throw error;
        }
        
        const imageResult = await generateImages({
          prompt: promptTemplate, // This is already the resolved prompt from aiActions-new.ts
          settings: imageGenerationSettings,
          userId,
          documentId,
          stageId
        });
        
        // Return the image data as content
        return {
          content: imageResult,
          thinkingSteps: []
        };
      } catch (error: any) {
        const enhancedError = new Error(
          `Image generation failed for stage '${contextInfo.stageName}' in workflow '${contextInfo.workflowName}': ${error.message}`
        );
        
        logToAiLog('[AI STAGE EXECUTION ERROR - IMAGE GENERATION]', {
          error: enhancedError.message,
          originalError: error.message,
          stack: error.stack,
          context: contextInfo,
          settings: imageGenerationSettings,
          hasPrompt: !!promptTemplate
        });
        
        console.error('[AI Stage Flow Enhanced] Image generation failed:', enhancedError);
        throw enhancedError;
      }
    }

    // Initialize response tracking
    let currentThinkingSteps: ThinkingStep[] = [];

    // Load tools if requested
    let availableTools: any[] = [];
    if (toolNames && toolNames.length > 0) {
      try {
        // Import tool definitions (not actual tools)
        const { toolDefinitions } = await import('@/ai/tools/tool-definitions');
        
        // Filter and prepare tools for Gemini
        const requestedTools = toolDefinitions.filter(def => toolNames.includes(def.name));
        
        // Validate that requested tools were found
        const foundToolNames = requestedTools.map(def => def.name);
        const missingTools = toolNames.filter(name => !foundToolNames.includes(name) && name !== 'codeInterpreter');
        
        if (missingTools.length > 0) {
          const error = new Error(
            `Tools not found for stage '${contextInfo.stageName}' in workflow '${contextInfo.workflowName}': ${missingTools.join(', ')}. Available tools: ${toolDefinitions.map(def => def.name).join(', ')}`
          );
          
          logToAiLog('[AI STAGE EXECUTION ERROR - TOOL LOADING]', {
            error: error.message,
            stack: error.stack,
            context: contextInfo,
            requestedTools: toolNames,
            foundTools: foundToolNames,
            missingTools: missingTools,
            availableTools: toolDefinitions.map(def => def.name)
          });
          
          throw error;
        }
        
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
        const enhancedError = new Error(
          `Failed to load tools for stage '${contextInfo.stageName}' in workflow '${contextInfo.workflowName}': ${error instanceof Error ? error.message : String(error)}`
        );
        
        logToAiLog('[AI STAGE EXECUTION ERROR - TOOL LOADING]', {
          error: enhancedError.message,
          originalError: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          context: contextInfo,
          requestedTools: toolNames
        });
        
        console.error('[AI Stage Flow Enhanced] Failed to prepare tools:', enhancedError);
        throw enhancedError;
      }
    }

    // OLD URL grounding approach removed - now using native Gemini API urlContext tool
    // The native approach is handled in the direct API calls above

    // Build prompt parts - with error handling
    let currentPromptMessageParts: any[];
    let callHistory: any[];
    
    try {
      currentPromptMessageParts = [];
      
      if (promptTemplate) {
        currentPromptMessageParts.push({ text: promptTemplate });
      }
      
      if (imageData?.data) {
        // Validate image data format
        if (!imageData.mimeType || !imageData.data) {
          const error = new Error(
            `Invalid image data format for stage '${contextInfo.stageName}' in workflow '${contextInfo.workflowName}': missing mimeType or data`
          );
          
          logToAiLog('[AI STAGE EXECUTION ERROR - PROMPT BUILDING]', {
            error: error.message,
            stack: error.stack,
            context: contextInfo,
            imageData: { hasMimeType: !!imageData.mimeType, hasData: !!imageData.data }
          });
          
          throw error;
        }
        
        currentPromptMessageParts.push({ inlineData: { mimeType: imageData.mimeType, data: imageData.data } });
      }
      
      if (fileInputs?.length) {
        for (const file of fileInputs) {
          if (!file.uri || !file.mimeType) {
            const error = new Error(
              `Invalid file input format for stage '${contextInfo.stageName}' in workflow '${contextInfo.workflowName}': missing uri or mimeType`
            );
            
            logToAiLog('[AI STAGE EXECUTION ERROR - PROMPT BUILDING]', {
              error: error.message,
              stack: error.stack,
              context: contextInfo,
              fileInput: { hasUri: !!file.uri, hasMimeType: !!file.mimeType }
            });
            
            throw error;
          }
          
          currentPromptMessageParts.push({ fileData: { uri: file.uri, mimeType: file.mimeType } });
        }
      }

      // Build chat history
      callHistory = chatHistory ? [...chatHistory] : [];
      if (currentPromptMessageParts.length > 0) {
        callHistory.push({ role: 'user', parts: currentPromptMessageParts });
      }
      
      console.log('[AI Stage Flow Enhanced] Chat history built:', {
        hasExistingHistory: !!chatHistory,
        currentPromptParts: currentPromptMessageParts.length,
        callHistoryLength: callHistory.length,
        promptTemplateLength: promptTemplate?.length || 0
      });
    } catch (error: any) {
      const enhancedError = new Error(
        `Failed to build prompt for stage '${contextInfo.stageName}' in workflow '${contextInfo.workflowName}': ${error.message}`
      );
      
      logToAiLog('[AI STAGE EXECUTION ERROR - PROMPT BUILDING]', {
        error: enhancedError.message,
        originalError: error.message,
        stack: error.stack,
        context: contextInfo,
        inputs: {
          hasPromptTemplate: !!promptTemplate,
          hasImageData: !!imageData,
          hasFileInputs: !!fileInputs?.length,
          hasChatHistory: !!chatHistory
        }
      });
      
      throw enhancedError;
    }

    // Handle system instructions
    try {
      if (systemInstructions) {
        if (callHistory.length > 0 && callHistory[0].role === 'system') {
          callHistory[0] = { role: 'system', parts: [{ text: systemInstructions }] };
        } else {
          callHistory.unshift({ role: 'system', parts: [{ text: systemInstructions }] });
        }
      }
    } catch (error: any) {
      const enhancedError = new Error(
        `Failed to process system instructions for stage '${contextInfo.stageName}' in workflow '${contextInfo.workflowName}': ${error.message}`
      );
      
      logToAiLog('[AI STAGE EXECUTION ERROR - SYSTEM INSTRUCTIONS]', {
        error: enhancedError.message,
        originalError: error.message,
        stack: error.stack,
        context: contextInfo,
        hasSystemInstructions: !!systemInstructions
      });
      
      throw enhancedError;
    }

    // Determine the model to use
    let modelToUse: string;
    try {
      modelToUse = model || 'googleai/gemini-2.0-flash';
      
      // Use thinking model if thinking is enabled.
      // As per the guide, only 2.5 models support thinking.
      // We will automatically switch to a thinking-capable model if needed.
      if (thinkingSettings?.enabled) {
        const isThinkingModel = modelToUse.includes('gemini-2.5-flash') || modelToUse.includes('gemini-2.5-pro');
        
        if (!isThinkingModel) {
           console.log(`[AI Stage Flow Enhanced] Model ${modelToUse} does not support thinking. Switching to googleai/gemini-2.5-flash-preview as requested for thinking jobs.`);
           modelToUse = 'googleai/gemini-2.5-flash-preview';
        }
        console.log('[AI Stage Flow Enhanced] Using thinking model:', modelToUse);
      }
    } catch (error: any) {
      const enhancedError = new Error(
        `Failed to configure model for stage '${contextInfo.stageName}' in workflow '${contextInfo.workflowName}': ${error.message}`
      );
      
      logToAiLog('[AI STAGE EXECUTION ERROR - MODEL CONFIGURATION]', {
        error: enhancedError.message,
        originalError: error.message,
        stack: error.stack,
        context: contextInfo,
        requestedModel: model,
        thinkingEnabled: thinkingSettings?.enabled
      });
      
      throw enhancedError;
    }

    // CRITICAL: Implement proper Google Search grounding using direct API
    const shouldEnableGoogleSearch = 
      forceGoogleSearchGrounding || 
      groundingSettings?.googleSearch?.enabled;

    // CRITICAL: Implement proper URL Context grounding using direct API
    let urlsToProcess: string[] = [];
    
    try {
      if (groundingSettings?.urlContext?.enabled) {
        if (groundingSettings.urlContext.extractUrlsFromInput && promptTemplate) {
          // Extract URLs from the input text using regex
          const urlRegex = /(https?:\/\/[^\s]+)/g;
          const extractedUrls = promptTemplate.match(urlRegex) || [];
          urlsToProcess = [...new Set(extractedUrls)]; // Remove duplicates
          console.log('[AI Stage Flow Enhanced] Extracted URLs from input:', urlsToProcess);
        } else if (groundingSettings.urlContext.urls && groundingSettings.urlContext.urls.length > 0) {
          urlsToProcess = groundingSettings.urlContext.urls;
          console.log('[AI Stage Flow Enhanced] Using predefined URLs:', urlsToProcess);
        }
        
        // Validate extracted URLs
        const invalidUrls = urlsToProcess.filter(url => {
          try {
            new URL(url);
            return false;
          } catch {
            return true;
          }
        });
        
        if (invalidUrls.length > 0) {
          const error = new Error(
            `Invalid URLs found for URL Context grounding in stage '${contextInfo.stageName}' in workflow '${contextInfo.workflowName}': ${invalidUrls.join(', ')}`
          );
          
          logToAiLog('[AI STAGE EXECUTION ERROR - URL CONTEXT]', {
            error: error.message,
            stack: error.stack,
            context: contextInfo,
            invalidUrls: invalidUrls,
            allUrls: urlsToProcess
          });
          
          throw error;
        }
      }
    } catch (error: any) {
      if (error.message.includes('Invalid URLs found')) {
        throw error; // Re-throw our own validation errors
      }
      
      const enhancedError = new Error(
        `Failed to process URL Context grounding for stage '${contextInfo.stageName}' in workflow '${contextInfo.workflowName}': ${error.message}`
      );
      
      logToAiLog('[AI STAGE EXECUTION ERROR - URL CONTEXT]', {
        error: enhancedError.message,
        originalError: error.message,
        stack: error.stack,
        context: contextInfo,
        groundingSettings: groundingSettings?.urlContext
      });
      
      throw enhancedError;
    }
    
    const shouldEnableUrlContext = 
      groundingSettings?.urlContext?.enabled && 
      urlsToProcess.length > 0;

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
    if (shouldEnableGoogleSearch || shouldEnableUrlContext) {
      console.log('🚀🚀🚀 GROUNDING REQUESTED! 🚀🚀🚀');
      if (shouldEnableGoogleSearch) {
        console.log('🔧 Using Direct Gemini API with proper googleSearch tool...');
      }
      if (shouldEnableUrlContext) {
        console.log('🌐 Using Direct Gemini API with proper urlContext tool...');
        console.log('🔗 URLs to process:', urlsToProcess);
        
        // If URLs were extracted from input, don't add them again to avoid duplication
        if (groundingSettings.urlContext?.extractUrlsFromInput) {
          console.log('🔍 URLs extracted from input text - using as-is for URL Context');
        } else {
          // Add URLs to the prompt for URL Context tool (legacy behavior)
          const urlsString = urlsToProcess.join(' ');
          if (!promptTemplate.includes(urlsString)) {
            promptTemplate = `${promptTemplate}\n\nPlease analyze content from these URLs: ${urlsString}`;
          }
        }
      }
      
      // Use direct API path for grounding
      return await executeWithDirectGeminiAPI(
        {
          model: modelToUse,
          prompt: promptTemplate,
          temperature: temperature ?? 0.1, // Low temperature for grounding accuracy
          systemInstruction: systemInstructions,
          enableGoogleSearch: shouldEnableGoogleSearch,
          enableUrlContext: shouldEnableUrlContext,
          urlsToProcess: urlsToProcess, // Pass extracted URLs
          dynamicRetrievalThreshold: groundingSettings?.googleSearch?.dynamicThreshold,
          // Thinking configuration
          enableThinking: thinkingSettings?.enabled,
          thinkingBudget: thinkingSettings?.thinkingBudget,
          includeThoughts: true, // Always include thoughts when thinking is enabled
          tools: availableTools,
          // Add workflow/stage context
          workflowName: workflow?.name,
          stageName: stage?.name,
          stageId: stage?.id || stageId,
          contextVars: input.contextVars
        },
        currentThinkingSteps,
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

    // Always use direct Gemini API
    try {
      return await executeWithDirectGeminiAPI(
        {
          model: modelToUse,
          prompt: promptTemplate,
          temperature: temperature ?? 0.7,
          systemInstruction: systemInstructions,
          tools: availableTools,
          enableGoogleSearch: false,
          enableUrlContext: false
        },
        currentThinkingSteps,
        input
      );
    } catch (error: any) {
      const enhancedError = new Error(
        `Direct Gemini API execution failed for stage '${contextInfo.stageName}' in workflow '${contextInfo.workflowName}': ${error.message}`
      );
      
      logToAiLog('[AI STAGE EXECUTION ERROR - DIRECT GEMINI API]', {
        error: enhancedError.message,
        originalError: error.message,
        stack: error.stack,
        context: contextInfo,
        model: modelToUse,
        hasPrompt: !!promptTemplate,
        hasTools: availableTools.length > 0
      });
      
      throw enhancedError;
    }
  } catch (error: any) {
    // Top-level error handler for the entire function
    const enhancedError = new Error(
      `AI Stage Execution failed for stage '${contextInfo.stageName}' in workflow '${contextInfo.workflowName}': ${error.message}`
    );
    
    logToAiLog('[AI STAGE EXECUTION ERROR - TOP LEVEL]', {
      error: enhancedError.message,
      originalError: error.message,
      stack: error.stack,
      context: contextInfo,
      inputSummary: {
        hasPromptTemplate: !!promptTemplate,
        hasImageData: !!imageData,
        hasTools: !!(toolNames?.length),
        hasGrounding: !!(groundingSettings?.googleSearch?.enabled || groundingSettings?.urlContext?.enabled),
        isImageGeneration: stageOutputType === 'image'
      }
    });
    
    throw enhancedError;
  }
}

// Direct Gemini API execution for all generation cases
async function executeWithDirectGeminiAPI(
  request: DirectGeminiRequest,
  thinkingSteps: ThinkingStep[],
  originalInput?: AiStageExecutionInput
): Promise<AiStageOutputSchema> {
  // Validate inputs
  if (!request) {
    const error = new Error('Direct Gemini API: No request provided');
    logToAiLog('[DIRECT GEMINI API ERROR - VALIDATION]', {
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
  
  if (!request.prompt && !request.systemInstruction) {
    const error = new Error('Direct Gemini API: No prompt or system instruction provided');
    logToAiLog('[DIRECT GEMINI API ERROR - VALIDATION]', {
      error: error.message,
      stack: error.stack,
      request: {
        model: request.model,
        hasPrompt: !!request.prompt,
        hasSystemInstruction: !!request.systemInstruction
      }
    });
    throw error;
  }
  
  const contextInfo = {
    workflowName: request.workflowName || originalInput?.workflow?.name || 'unknown',
    stageName: request.stageName || originalInput?.stage?.name || 'unknown',
    stageId: request.stageId || originalInput?.stage?.id || originalInput?.stageId || 'unknown',
    model: request.model || 'unknown'
  };
  
  console.log('[Direct Gemini API] Starting execution');
  
  // LOG FULL REQUEST TO DIRECT GEMINI API
  logToAiLog('[DIRECT GEMINI API REQUEST - FULL]', {
    request: {
      ...request,
      // Don't log the full system prompt, just structure
      systemInstruction: request.systemInstruction ? request.systemInstruction.substring(0, 100) + '...' : undefined,
      prompt: request.prompt ? request.prompt.substring(0, 100) + '...' : undefined,
      temperature: request.temperature,
      maxOutputTokens: request.maxOutputTokens,
      hasGroundingConfig: !!request.tools?.some((tool: any) => tool.googleSearchRetrieval),
      groundingConfig: request.tools?.find((tool: any) => tool.googleSearchRetrieval) || undefined
    },
    originalInput: originalInput ? {
      model: originalInput.model,
      hasGroundingSettings: !!originalInput.groundingSettings,
      groundingSettings: originalInput.groundingSettings
    } : undefined,
    context: contextInfo
  });
  
  try {
    console.log('[Direct Gemini API] Using non-streaming mode');
    
    const result = await generateWithDirectGemini(request);
    
    // Validate result
    if (!result) {
      const error = new Error(
        `Direct Gemini API returned null/undefined result for stage '${contextInfo.stageName}' in workflow '${contextInfo.workflowName}'`
      );
      
      logToAiLog('[DIRECT GEMINI API ERROR - INVALID RESULT]', {
        error: error.message,
        stack: error.stack,
        context: contextInfo,
        request: {
          model: request.model,
          hasPrompt: !!request.prompt,
          temperature: request.temperature
        }
      });
      
      throw error;
    }
    
    try {
      // LOG FULL NON-STREAMING RESULT
      logToAiLog('[DIRECT GEMINI NON-STREAMING RESULT]', {
        hasContent: !!result.content,
        contentLength: result.content?.length || 0,
        contentPreview: result.content?.substring(0, 200) + '...' || '',
        hasGroundingMetadata: !!result.groundingMetadata,
        groundingMetadataKeys: result.groundingMetadata ? Object.keys(result.groundingMetadata) : [],
        hasGroundingSources: !!result.groundingSources,
        groundingSourcesCount: result.groundingSources?.length || 0,
        groundingSourcesPreview: result.groundingSources?.slice(0, 2),
        allResultKeys: Object.keys(result),
        context: contextInfo
      });
      
      // LOG FULL GROUNDING METADATA IF PRESENT
      if (result.groundingMetadata) {
        try {
          logToAiLog('[DIRECT GEMINI GROUNDING METADATA - FULL]', result.groundingMetadata);

          // Use enhanced grounding metadata logging
          const { logGroundingMetadata } = await import('@/lib/ai-logger');
          logGroundingMetadata(result.groundingMetadata);
        } catch (error: any) {
          console.error('[Direct Gemini API] Failed to log grounding metadata:', error);
          // Continue processing - logging failures should not break the flow
        }
      }
      
      // LOG FULL GROUNDING SOURCES IF PRESENT
      if (result.groundingSources) {
        try {
          logToAiLog('[DIRECT GEMINI GROUNDING SOURCES - FULL]', result.groundingSources);
          
          // Use enhanced grounding sources logging
          const { logGroundingSources } = await import('@/lib/ai-logger');
          logGroundingSources(result.groundingSources);
        } catch (error: any) {
          console.error('[Direct Gemini API] Failed to log grounding sources:', error);
          // Continue processing - logging failures should not break the flow
        }
      }

      // LOG FULL URL CONTEXT METADATA IF PRESENT  
      if (result.urlContextMetadata) {
        try {
          logToAiLog('[DIRECT GEMINI URL CONTEXT METADATA - FULL]', result.urlContextMetadata);
          
          // Use enhanced URL context metadata logging
          const { logUrlContextMetadata } = await import('@/lib/ai-logger');
          logUrlContextMetadata(result.urlContextMetadata);
        } catch (error: any) {
          console.error('[Direct Gemini API] Failed to log URL context metadata:', error);
          // Continue processing - logging failures should not break the flow
        }
      }

      // LOG FULL THINKING METADATA IF PRESENT
      if (result.thinkingSteps && result.thinkingSteps.length > 0) {
        try {
          logToAiLog('[DIRECT GEMINI THINKING STEPS - FULL]', result.thinkingSteps);
          
          // Use enhanced thinking metadata logging
          const { logThinkingMetadata } = await import('@/lib/ai-logger');
          logThinkingMetadata(result.thinkingSteps, result.usageMetadata);
          
          // Convert Direct Gemini thinking steps to our internal format
          for (const thinkingStep of result.thinkingSteps) {
            if (thinkingStep.type === 'thought' && thinkingStep.text) {
              thinkingSteps.push({
                type: 'textLog',
                message: `Thought Summary: ${thinkingStep.text}`
              });
            }
          }
        } catch (error: any) {
          console.error('[Direct Gemini API] Failed to process thinking steps:', error);
          // Continue processing - thinking step failures should not break the flow
        }
      }
      
      console.log('[Direct Gemini API] Generation completed successfully');
      
      // Clean the AI response content to remove code fences and formatting
      let cleanedContent;
      try {
        cleanedContent = result.content ? 
          cleanAiResponse(result.content, (originalInput as any)?.stageOutputType || 'text') : 
          result.content;
      } catch (error: any) {
        console.error('[Direct Gemini API] Failed to clean AI response content:', error);
        // Use original content if cleaning fails
        cleanedContent = result.content;
      }
      
      const processedResult = {
        content: cleanedContent,
        thinkingSteps: thinkingSteps.length > 0 ? thinkingSteps : undefined,
        groundingMetadata: result.groundingMetadata,
        urlContextMetadata: result.urlContextMetadata,
        groundingSources: result.groundingSources?.map(source => ({
          type: 'search' as const,
          title: source.title,
          url: source.uri,
          snippet: source.snippet
        })),
        usageMetadata: result.usageMetadata,
      };
      
      // LOG PROCESSED RESULT BEING RETURNED
      logToAiLog('[DIRECT GEMINI PROCESSED RESULT - NON-STREAMING]', {
        hasContent: !!processedResult.content,
        hasGroundingMetadata: !!processedResult.groundingMetadata,
        hasGroundingSources: !!processedResult.groundingSources,
        groundingSourcesCount: processedResult.groundingSources?.length || 0,
        allProcessedKeys: Object.keys(processedResult),
        context: contextInfo
      });
      
      return processedResult;
    } catch (error: any) {
      // Enhanced error for result processing failures
      const enhancedError = new Error(
        `Failed to process Direct Gemini API result for stage '${contextInfo.stageName}' in workflow '${contextInfo.workflowName}': ${error.message}`
      );
      
      logToAiLog('[DIRECT GEMINI API ERROR - RESULT PROCESSING]', {
        error: enhancedError.message,
        originalError: error.message,
        stack: error.stack,
        context: contextInfo,
        resultStructure: result ? Object.keys(result) : 'no result'
      });
      
      throw enhancedError;
    }
    
  } catch (error: unknown) {
    // Enhanced error for API call failures
    const enhancedError = new Error(
      `Direct Gemini API call failed for stage '${contextInfo.stageName}' in workflow '${contextInfo.workflowName}': ${error instanceof Error ? error.message : String(error)}`
    );
    
    logToAiLog('[DIRECT GEMINI API ERROR - API CALL]', {
      error: enhancedError.message,
      originalError: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      context: contextInfo,
      request: {
        model: request.model,
        hasPrompt: !!request.prompt,
        hasSystemInstruction: !!request.systemInstruction,
        temperature: request.temperature,
        enableGoogleSearch: request.enableGoogleSearch,
        enableUrlContext: request.enableUrlContext
      }
    });
    
    console.error('[Direct Gemini API] Execution failed:', enhancedError);
    throw enhancedError;
  }
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
    // FAIL FAST: Log writing errors should not break the flow, but should be reported
    console.error('CRITICAL: Failed to write to ai.log - logging system failure:', error);
    console.error('Log entry that failed to write:', logEntry);
    
    // Don't throw - logging failures should not break AI execution
    // This follows the principle of failing fast on core functionality
    // while allowing auxiliary systems (like logging) to fail gracefully
  }
}

// Export for compatibility
export { aiStageExecutionFlow as aiStageExecution };