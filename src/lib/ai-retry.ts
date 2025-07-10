/**
 * AI Retry Utility with Exponential Backoff
 * 
 * Implements sophisticated retry logic for AI operations with:
 * - Exponential backoff with jitter
 * - Rate limiting detection and handling
 * - Transient failure detection
 * - Configurable retry strategies
 * - Proper error handling and user feedback
 */

import { logAI } from '@/lib/ai-logger';

export interface RetryConfig {
  /** Maximum number of retry attempts */
  maxAttempts?: number;
  /** Base delay in milliseconds */
  baseDelay?: number;
  /** Maximum delay in milliseconds */
  maxDelay?: number;
  /** Exponential backoff multiplier */
  backoffMultiplier?: number;
  /** Enable jitter to prevent thundering herd */
  enableJitter?: boolean;
  /** Jitter range (0-1) */
  jitterRange?: number;
  /** Function to determine if an error should be retried */
  shouldRetry?: (error: any, attempt: number) => boolean;
  /** Callback for retry attempts */
  onRetry?: (error: any, attempt: number, delay: number) => void;
  /** Callback for final failure */
  onFailure?: (error: any, totalAttempts: number) => void;
}

export interface RetryResult<T> {
  success: boolean;
  data?: T;
  error?: any;
  attempts: number;
  totalDelay: number;
  retryReasons: string[];
}

export class AIRetryError extends Error {
  constructor(
    message: string,
    public readonly originalError: any,
    public readonly attempts: number,
    public readonly retryReasons: string[]
  ) {
    super(message);
    this.name = 'AIRetryError';
  }
}

// Default configuration
const DEFAULT_CONFIG: Required<RetryConfig> = {
  maxAttempts: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 30000, // 30 seconds
  backoffMultiplier: 2,
  enableJitter: true,
  jitterRange: 0.1,
  shouldRetry: defaultShouldRetry,
  onRetry: defaultOnRetry,
  onFailure: defaultOnFailure
};

/**
 * Default retry decision logic
 */
function defaultShouldRetry(error: any, attempt: number): boolean {
  // Don't retry if we've exceeded max attempts
  if (attempt >= DEFAULT_CONFIG.maxAttempts) {
    return false;
  }

  // Check for specific error types that should be retried
  if (error && typeof error === 'object') {
    const errorMessage = error.message || '';
    const errorCode = error.code || '';
    const errorStatus = error.status || error.statusCode || 0;

    // Rate limiting errors (429)
    if (errorStatus === 429 || errorCode === 'rate_limit_exceeded') {
      return true;
    }

    // Quota exceeded errors
    if (errorCode === 'quota_exceeded' || errorMessage.includes('quota')) {
      return true;
    }

    // Service unavailable (503)
    if (errorStatus === 503 || errorCode === 'service_unavailable') {
      return true;
    }

    // Internal server errors (500-599)
    if (errorStatus >= 500 && errorStatus < 600) {
      return true;
    }

    // Network errors
    if (errorCode === 'network_error' || errorCode === 'ECONNRESET' || errorCode === 'ECONNREFUSED') {
      return true;
    }

    // Timeout errors
    if (errorCode === 'timeout' || errorMessage.includes('timeout')) {
      return true;
    }

    // Google AI API specific errors
    if (errorCode === 'DEADLINE_EXCEEDED' || errorCode === 'UNAVAILABLE') {
      return true;
    }

    // Gemini API specific errors
    if (errorMessage.includes('Failed to fetch') || errorMessage.includes('DEADLINE_EXCEEDED')) {
      return true;
    }

    // Generic temporary failure indicators
    if (errorMessage.includes('temporarily unavailable') || errorMessage.includes('try again')) {
      return true;
    }
  }

  // Don't retry client errors (400-499, except 429)
  if (error?.status >= 400 && error?.status < 500 && error?.status !== 429) {
    return false;
  }

  // Don't retry authentication errors
  if (error?.code === 'unauthenticated' || error?.code === 'unauthorized') {
    return false;
  }

  // Don't retry permission errors
  if (error?.code === 'permission_denied' || error?.code === 'forbidden') {
    return false;
  }

  // Don't retry invalid request errors
  if (error?.code === 'invalid_request' || error?.code === 'bad_request') {
    return false;
  }

  // For unknown errors, try once more
  return attempt < 2;
}

/**
 * Default retry callback
 */
function defaultOnRetry(error: any, attempt: number, delay: number): void {
  const reason = getRetryReason(error);
  console.log(`[AI RETRY] Attempt ${attempt} failed: ${reason}. Retrying in ${delay}ms...`);
  
  logAI('RETRY_ATTEMPT', {
    attempt,
    delay,
    reason,
    error: {
      message: error?.message,
      code: error?.code,
      status: error?.status || error?.statusCode
    }
  });
}

/**
 * Default failure callback
 */
function defaultOnFailure(error: any, totalAttempts: number): void {
  const reason = getRetryReason(error);
  console.error(`[AI RETRY] Final failure after ${totalAttempts} attempts: ${reason}`);
  
  logAI('RETRY_FAILURE', {
    totalAttempts,
    reason,
    error: {
      message: error?.message,
      code: error?.code,
      status: error?.status || error?.statusCode,
      stack: error?.stack
    }
  });
}

/**
 * Get human-readable retry reason
 */
function getRetryReason(error: any): string {
  if (!error) return 'Unknown error';
  
  const errorMessage = error.message || '';
  const errorCode = error.code || '';
  const errorStatus = error.status || error.statusCode || 0;

  if (errorStatus === 429 || errorCode === 'rate_limit_exceeded') {
    return 'Rate limit exceeded';
  }
  
  if (errorCode === 'quota_exceeded' || errorMessage.includes('quota')) {
    return 'Quota exceeded';
  }
  
  if (errorStatus === 503 || errorCode === 'service_unavailable') {
    return 'Service unavailable';
  }
  
  if (errorStatus >= 500 && errorStatus < 600) {
    return `Server error (${errorStatus})`;
  }
  
  if (errorCode === 'network_error' || errorCode === 'ECONNRESET' || errorCode === 'ECONNREFUSED') {
    return 'Network error';
  }
  
  if (errorCode === 'timeout' || errorMessage.includes('timeout')) {
    return 'Request timeout';
  }
  
  if (errorCode === 'DEADLINE_EXCEEDED' || errorCode === 'UNAVAILABLE') {
    return 'Google AI API unavailable';
  }
  
  if (errorMessage.includes('Failed to fetch')) {
    return 'Network fetch failed';
  }
  
  return errorMessage.substring(0, 100) || 'Unknown error';
}

/**
 * Calculate delay with exponential backoff and jitter
 */
function calculateDelay(attempt: number, config: Required<RetryConfig>): number {
  // Exponential backoff: baseDelay * (backoffMultiplier ^ attempt)
  let delay = config.baseDelay * Math.pow(config.backoffMultiplier, attempt);
  
  // Cap at maximum delay
  delay = Math.min(delay, config.maxDelay);
  
  // Add jitter if enabled
  if (config.enableJitter) {
    const jitter = delay * config.jitterRange * (Math.random() - 0.5);
    delay += jitter;
  }
  
  return Math.max(0, Math.round(delay));
}

/**
 * Sleep for specified duration
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Execute a function with retry logic
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: RetryConfig = {}
): Promise<T> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  let lastError: any;
  let totalDelay = 0;
  const retryReasons: string[] = [];
  
  for (let attempt = 0; attempt < finalConfig.maxAttempts; attempt++) {
    try {
      // Log attempt
      if (attempt > 0) {
        logAI('RETRY_EXECUTE', {
          attempt: attempt + 1,
          maxAttempts: finalConfig.maxAttempts
        });
      }
      
      const result = await fn();
      
      // Success! Log if this was a retry
      if (attempt > 0) {
        logAI('RETRY_SUCCESS', {
          attempt: attempt + 1,
          totalDelay,
          retryReasons
        });
      }
      
      return result;
    } catch (error) {
      lastError = error;
      const reason = getRetryReason(error);
      retryReasons.push(reason);
      
      // Check if we should retry
      if (!finalConfig.shouldRetry(error, attempt + 1)) {
        // Don't retry, but call failure callback
        finalConfig.onFailure(error, attempt + 1);
        break;
      }
      
      // Calculate delay for next attempt
      const delay = calculateDelay(attempt, finalConfig);
      totalDelay += delay;
      
      // Call retry callback
      finalConfig.onRetry(error, attempt + 1, delay);
      
      // Wait before next attempt
      if (delay > 0) {
        await sleep(delay);
      }
    }
  }
  
  // All attempts failed
  throw new AIRetryError(
    `AI operation failed after ${finalConfig.maxAttempts} attempts. Last error: ${lastError?.message || 'Unknown error'}`,
    lastError,
    finalConfig.maxAttempts,
    retryReasons
  );
}

/**
 * Predefined retry configurations for common scenarios
 */
export const RETRY_CONFIGS = {
  /** Conservative retry for critical operations */
  CONSERVATIVE: {
    maxAttempts: 2,
    baseDelay: 2000,
    maxDelay: 10000,
    backoffMultiplier: 2,
    enableJitter: true
  } as RetryConfig,
  
  /** Standard retry for most AI operations */
  STANDARD: {
    maxAttempts: 3,
    baseDelay: 1000,
    maxDelay: 30000,
    backoffMultiplier: 2,
    enableJitter: true
  } as RetryConfig,
  
  /** Aggressive retry for non-critical operations */
  AGGRESSIVE: {
    maxAttempts: 5,
    baseDelay: 500,
    maxDelay: 60000,
    backoffMultiplier: 2.5,
    enableJitter: true
  } as RetryConfig,
  
  /** Retry configuration optimized for rate limiting */
  RATE_LIMIT: {
    maxAttempts: 4,
    baseDelay: 5000,
    maxDelay: 120000,
    backoffMultiplier: 3,
    enableJitter: true,
    shouldRetry: (error: any, attempt: number) => {
      // Be more aggressive with rate limit retries
      if (attempt >= 4) return false;
      
      const errorStatus = error?.status || error?.statusCode || 0;
      const errorCode = error?.code || '';
      const errorMessage = error?.message || '';
      
      return errorStatus === 429 || 
             errorCode === 'rate_limit_exceeded' ||
             errorMessage.includes('rate limit') ||
             errorMessage.includes('quota');
    }
  } as RetryConfig,
  
  /** Fast retry for quick operations */
  FAST: {
    maxAttempts: 2,
    baseDelay: 250,
    maxDelay: 2000,
    backoffMultiplier: 2,
    enableJitter: false
  } as RetryConfig
};

/**
 * Utility function to wrap AI operations with standard retry logic
 */
export function withAIRetry<T>(
  fn: () => Promise<T>,
  scenario: keyof typeof RETRY_CONFIGS = 'STANDARD'
): Promise<T> {
  return withRetry(fn, RETRY_CONFIGS[scenario]);
}

/**
 * Utility function to wrap AI operations with custom user feedback
 */
export function withAIRetryAndFeedback<T>(
  fn: () => Promise<T>,
  onRetryFeedback?: (attempt: number, reason: string, delay: number) => void,
  scenario: keyof typeof RETRY_CONFIGS = 'STANDARD'
): Promise<T> {
  const config = {
    ...RETRY_CONFIGS[scenario],
    onRetry: (error: any, attempt: number, delay: number) => {
      const reason = getRetryReason(error);
      
      // Call default logging
      defaultOnRetry(error, attempt, delay);
      
      // Call user feedback if provided
      if (onRetryFeedback) {
        onRetryFeedback(attempt, reason, delay);
      }
    }
  };
  
  return withRetry(fn, config);
}