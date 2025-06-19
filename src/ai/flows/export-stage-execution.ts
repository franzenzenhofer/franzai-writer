'use server';

import type { Stage, StageState, ExportStageState, Workflow } from '@/types';
import { generateExportHtml } from '@/lib/export/ai-html-generator';
import { processExportFormats } from '@/lib/export/format-converters';

export interface ExportStageExecutionParams {
  stage: Stage;
  workflow: Workflow;
  allStageStates: Record<string, StageState>;
  progressCallback?: (progress: any) => void;
}

export async function executeExportStage({
  stage,
  workflow,
  allStageStates,
  progressCallback,
}: ExportStageExecutionParams): Promise<ExportStageState['output']> {
  console.warn('[executeExportStage] DEPRECATED: This client-side export execution is deprecated. The export process has been moved to a server-side background job. See /api/export/start and the runExportJob system. This function may be removed in a future version.');
  try {
    console.log('[Export Stage Execution] Starting export generation (DEPRECATED FLOW)');
    
    // Step 1: Generate HTML with dual AI passes
    const htmlResult = await generateExportHtml({
      stages: workflow.stages,
      stageStates: allStageStates,
      exportConfig: stage.exportConfig,
      workflowType: workflow.id,
    });
    
    if (htmlResult.error) {
      throw new Error(htmlResult.error);
    }
    
    console.log('[Export Stage Execution] HTML generation complete');
    
    // Step 2: Process all export formats
    console.log('[Export Stage Execution] Processing export formats');
    
    const formats = await processExportFormats(
      htmlResult.htmlStyled,
      htmlResult.htmlClean,
      stage.exportConfig
    );
    
    console.log('[Export Stage Execution] Format processing complete');
    
    // Return the complete export output
    return {
      htmlStyled: htmlResult.htmlStyled,
      htmlClean: htmlResult.htmlClean,
      markdown: formats.markdown?.content,
      formats,
    };
  } catch (error) {
    console.error('[Export Stage Execution] Error:', error);
    throw error;
  }
}