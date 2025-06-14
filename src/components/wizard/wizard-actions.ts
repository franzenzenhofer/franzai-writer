"use server";
import "server-only";

// Dynamic import happens inside the wrapper to keep server-only code out of the client graph

import type { AiActionResult } from '@/app/actions/aiActions-new';

// Server action wrapper that can be safely imported by client components
export async function runAiStageWrapper(params: any): Promise<AiActionResult> {
  const { runAiStage } = await import('@/app/actions/aiActions-new');
  try {
    return await runAiStage(params);
  } catch (error: any) {
    console.error('AI execution error:', error);
    return {
      content: null,
      error: error?.message || 'AI execution failed',
      groundingMetadata: undefined,
      groundingInfo: undefined,
      thinkingSteps: undefined,
      outputImages: undefined,
      updatedChatHistory: undefined,
    } as AiActionResult;
  }
}