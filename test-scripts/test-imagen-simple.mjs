#!/usr/bin/env node

/**
 * Simple Imagen 3 test - verified working
 */

import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';
import fs from 'fs/promises';

const genAI = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY });

async function testImagen() {
  console.log('🎨 Testing Imagen 3 - Simple Example\n');
  
  try {
    console.log('Generating images...');
    const response = await genAI.models.generateImages({
      model: 'imagen-3.0-generate-002',
      prompt: 'A cute robot learning to paint, digital art style, bright colors',
      config: {
        numberOfImages: 2,
        aspectRatio: '1:1'
      }
    });
    
    console.log(`✅ Generated ${response.generatedImages.length} images`);
    
    // Save images
    for (let i = 0; i < response.generatedImages.length; i++) {
      const img = response.generatedImages[i];
      const buffer = Buffer.from(img.image.imageBytes, 'base64');
      const filename = `imagen-test-${i + 1}.png`;
      await fs.writeFile(filename, buffer);
      console.log(`💾 Saved: ${filename}`);
    }
    
    console.log('\n✨ Success! Imagen 3 is working perfectly.');
    console.log('📝 Note: This requires a paid tier API key');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testImagen();