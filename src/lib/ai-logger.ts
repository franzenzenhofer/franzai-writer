import fs from 'fs';
import path from 'path';

const AI_LOG_PATH = path.join(process.cwd(), 'logs', 'ai.log');

export function logAI(type: 'REQUEST' | 'RESPONSE', data: any) {
  const timestamp = new Date().toISOString();
  const emoji = type === 'REQUEST' ? '📤' : '📥';
  
  // Enhanced logging with better formatting
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

// NEW: Enhanced logging function specifically for grounding metadata
export function logGroundingMetadata(groundingMetadata: any) {
  const timestamp = new Date().toISOString();
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