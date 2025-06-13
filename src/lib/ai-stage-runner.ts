/**
 * Client-side wrapper for AI stage execution
 * This isolates the server action import from client components
 */

import { runAiStage as serverRunAiStage } from '@/app/actions/aiActions-new';

export const runAiStage = serverRunAiStage;