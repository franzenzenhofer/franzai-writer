import { firestoreAdapter } from '@/lib/firestore-adapter';
import type { ExportJob, ExportJobQueued, ExportJobRunning, ExportJobCompleted, ExportJobError } from '@/types';

export class ExportJobService {
  private static getJobPath(documentId: string): string {
    return `documents/${documentId}/jobs`;
  }

  static async createJob(documentId: string, stageId: string, userId: string): Promise<string> {
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const now = new Date().toISOString();

    const newJob: ExportJobQueued = {
      id: jobId,
      documentId,
      stageId,
      status: 'queued',
      progress: 0,
      createdAt: now,
      updatedAt: now,
      createdBy: userId,
    };

    try {
      await firestoreAdapter.createDocument(this.getJobPath(documentId), jobId, newJob);
      console.log(`[ExportJobService] Created job ${jobId} for document ${documentId}`);
      return jobId;
    } catch (error) {
      console.error(`[ExportJobService] Failed to create job:`, error);
      throw new Error(`Failed to create export job: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  static async updateJob(documentId: string, jobId: string, updates: Partial<ExportJob>): Promise<void> {
    const payload = { ...updates, updatedAt: new Date().toISOString() };
    try {
      await firestoreAdapter.updateDocument(this.getJobPath(documentId), jobId, payload);
      console.log(`[ExportJobService ${jobId}] Job state updated:`, payload);
    } catch (error) {
      console.error(`[ExportJobService ${jobId}] Failed to update job:`, error);
      throw new Error(`Failed to update job ${jobId}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  static async startJob(documentId: string, jobId: string): Promise<void> {
    await this.updateJob(documentId, jobId, {
      status: 'running',
      progress: 5,
      error: undefined,
      output: undefined,
    });
  }

  static async updateProgress(documentId: string, jobId: string, progress: number): Promise<void> {
    if (progress < 0 || progress > 100) {
      console.warn(`[ExportJobService ${jobId}] Invalid progress: ${progress}. Clamping to 0-100.`);
      progress = Math.max(0, Math.min(100, progress));
    }
    await this.updateJob(documentId, jobId, { progress });
  }

  static async completeJob(documentId: string, jobId: string, outputData: any): Promise<void> {
    const updates: Pick<ExportJobCompleted, 'status' | 'progress' | 'output' | 'error'> = {
      status: 'completed',
      progress: 100,
      output: outputData,
      error: undefined,
    };
    await this.updateJob(documentId, jobId, updates);
  }

  static async failJob(documentId: string, jobId: string, errorMessage: string, currentProgress?: number): Promise<void> {
    const updates: Pick<ExportJobError, 'status' | 'error' | 'output' | 'progress'> = {
      status: 'error',
      error: errorMessage,
      output: undefined,
      progress: currentProgress !== undefined && currentProgress >= 0 ? currentProgress : -1,
    };
    await this.updateJob(documentId, jobId, updates);
  }

  static async getJob(documentId: string, jobId: string): Promise<ExportJob | null> {
    try {
      const jobData = await firestoreAdapter.getDocument(this.getJobPath(documentId), jobId);
      return jobData as ExportJob;
    } catch (error) {
      console.error(`[ExportJobService] Failed to get job ${jobId}:`, error);
      return null;
    }
  }
}