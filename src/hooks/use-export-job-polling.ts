// src/hooks/use-export-job-polling.ts
import { useEffect } from 'react';
import { firebaseApp } from '@/lib/firebase';
import { getFirestore, doc, onSnapshot, Unsubscribe } from 'firebase/firestore';
import type { StageState, ExportJob } from '@/types';

export function useExportJobPolling(
  jobId: string | undefined,
  documentId: string | undefined,
  stageId: string,
  updateStageStateCallback: (stageId: string, updates: Partial<StageState>) => void
) {
  useEffect(() => {
    if (!jobId || !documentId || !stageId) {
      // console.log('[useExportJobPolling] Missing jobId, documentId, or stageId. Not polling.');
      return;
    }

    // Ensure firebaseApp is initialized
    if (!firebaseApp) {
      console.error('[useExportJobPolling] Firebase app not initialized. Cannot set up listener.');
      return;
    }

    const db = getFirestore(firebaseApp);
    const jobDocRef = doc(db, `documents/${documentId}/jobs/${jobId}`);

    console.log(`[useExportJobPolling] Setting up listener for documents/${documentId}/jobs/${jobId} (Stage: ${stageId})`);

    const unsubscribe: Unsubscribe = onSnapshot(jobDocRef, (jobSnap) => {
      if (!jobSnap.exists()) {
        console.warn(`[useExportJobPolling] Job ${jobId} not found in Firestore for stage ${stageId}. Document path: documents/${documentId}/jobs/${jobId}`);
        // Optionally update stage to an error or reset state if job suddenly disappears
        // This could happen if the job document is deleted.
        // updateStageStateCallback(stageId, {
        //   status: 'error',
        //   error: 'Export job data disappeared.',
        //   exportJobId: undefined,
        //   generationProgress: { currentFormat: 'Job data lost' }
        // });
        return;
      }

      const jobData = jobSnap.data() as ExportJob;
      console.log(`[useExportJobPolling] Job ${jobId} (Stage: ${stageId}) update:`, jobData);

      const newStageState: Partial<StageState> = {
        status: jobData.status, // This will be 'queued', 'running', 'completed', 'error', 'cancelled'
        error: jobData.error || undefined, // Ensure undefined if no error string
        output: jobData.output || undefined, // Will be undefined until job completes with output
        exportJobId: jobData.id, // Keep this in sync
        // Map job progress and status to generationProgress for UI
        generationProgress: {
          currentFormat: jobData.status === 'running' ? `Processing: ${jobData.progress || 0}%` :
                         jobData.status === 'queued' ? 'Queued for processing...' :
                         jobData.status === 'completed' ? 'Export completed' :
                         jobData.status === 'error' ? `Error: ${jobData.error || 'Unknown error'}` :
                         jobData.status === 'cancelled' ? 'Export cancelled' :
                         'Status: ' + jobData.status,
          // Potentially map jobData.progress to specific format progress if available in future
          // e.g., styledHtml: jobData.status === 'completed' ? 100 : jobData.progress
        },
      };

      updateStageStateCallback(stageId, newStageState);

      // Note: onSnapshot will continue to listen until unsubscribed.
      // The component using this hook is responsible for managing its lifecycle.
      // If the job reaches a terminal state, the UI will reflect it, and further updates
      // to the job doc (if any) will still be propagated until unsubscription.
      if (jobData.status === 'completed' || jobData.status === 'error' || jobData.status === 'cancelled') {
        console.log(`[useExportJobPolling] Job ${jobId} (Stage: ${stageId}) reached terminal state: ${jobData.status}.`);
      }
    }, (error) => {
      console.error(`[useExportJobPolling] Error listening to job ${jobId} (Stage: ${stageId}):`, error);
      updateStageStateCallback(stageId, {
        status: 'error', // Set stage status to error
        error: `Failed to monitor export job: ${error.message}`,
        exportJobId: jobId, // Keep jobId so we know which job failed
        generationProgress: { currentFormat: 'Error connecting to job status' }
      });
    });

    // Cleanup function for useEffect
    return () => {
      console.log(`[useExportJobPolling] Cleaning up listener for job: ${jobId} (Stage: ${stageId})`);
      unsubscribe();
    };
  }, [jobId, documentId, stageId, updateStageStateCallback]); // Dependencies for useEffect
}
