#!/usr/bin/env node

// Test script for Gemini Tools Test Workflow
// Run with: node test-gemini-workflow.mjs

// Use native fetch (available in Node 18+)
const BASE_URL = 'http://localhost:9002';

console.log('🧪 Testing Gemini Tools Test Workflow');
console.log('=====================================\n');

// First, let's check if the workflow exists
async function testWorkflowExists() {
  console.log('📋 Test 1: Check if workflow exists');
  console.log('-----------------------------------');
  
  try {
    const response = await fetch(`${BASE_URL}/api/test-documents`);
    const data = await response.json();
    
    if (!data.workflows) {
      console.log('❌ No workflows found in response');
      return false;
    }
    
    const geminiWorkflow = data.workflows.find(w => w.shortName === 'gemini-test');
    
    if (geminiWorkflow) {
      console.log('✅ Gemini Tools Test workflow found!');
      console.log(`   ID: ${geminiWorkflow.id}`);
      console.log(`   Name: ${geminiWorkflow.name}`);
      console.log(`   Stages: ${geminiWorkflow.stages.length}`);
      return true;
    } else {
      console.log('❌ Gemini Tools Test workflow not found');
      console.log('Available workflows:', data.workflows.map(w => w.shortName).join(', '));
      return false;
    }
  } catch (error) {
    console.log('❌ Error checking workflow:', error.message);
    return false;
  }
}

// Test URL fetch endpoint
async function testUrlFetch() {
  console.log('\n🌐 Test 2: URL Fetch Endpoint');
  console.log('------------------------------');
  
  try {
    const response = await fetch(`${BASE_URL}/api/fetch-url`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: 'https://example.com' })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ URL fetch successful');
      console.log(`   Title: ${data.title}`);
      console.log(`   Content length: ${data.contentLength} bytes`);
      console.log(`   Content preview: ${data.content.substring(0, 50)}...`);
      return true;
    } else {
      console.log(`❌ URL fetch failed: ${response.status} ${response.statusText}`);
      return false;
    }
  } catch (error) {
    console.log('❌ Error testing URL fetch:', error.message);
    return false;
  }
}

// Test AI action with simple prompt
async function testAiAction() {
  console.log('\n🤖 Test 3: AI Action (Simple Calculator)');
  console.log('-----------------------------------------');
  
  try {
    const response = await fetch(`${BASE_URL}/api/test-ai`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        promptTemplate: 'What is 25 + 37? Use the calculator tool to solve this.',
        model: 'googleai/gemini-2.0-flash-exp',
        toolNames: ['simpleCalculator']
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ AI action successful');
      console.log(`   Response: ${data.content}`);
      if (data.functionCalls?.length > 0) {
        console.log('   Function calls:', data.functionCalls.map(fc => 
          `${fc.toolName}(${JSON.stringify(fc.input)}) = ${JSON.stringify(fc.output)}`
        ).join('\n   '));
      }
      return true;
    } else {
      const errorText = await response.text();
      console.log(`❌ AI action failed: ${response.status} ${response.statusText}`);
      console.log(`   Error: ${errorText}`);
      return false;
    }
  } catch (error) {
    console.log('❌ Error testing AI action:', error.message);
    return false;
  }
}

// Run all tests
async function runTests() {
  const results = [];
  
  // Test 1: Workflow exists
  results.push(await testWorkflowExists());
  
  // Test 2: URL fetch
  results.push(await testUrlFetch());
  
  // Test 3: AI action with tools
  results.push(await testAiAction());
  
  // Summary
  console.log('\n📊 Test Summary');
  console.log('================');
  const passed = results.filter(r => r).length;
  const total = results.length;
  console.log(`✅ Passed: ${passed}/${total}`);
  
  if (passed === total) {
    console.log('\n🎉 All tests passed! The Gemini integration is working.');
    console.log('\n📝 Next steps:');
    console.log('1. Navigate to http://localhost:9002/w/gemini-test/new');
    console.log('2. Test each stage of the workflow manually');
    console.log('3. Verify UI components display results correctly');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the errors above.');
  }
}

// Check if server is running first
async function checkServer() {
  try {
    const response = await fetch(BASE_URL);
    if (response.ok) {
      console.log('✅ Server is running at', BASE_URL);
      return true;
    }
  } catch (error) {
    console.log('❌ Server is not running at', BASE_URL);
    console.log('Please run: npm run dev');
    return false;
  }
}

// Main execution
(async () => {
  if (await checkServer()) {
    await runTests();
  }
})();