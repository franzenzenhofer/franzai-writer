import { assetManager } from './asset-manager';
import type { ExportFormat } from '@/types';

type ExportFormatString = 'html-styled' | 'html-clean' | 'markdown' | 'pdf' | 'docx';

/**
 * Export Storage Service - Manages storage of large export artifacts in Firebase Storage
 * 
 * Follows the same pattern as image storage to avoid Firestore size limits.
 * Stores export files (HTML, PDF, DOCX, Markdown) in Firebase Storage and 
 * returns only lightweight metadata with URLs.
 */

export interface ExportStorageResult {
  format: ExportFormatString;
  assetId: string;
  storageUrl: string;
  publicUrl: string;
  sizeBytes: number;
}

/**
 * Upload a single export artifact to Firebase Storage
 */
export async function uploadExportArtifact(
  content: string | ArrayBuffer,
  format: ExportFormatString,
  userId: string,
  documentId: string,
  stageId: string
): Promise<ExportStorageResult> {
  try {
    console.log(`[EXPORT STORAGE] Uploading ${format} export for stage ${stageId}`);
    
    // Convert content to Blob
    let blob: Blob;
    let mimeType: string;
    let fileName: string;
    
    switch (format) {
      case 'html-styled':
      case 'html-clean':
        blob = new Blob([content as string], { type: 'text/html' });
        mimeType = 'text/html';
        fileName = `export-${format}.html`;
        break;
        
      case 'markdown':
        blob = new Blob([content as string], { type: 'text/markdown' });
        mimeType = 'text/markdown';
        fileName = 'export.md';
        break;
        
      case 'pdf':
        // PDF is base64 encoded, need to decode
        const pdfBuffer = Buffer.from(content as string, 'base64');
        blob = new Blob([pdfBuffer], { type: 'application/pdf' });
        mimeType = 'application/pdf';
        fileName = 'export.pdf';
        break;
        
      case 'docx':
        // DOCX is base64 encoded, need to decode
        const docxBuffer = Buffer.from(content as string, 'base64');
        blob = new Blob([docxBuffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
        mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        fileName = 'export.docx';
        break;
        
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
    
    // Create asset using Asset Manager
    const asset = await assetManager.createAsset({
      userId,
      file: blob,
      metadata: {
        fileName,
        mimeType,
        source: 'generated',
        documentId,
        stageId,
        generationPrompt: `Export artifact for format: ${format}`,
        generationModel: 'export-stage'
      }
    });
    
    console.log(`[EXPORT STORAGE] ✅ Export artifact uploaded successfully: ${asset.id}`);
    
    return {
      format,
      assetId: asset.id,
      storageUrl: asset.storageUrl,
      publicUrl: asset.publicUrl,
      sizeBytes: blob.size
    };
  } catch (error) {
    console.error(`[EXPORT STORAGE] ❌ Failed to upload export artifact:`, error);
    throw new Error(`Failed to upload export artifact: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Upload multiple export artifacts
 */
export async function uploadExportArtifacts(
  exports: Record<string, { ready: boolean; content?: string; error?: string }>,
  userId: string,
  documentId: string,
  stageId: string
): Promise<Record<ExportFormatString, ExportStorageResult>> {
  console.log(`[EXPORT STORAGE] Uploading ${Object.keys(exports).length} export artifacts for stage ${stageId}`);
  
  const results: Record<ExportFormatString, ExportStorageResult> = {} as any;
  
  // Upload all ready exports in parallel
  const uploadPromises = Object.entries(exports)
    .filter(([_, data]) => data.ready && data.content)
    .map(async ([format, data]) => {
      try {
        const result = await uploadExportArtifact(
          data.content!,
          format as ExportFormatString,
          userId,
          documentId,
          stageId
        );
        results[format as ExportFormatString] = result;
      } catch (error) {
        console.error(`[EXPORT STORAGE] Failed to upload ${format}:`, error);
        // Don't throw - let other formats upload
      }
    });
  
  await Promise.all(uploadPromises);
  
  console.log(`[EXPORT STORAGE] ✅ Successfully uploaded ${Object.keys(results).length} artifacts`);
  return results;
}

/**
 * Fetch export content from Storage URL
 * Used when reconstructing export state from persisted URLs
 */
export async function fetchExportContent(
  publicUrl: string,
  format: ExportFormatString
): Promise<string> {
  try {
    console.log(`[EXPORT STORAGE] Fetching ${format} content from: ${publicUrl}`);
    
    const response = await fetch(publicUrl);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    // For binary formats (PDF, DOCX), return as base64
    if (format === 'pdf' || format === 'docx') {
      const buffer = await response.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      return base64;
    }
    
    // For text formats, return as string
    const text = await response.text();
    return text;
  } catch (error) {
    console.error(`[EXPORT STORAGE] ❌ Failed to fetch export content:`, error);
    throw new Error(`Failed to fetch export content: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}