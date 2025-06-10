
"use server";

import { aiStageExecution, type AiStageExecutionInput } from "@/ai/flows/ai-stage-execution";
import type { StageState, Stage } from "@/types";
// Removed: import { ai } from '@/ai/genkit'; // No longer needed here for default model/temp

interface RunAiStageParams {
  promptTemplate: string;
  model?: string; // Now optional, comes from stage.model
  temperature?: number; // Now optional, comes from stage.temperature
  contextVars: Record<string, StageState | { userInput: any, output: any }>; 
  currentStageInput?: any; 
  stageOutputType: Stage['outputType'];
}

interface AiActionResult {
  content: any;
  error?: string;
  groundingInfo?: any; 
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
    console.log("[runAiStage] Starting with params:", {
      hasPromptTemplate: !!params.promptTemplate,
      model: params.model,
      temperature: params.temperature,
      stageOutputType: params.stageOutputType
    });

    const filledPrompt = substitutePromptVars(params.promptTemplate, params.contextVars);
    console.log("[runAiStage] Filled prompt length:", filledPrompt.length);

    // Check if we have a valid API key
    const apiKey = process.env.GOOGLE_GENAI_API_KEY;
    if (!apiKey) {
      console.error("[runAiStage] Missing GOOGLE_GENAI_API_KEY environment variable");
      return { content: null, error: "AI service not configured. Please check API keys." };
    }

    // Pass model and temperature directly (can be undefined)
    // The aiStageExecutionFlow will handle using Genkit defaults if they are undefined.
    const aiInput: AiStageExecutionInput = {
      promptTemplate: filledPrompt,
      model: params.model, 
      temperature: params.temperature,
    };

    console.log("Executing AI stage with input:", JSON.stringify(aiInput, null, 2));

    const result = await aiStageExecution(aiInput);
    
    let parsedContent = result.content;
    if (params.stageOutputType === 'json') {
        try {
            const cleanedJsonString = result.content.replace(/^```json\s*|```$/g, '').trim();
            parsedContent = JSON.parse(cleanedJsonString);
        } catch (e) {
            console.warn("AI output was expected to be JSON but failed to parse. Returning as text.", e);
            parsedContent = result.content; 
        }
    }

    console.log("[runAiStage] Success, content type:", typeof parsedContent);
    return { content: parsedContent };
  } catch (error: any) {
    console.error("AI Stage Execution Error:", error);
    console.error("Error stack:", error.stack);
    return { content: null, error: error.message || "An unknown error occurred during AI processing." };
  }
}
