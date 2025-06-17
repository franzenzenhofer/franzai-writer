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
  
  // Write structured log for viewer
  if (type === 'REQUEST') {
    writeStructuredLog({
      level: 'info',
      category: 'ai-request',
      message: `AI Request to ${data.model || 'unknown model'}`,
      data: {
        model: data.model,
        temperature: data.temperature,
        promptLength: data.promptLength,
        hasGrounding: data.hasGroundingConfig,
        tools: data.tools?.map((t: any) => Object.keys(t).join(', ')),
        systemInstruction: data.systemInstruction,
        prompt: data.prompt?.substring(0, 500)
      },
      model: data.model
    });
  } else {
    writeStructuredLog({
      level: 'info',
      category: 'ai-response',
      message: `AI Response from ${data.model || 'unknown model'}`,
      data: {
        contentLength: data.contentLength || data.textLength,
        hasGroundingMetadata: data.hasGroundingMetadata,
        groundingSourcesCount: data.groundingSourcesCount,
        finishReason: data.finishReason,
        contentPreview: data.contentPreview?.substring(0, 500) || data.textPreview?.substring(0, 500)
      },
      model: data.model,
      tokenCount: data.usageMetadata?.totalTokenCount,
      duration: data.duration
    });
  }
  
  // Enhanced logging with better formatting (keep original format too)
  let logEntry = `${timestamp} ${emoji} [AI ${type}] `;
  
  if (type === 'REQUEST') {
    // Log request data with better structure
    logEntry += `\n🔧 MODEL: ${data.model || 'Not specified'}`;
    logEntry += `\n🌡️  TEMPERATURE: ${data.temperature || 'Not specified'}`;
    logEntry += `\n📝 PROMPT LENGTH: ${data.promptLength || 'Not specified'}`;
    logEntry += `\n🔍 GROUNDING: ${data.hasGroundingConfig ? 'ENABLED' : 'DISABLED'}`;
    if (data.tools && data.tools.length > 0) {
      logEntry += `\n🛠️  TOOLS: ${data.tools.map((t: any) => Object.keys(t).join(', ')).join(', ')}`;
    }
    logEntry += `\n💭 SYSTEM INSTRUCTION: ${data.systemInstruction || 'None'}`;
    logEntry += `\n📊 PROMPT PREVIEW: ${data.prompt || 'Not provided'}`;
    logEntry += `\n🔗 RAW REQUEST DATA: ${JSON.stringify(data, null, 2)}`;
  } else {
    // Log response data with better structure
    logEntry += `\n📄 CONTENT LENGTH: ${data.contentLength || data.textLength || 'Not specified'}`;
    logEntry += `\n🎯 GROUNDING DETECTED: ${data.hasGroundingMetadata ? 'YES ✅' : 'NO ❌'}`;
    if (data.groundingSourcesCount > 0) {
      logEntry += `\n📚 GROUNDING SOURCES: ${data.groundingSourcesCount} sources found`;
    }
    logEntry += `\n🔄 FINISH REASON: ${data.finishReason || 'Not specified'}`;
    if (data.usageMetadata) {
      logEntry += `\n📊 TOKEN USAGE: Input=${data.usageMetadata.promptTokenCount}, Output=${data.usageMetadata.candidatesTokenCount}, Total=${data.usageMetadata.totalTokenCount}`;
    }
    logEntry += `\n📝 CONTENT PREVIEW: ${data.contentPreview || data.textPreview || 'Not provided'}`;
    logEntry += `\n🔗 RAW RESPONSE DATA: ${JSON.stringify(data, null, 2)}`;
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