import { NextRequest, NextResponse } from 'next/server';
import { documentPersistence } from '@/lib/document-persistence';

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { documentId } = body;

    // Validate required fields
    if (!documentId?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Document ID is required' },
        { status: 400 }
      );
    }

    // Call the server-side document persistence
    const result = await documentPersistence.deleteDocument(documentId);

    return NextResponse.json({ success: result });

  } catch (error: any) {
    console.error('[API] Document delete failed:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete document' },
      { status: 500 }
    );
  }
}