import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

console.log('🎯 Testing Workflow Google Search Grounding Integration');
console.log('=====================================================');

async function testWorkflowGrounding() {
  try {
    console.log('📋 TEST: Google Search Grounding via Workflow API');
    console.log('================================================');
    
    const testInput = {
      promptTemplate: "What are the latest AI developments this week? Provide 3 specific examples with sources.",
      model: "gemini-2.0-flash",
      temperature: 0.2,
      groundingSettings: {
        googleSearch: {
          enabled: true,
          dynamicThreshold: 0.3
        }
      },
      systemInstructions: "You are an AI assistant that provides up-to-date information using Google Search. Always cite your sources.",
      streamingSettings: {
        enabled: false // Start with non-streaming for easier testing
      }
    };

    console.log('📤 Request payload:');
    console.log(JSON.stringify(testInput, null, 2));

    const response = await fetch('http://localhost:9002/api/test-ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testInput)
    });

    console.log('\n📊 Response status:', response.status);
    console.log('📊 Response headers:');
    for (const [key, value] of response.headers.entries()) {
      console.log(`  ${key}: ${value}`);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error:', errorText);
      return { success: false, error: errorText };
    }

    const result = await response.json();

    console.log('\n📥 Response keys:', Object.keys(result));
    console.log('\n📝 Generated content:');
    console.log('===================');
    console.log(result.content || 'No content');

    console.log('\n🔍 Grounding Analysis:');
    console.log('======================');
    
    if (result.groundingMetadata) {
      console.log('✅ Found groundingMetadata!');
      console.log('Keys:', Object.keys(result.groundingMetadata));
      
      if (result.groundingMetadata.webSearchQueries) {
        console.log('🔍 Search queries:', result.groundingMetadata.webSearchQueries);
      }
      
      if (result.groundingMetadata.groundingChunks) {
        console.log('📚 Grounding chunks count:', result.groundingMetadata.groundingChunks.length);
        result.groundingMetadata.groundingChunks.forEach((chunk, index) => {
          console.log(`  Chunk ${index + 1}:`, chunk.web?.title || 'Unknown title');
        });
      }
      
      if (result.groundingMetadata.groundingSupports) {
        console.log('🎯 Grounding supports count:', result.groundingMetadata.groundingSupports.length);
        result.groundingMetadata.groundingSupports.forEach((support, index) => {
          console.log(`  Support ${index + 1}: "${support.segment?.text?.substring(0, 100)}..."`);
        });
      }
    } else {
      console.log('❌ No groundingMetadata found');
    }

    if (result.groundingSources) {
      console.log('✅ Found groundingSources!');
      console.log('Sources count:', result.groundingSources.length);
      result.groundingSources.forEach((source, index) => {
        console.log(`  Source ${index + 1}: ${source.title} - ${source.uri}`);
      });
    } else {
      console.log('❌ No groundingSources found');
    }

    // Check if we have either grounding metadata or sources
    const hasGrounding = !!(result.groundingMetadata || result.groundingSources);
    
    console.log('\n📊 GROUNDING SUCCESS:', hasGrounding ? '✅ YES' : '❌ NO');
    
    return { success: true, hasGrounding, result };

  } catch (error) {
    console.error('❌ Test failed:', error);
    return { success: false, error: error.message };
  }
}

async function testWorkflowStreamingGrounding() {
  try {
    console.log('\n📋 TEST: Streaming Google Search Grounding');
    console.log('===========================================');
    
    const testInput = {
      promptTemplate: "What happened in world news yesterday? Give me a brief summary.",
      model: "gemini-2.0-flash",
      temperature: 0.1,
      groundingSettings: {
        googleSearch: {
          enabled: true,
          dynamicThreshold: 0.4
        }
      },
      streamingSettings: {
        enabled: true
      }
    };

    console.log('📤 Streaming request payload:');
    console.log(JSON.stringify(testInput, null, 2));

    const response = await fetch('http://localhost:9002/api/test-ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testInput)
    });

    console.log('\n📊 Streaming response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Streaming API Error:', errorText);
      return { success: false, error: errorText };
    }

    // Handle streaming response
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No reader available for streaming response');
    }

    let accumulatedData = '';
    let finalResult = null;

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        const chunk = new TextDecoder().decode(value);
        accumulatedData += chunk;
        
        // Try to parse JSON chunks
        const lines = accumulatedData.split('\n');
        accumulatedData = lines.pop() || ''; // Keep the last incomplete line
        
        for (const line of lines) {
          if (line.trim() && line.startsWith('data: ')) {
            try {
              const jsonData = JSON.parse(line.slice(6)); // Remove 'data: ' prefix
              console.log('📦 Streaming chunk received');
              finalResult = jsonData;
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    if (finalResult) {
      console.log('\n📝 Final streaming content:');
      console.log('===========================');
      console.log(finalResult.content || 'No content');
      
      const hasGrounding = !!(finalResult.groundingMetadata || finalResult.groundingSources);
      console.log('\n📊 STREAMING GROUNDING SUCCESS:', hasGrounding ? '✅ YES' : '❌ NO');
      
      return { success: true, hasGrounding, result: finalResult };
    } else {
      console.log('❌ No final result from streaming');
      return { success: false, error: 'No final result' };
    }

  } catch (error) {
    console.error('❌ Streaming test failed:', error);
    return { success: false, error: error.message };
  }
}

async function testForceGrounding() {
  try {
    console.log('\n📋 TEST: Force Google Search Grounding Flag');
    console.log('===========================================');
    
    const testInput = {
      promptTemplate: "Tell me about recent developments in quantum computing.",
      model: "gemini-2.0-flash",
      temperature: 0.1,
      forceGoogleSearchGrounding: true, // This should force grounding even without explicit groundingSettings
      systemInstructions: "Provide accurate, up-to-date information with proper citations."
    };

    console.log('📤 Force grounding request:');
    console.log(JSON.stringify(testInput, null, 2));

    const response = await fetch('http://localhost:9002/api/test-ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testInput)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Force grounding API Error:', errorText);
      return { success: false, error: errorText };
    }

    const result = await response.json();
    
    console.log('\n📝 Force grounding content:');
    console.log('===========================');
    console.log(result.content || 'No content');
    
    const hasGrounding = !!(result.groundingMetadata || result.groundingSources);
    console.log('\n📊 FORCE GROUNDING SUCCESS:', hasGrounding ? '✅ YES' : '❌ NO');
    
    return { success: true, hasGrounding, result };

  } catch (error) {
    console.error('❌ Force grounding test failed:', error);
    return { success: false, error: error.message };
  }
}

// Main execution
async function main() {
  console.log('🚀 Starting Workflow Google Search Grounding Test Suite');
  console.log('========================================================');
  
  const results = {
    basicGrounding: await testWorkflowGrounding(),
    streamingGrounding: await testWorkflowStreamingGrounding(),
    forceGrounding: await testForceGrounding()
  };
  
  console.log('\n🏁 FINAL TEST RESULTS SUMMARY');
  console.log('=============================');
  console.log('Basic Grounding:', results.basicGrounding.success ? '✅ SUCCESS' : '❌ FAILED');
  console.log('Streaming Grounding:', results.streamingGrounding.success ? '✅ SUCCESS' : '❌ FAILED');
  console.log('Force Grounding:', results.forceGrounding.success ? '✅ SUCCESS' : '❌ FAILED');
  
  const successCount = Object.values(results).filter(r => r.success).length;
  const groundingCount = Object.values(results).filter(r => r.hasGrounding).length;
  
  console.log(`\n📊 Success Rate: ${successCount}/3 tests passed`);
  console.log(`🔍 Grounding Rate: ${groundingCount}/3 tests had grounding data`);
  
  if (groundingCount === 3) {
    console.log('🎉 ALL TESTS HAVE WORKING GOOGLE SEARCH GROUNDING!');
  } else if (groundingCount > 0) {
    console.log('⚠️  Some tests have grounding issues - check implementation');
  } else {
    console.log('❌ NO GROUNDING DETECTED - implementation needs fixing');
  }
  
  console.log('\n🏁 Test suite completed!');
}

main().catch(console.error); 