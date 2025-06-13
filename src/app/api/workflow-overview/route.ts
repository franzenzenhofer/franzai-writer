import { NextRequest, NextResponse } from 'next/server';
import { generateWorkflowOverview, type GenerateWorkflowOverviewInput } from '@/ai/flows/generate-workflow-overview-flow';

export async function POST(request: NextRequest) {
  const requestId = Math.random().toString(36).substring(7);
  console.log(`[API workflow-overview] REQUEST ${requestId} START:`, new Date().toISOString());
  
  try {
    const body = await request.json();
    console.log(`[API workflow-overview] REQUEST ${requestId} BODY:`, JSON.stringify(body, null, 2));
    
    // Validate input
    if (!body.workflowName || !body.workflowDescription || !body.stages) {
      console.error(`[API workflow-overview] REQUEST ${requestId} ERROR: Missing required fields`);
      return NextResponse.json(
        { error: 'Missing required fields: workflowName, workflowDescription, or stages' },
        { status: 400 }
      );
    }
    
    const input: GenerateWorkflowOverviewInput = {
      workflowName: body.workflowName,
      workflowDescription: body.workflowDescription,
      stages: body.stages,
      finalOutputStageTitle: body.finalOutputStageTitle
    };
    
    console.log(`[API workflow-overview] REQUEST ${requestId} CALLING AI:`, new Date().toISOString());
    const startTime = Date.now();
    
    // Call AI with timeout using Promise.race
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('AI call timed out after 10 seconds')), 10000);
    });
    
    const result = await Promise.race([
      generateWorkflowOverview(input),
      timeoutPromise
    ]) as Awaited<ReturnType<typeof generateWorkflowOverview>>;
    
    const endTime = Date.now();
    console.log(`[API workflow-overview] REQUEST ${requestId} SUCCESS in ${endTime - startTime}ms`);
    console.log(`[API workflow-overview] REQUEST ${requestId} RESULT:`, JSON.stringify(result, null, 2));
    
    return NextResponse.json({
      success: true,
      data: result,
      requestId,
      duration: endTime - startTime
    });
    
  } catch (error) {
    console.error(`[API workflow-overview] REQUEST ${requestId} ERROR:`, error);
    console.error(`[API workflow-overview] REQUEST ${requestId} ERROR TYPE:`, typeof error);
    console.error(`[API workflow-overview] REQUEST ${requestId} ERROR STACK:`, error instanceof Error ? error.stack : 'No stack');
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to generate workflow overview',
        requestId,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}