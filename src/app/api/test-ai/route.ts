import { NextResponse } from 'next/server';
import { runAiStage } from '@/app/actions/aiActions';

export async function GET() {
  try {
    console.log('[TEST-AI] Starting test...');
    
    const result = await runAiStage({
      promptTemplate: 'Say hello world',
      model: 'googleai/gemini-2.5-flash-preview-05-20',
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