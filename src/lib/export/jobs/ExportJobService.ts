// src/lib/export/jobs/ExportJobService.ts
import { firestoreAdapter } from '@/lib/firestore-adapter';
import type { ExportJob, ExportJobQueued, ExportJobRunning, ExportJobCompleted, ExportJobError, ExportJobCancelled, ExportStageState } from '@/types';

export class ExportJobService {
  private static getJobPath(documentId: string): string {
    return `documents/${documentId}/jobs`;
  }

  static async updateJob(documentId: string, jobId: string, updates: Partial<ExportJob>): Promise<void> {
    // This is a generic update, use with caution or make private if specific methods cover all cases.
    // Ensure 'updatedAt' is always part of any update.
    const payload = { ...updates, updatedAt: new Date().toISOString() };
    try {
      await firestoreAdapter.updateDocument(this.getJobPath(documentId), jobId, payload);
      console.log(`[ExportJobService ${jobId}] Job state updated:`, payload);
    } catch (error) {
      console.error(`[ExportJobService ${jobId}] Failed to update job state for path ${this.getJobPath(documentId)}/${jobId}:`, error);
      // Re-throw a more specific error or handle as needed
      throw new Error(`Failed to update job ${jobId}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  static async startJob(documentId: string, jobId: string): Promise<void> {
    // Explicitly define the properties for the 'running' state, ensuring type safety.
    // We are transitioning TO the 'running' state.
    const updates: Pick<ExportJobRunning, 'status' | 'progress' | 'error' | 'output'> & { updatedAt: string } = {
      status: 'running',
      progress: 5, // Initial progress for starting
      error: undefined,
      output: undefined,
      updatedAt: new Date().toISOString(), // updateJob will overwrite, but good for type completeness if used directly
    };
    // Use the more generic updateJob to set these initial fields for the 'running' state.
    // The generic updateJob ensures 'updatedAt' is always fresh.
    await this.updateJob(documentId, jobId, {
      status: 'running',
      progress: 5,
      error: undefined,
      output: undefined,
    });
  }

  static async updateProgress(documentId: string, jobId: string, progress: number): Promise<void> {
    if (progress < 0 || progress > 100) {
      console.warn(`[ExportJobService ${jobId}] Attempted to set invalid progress: ${progress}. Clamping to 0-100.`);
      progress = Math.max(0, Math.min(100, progress));
    }
    // Assuming progress updates happen while 'running'.
    // If job could be in other states, this might need adjustment or the caller ensures correct state.
    const updates: Partial<ExportJobRunning> = { // Partial is okay as we're only updating progress
      progress,
      // status would remain 'running' implicitly
    };
    await this.updateJob(documentId, jobId, updates);
  }

  static async completeJob(documentId: string, jobId: string, outputData: ExportStageState['output']): Promise<void> {
    // Construct the exact fields for ExportJobCompleted state for type safety
    const updates: Pick<ExportJobCompleted, 'status' | 'progress' | 'output' | 'error'> = {
      status: 'completed',
      progress: 100,
      output: outputData,
      error: undefined, // Explicitly ensure error is undefined for a completed job
    };
    await this.updateJob(documentId, jobId, updates);
  }

  static async failJob(documentId: string, jobId: string, errorMessage: string, currentProgress?: number): Promise<void> {
    // Construct the exact fields for ExportJobError state for type safety
    const updates: Pick<ExportJobError, 'status' | 'error' | 'output' | 'progress'> = {
      status: 'error',
      error: errorMessage,
      output: undefined, // Explicitly ensure output is undefined for an errored job
      progress: currentProgress !== undefined && currentProgress >= 0 ? currentProgress : -1, // Use current progress or -1
    };
    await this.updateJob(documentId, jobId, updates);
  }

  // Example of a more specific update if needed, e.g., for cancellation
  static async cancelJob(documentId: string, jobId: string, reason?: string): Promise<void> {
    const updates: Pick<ExportJobCancelled, 'status' | 'error' | 'output' | 'progress'> = {
        status: 'cancelled',
        error: reason,
        output: undefined,
        // progress: currentProgressAtCancellation, // if available
    };
    await this.updateJob(documentId, jobId, updates);
  }
}
