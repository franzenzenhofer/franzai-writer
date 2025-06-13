"use server";

import { aiStageExecutionFlow, type AiStageExecutionInput } from "@/ai/flows/ai-stage-execution";
import type { StageState, Stage } from "@/types";
// Removed: import { ai } from '@/ai/genkit'; // No longer needed here for default model/temp

interface RunAiStageParams {
  promptTemplate: string;
  model?: string;
  temperature?: number;
  thinkingSettings?: Stage['thinkingSettings'];
  toolNames?: Stage['toolNames'];
  systemInstructions?: Stage['systemInstructions']; // Add this
  chatHistory?: StageState['chatHistory']; // Add this
  contextVars: Record<string, StageState | { userInput: any, output: any }>; 
  currentStageInput?: any; 
  stageOutputType: Stage['outputType'];
}

interface AiActionResult {
  content: any;
  error?: string;
  groundingInfo?: any;
  thinkingSteps?: import('@/ai/flows/ai-stage-execution').ThinkingStep[];
  outputImages?: Array<{
    name?: string;
    base64Data: string;
    mimeType: string;
  }>;
  updatedChatHistory?: Array<{role: 'user' | 'model' | 'system', parts: any[]}>;
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

    // Create an enhanced context that includes direct userInput reference
    const enhancedContext = {
      ...params.contextVars,
      userInput: params.currentStageInput // Add direct userInput reference
    };

    const filledPrompt = substitutePromptVars(params.promptTemplate, enhancedContext);
    console.log("[runAiStage] Filled prompt length:", filledPrompt.length);
    console.log("[runAiStage] First 200 chars of filled prompt:", filledPrompt.substring(0, 200));

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
      thinkingSettings: params.thinkingSettings ? { enabled: params.thinkingSettings.enabled || false } : undefined,
      toolNames: params.toolNames,
      fileInputs: [],
      systemInstructions: params.systemInstructions, // Pass it through
      chatHistory: params.chatHistory, // Pass it through
    };

    // Add imageData if present in currentStageInput (for image inputType)
    if (params.currentStageInput &&
        params.currentStageInput.fileName && // Common field for image data structure
        params.currentStageInput.mimeType &&
        params.currentStageInput.data) { // 'data' implies base64 image data
      aiInput.imageData = {
        fileName: params.currentStageInput.fileName,
        mimeType: params.currentStageInput.mimeType,
        data: params.currentStageInput.data,
      };
      console.log("[runAiStage] Image data included for AI execution.");
    }

    // Add fileInputs if present in currentStageInput (for document inputType using Files API)
    // This assumes currentStageInput for a document uploaded via Files API will have fileUri and documentType (as mimeType)
    if (params.currentStageInput &&
        params.currentStageInput.fileUri &&
        params.currentStageInput.documentType) {
      aiInput.fileInputs = [{
        uri: params.currentStageInput.fileUri,
        mimeType: params.currentStageInput.documentType
      }];
      console.log("[runAiStage] File URI included for AI execution:", params.currentStageInput.fileUri);
    } else if (params.currentStageInput && params.currentStageInput.fileContent) {
      // If it's a .txt file with direct fileContent, it's already embedded in the promptTemplate by substitutePromptVars.
      // No separate fileInput part is needed for this case.
      console.log("[runAiStage] Text file content is embedded in prompt template.");
    }

    console.log("Executing AI stage with input:", JSON.stringify(aiInput, null, 2));

    const result = await aiStageExecutionFlow(aiInput);
    
    let parsedContent = result.content;
    const thinkingSteps = result.thinkingSteps;
    const outputImages = result.outputImages;
    const updatedChatHistory = result.updatedChatHistory; // Capture updatedChatHistory

    if (params.stageOutputType === 'json') {
        try {
            // Ensure result.content is a string before cleaning
            const contentString = typeof result.content === 'string' ? result.content : JSON.stringify(result.content);
            const cleanedJsonString = contentString.replace(/^```json\s*|```$/g, '').trim();
            parsedContent = JSON.parse(cleanedJsonString);
        } catch (e) {
            console.warn("AI output was expected to be JSON but failed to parse. Returning as text.", e);
            parsedContent = result.content; // Or contentString if it was not originally a string
        }
    }

    console.log("[runAiStage] Success, content type:", typeof parsedContent);
    // Return thinkingSteps and outputImages along with content
    return {
        content: parsedContent,
        ...(thinkingSteps && { thinkingSteps }),
        ...(outputImages && { outputImages }),
        ...(updatedChatHistory && { updatedChatHistory }), // Return it
    };
  } catch (error: any) {
    console.error("AI Stage Execution Error:", error);
    console.error("Error stack:", error.stack);
    return {
        content: null,
        error: error.message || "An unknown error occurred during AI processing.",
        thinkingSteps: undefined,
        outputImages: undefined,
        updatedChatHistory: params.chatHistory // Return original history on error
    };
  }
}
