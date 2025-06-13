#!/usr/bin/env node

/**
 * Test script for thinking mode
 * Tests advanced reasoning with 2.5 models
 */

import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

console.log('🚀 Testing Thinking Mode (2.5 models)\n');

if (!process.env.GOOGLE_GENAI_API_KEY) {
  console.error('❌ Error: GOOGLE_GENAI_API_KEY not found');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY);

async function testBasicThinking() {
  console.log('📝 Test 1: Basic Thinking Mode');
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        thinking: {
          includeThoughts: true,
          thinkingBudget: 2048
        }
      }
    });

    const result = await model.generateContent(
      'Explain why a heavier object and a lighter object fall at the same rate in a vacuum'
    );
    const response = await result.response;
    
    console.log('✅ Response:', response.text());
    console.log('✅ Usage metadata:', response.usageMetadata);
    console.log('✅ Thoughts token count:', response.usageMetadata?.thoughtsTokenCount);
    
    return true;
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('Note: This requires access to gemini-2.5-flash model');
    return false;
  }
}

async function testComplexReasoning() {
  console.log('\n📝 Test 2: Complex Reasoning Task');
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-pro',
      generationConfig: {
        thinking: {
          includeThoughts: true,
          thinkingBudget: 4096
        }
      }
    });

    const result = await model.generateContent(
      'Prove that the square root of 2 is irrational'
    );
    const response = await result.response;
    
    console.log('✅ Response:', response.text().substring(0, 200) + '...');
    console.log('✅ Thoughts included:', !!response.usageMetadata?.thoughtsTokenCount);
    
    return true;
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('Note: This requires access to gemini-2.5-pro model');
    return false;
  }
}

async function runAllTests() {
  console.log('Starting thinking mode tests...\n');
  console.log('⚠️  Note: These tests require access to 2.5 preview models\n');
  
  const tests = [
    testBasicThinking,
    testComplexReasoning
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
  
  if (failed > 0) {
    console.log('\n⚠️  Some tests may fail due to model availability');
  }
}

runAllTests().catch(console.error);