"use server";

import { aiStageExecution, type AiStageExecutionInput } from "@/ai/flows/ai-stage-execution";
import type { StageState, Stage } from "@/types";

interface RunAiStageParams {
  promptTemplate: string;
  model: string;
  temperature: number;
  contextVars: Record<string, StageState | { userInput: any, output: any }>; // Context from other stages or current input
  currentStageInput?: any; // Specific input for the current stage if not in contextVars
  stageOutputType: Stage['outputType'];
}

interface AiActionResult {
  content: any;
  error?: string;
  groundingInfo?: any; // Placeholder for future grounding info
}

function substitutePromptVars(template: string, context: Record<string, any>): string {
  let finalPrompt = template;
  const regex = /\{\{([\w.-]+)\}\}/g; // Matches {{stage-id.output}} or {{stage-id.userInput.fieldName}}

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
        // If value is an object/array, stringify it for the prompt
        const replacement = (typeof value === 'object' && value !== null) ? JSON.stringify(value, null, 2) : String(value);
        finalPrompt = finalPrompt.replace(match[0], replacement);
    } else {
        console.warn(`Prompt variable '{{${fullPath}}}' not found in context. Replacing with empty string.`);
        finalPrompt = finalPrompt.replace(match[0], ""); // Replace with empty or placeholder
    }
  }
  return finalPrompt;
}


export async function runAiStage(params: RunAiStageParams): Promise<AiActionResult> {
  try {
    const filledPrompt = substitutePromptVars(params.promptTemplate, params.contextVars);

    const aiInput: AiStageExecutionInput = {
      promptTemplate: filledPrompt, // The already substituted prompt
      model: params.model,
      temperature: params.temperature,
    };

    console.log("Executing AI stage with input:", JSON.stringify(aiInput, null, 2));

    const result = await aiStageExecution(aiInput);
    
    let parsedContent = result.content;
    if (params.stageOutputType === 'json') {
        try {
            // Attempt to remove markdown code block fences if present
            const cleanedJsonString = result.content.replace(/^```json\s*|```$/g, '').trim();
            parsedContent = JSON.parse(cleanedJsonString);
        } catch (e) {
            console.warn("AI output was expected to be JSON but failed to parse. Returning as text.", e);
            // Keep as string if parsing fails, client might handle it or show error
            parsedContent = result.content; 
        }
    }


    return { content: parsedContent }; // Assuming output is always string for now
  } catch (error: any) {
    console.error("AI Stage Execution Error:", error);
    return { content: null, error: error.message || "An unknown error occurred during AI processing." };
  }
}
