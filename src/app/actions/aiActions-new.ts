/**
 * AI Actions - New Implementation
 * Uses native Google Generative AI SDK
 */

"use server";
import "server-only";

import type { StageState, Stage } from "@/types";
// Import only the type, not the implementation, to avoid bundling server code
import type { AiStageExecutionInput, ThinkingStep } from "@/ai/flows/ai-stage-execution";
import { cleanAiResponse } from '@/lib/ai-content-cleaner';
import { logAIGeneral } from '@/lib/ai-logger';

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
  console.log('[Template Substitution] STARTING SUBSTITUTION');
  console.log('[Template Substitution] Template length:', template.length);
  console.log('[Template Substitution] First 300 chars of template:', template.substring(0, 300));
  console.log('[Template Substitution] Context keys:', Object.keys(context));
  console.log('[Template Substitution] Context structure:', Object.keys(context).map(key => ({
    key,
    hasOutput: !!(context[key] && typeof context[key] === 'object' && 'output' in context[key]),
    outputType: context[key]?.output ? typeof context[key].output : 'none',
    outputKeys: context[key]?.output && typeof context[key].output === 'object' ? Object.keys(context[key].output) : []
  })));

  let finalPrompt = template;
  
  // First, handle Handlebars conditionals like {{#if variable}}...{{/if}}
  const ifRegex = /\{\{#if\s+([\w.-]+)\}\}([\s\S]*?)\{\{\/if\}\}/g;
  finalPrompt = finalPrompt.replace(ifRegex, (match, varPath, content) => {
    console.log(`[Template Substitution] Processing conditional: {{#if ${varPath}}}`);
    const value = resolveVariablePath(varPath, context);
    
    // If variable exists and is truthy, include the content
    if (value.found && value.value) {
      console.log(`[Template Substitution] Conditional ${varPath} is truthy, including content`);
      return content;
    }
    // Otherwise, remove the entire conditional block
    console.log(`[Template Substitution] Conditional ${varPath} is falsy, removing content`);
    return '';
  });
  
  // Then handle simple variable substitutions - FIXED: Use a more robust approach
  const regex = /\{\{([\w.-]+)\}\}/g;
  const unresolved: string[] = [];
  const resolved: Array<{variable: string, value: any}> = [];
  
  // Get all matches first to avoid regex state issues
  const matches = Array.from(finalPrompt.matchAll(regex));
  console.log(`[Template Substitution] Found ${matches.length} template variables to process`);
  
  // Process each match
  for (const match of matches) {
    const fullPath = match[1];
    const fullMatch = match[0]; // The full {{variable}} string
    
    console.log(`[Template Substitution] Processing variable: ${fullMatch}`);
    const result = resolveVariablePath(fullPath, context);
    
    if (result.found) {
      const replacement = (typeof result.value === 'object' && result.value !== null) ? JSON.stringify(result.value, null, 2) : String(result.value);
      console.log(`[Template Substitution] ✅ Resolved ${fullMatch} -> ${replacement.substring(0, 100)}${replacement.length > 100 ? '...' : ''}`);
      
      // Replace ALL occurrences of this variable
      finalPrompt = finalPrompt.replace(new RegExp(escapeRegExp(fullMatch), 'g'), replacement);
      resolved.push({ variable: fullPath, value: result.value });
    } else {
      // Check if this is an optional stage output (ends with .output and stage might be optional)
      const pathParts = fullPath.split('.');
      if (pathParts.length >= 2 && pathParts[pathParts.length - 1] === 'output') {
        // This might be an optional stage - replace with empty string
        console.log(`[Template Substitution] ⚠️ Optional stage output not found: ${fullMatch}, replacing with empty string`);
        finalPrompt = finalPrompt.replace(new RegExp(escapeRegExp(fullMatch), 'g'), '');
        resolved.push({ variable: fullPath, value: '' });
      } else {
        // FAIL HARD: No fallbacks, no replacements for required data
        console.error(`[Template Substitution] ❌ FATAL: Template variable '${fullMatch}' not found in context`);
        console.error(`[Template Substitution] Available context keys:`, Object.keys(context));
        console.error(`[Template Substitution] Context structure:`, context);
        unresolved.push(fullPath);
      }
    }
  }

  // FAIL FAST: If any required variables are unresolved, throw error
  if (unresolved.length > 0) {
    const errorMsg = `FATAL: Template variables not found: ${unresolved.map(v => `{{${v}}}`).join(', ')}. Required data is missing. Context keys: ${Object.keys(context).join(', ')}`;
    console.error(`[Template Substitution] ${errorMsg}`);
    throw new Error(errorMsg);
  }

  // VALIDATE: Check if there are still template variables in the final prompt (this should NEVER happen)
  const remainingVars = finalPrompt.match(/\{\{[\w.-]+\}\}/g);
  if (remainingVars) {
    const errorMsg = `FATAL: Template substitution incomplete! Remaining variables: ${remainingVars.join(', ')}. This indicates a bug in the substitution logic.`;
    console.error(`[Template Substitution] ${errorMsg}`);
    console.error(`[Template Substitution] Final prompt first 500 chars:`, finalPrompt.substring(0, 500));
    throw new Error(errorMsg);
  }

  console.log(`[Template Substitution] ✅ SUBSTITUTION COMPLETE`);
  console.log(`[Template Substitution] Resolved ${resolved.length} variables:`, resolved.map(r => r.variable));
  console.log(`[Template Substitution] Final prompt length:`, finalPrompt.length);
  console.log(`[Template Substitution] Final prompt first 300 chars:`, finalPrompt.substring(0, 300));
  
  return finalPrompt;
}

/**
 * Escape special regex characters
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Resolve a variable path with support for special image selectors
 */
function resolveVariablePath(varPath: string, context: Record<string, any>): { found: boolean; value: any } {
  console.log(`[Path Resolution] Resolving: ${varPath}`);
  const pathParts = varPath.split('.');
  let value = context;
  let found = true;
  
  // CRITICAL: Handle special image selector paths FIRST
  // Check for paths like 'stage-id.output.image.selected'
  if (pathParts.length >= 4 && pathParts[pathParts.length - 2] === 'image') {
    const imageSelector = pathParts[pathParts.length - 1]; // 'selected', 'first', 'second', etc.
    const basePathParts = pathParts.slice(0, -2); // Remove 'image.selector' from the end
    
    console.log(`[Path Resolution] Detected image selector: ${imageSelector}, base path: ${basePathParts.join('.')}`);
    
    // Try to resolve the base path (e.g., 'stage-id.output')
    let baseValue = context;
    let baseFound = true;
    for (const part of basePathParts) {
      if (baseValue && typeof baseValue === 'object' && part in baseValue) {
        baseValue = baseValue[part];
      } else {
        baseFound = false;
        break;
      }
    }
    
    if (baseFound && baseValue && typeof baseValue === 'object') {
      console.log(`[Path Resolution] Base path resolved to:`, typeof baseValue, Object.keys(baseValue));
      
      // Check if this is an image output
      if (baseValue.provider && baseValue.images && Array.isArray(baseValue.images) && baseValue.images.length > 0) {
        const selectedImage = getSelectedImage(baseValue, imageSelector);
        if (selectedImage) {
          console.log(`[Path Resolution] ✅ Image selector resolved:`, selectedImage);
          return { found: true, value: selectedImage };
        } else {
          console.log(`[Path Resolution] ❌ Image selector failed: no image found for selector '${imageSelector}'`);
        }
      } else {
        console.log(`[Path Resolution] ❌ Base path is not an image output:`, baseValue);
      }
    } else {
      console.log(`[Path Resolution] ❌ Base path could not be resolved`);
    }
    
    return { found: false, value: undefined };
  }
  
  // Standard path resolution for non-image paths
  for (let i = 0; i < pathParts.length; i++) {
    const part = pathParts[i];
    console.log(`[Path Resolution] Checking part '${part}' in:`, typeof value, Array.isArray(value) ? 'array' : (value && typeof value === 'object' ? Object.keys(value) : value));
    
    if (value && typeof value === 'object' && part in value) {
      value = value[part];
      console.log(`[Path Resolution] Found '${part}', new value type:`, typeof value);
    } else {
      console.log(`[Path Resolution] ❌ Part '${part}' not found`);
      found = false;
      break;
    }
  }
  
  // If the path was found normally, check for special image enhancement
  if (found) {
    console.log(`[Path Resolution] ✅ Standard path resolved to:`, typeof value);
    
    // Special handling for image outputs - enhance with selectors
    if (pathParts.length >= 2 && pathParts[pathParts.length - 1] === 'output' && value && typeof value === 'object') {
      // Check if this is an image output with multiple images
      if (value.provider && value.images && Array.isArray(value.images) && value.images.length > 0) {
        console.log(`[Path Resolution] Enhancing image output with selectors`);
        return enhanceImageOutput(value);
      }
    }
    return { found: true, value };
  }
  
  console.log(`[Path Resolution] ❌ Path resolution failed for: ${varPath}`);
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

/**
 * Diagnostic function to analyze context and identify missing dependencies
 */
function diagnoseContextForTemplate(template: string, context: Record<string, any>): void {
  console.log('[Context Diagnosis] ANALYZING TEMPLATE DEPENDENCIES');
  
  // Extract all template variables from the template
  const allVars = template.match(/\{\{[\w.-]+\}\}/g) || [];
  const uniqueVars = [...new Set(allVars)];
  
  console.log('[Context Diagnosis] Template variables found:', uniqueVars);
  
  // Analyze each variable
  uniqueVars.forEach(varWithBraces => {
    const varPath = varWithBraces.replace(/[{}]/g, '');
    console.log(`[Context Diagnosis] Analyzing: ${varPath}`);
    
    const pathParts = varPath.split('.');
    const rootKey = pathParts[0];
    
    if (!(rootKey in context)) {
      console.error(`[Context Diagnosis] ❌ Root key '${rootKey}' missing from context`);
      return;
    }
    
    const rootValue = context[rootKey];
    console.log(`[Context Diagnosis] ✅ Root key '${rootKey}' exists, type:`, typeof rootValue);
    
    if (pathParts.length > 1) {
      let current = rootValue;
      let currentPath = rootKey;
      
      for (let i = 1; i < pathParts.length; i++) {
        const part = pathParts[i];
        currentPath += '.' + part;
        
        if (!current || typeof current !== 'object') {
          console.error(`[Context Diagnosis] ❌ Cannot traverse '${currentPath}' - current value is not an object:`, current);
          break;
        }
        
        if (!(part in current)) {
          console.error(`[Context Diagnosis] ❌ Key '${part}' missing at '${currentPath}'`);
          console.error(`[Context Diagnosis] Available keys at this level:`, Object.keys(current));
          break;
        }
        
        current = current[part];
        console.log(`[Context Diagnosis] ✅ '${currentPath}' exists, type:`, typeof current);
      }
    }
  });
  
  console.log('[Context Diagnosis] ANALYSIS COMPLETE');
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
    logAIGeneral('🚀 [FULL AI REQUEST STARTING]', {
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

        // DIAGNOSTIC: Analyze context before template substitution
        diagnoseContextForTemplate(params.promptTemplate, enhancedContext);

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
            // Add workflow and stage context for logging
            workflow: params.workflow,
            stage: params.stage ? {
                id: params.stage.id,
                name: params.stage.title, // Map title to name for compatibility
                description: params.stage.description,
            } : undefined,
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
        logAIGeneral('🎯 [AI EXECUTION RESULT - RAW]', {
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

            logAIGeneral('✅ [FINAL runAiStage RESULT - IMAGE]', {
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
                logAIGeneral('✅ [FINAL runAiStage RESULT - JSON]', {
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
                logAIGeneral('⚠️ [FINAL runAiStage RESULT - JSON PARSE FAILED]', {
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
        logAIGeneral('✅ [FINAL runAiStage RESULT - TEXT]', {
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
        logAIGeneral('❌ [runAiStage ERROR]', {
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
// Streaming removed - use runAiStage instead