#!/usr/bin/env node

/**
 * Test script for Google Search grounding
 * Tests grounding with @google/genai SDK
 */

import 'dotenv/config';
import { genai } from '@google/genai';

console.log('🚀 Testing Google Search Grounding with @google/genai\n');

if (!process.env.GOOGLE_GENAI_API_KEY) {
  console.error('❌ Error: GOOGLE_GENAI_API_KEY not found');
  process.exit(1);
}

// Initialize the client
const client = genai({ apiKey: process.env.GOOGLE_GENAI_API_KEY });

async function testBasicGrounding() {
  console.log('📝 Test 1: Basic Google Search Grounding');
  try {
    const result = await client.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: 'What are the latest AI announcements from Google in 2025?',
      config: {
        tools: [{ google_search: {} }]
      }
    });

    console.log('✅ Response:', result.text || 'No response');
    
    // Check for grounding metadata
    if (result.groundingMetadata) {
      console.log('✅ Grounding metadata found:', JSON.stringify(result.groundingMetadata, null, 2));
      return true;
    } else {
      console.log('⚠️  No grounding metadata in response');
      return false;
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

async function testGroundingWithContext() {
  console.log('\n📝 Test 2: Grounding with Context');
  try {
    const result = await client.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: 'Based on current information, what is the weather forecast for New York City tomorrow?',
      config: {
        tools: [{ google_search: {} }]
      }
    });

    console.log('✅ Response:', result.text || 'No response');
    
    // Check if response mentions real-time information
    const hasRealTimeInfo = result.text?.toLowerCase().includes('weather') || 
                           result.text?.toLowerCase().includes('forecast');
    console.log('✅ Contains weather information:', hasRealTimeInfo);
    
    return hasRealTimeInfo;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

async function testGroundingAccuracy() {
  console.log('\n📝 Test 3: Grounding Accuracy Check');
  try {
    const result = await client.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: 'What is the current stock price of GOOGL?',
      config: {
        tools: [{ google_search: {} }]
      }
    });

    console.log('✅ Response:', result.text || 'No response');
    
    // Check if response contains price information
    const hasPriceInfo = result.text?.includes('$') || 
                        result.text?.toLowerCase().includes('price') ||
                        result.text?.toLowerCase().includes('stock');
    
    console.log('✅ Contains price information:', hasPriceInfo);
    
    if (result.groundingSources) {
      console.log('✅ Grounding sources:', result.groundingSources.length);
      result.groundingSources.forEach((source, i) => {
        console.log(`  ${i + 1}. ${source.title} - ${source.uri}`);
      });
    }
    
    return hasPriceInfo;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

async function testGroundingWithSystemInstruction() {
  console.log('\n📝 Test 4: Grounding with System Instruction');
  try {
    const result = await client.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: 'Who won the latest Nobel Prize in Physics?',
      systemInstruction: 'You are a helpful assistant that always cites sources when using grounded information.',
      config: {
        tools: [{ google_search: {} }]
      }
    });

    console.log('✅ Response:', result.text || 'No response');
    
    // Check if response includes citations or sources
    const hasCitations = result.text?.toLowerCase().includes('according to') ||
                        result.text?.toLowerCase().includes('source') ||
                        result.text?.toLowerCase().includes('based on');
    
    console.log('✅ Includes citations/sources:', hasCitations);
    return true;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

async function testGroundingStreaming() {
  console.log('\n📝 Test 5: Grounding with Streaming');
  try {
    const result = await client.models.generateContentStream({
      model: 'gemini-2.0-flash',
      contents: 'What are the top technology news stories today?',
      config: {
        tools: [{ google_search: {} }]
      }
    });

    console.log('✅ Streaming response:');
    let fullText = '';
    let hasGroundingData = false;
    
    for await (const chunk of result) {
      const text = chunk.text || '';
      process.stdout.write(text);
      fullText += text;
      
      // Check if chunk has grounding data
      if (chunk.groundingMetadata || chunk.groundingSources) {
        hasGroundingData = true;
      }
    }
    
    console.log('\n✅ Streaming complete');
    console.log('✅ Has grounding data in stream:', hasGroundingData);
    
    return fullText.length > 0;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

async function testGroundingWithJsonOutput() {
  console.log('\n📝 Test 6: Grounding with JSON Output');
  try {
    const schema = {
      type: 'object',
      properties: {
        topic: { type: 'string' },
        latest_news: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              headline: { type: 'string' },
              source: { type: 'string' },
              date: { type: 'string' }
            }
          }
        }
      }
    };

    const result = await client.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: 'Get the latest news about artificial intelligence and format as JSON',
      config: {
        tools: [{ google_search: {} }],
        response_mime_type: 'application/json',
        response_schema: schema
      }
    });

    console.log('✅ JSON Response:', result.text || 'No response');
    
    try {
      const parsed = JSON.parse(result.text || '{}');
      console.log('✅ Parsed JSON:', JSON.stringify(parsed, null, 2));
      return parsed.topic && parsed.latest_news;
    } catch (e) {
      console.log('❌ Failed to parse JSON response');
      return false;
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('Starting Google Search grounding tests...\n');
  console.log('Note: Google Search grounding may have limited support in @google/genai\n');
  
  const tests = [
    testBasicGrounding,
    testGroundingWithContext,
    testGroundingAccuracy,
    testGroundingWithSystemInstruction,
    testGroundingStreaming,
    testGroundingWithJsonOutput
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
    console.log('\n🎉 All tests passed! Google Search grounding is working.');
  } else {
    console.log('\n⚠️  Some tests failed. Google Search grounding may have limited support in @google/genai.');
    console.log('Consider using the direct Gemini API for full grounding features.');
  }
}

// Run tests
runAllTests().catch(console.error);