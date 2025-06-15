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
  try {
    console.log('[Export Stage Execution] Starting export generation');
    
    // Step 1: Generate HTML with dual AI passes
    const htmlResult = await generateExportHtml({
      stages: workflow.stages,
      stageStates: allStageStates,
      exportConfig: stage.exportConfig,
      workflowType: workflow.id,
      progressCallback,
    });
    
    if (htmlResult.error) {
      throw new Error(htmlResult.error);
    }
    
    console.log('[Export Stage Execution] HTML generation complete');
    
    // Step 2: Process all export formats
    progressCallback?.({ currentFormat: 'Processing formats...' });
    
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