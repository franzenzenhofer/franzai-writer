#!/usr/bin/env node

import { aiStageExecutionFlow } from './src/ai/flows/ai-stage-execution.js';

console.log('🧪 Testing Google Search Grounding...\n');

async function testGoogleSearchGrounding() {
  try {
    console.log('📋 Test 1: Basic Google Search Grounding Test');
    console.log('=' .repeat(50));
    
    const testInput = {
      promptTemplate: "What happened yesterday in Austria? Use Google Search to find current news.",
      model: "googleai/gemini-2.0-flash",
      temperature: 0.7,
      forceGoogleSearchGrounding: true,
      systemInstructions: "You have Google Search grounding enabled. Use it to find current, up-to-date information. Provide real search results with proper citations.",
      fileInputs: [],
      groundingSettings: {
        googleSearch: {
          enabled: true
        }
      }
    };

    console.log('🚀 Input:', JSON.stringify(testInput, null, 2));
    console.log('\n⏳ Executing AI stage...\n');

    const result = await aiStageExecutionFlow(testInput);

    console.log('✅ Result received!');
    console.log('📄 Content length:', result.content?.length || 0);
    console.log('🔍 Has grounding metadata:', !!result.groundingMetadata);
    console.log('📚 Has grounding sources:', !!result.groundingSources?.length);
    console.log('🧠 Thinking steps:', result.thinkingSteps?.length || 0);

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
    console.log(result.content?.substring(0, 500) + (result.content?.length > 500 ? '...' : ''));
    console.log('-'.repeat(50));

    // Test 2: Without grounding for comparison
    console.log('\n\n📋 Test 2: Same Query WITHOUT Google Search Grounding (for comparison)');
    console.log('=' .repeat(50));

    const testInputNoGrounding = {
      ...testInput,
      forceGoogleSearchGrounding: false,
      groundingSettings: {
        googleSearch: {
          enabled: false
        }
      }
    };

    const resultNoGrounding = await aiStageExecutionFlow(testInputNoGrounding);

    console.log('✅ Result without grounding received!');
    console.log('📄 Content length:', resultNoGrounding.content?.length || 0);
    console.log('🔍 Has grounding metadata:', !!resultNoGrounding.groundingMetadata);
    console.log('📚 Has grounding sources:', !!resultNoGrounding.groundingSources?.length);

    console.log('\n📝 Generated Content (No Grounding):');
    console.log('-'.repeat(50));
    console.log(resultNoGrounding.content?.substring(0, 500) + (resultNoGrounding.content?.length > 500 ? '...' : ''));
    console.log('-'.repeat(50));

    // Summary
    console.log('\n\n📊 SUMMARY:');
    console.log('=' .repeat(50));
    console.log(`✅ Test 1 (WITH grounding): ${result.groundingMetadata || result.groundingSources?.length ? 'SUCCESS - Grounding detected!' : 'FAILED - No grounding detected'}`);
    console.log(`📋 Test 2 (WITHOUT grounding): ${!resultNoGrounding.groundingMetadata && !resultNoGrounding.groundingSources?.length ? 'SUCCESS - No grounding as expected' : 'UNEXPECTED - Grounding detected when disabled'}`);

  } catch (error) {
    console.error('❌ Test failed with error:', error);
    console.error('Stack trace:', error.stack);
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