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
    console.log('[Export Stage Execution] Stage config:', stage);
    console.log('[Export Stage Execution] All stage states:', Object.keys(allStageStates));
    
    // Report initial progress
    if (progressCallback) {
      progressCallback({ styledHtml: 10, currentFormat: 'Preparing export...' });
    }
    
    // Step 1: Generate HTML with dual AI passes
    const htmlResult = await generateExportHtml({
      stages: workflow.stages,
      stageStates: allStageStates,
      exportConfig: stage.exportConfig,
      workflow: workflow,
      progressCallback: (progress) => {
        console.log('[Export Stage Execution] HTML generation progress:', progress);
        if (progressCallback) {
          progressCallback(progress);
        }
      },
    });
    
    if (htmlResult.error) {
      console.error('[Export Stage Execution] HTML generation error:', htmlResult.error);
      throw new Error(htmlResult.error);
    }
    
    console.log('[Export Stage Execution] HTML generation complete');
    console.log('[Export Stage Execution] HTML styled length:', htmlResult.htmlStyled?.length);
    console.log('[Export Stage Execution] HTML clean length:', htmlResult.htmlClean?.length);
    
    // Report HTML complete
    if (progressCallback) {
      progressCallback({ styledHtml: 50, cleanHtml: 50, currentFormat: 'Processing formats...' });
    }
    
    // Step 2: Process all export formats
    console.log('[Export Stage Execution] Processing export formats');
    
    const formats = await processExportFormats(
      htmlResult.htmlStyled,
      htmlResult.htmlClean,
      stage.exportConfig
    );
    
    console.log('[Export Stage Execution] Format processing complete');
    console.log('[Export Stage Execution] Available formats:', Object.keys(formats));
    
    // Report completion
    if (progressCallback) {
      progressCallback({ styledHtml: 100, cleanHtml: 100, currentFormat: 'Export complete!' });
    }
    
    // Return the complete export output
    const result = {
      htmlStyled: htmlResult.htmlStyled,
      htmlClean: htmlResult.htmlClean,
      markdown: formats.markdown?.content,
      formats,
    };
    
    console.log('[Export Stage Execution] Returning result with formats:', Object.keys(result.formats || {}));
    
    return result;
  } catch (error) {
    console.error('[Export Stage Execution] Error:', error);
    console.error('[Export Stage Execution] Error stack:', error instanceof Error ? error.stack : 'No stack');
    throw error;
  }
}