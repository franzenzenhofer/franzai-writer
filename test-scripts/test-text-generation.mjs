#!/usr/bin/env node

/**
 * Test script for basic text generation
 * Tests the core text generation functionality
 */

import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';

console.log('🚀 Testing Text Generation with Google GenAI (@google/genai)\n');

// Check API key
if (!process.env.GOOGLE_GENAI_API_KEY) {
  console.error('❌ Error: GOOGLE_GENAI_API_KEY not found in environment variables');
  process.exit(1);
}

const genAI = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY });

async function testBasicGeneration() {
  console.log('📝 Test 1: Basic Text Generation');
  try {
    const result = await genAI.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: 'Write a haiku about coding'
    });
    console.log('✅ Success! Generated text:');
    console.log(result.text);
    console.log('\n📊 Usage metadata:', result.usage);
    return true;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

async function testWithSystemInstruction() {
  console.log('\n📝 Test 2: Generation with System Instruction');
  try {
    const result = await genAI.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: 'What is TypeScript?',
      systemInstruction: 'You are a helpful coding assistant. Keep responses concise.'
    });
    console.log('✅ Success! Generated text:');
    console.log(result.text);
    return true;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

async function testStreaming() {
  console.log('\n📝 Test 3: Streaming Generation');
  try {
    const result = await genAI.models.generateContentStream({
      model: 'gemini-2.0-flash',
      contents: 'Count from 1 to 5 slowly'
    });
    
    console.log('✅ Streaming response:');
    let fullText = '';
    for await (const chunk of result) {
      const chunkText = chunk.text || '';
      process.stdout.write(chunkText);
      fullText += chunkText;
    }
    console.log('\n✅ Stream complete');
    return true;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

async function testTokenCounting() {
  console.log('\n📝 Test 4: Token Counting');
  try {
    const text = 'This is a test sentence for token counting.';
    const result = await genAI.models.countTokens({
      model: 'gemini-2.0-flash',
      contents: text
    });
    console.log(`✅ Token count for "${text}": ${result.totalTokens} tokens`);
    return true;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

async function testWithParameters() {
  console.log('\n📝 Test 5: Generation with Parameters');
  try {
    const result = await genAI.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: 'List 3 programming languages',
      config: {
        temperature: 0.1,
        maxTokens: 50,
        topP: 0.8,
        topK: 10
      }
    });
    console.log('✅ Success! Generated text:');
    console.log(result.text);
    return true;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('Starting all text generation tests...\n');
  
  const tests = [
    testBasicGeneration,
    testWithSystemInstruction,
    testStreaming,
    testTokenCounting,
    testWithParameters
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
  console.log(`📈 Total: ${tests.length}`);
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed! Text generation is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the errors above.');
  }
}

// Run tests
runAllTests().catch(console.error);