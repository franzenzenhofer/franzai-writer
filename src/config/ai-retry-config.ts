/**
 * AI Retry Configuration
 * 
 * Centralized configuration for AI retry behavior across the application.
 * This allows users to customize retry strategies for different scenarios.
 */

import { RETRY_CONFIGS } from '@/lib/ai-retry';

export interface AIRetrySettings {
  /** Default retry configuration for all AI operations */
  default: keyof typeof RETRY_CONFIGS | 'NONE';
  
  /** Retry configuration for text generation */
  textGeneration: keyof typeof RETRY_CONFIGS | 'NONE';
  
  /** Retry configuration for image generation */
  imageGeneration: keyof typeof RETRY_CONFIGS | 'NONE';
  
  /** Retry configuration for grounding operations (search, URL context) */
  grounding: keyof typeof RETRY_CONFIGS | 'NONE';
  
  /** Retry configuration for thinking mode operations */
  thinking: keyof typeof RETRY_CONFIGS | 'NONE';
  
  /** Retry configuration for function calling */
  functionCalling: keyof typeof RETRY_CONFIGS | 'NONE';
  
  /** Enable user feedback notifications for retries */
  enableUserFeedback: boolean;
  
  /** Show detailed retry information in logs */
  enableDetailedLogging: boolean;
  
  /** Custom retry configurations for specific workflows */
  workflowOverrides: Record<string, keyof typeof RETRY_CONFIGS | 'NONE'>;
  
  /** Custom retry configurations for specific stages */
  stageOverrides: Record<string, keyof typeof RETRY_CONFIGS | 'NONE'>;
}

/**
 * Default retry configuration for the application
 */
export const DEFAULT_AI_RETRY_SETTINGS: AIRetrySettings = {
  default: 'STANDARD',
  textGeneration: 'STANDARD',
  imageGeneration: 'AGGRESSIVE', // Image generation can be more expensive, so retry more aggressively
  grounding: 'RATE_LIMIT', // Grounding operations are more likely to hit rate limits
  thinking: 'CONSERVATIVE', // Thinking mode is expensive, so be more conservative
  functionCalling: 'STANDARD',
  enableUserFeedback: true,
  enableDetailedLogging: true,
  workflowOverrides: {
    // Example: 'poem-generation': 'AGGRESSIVE'
  },
  stageOverrides: {
    // Example: 'image-generation': 'AGGRESSIVE'
  }
};

/**
 * Environment-based retry configuration
 */
export const getAIRetrySettings = (): AIRetrySettings => {
  // In production, you might want to load these from environment variables
  // or a configuration service
  const settings = { ...DEFAULT_AI_RETRY_SETTINGS };
  
  // Override with environment variables if available
  if (process.env.AI_RETRY_DEFAULT) {
    settings.default = process.env.AI_RETRY_DEFAULT as keyof typeof RETRY_CONFIGS;
  }
  
  if (process.env.AI_RETRY_TEXT_GENERATION) {
    settings.textGeneration = process.env.AI_RETRY_TEXT_GENERATION as keyof typeof RETRY_CONFIGS;
  }
  
  if (process.env.AI_RETRY_IMAGE_GENERATION) {
    settings.imageGeneration = process.env.AI_RETRY_IMAGE_GENERATION as keyof typeof RETRY_CONFIGS;
  }
  
  if (process.env.AI_RETRY_GROUNDING) {
    settings.grounding = process.env.AI_RETRY_GROUNDING as keyof typeof RETRY_CONFIGS;
  }
  
  if (process.env.AI_RETRY_THINKING) {
    settings.thinking = process.env.AI_RETRY_THINKING as keyof typeof RETRY_CONFIGS;
  }
  
  if (process.env.AI_RETRY_FUNCTION_CALLING) {
    settings.functionCalling = process.env.AI_RETRY_FUNCTION_CALLING as keyof typeof RETRY_CONFIGS;
  }
  
  if (process.env.AI_RETRY_ENABLE_USER_FEEDBACK) {
    settings.enableUserFeedback = process.env.AI_RETRY_ENABLE_USER_FEEDBACK === 'true';
  }
  
  if (process.env.AI_RETRY_ENABLE_DETAILED_LOGGING) {
    settings.enableDetailedLogging = process.env.AI_RETRY_ENABLE_DETAILED_LOGGING === 'true';
  }
  
  return settings;
};

/**
 * Get retry configuration for a specific operation
 */
export const getRetryConfigForOperation = (
  operation: 'textGeneration' | 'imageGeneration' | 'grounding' | 'thinking' | 'functionCalling',
  workflowId?: string,
  stageId?: string
): keyof typeof RETRY_CONFIGS | 'NONE' => {
  const settings = getAIRetrySettings();
  
  // Check for stage-specific override
  if (stageId && settings.stageOverrides[stageId]) {
    return settings.stageOverrides[stageId];
  }
  
  // Check for workflow-specific override
  if (workflowId && settings.workflowOverrides[workflowId]) {
    return settings.workflowOverrides[workflowId];
  }
  
  // Use operation-specific configuration
  return settings[operation];
};

/**
 * Get retry configuration with user feedback callback
 */
export const getRetryConfigWithFeedback = (
  operation: 'textGeneration' | 'imageGeneration' | 'grounding' | 'thinking' | 'functionCalling',
  workflowId?: string,
  stageId?: string,
  customFeedback?: (attempt: number, reason: string, delay: number) => void
): {
  retryConfig: keyof typeof RETRY_CONFIGS | 'NONE';
  onRetryFeedback?: (attempt: number, reason: string, delay: number) => void;
} => {
  const settings = getAIRetrySettings();
  const retryConfig = getRetryConfigForOperation(operation, workflowId, stageId);
  
  let onRetryFeedback: ((attempt: number, reason: string, delay: number) => void) | undefined;
  
  if (settings.enableUserFeedback) {
    onRetryFeedback = (attempt: number, reason: string, delay: number) => {
      console.log(`[AI Retry] ${operation} - Attempt ${attempt} failed: ${reason}. Retrying in ${delay}ms...`);
      
      // Call custom feedback if provided
      if (customFeedback) {
        customFeedback(attempt, reason, delay);
      }
    };
  }
  
  return {
    retryConfig,
    onRetryFeedback
  };
};

/**
 * Utility function to determine the appropriate retry configuration based on context
 */
export const determineRetryConfig = (context: {
  operation?: string;
  hasGrounding?: boolean;
  hasThinking?: boolean;
  hasFunctionCalling?: boolean;
  isImageGeneration?: boolean;
  workflowId?: string;
  stageId?: string;
}): keyof typeof RETRY_CONFIGS | 'NONE' => {
  const { operation, hasGrounding, hasThinking, hasFunctionCalling, isImageGeneration, workflowId, stageId } = context;
  
  // Determine the most appropriate operation type
  if (isImageGeneration) {
    return getRetryConfigForOperation('imageGeneration', workflowId, stageId);
  } else if (hasGrounding) {
    return getRetryConfigForOperation('grounding', workflowId, stageId);
  } else if (hasThinking) {
    return getRetryConfigForOperation('thinking', workflowId, stageId);
  } else if (hasFunctionCalling) {
    return getRetryConfigForOperation('functionCalling', workflowId, stageId);
  } else {
    return getRetryConfigForOperation('textGeneration', workflowId, stageId);
  }
};