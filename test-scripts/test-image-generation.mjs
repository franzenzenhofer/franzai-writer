#!/usr/bin/env node

/**
 * Test script for Gemini and Imagen image generation
 * Tests Gemini 2.0 Flash Preview Image Generation and Imagen 3
 * Milestone 1: API Verification
 */

import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Testing Image Generation APIs - Milestone 1\n');

if (!process.env.GOOGLE_GENAI_API_KEY) {
  console.error('❌ Error: GOOGLE_GENAI_API_KEY not found');
  console.log('Please set: export GOOGLE_GENAI_API_KEY="your-key"');
  process.exit(1);
}

const genAI = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY });

// Test configurations
const MODELS = {
  gemini: 'gemini-2.0-flash-exp', // Try experimental model
  geminiAlt: 'gemini-2.0-flash', // Alternative
  imagen: 'imagen-3.0-generate-002'
};

// All supported aspect ratios
const ASPECT_RATIOS = ['1:1', '16:9', '9:16', '4:3', '3:4'];

// Test cases
const TEST_PROMPTS = [
  { id: 'landscape', prompt: 'A serene mountain landscape at sunset with a lake', style: 'photorealistic' },
  { id: 'robot', prompt: 'A friendly robot assistant holding a tablet, digital art', style: 'digital art' },
  { id: 'abstract', prompt: 'Abstract representation of AI with flowing data streams', style: 'abstract' },
  { id: 'interior', prompt: 'Cozy coffee shop interior with warm lighting', style: 'photorealistic' },
  { id: 'nature', prompt: 'Majestic waterfall in tropical rainforest', style: 'photorealistic' }
];

// Helper to create output directory
async function ensureOutputDir() {
  const outputDir = path.join(__dirname, '..', 'test-downloads');
  await fs.mkdir(outputDir, { recursive: true });
  return outputDir;
}

// Save image helper
async function saveImage(imageData, mimeType, filename) {
  const outputDir = await ensureOutputDir();
  const ext = mimeType.split('/')[1] || 'png';
  const filePath = path.join(outputDir, `${filename}.${ext}`);
  const buffer = Buffer.from(imageData, 'base64');
  await fs.writeFile(filePath, buffer);
  return filePath;
}

// Test Gemini 2.0 Flash Preview Image Generation
async function testGeminiImageGeneration() {
  console.log('🎨 Testing Gemini 2.0 Flash Preview Image Generation\n');
  const results = [];

  for (let i = 0; i < TEST_PROMPTS.length && i < ASPECT_RATIOS.length; i++) {
    const testCase = TEST_PROMPTS[i];
    const aspectRatio = ASPECT_RATIOS[i];
    
    console.log(`📸 Test ${i + 1}: ${testCase.id}`);
    console.log(`   Prompt: "${testCase.prompt}"`);
    console.log(`   Aspect Ratio: ${aspectRatio}`);
    
    try {
      const startTime = Date.now();
      const result = await genAI.models.generateContent({
        model: MODELS.geminiAlt, // Use regular gemini-2.0-flash
        contents: `Create a ${testCase.style} image: ${testCase.prompt}. Aspect ratio: ${aspectRatio}`,
        generationConfig: {
          responseModalities: ['TEXT', 'IMAGE'] // Use string instead of Modality enum
        }
      });
      
      const genTime = Date.now() - startTime;
      console.log(`   Generation time: ${genTime}ms`);
      
      // Get text response
      const text = result.text || '';
      if (text) {
        console.log(`   Text response: "${text.substring(0, 50)}..."`);
      }
      
      // Check for images in the response
      const candidates = result.candidates || [];
      let imageCount = 0;
      
      // Extract parts from candidates
      const parts = candidates[0]?.content?.parts || [];
      
      for (const part of parts) {
        if (part.inlineData) {
          imageCount++;
          const filename = `gemini-${testCase.id}-${aspectRatio.replace(':', 'x')}`;
          const filePath = await saveImage(part.inlineData.data, part.inlineData.mimeType, filename);
          console.log(`   ✅ Image saved: ${path.basename(filePath)}`);
          
          results.push({
            model: 'gemini',
            testCase: testCase.id,
            aspectRatio,
            success: true,
            genTime,
            filePath
          });
        }
      }
      
      if (imageCount === 0) {
        console.log('   ⚠️  No images in response');
        results.push({ model: 'gemini', testCase: testCase.id, success: false });
      }
      
    } catch (error) {
      console.error(`   ❌ Error: ${error.message}`);
      results.push({
        model: 'gemini',
        testCase: testCase.id,
        aspectRatio,
        success: false,
        error: error.message
      });
    }
    console.log('');
  }
  
  return results;
}

// Test Imagen 3 (Note: requires paid tier)
async function testImagenGeneration() {
  console.log('🎨 Testing Imagen 3 Generation\n');
  console.log('📝 Note: Imagen 3 requires a paid tier API key\n');
  const results = [];

  // Test just 2 cases for Imagen
  for (let i = 0; i < 2 && i < TEST_PROMPTS.length; i++) {
    const testCase = TEST_PROMPTS[i];
    const aspectRatio = ASPECT_RATIOS[i];
    
    console.log(`📸 Test ${i + 1}: ${testCase.id}`);
    console.log(`   Prompt: "${testCase.prompt}"`);
    console.log(`   Aspect Ratio: ${aspectRatio}`);
    console.log(`   Number of images: 2`);
    
    try {
      const startTime = Date.now();
      
      // Imagen uses a different API structure
      const response = await genAI.models.generateImages({
        model: MODELS.imagen,
        prompt: testCase.prompt,
        config: {
          numberOfImages: 2,
          aspectRatio: aspectRatio
        }
      });
      
      const genTime = Date.now() - startTime;
      console.log(`   Generation time: ${genTime}ms`);
      
      // Process images
      if (response.generatedImages) {
        for (let j = 0; j < response.generatedImages.length; j++) {
          const img = response.generatedImages[j];
          const filename = `imagen-${testCase.id}-${aspectRatio.replace(':', 'x')}-${j + 1}`;
          const filePath = await saveImage(img.image.imageBytes, 'image/png', filename);
          console.log(`   ✅ Image ${j + 1} saved: ${path.basename(filePath)}`);
        }
        
        results.push({
          model: 'imagen',
          testCase: testCase.id,
          aspectRatio,
          success: true,
          genTime,
          imageCount: response.generatedImages.length
        });
      }
      
    } catch (error) {
      console.error(`   ❌ Error: ${error.message}`);
      if (error.message.includes('paid')) {
        console.log('   ℹ️  This is expected for free tier API keys');
      }
      results.push({
        model: 'imagen',
        testCase: testCase.id,
        aspectRatio,
        success: false,
        error: error.message
      });
    }
    console.log('');
  }
  
  return results;
}

// Test error handling
async function testErrorHandling() {
  console.log('🧪 Testing Error Handling\n');
  const errorTests = [];

  // Test 1: Empty prompt
  console.log('📝 Test: Empty prompt');
  try {
    await genAI.models.generateContent({
      model: MODELS.geminiAlt,
      contents: '',
      generationConfig: {
        responseModalities: ['TEXT', 'IMAGE']
      }
    });
    console.log('   ⚠️  Should have failed but succeeded');
    errorTests.push({ test: 'empty-prompt', passed: false });
  } catch (error) {
    console.log(`   ✅ Expected error: ${error.message}`);
    errorTests.push({ test: 'empty-prompt', passed: true });
  }

  // Test 2: Invalid model
  console.log('\n📝 Test: Invalid model');
  try {
    await genAI.models.generateContent({
      model: 'invalid-model-xyz',
      contents: 'test image',
      generationConfig: {
        responseModalities: ['TEXT', 'IMAGE']
      }
    });
    console.log('   ⚠️  Should have failed but succeeded');
    errorTests.push({ test: 'invalid-model', passed: false });
  } catch (error) {
    console.log(`   ✅ Expected error: ${error.message}`);
    errorTests.push({ test: 'invalid-model', passed: true });
  }

  return errorTests;
}

// Generate summary report
async function generateReport(geminiResults, imagenResults, errorTests) {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      gemini: {
        total: geminiResults.length,
        successful: geminiResults.filter(r => r.success).length,
        avgGenTime: Math.round(
          geminiResults
            .filter(r => r.success && r.genTime)
            .reduce((sum, r) => sum + r.genTime, 0) / 
          geminiResults.filter(r => r.success).length || 1
        )
      },
      imagen: {
        total: imagenResults.length,
        successful: imagenResults.filter(r => r.success).length
      },
      errorHandling: {
        total: errorTests.length,
        passed: errorTests.filter(t => t.passed).length
      }
    },
    results: { geminiResults, imagenResults, errorTests }
  };

  const outputDir = await ensureOutputDir();
  const reportPath = path.join(outputDir, 'test-report.json');
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
  
  return report;
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Milestone 1: API Verification\n');
  console.log('=' .repeat(50) + '\n');
  
  // Test Gemini
  const geminiResults = await testGeminiImageGeneration();
  
  console.log('\n' + '=' .repeat(50) + '\n');
  
  // Test Imagen (may fail on free tier)
  const imagenResults = await testImagenGeneration();
  
  console.log('\n' + '=' .repeat(50) + '\n');
  
  // Test error handling
  const errorTests = await testErrorHandling();
  
  // Generate report
  const report = await generateReport(geminiResults, imagenResults, errorTests);
  
  // Summary
  console.log('\n📊 Test Summary:\n');
  console.log('🌟 Gemini 2.0 Flash Preview:');
  console.log(`   ✅ Successful: ${report.summary.gemini.successful}/${report.summary.gemini.total}`);
  console.log(`   ⏱️  Avg time: ${report.summary.gemini.avgGenTime}ms`);
  
  console.log('\n🎨 Imagen 3:');
  console.log(`   ${report.summary.imagen.successful > 0 ? '✅' : '❌'} Successful: ${report.summary.imagen.successful}/${report.summary.imagen.total}`);
  
  console.log('\n🧪 Error Handling:');
  console.log(`   ✅ Passed: ${report.summary.errorHandling.passed}/${report.summary.errorHandling.total}`);
  
  console.log('\n📄 Detailed report saved: test-downloads/test-report.json');
  console.log('🖼️  Generated images saved in: test-downloads/');
  
  // Success criteria for M1
  const geminiWorking = report.summary.gemini.successful >= 3;
  const errorHandlingWorking = report.summary.errorHandling.passed === report.summary.errorHandling.total;
  
  if (geminiWorking && errorHandlingWorking) {
    console.log('\n✅ Milestone 1 PASSED: API verification successful!');
    console.log('   - Gemini image generation working');
    console.log('   - Multiple aspect ratios tested');
    console.log('   - Error handling verified');
    return true;
  } else {
    console.log('\n❌ Milestone 1 FAILED: Issues detected');
    return false;
  }
}

// Run tests
runAllTests().catch(console.error);