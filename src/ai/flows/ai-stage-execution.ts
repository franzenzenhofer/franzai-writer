'use server';
import 'server-only';

import {z} from 'zod';
import { generateWithDirectGemini, type DirectGeminiRequest } from '@/ai/direct-gemini';
import { appendFileSync } from 'fs';
import { join } from 'path';
import { cleanAiResponse } from '@/lib/ai-content-cleaner';
import type { 
  ChatHistoryMessage, 
  MessagePart, 
  ThinkingStep, 
  ContextVariables, 
  ToolDefinition, 
  GroundingMetadata, 
  GroundingSource, 
  UrlContextMetadata, 
  FunctionCallMetadata, 
  CodeExecutionResult, 
  UsageMetadata
} from '@/types/ai-interfaces';

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
    parts: z.array(z.object({
      text: z.string().optional(),
      inlineData: z.object({
        mimeType: z.string(),
        data: z.string()
      }).optional(),
      fileData: z.object({
        uri: z.string(),
        mimeType: z.string()
      }).optional()
    })),
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
  contextVars: z.record(z.union([z.string(), z.number(), z.boolean(), z.object({}), z.null()])).optional(),
});
export type AiStageExecutionInput = z.infer<typeof AiStageExecutionInputSchema>;

// Structured Thinking Steps
const ToolCallRequestSchema = z.object({ type: z.literal('toolRequest'), toolName: z.string(), input: z.record(z.union([z.string(), z.number(), z.boolean(), z.object({}), z.null()])) });
const ToolCallResponseSchema = z.object({ type: z.literal('toolResponse'), toolName: z.string(), output: z.record(z.union([z.string(), z.number(), z.boolean(), z.object({}), z.null()])) });
const TextLogSchema = z.object({ type: z.literal('textLog'), message: z.string() });
const ThinkingStepSchema = z.union([ToolCallRequestSchema, ToolCallResponseSchema, TextLogSchema]);
export type ThinkingStep = z.infer<typeof ThinkingStepSchema>;

// Output Schema including proper grounding metadata structure
const AiStageOutputSchema = z.object({
  content: z.union([z.string(), z.object({})]).describe('Final accumulated response if streaming, or direct response. Can be string or ImageOutputData.'),
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
    input: z.record(z.union([z.string(), z.number(), z.boolean(), z.object({}), z.null()])),
    output: z.record(z.union([z.string(), z.number(), z.boolean(), z.object({}), z.null()])),
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
    let {
      promptTemplate, model, temperature, imageData,
      thinkingSettings, toolNames, fileInputs,
      systemInstructions, chatHistory, groundingSettings,
      functionCallingMode, forceGoogleSearchGrounding,
      imageGenerationSettings, stageOutputType,
      userId, documentId, stageId,
      workflow, stage
    } = input;

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
      
      const { generateImages } = await import('@/lib/ai-image-generator');
      
      try {
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
        console.error('[AI Stage Flow Enhanced] Image generation failed:', error);
        throw new Error(`Image generation failed: ${error.message}`);
      }
    }

    // Initialize response tracking
    let currentThinkingSteps: ThinkingStep[] = [];

    // Load tools if requested
    let availableTools: ToolDefinition[] = [];
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

    // OLD URL grounding approach removed - now using native Gemini API urlContext tool
    // The native approach is handled in the direct API calls above

    // Build prompt parts
    const currentPromptMessageParts: MessagePart[] = [];
    if (promptTemplate) currentPromptMessageParts.push({ text: promptTemplate });
    if (imageData?.data) currentPromptMessageParts.push({ inlineData: { mimeType: imageData.mimeType, data: imageData.data } });
    if (fileInputs?.length) fileInputs.forEach((file) => currentPromptMessageParts.push({ fileData: { uri: file.uri, mimeType: file.mimeType } }));

    // Build chat history
    let callHistory: ChatHistoryMessage[] = chatHistory ? [...chatHistory] : [];
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

    // CRITICAL: Implement proper Google Search grounding using direct API
    const shouldEnableGoogleSearch = 
      forceGoogleSearchGrounding || 
      groundingSettings?.googleSearch?.enabled;

    // CRITICAL: Implement proper URL Context grounding using direct API
    let urlsToProcess: string[] = [];
    
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
      tools: [] as ToolDefinition[],
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
        (generateOptions as { functionCallingMode?: string }).functionCallingMode = functionCallingMode;
      }
    }

    // Always use direct Gemini API
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
  }

// Direct Gemini API execution for all generation cases
async function executeWithDirectGeminiAPI(
  request: DirectGeminiRequest,
  thinkingSteps: ThinkingStep[],
  originalInput?: AiStageExecutionInput
): Promise<AiStageOutputSchema> {
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
    } : undefined
  });
  
  try {
    console.log('[Direct Gemini API] Using non-streaming mode');
    
    const result = await generateWithDirectGemini(request);
    
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
      allResultKeys: Object.keys(result)
    });
    
    // LOG FULL GROUNDING METADATA IF PRESENT
    if (result.groundingMetadata) {
      logToAiLog('[DIRECT GEMINI GROUNDING METADATA - FULL]', result.groundingMetadata);

      // Use enhanced grounding metadata logging
      const { logGroundingMetadata } = await import('@/lib/ai-logger');
      logGroundingMetadata(result.groundingMetadata);
    }
    
    // LOG FULL GROUNDING SOURCES IF PRESENT
    if (result.groundingSources) {
      logToAiLog('[DIRECT GEMINI GROUNDING SOURCES - FULL]', result.groundingSources);
      
      // Use enhanced grounding sources logging
      const { logGroundingSources } = await import('@/lib/ai-logger');
      logGroundingSources(result.groundingSources);
    }

    // LOG FULL URL CONTEXT METADATA IF PRESENT  
    if (result.urlContextMetadata) {
      logToAiLog('[DIRECT GEMINI URL CONTEXT METADATA - FULL]', result.urlContextMetadata);
      
      // Use enhanced URL context metadata logging
      const { logUrlContextMetadata } = await import('@/lib/ai-logger');
      logUrlContextMetadata(result.urlContextMetadata);
    }

    // LOG FULL THINKING METADATA IF PRESENT
    if (result.thinkingSteps && result.thinkingSteps.length > 0) {
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
    }
    
    console.log('[Direct Gemini API] Generation completed successfully');
    
    // Clean the AI response content to remove code fences and formatting
    const cleanedContent = result.content ? 
      cleanAiResponse(result.content, originalInput?.stageOutputType || 'text') : 
      result.content;
    
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
      allProcessedKeys: Object.keys(processedResult)
    });
    
    return processedResult;
    
  } catch (error: unknown) {
    // LOG DIRECT GEMINI ERROR
    logToAiLog('[DIRECT GEMINI API ERROR]', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    
    console.error('[Direct Gemini API] Execution failed:', error);
    throw error;
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
    console.error('Failed to write to ai.log:', error);
  }
}

// Export for compatibility
export { aiStageExecutionFlow as aiStageExecution };