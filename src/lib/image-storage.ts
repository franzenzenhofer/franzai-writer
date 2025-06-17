import { assetManager } from './asset-manager';
import type { Asset } from '@/types';

/**
 * Converts a base64 data URL to a Blob for uploading
 */
export function dataURLtoBlob(dataUrl: string): Blob {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)![1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  
  return new Blob([u8arr], { type: mime });
}

/**
 * Uploads generated image data URL using Asset Manager and returns asset info
 * 
 * @param dataUrl Base64 data URL from image generation
 * @param userId User ID for storage path organization
 * @param documentId Document ID for storage path organization  
 * @param stageId Stage ID for storage path organization
 * @param imageIndex Index for multiple images (0, 1, 2...)
 * @param generationPrompt Prompt used to generate the image
 * @param generationModel Model used to generate the image
 * @param customFilenames Optional array of AI-generated SEO-optimized filenames
 * @returns Object with asset ID, storage path and public URL
 */
export async function uploadGeneratedImage(
  dataUrl: string,
  userId: string,
  documentId: string,
  stageId: string,
  imageIndex: number = 0,
  generationPrompt?: string,
  generationModel?: string,
  customFilenames?: string[]
): Promise<{ assetId: string; storageUrl: string; publicUrl: string }> {
  try {
    console.log(`[IMAGE STORAGE] Creating asset for image ${imageIndex} in stage ${stageId}`);
    
    // Convert data URL to blob
    const blob = dataURLtoBlob(dataUrl);
    
    // Generate SEO-optimized filename
    let fileName: string;
    if (customFilenames && customFilenames[imageIndex]) {
      // Use AI-generated filename with UUID for uniqueness
      const baseFilename = customFilenames[imageIndex];
      const uuid = Math.random().toString(36).substr(2, 8); // 8-character UUID
      fileName = `${baseFilename}-${uuid}.png`;
    } else {
      // Fallback to original naming
      fileName = `generated-${Date.now()}-${imageIndex}.png`;
    }
    
    console.log(`[IMAGE STORAGE] Using SEO-optimized filename: ${fileName}`);
    
    // Create asset record using Asset Manager
    const asset = await assetManager.createAsset({
      userId,
      file: blob,
      metadata: {
        fileName,
        mimeType: 'image/png',
        source: 'generated',
        generationPrompt,
        generationModel,
        documentId,
        stageId
      }
    });
    
    console.log(`[IMAGE STORAGE] ✅ Asset created successfully: ${asset.id}`);
    console.log(`[IMAGE STORAGE] ✅ Public URL: ${asset.publicUrl}`);
    
    return {
      assetId: asset.id,
      storageUrl: asset.storageUrl,
      publicUrl: asset.publicUrl
    };
  } catch (error) {
    console.error(`[IMAGE STORAGE] ❌ Failed to create asset:`, error);
    throw new Error(`Failed to create asset: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Uploads multiple generated images using Asset Manager
 */
export async function uploadGeneratedImages(
  dataUrls: string[],
  userId: string,
  documentId: string,
  stageId: string,
  generationPrompt?: string,
  generationModel?: string,
  customFilenames?: string[]
): Promise<Array<{ assetId: string; storageUrl: string; publicUrl: string }>> {
  console.log(`[IMAGE STORAGE] Creating ${dataUrls.length} assets for stage ${stageId}`);
  
  if (customFilenames) {
    console.log(`[IMAGE STORAGE] Using custom SEO-optimized filenames:`, customFilenames);
  }
  
  const uploadPromises = dataUrls.map((dataUrl, index) =>
    uploadGeneratedImage(dataUrl, userId, documentId, stageId, index, generationPrompt, generationModel, customFilenames)
  );
  
  const results = await Promise.all(uploadPromises);
  
  console.log(`[IMAGE STORAGE] ✅ All ${results.length} assets created successfully`);
  return results;
}