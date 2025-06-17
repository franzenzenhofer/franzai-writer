#!/usr/bin/env node

import 'dotenv/config';
import { generateImages } from '../src/lib/ai-image-generator.ts';

async function testQuickImage() {
  console.log('🎨 Testing quick image generation...\n');
  
  try {
    const result = await generateImages({
      prompt: 'A beautiful sunset over mountains',
      settings: {
        provider: 'imagen',
        aspectRatio: '16:9',
        numberOfImages: 1
      }
    });
    
    console.log('✅ Success!');
    console.log('Result:', {
      provider: result.provider,
      imageCount: result.images.length,
      hasDataUrl: !!result.images[0]?.dataUrl,
      aspectRatio: result.images[0]?.aspectRatio
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testQuickImage();