'use server';

import { firestoreAdapter } from './firestore-adapter';
import { generateExportHtml } from './export/ai-html-generator';
import { processExportFormats } from './export/format-converters';
import type { Stage, Workflow, StageState, ExportStageState } from '@/types';

/**
 * Export Job Management System
 * 
 * This system treats export stages like any other stage with persistent state.
 * It eliminates the RSC callback violation by using Firestore as the single source of truth.
 * 
 * Architecture:
 * 1. Client calls startExportJob() server action
 * 2. Server creates/updates export stage document in Firestore
 * 3. Background job processes the export and updates the document
 * 4. Client subscribes to the document for real-time progress updates
 * 5. Page reloads simply re-subscribe to the existing document state
 */

export interface ExportJobParams {
  documentId: string;
  stageId: string;
  stage: Stage;
  workflow: Workflow;
  allStageStates: Record<string, StageState>;
  userId?: string;
}

export interface ExportJobState {
  jobId: string;
  documentId: string;
  stageId: string;
  status: 'idle' | 'running' | 'completed' | 'error';
  progress: {
    styledHtml: number;
    cleanHtml: number;
    currentFormat: string;
  };
  output?: {
    htmlStyled?: string;
    htmlClean?: string;
    markdown?: string;
    formats?: Record<string, any>;
  };
  error?: string;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

const EXPORT_JOBS_COLLECTION = 'export-jobs';

class ExportJobManager {
  /**
   * Start an export job - creates job document and queues background processing
   */
  async startExportJob(params: ExportJobParams): Promise<{ success: boolean; jobId?: string; error?: string }> {
    try {
      console.log('[ExportJobManager] Starting export job:', {
        documentId: params.documentId,
        stageId: params.stageId,
        workflowId: params.workflow.id
      });

      // Create job document
      const jobId = `${params.documentId}_${params.stageId}`;
      const jobState: ExportJobState = {
        jobId,
        documentId: params.documentId,
        stageId: params.stageId,
        status: 'running',
        progress: {
          styledHtml: 0,
          cleanHtml: 0,
          currentFormat: 'Starting export...'
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        startedAt: new Date().toISOString()
      };

      // Save job state to Firestore
      await firestoreAdapter.setDocument(EXPORT_JOBS_COLLECTION, jobId, jobState);
      
      console.log('[ExportJobManager] Export job document created:', jobId);

      // Start background processing (fire-and-forget)
      this.processExportJobInBackground(params, jobId).catch(error => {
        console.error('[ExportJobManager] Background job failed:', error);
        // Update job state to error
        this.updateJobState(jobId, {
          status: 'error',
          error: error instanceof Error ? error.message : 'Export job failed',
          updatedAt: new Date().toISOString()
        }).catch(updateError => {
          console.error('[ExportJobManager] Failed to update job error state:', updateError);
        });
      });

      return { success: true, jobId };
    } catch (error) {
      console.error('[ExportJobManager] Failed to start export job:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to start export job' 
      };
    }
  }

  /**
   * Get export job state
   */
  async getExportJobState(jobId: string): Promise<ExportJobState | null> {
    try {
      const jobData = await firestoreAdapter.getDocument(EXPORT_JOBS_COLLECTION, jobId);
      return jobData as ExportJobState | null;
    } catch (error) {
      console.error('[ExportJobManager] Failed to get job state:', error);
      return null;
    }
  }

  /**
   * Update job state in Firestore
   */
  private async updateJobState(jobId: string, updates: Partial<ExportJobState>): Promise<void> {
    try {
      await firestoreAdapter.updateDocument(EXPORT_JOBS_COLLECTION, jobId, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('[ExportJobManager] Failed to update job state:', error);
      throw error;
    }
  }

  /**
   * Background export processing - runs independently of client connection
   */
  private async processExportJobInBackground(params: ExportJobParams, jobId: string): Promise<void> {
    try {
      console.log('[ExportJobManager] Starting background export processing:', jobId);

      // Update progress: Starting HTML generation
      await this.updateJobState(jobId, {
        progress: {
          styledHtml: 10,
          cleanHtml: 0,
          currentFormat: 'Generating HTML...'
        }
      });

      // Step 1: Generate HTML with dual AI passes
      const htmlResult = await generateExportHtml({
        stages: params.workflow.stages,
        stageStates: params.allStageStates,
        exportConfig: params.stage.exportConfig,
        workflowType: params.workflow.id,
        // No progressCallback - we update Firestore directly
      });

      if (htmlResult.error) {
        throw new Error(htmlResult.error);
      }

      console.log('[ExportJobManager] HTML generation complete');

      // Update progress: HTML complete, starting formats
      await this.updateJobState(jobId, {
        progress: {
          styledHtml: 50,
          cleanHtml: 50,
          currentFormat: 'Processing formats...'
        }
      });

      // Step 2: Process all export formats
      const formats = await processExportFormats(
        htmlResult.htmlStyled,
        htmlResult.htmlClean,
        params.stage.exportConfig
      );

      console.log('[ExportJobManager] Format processing complete');

      // Update progress: Complete
      const finalOutput = {
        htmlStyled: htmlResult.htmlStyled,
        htmlClean: htmlResult.htmlClean,
        markdown: formats.markdown?.content,
        formats
      };

      await this.updateJobState(jobId, {
        status: 'completed',
        progress: {
          styledHtml: 100,
          cleanHtml: 100,
          currentFormat: 'Export complete!'
        },
        output: finalOutput,
        completedAt: new Date().toISOString()
      });

      console.log('[ExportJobManager] Export job completed successfully:', jobId);

    } catch (error) {
      console.error('[ExportJobManager] Export job failed:', error);
      
      await this.updateJobState(jobId, {
        status: 'error',
        error: error instanceof Error ? error.message : 'Export processing failed',
        progress: {
          styledHtml: 0,
          cleanHtml: 0,
          currentFormat: 'Export failed'
        }
      });
    }
  }

  /**
   * Clean up old completed jobs (call from cron or startup)
   */
  async cleanupOldJobs(olderThanDays: number = 7): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
      const cutoffIso = cutoffDate.toISOString();

      console.log('[ExportJobManager] Cleaning up jobs older than:', cutoffIso);

      // Note: This is a simplified cleanup. In production, you'd want to use 
      // Firestore queries with proper pagination for large datasets
      const allJobs = await firestoreAdapter.queryDocuments(
        EXPORT_JOBS_COLLECTION, 
        { field: 'completedAt', operator: '<', value: cutoffIso }
      );

      for (const job of allJobs) {
        await firestoreAdapter.deleteDocument(EXPORT_JOBS_COLLECTION, job.id);
        console.log('[ExportJobManager] Deleted old job:', job.id);
      }

    } catch (error) {
      console.error('[ExportJobManager] Cleanup failed:', error);
    }
  }
}

// Singleton instance
export const exportJobManager = new ExportJobManager(); 