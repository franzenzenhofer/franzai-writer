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
    console.log('🚨🚨🚨 [Export Stage Execution] FUNCTION CALLED - STARTING EXPORT GENERATION 🚨🚨🚨');
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
    
    // Step 5: Upload all export artifacts to Firebase Storage
    console.log('[Export Stage Execution] Uploading export artifacts to Firebase Storage');
    
    try {
      // Prepare exports in the format expected by uploadExportArtifacts
      const exportsToUpload: Record<string, { ready: boolean; content?: string; error?: string }> = {
        'html-styled': {
          ready: true,
          content: sanitizedHtmlStyled
        },
        'html-clean': {
          ready: true,
          content: sanitizedHtmlClean
        }
      };
      
      // Add markdown if available
      if (formats.markdown?.content) {
        exportsToUpload.markdown = {
          ready: true,
          content: formats.markdown.content
        };
      }
      
      // Add PDF if available
      if (formats.pdf?.content) {
        exportsToUpload.pdf = {
          ready: true,
          content: formats.pdf.content
        } as any;
      }
      
      // Add DOCX if available
      if (formats.docx?.content) {
        exportsToUpload.docx = {
          ready: true,
          content: formats.docx.content
        } as any;
      }
      
      const uploadResults = await uploadExportArtifacts(exportsToUpload, userId, documentId, stage.id);
      
      console.log('[Export Stage Execution] Storage upload successful');
      console.log('[Export Stage Execution] Returning result with storage URLs');
      
      // Return the expected ExportStageState output format with URLs instead of inline content
      const result = {
        htmlStyledUrl: uploadResults['html-styled']?.publicUrl,
        htmlCleanUrl: uploadResults['html-clean']?.publicUrl,
        markdownUrl: uploadResults.markdown?.publicUrl,
        formats: {
          ...formats,
          // Update formats with storage URLs
          'html-styled': uploadResults['html-styled'] ? {
            ...formats['html-styled'],
            ready: true,
            url: uploadResults['html-styled'].publicUrl,
            storageUrl: uploadResults['html-styled'].storageUrl,
            assetId: uploadResults['html-styled'].assetId,
            sizeBytes: uploadResults['html-styled'].sizeBytes
          } : formats['html-styled'],
          'html-clean': uploadResults['html-clean'] ? {
            ...formats['html-clean'],
            ready: true,
            url: uploadResults['html-clean'].publicUrl,
            storageUrl: uploadResults['html-clean'].storageUrl,
            assetId: uploadResults['html-clean'].assetId,
            sizeBytes: uploadResults['html-clean'].sizeBytes
          } : formats['html-clean'],
          markdown: uploadResults.markdown ? {
            ...formats.markdown,
            ready: true,
            url: uploadResults.markdown.publicUrl,
            storageUrl: uploadResults.markdown.storageUrl,
            assetId: uploadResults.markdown.assetId,
            sizeBytes: uploadResults.markdown.sizeBytes
          } : formats.markdown,
          pdf: uploadResults.pdf ? {
            ...formats.pdf,
            ready: true,
            url: uploadResults.pdf.publicUrl,
            storageUrl: uploadResults.pdf.storageUrl,
            assetId: uploadResults.pdf.assetId,
            sizeBytes: uploadResults.pdf.sizeBytes
          } : formats.pdf,
          docx: uploadResults.docx ? {
            ...formats.docx,
            ready: true,
            url: uploadResults.docx.publicUrl,
            storageUrl: uploadResults.docx.storageUrl,
            assetId: uploadResults.docx.assetId,
            sizeBytes: uploadResults.docx.sizeBytes
          } : formats.docx
        }
      };
      
      return result;
    } catch (storageError) {
      console.error('[Export Stage Execution] Storage upload failed:', storageError);
      // FAIL HARD - do not fall back to inline content
      const errorMessage = storageError instanceof Error ? storageError.message : String(storageError);
      throw new Error(`Storage upload failed: ${errorMessage}`);
    }
  } catch (error) {
    console.error('[Export Stage Execution] Error:', error);
    console.error('[Export Stage Execution] Error stack:', error instanceof Error ? error.stack : 'No stack');
    throw error;
  }
}