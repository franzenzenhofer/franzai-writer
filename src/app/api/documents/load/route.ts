import { NextRequest, NextResponse } from 'next/server';
import { documentPersistence } from '@/lib/document-persistence';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get('documentId');

    if (!documentId?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Document ID is required' },
        { status: 400 }
      );
    }

    // Call the server-side document persistence
    const result = await documentPersistence.loadDocument(documentId);

    return NextResponse.json(result);

  } catch (error: any) {
    console.error('[API] Document load failed:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to load document' },
      { status: 500 }
    );
  }
} 