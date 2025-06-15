import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const GEMINI_API_KEY = process.env.GOOGLE_GENAI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error('❌ GOOGLE_GENAI_API_KEY not found in environment variables');
  process.exit(1);
}

console.log('🚀 Starting Google Search Grounding Test');
console.log('🔑 API Key loaded:', GEMINI_API_KEY.substring(0, 8) + '...');

async function testGoogleSearchGrounding() {
  try {
    // Initialize the Google GenAI client
    const genAI = new GoogleGenAI({
      apiKey: GEMINI_API_KEY,
    });

    console.log('\n📋 TEST 1: Basic Google Search Grounding');
    console.log('=========================================');
    
    const testQuery = "What happened in the world yesterday? Give me 3 major news stories.";
    console.log('🤔 Question:', testQuery);
    
    // Test Google Search grounding as per documentation
    const response = await genAI.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [{ text: testQuery }],
      config: {
        temperature: 0.1, // Low temperature for factual accuracy
        tools: [{ googleSearch: {} }] // Enable Google Search grounding
      }
    });

    console.log('\n📤 Request sent to API:');
    console.log(JSON.stringify({
      model: 'gemini-2.0-flash',
      contents: [{ text: testQuery }],
      config: {
        temperature: 0.1,
        tools: [{ googleSearch: {} }]
      }
    }, null, 2));

    console.log('\n📥 Raw API Response:');
    console.log('==================');
    console.log('Response structure:', Object.keys(response));
    console.log('Response:', JSON.stringify(response, null, 2));

    // Extract and display the text content
    const textContent = response.text || '';
    console.log('\n📝 Generated Text Content:');
    console.log('==========================');
    console.log(textContent);

    // Check for grounding metadata
    console.log('\n🔍 Grounding Analysis:');
    console.log('=====================');
    
    const candidates = response.candidates || [];
    let foundGrounding = false;
    
    candidates.forEach((candidate, index) => {
      console.log(`\nCandidate ${index + 1}:`);
      console.log('Keys:', Object.keys(candidate));
      
      if (candidate.groundingMetadata) {
        console.log('✅ Found groundingMetadata!');
        console.log('Grounding Metadata:', JSON.stringify(candidate.groundingMetadata, null, 2));
        foundGrounding = true;
      }
      
      if (candidate.citationMetadata) {
        console.log('✅ Found citationMetadata!');
        console.log('Citation Metadata:', JSON.stringify(candidate.citationMetadata, null, 2));
        foundGrounding = true;
      }
    });

    if (!foundGrounding) {
      console.log('❌ No grounding metadata found in response');
      console.log('Full response structure for debugging:');
      console.log(JSON.stringify(response, null, 2));
    }

    return { success: true, response, foundGrounding };

  } catch (error) {
    console.error('❌ Test failed with error:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Full error:', error);
    return { success: false, error };
  }
}

async function testDynamicRetrieval() {
  try {
    console.log('\n📋 TEST 2: Dynamic Retrieval with Threshold');
    console.log('===========================================');
    
    const genAI = new GoogleGenAI({
      apiKey: GEMINI_API_KEY,
    });

    const testQuery = "What is the capital of France?"; // This shouldn't need search
    console.log('🤔 Question (shouldn\'t trigger search):', testQuery);
    
    const response = await genAI.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [{ text: testQuery }],
      config: {
        temperature: 0.1,
        tools: [{ googleSearch: {} }],
        toolConfig: {
          googleSearch: {
            dynamicRetrieval: {
              threshold: 0.7 // High threshold
            }
          }
        }
      }
    });

    console.log('\n📤 Request with Dynamic Retrieval:');
    console.log(JSON.stringify({
      model: 'gemini-2.0-flash',
      contents: [{ text: testQuery }],
      config: {
        temperature: 0.1,
        tools: [{ googleSearch: {} }],
        toolConfig: {
          googleSearch: {
            dynamicRetrieval: {
              threshold: 0.7
            }
          }
        }
      }
    }, null, 2));

    console.log('\n📥 Response:', JSON.stringify(response, null, 2));
    console.log('\n📝 Generated Text:', response.text || '');

    return { success: true, response };

  } catch (error) {
    console.error('❌ Dynamic retrieval test failed:');
    console.error(error);
    return { success: false, error };
  }
}

async function testCurrentEvents() {
  try {
    console.log('\n📋 TEST 3: Current Events (Should Definitely Trigger Search)');
    console.log('============================================================');
    
    const genAI = new GoogleGenAI({
      apiKey: GEMINI_API_KEY,
    });

    const testQuery = "What are the latest news about AI developments this week?";
    console.log('🤔 Question:', testQuery);
    
    const response = await genAI.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [{ text: testQuery }],
      config: {
        temperature: 0.2,
        tools: [{ googleSearch: {} }]
      }
    });

    console.log('\n📝 Generated Text:', response.text || '');
    
    // Deep dive into response structure
    console.log('\n🔍 Deep Response Analysis:');
    console.log('=========================');
    console.log('Response keys:', Object.keys(response));
    
    if (response.candidates) {
      response.candidates.forEach((candidate, index) => {
        console.log(`\nCandidate ${index + 1} keys:`, Object.keys(candidate));
        
        if (candidate.content) {
          console.log(`Candidate ${index + 1} content keys:`, Object.keys(candidate.content));
        }
        
        if (candidate.groundingMetadata) {
          console.log(`✅ Candidate ${index + 1} has grounding metadata!`);
          console.log(JSON.stringify(candidate.groundingMetadata, null, 2));
        }
        
        if (candidate.citationMetadata) {
          console.log(`✅ Candidate ${index + 1} has citation metadata!`);
          console.log(JSON.stringify(candidate.citationMetadata, null, 2));
        }
      });
    }

    return { success: true, response };

  } catch (error) {
    console.error('❌ Current events test failed:');
    console.error(error);
    return { success: false, error };
  }
}

// Main execution
async function main() {
  console.log('🎯 Google Gemini API - Google Search Grounding Test Suite');
  console.log('=========================================================');
  
  const results = {
    test1: await testGoogleSearchGrounding(),
    test2: await testDynamicRetrieval(),
    test3: await testCurrentEvents()
  };
  
  console.log('\n📊 FINAL RESULTS SUMMARY');
  console.log('========================');
  console.log('Test 1 (Basic Grounding):', results.test1.success ? '✅ SUCCESS' : '❌ FAILED');
  console.log('Test 2 (Dynamic Retrieval):', results.test2.success ? '✅ SUCCESS' : '❌ FAILED');
  console.log('Test 3 (Current Events):', results.test3.success ? '✅ SUCCESS' : '❌ FAILED');
  
  if (results.test1.foundGrounding) {
    console.log('🎉 GOOGLE SEARCH GROUNDING IS WORKING!');
  } else {
    console.log('⚠️  Google Search grounding not detected in responses');
  }
  
  console.log('\n🏁 Test suite completed!');
}

main().catch(console.error); 