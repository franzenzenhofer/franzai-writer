#!/usr/bin/env node

/**
 * Test script for Files API
 * Tests uploading and using files with Gemini
 */

import 'dotenv/config';
import { GoogleGenerativeAI, GoogleAIFileManager } from '@google/generative-ai';
import fs from 'fs';

console.log('🚀 Testing Files API\n');

if (!process.env.GOOGLE_GENAI_API_KEY) {
  console.error('❌ Error: GOOGLE_GENAI_API_KEY not found');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY);
const fileManager = new GoogleAIFileManager(process.env.GOOGLE_GENAI_API_KEY);

async function testFileUpload() {
  console.log('📝 Test 1: File Upload');
  try {
    // Create a test file
    const testContent = `# Test Document

This is a test document for the Files API.

## Section 1
Lorem ipsum dolor sit amet.

## Section 2  
Consectetur adipiscing elit.`;
    
    fs.writeFileSync('test-document.txt', testContent);
    
    // Upload the file
    const uploadResult = await fileManager.uploadFile('test-document.txt', {
      mimeType: 'text/plain',
      displayName: 'Test Document'
    });
    
    console.log('✅ File uploaded:', uploadResult.file);
    console.log('✅ File URI:', uploadResult.file.uri);
    
    // Use the file in generation
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent([
      'Summarize this document:',
      {
        fileData: {
          fileUri: uploadResult.file.uri,
          mimeType: uploadResult.file.mimeType
        }
      }
    ]);
    
    const response = await result.response;
    console.log('✅ Summary:', response.text());
    
    // Cleanup
    fs.unlinkSync('test-document.txt');
    
    return true;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

async function testLargeFileHandling() {
  console.log('\n📝 Test 2: Large File Handling');
  try {
    // Create a larger test file
    const largeContent = 'Lorem ipsum dolor sit amet. '.repeat(10000);
    fs.writeFileSync('test-large.txt', largeContent);
    
    const uploadResult = await fileManager.uploadFile('test-large.txt', {
      mimeType: 'text/plain',
      displayName: 'Large Test File'
    });
    
    console.log('✅ Large file uploaded');
    console.log('✅ File size:', uploadResult.file.sizeBytes, 'bytes');
    
    // List files
    const files = await fileManager.listFiles();
    console.log('✅ Files in account:', files.files?.length || 0);
    
    // Delete the file
    await fileManager.deleteFile(uploadResult.file.name);
    console.log('✅ File deleted');
    
    // Cleanup
    fs.unlinkSync('test-large.txt');
    
    return true;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('Starting Files API tests...\n');
  
  const tests = [
    testFileUpload,
    testLargeFileHandling
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