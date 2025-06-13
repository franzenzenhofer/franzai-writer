#!/usr/bin/env node

/**
 * Test script for code execution
 * Tests Python code execution in sandbox
 */

import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

console.log('🚀 Testing Code Execution\n');

if (!process.env.GOOGLE_GENAI_API_KEY) {
  console.error('❌ Error: GOOGLE_GENAI_API_KEY not found');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY);

async function testBasicCodeExecution() {
  console.log('📝 Test 1: Basic Python Code Execution');
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      tools: [{ codeExecution: {} }]
    });

    const result = await model.generateContent('Calculate the factorial of 10 using Python');
    const response = await result.response;
    
    console.log('✅ Response:', response.text());
    
    // Check for code execution in parts
    const parts = response.candidates?.[0]?.content?.parts || [];
    const hasCode = parts.some(part => part.executableCode || part.codeExecutionResult);
    console.log('✅ Code executed:', hasCode);
    
    return true;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

async function testDataVisualization() {
  console.log('\n📝 Test 2: Data Visualization with Matplotlib');
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      tools: [{ codeExecution: {} }]
    });

    const result = await model.generateContent(
      'Create a bar chart showing programming language popularity: Python 40%, JavaScript 35%, Java 15%, Others 10%'
    );
    const response = await result.response;
    
    console.log('✅ Response:', response.text());
    
    // Check for image output
    const parts = response.candidates?.[0]?.content?.parts || [];
    const hasImage = parts.some(part => part.inlineData?.mimeType?.includes('image'));
    console.log('✅ Image generated:', hasImage);
    
    return true;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('Starting code execution tests...\n');
  
  const tests = [
    testBasicCodeExecution,
    testDataVisualization
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