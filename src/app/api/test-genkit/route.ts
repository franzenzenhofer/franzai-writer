import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  console.log('[TEST-GENKIT] Starting test at:', new Date().toISOString());
  
  try {
    console.log('[TEST-GENKIT] Step 1: About to import genkit');
    const startImport = Date.now();
    
    // Try importing the genkit module
    const { generateWorkflowOverview } = await import('@/ai/flows/generate-workflow-overview-flow');
    
    const importTime = Date.now() - startImport;
    console.log('[TEST-GENKIT] Step 2: Import completed in', importTime, 'ms');
    
    return NextResponse.json({ 
      success: true,
      message: 'Genkit import successful',
      importTime,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('[TEST-GENKIT] Import error:', error);
    return NextResponse.json({ 
      success: false,
      error: String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}