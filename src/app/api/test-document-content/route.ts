import { NextResponse } from 'next/server';
import { documentPersistence } from '@/lib/document-persistence';
import type { StageState } from '@/types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const documentId = searchParams.get('documentId');

  if (!documentId) {
    return NextResponse.json({
      success: false,
      error: 'Document ID is required as a query parameter'
    }, { status: 400 });
  }

  try {
    console.log('[TEST] Testing document content preservation for:', documentId);
    
    // Load the document
    const loadResult = await documentPersistence.loadDocument(documentId);
    
    if (!loadResult.success) {
      return NextResponse.json({
        success: false,
        error: loadResult.error || 'Failed to load document',
        documentId
      });
    }

    const { document, stageStates } = loadResult;
    
    // Analyze the stage states in detail
    const stageAnalysis = Object.entries(stageStates || {}).map(([stageId, state]) => ({
      stageId,
      status: state.status,
      hasUserInput: !!state.userInput,
      userInputType: typeof state.userInput,
      userInputContent: typeof state.userInput === 'string' ? 
        state.userInput.substring(0, 100) + (state.userInput.length > 100 ? '...' : '') :
        state.userInput,
      hasOutput: !!state.output,
      outputType: typeof state.output,
      outputContent: typeof state.output === 'string' ? 
        state.output.substring(0, 200) + (state.output.length > 200 ? '...' : '') :
        state.output,
      completedAt: state.completedAt,
      tokensConsumed: undefined // Remove tokensConsumed as it's not part of StageState
    }));

    return NextResponse.json({
      success: true,
      message: 'Document content analysis complete',
      document: {
        id: document?.id,
        title: document?.title,
        workflowId: document?.workflowId,
        status: document?.status,
        userId: document?.userId,
        createdAt: document?.createdAt,
        updatedAt: document?.updatedAt
      },
      content: {
        stageStatesCount: Object.keys(stageStates || {}).length,
        stageAnalysis,
        hasAnyUserInput: stageAnalysis.some(s => s.hasUserInput),
        hasAnyOutput: stageAnalysis.some(s => s.hasOutput),
        completedStages: stageAnalysis.filter(s => s.status === 'completed').length,
        totalWordCount: stageAnalysis.reduce((count, s) => {
          if (typeof s.outputContent === 'string') {
            return count + s.outputContent.split(/\s+/).length;
          }
          return count;
        }, 0)
      }
    });

  } catch (error: any) {
    console.error('[TEST] Failed to analyze document content:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to analyze document content',
      documentId
    }, { status: 500 });
  }
}

export async function POST() {
  try {
    console.log('[TEST] Creating test document with rich content...');
    
    // Create a test document with complex stage states
    const testStageStates = {
      'stage-1': {
        stageId: 'stage-1',
        status: 'completed' as const,
        isStale: false,
        staleDismissed: false,
        depsAreMet: true,
        shouldAutoRun: false,
        isEditingOutput: false,
        userInput: 'This is test user input for stage 1',
        output: 'This is the generated output for stage 1. It contains multiple sentences and shows that content is preserved properly.',
        completedAt: new Date().toISOString(),
        tokensConsumed: 150
      },
      'stage-2': {
        stageId: 'stage-2',
        status: 'completed' as const,
        isStale: false,
        staleDismissed: false,
        depsAreMet: true,
        shouldAutoRun: false,
        isEditingOutput: false,
        userInput: {
          title: 'Test Article Title',
          description: 'This is a test description with multiple fields',
          category: 'Technology'
        },
        output: 'Generated content for stage 2:\n\n# Test Article Title\n\nThis is the beginning of a test article that demonstrates multi-line content preservation.\n\nIt includes:\n- Multiple paragraphs\n- Lists\n- Various formatting\n\nThis ensures that complex content structures are preserved correctly.',
        completedAt: new Date().toISOString(),
        tokensConsumed: 320
      }
    };

    const saveResult = await documentPersistence.saveDocument(
      null, // new document
      'Content Preservation Test Document',
      'targeted-page-seo-optimized-v3',
      testStageStates
    );

    if (!saveResult.success) {
      throw new Error(saveResult.error || 'Failed to create test document');
    }

    console.log('[TEST] Test document created successfully:', saveResult.documentId);

    // Immediately load it back to verify
    const loadResult = await documentPersistence.loadDocument(saveResult.documentId!);
    
    if (!loadResult.success) {
      throw new Error('Failed to load back the test document');
    }

    return NextResponse.json({
      success: true,
      message: 'Test document created and verified',
      documentId: saveResult.documentId,
      testUrl: `/api/test-document-content?documentId=${saveResult.documentId}`,
      wizardUrl: `/w/targeted-page-seo-optimized-v3/${saveResult.documentId}`,
      verification: {
        originalStageCount: Object.keys(testStageStates).length,
        loadedStageCount: Object.keys(loadResult.stageStates || {}).length,
        contentPreserved: Object.keys(testStageStates).length === Object.keys(loadResult.stageStates || {}).length
      }
    });

  } catch (error: any) {
    console.error('[TEST] Failed to create test document:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to create test document'
    }, { status: 500 });
  }
} 