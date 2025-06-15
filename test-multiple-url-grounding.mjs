#!/usr/bin/env node

/**
 * Test script for Multiple URL Context grounding
 * Tests URL extraction from mixed text and grounding on multiple URLs
 */

console.log('🌐 Testing Multiple URL Context Grounding');
console.log('========================================');

async function testMultipleUrlGrounding() {
  try {
    console.log('📋 TEST: Multiple URL Context Grounding via Workflow API');
    console.log('========================================================');
    
    const testInput = {
      promptTemplate: `I need to compare information from these websites. First, check out https://example.com which is a simple test site. Then look at https://news.ycombinator.com/ for the latest tech news. 

Please tell me:
1. What is the main content of the example.com site?
2. What are the top 3 headlines from Hacker News?
3. Compare the content types of these two sites.

IMPORTANT: Use URL Context grounding to analyze content from both URLs mentioned above.`,
      model: "gemini-2.0-flash-exp",
      temperature: 0.1,
      groundingSettings: {
        urlContext: {
          enabled: true,
          extractUrlsFromInput: true
        }
      },
      systemInstructions: "You have URL Context grounding enabled. Extract URLs from the input text and use their content to provide comprehensive answers with proper citations.",
      streamingSettings: {
        enabled: false
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
    
    if (result.urlContextMetadata?.urlMetadata) {
      const { urlMetadata } = result.urlContextMetadata;
      console.log('✅ Found URL Context metadata!');
      console.log('URLs processed:', urlMetadata.length);
      
      urlMetadata.forEach((meta, i) => {
        const isSuccess = meta.urlRetrievalStatus === 'URL_RETRIEVAL_STATUS_SUCCESS';
        console.log(`  URL ${i + 1}: ${meta.retrievedUrl}`);
        console.log(`  Status: ${isSuccess ? '✅' : '❌'} ${meta.urlRetrievalStatus}`);
      });
      
      const successCount = urlMetadata.filter(meta => 
        meta.urlRetrievalStatus === 'URL_RETRIEVAL_STATUS_SUCCESS'
      ).length;
      
      console.log(`\n📊 URL Processing Summary:`);
      console.log(`   Total URLs: ${urlMetadata.length}`);
      console.log(`   Successful: ${successCount}`);
      console.log(`   Success Rate: ${Math.round(successCount/urlMetadata.length*100)}%`);
      
    } else {
      console.log('❌ No URL Context metadata found');
    }

    if (result.groundingSources) {
      console.log('\n✅ Found grounding sources!');
      console.log('Sources count:', result.groundingSources.length);
      result.groundingSources.forEach((source, index) => {
        console.log(`  Source ${index + 1}: ${source.title || 'No title'}`);
        console.log(`  URL: ${source.url || source.uri || 'No URL'}`);
        if (source.snippet) {
          console.log(`  Snippet: ${source.snippet.substring(0, 100)}...`);
        }
      });
    } else {
      console.log('❌ No grounding sources found');
    }

    // Test if response contains expected content
    const content = result.content?.toLowerCase() || '';
    const hasExampleDomain = content.includes('example domain');
    const hasHackerNews = content.includes('hacker') || content.includes('news');
    
    console.log('\n🎯 Content Analysis:');
    console.log('====================');
    console.log('Contains Example Domain reference:', hasExampleDomain ? '✅ YES' : '❌ NO');
    console.log('Contains Hacker News reference:', hasHackerNews ? '✅ YES' : '❌ NO');
    
    const success = !!(result.urlContextMetadata?.urlMetadata?.length > 0 && 
                       (hasExampleDomain || hasHackerNews));
    
    console.log('\n📊 MULTIPLE URL GROUNDING SUCCESS:', success ? '✅ YES' : '❌ NO');
    
    return { success, result, hasExampleDomain, hasHackerNews };

  } catch (error) {
    console.error('❌ Test failed:', error);
    return { success: false, error: error.message };
  }
}

async function testWorkflowExecution() {
  try {
    console.log('\n📋 TEST: Multiple URL Grounding via Workflow');
    console.log('============================================');
    
    // Test input with multiple URLs in natural text
    const testText = `Please analyze these two websites:
    
1. https://example.com - This should be a simple example site
2. https://httpbin.org/html - This is an HTTP testing service

Compare their content and tell me what each site is about. Also check if there are any similarities or differences in their design or purpose.`;

    console.log('📝 Test input with embedded URLs:');
    console.log(testText);
    console.log('\n🔍 Expected URLs to be extracted:');
    console.log('  - https://example.com');
    console.log('  - https://httpbin.org/html');
    
    const testInput = {
      promptTemplate: testText,
      model: "gemini-2.0-flash-exp",
      temperature: 0.1,
      groundingSettings: {
        urlContext: {
          enabled: true,
          extractUrlsFromInput: true
        }
      },
      systemInstructions: "You have URL Context grounding enabled. I will extract URLs from the user's input text and provide them for grounding. Use the content from these URLs to provide comprehensive answers with proper citations."
    };

    const response = await fetch('http://localhost:9002/api/test-ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testInput)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Workflow API Error:', errorText);
      return { success: false, error: errorText };
    }

    const result = await response.json();

    console.log('\n📝 Workflow Response:');
    console.log('=====================');
    console.log(result.content || 'No content');

    const hasUrlContext = !!(result.urlContextMetadata?.urlMetadata?.length > 0);
    console.log('\n🎯 Workflow URL Context Success:', hasUrlContext ? '✅ YES' : '❌ NO');
    
    return { success: hasUrlContext, result };

  } catch (error) {
    console.error('❌ Workflow test failed:', error);
    return { success: false, error: error.message };
  }
}

// Main execution
async function main() {
  console.log('🚀 Starting Multiple URL Grounding Tests...\n');
  
  const results = {
    directApi: await testMultipleUrlGrounding(),
    workflow: await testWorkflowExecution()
  };
  
  console.log('\n📊 FINAL RESULTS SUMMARY');
  console.log('========================');
  console.log('Direct API Test:', results.directApi.success ? '✅ SUCCESS' : '❌ FAILED');
  console.log('Workflow Test:', results.workflow.success ? '✅ SUCCESS' : '❌ FAILED');
  
  const overallSuccess = results.directApi.success && results.workflow.success;
  
  if (overallSuccess) {
    console.log('\n🎉 MULTIPLE URL GROUNDING IS WORKING!');
    console.log('\n📝 Next steps:');
    console.log('1. Navigate to http://localhost:9002/w/gemini-test/new');
    console.log('2. Find the "Multiple URL Context Grounding" stage');
    console.log('3. Enter text with multiple URLs mixed in');
    console.log('4. Verify URL extraction and grounding works correctly');
  } else {
    console.log('\n⚠️  Some tests failed. Check the errors above.');
  }
  
  console.log('\n🏁 Test suite completed!');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { testMultipleUrlGrounding, testWorkflowExecution }; 