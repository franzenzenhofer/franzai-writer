#!/usr/bin/env node

/**
 * Test script to find working Gemini image generation models
 * Tests various Gemini models for image generation capability
 */

import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Testing Various Gemini Models for Image Generation\n');

if (!process.env.GOOGLE_GENAI_API_KEY) {
  console.error('❌ Error: GOOGLE_GENAI_API_KEY not found');
  process.exit(1);
}

const genAI = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY });

// Models to test based on documentation
const MODELS_TO_TEST = [
  'gemini-2.0-flash-preview-image-generation',
  'gemini-2.0-flash-exp-image-generation', 
  'gemini-2.0-flash-image-generation',
  'gemini-2.0-flash',
  'gemini-2.0-flash-exp',
  'gemini-1.5-flash',
  'gemini-1.5-pro',
  'gemini-pro-vision',
  'gemini-2.0-pro',
  'gemini-2.0-pro-exp'
];

async function ensureOutputDir() {
  const outputDir = path.join(__dirname, '..', 'test-downloads', 'gemini-tests');
  await fs.mkdir(outputDir, { recursive: true });
  return outputDir;
}

async function testGeminiModel(modelName) {
  console.log(`\n📸 Testing: ${modelName}`);
  console.log('─'.repeat(50));
  
  const results = {
    model: modelName,
    success: false,
    error: null,
    hasImageGeneration: false,
    responseTime: 0,
    imageGenerated: false
  };
  
  try {
    const startTime = Date.now();
    
    // Test 1: Try with responseModalities config
    console.log('  Method 1: Using responseModalities in config...');
    try {
      const result = await genAI.models.generateContent({
        model: modelName,
        contents: 'Generate an image of a colorful butterfly on a flower',
        config: {
          responseModalities: ['TEXT', 'IMAGE']
        }
      });
      
      results.responseTime = Date.now() - startTime;
      
      // Check if we got any response
      if (result.text) {
        console.log(`  ✅ Got text response: "${result.text.substring(0, 50)}..."`);
      }
      
      // Check for images
      const candidates = result.candidates || [];
      const parts = candidates[0]?.content?.parts || [];
      
      for (const part of parts) {
        if (part.inlineData) {
          console.log('  🎉 IMAGE FOUND! Saving...');
          results.imageGenerated = true;
          results.hasImageGeneration = true;
          
          const outputDir = await ensureOutputDir();
          const filename = `${modelName.replace(/\./g, '-')}-method1.png`;
          const filePath = path.join(outputDir, filename);
          
          const buffer = Buffer.from(part.inlineData.data, 'base64');
          await fs.writeFile(filePath, buffer);
          console.log(`  💾 Saved: ${filename}`);
        }
      }
      
      if (!results.imageGenerated) {
        console.log('  ⚠️  No images in response');
      }
      
      results.success = true;
      
    } catch (e) {
      console.log(`  ❌ Method 1 failed: ${e.message.substring(0, 100)}`);
      results.error = e.message;
    }
    
    // Test 2: Try with generationConfig
    if (!results.imageGenerated) {
      console.log('\n  Method 2: Using responseModalities in generationConfig...');
      try {
        const result = await genAI.models.generateContent({
          model: modelName,
          contents: 'Create an image of a sunset over mountains',
          generationConfig: {
            responseModalities: ['TEXT', 'IMAGE']
          }
        });
        
        // Check for images
        const candidates = result.candidates || [];
        const parts = candidates[0]?.content?.parts || [];
        
        for (const part of parts) {
          if (part.inlineData) {
            console.log('  🎉 IMAGE FOUND with method 2!');
            results.imageGenerated = true;
            results.hasImageGeneration = true;
            
            const outputDir = await ensureOutputDir();
            const filename = `${modelName.replace(/\./g, '-')}-method2.png`;
            const filePath = path.join(outputDir, filename);
            
            const buffer = Buffer.from(part.inlineData.data, 'base64');
            await fs.writeFile(filePath, buffer);
            console.log(`  💾 Saved: ${filename}`);
          }
        }
        
        if (!results.imageGenerated) {
          console.log('  ⚠️  No images with method 2 either');
        }
        
      } catch (e) {
        console.log(`  ❌ Method 2 failed: ${e.message.substring(0, 100)}`);
      }
    }
    
    // Test 3: Try different prompt style
    if (!results.imageGenerated) {
      console.log('\n  Method 3: Trying explicit image generation prompt...');
      try {
        const result = await genAI.models.generateContent({
          model: modelName,
          contents: 'Generate an image: A cute robot holding flowers, digital art style',
          generationConfig: {
            responseModalities: ['TEXT', 'IMAGE'],
            temperature: 0.4,
            topK: 32,
            topP: 1,
            maxOutputTokens: 4096
          }
        });
        
        // Check response
        if (result.text) {
          console.log(`  📝 Response: "${result.text.substring(0, 100)}..."`);
        }
        
        const candidates = result.candidates || [];
        const parts = candidates[0]?.content?.parts || [];
        
        for (const part of parts) {
          if (part.inlineData) {
            console.log('  🎉 IMAGE FOUND with method 3!');
            results.imageGenerated = true;
            results.hasImageGeneration = true;
            
            const outputDir = await ensureOutputDir();
            const filename = `${modelName.replace(/\./g, '-')}-method3.png`;
            const filePath = path.join(outputDir, filename);
            
            const buffer = Buffer.from(part.inlineData.data, 'base64');
            await fs.writeFile(filePath, buffer);
            console.log(`  💾 Saved: ${filename}`);
          }
        }
        
      } catch (e) {
        console.log(`  ❌ Method 3 failed: ${e.message.substring(0, 50)}`);
      }
    }
    
  } catch (error) {
    results.error = error.message;
    console.log(`  ❌ Model error: ${error.message.substring(0, 100)}`);
  }
  
  // Summary for this model
  console.log('\n  Summary:');
  console.log(`  - Model exists: ${results.success || results.error?.includes('404') === false}`);
  console.log(`  - Image generation: ${results.hasImageGeneration ? '✅ YES!' : '❌ NO'}`);
  console.log(`  - Response time: ${results.responseTime}ms`);
  
  return results;
}

async function runAllTests() {
  console.log('Starting comprehensive Gemini model tests...\n');
  console.log('This will test multiple models and methods to find image generation support.');
  console.log('=' .repeat(60));
  
  const allResults = [];
  const workingModels = [];
  
  for (const model of MODELS_TO_TEST) {
    const result = await testGeminiModel(model);
    allResults.push(result);
    
    if (result.hasImageGeneration) {
      workingModels.push(model);
    }
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Final summary
  console.log('\n' + '=' .repeat(60));
  console.log('📊 FINAL SUMMARY\n');
  
  console.log('Models tested:', MODELS_TO_TEST.length);
  console.log('Models with image generation:', workingModels.length);
  
  if (workingModels.length > 0) {
    console.log('\n✅ WORKING MODELS FOR IMAGE GENERATION:');
    workingModels.forEach(model => {
      console.log(`  - ${model}`);
    });
  } else {
    console.log('\n❌ No Gemini models found with image generation support');
    console.log('This might mean:');
    console.log('  1. The feature is not yet available in your region');
    console.log('  2. The models require special access or configuration');
    console.log('  3. Image generation might be limited to specific API versions');
  }
  
  // Save detailed report
  const outputDir = await ensureOutputDir();
  const reportPath = path.join(outputDir, 'gemini-models-test-report.json');
  await fs.writeFile(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    modelsTotal: MODELS_TO_TEST.length,
    workingModels,
    detailedResults: allResults
  }, null, 2));
  
  console.log(`\n📄 Detailed report saved: ${reportPath}`);
  console.log('\n✨ Testing complete!');
}

// Run the tests
runAllTests().catch(console.error);