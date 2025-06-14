"use server";
import "server-only";

import { runAiStage } from '@/app/actions/aiActions-new';

// Server action wrapper that can be safely imported by client components
export async function runAiStageWrapper(params: any) {
  try {
    const result = await runAiStage(params);
    return result;
  } catch (error: any) {
    console.error('AI execution error:', error);
    return { 
      error: error.message || 'AI execution failed',
      content: null 
    };
  }
}