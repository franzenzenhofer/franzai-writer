import { GoogleGenAI } from '@google/genai';
import { logAI } from '@/lib/ai-logger';
import { z } from 'zod';
import { validateAiResponseOrThrow } from '@/lib/ai-validation';

// Direct Gemini API client for Google Search grounding
let genAI: GoogleGenAI | null = null;

function initializeGenAI() {
  if (!genAI) {
    const apiKey = process.env.GOOGLE_GENAI_API_KEY;
    if (!apiKey) {
      throw new Error('GOOGLE_GENAI_API_KEY not found in environment variables');
    }
    genAI = new GoogleGenAI({ apiKey });
  }
  return genAI;
}

export interface DirectGeminiRequest {
  model: string;
  prompt: string;
  temperature?: number;
  systemInstruction?: string;
  enableGoogleSearch?: boolean;
  enableUrlContext?: boolean;
  urlsToProcess?: string[]; // Array of URLs for URL context grounding
  dynamicRetrievalThreshold?: number;
  maxOutputTokens?: number;
  tools?: any[];
  // Thinking mode configuration
  enableThinking?: boolean;
  thinkingBudget?: number;
  includeThoughts?: boolean;
  // Workflow and stage context for logging
  workflowName?: string;
  stageName?: string;
  stageId?: string;
  contextVars?: any;
}

// Zod schema for strict runtime validation of DirectGeminiResponse
const DirectGeminiResponseSchema = z.object({
  content: z.string(),
  groundingMetadata: z.object({
    searchEntryPoint: z.any().optional(),
    groundingChunks: z.array(z.any()).optional(),
    groundingSupports: z.array(z.any()).optional(),
    retrievalMetadata: z.any().optional(),
    webSearchQueries: z.array(z.string()).optional(),
  }).optional(),
  urlContextMetadata: z.object({
    urlMetadata: z.array(z.object({
      retrievedUrl: z.string(),
      urlRetrievalStatus: z.string(),
    })).optional(),
  }).optional(),
  groundingSources: z.array(z.object({
    title: z.string(),
    uri: z.string(),
    snippet: z.string().optional(),
  })).optional(),
  thinkingSteps: z.array(z.object({
    type: z.enum(['thought', 'textLog']),
    text: z.string().optional(),
    content: z.string().optional(),
    thought: z.boolean().optional(),
  })).optional(),
  usageMetadata: z.object({
    thoughtsTokenCount: z.number().optional(),
    candidatesTokenCount: z.number().optional(),
    totalTokenCount: z.number().optional(),
    promptTokenCount: z.number().optional(),
  }).optional(),
  candidates: z.array(z.any()).optional(),
  modelVersion: z.string().optional(),
});

export interface DirectGeminiResponse {
  content: string;
  groundingMetadata?: {
    searchEntryPoint?: any;
    groundingChunks?: any[];
    groundingSupports?: any[];
    retrievalMetadata?: any;
    webSearchQueries?: string[];
  };
  urlContextMetadata?: {
    urlMetadata?: Array<{
      retrievedUrl: string;
      urlRetrievalStatus: string;
    }>;
  };
  groundingSources?: Array<{
    title: string;
    uri: string;
    snippet?: string;
  }>;
  // Thinking mode fields
  thinkingSteps?: Array<{
    type: 'thought' | 'textLog';
    text?: string;
    content?: string;
    thought?: boolean;
  }>;
  usageMetadata?: any;
  candidates?: any[];
  modelVersion?: string;
}

export type DirectGeminiResponseType = z.infer<typeof DirectGeminiResponseSchema>;

export async function generateWithDirectGemini(request: DirectGeminiRequest): Promise<DirectGeminiResponse> {
  const client = initializeGenAI();
  
  console.log('🚀 [Direct Gemini] Starting generation with:', {
    model: request.model,
    hasPrompt: !!request.prompt,
    enableGoogleSearch: request.enableGoogleSearch,
    temperature: request.temperature
  });

  // Build the request
  const contents = [];
  
  // Add system instruction if provided
  if (request.systemInstruction) {
    contents.push({ text: request.systemInstruction });
  }
  
  // Add main prompt
  contents.push({ text: request.prompt });

  // Build config
  const config: any = {
    temperature: request.temperature ?? 0.7,
  };

  if (request.maxOutputTokens) {
    config.maxOutputTokens = request.maxOutputTokens;
  }

  // CRITICAL FIX: Only add thinkingConfig if thinking is explicitly enabled.
  // The API will error if thinkingConfig is present on non-thinking models.
  if (request.enableThinking === true) {
    console.log('🧠 [Direct Gemini] Adding thinking configuration because enableThinking is true');
    config.thinkingConfig = {
      includeThoughts: request.includeThoughts !== false, // Default to true
      thinkingBudget: request.thinkingBudget,
    };
    
    if (config.thinkingConfig.thinkingBudget) {
       console.log('🧠 [Direct Gemini] Thinking budget set to:', config.thinkingConfig.thinkingBudget);
    }
  }

  // Add tools
  const tools = [...(request.tools || [])];
  
  // Add Google Search grounding if enabled
  if (request.enableGoogleSearch) {
    console.log('✅ [Direct Gemini] Adding Google Search grounding');
    tools.push({ googleSearch: {} });
    
    // Add dynamic retrieval config if threshold is specified
    if (request.dynamicRetrievalThreshold !== undefined) {
      config.toolConfig = {
        googleSearch: {
          dynamicRetrieval: {
            threshold: request.dynamicRetrievalThreshold
          }
        }
      };
      console.log('🎯 [Direct Gemini] Dynamic retrieval threshold:', request.dynamicRetrievalThreshold);
    }
  }

  // Add URL Context grounding if enabled
  if (request.enableUrlContext) {
    console.log('✅ [Direct Gemini] Adding URL Context grounding');
    tools.push({ urlContext: {} });
  }

  // Add tools to config if any exist
  if (tools.length > 0) {
    config.tools = tools;
  }

  const directRequestLog = {
    model: request.model,
    contentsCount: contents.length,
    configKeys: Object.keys(config),
    toolsCount: tools.length,
    hasGoogleSearch: tools.some(t => t.googleSearch !== undefined)
  };
  console.log('📤 [Direct Gemini] API Request:', directRequestLog);
  logAI('REQUEST', { 
    type: 'Direct Gemini API', 
    ...directRequestLog, 
    prompt: request.prompt,
    tools: tools,
    systemInstruction: request.systemInstruction?.substring(0, 200),
    hasGroundingConfig: !!tools.find((tool: any) => tool.googleSearch),
    // Add workflow/stage context
    workflowName: request.workflowName,
    stageName: request.stageName,
    stageId: request.stageId,
    contextVars: request.contextVars
  });

  try {
    // Make the API call
    const response = await client.models.generateContent({
      model: request.model,
      contents,
      config
    });

    console.log('📥 [Direct Gemini] Raw response keys:', Object.keys(response));
    
    // 🔥 ENHANCED: Log the complete raw response structure for debugging
    console.log('🔍 [Direct Gemini] COMPLETE RAW RESPONSE:', JSON.stringify(response, null, 2));
    
    // Extract text content
    const content = response.text || '';
    
    // Extract grounding metadata
    let groundingMetadata: DirectGeminiResponse['groundingMetadata'];
    let urlContextMetadata: DirectGeminiResponse['urlContextMetadata'];
    let groundingSources: DirectGeminiResponse['groundingSources'] = [];
    let thinkingSteps: DirectGeminiResponse['thinkingSteps'] = [];
    
    if (response.candidates && response.candidates.length > 0) {
      const candidate = response.candidates[0];
      console.log('🔍 [Direct Gemini] Candidate keys:', Object.keys(candidate));
      
      // Check for thinking data in various possible locations
      if (response.usageMetadata?.thoughtsTokenCount) {
        console.log('🧠 [Direct Gemini] Thoughts token count detected:', response.usageMetadata.thoughtsTokenCount);
      }
      
      // Check if there are any thinking-related fields in the response
      const responseStr = JSON.stringify(response);
      if (responseStr.includes('thought') || responseStr.includes('thinking')) {
        console.log('🧠 [Direct Gemini] Response contains thinking-related content');
      }
      
      // Extract thinking steps - Gemini 2.5 thinking mode approach
      // Note: Gemini 2.5 API doesn't return actual thought content, only thoughtsTokenCount
      if (response.usageMetadata?.thoughtsTokenCount && response.usageMetadata.thoughtsTokenCount > 0) {
        console.log('🧠 [Direct Gemini] Thinking mode detected!');
        console.log('🧠 [Direct Gemini] Thoughts token count:', response.usageMetadata.thoughtsTokenCount);
        
        // Create a synthetic thinking step to show that thinking occurred
        const thinkingTokens = response.usageMetadata.thoughtsTokenCount;
        const outputTokens = response.usageMetadata.candidatesTokenCount || 0;
        const totalTokens = response.usageMetadata.totalTokenCount || 0;
        
        thinkingSteps.push({
          type: 'thought',
          text: `The AI engaged in internal reasoning before responding. This thinking process used ${thinkingTokens} tokens of computational thought, analyzing the problem step-by-step before generating the ${outputTokens}-token response.`,
          thought: true
        });
        
        console.log('✅ [Direct Gemini] Created thinking step summary');
        console.log('🧠 [Direct Gemini] Thinking stats:', {
          thinkingTokens,
          outputTokens,
          totalTokens,
          thinkingRatio: ((thinkingTokens / totalTokens) * 100).toFixed(1) + '%'
        });
      } else {
        console.log('❌ [Direct Gemini] No thinking detected (thoughtsTokenCount: 0 or missing)');
      }
      
      if (candidate.groundingMetadata) {
        console.log('✅ [Direct Gemini] Found grounding metadata!');
        groundingMetadata = candidate.groundingMetadata;
        
        // Extract sources from grounding chunks
        if (candidate.groundingMetadata.groundingChunks) {
          groundingSources = candidate.groundingMetadata.groundingChunks
            .filter((chunk: any) => chunk.web)
            .map((chunk: any) => ({
              title: chunk.web.title || 'Unknown',
              uri: chunk.web.uri || '',
              snippet: chunk.web.snippet || ''
            }));
        }
        
        console.log('📊 [Direct Gemini] Grounding stats:', {
          chunksCount: candidate.groundingMetadata.groundingChunks?.length || 0,
          supportsCount: candidate.groundingMetadata.groundingSupports?.length || 0,
          searchQueries: candidate.groundingMetadata.webSearchQueries?.length || 0,
          sourcesExtracted: groundingSources?.length ?? 0
        });
      } else {
        console.log('❌ [Direct Gemini] No grounding metadata found');
      }

      if (candidate.urlContextMetadata) {
        console.log('✅ [Direct Gemini] Found URL context metadata!');
        urlContextMetadata = candidate.urlContextMetadata;
        
        console.log('📊 [Direct Gemini] URL Context stats:', {
          urlsProcessed: candidate.urlContextMetadata.urlMetadata?.length || 0,
          urlsSuccess: candidate.urlContextMetadata.urlMetadata?.filter((url: any) => 
            url.urlRetrievalStatus === 'URL_RETRIEVAL_STATUS_SUCCESS'
          ).length || 0
        });
        
        // Also extract URL sources for the unified sources array
        if (candidate.urlContextMetadata.urlMetadata) {
          const urlSources = candidate.urlContextMetadata.urlMetadata
            .filter((meta: any) => meta.urlRetrievalStatus === 'URL_RETRIEVAL_STATUS_SUCCESS')
            .map((meta: any) => ({
              title: meta.retrievedUrl,
              uri: meta.retrievedUrl,
              snippet: 'URL Context Source'
            }));
          if (groundingSources) {
            groundingSources.push(...urlSources);
          }
        }
      } else {
        console.log('❌ [Direct Gemini] No URL context metadata found');
      }
    }

    const result: DirectGeminiResponse = {
      content,
      groundingMetadata,
      urlContextMetadata,
      groundingSources,
      thinkingSteps: thinkingSteps.length > 0 ? thinkingSteps : undefined,
      usageMetadata: response.usageMetadata,
      candidates: response.candidates,
      modelVersion: response.modelVersion
    };

    // 🔒 RUNTIME VALIDATION: Validate AI response against Zod schema
    console.log('🔒 [Direct Gemini] Validating AI response structure...');
    const validatedResult = validateAiResponseOrThrow(
      DirectGeminiResponseSchema,
      result,
      {
        type: 'DirectGeminiResponse',
        workflowName: request.workflowName,
        stageName: request.stageName,
        stageId: request.stageId,
      }
    );
    
    // Log validation success
    logAI('VALIDATION_SUCCESS', { 
      type: 'DirectGeminiResponse',
      hasGroundingMetadata: !!validatedResult.groundingMetadata,
      hasUrlContextMetadata: !!validatedResult.urlContextMetadata,
      hasThinkingSteps: !!validatedResult.thinkingSteps,
      contentLength: validatedResult.content.length,
      workflowName: request.workflowName,
      stageName: request.stageName,
      stageId: request.stageId,
    });
    
    console.log('✅ [Direct Gemini] Generation completed successfully');
    logAI('RESPONSE', { 
      type: 'Direct Gemini API', 
      contentLength: content.length,
      fullContent: content,
      hasGroundingMetadata: !!groundingMetadata,
      hasUrlContextMetadata: !!urlContextMetadata,
      hasThinkingSteps: !!thinkingSteps && thinkingSteps.length > 0,
      groundingSourcesCount: groundingSources?.length || 0,
      urlContextUrlsCount: urlContextMetadata?.urlMetadata?.length || 0,
      // Add workflow/stage context
      workflowName: request.workflowName,
      stageName: request.stageName,
      stageId: request.stageId,
      model: request.model,
      thinkingStepsCount: thinkingSteps?.length || 0,
      thoughtsTokenCount: result.usageMetadata?.thoughtsTokenCount,
      usageMetadata: result.usageMetadata,
      groundingSources: groundingSources,
      urlContextMetadata: urlContextMetadata,
      thinkingSteps: thinkingSteps
    });
    
    // 🔥 NEW: Use enhanced logging for grounding data
    if (groundingMetadata) {
      const { logGroundingMetadata } = await import('@/lib/ai-logger');
      logGroundingMetadata(groundingMetadata);
    }
    
    if (urlContextMetadata) {
      const { logUrlContextMetadata } = await import('@/lib/ai-logger');
      logUrlContextMetadata(urlContextMetadata);
    }
    
    if (groundingSources && groundingSources.length > 0) {
      const { logGroundingSources } = await import('@/lib/ai-logger');
      logGroundingSources(groundingSources);
    }
    
    // 🔥 NEW: Use enhanced logging for thinking data
    if (thinkingSteps && thinkingSteps.length > 0) {
      const { logThinkingMetadata } = await import('@/lib/ai-logger');
      logThinkingMetadata(thinkingSteps, result.usageMetadata);
    }
    
    return result;

  } catch (error) {
    console.error('❌ [Direct Gemini] Generation failed:', error);
    throw error;
  }
}

export async function generateStreamWithDirectGemini(request: DirectGeminiRequest): Promise<AsyncIterable<DirectGeminiResponse>> {
  const client = initializeGenAI();
  
  console.log('🌊 [Direct Gemini] Starting streaming generation');

  // Build the request (same as non-streaming)
  const contents = [];
  
  if (request.systemInstruction) {
    contents.push({ text: request.systemInstruction });
  }
  
  contents.push({ text: request.prompt });

  const config: any = {
    temperature: request.temperature ?? 0.7,
  };

  if (request.maxOutputTokens) {
    config.maxOutputTokens = request.maxOutputTokens;
  }

  const tools = [...(request.tools || [])];
  
  if (request.enableGoogleSearch) {
    tools.push({ googleSearch: {} });
    
    if (request.dynamicRetrievalThreshold !== undefined) {
      config.toolConfig = {
        googleSearch: {
          dynamicRetrieval: {
            threshold: request.dynamicRetrievalThreshold
          }
        }
      };
    }
  }

  if (tools.length > 0) {
    config.tools = tools;
  }

  try {
    const streamPromise = client.models.generateContentStream({
      model: request.model,
      contents,
      config
    });

    async function* processStream() {
      let accumulatedContent = '';
      let finalGroundingMetadata: DirectGeminiResponse['groundingMetadata'];
      let finalGroundingSources: DirectGeminiResponse['groundingSources'] = [];

      const stream = await streamPromise;
      for await (const chunk of stream) {
        const chunkText = chunk.text || '';
        accumulatedContent += chunkText;

        // Check for grounding metadata in this chunk
        if (chunk.candidates && chunk.candidates.length > 0) {
          const candidate = chunk.candidates[0];
          if (candidate.groundingMetadata) {
            finalGroundingMetadata = candidate.groundingMetadata;
            
            if (candidate.groundingMetadata.groundingChunks) {
              finalGroundingSources = candidate.groundingMetadata.groundingChunks
                .filter((c: any) => c.web)
                .map((c: any) => ({
                  title: c.web.title || 'Unknown',
                  uri: c.web.uri || '',
                  snippet: c.web.snippet || ''
                }));
            }
          }
        }

        const streamResult = {
          content: accumulatedContent,
          groundingMetadata: finalGroundingMetadata,
          groundingSources: finalGroundingSources,
          usageMetadata: chunk.usageMetadata,
          candidates: chunk.candidates,
          modelVersion: chunk.modelVersion
        };

        // 🔒 RUNTIME VALIDATION: Validate streaming AI response against Zod schema
        const validatedStreamResult = validateAiResponseOrThrow(
          DirectGeminiResponseSchema,
          streamResult,
          {
            type: 'DirectGeminiStreamResponse',
            workflowName: request.workflowName,
            stageName: request.stageName,
            stageId: request.stageId,
          }
        );
        
        yield validatedStreamResult;
      }
    }

    return processStream();

  } catch (error) {
    console.error('❌ [Direct Gemini] Streaming generation failed:', error);
    throw error;
  }
} 