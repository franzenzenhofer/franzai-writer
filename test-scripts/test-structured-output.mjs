#!/usr/bin/env node

/**
 * Test script for structured output / JSON schemas
 * Tests JSON generation with various schema types
 */

import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';

console.log('🚀 Testing Structured Output with Google GenAI (@google/genai)\n');

// Check API key
if (!process.env.GOOGLE_GENAI_API_KEY) {
  console.error('❌ Error: GOOGLE_GENAI_API_KEY not found in environment variables');
  process.exit(1);
}

const genAI = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY });

async function testSimpleJSON() {
  console.log('📝 Test 1: Simple JSON Object');
  try {
    const schema = {
      type: 'object',
      properties: {
        name: { type: 'string' },
        age: { type: 'number' },
        isStudent: { type: 'boolean' }
      },
      required: ['name', 'age', 'isStudent']
    };
    
    const result = await genAI.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: 'Generate a person object with name John, age 25, student status true',
      config: {
        responseMimeType: 'application/json',
        responseSchema: schema
      }
    });
    
    const json = JSON.parse(result.text || '{}');
    
    console.log('✅ Generated JSON:', JSON.stringify(json, null, 2));
    console.log('✅ Type validation:', {
      nameIsString: typeof json.name === 'string',
      ageIsNumber: typeof json.age === 'number',
      isStudentIsBoolean: typeof json.isStudent === 'boolean'
    });
    return true;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

async function testArrayJSON() {
  console.log('\n📝 Test 2: Array of Objects');
  try {
    const schema = {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          language: { type: 'string' },
          difficulty: { 
            type: 'string',
            enum: ['easy', 'medium', 'hard']
          },
          yearCreated: { type: 'number' }
        },
        required: ['language', 'difficulty', 'yearCreated']
      }
    };
    
    const result = await genAI.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: 'List 3 programming languages with their difficulty level and year created',
      config: {
        responseMimeType: 'application/json',
        responseSchema: schema
      }
    });
    
    const json = JSON.parse(result.text || '[]');
    
    console.log('✅ Generated JSON:', JSON.stringify(json, null, 2));
    console.log('✅ Array length:', json.length);
    console.log('✅ All items have required fields:', 
      json.every(item => item.language && item.difficulty && item.yearCreated)
    );
    return true;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

async function testNestedJSON() {
  console.log('\n📝 Test 3: Nested Objects');
  try {
    const schema = {
      type: 'object',
      properties: {
        recipe: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            servings: { type: 'number' },
            ingredients: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  item: { type: 'string' },
                  amount: { type: 'string' }
                }
              }
            },
            instructions: {
              type: 'array',
              items: { type: 'string' }
            }
          },
          required: ['name', 'servings', 'ingredients', 'instructions']
        }
      },
      required: ['recipe']
    };
    
    const result = await genAI.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: 'Create a simple pancake recipe JSON',
      config: {
        responseMimeType: 'application/json',
        responseSchema: schema
      }
    });
    
    const json = JSON.parse(result.text || '{}');
    
    console.log('✅ Generated JSON:', JSON.stringify(json, null, 2));
    console.log('✅ Has nested structure:', !!json.recipe);
    console.log('✅ Ingredients is array:', Array.isArray(json.recipe?.ingredients));
    console.log('✅ Instructions is array:', Array.isArray(json.recipe?.instructions));
    return true;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

async function testComplexSchema() {
  console.log('\n📝 Test 4: Complex Schema with Multiple Types');
  try {
    const schema = {
      type: 'object',
      properties: {
        article: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            author: { type: 'string' },
            publishDate: { type: 'string' },
            tags: {
              type: 'array',
              items: { type: 'string' }
            },
            metadata: {
              type: 'object',
              properties: {
                wordCount: { type: 'number' },
                readingTime: { type: 'number' },
                featured: { type: 'boolean' }
              }
            },
            sections: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  heading: { type: 'string' },
                  content: { type: 'string' }
                }
              }
            }
          },
          required: ['title', 'author', 'sections']
        }
      }
    };
    
    const result = await genAI.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: 'Create an article about TypeScript with 2 sections',
      config: {
        responseMimeType: 'application/json',
        responseSchema: schema
      }
    });
    
    const json = JSON.parse(result.text || '{}');
    
    console.log('✅ Generated JSON:', JSON.stringify(json, null, 2));
    console.log('✅ Has all required fields:', 
      !!(json.article && json.article.title && json.article.author && json.article.sections)
    );
    console.log('✅ Sections count:', json.article?.sections?.length);
    return true;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

async function testStreamingJSON() {
  console.log('\n📝 Test 5: Streaming JSON Generation');
  try {
    const schema = {
      type: 'object',
      properties: {
        story: { type: 'string' },
        characters: {
          type: 'array',
          items: { type: 'string' }
        }
      }
    };
    
    console.log('Streaming JSON (collecting chunks)...');
    const result = await genAI.models.generateContentStream({
      model: 'gemini-2.0-flash',
      contents: 'Create a short story JSON with 3 characters',
      config: {
        responseMimeType: 'application/json',
        responseSchema: schema
      }
    });
    
    let fullText = '';
    let chunkCount = 0;
    for await (const chunk of result) {
      fullText += chunk.text || '';
      chunkCount++;
      process.stdout.write('.');
    }
    
    const json = JSON.parse(fullText);
    console.log('\n✅ Collected', chunkCount, 'chunks');
    console.log('✅ Final JSON:', JSON.stringify(json, null, 2));
    console.log('✅ Valid JSON structure:', !!(json.story && json.characters));
    return true;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('Starting all structured output tests...\n');
  
  const tests = [
    testSimpleJSON,
    testArrayJSON,
    testNestedJSON,
    testComplexSchema,
    testStreamingJSON
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
    console.log('\n🎉 All tests passed! Structured output is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the errors above.');
  }
}

// Run tests
runAllTests().catch(console.error);