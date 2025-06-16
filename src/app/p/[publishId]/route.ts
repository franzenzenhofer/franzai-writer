import { NextRequest, NextResponse } from 'next/server';
import { redirect } from 'next/navigation';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { app } from '@/lib/firebase';

const db = getFirestore(app);

export async function GET(
  request: NextRequest,
  { params }: { params: { publishId: string } }
) {
  try {
    const { publishId } = params;
    
    // Check if the publication exists
    const docRef = doc(db, 'publications', publishId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists() || !docSnap.data().isActive) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    }
    
    // Redirect to the full published URL (default to styled format)
    redirect(`/published/${publishId}/styled`);
  } catch (error) {
    console.error('[Short URL] Error:', error);
    return NextResponse.json(
      { error: 'Failed to redirect' },
      { status: 500 }
    );
  }
} 