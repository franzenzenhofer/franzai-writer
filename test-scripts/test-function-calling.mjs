#!/usr/bin/env node

/**
 * Test script for function calling / tools
 * Tests various tool definitions and executions
 */

import 'dotenv/config';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';

console.log('🚀 Testing Function Calling with Google Generative AI\n');

// Check API key
if (!process.env.GOOGLE_GENAI_API_KEY) {
  console.error('❌ Error: GOOGLE_GENAI_API_KEY not found in environment variables');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY);

// Define test tools
const weatherTool = {
  name: 'get_weather',
  description: 'Get the current weather for a location',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      location: {
        type: SchemaType.STRING,
        description: 'The city and country, e.g. San Francisco, USA'
      },
      unit: {
        type: SchemaType.STRING,
        enum: ['celsius', 'fahrenheit'],
        description: 'Temperature unit'
      }
    },
    required: ['location']
  }
};

const calculatorTool = {
  name: 'calculate',
  description: 'Perform mathematical calculations',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      operation: {
        type: SchemaType.STRING,
        enum: ['add', 'subtract', 'multiply', 'divide'],
        description: 'The mathematical operation'
      },
      a: {
        type: SchemaType.NUMBER,
        description: 'First number'
      },
      b: {
        type: SchemaType.NUMBER,
        description: 'Second number'
      }
    },
    required: ['operation', 'a', 'b']
  }
};

const searchTool = {
  name: 'search_web',
  description: 'Search the web for information',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      query: {
        type: SchemaType.STRING,
        description: 'Search query'
      },
      limit: {
        type: SchemaType.NUMBER,
        description: 'Number of results to return',
        default: 5
      }
    },
    required: ['query']
  }
};

async function testSingleToolCall() {
  console.log('📝 Test 1: Single Tool Call');
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      tools: [{
        functionDeclarations: [weatherTool]
      }]
    });

    const result = await model.generateContent('What\'s the weather in Paris, France?');
    const response = await result.response;
    
    // Check for function calls
    const functionCalls = [];
    for (const candidate of response.candidates || []) {
      for (const part of candidate.content?.parts || []) {
        if (part.functionCall) {
          functionCalls.push(part.functionCall);
        }
      }
    }

    console.log('✅ Function calls:', JSON.stringify(functionCalls, null, 2));
    console.log('✅ Text response:', response.text());
    return functionCalls.length > 0;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

async function testMultipleTools() {
  console.log('\n📝 Test 2: Multiple Tools Available');
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      tools: [{
        functionDeclarations: [weatherTool, calculatorTool, searchTool]
      }]
    });

    const result = await model.generateContent('Calculate 25 times 4');
    const response = await result.response;
    
    const functionCalls = [];
    for (const candidate of response.candidates || []) {
      for (const part of candidate.content?.parts || []) {
        if (part.functionCall) {
          functionCalls.push(part.functionCall);
        }
      }
    }

    console.log('✅ Function calls:', JSON.stringify(functionCalls, null, 2));
    console.log('✅ Correct tool selected:', 
      functionCalls.some(call => call.name === 'calculate')
    );
    return functionCalls.length > 0;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

async function testParallelCalls() {
  console.log('\n📝 Test 3: Parallel Function Calls');
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      tools: [{
        functionDeclarations: [weatherTool]
      }]
    });

    const result = await model.generateContent(
      'What\'s the weather in both New York and London?'
    );
    const response = await result.response;
    
    const functionCalls = [];
    for (const candidate of response.candidates || []) {
      for (const part of candidate.content?.parts || []) {
        if (part.functionCall) {
          functionCalls.push(part.functionCall);
        }
      }
    }

    console.log('✅ Function calls:', JSON.stringify(functionCalls, null, 2));
    console.log('✅ Multiple calls made:', functionCalls.length >= 2);
    return functionCalls.length >= 2;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

async function testFunctionResponse() {
  console.log('\n📝 Test 4: Function Response Handling');
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      tools: [{
        functionDeclarations: [calculatorTool]
      }]
    });

    // First call to get function request
    const result = await model.generateContent('What is 15 plus 27?');
    const response = await result.response;
    
    const functionCalls = [];
    for (const candidate of response.candidates || []) {
      for (const part of candidate.content?.parts || []) {
        if (part.functionCall) {
          functionCalls.push(part.functionCall);
        }
      }
    }

    if (functionCalls.length === 0) {
      console.log('❌ No function calls made');
      return false;
    }

    // Simulate function execution
    const call = functionCalls[0];
    const mockResult = call.args.a + call.args.b;
    
    // Send function response back
    const chat = model.startChat();
    await chat.sendMessage('What is 15 plus 27?');
    
    const functionResponse = await chat.sendMessage([{
      functionResponse: {
        name: call.name,
        response: { result: mockResult }
      }
    }]);

    console.log('✅ Function call:', JSON.stringify(call, null, 2));
    console.log('✅ Mock result:', mockResult);
    console.log('✅ Final response:', functionResponse.response.text());
    return true;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

async function testComplexParameters() {
  console.log('\n📝 Test 5: Complex Parameter Types');
  try {
    const complexTool = {
      name: 'create_event',
      description: 'Create a calendar event',
      parameters: {
        type: SchemaType.OBJECT,
        properties: {
          title: { type: SchemaType.STRING },
          date: { type: SchemaType.STRING },
          attendees: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING }
          },
          details: {
            type: SchemaType.OBJECT,
            properties: {
              location: { type: SchemaType.STRING },
              duration: { type: SchemaType.NUMBER },
              isOnline: { type: SchemaType.BOOLEAN }
            }
          }
        },
        required: ['title', 'date']
      }
    };

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      tools: [{
        functionDeclarations: [complexTool]
      }]
    });

    const result = await model.generateContent(
      'Create a team meeting for tomorrow at 2pm with Alice and Bob at the office for 1 hour'
    );
    const response = await result.response;
    
    const functionCalls = [];
    for (const candidate of response.candidates || []) {
      for (const part of candidate.content?.parts || []) {
        if (part.functionCall) {
          functionCalls.push(part.functionCall);
        }
      }
    }

    console.log('✅ Function calls:', JSON.stringify(functionCalls, null, 2));
    const hasComplexParams = functionCalls.some(call => 
      call.args.attendees && Array.isArray(call.args.attendees)
    );
    console.log('✅ Complex parameters handled:', hasComplexParams);
    return functionCalls.length > 0;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('Starting all function calling tests...\n');
  
  const tests = [
    testSingleToolCall,
    testMultipleTools,
    testParallelCalls,
    testFunctionResponse,
    testComplexParameters
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
    console.log('\n🎉 All tests passed! Function calling is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the errors above.');
  }
}

// Run tests
runAllTests().catch(console.error);