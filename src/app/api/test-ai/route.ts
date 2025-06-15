import { NextResponse } from 'next/server';
import { runAiStage } from '@/app/actions/aiActions-new';

export async function GET() {
  try {
    console.log('[TEST-AI] Starting test...');
    
    const result = await runAiStage({
      promptTemplate: 'Say hello world',
      model: 'gemini-2.0-flash',
      temperature: 0.7,
      contextVars: {},
      currentStageInput: '',
      stageOutputType: 'text'
    });
    
    console.log('[TEST-AI] Result:', result);
    
    return NextResponse.json({ 
      success: !result.error,
      result 
    });
  } catch (error: any) {
    console.error('[TEST-AI] Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    console.log('[TEST-AI] Starting POST test...');
    
    const body = await request.json();
    console.log('[TEST-AI] Request body:', JSON.stringify(body, null, 2));
    
    const result = await runAiStage({
      promptTemplate: body.promptTemplate || 'Say hello world',
      model: body.model || 'gemini-2.0-flash',
      temperature: body.temperature ?? 0.7,
      contextVars: body.contextVars || {},
      currentStageInput: body.currentStageInput || '',
      stageOutputType: body.stageOutputType || 'text',
      systemInstructions: body.systemInstructions,
      groundingSettings: body.groundingSettings,
      forceGoogleSearchGrounding: body.forceGoogleSearchGrounding
    });
    
    console.log('[TEST-AI] Result:', result);
    
    // Return the result with grounding metadata if present
    const response = { 
      success: !result.error,
      content: result.content,
      groundingMetadata: result.groundingMetadata,
      groundingSources: result.groundingSources,
      thinkingSteps: result.thinkingSteps,
      error: result.error
    };
    
    console.log('[TEST-AI] Response keys:', Object.keys(response));
    
    return NextResponse.json(response);
  } catch (error: any) {
    console.error('[TEST-AI] Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
}