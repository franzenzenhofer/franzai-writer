#!/usr/bin/env node

/**
 * Test script for Google Search grounding using official docs format
 * Based on: https://ai.google.dev/gemini-api/docs/grounding?hl=en&lang=javascript
 */

import 'dotenv/config';
import { GoogleGenAI } from "@google/genai";

console.log('🚀 Testing Google Search Grounding - Official Format\n');

if (!process.env.GOOGLE_GENAI_API_KEY) {
  console.error('❌ Error: GOOGLE_GENAI_API_KEY not found');
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY });

async function testOfficialGroundingFormat() {
  console.log('📝 Test: Official Google Documentation Format');
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [
        "Who individually won the most bronze medals during the Paris olympics in 2024?",
      ],
      config: {
        tools: [{googleSearch: {}}],
      },
    });
    
    console.log('✅ Response text:', response.text);
    console.log('\n🔍 Grounding Analysis:');
    
    // Check for grounding metadata as per official docs
    if (response.candidates?.[0]?.groundingMetadata) {
      console.log('✅ Found grounding metadata!');
      const groundingMetadata = response.candidates[0].groundingMetadata;
      
      console.log('📊 Grounding details:');
      console.log('  - Search queries:', groundingMetadata.webSearchQueries?.length || 0);
      console.log('  - Grounding chunks:', groundingMetadata.groundingChunks?.length || 0);
      console.log('  - Grounding supports:', groundingMetadata.groundingSupports?.length || 0);
      
      // Display search entry point as per docs
      if (groundingMetadata.searchEntryPoint?.renderedContent) {
        console.log('✅ Search entry point found (Google Search Suggestions)');
      }
      
      return true;
    } else {
      console.log('❌ No grounding metadata found');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

async function testCurrentNews() {
  console.log('\n📝 Test: Current News Query');
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [
        "What happened in world news yesterday?",
      ],
      config: {
        tools: [{googleSearch: {}}],
      },
    });
    
    console.log('✅ Response:', response.text);
    
    // Check for grounding metadata
    const hasGrounding = !!response.candidates?.[0]?.groundingMetadata;
    console.log('📊 Has grounding:', hasGrounding ? '✅ YES' : '❌ NO');
    
    return hasGrounding;
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('Starting official grounding tests...\n');
  
  const results = {
    officialFormat: await testOfficialGroundingFormat(),
    currentNews: await testCurrentNews()
  };
  
  console.log('\n📊 Test Results:');
  for (const [test, result] of Object.entries(results)) {
    console.log(`  ${test}: ${result ? '✅ PASS' : '❌ FAIL'}`);
  }
  
  const passCount = Object.values(results).filter(Boolean).length;
  const totalCount = Object.values(results).length;
  
  console.log(`\n📈 Summary: ${passCount}/${totalCount} tests passed`);
  
  if (passCount === totalCount) {
    console.log('🎉 All tests passed! Grounding is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Grounding may not be properly configured.');
  }
}

runTests().catch(console.error); 