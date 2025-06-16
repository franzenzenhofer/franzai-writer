import { NextRequest, NextResponse } from 'next/server';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { app } from '@/lib/firebase';

const db = getFirestore(app);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { documentId, formats, content, options } = body;
    
    if (!documentId || !formats || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Generate a unique publication ID
    const publishId = `${documentId}-${Date.now()}`;
    
    // Prepare the publication data
    const publicationData = {
      documentId,
      publishId,
      formats,
      content,
      options,
      publishedAt: serverTimestamp(),
      views: 0,
      isActive: true,
    };
    
    // Save to Firestore
    await setDoc(doc(db, 'publications', publishId), publicationData);
    
    // Generate URLs
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002';
    const publishedUrl = `${baseUrl}/published/${publishId}`;
    
    return NextResponse.json({
      success: true,
      publishedUrl,
      publishId,
    });
  } catch (error) {
    console.error('[Publish API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to publish content' },
      { status: 500 }
    );
  }
}