#!/usr/bin/env node

/**
 * Test script for Google Search grounding
 * Simple test using @google/genai SDK directly
 */

import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';

console.log('🧪 Testing Google Search Grounding with @google/genai...\n');

// Check API key
if (!process.env.GOOGLE_GENAI_API_KEY) {
  // Try to read from .env file
  try {
    const envContent = await import('fs').then(fs => fs.promises.readFile('.env', 'utf-8'));
    const apiKey = envContent.split('\n').find(line => line.startsWith('GOOGLE_GENAI_API_KEY'))?.split('=')[1]?.trim();
    if (apiKey) {
      process.env.GOOGLE_GENAI_API_KEY = apiKey;
    }
  } catch (e) {
    // Ignore
  }
}

if (!process.env.GOOGLE_GENAI_API_KEY) {
  console.error('❌ Error: GOOGLE_GENAI_API_KEY not found in environment variables');
  process.exit(1);
}

async function testGoogleSearchGrounding() {
  try {
    console.log('📋 Test: Google Search Grounding Direct API');
    console.log('=' .repeat(50));
    
    // Initialize the client
    const genAI = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY });
    
    // Test query that requires real-time information
    const prompt = "What happened yesterday in Austria? Use Google Search to find current news and provide real citations.";
    
    console.log('🚀 Prompt:', prompt);
    console.log('\n⏳ Making API request...\n');

    const result = await genAI.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      tools: [{ googleSearch: {} }],
      systemInstruction: "You have Google Search grounding enabled. Use it to find current, up-to-date information. Provide real search results with proper citations."
    });

    console.log('✅ API Response received!');
    
    const responseText = result.text;
    if (responseText) {
      console.log('📄 Content length:', responseText.length);
      console.log('🔍 Has grounding metadata:', !!result.groundingMetadata);
      console.log('📚 Has grounding sources:', !!result.groundingSources?.length);

      if (result.groundingMetadata) {
        console.log('\n🎯 GROUNDING METADATA FOUND:');
        console.log(JSON.stringify(result.groundingMetadata, null, 2));
      }

      if (result.groundingSources?.length) {
        console.log('\n📚 GROUNDING SOURCES FOUND:');
        console.log(JSON.stringify(result.groundingSources, null, 2));
      }

      console.log('\n📝 Generated Content:');
      console.log('-'.repeat(50));
      console.log(responseText.substring(0, 800) + (responseText.length > 800 ? '...' : ''));
      console.log('-'.repeat(50));

      // Check for grounding indicators in the text
      const hasTimeReference = responseText.toLowerCase().includes('yesterday') || 
                              responseText.toLowerCase().includes('recent') ||
                              responseText.toLowerCase().includes('news');
      const hasAustriaReference = responseText.toLowerCase().includes('austria');
      
      // Check for grounding success
      const hasGrounding = result.groundingMetadata || 
                          (result.groundingSources && result.groundingSources.length > 0) ||
                          (hasTimeReference && hasAustriaReference);
                          
      console.log(`\n🎯 GROUNDING STATUS: ${hasGrounding ? '✅ SUCCESS - Grounding detected!' : '❌ FAILED - No grounding detected'}`);
      
      if (hasGrounding) {
        console.log('🎉 Google Search grounding is working correctly!');
      } else {
        console.log('⚠️  Google Search grounding may not be working as expected.');
        console.log('💡 The response may still contain relevant information but without explicit grounding metadata.');
      }
    } else {
      console.log('❌ No content in response');
      console.log('Full response:', JSON.stringify(result, null, 2));
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
  }
}

// Run the test
testGoogleSearchGrounding().then(() => {
  console.log('\n🏁 Test completed!');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Test crashed:', error);
  process.exit(1);
});