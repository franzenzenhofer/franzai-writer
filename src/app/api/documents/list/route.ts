import { NextRequest, NextResponse } from 'next/server';
import { documentPersistence } from '@/lib/document-persistence';

export async function GET(request: NextRequest) {
  try {
    console.log('[API] List documents endpoint called');
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    console.log('[API] List documents request', { 
      hasUserId: !!userId,
      userId: userId?.substring(0, 20) + '...' || 'none'
    });
    
    // DEMO MODE: If no userId provided, let documentPersistence generate one
    // This enables DEMO mode for non-logged-in users
    const documents = await documentPersistence.listUserDocuments(userId || undefined);
    
    console.log('[API] List documents completed', { 
      count: documents.length,
      demoMode: !userId
    });
    
    return NextResponse.json(documents);
  } catch (error: any) {
    console.error('[API] List documents failed:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to list documents' },
      { status: 500 }
    );
  }
}