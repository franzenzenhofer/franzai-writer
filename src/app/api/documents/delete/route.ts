import { NextRequest, NextResponse } from 'next/server';
import { documentPersistence } from '@/lib/document-persistence';

export async function DELETE(request: NextRequest) {
  try {
    console.log('[API] Delete document endpoint called');
    
    const body = await request.json();
    const { documentId } = body;
    
    if (!documentId?.trim()) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      );
    }
    
    console.log('[API] Delete document request', { 
      documentId: documentId.substring(0, 20) + '...'
    });
    
    const success = await documentPersistence.deleteDocument(documentId);
    
    console.log('[API] Delete document completed', { 
      success,
      documentId: documentId.substring(0, 20) + '...'
    });
    
    return NextResponse.json({ success });
  } catch (error: any) {
    console.error('[API] Delete document failed:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete document' },
      { status: 500 }
    );
  }
}