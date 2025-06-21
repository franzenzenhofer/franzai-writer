'use server';

import type { Stage, StageState, ExportStageState, Workflow } from '@/types';
import { generateExportHtml } from '@/lib/export/ai-html-generator';
import { processExportFormats } from '@/lib/export/format-converters';
import { validateContent, sanitizeHtml } from '@/lib/content-moderation';
import { uploadExportArtifacts } from '@/lib/export-storage';

export interface ExportStageExecutionParams {
  stage: Stage;
  workflow: Workflow;
  allStageStates: Record<string, StageState>;
  documentId: string;
  userId: string;
  progressCallback?: (progress: any) => void;
}

export async function executeExportStage({
  stage,
  workflow,
  allStageStates,
  documentId,
  userId,
  progressCallback,
}: ExportStageExecutionParams): Promise<ExportStageState['output']> {
  try {
    console.log('[Export Stage Execution] Starting export generation');
    console.log('[Export Stage Execution] Stage config:', stage);
    console.log('[Export Stage Execution] All stage states:', Object.keys(allStageStates));
    
    // Report initial progress
    if (progressCallback) {
      progressCallback({ styledHtml: 5, currentFormat: 'Validating content...' });
    }
    
    // Step 1: Content Moderation - Only validate non-HTML content (poem text, not generated HTML)
    const stageStatesToValidate = Object.entries(allStageStates)
      .filter(([stageId, state]) => {
        // Find the stage definition
        const stageDef = workflow.stages.find(s => s.id === stageId);
        // Only validate stages that produce text content, NOT HTML or export stages
        return stageDef && 
               stageDef.outputType === 'text' && 
               stageDef.stageType !== 'export' &&
               !stageId.includes('html') &&
               state.output && 
               typeof state.output === 'string';
      })
      .map(([_, state]) => state.output);
    
    if (stageStatesToValidate.length > 0) {
      const contentToValidate = stageStatesToValidate.join('\n');
      const validation = await validateContent(contentToValidate);
      if (!validation.passed) {
        console.error('[Export Stage Execution] Content validation failed:', validation.violations);
        throw new Error(`Content validation failed: ${validation.violations.join(', ')}`);
      }
    }
    
    if (progressCallback) {
      progressCallback({ styledHtml: 10, currentFormat: 'Generating HTML...' });
    }
    
    // Step 2: Generate HTML with dual AI passes
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
    
    // Step 3: Sanitize HTML output for security
    const sanitizedHtmlStyled = sanitizeHtml(htmlResult.htmlStyled);
    const sanitizedHtmlClean = sanitizeHtml(htmlResult.htmlClean);
    
    // Step 4: Process all export formats
    console.log('[Export Stage Execution] Processing export formats');
    
    const formats = await processExportFormats(
      sanitizedHtmlStyled,
      sanitizedHtmlClean,
      {
        ...stage.exportConfig,
        contextVars: allStageStates
      }
    );
    
    console.log('[Export Stage Execution] Format processing complete');
    console.log('[Export Stage Execution] Available formats:', Object.keys(formats));
    
    // Report completion
    if (progressCallback) {
      progressCallback({ styledHtml: 100, cleanHtml: 100, currentFormat: 'Uploading to storage...' });
    }
    
    // Upload all export artifacts to Firebase Storage
    console.log('[Export Stage Execution] Uploading artifacts to Firebase Storage');
    const storageResults = await uploadExportArtifacts(
      formats,
      userId,
      documentId,
      stage.id
    );
    
    // Update formats with storage URLs
    const formatsWithUrls: any = {};
    for (const [format, data] of Object.entries(formats)) {
      const storageResult = storageResults[format as keyof typeof storageResults];
      if (storageResult) {
        formatsWithUrls[format] = {
          ready: data.ready,
          url: storageResult.publicUrl,
          storageUrl: storageResult.storageUrl,
          assetId: storageResult.assetId,
          sizeBytes: storageResult.sizeBytes,
          error: data.error
        };
      } else {
        formatsWithUrls[format] = data;
      }
    }
    
    // Return the complete export output with storage URLs
    const result = {
      htmlStyled: undefined, // Don't store inline - fetch from URL
      htmlClean: undefined, // Don't store inline - fetch from URL
      markdown: undefined, // Don't store inline - fetch from URL
      htmlStyledUrl: storageResults['html-styled']?.publicUrl,
      htmlCleanUrl: storageResults['html-clean']?.publicUrl,
      markdownUrl: storageResults['markdown']?.publicUrl,
      formats: formatsWithUrls,
    };
    
    console.log('[Export Stage Execution] Returning result with storage URLs');
    
    return result;
  } catch (error) {
    console.error('[Export Stage Execution] Error:', error);
    console.error('[Export Stage Execution] Error stack:', error instanceof Error ? error.stack : 'No stack');
    throw error;
  }
}