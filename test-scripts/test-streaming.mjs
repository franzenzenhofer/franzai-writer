#!/usr/bin/env node

/**
 * Test script for streaming functionality
 * Tests both direct SDK streaming and API route streaming
 */

import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

console.log('🚀 Testing Streaming with Google Generative AI\n');

// Check API key
if (!process.env.GOOGLE_GENAI_API_KEY) {
  console.error('❌ Error: GOOGLE_GENAI_API_KEY not found in environment variables');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY);

async function testBasicStreaming() {
  console.log('📝 Test 1: Basic SDK Streaming');
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContentStream('Write 3 programming tips, one per line');
    
    console.log('✅ Streaming response:');
    let chunkCount = 0;
    for await (const chunk of result.stream) {
      const text = chunk.text();
      process.stdout.write(text);
      chunkCount++;
    }
    console.log(`\n✅ Stream complete with ${chunkCount} chunks`);
    return true;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

async function testStreamingWithMetadata() {
  console.log('\n📝 Test 2: Streaming with Usage Metadata');
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContentStream('Count from 1 to 3');
    
    console.log('✅ Streaming response:');
    let fullResponse;
    for await (const chunk of result.stream) {
      const text = chunk.text();
      process.stdout.write(text);
      fullResponse = chunk;
    }
    
    // Get aggregated response
    const response = await result.response;
    console.log('\n✅ Usage metadata:', response.usageMetadata);
    return true;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

async function testAPIRouteStreaming() {
  console.log('\n📝 Test 3: API Route Streaming (simulated)');
  console.log('Note: This would test the /api/ai/stream route in a real environment');
  
  // Simulate what the API route would do
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContentStream('Say hello in 3 languages');
    
    console.log('✅ Simulating Server-Sent Events format:');
    for await (const chunk of result.stream) {
      const text = chunk.text();
      const data = `data: ${JSON.stringify({ text })}\n\n`;
      process.stdout.write(data);
    }
    console.log('data: [DONE]\n\n');
    console.log('✅ SSE stream complete');
    return true;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

async function testStreamingError() {
  console.log('\n📝 Test 4: Streaming Error Handling');
  try {
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash',
      generationConfig: {
        maxOutputTokens: 5 // Very small to test truncation
      }
    });
    const result = await model.generateContentStream('Write a very long story about programming');
    
    console.log('✅ Streaming with token limit:');
    for await (const chunk of result.stream) {
      process.stdout.write(chunk.text());
    }
    console.log('\n✅ Stream handled token limit correctly');
    return true;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

async function testStreamingCancellation() {
  console.log('\n📝 Test 5: Streaming Cancellation (simulated)');
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContentStream('Count from 1 to 100 slowly');
    
    console.log('✅ Starting stream (will stop after 3 chunks):');
    let chunkCount = 0;
    for await (const chunk of result.stream) {
      process.stdout.write(chunk.text());
      chunkCount++;
      if (chunkCount >= 3) {
        console.log('\n✅ Stream cancelled after 3 chunks');
        break;
      }
    }
    return true;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('Starting all streaming tests...\n');
  
  const tests = [
    testBasicStreaming,
    testStreamingWithMetadata,
    testAPIRouteStreaming,
    testStreamingError,
    testStreamingCancellation
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
    console.log('\n🎉 All tests passed! Streaming is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the errors above.');
  }
}

// Run tests
runAllTests().catch(console.error);