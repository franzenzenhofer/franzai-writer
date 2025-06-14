#!/usr/bin/env node

/**
 * Test script for function calling / tools
 * Note: @google/genai doesn't support native function calling like @google/generative-ai
 * This test demonstrates workarounds and prompt engineering approaches
 */

import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';

console.log('🚀 Testing Function Calling Workarounds with @google/genai\n');

// Check API key
if (!process.env.GOOGLE_GENAI_API_KEY) {
  console.error('❌ Error: GOOGLE_GENAI_API_KEY not found in environment variables');
  process.exit(1);
}

// Initialize the client
const genAI = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY });

// Define test tools for prompt engineering
const weatherTool = {
  name: 'get_weather',
  description: 'Get the current weather for a location',
  parameters: {
    location: 'string (required) - The city and country, e.g. San Francisco, USA',
    unit: 'string (optional) - Temperature unit: celsius or fahrenheit'
  }
};

const calculatorTool = {
  name: 'calculate',
  description: 'Perform mathematical calculations',
  parameters: {
    operation: 'string (required) - The operation: add, subtract, multiply, divide',
    a: 'number (required) - First number',
    b: 'number (required) - Second number'
  }
};

async function testFunctionCallPrompt() {
  console.log('📝 Test 1: Function Call via Prompt Engineering');
  try {
    const prompt = `You are an AI assistant with access to tools. When you need to use a tool, respond with a JSON object in this format:
{
  "tool": "tool_name",
  "parameters": { ... }
}

Available tools:
${JSON.stringify([weatherTool], null, 2)}

User request: What's the weather in Paris, France?`;

    const result = await genAI.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt
    });

    const responseText = result.text || '';
    console.log('✅ Response:', responseText);
    
    // Check if response contains tool call
    if (responseText.includes('"tool"') && responseText.includes('get_weather')) {
      console.log('✅ Tool call detected in response');
      
      // Try to extract JSON
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const toolCall = JSON.parse(jsonMatch[0]);
          console.log('✅ Parsed tool call:', JSON.stringify(toolCall, null, 2));
          return true;
        } catch (e) {
          console.log('⚠️  Could not parse JSON from response');
        }
      }
    }
    
    return false;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

async function testMultipleToolsPrompt() {
  console.log('\n📝 Test 2: Multiple Tools Selection');
  try {
    const prompt = `You are an AI assistant with access to tools. When you need to use a tool, respond with a JSON object.

Available tools:
${JSON.stringify([weatherTool, calculatorTool], null, 2)}

User request: Calculate 25 times 4`;

    const result = await genAI.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt
    });

    const responseText = result.text || '';
    console.log('✅ Response:', responseText);
    
    if (responseText.includes('calculate') && responseText.includes('"tool"')) {
      console.log('✅ Correct tool selected');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

async function testStructuredOutput() {
  console.log('\n📝 Test 3: Structured Output for Tool Calls');
  try {
    const schema = {
      type: 'object',
      properties: {
        tool: { type: 'string' },
        parameters: {
          type: 'object',
          properties: {
            operation: { type: 'string' },
            a: { type: 'number' },
            b: { type: 'number' }
          }
        }
      }
    };

    const result = await genAI.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: 'I need to calculate 15 plus 27. Use the calculate tool.',
      config: {
        response_mime_type: 'application/json',
        response_schema: schema
      }
    });

    const responseText = result.text || '';
    console.log('✅ Structured response:', responseText);
    
    try {
      const parsed = JSON.parse(responseText);
      console.log('✅ Parsed response:', JSON.stringify(parsed, null, 2));
      return parsed.tool === 'calculate';
    } catch (e) {
      console.log('❌ Failed to parse JSON response');
      return false;
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

async function testToolChaining() {
  console.log('\n📝 Test 4: Tool Response Handling');
  try {
    // First, get a tool call
    const prompt1 = `You need to calculate 15 + 27. Respond with a tool call in JSON format.
Available tool: ${JSON.stringify(calculatorTool)}`;

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result1 = await model.generateContent(prompt1);

    console.log('✅ Tool call request:', result1.text || '');

    // Simulate tool execution and send response
    const prompt2 = `The calculate tool returned: { "result": 42 }
Now provide the final answer to the user.`;

    const result2 = await genAI.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt2
    });

    console.log('✅ Final response:', result2.text || '');
    
    const finalText = result2.text || '';
    return finalText.includes('42');
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

async function testNativeGoogleSearch() {
  console.log('\n📝 Test 5: Native Google Search (if available)');
  try {
    // Test if Google Search grounding works
    const result = await genAI.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: 'What is the current weather in Tokyo?',
      config: {
        tools: [{ google_search_retrieval: {} }]
      }
    });

    console.log('✅ Response:', result.text || 'No response');
    
    // Check for grounding metadata
    if (result.groundingMetadata || result.citations) {
      console.log('✅ Google Search grounding detected');
      console.log('Grounding metadata:', result.groundingMetadata);
      return true;
    } else {
      console.log('ℹ️  No grounding metadata found - Google Search may not be available');
      return false;
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('Starting function calling tests for @google/genai...\n');
  console.log('Note: @google/genai has limited function calling support compared to @google/generative-ai\n');
  
  const tests = [
    testFunctionCallPrompt,
    testMultipleToolsPrompt,
    testStructuredOutput,
    testToolChaining,
    testNativeGoogleSearch
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    const result = await test();
    if (result) passed++;
    else failed++;
  }
  
  console.log('\n📊 Test Summary:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Total: ${tests.length}`);
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed! Function calling workarounds are working.');
  } else {
    console.log('\n⚠️  Some tests failed. This is expected as @google/genai has limited function calling support.');
    console.log('Consider using prompt engineering or structured output for tool-like functionality.');
  }
}

// Run tests
runAllTests().catch(console.error);