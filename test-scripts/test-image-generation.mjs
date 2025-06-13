#!/usr/bin/env node

/**
 * Test script for image generation
 * Tests native image generation with 2.0 Flash
 */

import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';

console.log('🚀 Testing Image Generation\n');

if (!process.env.GOOGLE_GENAI_API_KEY) {
  console.error('❌ Error: GOOGLE_GENAI_API_KEY not found');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY);

async function testBasicImageGeneration() {
  console.log('📝 Test 1: Basic Image Generation');
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: {
        responseModalities: ['TEXT', 'IMAGE']
      }
    });

    const result = await model.generateContent('Generate an image of a cute robot coding on a laptop');
    const response = await result.response;
    
    console.log('✅ Response text:', response.text());
    
    // Check for image in response
    const parts = response.candidates?.[0]?.content?.parts || [];
    const imagePart = parts.find(part => part.inlineData?.mimeType?.startsWith('image/'));
    
    if (imagePart) {
      console.log('✅ Image generated successfully');
      console.log('✅ Image MIME type:', imagePart.inlineData.mimeType);
      
      // Save image for verification
      const buffer = Buffer.from(imagePart.inlineData.data, 'base64');
      fs.writeFileSync('test-generated-image.png', buffer);
      console.log('✅ Image saved as test-generated-image.png');
    } else {
      console.log('❌ No image in response');
    }
    
    return !!imagePart;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

async function testImageWithOptions() {
  console.log('\n📝 Test 2: Image Generation with Options');
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: {
        responseModalities: ['TEXT', 'IMAGE'],
        imageOptions: {
          aspectRatio: '16:9',
          numberOfImages: 1
        }
      }
    });

    const result = await model.generateContent(
      'Create a beautiful landscape painting of mountains at sunset'
    );
    const response = await result.response;
    
    console.log('✅ Response generated');
    
    const parts = response.candidates?.[0]?.content?.parts || [];
    const hasImage = parts.some(part => part.inlineData?.mimeType?.startsWith('image/'));
    console.log('✅ Image included:', hasImage);
    
    return hasImage;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('Starting image generation tests...\n');
  
  const tests = [
    testBasicImageGeneration,
    testImageWithOptions
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    const result = await test();
    if (result) passed++;
    else failed++;
  }
  
  console.log('\n📊 Test Summary:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed!');
  }
  
  // Cleanup
  if (fs.existsSync('test-generated-image.png')) {
    fs.unlinkSync('test-generated-image.png');
    console.log('\n🧹 Cleaned up test images');
  }
}

runAllTests().catch(console.error);