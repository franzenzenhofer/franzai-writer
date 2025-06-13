#!/usr/bin/env node

console.log('🧪 Testing Google Search Grounding via API...\n');

async function testGoogleSearchGrounding() {
  try {
    console.log('📋 Test: Google Search Grounding via API');
    console.log('=' .repeat(50));
    
    const testPayload = {
      stageId: 'grounding-google-search',
      input: {
        promptTemplate: "What happened yesterday in Austria? Use Google Search to find current news and provide real citations.",
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
      }
    };

    console.log('🚀 Payload:', JSON.stringify(testPayload, null, 2));
    console.log('\n⏳ Making API request to localhost:9002...\n');

    const response = await fetch('http://localhost:9002/w/gemini-test/new', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    console.log('✅ API Response received!');
    console.log('📄 Response keys:', Object.keys(result));
    
    if (result.content) {
      console.log('📄 Content length:', result.content.length);
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
      console.log(result.content.substring(0, 800) + (result.content.length > 800 ? '...' : ''));
      console.log('-'.repeat(50));

      // Check for grounding success
      const hasGrounding = result.groundingMetadata || (result.groundingSources && result.groundingSources.length > 0);
      console.log(`\n🎯 GROUNDING STATUS: ${hasGrounding ? '✅ SUCCESS - Grounding detected!' : '❌ FAILED - No grounding detected'}`);
      
      if (hasGrounding) {
        console.log('🎉 Google Search grounding is working correctly!');
      } else {
        console.log('⚠️  Google Search grounding may not be working as expected.');
        console.log('💡 Check the logs for more details about the API request and response.');
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