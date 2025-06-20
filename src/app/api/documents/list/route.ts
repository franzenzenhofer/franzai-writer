import { NextRequest, NextResponse } from 'next/server';
import { documentPersistence } from '@/lib/document-persistence';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    // FAIL HARD if no userId provided - NO FALLBACKS!
    if (!userId?.trim()) {
      return NextResponse.json(
        { success: false, error: 'User ID is required for listing documents. Authentication must complete before listing documents. NO FALLBACKS ALLOWED!' },
        { status: 400 }
      );
    }

    // Call the server-side document persistence
    const documents = await documentPersistence.listUserDocuments(userId);

    return NextResponse.json(documents);

  } catch (error: any) {
    console.error('[API] Document list failed:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to list documents' },
      { status: 500 }
    );
  }
}