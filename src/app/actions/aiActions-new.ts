/**
 * AI Actions - New Implementation
 * Uses native Google Generative AI SDK
 */

"use server";

import type { StageState, Stage, Workflow } from "@/types";
import { executeAIStage, streamAIStage } from "@/ai/flows/ai-stage-execution-new";

interface RunAiStageParams {
  workflow?: Workflow; // Make optional for backward compatibility
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
}

interface AiActionResult {
  content: any;
  error?: string;
  groundingMetadata?: any;
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

export async function runAiStage(params: RunAiStageParams): Promise<AiActionResult> {
  try {
    console.log("[runAiStage] Starting with new SDK");

    // Substitute prompt variables
    const finalPrompt = substitutePromptVars(params.promptTemplate, params.contextVars);

    // Add AI redo notes if present
    const promptWithNotes = params.aiRedoNotes 
      ? `${finalPrompt}\n\nAI Redo Notes: ${params.aiRedoNotes}`
      : finalPrompt;

    // Create a minimal stage if workflow not provided
    const stage: Stage = {
      id: 'temp-stage',
      title: 'AI Processing',
      inputType: 'none',
      outputType: params.stageOutputType || 'text',
      prompt: promptWithNotes,
      promptTemplate: params.promptTemplate,
      model: params.model,
      temperature: params.temperature,
      thinkingSettings: params.thinkingSettings,
      toolNames: params.toolNames,
      systemInstructions: params.systemInstructions,
      groundingSettings: params.groundingSettings
    };

    // Add Google Search grounding if forced
    if (params.forceGoogleSearchGrounding) {
      stage.tools = [
        { type: 'googleSearch', enabled: true }
      ];
    }

    // Prepare input
    const stageInput = {
      text: params.currentStageInput || '',
      files: []
    };

    // Create minimal workflow if not provided
    const workflow: Workflow = params.workflow || {
      id: 'temp-workflow',
      name: 'Temporary Workflow',
      description: '',
      stages: [stage],
      defaultModel: params.model || 'gemini-2.0-flash',
      temperature: params.temperature
    };

    // Execute with new SDK
    const result = await executeAIStage({
      workflow,
      stage,
      input: stageInput,
      context: params.contextVars
    });

    if (result.error) {
      return {
        content: null,
        error: result.error
      };
    }

    // Handle different output types
    let content;
    switch (params.stageOutputType) {
      case 'json':
        content = result.output.json || {};
        break;
      case 'markdown':
        content = result.output.markdown || result.output.text;
        break;
      default:
        content = result.output.text;
    }

    return {
      content,
      usage: result.usage,
      groundingMetadata: result.output.json?.groundingMetadata // Pass through grounding metadata if available
    };

  } catch (error) {
    console.error("[runAiStage] Error:", error);
    return {
      content: null,
      error: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
}

export async function* streamAiStage(params: RunAiStageParams): AsyncGenerator<string, void, unknown> {
  try {
    console.log("[streamAiStage] Starting with new SDK");

    // Substitute prompt variables
    const finalPrompt = substitutePromptVars(params.promptTemplate, params.contextVars);

    // Prepare stage
    const stage = {
      ...params.stage,
      prompt: finalPrompt,
      model: params.model || params.stage.model,
      temperature: params.temperature ?? params.stage.temperature,
    };

    // Prepare input
    const stageInput = {
      text: params.currentStageInput || '',
      files: []
    };

    // Stream with new SDK
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