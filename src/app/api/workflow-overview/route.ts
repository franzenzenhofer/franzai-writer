import { NextRequest, NextResponse } from 'next/server';

// Helper to create detailed error response
function createErrorResponse(error: any, requestId: string, statusCode: number = 500) {
  const errorDetails = {
    error: error instanceof Error ? error.message : String(error),
    requestId,
    timestamp: new Date().toISOString(),
    statusCode,
    errorType: error?.constructor?.name || 'Unknown',
    stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined,
    details: {
      code: error?.code,
      statusCode: error?.statusCode,
      response: error?.response,
      originalError: error?.originalError
    }
  };

  console.error(`[API workflow-overview] ERROR RESPONSE ${requestId}:`, JSON.stringify(errorDetails, null, 2));
  
  return NextResponse.json(errorDetails, { status: statusCode });
}

// Force dynamic to prevent static optimization issues
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const requestId = Math.random().toString(36).substring(7);
  const startTime = Date.now();
  
  console.log(`\n========== WORKFLOW OVERVIEW API REQUEST ${requestId} ==========`);
  console.log(`[API workflow-overview] REQUEST ${requestId} START:`, new Date().toISOString());
  console.log(`[API workflow-overview] REQUEST ${requestId} METHOD:`, request.method);
  console.log(`[API workflow-overview] REQUEST ${requestId} URL:`, request.url);
  console.log(`[API workflow-overview] REQUEST ${requestId} HEADERS:`, Object.fromEntries(request.headers.entries()));
  
  try {
    // Parse request body
    let body;
    try {
      body = await request.json();
      console.log(`[API workflow-overview] REQUEST ${requestId} BODY:`, JSON.stringify(body, null, 2));
    } catch (parseError) {
      console.error(`[API workflow-overview] REQUEST ${requestId} PARSE ERROR:`, parseError);
      return createErrorResponse('Invalid JSON in request body', requestId, 400);
    }
    
    // Validate input
    const missingFields = [];
    if (!body.workflowName) missingFields.push('workflowName');
    if (!body.workflowDescription) missingFields.push('workflowDescription');
    if (!body.stages) missingFields.push('stages');
    
    if (missingFields.length > 0) {
      const error = `Missing required fields: ${missingFields.join(', ')}`;
      console.error(`[API workflow-overview] REQUEST ${requestId} VALIDATION ERROR:`, error);
      return createErrorResponse(error, requestId, 400);
    }
    
    console.log(`[API workflow-overview] REQUEST ${requestId} IMPORTING AI MODULE at:`, new Date().toISOString());
    
    // Dynamically import to avoid module initialization issues
    const { generateWorkflowOverview } = await import('@/ai/flows/generate-workflow-overview-flow');
    
    console.log(`[API workflow-overview] REQUEST ${requestId} IMPORT COMPLETE at:`, new Date().toISOString());
    
    const input = {
      workflowName: body.workflowName,
      workflowDescription: body.workflowDescription,
      stages: body.stages,
      finalOutputStageTitle: body.finalOutputStageTitle
    };
    
    console.log(`[API workflow-overview] REQUEST ${requestId} CALLING AI at:`, new Date().toISOString());
    console.log(`[API workflow-overview] REQUEST ${requestId} AI INPUT:`, JSON.stringify(input, null, 2));
    
    // Call AI with timeout using Promise.race
    const timeoutMs = 30000; // 30 seconds
    console.log(`[API workflow-overview] REQUEST ${requestId} TIMEOUT SET TO:`, timeoutMs, 'ms');
    
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        const timeoutError = new Error(`AI call timed out after ${timeoutMs}ms`);
        console.error(`[API workflow-overview] REQUEST ${requestId} TIMEOUT TRIGGERED after ${timeoutMs}ms`);
        reject(timeoutError);
      }, timeoutMs);
    });
    
    let result;
    try {
      result = await Promise.race([
        generateWorkflowOverview(input),
        timeoutPromise
      ]);
    } catch (aiError: any) {
      console.error(`[API workflow-overview] REQUEST ${requestId} AI ERROR:`, aiError);
      console.error(`[API workflow-overview] REQUEST ${requestId} AI ERROR TYPE:`, aiError?.constructor?.name);
      console.error(`[API workflow-overview] REQUEST ${requestId} AI ERROR CODE:`, aiError?.code);
      console.error(`[API workflow-overview] REQUEST ${requestId} AI ERROR STATUS:`, aiError?.statusCode || aiError?.status);
      
      // Check for specific error types
      if (aiError.message?.includes('timeout')) {
        return createErrorResponse(aiError, requestId, 504); // Gateway Timeout
      } else if (aiError.code === 'ECONNREFUSED') {
        return createErrorResponse('AI service connection refused', requestId, 503); // Service Unavailable
      } else if (aiError.statusCode === 429 || aiError.status === 429) {
        return createErrorResponse('AI rate limit exceeded', requestId, 429); // Too Many Requests
      }
      
      throw aiError; // Re-throw to be caught by outer try-catch
    }
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`[API workflow-overview] REQUEST ${requestId} AI RESPONSE SUCCESS in ${duration}ms`);
    console.log(`[API workflow-overview] REQUEST ${requestId} AI RESULT:`, JSON.stringify(result, null, 2));
    
    const successResponse = {
      success: true,
      data: result,
      requestId,
      duration,
      timestamp: new Date().toISOString(),
      statusCode: 200
    };
    
    console.log(`[API workflow-overview] REQUEST ${requestId} FINAL RESPONSE:`, JSON.stringify(successResponse, null, 2));
    console.log(`========== END REQUEST ${requestId} (SUCCESS in ${duration}ms) ==========\n`);
    
    return NextResponse.json(successResponse, { status: 200 });
    
  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error(`[API workflow-overview] REQUEST ${requestId} UNHANDLED ERROR after ${duration}ms:`, error);
    console.error(`[API workflow-overview] REQUEST ${requestId} ERROR TYPE:`, error?.constructor?.name);
    console.error(`[API workflow-overview] REQUEST ${requestId} ERROR STACK:`, error?.stack);
    console.log(`========== END REQUEST ${requestId} (ERROR after ${duration}ms) ==========\n`);
    
    return createErrorResponse(error, requestId);
  }
}