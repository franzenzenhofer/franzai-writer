import { useEffect } from 'react';
import { app } from '@/lib/firebase';
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
      return;
    }

    if (!app) {
      console.error('[useExportJobPolling] Firebase app not initialized. Cannot set up listener.');
      return;
    }

    const db = getFirestore(app);
    const jobDocRef = doc(db, `documents/${documentId}/jobs/${jobId}`);

    console.log(`[useExportJobPolling] Setting up listener for documents/${documentId}/jobs/${jobId} (Stage: ${stageId})`);

    const unsubscribe: Unsubscribe = onSnapshot(jobDocRef, (jobSnap) => {
      if (!jobSnap.exists()) {
        console.warn(`[useExportJobPolling] Job ${jobId} not found in Firestore for stage ${stageId}.`);
        return;
      }

      const jobData = jobSnap.data() as ExportJob;
      console.log(`[useExportJobPolling] Job ${jobId} (Stage: ${stageId}) update:`, jobData);

      // Map job status to stage status
      let stageStatus: StageState['status'];
      switch (jobData.status) {
        case 'queued':
        case 'running':
          stageStatus = 'running';
          break;
        case 'completed':
          stageStatus = 'completed';
          break;
        case 'error':
        case 'cancelled':
          stageStatus = 'error';
          break;
        default:
          stageStatus = 'error';
      }

      const newStageState: Partial<StageState> = {
        status: stageStatus,
        error: jobData.error || undefined,
        output: jobData.output || undefined,
        exportJobId: jobData.id,
        generationProgress: {
          currentFormat: jobData.status === 'running' ? `Processing: ${jobData.progress || 0}%` :
                         jobData.status === 'queued' ? 'Queued for processing...' :
                         jobData.status === 'completed' ? 'Export completed' :
                         jobData.status === 'error' ? `Error: ${jobData.error || 'Unknown error'}` :
                         jobData.status === 'cancelled' ? 'Export cancelled' :
                         'Status: ' + jobData.status,
        },
      };

      updateStageStateCallback(stageId, newStageState);

      if (jobData.status === 'completed' || jobData.status === 'error' || jobData.status === 'cancelled') {
        console.log(`[useExportJobPolling] Job ${jobId} (Stage: ${stageId}) reached terminal state: ${jobData.status}.`);
      }
    }, (error) => {
      console.error(`[useExportJobPolling] Error listening to job ${jobId} (Stage: ${stageId}):`, error);
      updateStageStateCallback(stageId, {
        status: 'error',
        error: `Failed to monitor export job: ${error.message}`,
        exportJobId: jobId,
        generationProgress: { currentFormat: 'Error connecting to job status' }
      });
    });

    return () => {
      console.log(`[useExportJobPolling] Cleaning up listener for job: ${jobId} (Stage: ${stageId})`);
      unsubscribe();
    };
  }, [jobId, documentId, stageId, updateStageStateCallback]);
}