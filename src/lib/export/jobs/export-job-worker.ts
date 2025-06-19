// Intended for Firebase Cloud Functions deployment
// File: src/lib/export/jobs/export-job-worker.ts

// Firebase Admin SDK (usually initialized by Firebase environment in Cloud Functions)
// import * as admin from 'firebase-admin';
// admin.initializeApp(); // Typically done once at the top level if not auto-initialized

import * as functions from 'firebase-functions';
import { runExportJob } from './runExportJob'; // Path is correct as they are in the same directory
import type { ExportJobQueued, ExportJob } from '@/types'; // Import the specific job types

export const onExportJobCreated = functions.firestore
  .document('documents/{documentId}/jobs/{jobId}')
  .onCreate(async (snap, context) => {
    const jobId = context.params.jobId;
    const documentId = context.params.documentId;
    // Type the data from Firestore. Using ExportJobQueued as we expect 'queued' status.
    const jobData = snap.data() as ExportJobQueued | undefined;

    console.log(`[ExportWorker] Triggered for new job ${jobId} in document ${documentId}.`);
    console.log(`[ExportWorker] Job data:`, jobData);

    if (!jobData) {
      console.error(`[ExportWorker] No data found for job ${jobId}. Exiting.`);
      return null;
    }

    // Ensure it's a new job in 'queued' state before processing.
    // This check is crucial, especially if jobData was typed as ExportJob (more general).
    // With ExportJobQueued, jobData.status is already known to be 'queued' if jobData is valid.
    if (jobData.status !== 'queued') {
      console.warn(`[ExportWorker] Job ${jobId} is not in 'queued' state (status: ${jobData.status}). This should not happen for an onCreate trigger with ExportJobQueued type if data is consistent. Skipping.`);
      return null;
    }

    // stageId is a required property in ExportJobBase, so it's present in ExportJobQueued.
    // No need to check for !jobData.stageId if jobData is correctly typed and validated as ExportJobQueued.
    // However, if there's any doubt or if the type was more general (ExportJob), this check is useful.
    // For this refactor, we rely on the type system; if jobData is ExportJobQueued, stageId exists.
    // If jobData.stageId could truly be missing despite the type (e.g. bad data in Firestore),
    // then a runtime check `if (!jobData.stageId)` would still be prudent.
    // Given the task, we'll assume the type implies presence for now.

    // The old check:
    // if (!jobData.stageId) {
    //     console.error(`[ExportWorker] Job ${jobId} is missing stageId. Cannot process.`);
    //     // TODO: Consider updating the job to an error state here.
    //     // This would require the worker to have write access to Firestore,
    // ...
    // }
    // For robustness, especially if Firestore data might not perfectly match types:
    if (typeof jobData.stageId !== 'string' || !jobData.stageId) {
        console.error(`[ExportWorker] Job ${jobId} is missing a valid stageId. Data:`, jobData);
        // Optional: Call ExportJobService.failJob here if service is imported and configured for admin access.
        // This requires ExportJobService to be usable by the function (e.g. admin SDK initialized for firestoreAdapter).
        // e.g. await ExportJobService.failJob(documentId, jobId, 'Job data is missing stageId.');
        // e.g., using admin.firestore() or if firestoreAdapter is configured for admin access.
        // Example:
        // try {
        //   const jobRef = admin.firestore().collection('documents').doc(documentId).collection('jobs').doc(jobId);
        //   await jobRef.update({ status: 'error', error: 'Missing stageId', updatedAt: new Date().toISOString() });
        // } catch (updateError) {
        //   console.error(`[ExportWorker] Failed to update job ${jobId} to error state:`, updateError);
        // }
        return null; // Exit if essential data is missing.
    }

    try {
      console.log(`[ExportWorker] Processing job ${jobId} for stage ${jobData.stageId}...`);
      // runExportJob is responsible for all job state transitions (running, completed, error)
      await runExportJob({
        jobId,
        documentId,
        stageId: jobData.stageId, // jobData.stageId is now type-safe (string)
      });
      console.log(`[ExportWorker] Successfully processed job ${jobId}. runExportJob completed.`);
      return null; // Indicate successful handling of the trigger
    } catch (error) { // Changed from error: any
      console.error(`[ExportWorker] Error processing job ${jobId}. runExportJob threw an error:`, error);
      const message = error instanceof Error ? error.message : 'Unknown error from runExportJob';
      // runExportJob should ideally set the job status to 'error' in Firestore.
      // This catch block is a safety net.
      // functions.logger.error() is the more idiomatic way to log errors in Firebase Functions.
      functions.logger.error(`[ExportWorker] Error for job ${jobId}:`, {
        message: message,
        originalError: error, // Log the original error object for more details
      });
      // Re-throwing the error might cause Firebase to retry the function based on its configuration.
      // HttpsError is typically for callable functions, but can be used to signal structured errors.
      throw new functions.https.HttpsError('internal', `Failed to process export job ${jobId}. Original error: ${message}`, { originalErrorDetails: String(error) });
    }
  });

// Deployment Notes (as per task description):
// 1. Ensure 'firebase-functions' and 'firebase-admin' are in package.json for the functions deployment.
// 2. Path to 'runExportJob' is './runExportJob'.
// 3. Firestore rules must allow the Cloud Function's service account to read documents and update job status.
// 4. If this file is deployed outside a standard Firebase `functions` directory, specific configuration is needed.
// 5. `firestoreAdapter` (used by `runExportJob`) must be compatible with the Cloud Function environment.
//    If `firestoreAdapter` relies on a client-side Firebase SDK instance, it will fail.
//    `runExportJob` or `firestoreAdapter` might need to be adjusted to use `admin.firestore()`
//    when running in a Cloud Function. This implementation assumes this compatibility is handled.
