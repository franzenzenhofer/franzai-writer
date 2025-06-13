import { documentPersistence } from '@/lib/document-persistence';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request, 
  { params }: { params: Promise<{ documentId: string }> }
) {
  const { documentId } = await params;
  
  if (documentId === 'new' || documentId.startsWith('temp-')) {
    return NextResponse.json({ document: null, isNew: true });
  }
  
  const result = await documentPersistence.loadDocument(documentId);
  return NextResponse.json(result);
}