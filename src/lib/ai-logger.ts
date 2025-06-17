import fs from 'fs';
import path from 'path';

const AI_LOG_PATH = path.join(process.cwd(), 'logs', 'ai.log');

// Helper to write structured log entry for the viewer
function writeStructuredLog(entry: {
  level: 'info' | 'warning' | 'error' | 'debug';
  category: string;
  message: string;
  data?: any;
  model?: string;
  tokenCount?: number;
  duration?: number;
}) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    ...entry
  };
  
  const logLine = JSON.stringify(logEntry) + '\n';
  
  // Ensure logs directory exists
  const logsDir = path.dirname(AI_LOG_PATH);
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
  
  // Append to ai.log
  fs.appendFileSync(AI_LOG_PATH, logLine);
}

// Export for error logging
export function logAIError(message: string, error: any, category: string = 'general') {
  writeStructuredLog({
    level: 'error',
    category,
    message,
    data: {
      error: error?.message || error,
      stack: error?.stack,
      code: error?.code
    }
  });
}

export function logAI(type: 'REQUEST' | 'RESPONSE', data: any) {
  const emoji = type === 'REQUEST' ? '📤' : '📥';
  
  // Extract workflow/stage context if available
  const workflowName = data.workflowName || data.workflow?.name || 'unknown-workflow';
  const stageId = data.stageId || data.stage?.id || 'unknown-stage';
  const stageName = data.stageName || data.stage?.name || stageId;
  
  // Write structured log for viewer - single line JSON only
  if (type === 'REQUEST') {
    // CRITICAL: Check for unresolved template variables in the prompt
    const prompt = data.prompt || data.fullPrompt || '';
    const templateVars = prompt.match(/\{\{[\w.-]+\}\}/g);
    if (templateVars) {
      console.error('🚨 [TEMPLATE FAILURE] UNRESOLVED TEMPLATE VARIABLES DETECTED IN OUTGOING PROMPT!');
      console.error('🚨 Variables found:', templateVars);
      console.error('🚨 This should NEVER happen - template substitution has failed');
      console.error('🚨 Prompt preview:', prompt.substring(0, 500));
      
      // Log this as a critical error in the structured log
      writeStructuredLog({
        level: 'error',
        category: 'template-failure',
        message: `🚨 CRITICAL: Unresolved template variables in AI request: ${templateVars.join(', ')}`,
        data: {
          workflowName,
          stageId,
          stageName,
          templateVars,
          promptPreview: prompt.substring(0, 500),
          requestType: 'TEMPLATE_FAILURE'
        },
        model: data.model
      });
    }
    
    writeStructuredLog({
      level: 'info',
      category: 'ai-request',
      message: `${emoji} OUTGOING REQUEST: ${workflowName} → ${stageName}`,
      data: {
        workflowName,
        stageId,
        stageName,
        model: data.model,
        temperature: data.temperature,
        promptLength: data.promptLength,
        hasGrounding: data.hasGroundingConfig,
        tools: data.tools?.map((t: any) => Object.keys(t).join(', ')),
        systemInstruction: data.systemInstruction,
        prompt: data.prompt?.substring(0, 500),
        fullPrompt: data.prompt,
        requestType: 'OUTGOING',
        contextVars: data.contextVars ? Object.keys(data.contextVars) : [],
        hasTemplateVars: !!templateVars,
        templateVars: templateVars || []
      },
      model: data.model
    });
  } else {
    writeStructuredLog({
      level: 'info',
      category: 'ai-response',
      message: `${emoji} INCOMING RESPONSE: ${workflowName} → ${stageName}`,
      data: {
        workflowName,
        stageId,
        stageName,
        contentLength: data.contentLength || data.textLength,
        hasGroundingMetadata: data.hasGroundingMetadata,
        groundingSourcesCount: data.groundingSourcesCount,
        finishReason: data.finishReason,
        contentPreview: data.contentPreview?.substring(0, 500) || data.textPreview?.substring(0, 500),
        fullContent: data.fullContent || data.fullText,
        responseType: 'INCOMING',
        promptTokenCount: data.usageMetadata?.promptTokenCount,
        candidatesTokenCount: data.usageMetadata?.candidatesTokenCount,
        totalTokenCount: data.usageMetadata?.totalTokenCount
      },
      model: data.model,
      tokenCount: data.usageMetadata?.totalTokenCount,
      duration: data.duration
    });
  }
}

// General purpose logging function
export function logAIGeneral(message: string, data?: any) {
  // Write structured log for viewer - single line JSON only
  writeStructuredLog({
    level: 'info',
    category: 'general',
    message,
    data
  });
}

// Enhanced logging function specifically for grounding metadata
export function logGroundingMetadata(groundingMetadata: any) {
  // Write structured log for viewer - single line JSON only
  writeStructuredLog({
    level: 'info',
    category: 'grounding',
    message: '🌐 Google Search Grounding Metadata',
    data: {
      searchQueries: groundingMetadata?.webSearchQueries,
      chunksCount: groundingMetadata?.groundingChunks?.length || 0,
      supportsCount: groundingMetadata?.groundingSupports?.length || 0,
      searchEntryPoint: groundingMetadata?.searchEntryPoint,
      groundingChunks: groundingMetadata?.groundingChunks,
      groundingSupports: groundingMetadata?.groundingSupports,
      fullMetadata: groundingMetadata
    }
  });
}

// Enhanced logging function for grounding sources
export function logGroundingSources(groundingSources: any[]) {
  // Write structured log for viewer - single line JSON only
  writeStructuredLog({
    level: 'info',
    category: 'grounding-sources',
    message: `📖 Found ${groundingSources?.length || 0} grounding sources`,
    data: {
      sourcesCount: groundingSources?.length || 0,
      sources: groundingSources?.map((source: any, index: number) => ({
        index: index + 1,
        title: source.title || 'Unknown',
        url: source.url || source.uri || 'No URL',
        type: source.type || 'Unknown',
        snippet: source.snippet
      })),
      rawSources: groundingSources
    }
  });
}

// Enhanced logging function for URL context metadata
export function logUrlContextMetadata(urlContextMetadata: any) {
  const urlMetadata = urlContextMetadata?.urlMetadata || [];
  const successCount = urlMetadata.filter((meta: any) => 
    meta.urlRetrievalStatus === 'URL_RETRIEVAL_STATUS_SUCCESS'
  ).length;
  
  // Write structured log for viewer - single line JSON only
  writeStructuredLog({
    level: 'info',
    category: 'url-context',
    message: `🌐 URL Context: ${successCount}/${urlMetadata.length} successful`,
    data: {
      totalUrls: urlMetadata.length,
      successful: successCount,
      failed: urlMetadata.length - successCount,
      successRate: urlMetadata.length > 0 ? Math.round(successCount/urlMetadata.length*100) : 0,
      urls: urlMetadata.map((meta: any, index: number) => ({
        index: index + 1,
        url: meta.retrievedUrl,
        status: meta.urlRetrievalStatus,
        success: meta.urlRetrievalStatus === 'URL_RETRIEVAL_STATUS_SUCCESS'
      })),
      rawMetadata: urlContextMetadata
    }
  });
}

// Enhanced logging function for thinking steps and metadata
export function logThinkingMetadata(thinkingSteps: any[], usageMetadata?: any) {
  // Categorize thinking steps
  const textLogs = thinkingSteps?.filter(step => step.type === 'textLog') || [];
  const toolRequests = thinkingSteps?.filter(step => step.type === 'toolRequest') || [];
  const toolResponses = thinkingSteps?.filter(step => step.type === 'toolResponse') || [];
  const thoughtParts = thinkingSteps?.filter(step => step.type === 'textLog' && step.message?.includes('Thought')) || [];
  
  // Write structured log for viewer - single line JSON only
  writeStructuredLog({
    level: 'info',
    category: 'thinking',
    message: `🧠 Thinking Mode: ${thinkingSteps?.length || 0} steps`,
    data: {
      stepsCount: thinkingSteps?.length || 0,
      thinkingTokens: usageMetadata?.thoughtsTokenCount,
      totalTokens: usageMetadata?.totalTokenCount,
      breakdown: {
        textLogs: textLogs.length,
        toolRequests: toolRequests.length,
        toolResponses: toolResponses.length,
        thoughtParts: thoughtParts.length
      },
      usageMetadata: usageMetadata,
      steps: thinkingSteps?.map((step, index) => ({
        index: index + 1,
        type: step.type || 'unknown',
        message: step.message?.substring(0, 200),
        toolName: step.toolName,
        input: step.type === 'toolRequest' ? step.input : undefined,
        output: step.type === 'toolResponse' ? step.output : undefined,
        fullMessage: step.message
      })),
      rawData: { thinkingSteps, usageMetadata }
    },
    tokenCount: usageMetadata?.totalTokenCount
  });
}