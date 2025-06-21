import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import {
  getFirestore,
  serverTimestamp,
  doc,
  setDoc,
  updateDoc,
  getDoc,
} from 'firebase/firestore';
import { app } from '@/lib/firebase';

/*
 * /api/publish – Persist a publication document so that the public route
 *   (/published/[publishId]/[format]) can serve it later.  
 *
 * Expected request body (sent from ExportStageCard):
 * {
 *   documentId: string,
 *   workflowId: string,
 *   formats: string[],                  // formats the user picked to publish
 *   content: Record<format, {content}>  // all generated formats
 *   publishId?: string                  // optional – when updating an existing publication
 * }
 */

const db = getFirestore(app);

/**
 * Handle document publishing
 * Creates a unique URL for sharing the document content
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      documentId,
      workflowId,
      formats,
      content,
      publishId: incomingPublishId,
    } = body;

    // ---------- Validation ---------- //
    if (!documentId || !Array.isArray(formats) || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: documentId, formats, content' },
        { status: 400 }
      );
    }

    // Ensure every requested format exists in the provided content
    const missingFormats = formats.filter((fmt: string) => !content[fmt]);
    if (missingFormats.length) {
      return NextResponse.json(
        { error: `Missing content for formats: ${missingFormats.join(', ')}` },
        { status: 400 }
      );
    }

    // ---------- Determine ID & document ref ---------- //
    const publishId = incomingPublishId || uuidv4();
    const docRef = doc(db, 'publications', publishId);

    // ---------- Build payload ---------- //
    const nowTs = serverTimestamp();

    // Store only the selected formats to keep Firestore docs lean & predictable
    const selectedContent: Record<string, { content: string; mimeType: string }> = {};
    formats.forEach((fmt: string) => {
      const raw = content[fmt];
      if (!raw || typeof raw.content !== 'string') return;

      let mimeType = 'text/plain';
      if (fmt === 'html-styled' || fmt === 'html-clean') mimeType = 'text/html';
      else if (fmt === 'markdown') mimeType = 'text/markdown';

      selectedContent[fmt] = {
        content: raw.content,
        mimeType,
      };
    });

    const payload = {
      publishId,
      documentId,
      workflowId: workflowId || null,
      formats,
      content: selectedContent,
      isActive: true,
      views: 0,
      createdAt: nowTs,
      updatedAt: nowTs,
    };

    // ---------- Persist (create or update) ---------- //
    const existing = await getDoc(docRef);
    if (existing.exists()) {
      // Update – keep createdAt, increment updatedAt
      await updateDoc(docRef, {
        ...payload,
        createdAt: existing.data().createdAt ?? nowTs,
        updatedAt: nowTs,
      });
    } else {
      await setDoc(docRef, payload);
    }

    // ---------- Build response ---------- //
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:9002');

    const publishedUrl = `${baseUrl}/published/${publishId}`;

    console.log('[Publish API] Publication saved', {
      publishId,
      formats,
      publishedUrl,
    });

    return NextResponse.json({
      success: true,
      publishId,
      publishedUrl,
      publishedAt: new Date().toISOString(),
      formats,
      message: 'Content published successfully',
    });
  } catch (error) {
    console.error('[Publish API] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to publish content',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}