'use server';

import { generateWorkflowOverview, type GenerateWorkflowOverviewInput } from '@/ai/flows/generate-workflow-overview-flow';

export async function generateWorkflowOverviewAction(input: GenerateWorkflowOverviewInput) {
  const requestId = Math.random().toString(36).substring(7);
  console.log(`[WorkflowOverviewAction] REQUEST ${requestId} START:`, new Date().toISOString());
  console.log(`[WorkflowOverviewAction] REQUEST ${requestId} INPUT:`, JSON.stringify(input, null, 2));
  
  try {
    const startTime = Date.now();
    const result = await generateWorkflowOverview(input);
    const duration = Date.now() - startTime;
    
    console.log(`[WorkflowOverviewAction] REQUEST ${requestId} SUCCESS in ${duration}ms`);
    
    return {
      success: true,
      data: result,
      duration,
      requestId
    };
  } catch (error: any) {
    console.error(`[WorkflowOverviewAction] REQUEST ${requestId} ERROR:`, error);
    
    return {
      success: false,
      error: error.message || 'Unknown error',
      errorType: error.constructor.name,
      requestId
    };
  }
}