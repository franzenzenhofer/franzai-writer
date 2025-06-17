import { GoogleGenAI } from '@google/genai';
import { config } from 'dotenv';
import fs from 'fs/promises';

// Load environment variables
config({ path: '.env.local' });

const apiKey = process.env.GOOGLE_GENAI_API_KEY;
if (!apiKey) {
  throw new Error('GOOGLE_GENAI_API_KEY is not set');
}

const client = new GoogleGenAI(apiKey);

async function generateAndSaveImage() {
  try {
    console.log('🎨 Generating image...');
    
    const result = await client.models.generateImages({
      model: 'imagen-3.0-generate-002',
      prompt: 'A beautiful sunset over mountains',
      numberOfImages: 1,
      aspectRatio: '16:9'
    });
    
    if (!result.images || result.images.length === 0) {
      throw new Error('No images generated');
    }
    
    const image = result.images[0];
    console.log('✅ Image generated successfully');
    
    // Save as data URL
    const dataUrl = `data:image/png;base64,${image.image.imageBytes}`;
    
    // Save to file
    const fileName = `test-downloads/test-image-storage-${Date.now()}.png`;
    const buffer = Buffer.from(image.image.imageBytes, 'base64');
    await fs.writeFile(fileName, buffer);
    
    console.log('📁 Image saved to:', fileName);
    console.log('📏 Data URL length:', dataUrl.length);
    
    return { fileName, dataUrl };
  } catch (error) {
    console.error('❌ Failed:', error);
    throw error;
  }
}

generateAndSaveImage();