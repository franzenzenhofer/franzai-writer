'use server';

import { exportJobManager } from '@/lib/export-job-manager';
import type { Stage, Workflow, StageState } from '@/types';

export interface StartExportJobParams {
  documentId: string;
  stageId: string;
  stage: Stage;
  workflow: Workflow;
  allStageStates: Record<string, StageState>;
  userId?: string;
}

/**
 * Start an export job - replaces the old executeExportStage with callback
 * 
 * This server action creates an export job and returns immediately.
 * The client then subscribes to the job progress via Firestore.
 * 
 * Benefits:
 * - No RSC callback violations
 * - Survives page reloads and network issues
 * - Clean separation of concerns
 * - Background processing continues even if user closes tab
 */
export async function startExportJob(params: StartExportJobParams): Promise<{
  success: boolean;
  jobId?: string;
  error?: string;
}> {
  try {
    console.log('[startExportJob] Starting export job:', {
      documentId: params.documentId,
      stageId: params.stageId,
      workflowId: params.workflow.id,
      hasUserId: !!params.userId
    });

    // Validate required parameters
    if (!params.documentId) {
      throw new Error('Document ID is required');
    }
    if (!params.stageId) {
      throw new Error('Stage ID is required');
    }
    if (!params.stage) {
      throw new Error('Stage configuration is required');
    }
    if (!params.workflow) {
      throw new Error('Workflow configuration is required');
    }
    if (!params.allStageStates || Object.keys(params.allStageStates).length === 0) {
      throw new Error('Stage states are required for export');
    }

    // Validate that the stage is actually an export stage
    if (params.stage.stageType !== 'export') {
      throw new Error('Stage must be of type "export"');
    }

    // Start the export job
    const result = await exportJobManager.startExportJob({
      documentId: params.documentId,
      stageId: params.stageId,
      stage: params.stage,
      workflow: params.workflow,
      allStageStates: params.allStageStates,
      userId: params.userId
    });

    if (!result.success) {
      throw new Error(result.error || 'Failed to start export job');
    }

    console.log('[startExportJob] Export job started successfully:', result.jobId);

    return {
      success: true,
      jobId: result.jobId
    };

  } catch (error) {
    console.error('[startExportJob] Failed to start export job:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to start export job'
    };
  }
}

/**
 * Get export job status - useful for polling or one-time checks
 */
export async function getExportJobStatus(jobId: string): Promise<{
  success: boolean;
  jobState?: any;
  error?: string;
}> {
  try {
    if (!jobId) {
      throw new Error('Job ID is required');
    }

    const jobState = await exportJobManager.getExportJobState(jobId);
    
    if (!jobState) {
      return {
        success: false,
        error: 'Export job not found'
      };
    }

    return {
      success: true,
      jobState
    };

  } catch (error) {
    console.error('[getExportJobStatus] Failed to get job status:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get export job status'
    };
  }
} 