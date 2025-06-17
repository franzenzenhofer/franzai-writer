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
  const timestamp = new Date().toISOString();
  const emoji = type === 'REQUEST' ? '📤' : '📥';
  
  // Extract workflow/stage context if available
  const workflowName = data.workflowName || data.workflow?.name || 'unknown-workflow';
  const stageId = data.stageId || data.stage?.id || 'unknown-stage';
  const stageName = data.stageName || data.stage?.name || stageId;
  
  // Write structured log for viewer
  if (type === 'REQUEST') {
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
        contextVars: data.contextVars ? Object.keys(data.contextVars) : []
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
  
  // Enhanced logging with XML structure for better parsing
  let logEntry = `${timestamp} ${emoji} [AI ${type}]\n`;
  
  if (type === 'REQUEST') {
    logEntry += `<AI_REQUEST type="OUTGOING" workflow="${workflowName}" stage="${stageName}" stageId="${stageId}">\n`;
    logEntry += `  <MODEL>${data.model || 'Not specified'}</MODEL>\n`;
    logEntry += `  <TEMPERATURE>${data.temperature || 'Not specified'}</TEMPERATURE>\n`;
    logEntry += `  <GROUNDING>${data.hasGroundingConfig ? 'ENABLED' : 'DISABLED'}</GROUNDING>\n`;
    if (data.tools && data.tools.length > 0) {
      logEntry += `  <TOOLS>${data.tools.map((t: any) => Object.keys(t).join(', ')).join(', ')}</TOOLS>\n`;
    }
    if (data.systemInstruction) {
      logEntry += `  <SYSTEM_INSTRUCTION><![CDATA[\n${data.systemInstruction}\n  ]]></SYSTEM_INSTRUCTION>\n`;
    }
    logEntry += `  <PROMPT_LENGTH>${data.promptLength || 0}</PROMPT_LENGTH>\n`;
    logEntry += `  <PROMPT><![CDATA[\n${data.prompt || 'Not provided'}\n  ]]></PROMPT>\n`;
    if (data.contextVars) {
      logEntry += `  <CONTEXT_VARS>${Object.keys(data.contextVars).join(', ')}</CONTEXT_VARS>\n`;
    }
    logEntry += `</AI_REQUEST>\n`;
  } else {
    logEntry += `<AI_RESPONSE type="INCOMING" workflow="${workflowName}" stage="${stageName}" stageId="${stageId}">\n`;
    logEntry += `  <MODEL>${data.model || 'Not specified'}</MODEL>\n`;
    logEntry += `  <CONTENT_LENGTH>${data.contentLength || data.textLength || 0}</CONTENT_LENGTH>\n`;
    logEntry += `  <GROUNDING_DETECTED>${data.hasGroundingMetadata ? 'YES' : 'NO'}</GROUNDING_DETECTED>\n`;
    if (data.groundingSourcesCount > 0) {
      logEntry += `  <GROUNDING_SOURCES_COUNT>${data.groundingSourcesCount}</GROUNDING_SOURCES_COUNT>\n`;
    }
    logEntry += `  <FINISH_REASON>${data.finishReason || 'Not specified'}</FINISH_REASON>\n`;
    if (data.usageMetadata) {
      logEntry += `  <TOKEN_USAGE>\n`;
      logEntry += `    <INPUT_TOKENS>${data.usageMetadata.promptTokenCount || 0}</INPUT_TOKENS>\n`;
      logEntry += `    <OUTPUT_TOKENS>${data.usageMetadata.candidatesTokenCount || 0}</OUTPUT_TOKENS>\n`;
      logEntry += `    <TOTAL_TOKENS>${data.usageMetadata.totalTokenCount || 0}</TOTAL_TOKENS>\n`;
      logEntry += `  </TOKEN_USAGE>\n`;
    }
    if (data.duration) {
      logEntry += `  <DURATION>${data.duration}ms</DURATION>\n`;
    }
    logEntry += `  <CONTENT><![CDATA[\n${data.fullContent || data.fullText || data.contentPreview || data.textPreview || 'Not provided'}\n  ]]></CONTENT>\n`;
    logEntry += `</AI_RESPONSE>\n`;
  }
  
  logEntry += `${'='.repeat(80)}\n`;
  
  // Ensure logs directory exists
  const logsDir = path.dirname(AI_LOG_PATH);
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
  
  // Append to ai.log
  fs.appendFileSync(AI_LOG_PATH, logEntry);
}

// NEW: General purpose enhanced logging function
export function logAIGeneral(message: string, data?: any) {
  const timestamp = new Date().toISOString();
  
  // Write structured log for viewer
  writeStructuredLog({
    level: 'info',
    category: 'general',
    message,
    data
  });
  
  let logEntry = `${timestamp} 📝 [AI GENERAL] ${message}\n`;
  
  if (data) {
    logEntry += `\n🔗 DATA:\n${JSON.stringify(data, null, 2)}\n`;
  }
  
  logEntry += `\n${'='.repeat(80)}\n`;
  
  // Ensure logs directory exists
  const logsDir = path.dirname(AI_LOG_PATH);
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
  
  // Append to ai.log
  fs.appendFileSync(AI_LOG_PATH, logEntry);
}

// NEW: Enhanced logging function specifically for grounding metadata
export function logGroundingMetadata(groundingMetadata: any) {
  const timestamp = new Date().toISOString();
  
  // Write structured log for viewer
  writeStructuredLog({
    level: 'info',
    category: 'grounding',
    message: 'Google Search Grounding Metadata',
    data: {
      searchQueries: groundingMetadata?.webSearchQueries,
      chunksCount: groundingMetadata?.groundingChunks?.length || 0,
      supportsCount: groundingMetadata?.groundingSupports?.length || 0
    }
  });
  
  let logEntry = `${timestamp} 🌐 [GOOGLE SEARCH SUGGESTIONS & GROUNDING] \n`;
  
  if (groundingMetadata?.searchEntryPoint?.renderedContent) {
    logEntry += `\n🎨 GOOGLE SEARCH SUGGESTIONS (HTML):\n`;
    logEntry += `${groundingMetadata.searchEntryPoint.renderedContent}\n`;
    logEntry += `\n🎨 END GOOGLE SEARCH SUGGESTIONS\n`;
  }
  
  if (groundingMetadata?.webSearchQueries?.length > 0) {
    logEntry += `\n🔍 SEARCH QUERIES EXECUTED:\n`;
    groundingMetadata.webSearchQueries.forEach((query: string, index: number) => {
      logEntry += `  ${index + 1}. "${query}"\n`;
    });
  }
  
  if (groundingMetadata?.groundingChunks?.length > 0) {
    logEntry += `\n📚 GROUNDING CHUNKS (${groundingMetadata.groundingChunks.length}):\n`;
    groundingMetadata.groundingChunks.forEach((chunk: any, index: number) => {
      logEntry += `  ${index + 1}. ${chunk.web?.title || 'Unknown'} - ${chunk.web?.uri || 'No URI'}\n`;
    });
  }
  
  if (groundingMetadata?.groundingSupports?.length > 0) {
    logEntry += `\n🎯 GROUNDING SUPPORTS (${groundingMetadata.groundingSupports.length}):\n`;
    groundingMetadata.groundingSupports.forEach((support: any, index: number) => {
      const avgConfidence = support.confidenceScores?.reduce((a: number, b: number) => a + b, 0) / (support.confidenceScores?.length || 1);
      logEntry += `  ${index + 1}. "${support.segment?.text}" (Confidence: ${Math.round(avgConfidence * 100)}%)\n`;
    });
  }
  
  logEntry += `\n🔗 FULL GROUNDING METADATA:\n${JSON.stringify(groundingMetadata, null, 2)}\n`;
  logEntry += `\n${'='.repeat(80)}\n`;
  
  // Ensure logs directory exists
  const logsDir = path.dirname(AI_LOG_PATH);
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
  
  // Append to ai.log
  fs.appendFileSync(AI_LOG_PATH, logEntry);
}

// NEW: Enhanced logging function for grounding sources
export function logGroundingSources(groundingSources: any[]) {
  const timestamp = new Date().toISOString();
  let logEntry = `${timestamp} 📖 [GROUNDING SOURCES DETAILED] \n`;
  
  if (groundingSources?.length > 0) {
    logEntry += `\n📚 FOUND ${groundingSources.length} GROUNDING SOURCES:\n`;
    groundingSources.forEach((source: any, index: number) => {
      logEntry += `\n  📄 SOURCE ${index + 1}:\n`;
      logEntry += `    Title: ${source.title || 'Unknown'}\n`;
      logEntry += `    URL: ${source.url || source.uri || 'No URL'}\n`;
      logEntry += `    Type: ${source.type || 'Unknown'}\n`;
      if (source.snippet) {
        logEntry += `    Snippet: ${source.snippet}\n`;
      }
    });
  } else {
    logEntry += `\n❌ NO GROUNDING SOURCES FOUND\n`;
  }
  
  logEntry += `\n🔗 RAW GROUNDING SOURCES DATA:\n${JSON.stringify(groundingSources, null, 2)}\n`;
  logEntry += `\n${'='.repeat(80)}\n`;
  
  // Ensure logs directory exists
  const logsDir = path.dirname(AI_LOG_PATH);
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
  
  // Append to ai.log
  fs.appendFileSync(AI_LOG_PATH, logEntry);
}

// NEW: Enhanced logging function for URL context metadata
export function logUrlContextMetadata(urlContextMetadata: any) {
  const timestamp = new Date().toISOString();
  let logEntry = `${timestamp} 🌐 [URL CONTEXT METADATA DETAILED] \n`;
  
  if (urlContextMetadata?.urlMetadata?.length > 0) {
    const { urlMetadata } = urlContextMetadata;
    const successCount = urlMetadata.filter((meta: any) => 
      meta.urlRetrievalStatus === 'URL_RETRIEVAL_STATUS_SUCCESS'
    ).length;
    
    logEntry += `\n📊 URL CONTEXT SUMMARY:\n`;
    logEntry += `   Total URLs: ${urlMetadata.length}\n`;
    logEntry += `   Successful: ${successCount}\n`;
    logEntry += `   Failed: ${urlMetadata.length - successCount}\n`;
    logEntry += `   Success Rate: ${Math.round(successCount/urlMetadata.length*100)}%\n`;
    
    logEntry += `\n🔗 URL PROCESSING DETAILS:\n`;
    urlMetadata.forEach((meta: any, index: number) => {
      const isSuccess = meta.urlRetrievalStatus === 'URL_RETRIEVAL_STATUS_SUCCESS';
      logEntry += `\n  🌐 URL ${index + 1}:\n`;
      logEntry += `    📎 URL: ${meta.retrievedUrl}\n`;
      logEntry += `    ${isSuccess ? '✅' : '❌'} Status: ${meta.urlRetrievalStatus}\n`;
    });
  } else {
    logEntry += `\n❌ NO URL CONTEXT METADATA FOUND\n`;
  }
  
  logEntry += `\n🔗 RAW URL CONTEXT DATA:\n${JSON.stringify(urlContextMetadata, null, 2)}\n`;
  logEntry += `\n${'='.repeat(80)}\n`;
  
  // Ensure logs directory exists
  const logsDir = path.dirname(AI_LOG_PATH);
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
  
  // Append to ai.log
  fs.appendFileSync(AI_LOG_PATH, logEntry);
}

// NEW: Enhanced logging function for thinking steps and metadata
export function logThinkingMetadata(thinkingSteps: any[], usageMetadata?: any) {
  const timestamp = new Date().toISOString();
  
  // Write structured log for viewer
  writeStructuredLog({
    level: 'info',
    category: 'thinking',
    message: 'Thinking Mode Metadata',
    data: {
      stepsCount: thinkingSteps?.length || 0,
      thinkingTokens: usageMetadata?.thoughtsTokenCount,
      totalTokens: usageMetadata?.totalTokenCount
    },
    tokenCount: usageMetadata?.totalTokenCount
  });
  
  let logEntry = `${timestamp} 🧠 [THINKING MODE METADATA DETAILED] \n`;
  
  if (thinkingSteps && thinkingSteps.length > 0) {
    logEntry += `\n🧠 THINKING SUMMARY:\n`;
    logEntry += `   Total Steps: ${thinkingSteps.length}\n`;
    
    // Categorize thinking steps
    const textLogs = thinkingSteps.filter(step => step.type === 'textLog');
    const toolRequests = thinkingSteps.filter(step => step.type === 'toolRequest');
    const toolResponses = thinkingSteps.filter(step => step.type === 'toolResponse');
    const thoughtParts = thinkingSteps.filter(step => step.type === 'thought' || step.thought);
    
    logEntry += `   Text Logs: ${textLogs.length}\n`;
    logEntry += `   Tool Requests: ${toolRequests.length}\n`;
    logEntry += `   Tool Responses: ${toolResponses.length}\n`;
    logEntry += `   Thought Parts: ${thoughtParts.length}\n`;
    
    // Add usage metadata if available
    if (usageMetadata) {
      logEntry += `\n💰 THINKING USAGE METADATA:\n`;
      if (usageMetadata.thoughtsTokenCount) {
        logEntry += `   Thinking Tokens: ${usageMetadata.thoughtsTokenCount}\n`;
      }
      if (usageMetadata.candidatesTokenCount) {
        logEntry += `   Output Tokens: ${usageMetadata.candidatesTokenCount}\n`;
      }
      if (usageMetadata.promptTokenCount) {
        logEntry += `   Input Tokens: ${usageMetadata.promptTokenCount}\n`;
      }
      if (usageMetadata.totalTokenCount) {
        logEntry += `   Total Tokens: ${usageMetadata.totalTokenCount}\n`;
      }
    }
    
    logEntry += `\n🔍 THINKING STEPS DETAILS:\n`;
    thinkingSteps.forEach((step, index) => {
      logEntry += `\n  🧠 Step ${index + 1}:\n`;
      logEntry += `    Type: ${step.type || 'unknown'}\n`;
      
      if (step.type === 'textLog') {
        logEntry += `    Message: ${step.message?.substring(0, 200)}${step.message?.length > 200 ? '...' : ''}\n`;
      } else if (step.type === 'toolRequest') {
        logEntry += `    Tool: ${step.toolName}\n`;
        logEntry += `    Input: ${JSON.stringify(step.input)?.substring(0, 100)}...\n`;
      } else if (step.type === 'toolResponse') {
        logEntry += `    Tool: ${step.toolName}\n`;
        logEntry += `    Output: ${JSON.stringify(step.output)?.substring(0, 100)}...\n`;
      } else if (step.thought || step.type === 'thought') {
        logEntry += `    Thought Content: ${(step.text || step.content)?.substring(0, 300)}${(step.text || step.content)?.length > 300 ? '...' : ''}\n`;
      }
    });
    
  } else {
    logEntry += `\n❌ NO THINKING STEPS FOUND\n`;
  }
  
  logEntry += `\n🧠 RAW THINKING DATA:\n${JSON.stringify({ thinkingSteps, usageMetadata }, null, 2)}\n`;
  logEntry += `\n${'='.repeat(80)}\n`;
  
  // Ensure logs directory exists
  const logsDir = path.dirname(AI_LOG_PATH);
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
  
  // Append to ai.log
  fs.appendFileSync(AI_LOG_PATH, logEntry);
}