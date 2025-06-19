// src/lib/export/jobs/runExportJob.ts
import { firestoreAdapter } from '@/lib/firestore-adapter';
import type { WizardDocument, Stage, StageState, Workflow, ExportConfig, ExportStageState } from '@/types';
// Assuming HtmlGenerationResult will be exported from ai-html-generator
import { generateExportHtml, type HtmlGenerationResult } from '@/lib/export/ai-html-generator';
// Assuming ProcessedFormats will be exported from format-converters
import { processExportFormats, type ProcessedFormats } from '@/lib/export/format-converters';
import { ExportJobService } from './ExportJobService'; // New service

interface RunExportJobParams {
  jobId: string;
  documentId: string;
  stageId: string; // The ID of the export stage itself
}

interface ValidatedExportData {
  workflow: Workflow;
  allStageStates: Record<string, StageState>;
  exportStage: Stage; // This stage will have its exportConfig validated
}

async function fetchAndValidateExportData(documentId: string, stageId: string): Promise<ValidatedExportData> {
  console.log(`[fetchAndValidateExportData ${documentId}-${stageId}] Fetching document...`);
  const docData = await firestoreAdapter.getDocument('documents', documentId);
  if (!docData) {
    throw new Error(`Document ${documentId} not found.`);
  }
  console.log(`[fetchAndValidateExportData ${documentId}-${stageId}] Document fetched.`);

  const workflow = docData.workflow as Workflow; // Assuming workflow is embedded
  const allStageStates = docData.stageStates as Record<string, StageState>; // Assuming states are embedded

  if (!workflow || !workflow.stages || typeof workflow.stages.find !== 'function') {
    console.error(`[fetchAndValidateExportData ${documentId}-${stageId}] Invalid workflow data:`, workflow);
    throw new Error(`Workflow data is missing, invalid, or stages are not iterable for document ${documentId}.`);
  }
  if (!allStageStates || typeof allStageStates !== 'object' || Object.keys(allStageStates).length === 0) {
    console.error(`[fetchAndValidateExportData ${documentId}-${stageId}] Invalid stageStates data:`, allStageStates);
    throw new Error(`StageStates are missing or invalid for document ${documentId}.`);
  }

  const exportStage = workflow.stages.find(s => s.id === stageId);
  if (!exportStage) {
    throw new Error(`Export stage definition ${stageId} not found in workflow ${workflow.id}.`);
  }
  if (exportStage.stageType !== 'export') {
    throw new Error(`Stage ${stageId} is not of type 'export' in workflow ${workflow.id}.`);
  }
  if (!exportStage.exportConfig) {
    throw new Error(`Export stage ${stageId} is missing 'exportConfig'.`);
  }
  console.log(`[fetchAndValidateExportData ${documentId}-${stageId}] Document, workflow, and stage states loaded. Export stage validated.`);
  return { workflow, allStageStates, exportStage };
}

async function generateHtmlForExportStep(
  data: ValidatedExportData,
  jobId: string // For logging
): Promise<HtmlGenerationResult> {
  console.log(`[generateHtmlForExportStep ${jobId}] Starting HTML generation.`);
  if (!data.exportStage.exportConfig) { // Type guard, though validated earlier
      throw new Error("Export config missing in generateHtmlForExportStep, this should not happen.");
  }
  const htmlResult = await generateExportHtml({
    stages: data.workflow.stages,
    stageStates: data.allStageStates,
    exportConfig: data.exportStage.exportConfig,
    workflowType: data.workflow.id,
  });
  if (htmlResult.error) {
    throw new Error(`HTML generation failed: ${htmlResult.error}`);
  }
  console.log(`[generateHtmlForExportStep ${jobId}] HTML generation complete. Styled: ${htmlResult.htmlStyled?.length}, Clean: ${htmlResult.htmlClean?.length}`);
  return htmlResult;
}

async function processFormatsForExportStep(
  htmlStyled: string | undefined,
  htmlClean: string | undefined,
  exportConfig: ExportConfig, // exportConfig is guaranteed by ValidatedExportData
  jobId: string // For logging
): Promise<ProcessedFormats> {
  console.log(`[processFormatsForExportStep ${jobId}] Processing export formats.`);
  const validHtmlStyled = htmlStyled || ''; // Ensure strings, even if empty
  const validHtmlClean = htmlClean || '';
  const processedFormats = await processExportFormats(validHtmlStyled, validHtmlClean, exportConfig);
  console.log(`[processFormatsForExportStep ${jobId}] Format processing complete. Processed formats:`, Object.keys(processedFormats));
  return processedFormats;
}

export async function runExportJob({ jobId, documentId, stageId }: RunExportJobParams): Promise<void> {
  console.log(`[runExportJob ${jobId}] Starting job for document ${documentId}, stage ${stageId}`);
  let currentProgress = 0; // To keep track of progress for error reporting

  try {
    // 1. Set job to 'running' and initial progress
    await ExportJobService.startJob(documentId, jobId);
    currentProgress = 5;

    // 2. Fetch and validate data
    const validatedData = await fetchAndValidateExportData(documentId, stageId);
    await ExportJobService.updateProgress(documentId, jobId, 10);
    currentProgress = 10;

    // 3. Generate HTML
    const { htmlStyled, htmlClean } = await generateHtmlForExportStep(validatedData, jobId);
    await ExportJobService.updateProgress(documentId, jobId, 50);
    currentProgress = 50;

    // 4. Process export formats
    // exportConfig is validated to exist in fetchAndValidateExportData
    const exportConfig = validatedData.exportStage.exportConfig!;
    const processedFormats = await processFormatsForExportStep(htmlStyled, htmlClean, exportConfig, jobId);
    await ExportJobService.updateProgress(documentId, jobId, 90);
    currentProgress = 90;

    // 5. Store result and mark as completed
    const finalOutput: ExportStageState['output'] = {
      htmlStyled: htmlStyled, // htmlStyled and htmlClean can be undefined if generation returned them as such
      htmlClean: htmlClean,
      markdown: processedFormats.markdown?.content, // Access content safely
      formats: processedFormats,
      // publishing data would be added by a separate publishing step if needed
    };

    await ExportJobService.completeJob(documentId, jobId, finalOutput);
    console.log(`[runExportJob ${jobId}] Job completed successfully.`);

  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error during export job execution.";
    console.error(`[runExportJob ${jobId}] Error processing job:`, message, (error instanceof Error ? error.stack : 'No stack trace available'));

    // Attempt to update Firestore with the error status using the last known progress
    try {
      await ExportJobService.failJob(documentId, jobId, message, currentProgress);
    } catch (serviceError) {
      // Log a critical failure if we can't even update the job to an error state
      console.error(`[runExportJob ${jobId}] CRITICAL: Failed to update job status to 'error' after a processing error. Job may appear stuck. Service error:`, serviceError);
    }
    // For a background job, we typically don't re-throw as there might be no higher-level catcher,
    // but this depends on the invocation context (e.g., Cloud Function error handling).
    // Ensuring the job is marked as 'error' in Firestore is the primary goal here.
  }
}
