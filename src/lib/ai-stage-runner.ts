"use client";

import { defaultRateLimitService, RateLimitError } from '@/hooks/use-rate-limit';

/**
 * Client-side helper that calls the server-side AI Stage execution through
 * the /api/wizard/execute endpoint.
 * It intentionally contains **no** server-only imports so it is safe to
 * bundle in any Client Component.
 * 
 * This function implements client-side rate limiting to prevent abuse and
 * manage API quotas effectively.
 */
export async function runAiStage<TParams = any, TResult = any>(params: TParams): Promise<TResult> {
  // Extract relevant information for rate limiting
  const stageId = (params as any)?.stageId || 'unknown';
  const userId = (params as any)?.userId || 'anonymous';
  const endpoint = '/api/wizard/execute';
  
  try {
    // Check rate limit and record request atomically
    defaultRateLimitService.checkAndRecord(endpoint, userId);
    
    console.log('[AI Stage Runner] Rate limit check passed, proceeding with request', {
      stageId,
      userId,
      endpoint,
      rateLimitStatus: defaultRateLimitService.getStatus()
    });
  } catch (error) {
    if (error instanceof RateLimitError) {
      console.warn('[AI Stage Runner] Rate limit exceeded', {
        stageId,
        userId,
        endpoint,
        error: error.message,
        remainingRequests: error.remainingRequests,
        resetTime: error.resetTime,
        retryAfter: error.retryAfter
      });
      
      // Re-throw with additional context
      throw new RateLimitError(
        `${error.message} (Stage: ${stageId})`,
        error.remainingRequests,
        error.resetTime,
        error.retryAfter
      );
    }
    
    // Re-throw other errors
    throw error;
  }

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      // Try to read error payload; fall back to status text
      let message: string;
      try {
        const json = await response.json();
        message = json.error ?? response.statusText;
      } catch {
        message = response.statusText;
      }
      throw new Error(message || "AI execution failed");
    }

    const result = await response.json();
    
    console.log('[AI Stage Runner] AI request completed successfully', {
      stageId,
      userId,
      endpoint,
      rateLimitStatus: defaultRateLimitService.getStatus()
    });
    
    return result as TResult;
  } catch (error) {
    // Log the error but don't affect rate limiting
    console.error('[AI Stage Runner] AI request failed', {
      stageId,
      userId,
      endpoint,
      error: error instanceof Error ? error.message : String(error),
      rateLimitStatus: defaultRateLimitService.getStatus()
    });
    
    throw error;
  }
} 