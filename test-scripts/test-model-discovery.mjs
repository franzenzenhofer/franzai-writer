#!/usr/bin/env node

/**
 * Quick test to discover available models and methods
 */

import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';

const genAI = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY });

console.log('🔍 Discovering Google GenAI capabilities...\n');

// Check what methods are available on genAI
console.log('Available genAI methods:');
console.log(Object.getOwnPropertyNames(genAI));
console.log('');

// Check what's on genAI.models
console.log('Available genAI.models methods:');
console.log(Object.getOwnPropertyNames(genAI.models));
console.log('');

// Test direct image generation with Imagen
console.log('Testing Imagen 3 directly...');
try {
  const testPrompt = 'A beautiful sunset over mountains';
  console.log(`Prompt: "${testPrompt}"`);
  
  // Try the exact pattern from the working test
  const response = await genAI.models.generateImages({
    model: 'imagen-3.0-generate-002',
    prompt: testPrompt,
    config: {
      numberOfImages: 1,
      aspectRatio: '1:1'
    }
  });
  
  console.log('✅ Success! Response structure:');
  console.log('Response keys:', Object.keys(response));
  console.log('Number of images:', response.generatedImages?.length || 0);
  
  if (response.generatedImages && response.generatedImages.length > 0) {
    console.log('First image structure:', Object.keys(response.generatedImages[0]));
  }
  
} catch (error) {
  console.error('❌ Error:', error.message);
  console.error('Error code:', error.code);
  console.error('Full error:', JSON.stringify(error, null, 2));
}

// Also test if we can list models differently
console.log('\n\nTrying to list models...');
try {
  const listResult = await genAI.models.list();
  console.log('List result type:', typeof listResult);
  console.log('List result:', listResult);
} catch (error) {
  console.error('List error:', error.message);
}