'use server';
import 'server-only';

import { GoogleGenAI } from '@google/genai';
import type { ImageGenerationSettings, ImageOutputData } from '@/types';
import { logAI } from '@/lib/ai-logger';

// Initialize Google Generative AI client
let genAI: GoogleGenAI | null = null;

function initializeGenAI() {
  if (!genAI) {
    const apiKey = process.env.GOOGLE_GENAI_API_KEY;
    if (!apiKey) {
      throw new Error('GOOGLE_GENAI_API_KEY not found in environment variables');
    }
    genAI = new GoogleGenAI({ apiKey });
  }
  return genAI;
}

export interface ImageGenerationRequest {
  prompt: string;
  settings?: ImageGenerationSettings;
  userId?: string;
  documentId?: string;
  stageId?: string;
}

export async function generateImages(request: ImageGenerationRequest): Promise<ImageOutputData> {
  const client = initializeGenAI();
  
  logAI('🎨 [Image Generation] Starting generation', {
    provider: request.settings?.provider || 'imagen',
    aspectRatio: request.settings?.aspectRatio || '1:1',
    numberOfImages: request.settings?.numberOfImages || 4,
    promptLength: request.prompt.length
  });

  const provider = request.settings?.provider || 'imagen';
  
  if (provider === 'imagen') {
    return await generateWithImagen(client, request);
  } else {
    // Gemini image generation is not available in many regions
    // We'll default to Imagen even if Gemini is requested
    logAI('⚠️ [Image Generation] Gemini requested but using Imagen due to regional restrictions');
    return await generateWithImagen(client, request);
  }
}

async function generateWithImagen(client: GoogleGenAI, request: ImageGenerationRequest): Promise<ImageOutputData> {
  try {
    const settings = request.settings || {};
    const aspectRatio = settings.aspectRatio || '1:1';
    const numberOfImages = settings.numberOfImages || 4;
    
    logAI('🖼️ [Imagen] Generating images', {
      model: 'imagen-3.0-generate-002',
      aspectRatio,
      numberOfImages,
      prompt: request.prompt.substring(0, 100) + '...'
    });

    const startTime = Date.now();
    
    // Generate images using Imagen 3
    const result = await client.models.generateImages({
      model: 'models/imagen-3.0-generate-002', // Full model name with 'models/' prefix
      prompt: request.prompt,
      config: {
        numberOfImages,
        aspectRatio,
        personGeneration: settings.imagen?.personGeneration || 'allow_adult',
        ...(settings.negativePrompt && { negativePrompt: settings.negativePrompt })
      }
    });

    const genTime = Date.now() - startTime;
    logAI('✅ [Imagen] Generation completed', {
      generationTime: `${genTime}ms`,
      imagesReturned: result.generatedImages?.length || 0
    });

    // Convert Imagen response to our format
    const images: ImageOutputData['images'] = [];
    
    if (result.generatedImages && result.generatedImages.length > 0) {
      for (let i = 0; i < result.generatedImages.length; i++) {
        const imagenImage = result.generatedImages[i];
        if (imagenImage.image?.imageBytes) {
          images.push({
            dataUrl: `data:image/png;base64,${imagenImage.image.imageBytes}`,
            promptUsed: request.prompt,
            mimeType: 'image/png',
            aspectRatio,
            // Storage URLs will be added after upload
          });
        }
      }
    }

    logAI('📦 [Imagen] Returning image data', {
      imageCount: images.length,
      firstImageSize: images[0]?.dataUrl?.length || 0
    });

    return {
      provider: 'imagen',
      images,
      selectedImageIndex: 0
    };
    
  } catch (error: any) {
    logAI('❌ [Imagen] Generation failed', {
      error: error.message,
      code: error.code,
      details: error.details
    });
    
    throw new Error(`Image generation failed: ${error.message}`);
  }
}

// Note: Gemini image generation implementation would go here
// but is not included due to regional restrictions
async function generateWithGemini(client: GoogleGenAI, request: ImageGenerationRequest): Promise<ImageOutputData> {
  throw new Error('Gemini image generation is not available in your region. Please use Imagen instead.');
}