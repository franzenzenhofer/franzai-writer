/**
 * AI Actions - New Implementation
 * Uses native Google Generative AI SDK
 */

"use server";
import "server-only";

import type { StageState, Stage, Workflow } from "@/types";
import type { executeAIStage as ExecuteAIStageFn, streamAIStage as StreamAIStageFn } from "@/ai/flows/ai-stage-execution-new";
import { appendFileSync } from 'fs';
import { join } from 'path';

interface RunAiStageParams {
  workflow?: Workflow; // Make optional for backward compatibility
  stage?: Stage; // Optional stage object for direct use
  promptTemplate: string;
  model?: string;
  temperature?: number;
  thinkingSettings?: Stage['thinkingSettings'];
  toolNames?: Stage['toolNames'];
  systemInstructions?: Stage['systemInstructions'];
  chatHistory?: StageState['chatHistory'];
  contextVars: Record<string, StageState | { userInput: any, output: any }>;
  currentStageInput?: any;
  stageOutputType: Stage['outputType'];
  aiRedoNotes?: string;
  forceGoogleSearchGrounding?: boolean;
  groundingSettings?: Stage['groundingSettings'];
  // Add JSON schema and fields for structured output
  jsonSchema?: Stage['jsonSchema'];
  jsonFields?: Stage['jsonFields'];
}

export interface AiActionResult {
  content: any;
  error?: string;
  groundingMetadata?: any;
  groundingInfo?: any; // Legacy grounding info
  groundingSources?: any[];
  thinkingSteps?: any[];
  outputImages?: Array<{
    name?: string;
    base64Data: string;
    mimeType: string;
  }>;
  updatedChatHistory?: Array<{
    role: 'user' | 'model' | 'system';
    parts: any[];
  }>;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

function substitutePromptVars(template: string, context: Record<string, any>): string {
  let finalPrompt = template;
  const regex = /\{\{([\w.-]+)\}\}/g;

  let match;
  while ((match = regex.exec(template)) !== null) {
    const fullPath = match[1];
    const pathParts = fullPath.split('.');
    
    let value = context;
    let found = true;
    for (const part of pathParts) {
      if (value && typeof value === 'object' && part in value) {
        value = value[part];
      } else {
        found = false;
        break;
      }
    }
    
    if (found) {
      const replacement = (typeof value === 'object' && value !== null) ? JSON.stringify(value, null, 2) : String(value);
      finalPrompt = finalPrompt.replace(match[0], replacement);
    } else {
      console.warn(`Prompt variable '{{${fullPath}}}' not found in context. Replacing with empty string.`);
      finalPrompt = finalPrompt.replace(match[0], "");
    }
  }
  return finalPrompt;
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

export async function runAiStage(params: RunAiStageParams): Promise<AiActionResult> {
    console.log('[runAiStage] Starting with params:', {
        model: params.model,
        promptTemplate: params.promptTemplate?.substring(0, 100) + '...',
        systemInstructions: params.systemInstructions?.substring(0, 100) + '...',
        hasGroundingSettings: !!params.groundingSettings,
        groundingSettings: params.groundingSettings,
        stageOutputType: params.stageOutputType
    });
    
    // 🔥 LOG COMPLETE REQUEST
    logToAiLog('🚀 [FULL AI REQUEST STARTING - NEW]', {
      params: {
        ...params,
        // Don't log sensitive data but log structure
        systemInstructions: params.systemInstructions ? params.systemInstructions.substring(0, 100) + '...' : undefined,
        promptTemplate: params.promptTemplate?.substring(0, 200) + (params.promptTemplate?.length > 200 ? '...' : ''),
        // Log full grounding settings
        groundingSettings: params.groundingSettings,
        model: params.model,
        temperature: params.temperature,
        stageOutputType: params.stageOutputType
      }
    });

    try {
        const result = await executeAIStage(params as AiStageExecutionInput);
        
        // 🔥 LOG COMPLETE RAW RESULT FROM AI EXECUTION
        logToAiLog('📥 [RAW AI EXECUTION RESULT - NEW]', {
          hasContent: !!result.content,
          contentType: typeof result.content,
          contentLength: typeof result.content === 'string' ? result.content.length : 'N/A',
          contentPreview: typeof result.content === 'string' ? result.content.substring(0, 200) + '...' : result.content,
          hasGroundingMetadata: !!result.groundingMetadata,
          groundingMetadataKeys: result.groundingMetadata ? Object.keys(result.groundingMetadata) : [],
          hasGroundingSources: !!result.groundingSources,
          groundingSourcesCount: result.groundingSources?.length || 0,
          groundingSourcesPreview: result.groundingSources?.slice(0, 2),
          hasUsage: !!result.usage,
          hasThinkingSteps: !!result.thinkingSteps,
          thinkingStepsCount: result.thinkingSteps?.length || 0,
          allResultKeys: Object.keys(result)
        });

        // 🔥 LOG FULL GROUNDING METADATA IF PRESENT
        if (result.groundingMetadata) {
          logToAiLog('🔍 [FULL GROUNDING METADATA - NEW]', result.groundingMetadata);
        }

        // 🔥 LOG FULL GROUNDING SOURCES IF PRESENT  
        if (result.groundingSources) {
          logToAiLog('📖 [FULL GROUNDING SOURCES - NEW]', result.groundingSources);
        }

        let parsedContent;
        if (params.stageOutputType === 'json') {
            try {
                const contentString = typeof result.content === 'string' ? result.content : JSON.stringify(result.content);
                const cleanedJsonString = contentString.replace(/^```json\s*|```$/g, '').trim();
                parsedContent = JSON.parse(cleanedJsonString);
            } catch (e) {
                console.warn("AI output was expected to be JSON but failed to parse. Returning as text.", e);
                parsedContent = result.content;
            }
        } else {
            parsedContent = result.content;
        }

        const finalResult: AiActionResult = {
            content: parsedContent,
            usage: result.usage,  
            groundingMetadata: result.groundingMetadata,
            groundingSources: result.groundingSources,
            thinkingSteps: result.thinkingSteps,
            outputImages: result.outputImages,
            updatedChatHistory: result.updatedChatHistory,
            functionCalls: result.functionCalls,
            codeExecutionResults: result.codeExecutionResults
        };

        // 🔥 LOG FINAL RESULT BEING RETURNED
        logToAiLog('✅ [FINAL RESULT BEING RETURNED - NEW]', {
          hasContent: !!finalResult.content,
          hasUsage: !!finalResult.usage,
          hasGroundingMetadata: !!finalResult.groundingMetadata,
          hasGroundingSources: !!finalResult.groundingSources,
          groundingSourcesCount: finalResult.groundingSources?.length || 0,
          hasThinkingSteps: !!finalResult.thinkingSteps,
          hasOutputImages: !!finalResult.outputImages,
          hasUpdatedChatHistory: !!finalResult.updatedChatHistory,
          hasFunctionCalls: !!finalResult.functionCalls,
          hasCodeExecutionResults: !!finalResult.codeExecutionResults,
          allFinalResultKeys: Object.keys(finalResult)
        });

        console.log("[runAiStage] Success, content type:", typeof parsedContent);
        return finalResult;
        
    } catch (error: any) {
        // 🔥 LOG ERROR
        logToAiLog('❌ [AI EXECUTION ERROR - NEW]', {
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined
        });
        
        console.error("AI Stage Execution Error:", error);
        console.error("Error stack:", error.stack);
        return {
            content: '',
            error: error.message || 'Unknown error occurred'
        };
    }
}

export async function* streamAiStage(params: RunAiStageParams): AsyncGenerator<string, void, unknown> {
  try {
    console.log("[streamAiStage] Starting with new SDK");

    // Substitute prompt variables
    const finalPrompt = substitutePromptVars(params.promptTemplate, params.contextVars);

    // Prepare stage
    const stage: Stage = params.stage ? {
      ...params.stage,
      prompt: finalPrompt,
      model: params.model || params.stage.model,
      temperature: params.temperature ?? params.stage.temperature,
    } : {
      id: 'temp-stage',
      title: 'AI Processing', 
      description: 'Temporary stage for streaming',
      inputType: 'none',
      outputType: params.stageOutputType || 'text',
      prompt: finalPrompt,
      promptTemplate: params.promptTemplate,
      model: params.model,
      temperature: params.temperature,
      thinkingSettings: params.thinkingSettings,
      toolNames: params.toolNames,
      systemInstructions: params.systemInstructions,
      groundingSettings: params.groundingSettings
    };

    // Prepare input
    const stageInput = {
      text: params.currentStageInput || '',
      files: []
    };

    // Dynamically import the streaming helper only when needed
    const { streamAIStage } = await import("@/ai/flows/ai-stage-execution-new") as {
      streamAIStage: typeof StreamAIStageFn;
    };

    const stream = streamAIStage({
      workflow: params.workflow,
      stage,
      input: stageInput,
      context: params.contextVars
    });

    for await (const chunk of stream) {
      yield chunk;
    }

  } catch (error) {
    console.error("[streamAiStage] Error:", error);
    yield `Error: ${error instanceof Error ? error.message : "Unknown error occurred"}`;
  }
}