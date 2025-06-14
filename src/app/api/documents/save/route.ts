import { NextRequest, NextResponse } from 'next/server';
import { documentPersistence } from '@/lib/document-persistence';
import type { StageState } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { documentId, title, workflowId, stageStates, userId } = body;

    // Validate required fields
    if (!title?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Document title is required' },
        { status: 400 }
      );
    }

    if (!workflowId?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Workflow ID is required' },
        { status: 400 }
      );
    }

    if (!stageStates || typeof stageStates !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Stage states must be a valid object' },
        { status: 400 }
      );
    }

    // Call the server-side document persistence
    const result = await documentPersistence.saveDocument(
      documentId,
      title,
      workflowId,
      stageStates as Record<string, StageState>,
      userId
    );

    return NextResponse.json(result);

  } catch (error: any) {
    console.error('[API] Document save failed:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save document' },
      { status: 500 }
    );
  }
} 