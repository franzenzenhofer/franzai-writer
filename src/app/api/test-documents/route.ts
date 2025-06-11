import { NextResponse } from 'next/server';
import { documentPersistence } from '@/lib/document-persistence';

export async function GET() {
  try {
    console.log('Testing document persistence...');
    
    // Test 1: List all documents
    const documents = await documentPersistence.listUserDocuments();
    
    return NextResponse.json({
      success: true,
      message: 'Document persistence test successful',
      tests: {
        documentsFound: documents.length,
        documents: documents.map(doc => ({
          id: doc.id,
          title: doc.title,
          workflowId: doc.workflowId,
          status: doc.status,
          userId: doc.userId,
          createdAt: doc.createdAt,
          updatedAt: doc.updatedAt
        }))
      }
    });
    
  } catch (error: any) {
    console.error('Document persistence test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: {
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }
    }, { status: 500 });
  }
}

export async function POST() {
  try {
    console.log('Testing document creation...');
    
    // Test creating a new document
    const testStageStates = {
      'topic-definition': {
        stageId: 'topic-definition',
        status: 'completed' as const,
        userInput: 'Test topic for document persistence',
        output: 'This is a test document created to verify persistence functionality.',
        completedAt: new Date().toISOString()
      }
    };
    
    const result = await documentPersistence.saveDocument(
      null, // null means create new
      'Test Document - Persistence Check',
      'targeted-page-seo-optimized-v3',
      testStageStates
    );
    
    if (result.success && result.documentId) {
      // Try to load it back
      const loadResult = await documentPersistence.loadDocument(result.documentId);
      
      return NextResponse.json({
        success: true,
        message: 'Document creation and loading test successful',
        tests: {
          created: result,
          loaded: loadResult.success ? {
            document: loadResult.document,
            stageStatesCount: Object.keys(loadResult.stageStates || {}).length
          } : loadResult
        }
      });
    } else {
      throw new Error(result.error || 'Failed to create document');
    }
    
  } catch (error: any) {
    console.error('Document creation test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: {
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }
    }, { status: 500 });
  }
} 