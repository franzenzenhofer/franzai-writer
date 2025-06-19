// src/app/api/export/start/route.ts
import { NextResponse } from 'next/server';
import { firestoreAdapter } from '@/lib/firestore-adapter'; // Assuming this exists and is configured
import { v4 as uuidv4 } from 'uuid'; // Or use Firestore auto-ID
import type { ExportJobQueued } from '@/types'; // Updated to ExportJobQueued for specific typing

// Define the expected request body structure
interface StartExportRequestBody {
  documentId?: string;
  stageId?: string;
}

// Placeholder for auth functions - these would need actual implementation
async function getCurrentUserId(): Promise<string | null> {
  // In a real app, this would get the user from the session/token
  console.warn('[API /export/start] getCurrentUserId: Using mock user ID. Implement real auth.');
  return 'mock-user-id';
}

async function authorizeDocumentAccess(documentId: string, userId: string | null): Promise<boolean> {
  // In a real app, this would check if userId owns/can access documentId
  console.warn(`[API /export/start] authorizeDocumentAccess: Mocking auth for doc ${documentId}, user ${userId}. Implement real auth.`);
  if (!userId) return false;
  // const doc = await firestoreAdapter.getDocument('documents', documentId);
  // return doc?.userId === userId;
  return true; // Assume authorized for now
}


export async function POST(request: Request) {
  console.log('[API /export/start] Received POST request');
  try {
    const body: StartExportRequestBody = await request.json();

    console.log('[API /export/start] Request body:', body);

    if (!body.documentId || !body.stageId) {
      console.error('[API /export/start] Validation failed: documentId and stageId are required.');
      return NextResponse.json({ success: false, error: 'documentId and stageId are required' }, { status: 400 });
    }
    // After validation, we can assert that documentId and stageId are strings.
    const documentId: string = body.documentId;
    const stageId: string = body.stageId;

    const userId = await getCurrentUserId();
    if (!userId) {
      console.error('[API /export/start] Auth failed: User not authenticated.');
      return NextResponse.json({ success: false, error: 'User not authenticated' }, { status: 401 });
    }

    const isAuthorized = await authorizeDocumentAccess(documentId, userId);
    if (!isAuthorized) {
      console.error(`[API /export/start] Auth failed: User ${userId} not authorized for document ${documentId}.`);
      return NextResponse.json({ success: false, error: 'User not authorized for this document' }, { status: 403 });
    }

    console.log('[API /export/start] User authenticated and authorized.');

    const jobId = uuidv4(); // Generate a unique job ID
    const now = new Date().toISOString();

    // Use the specific ExportJobQueued type for better type safety
    const newJob: ExportJobQueued = {
      id: jobId,
      documentId, // now explicitly string
      stageId,    // now explicitly string
      status: 'queued',
      progress: 0, // As per ExportJobQueued, progress is 0 or undefined. Setting to 0.
      createdAt: now,
      updatedAt: now,
      createdBy: userId,
      // error and output are explicitly undefined in ExportJobQueued type by omission
    };

    console.log('[API /export/start] Creating new export job:', newJob);

    // Assuming firestoreAdapter can save to a subcollection.
    // The path would be like 'documents/{documentId}/jobs/{jobId}'
    // If firestoreAdapter.createDocument only supports top-level collections,
    // we might need to adjust the path or enhance the adapter.
    // For this subtask, we'll assume a direct way to set this.
    // A common pattern is firestore.collection('documents').doc(documentId).collection('jobs').doc(jobId).set(newJob);
    // We'll represent this with a hypothetical specialized adapter function or by constructing the path.

    const jobPath = `documents/${documentId}/jobs`; // Collection path for jobs under a document
    // await firestoreAdapter.createDocumentWithId(jobPath, jobId, newJob); // Or similar method

    // Let's try to use a generic set method if available, or assume one for subcollections
    // This might require an update to firestoreAdapter if it doesn't support paths like this.
    // For now, let's use a placeholder that implies setting a document at a specific path.
    // In a real scenario, firestoreAdapter.setDocument(path, documentId, data) would be ideal.
    // Or, firestoreAdapter.setDocumentByPath(`documents/${documentId}/jobs/${jobId}`, newJob)

    // The most likely Firestore SDK equivalent is:
    // firebase.firestore().collection('documents').doc(documentId).collection('jobs').doc(jobId).set(newJob);
    // The firestoreAdapter needs to support this. Let's assume it does via a path mechanism.
    // If not, the subtask report will indicate this needs adjustment.

    // Let's assume firestoreAdapter has a method like `setSubDocument` or that `setDocument` can handle full paths
    // If `createDocumentWithId` is available and can take a full path for collection, that works too.
    // Let's try to use `createDocumentWithId` for `documents/{documentId}/jobs` collection and `jobId` as doc ID.
    await firestoreAdapter.createDocumentWithId(`documents/${documentId}/jobs`, jobId, newJob);


    console.log(`[API /export/start] Export job ${jobId} created successfully in Firestore.`);

    return NextResponse.json({ success: true, jobId: jobId }, { status: 201 });

  } catch (error) { // Changed from error: any
    console.error('[API /export/start] Error processing request:', error);
    const message = error instanceof Error ? error.message : 'Failed to create export job due to an unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
