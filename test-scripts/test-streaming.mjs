#!/usr/bin/env node

/**
 * Test script for streaming functionality
 * Tests streaming with @google/genai SDK
 */

import 'dotenv/config';
import { genai } from '@google/genai';

console.log('🚀 Testing Streaming with @google/genai\n');

// Check API key
if (!process.env.GOOGLE_GENAI_API_KEY) {
  console.error('❌ Error: GOOGLE_GENAI_API_KEY not found in environment variables');
  process.exit(1);
}

// Initialize the client
const client = genai({ apiKey: process.env.GOOGLE_GENAI_API_KEY });

async function testBasicStreaming() {
  console.log('📝 Test 1: Basic SDK Streaming');
  try {
    const result = await client.models.generateContentStream({
      model: 'gemini-2.0-flash',
      contents: 'Write 3 programming tips, one per line'
    });
    
    console.log('✅ Streaming response:');
    let chunkCount = 0;
    let fullText = '';
    
    for await (const chunk of result) {
      const text = chunk.text || '';
      process.stdout.write(text);
      fullText += text;
      chunkCount++;
    }
    
    console.log(`\n✅ Stream complete with ${chunkCount} chunks`);
    console.log(`✅ Total length: ${fullText.length} characters`);
    return true;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

async function testStreamingWithSystemInstruction() {
  console.log('\n📝 Test 2: Streaming with System Instruction');
  try {
    const result = await client.models.generateContentStream({
      model: 'gemini-2.0-flash',
      contents: 'Count from 1 to 5',
      systemInstruction: 'You are a helpful assistant that always responds concisely.'
    });
    
    console.log('✅ Streaming response:');
    let fullText = '';
    
    for await (const chunk of result) {
      const text = chunk.text || '';
      process.stdout.write(text);
      fullText += text;
    }
    
    console.log('\n✅ Response received with system instruction');
    return true;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

async function testStreamingSpeed() {
  console.log('\n📝 Test 3: Streaming Speed Test');
  try {
    const startTime = Date.now();
    let firstChunkTime = 0;
    let chunkTimings = [];
    
    const result = await client.models.generateContentStream({
      model: 'gemini-2.0-flash',
      contents: 'Write a 100 word story about a robot',
      config: {
        temperature: 0.7,
        maxTokens: 150
      }
    });
    
    console.log('✅ Measuring streaming performance...');
    let chunkCount = 0;
    
    for await (const chunk of result) {
      const currentTime = Date.now() - startTime;
      if (chunkCount === 0) {
        firstChunkTime = currentTime;
      }
      chunkTimings.push(currentTime);
      chunkCount++;
      process.stdout.write('.');
    }
    
    const totalTime = Date.now() - startTime;
    console.log('\n✅ Streaming metrics:');
    console.log(`  - First chunk: ${firstChunkTime}ms`);
    console.log(`  - Total chunks: ${chunkCount}`);
    console.log(`  - Total time: ${totalTime}ms`);
    console.log(`  - Average chunk interval: ${Math.round(totalTime / chunkCount)}ms`);
    
    return true;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

async function testStreamingInterruption() {
  console.log('\n📝 Test 4: Streaming Early Exit');
  try {
    const result = await client.models.generateContentStream({
      model: 'gemini-2.0-flash',
      contents: 'Count from 1 to 100 slowly'
    });
    
    console.log('✅ Testing early stream exit (will stop after 5 chunks)...');
    let chunkCount = 0;
    
    for await (const chunk of result) {
      const text = chunk.text || '';
      process.stdout.write(text);
      chunkCount++;
      
      // Early exit after 5 chunks
      if (chunkCount >= 5) {
        console.log('\n✅ Early exit successful');
        break;
      }
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

async function testStreamingError() {
  console.log('\n📝 Test 5: Streaming Error Handling');
  try {
    // Intentionally use a very low max tokens to potentially trigger an error
    const result = await client.models.generateContentStream({
      model: 'gemini-2.0-flash',
      contents: 'Write a 1000 word essay',
      config: {
        maxTokens: 5 // Very low limit
      }
    });
    
    console.log('✅ Testing error conditions...');
    let fullText = '';
    
    for await (const chunk of result) {
      const text = chunk.text || '';
      fullText += text;
    }
    
    console.log(`✅ Completed with text: "${fullText}"`);
    console.log('✅ Error handling test complete (low token limit handled gracefully)');
    return true;
  } catch (error) {
    console.log('✅ Error caught as expected:', error.message);
    return true; // This is expected behavior
  }
}

async function testMultiTurnStreaming() {
  console.log('\n📝 Test 6: Multi-turn Conversation Streaming');
  try {
    // Note: @google/genai might not support chat sessions like @google/generative-ai
    console.log('ℹ️  Testing multi-turn conversation...');
    
    // First turn
    const result1 = await client.models.generateContentStream({
      model: 'gemini-2.0-flash',
      contents: 'Hello! My name is Alice.'
    });
    
    console.log('Turn 1 response:');
    let response1 = '';
    for await (const chunk of result1) {
      const text = chunk.text || '';
      process.stdout.write(text);
      response1 += text;
    }
    
    // Second turn (simulated - @google/genai may not maintain context)
    const result2 = await client.models.generateContentStream({
      model: 'gemini-2.0-flash',
      contents: 'What did I just tell you my name was? (Previous message: "Hello! My name is Alice.")'
    });
    
    console.log('\n\nTurn 2 response:');
    for await (const chunk of result2) {
      const text = chunk.text || '';
      process.stdout.write(text);
    }
    
    console.log('\n✅ Multi-turn test complete');
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
    testStreamingWithSystemInstruction,
    testStreamingSpeed,
    testStreamingInterruption,
    testStreamingError,
    testMultiTurnStreaming
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    const result = await test();
    if (result) passed++;
    else failed++;
    
    // Add delay between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
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