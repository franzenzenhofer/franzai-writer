import { NextResponse } from 'next/server';
import { runAiStage } from '@/app/actions/aiActions-new';
import { logAIGeneral } from '@/lib/ai-logger';
import type { Stage } from '@/types';

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
    console.log('[TEST-AI] Request body:', body);
    
    // 🔥 LOG COMPLETE TEST API REQUEST
    logAIGeneral('🧪 [TEST-AI REQUEST - COMPLETE]', {
      body: body,
      url: request.url,
      method: request.method,
      timestamp: new Date().toISOString()
    });

    const result = await runAiStage({
      promptTemplate: body.promptTemplate || 'Say hello world',
      model: body.model || 'gemini-2.0-flash',
      temperature: body.temperature ?? 0.7,
      contextVars: body.contextVars || {},
      currentStageInput: body.currentStageInput || '',
      stageOutputType: body.stageOutputType || 'text',
      systemInstructions: body.systemInstructions,
      groundingSettings: body.groundingSettings,
      forceGoogleSearchGrounding: body.forceGoogleSearchGrounding,
      // Add test workflow/stage context
      workflow: {
        id: 'test-workflow',
        name: 'Test Workflow',
        description: 'AI Log Viewer Test'
      },
      stage: {
        id: 'test-stage',
        title: 'Test Stage',
        description: 'Testing AI logging',
        inputType: 'none',
        outputType: 'text'
      } as Stage
    });
    
    console.log('[TEST-AI] Result:', result);
    
    // 🔥 LOG COMPLETE TEST API RESULT BEFORE PROCESSING
    logAIGeneral('🧪 [TEST-AI RAW RESULT FROM runAiStage]', {
      hasContent: !!result.content,
      contentType: typeof result.content,
      contentLength: typeof result.content === 'string' ? result.content.length : 'N/A',
      contentPreview: typeof result.content === 'string' ? result.content.substring(0, 300) + '...' : result.content,
      hasError: !!result.error,
      error: result.error,
      hasGroundingInfo: !!result.groundingInfo,
      hasGroundingMetadata: !!result.groundingMetadata,
      groundingMetadataKeys: result.groundingMetadata ? Object.keys(result.groundingMetadata) : [],
      hasUrlContextMetadata: !!result.urlContextMetadata,
      urlContextMetadataKeys: result.urlContextMetadata ? Object.keys(result.urlContextMetadata) : [],
      hasGroundingSources: !!result.groundingSources,
      groundingSourcesCount: result.groundingSources?.length || 0,
      hasThinkingSteps: !!result.thinkingSteps,
      thinkingStepsCount: result.thinkingSteps?.length || 0,
      hasUsage: !!result.usage,
      
      hasOutputImages: !!result.outputImages,
      allResultKeys: Object.keys(result)
    });

    // 🔥 LOG FULL GROUNDING METADATA IF PRESENT
    if (result.groundingMetadata) {
      logAIGeneral('🔍 [TEST-AI GROUNDING METADATA - FULL]', result.groundingMetadata);
    }

    // �� LOG FULL GROUNDING SOURCES IF PRESENT
    if (result.groundingSources) {
      logAIGeneral('📖 [TEST-AI GROUNDING SOURCES - FULL]', result.groundingSources);
    }

    // LOG FULL URL CONTEXT METADATA IF PRESENT
    if (result.urlContextMetadata) {
      logAIGeneral('🌐 [TEST-AI URL CONTEXT METADATA - FULL]', result.urlContextMetadata);
    }
    
    // Enhanced logging for grounding metadata and sources
    console.log('[TEST-AI] Enhanced Grounding Analysis:');
    console.log('  - Has grounding metadata:', !!result.groundingMetadata);
    console.log('  - Has grounding sources:', !!result.groundingSources?.length);
    
    if (result.groundingMetadata) {
      console.log('  - Grounding metadata keys:', Object.keys(result.groundingMetadata));
      if (result.groundingMetadata.webSearchQueries?.length) {
        console.log('  - Search queries:', result.groundingMetadata.webSearchQueries);
      }
      if (result.groundingMetadata.groundingChunks?.length) {
        console.log('  - Grounding chunks:', result.groundingMetadata.groundingChunks.length);
      }
      if (result.groundingMetadata.groundingSupports?.length) {
        console.log('  - Grounding supports:', result.groundingMetadata.groundingSupports.length);
      }
    }
    
    if (result.groundingSources?.length) {
      console.log('  - Grounding sources count:', result.groundingSources.length);
      console.log('  - First source:', result.groundingSources[0]);
    }

    const response = {
      success: !result.error,
      content: result.content,
      groundingMetadata: result.groundingMetadata,
      urlContextMetadata: result.urlContextMetadata,
      groundingSources: result.groundingSources,
      thinkingSteps: result.thinkingSteps,
      error: result.error
    };

    // 🔥 LOG FINAL RESPONSE BEING SENT TO CLIENT
    logAIGeneral('🧪 [TEST-AI FINAL RESPONSE TO CLIENT]', {
      response: {
        success: response.success,
        hasContent: !!response.content,
        contentLength: typeof response.content === 'string' ? response.content.length : 'N/A',
        contentPreview: typeof response.content === 'string' ? response.content.substring(0, 300) + '...' : response.content,
        hasGroundingMetadata: !!response.groundingMetadata,
        groundingMetadataKeys: response.groundingMetadata ? Object.keys(response.groundingMetadata) : [],
        hasGroundingSources: !!response.groundingSources,
        groundingSourcesCount: response.groundingSources?.length || 0,
        hasThinkingSteps: !!response.thinkingSteps,
        hasError: !!response.error,
        allResponseKeys: Object.keys(response)
      }
    });

    console.log('[TEST-AI] Response keys:', Object.keys(response));
    
    return NextResponse.json(response);
  } catch (error: any) {
    console.error('[TEST-AI] Error:', error);
    
    // 🔥 LOG TEST API ERROR
    logAIGeneral('❌ [TEST-AI ERROR]', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}