/**
 * AI Actions - New Implementation
 * Uses native Google Generative AI SDK
 */

"use server";
import "server-only";

import type { StageState, Stage } from "@/types";
// Import only the type, not the implementation, to avoid bundling server code
import type { AiStageExecutionInput, ThinkingStep } from "@/ai/flows/ai-stage-execution";
import { appendFileSync } from 'fs';
import { join } from 'path';
import { cleanAiResponse } from '@/lib/ai-content-cleaner';

interface RunAiStageParams {
  promptTemplate: string;
  model?: string;
  temperature?: number;
  thinkingSettings?: Stage['thinkingSettings'];
  toolNames?: Stage['toolNames'];
  systemInstructions?: Stage['systemInstructions'];
  contextVars: Record<string, StageState | { userInput: any, output: any }>;
  currentStageInput?: any;
  stageOutputType: Stage['outputType'];
  // New parameter to force Google Search grounding for AI Redo
  aiRedoNotes?: string;
  forceGoogleSearchGrounding?: boolean;
  // Add groundingSettings from the workflow stage configuration
  groundingSettings?: Stage['groundingSettings'];
  // Add JSON schema and fields for structured output
  jsonSchema?: Stage['jsonSchema'];
  jsonFields?: Stage['jsonFields'];
  // Add stage and workflow for compatibility
  stage?: Stage;
  workflow?: any;
  // Add image generation settings
  imageGenerationSettings?: Stage['imageGenerationSettings'];
  // CRITICAL: Add user/document context for asset management
  userId?: string;
  documentId?: string;
  stageId?: string;
}

export interface AiActionResult {
  content: any;
  error?: string;
  groundingInfo?: any;
  // Proper grounding metadata structure
  groundingMetadata?: {
    searchEntryPoint?: {
      renderedContent: string;
    };
    groundingChunks?: Array<{
      web: {
        uri: string;
        title: string;
      };
    }>;
    groundingSupports?: Array<{
      segment: {
        startIndex?: number;
        endIndex: number;
        text: string;
      };
      groundingChunkIndices: number[];
      confidenceScores: number[];
    }>;
    webSearchQueries?: string[];
  };
  urlContextMetadata?: {
    urlMetadata?: Array<{
      retrievedUrl: string;
      urlRetrievalStatus: string;
    }>;
  };
  groundingSources?: Array<{
    type: 'search' | 'url';
    title: string;
    url?: string;
    snippet?: string;
  }>;
  thinkingSteps?: ThinkingStep[];
  outputImages?: Array<{
    name?: string;
    base64Data: string;
    mimeType: string;
  }>;
  usage?: {
    inputTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
  };
  usageMetadata?: {
    thoughtsTokenCount?: number;
    candidatesTokenCount?: number;
    totalTokenCount?: number;
    promptTokenCount?: number;
  };
}

function substitutePromptVars(template: string, context: Record<string, any>): string {
  let finalPrompt = template;
  
  // First, handle Handlebars conditionals like {{#if variable}}...{{/if}}
  const ifRegex = /\{\{#if\s+([\w.-]+)\}\}([\s\S]*?)\{\{\/if\}\}/g;
  finalPrompt = finalPrompt.replace(ifRegex, (match, varPath, content) => {
    const value = resolveVariablePath(varPath, context);
    
    // If variable exists and is truthy, include the content
    if (value.found && value.value) {
      return content;
    }
    // Otherwise, remove the entire conditional block
    return '';
  });
  
  // Then handle simple variable substitutions
  const regex = /\{\{([\w.-]+)\}\}/g;
  let match;
  while ((match = regex.exec(finalPrompt)) !== null) {
    const fullPath = match[1];
    const result = resolveVariablePath(fullPath, context);
    
    if (result.found) {
      const replacement = (typeof result.value === 'object' && result.value !== null) ? JSON.stringify(result.value, null, 2) : String(result.value);
      finalPrompt = finalPrompt.replace(match[0], replacement);
    } else {
      // Check if this is an optional stage output (ends with .output and stage might be optional)
      const pathParts = fullPath.split('.');
      if (pathParts.length >= 2 && pathParts[pathParts.length - 1] === 'output') {
        // This might be an optional stage - replace with empty string
        console.log(`[Template Substitution] Optional stage output not found: {{${fullPath}}}, replacing with empty string`);
        finalPrompt = finalPrompt.replace(match[0], '');
      } else {
        // FAIL HARD: No fallbacks, no replacements for required data
        throw new Error(`FATAL: Template variable '{{${fullPath}}}' not found in context. Required data is missing. Context keys: ${Object.keys(context).join(', ')}`);
      }
    }
  }
  
  return finalPrompt;
}

/**
 * Resolve a variable path with support for special image selectors
 */
function resolveVariablePath(varPath: string, context: Record<string, any>): { found: boolean; value: any } {
  const pathParts = varPath.split('.');
  let value = context;
  let found = true;
  
  for (let i = 0; i < pathParts.length; i++) {
    const part = pathParts[i];
    
    if (value && typeof value === 'object' && part in value) {
      value = value[part];
    } else {
      found = false;
      break;
    }
  }
  
  // If the path was found normally, return it
  if (found) {
    // Special handling for image outputs with selection logic
    if (pathParts.length >= 2 && pathParts[pathParts.length - 1] === 'output' && value && typeof value === 'object') {
      // Check if this is an image output with multiple images
      if (value.provider && value.images && Array.isArray(value.images) && value.images.length > 0) {
        return enhanceImageOutput(value);
      }
    }
    return { found: true, value };
  }
  
  // Special handling for image selectors like stage-id.output.image.selected
  if (pathParts.length >= 4 && pathParts[pathParts.length - 2] === 'image') {
    const imageSelector = pathParts[pathParts.length - 1]; // 'selected', 'first', 'second', etc.
    const basePathParts = pathParts.slice(0, -2); // Remove 'image.selector' from the end
    
    // Try to resolve the base path (e.g., 'stage-id.output')
    const baseResult = resolveVariablePath(basePathParts.join('.'), context);
    
    if (baseResult.found && baseResult.value && typeof baseResult.value === 'object') {
      const output = baseResult.value;
      
      // Check if this is an image output
      if (output.provider && output.images && Array.isArray(output.images) && output.images.length > 0) {
        const selectedImage = getSelectedImage(output, imageSelector);
        if (selectedImage) {
          return { found: true, value: selectedImage };
        }
      }
    }
  }
  
  return { found: false, value: undefined };
}

/**
 * Enhance image output with additional selectors
 */
function enhanceImageOutput(imageOutput: any): { found: boolean; value: any } {
  const enhanced = {
    ...imageOutput,
    image: {
      selected: getSelectedImage(imageOutput, 'selected'),
      first: imageOutput.images[0] || null,
      second: imageOutput.images[1] || null,
      third: imageOutput.images[2] || null,
      fourth: imageOutput.images[3] || null,
      all: imageOutput.images
    }
  };
  
  return { found: true, value: enhanced };
}

/**
 * Get a specific image based on selector
 */
function getSelectedImage(imageOutput: any, selector: string): any {
  if (!imageOutput.images || !Array.isArray(imageOutput.images) || imageOutput.images.length === 0) {
    return null;
  }
  
  switch (selector) {
    case 'selected':
      const selectedIndex = imageOutput.selectedImageIndex || 0;
      return imageOutput.images[selectedIndex] || imageOutput.images[0];
    case 'first':
      return imageOutput.images[0] || null;
    case 'second':
      return imageOutput.images[1] || null;
    case 'third':
      return imageOutput.images[2] || null;
    case 'fourth':
      return imageOutput.images[3] || null;
    default:
      // Try to parse as a number (0-indexed)
      const index = parseInt(selector, 10);
      if (!isNaN(index) && index >= 0 && index < imageOutput.images.length) {
        return imageOutput.images[index];
      }
      return null;
  }
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
    console.log('[runAiStage] Starting with new SDK');
    
    // Check if this is an export stage and handle it differently
    if (params.stage?.stageType === 'export') {
        console.log('[runAiStage] Detected export stage, using export execution flow');
        
        try {
            // Use dynamic import to avoid bundling server code in the browser
            const { executeExportStage } = await import('@/ai/flows/export-stage-execution');
            
            const result = await executeExportStage({
                stage: params.stage,
                workflow: params.workflow,
                allStageStates: params.contextVars as Record<string, any>,
                progressCallback: undefined, // Don't pass progress callback to avoid client reference error
            });
            
            return {
                content: result,
                error: undefined,
            };
        } catch (error: any) {
            console.error('[runAiStage] Export stage error:', error);
            return {
                content: null,
                error: error.message || 'Export stage execution failed',
            };
        }
    }
    
    // 🔥 LOG COMPLETE REQUEST
    logToAiLog('🚀 [FULL AI REQUEST STARTING]', {
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
        console.log("[runAiStage] Starting with params:", {
            hasPromptTemplate: !!params.promptTemplate,
            model: params.model,
            temperature: params.temperature,
            stageOutputType: params.stageOutputType,
            hasAiRedoNotes: !!params.aiRedoNotes,
            forceGoogleSearchGrounding: !!params.forceGoogleSearchGrounding,
            // CRITICAL: Debug groundingSettings
            hasGroundingSettings: !!params.groundingSettings,
            groundingSettings: params.groundingSettings,
            googleSearchEnabled: params.groundingSettings?.googleSearch?.enabled,
            googleSearchThreshold: params.groundingSettings?.googleSearch?.dynamicThreshold
        });

        // Create an enhanced context that includes direct userInput reference
        const enhancedContext = {
            ...params.contextVars,
            userInput: params.currentStageInput // Add direct userInput reference
        };

        let filledPrompt = substitutePromptVars(params.promptTemplate, enhancedContext);
        
        // If AI Redo notes are provided, enhance the prompt with context about the previous attempt
        if (params.aiRedoNotes !== undefined) {
            // Find the previous output - it should be the current stage's output
            let previousOutput = null;
            
            // If stage is provided, use its ID
            if (params.stage?.id) {
                previousOutput = params.contextVars[params.stage.id]?.output;
            } else {
                // Otherwise, look for the most recent output in contextVars
                // This is a fallback - ideally stage should always be provided
                for (const [key, value] of Object.entries(params.contextVars)) {
                    if (value && typeof value === 'object' && 'output' in value) {
                        previousOutput = value.output;
                    }
                }
            }
            
            // Build the AI Redo context
            let redoContext = `\n\n[AI REDO REQUEST]\n`;
            redoContext += `This is a regeneration request. `;
            
            if (previousOutput) {
                redoContext += `The previous output was:\n`;
                redoContext += `${JSON.stringify(previousOutput, null, 2)}\n\n`;
            }
            
            redoContext += `Please generate a better response following the same requirements.\n`;
            
            if (params.aiRedoNotes && params.aiRedoNotes.trim()) {
                redoContext += `User's specific request for improvement: ${params.aiRedoNotes}\n`;
            }
            
            redoContext += `IMPORTANT: Follow the original instructions above but create a different and improved response.`;
            
            filledPrompt += redoContext;
            console.log("[runAiStage] Enhanced prompt with AI REDO context");
        }
        
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
      systemInstructions: params.systemInstructions,
            // Only use Google Search grounding when explicitly requested (not for AI Redo)
            forceGoogleSearchGrounding: params.forceGoogleSearchGrounding,
            // Pass groundingSettings from the workflow stage configuration
      groundingSettings: params.groundingSettings,
            // Add JSON schema support
      // jsonSchema: params.jsonSchema, // Not supported in this version
            // jsonFields: params.jsonFields, // Not supported in this version
            // Add image generation settings
            imageGenerationSettings: params.imageGenerationSettings,
            stageOutputType: params.stageOutputType,
            // CRITICAL: Pass user/document context for asset management
            userId: params.userId,
            documentId: params.documentId,
            stageId: params.stageId,
        };

        // Only enable Google Search grounding if explicitly requested or configured in the stage
        if (params.forceGoogleSearchGrounding || params.groundingSettings?.googleSearch?.enabled) {
            if (!aiInput.groundingSettings) {
                aiInput.groundingSettings = {};
            }
            if (!aiInput.groundingSettings.googleSearch) {
                aiInput.groundingSettings.googleSearch = {
                    enabled: true,
                    dynamicThreshold: params.groundingSettings?.googleSearch?.dynamicThreshold || 0.3,
                };
            }
            console.log("[runAiStage] Grounding enabled for AI processing");
        }

        console.log("[runAiStage] About to call aiStageExecutionFlow with input:", {
            promptLength: aiInput.promptTemplate.length,
            model: aiInput.model,
            temperature: aiInput.temperature,
            hasSystemInstructions: !!aiInput.systemInstructions,
            hasChatHistory: !!aiInput.chatHistory,
            hasThinkingSettings: !!aiInput.thinkingSettings,
            hasToolNames: !!aiInput.toolNames,
            forceGoogleSearchGrounding: aiInput.forceGoogleSearchGrounding,
            hasGroundingSettings: !!aiInput.groundingSettings,
            googleSearchEnabled: aiInput.groundingSettings?.googleSearch?.enabled,
        });

        // Use dynamic import to avoid bundling server code in the browser
        const { aiStageExecutionFlow } = await import('@/ai/flows/ai-stage-execution');
        
        const result = await aiStageExecutionFlow(aiInput);
        
        // 🔥 LOG AI EXECUTION RESULT
        logToAiLog('🎯 [AI EXECUTION RESULT - RAW]', {
          hasContent: !!result.content,
          contentLength: typeof result.content === 'string' ? result.content.length : 'N/A',
          contentPreview: typeof result.content === 'string' ? result.content.substring(0, 200) + '...' : result.content,
          hasGroundingMetadata: !!result.groundingMetadata,
          groundingSourcesCount: result.groundingSources?.length || 0,
          hasThinkingSteps: !!result.thinkingSteps?.length,
          
          // usage: result.usage, // Not available in this execution flow
          resultKeys: Object.keys(result)
        });

        console.log("[runAiStage] AI execution completed. Result keys:", Object.keys(result));

        // Log the result content structure
        console.log("[runAiStage] AI execution result:", {
            hasContent: !!result.content,
            contentType: typeof result.content,
            contentLength: typeof result.content === 'string' ? result.content.length : 'unknown',
            hasGroundingMetadata: !!result.groundingMetadata,
            hasGroundingSources: !!result.groundingSources,
            groundingSourcesCount: result.groundingSources?.length || 0,
            hasThinkingSteps: !!result.thinkingSteps && result.thinkingSteps.length > 0,
            thinkingStepsCount: result.thinkingSteps?.length || 0,

            // hasUsage: !!result.usage, // Not available in this execution flow
        });


        const groundingMetadata = result.groundingMetadata; // Capture grounding metadata
        const groundingSources = result.groundingSources; // Capture grounding sources

        // Handle image generation output type
        if (params.stageOutputType === 'image') {
            console.log("[runAiStage] Processing image generation output");
            
            // For image generation, we expect the AI to return image data
            // The actual image generation will happen in the AI execution flow
            const finalResult: AiActionResult = {
                content: result.content, // This should be ImageOutputData from the AI flow
                groundingMetadata,
                groundingSources,
                thinkingSteps: result.thinkingSteps,
                outputImages: result.outputImages,
                usageMetadata: result.usageMetadata,
            };

            logToAiLog('✅ [FINAL runAiStage RESULT - IMAGE]', {
                hasContent: !!finalResult.content,
                hasOutputImages: !!finalResult.outputImages,
                outputImagesCount: finalResult.outputImages?.length || 0,
                resultKeys: Object.keys(finalResult)
            });

            return finalResult;
        }

        if (params.stageOutputType === 'json') {
            try {
                // Ensure result.content is a string before cleaning
                const contentString = typeof result.content === 'string' ? result.content : JSON.stringify(result.content);
                const cleanedJsonString = cleanAiResponse(contentString, 'json');
                const parsedContent = JSON.parse(cleanedJsonString);
                
                const finalResult: AiActionResult = {
                    content: parsedContent,
                    groundingMetadata,
                    groundingSources,
                    thinkingSteps: result.thinkingSteps,
                    outputImages: result.outputImages,
                    usageMetadata: result.usageMetadata,
                    // usage: result.usage, // Not available in this execution flow
                };

                // 🔥 LOG FINAL RESULT
                logToAiLog('✅ [FINAL runAiStage RESULT - JSON]', {
                  hasContent: !!finalResult.content,
                  hasGroundingMetadata: !!finalResult.groundingMetadata,
                  groundingSourcesCount: finalResult.groundingSources?.length || 0,
                  hasThinkingSteps: !!finalResult.thinkingSteps?.length,
                  // usage: finalResult.usage, // Not available in this execution flow
                  resultKeys: Object.keys(finalResult)
                });

                return finalResult;
            } catch (e) {
                console.warn("AI output was expected to be JSON but failed to parse. Returning as text.", e);
                const finalResult: AiActionResult = {
                    content: cleanAiResponse(result.content, 'text'),
                    groundingMetadata,
                    groundingSources,
                    thinkingSteps: result.thinkingSteps,
                    outputImages: result.outputImages,
                    usageMetadata: result.usageMetadata,
                    // usage: result.usage, // Not available in this execution flow
                };

                // 🔥 LOG FINAL RESULT (JSON PARSE FAILED)
                logToAiLog('⚠️ [FINAL runAiStage RESULT - JSON PARSE FAILED]', {
                  parseError: e instanceof Error ? e.message : String(e),
                  hasContent: !!finalResult.content,
                  hasGroundingMetadata: !!finalResult.groundingMetadata,
                  groundingSourcesCount: finalResult.groundingSources?.length || 0,
                  hasThinkingSteps: !!finalResult.thinkingSteps?.length,
                  // usage: finalResult.usage, // Not available in this execution flow
                  resultKeys: Object.keys(finalResult)
                });

                return finalResult;
            }
        }

        // For text output
        // Map export-interface to html for proper cleaning
        const outputType = params.stageOutputType === 'export-interface' ? 'html' : 
          (params.stageOutputType as 'html' | 'text' | 'json' | 'markdown' | undefined);
        const finalResult: AiActionResult = {
            content: cleanAiResponse(result.content, outputType),
            groundingMetadata,
            groundingSources,
            thinkingSteps: result.thinkingSteps,
            outputImages: result.outputImages,
            usageMetadata: result.usageMetadata,
            // usage: result.usage, // Not available in this execution flow
        };

        // 🔥 LOG FINAL RESULT
        logToAiLog('✅ [FINAL runAiStage RESULT - TEXT]', {
          hasContent: !!finalResult.content,
          hasGroundingMetadata: !!finalResult.groundingMetadata,
          groundingSourcesCount: finalResult.groundingSources?.length || 0,
          hasThinkingSteps: !!finalResult.thinkingSteps?.length,
          // usage: finalResult.usage, // Not available in this execution flow
          resultKeys: Object.keys(finalResult)
        });

        return finalResult;

    } catch (error: any) {
        console.error("[runAiStage] Error during AI execution:", error);
        
        // 🔥 LOG ERROR
        logToAiLog('❌ [runAiStage ERROR]', {
          error: {
            message: error?.message,
            stack: error?.stack,
            name: error?.name
          }
        });

    return {
      content: null,
            error: error.message || "Unknown error occurred during AI processing"
    };
  }
}

// Streaming removed - use runAiStage instead