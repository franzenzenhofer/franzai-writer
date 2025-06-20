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
    
    // Generate a unique publication ID with random component for republishing
    const publishId = `${documentId}-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`;
    
    // Clean the content to prevent nested entity errors
    const cleanContent = (data: any): any => {
      try {
        const jsonString = JSON.stringify(data);
        if (jsonString.length > 100000) {
          // Too large - create summary
          return {
            type: 'large_content_summary',
            size: jsonString.length,
            formats: Object.keys(data || {}),
            timestamp: new Date().toISOString()
          };
        }
        return JSON.parse(jsonString);
      } catch (e) {
        return {
          type: 'content_error',
          error: e instanceof Error ? e.message : 'Content cleaning failed',
          fallback: String(data).substring(0, 1000)
        };
      }
    };

    // Prepare the publication data
    const publicationData = {
      documentId,
      publishId,
      formats,
      content: cleanContent(content),
      options: cleanContent(options),
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