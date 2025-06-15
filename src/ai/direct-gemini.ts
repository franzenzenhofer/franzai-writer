import { GoogleGenAI } from '@google/genai';
import { logAI } from '@/lib/ai-logger';

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
  dynamicRetrievalThreshold?: number;
  maxOutputTokens?: number;
  tools?: any[];
}

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
  usageMetadata?: any;
  candidates?: any[];
  modelVersion?: string;
}

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
    prompt: request.prompt.substring(0, 500),
    tools: tools,
    systemInstruction: request.systemInstruction?.substring(0, 200),
    hasGroundingConfig: !!tools.find((tool: any) => tool.googleSearch)
  });

  try {
    // Make the API call
    const response = await client.models.generateContent({
      model: request.model,
      contents,
      config
    });

    console.log('📥 [Direct Gemini] Raw response keys:', Object.keys(response));
    
    // Extract text content
    const content = response.text || '';
    
    // Extract grounding metadata
    let groundingMetadata: DirectGeminiResponse['groundingMetadata'];
    let urlContextMetadata: DirectGeminiResponse['urlContextMetadata'];
    let groundingSources: DirectGeminiResponse['groundingSources'] = [];
    
    if (response.candidates && response.candidates.length > 0) {
      const candidate = response.candidates[0];
      
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
          groundingSources.push(...urlSources);
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
      usageMetadata: response.usageMetadata,
      candidates: response.candidates,
      modelVersion: response.modelVersion
    };

    console.log('✅ [Direct Gemini] Generation completed successfully');
    logAI('RESPONSE', { 
      type: 'Direct Gemini API', 
      contentLength: content.length,
      contentPreview: content.substring(0, 200) + '...',
      hasGroundingMetadata: !!groundingMetadata,
      hasUrlContextMetadata: !!urlContextMetadata,
      groundingSourcesCount: groundingSources?.length || 0,
      urlContextUrlsCount: urlContextMetadata?.urlMetadata?.length || 0,
      usageMetadata: result.usageMetadata,
      fullContent: content,
      groundingSources: groundingSources,
      urlContextMetadata: urlContextMetadata
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

        yield {
          content: accumulatedContent,
          groundingMetadata: finalGroundingMetadata,
          groundingSources: finalGroundingSources,
          usageMetadata: chunk.usageMetadata,
          candidates: chunk.candidates,
          modelVersion: chunk.modelVersion
        };
      }
    }

    return processStream();

  } catch (error) {
    console.error('❌ [Direct Gemini] Streaming generation failed:', error);
    throw error;
  }
} 