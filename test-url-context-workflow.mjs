#!/usr/bin/env node

/**
 * Test script for URL Context grounding via workflow API
 * Tests the stage execution with URL context
 */

console.log('🌐 Testing URL Context Grounding via Workflow API\n');

async function testUrlContextWorkflow() {
  try {
    console.log('📋 TEST: URL Context Grounding via Stage Execution API');
    console.log('====================================================');
    
    const testInput = {
      promptTemplate: "Analyze the content from {{userInput.url}} and answer: {{userInput.question}}",
      model: "gemini-2.0-flash-exp",
      temperature: 0.7,
      contextVars: {
        "test-title": {
          userInput: "Test",
          output: "Test"
        },
        "grounding-url-context": {
          userInput: {
            url: "https://news.ycombinator.com/",
            question: "Tell me the latest headlines"
          }
        }
      },
      currentStageInput: {
        url: "https://news.ycombinator.com/",
        question: "Tell me the latest headlines"
      },
      stageOutputType: "text",
      forceGoogleSearchGrounding: false,
      groundingSettings: {
        urlContext: {
          enabled: true,
          urls: ["{{userInput.url}}"]
        }
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

    console.log('\n🌐 URL Context Analysis:');
    console.log('========================');
    
    if (result.urlContextMetadata) {
      console.log('✅ Found urlContextMetadata!');
      console.log('URL Context Metadata:', JSON.stringify(result.urlContextMetadata, null, 2));
      
      if (result.urlContextMetadata.urlMetadata) {
        const urlMetadata = result.urlContextMetadata.urlMetadata;
        console.log('URLs processed:', urlMetadata.length);
        
        urlMetadata.forEach((meta, i) => {
          console.log(`  URL ${i + 1}: ${meta.retrievedUrl} - Status: ${meta.urlRetrievalStatus}`);
        });
      }
    } else {
      console.log('❌ No urlContextMetadata found');
    }

    if (result.groundingSources) {
      console.log('✅ Found groundingSources!');
      console.log('Sources count:', result.groundingSources.length);
      result.groundingSources.forEach((source, index) => {
        console.log(`  Source ${index + 1}: ${source.title} - ${source.url}`);
      });
    } else {
      console.log('❌ No groundingSources found');
    }

    // Check if we have URL context working
    const hasUrlContext = !!(result.urlContextMetadata || result.groundingSources?.some(s => s.url?.includes('news.ycombinator.com')));
    
    console.log('\n📊 URL CONTEXT SUCCESS:', hasUrlContext ? '✅ YES' : '❌ NO');
    
    return { success: true, hasUrlContext, result };

  } catch (error) {
    console.error('❌ Test failed:', error);
    return { success: false, error: error.message };
  }
}

async function testUrlContextWithExample() {
  try {
    console.log('\n📋 TEST: URL Context with Example.com');
    console.log('=====================================');
    
    const testInput = {
      promptTemplate: "What is the main heading on {{userInput.url}}?",
      model: "gemini-2.0-flash-exp",
      temperature: 0.1,
      contextVars: {
        "grounding-url-context": {
          userInput: {
            url: "https://example.com"
          }
        }
      },
      currentStageInput: {
        url: "https://example.com"
      },
      stageOutputType: "text",
      groundingSettings: {
        urlContext: {
          enabled: true,
          urls: ["{{userInput.url}}"]
        }
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

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error:', errorText);
      return { success: false, error: errorText };
    }

    const result = await response.json();
    
    console.log('\n📝 Generated content:');
    console.log('===================');
    console.log(result.content || 'No content');
    
    // Check if response mentions "Example Domain"
    const responseText = result.content;
    const hasExampleDomain = responseText?.toLowerCase().includes('example domain');
    
    console.log('\n✅ Contains "Example Domain":', hasExampleDomain);
    
    if (result.urlContextMetadata) {
      console.log('✅ URL Context metadata:', JSON.stringify(result.urlContextMetadata, null, 2));
    }
    
    return { success: true, hasExampleDomain, result };

  } catch (error) {
    console.error('❌ Test failed:', error);
    return { success: false, error: error.message };
  }
}

async function runAllTests() {
  console.log('Starting URL Context workflow tests...\n');
  
  const tests = [
    testUrlContextWorkflow,
    testUrlContextWithExample
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    const result = await test();
    if (result.success && (result.hasUrlContext || result.hasExampleDomain)) {
      passed++;
    } else {
      failed++;
    }
    
    // Add delay between tests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('\n📊 Test Summary:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Total: ${tests.length}`);
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed! URL Context grounding is working in workflows.');
  } else {
    console.log('\n⚠️ Some tests failed. URL Context grounding may need debugging.');
  }
}

// Run tests
runAllTests().catch(console.error); 