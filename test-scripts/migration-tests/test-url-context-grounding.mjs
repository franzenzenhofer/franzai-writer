#!/usr/bin/env node

/**
 * Test script for URL Context grounding
 * Tests URL context with @google/genai SDK
 */

import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';

console.log('🌐 Testing URL Context Grounding with @google/genai\n');

if (!process.env.GOOGLE_GENAI_API_KEY) {
  console.error('❌ Error: GOOGLE_GENAI_API_KEY not found');
  process.exit(1);
}

// Initialize the client
const genAI = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY });

async function testUrlContextOnly() {
  console.log('📝 Test 1: URL Context Only - News Headlines');
  try {
    const result = await genAI.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: 'Tell me the latest headlines from https://news.ycombinator.com/',
      config: {
        tools: [{ urlContext: {} }]
      }
    });

    console.log('✅ Response:', result.text || 'No response');
    
    // Check for URL context metadata
    if (result.candidates?.[0]?.urlContextMetadata) {
      console.log('✅ URL Context metadata found:', JSON.stringify(result.candidates[0].urlContextMetadata, null, 2));
      return true;
    } else {
      console.log('⚠️ No URL context metadata in response');
      console.log('Response structure:', Object.keys(result));
      if (result.candidates?.[0]) {
        console.log('Candidate keys:', Object.keys(result.candidates[0]));
      }
      return false;
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

async function testUrlContextWithGoogleSearch() {
  console.log('\n📝 Test 2: URL Context + Google Search Combined');
  try {
    const result = await genAI.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: 'Based on https://ai.google.dev/gemini-api/docs/url-context and recent news, what are the latest updates about URL context in Gemini API?',
      config: {
        tools: [{ urlContext: {} }, { googleSearch: {} }]
      }
    });

    console.log('✅ Response:', result.text || 'No response');
    
    // Check for both types of metadata
    let hasUrlContext = false;
    let hasGoogleSearch = false;
    
    if (result.candidates?.[0]?.urlContextMetadata) {
      console.log('✅ URL Context metadata found!');
      console.log('URL Context:', JSON.stringify(result.candidates[0].urlContextMetadata, null, 2));
      hasUrlContext = true;
    }
    
    if (result.candidates?.[0]?.groundingMetadata) {
      console.log('✅ Google Search grounding metadata found!');
      hasGoogleSearch = true;
    }
    
    console.log('✅ Has URL Context:', hasUrlContext);
    console.log('✅ Has Google Search:', hasGoogleSearch);
    
    return hasUrlContext || hasGoogleSearch;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

async function testUrlContextMultipleUrls() {
  console.log('\n📝 Test 3: URL Context with Multiple URLs');
  try {
    const result = await genAI.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: 'Compare the content from https://example.com and https://httpbin.org/html and tell me what each site is about.',
      config: {
        tools: [{ urlContext: {} }]
      }
    });

    console.log('✅ Response:', result.text || 'No response');
    
    if (result.candidates?.[0]?.urlContextMetadata?.urlMetadata) {
      const urlMetadata = result.candidates[0].urlContextMetadata.urlMetadata;
      console.log('✅ URL Context metadata found!');
      console.log('URLs processed:', urlMetadata.length);
      
      urlMetadata.forEach((meta, i) => {
        console.log(`  URL ${i + 1}: ${meta.retrievedUrl} - Status: ${meta.urlRetrievalStatus}`);
      });
      
      return urlMetadata.length > 0;
    } else {
      console.log('⚠️ No URL context metadata found');
      return false;
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

async function testUrlContextWithSystemInstruction() {
  console.log('\n📝 Test 4: URL Context with System Instructions');
  try {
    const result = await genAI.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: 'Analyze https://news.ycombinator.com/ and extract the top 3 story titles',
      systemInstruction: 'You are a news analyst. Extract specific headlines and provide them in a numbered list.',
      config: {
        tools: [{ urlContext: {} }],
        temperature: 0.1
      }
    });

    console.log('✅ Response:', result.text || 'No response');
    
    // Check if response contains numbered list
    const responseText = result.text;
    const hasNumberedList = responseText?.match(/\d+\./g) || [];
    
    console.log('✅ Contains numbered items:', hasNumberedList.length);
    
    if (result.candidates?.[0]?.urlContextMetadata) {
      console.log('✅ URL Context metadata found!');
      return true;
    }
    
    return responseText?.length > 0;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

async function testUrlContextAccuracy() {
  console.log('\n📝 Test 5: URL Context Accuracy Check');
  try {
    const result = await genAI.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: 'What is the main heading on https://example.com?',
      config: {
        tools: [{ urlContext: {} }]
      }
    });

    console.log('✅ Response:', result.text || 'No response');
    
    // Check if response mentions "Example Domain" which is the main heading on example.com
    const responseText = result.text;
    const hasExampleDomain = responseText?.toLowerCase().includes('example domain');
    
    console.log('✅ Contains "Example Domain":', hasExampleDomain);
    
    if (result.candidates?.[0]?.urlContextMetadata) {
      console.log('✅ URL Context metadata:', JSON.stringify(result.candidates[0].urlContextMetadata, null, 2));
    }
    
    return hasExampleDomain;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('Starting URL Context grounding tests...\n');
  console.log('Note: URL Context is experimental and may have limited support\n');
  
  const tests = [
    testUrlContextOnly,
    testUrlContextWithGoogleSearch,
    testUrlContextMultipleUrls,
    testUrlContextWithSystemInstruction,
    testUrlContextAccuracy
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    const result = await test();
    if (result) passed++;
    else failed++;
    
    // Add delay between tests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('\n📊 Test Summary:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Total: ${tests.length}`);
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed! URL Context grounding is working.');
  } else {
    console.log('\n⚠️ Some tests failed. URL Context grounding may have limited support.');
    console.log('Make sure you are using a supported model (gemini-2.0-flash, gemini-2.5-flash-preview-05-20, etc.)');
  }
}

// Run tests
runAllTests().catch(console.error); 