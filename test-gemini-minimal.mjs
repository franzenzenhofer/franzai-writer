#!/usr/bin/env node

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env.local
dotenv.config({ path: join(__dirname, '.env.local') });
import { GoogleGenerativeAI } from '@google/generative-ai';

console.log('=== MINIMAL GEMINI TEST ===');
console.log('Time:', new Date().toISOString());
console.log('API Key exists:', !!process.env.GOOGLE_GENAI_API_KEY);
console.log('API Key:', process.env.GOOGLE_GENAI_API_KEY?.substring(0, 10) + '...');

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY);

// Test different models
const models = [
  'gemini-1.5-pro',
  'gemini-1.5-flash', 
  'gemini-2.0-flash-exp',
  'gemini-pro'
];

async function testModel(modelName, timeoutMs) {
  console.log(`\n--- Testing ${modelName} with ${timeoutMs/1000}s timeout ---`);
  
  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    const prompt = "Say 'Hello World' in one sentence.";
    
    console.log(`[${new Date().toISOString()}] Sending prompt: "${prompt}"`);
    const startTime = Date.now();
    
    // Create timeout promise
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`Timeout after ${timeoutMs}ms`)), timeoutMs);
    });
    
    // Race between API call and timeout
    const result = await Promise.race([
      model.generateContent(prompt),
      timeoutPromise
    ]);
    
    const endTime = Date.now();
    const response = await result.response;
    const text = response.text();
    
    console.log(`[${new Date().toISOString()}] SUCCESS in ${endTime - startTime}ms`);
    console.log(`Response: ${text}`);
    
    return { success: true, time: endTime - startTime, response: text };
  } catch (error) {
    console.error(`[${new Date().toISOString()}] ERROR: ${error.message}`);
    if (error.stack) console.error(`Stack: ${error.stack.split('\n')[0]}`);
    return { success: false, error: error.message };
  }
}

// Test all models with increasing timeouts
async function runTests() {
  // First test with 10s timeout
  console.log('\n=== ROUND 1: 10 second timeout ===');
  for (const model of models) {
    await testModel(model, 10000);
  }
  
  // Then test failed models with 30s timeout
  console.log('\n=== ROUND 2: 30 second timeout ===');
  for (const model of models) {
    await testModel(model, 30000);
  }
  
  // Finally test with 60s timeout
  console.log('\n=== ROUND 3: 60 second timeout ===');
  for (const model of models) {
    await testModel(model, 60000);
  }
}

runTests().then(() => {
  console.log('\n=== ALL TESTS COMPLETE ===');
  process.exit(0);
}).catch(err => {
  console.error('Test runner error:', err);
  process.exit(1);
});