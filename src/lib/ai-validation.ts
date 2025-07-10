import { z } from 'zod';

/**
 * AI Response Validation Utilities
 * 
 * This module provides runtime type validation for AI API responses using Zod schemas.
 * It ensures type safety and follows the FAIL FAST error handling policy.
 */

// Generic AI response validation result
export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  details?: any;
}

/**
 * Validates any data against a Zod schema with detailed error logging
 * 
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @param context - Additional context for error logging
 * @returns ValidationResult with success status and either data or error
 */
export function validateAiResponse<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  context?: {
    type: string;
    workflowName?: string;
    stageName?: string;
    stageId?: string;
  }
): ValidationResult<T> {
  try {
    const validatedData = schema.parse(data);
    
    console.log(`✅ [AI Validation] ${context?.type || 'Unknown'} validation passed`);
    
    return {
      success: true,
      data: validatedData
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    console.error(`❌ [AI Validation] ${context?.type || 'Unknown'} validation failed:`, errorMessage);
    
    return {
      success: false,
      error: errorMessage,
      details: {
        context,
        rawData: data,
        zodError: error instanceof z.ZodError ? error.errors : error
      }
    };
  }
}

/**
 * Validates AI response and throws error if validation fails (FAIL FAST)
 * 
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @param context - Additional context for error logging
 * @returns Validated data or throws error
 */
export function validateAiResponseOrThrow<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  context?: {
    type: string;
    workflowName?: string;
    stageName?: string;
    stageId?: string;
  }
): T {
  const result = validateAiResponse(schema, data, context);
  
  if (!result.success) {
    // FAIL FAST: Throw validation error immediately
    throw new Error(`AI response validation failed for ${context?.type || 'Unknown'}: ${result.error}`);
  }
  
  return result.data!;
}

/**
 * Common AI validation schemas for reuse across the application
 */
export const CommonAiSchemas = {
  /**
   * Basic text response schema
   */
  textResponse: z.object({
    content: z.string(),
    metadata: z.record(z.any()).optional(),
  }),
  
  /**
   * JSON response schema
   */
  jsonResponse: z.object({
    content: z.any(),
    metadata: z.record(z.any()).optional(),
  }),
  
  /**
   * Usage metadata schema
   */
  usageMetadata: z.object({
    thoughtsTokenCount: z.number().optional(),
    candidatesTokenCount: z.number().optional(),
    totalTokenCount: z.number().optional(),
    promptTokenCount: z.number().optional(),
  }),
  
  /**
   * Grounding source schema
   */
  groundingSource: z.object({
    type: z.enum(['search', 'url']),
    title: z.string(),
    url: z.string().optional(),
    snippet: z.string().optional(),
  }),
  
  /**
   * Thinking step schema
   */
  thinkingStep: z.object({
    type: z.enum(['thought', 'textLog', 'toolRequest', 'toolResponse']),
    text: z.string().optional(),
    content: z.string().optional(),
    thought: z.boolean().optional(),
    toolName: z.string().optional(),
    input: z.any().optional(),
    output: z.any().optional(),
  }),
};

/**
 * Validation middleware for AI responses
 */
export class AiValidationMiddleware {
  private static instance: AiValidationMiddleware;
  
  private constructor() {}
  
  static getInstance(): AiValidationMiddleware {
    if (!AiValidationMiddleware.instance) {
      AiValidationMiddleware.instance = new AiValidationMiddleware();
    }
    return AiValidationMiddleware.instance;
  }
  
  /**
   * Validates AI response and logs the result
   */
  validateResponse<T>(
    schema: z.ZodSchema<T>,
    data: unknown,
    context?: {
      type: string;
      workflowName?: string;
      stageName?: string;
      stageId?: string;
    }
  ): T {
    return validateAiResponseOrThrow(schema, data, context);
  }
}

// Export singleton instance
export const aiValidation = AiValidationMiddleware.getInstance();