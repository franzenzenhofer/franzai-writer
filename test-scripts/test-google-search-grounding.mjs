#!/usr/bin/env node

/**
 * Test script for Google Search grounding
 * Tests grounding with real-time search data
 */

import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

console.log('🚀 Testing Google Search Grounding\n');

if (!process.env.GOOGLE_GENAI_API_KEY) {
  console.error('❌ Error: GOOGLE_GENAI_API_KEY not found');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY);

async function testBasicGrounding() {
  console.log('📝 Test 1: Basic Google Search Grounding');
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      tools: [{ googleSearch: {} }]
    });

    const result = await model.generateContent('What are the latest AI announcements from Google in 2025?');
    const response = await result.response;
    
    console.log('✅ Response:', response.text());
    console.log('✅ Grounding metadata:', response.candidates?.[0]?.groundingMetadata);
    return true;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

async function testDynamicRetrieval() {
  console.log('\n📝 Test 2: Dynamic Retrieval with Threshold');
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash', // Dynamic retrieval requires 1.5 flash
      tools: [{ 
        googleSearch: {
          dynamicRetrieval: {
            threshold: 0.5
          }
        }
      }]
    });

    const result = await model.generateContent('What is 2+2?'); // Should not trigger search
    const response = await result.response;
    
    console.log('✅ Response:', response.text());
    console.log('✅ Search triggered:', !!response.candidates?.[0]?.groundingMetadata);
    return true;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('Starting Google Search grounding tests...\n');
  
  const tests = [
    testBasicGrounding,
    testDynamicRetrieval
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
}

runAllTests().catch(console.error);