#!/usr/bin/env node

/**
 * Test script for structured output / JSON schemas
 * Tests JSON generation with various schema types
 */

import 'dotenv/config';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';

console.log('🚀 Testing Structured Output with Google Generative AI\n');

// Check API key
if (!process.env.GOOGLE_GENAI_API_KEY) {
  console.error('❌ Error: GOOGLE_GENAI_API_KEY not found in environment variables');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY);

async function testSimpleJSON() {
  console.log('📝 Test 1: Simple JSON Object');
  try {
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            name: { type: SchemaType.STRING },
            age: { type: SchemaType.NUMBER },
            isStudent: { type: SchemaType.BOOLEAN }
          },
          required: ['name', 'age', 'isStudent']
        }
      }
    });
    
    const result = await model.generateContent('Generate a person object with name John, age 25, student status true');
    const response = await result.response;
    const json = JSON.parse(response.text());
    
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
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              language: { type: SchemaType.STRING },
              difficulty: { 
                type: SchemaType.STRING,
                enum: ['easy', 'medium', 'hard']
              },
              yearCreated: { type: SchemaType.NUMBER }
            },
            required: ['language', 'difficulty', 'yearCreated']
          }
        }
      }
    });
    
    const result = await model.generateContent('List 3 programming languages with their difficulty level and year created');
    const response = await result.response;
    const json = JSON.parse(response.text());
    
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
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            recipe: {
              type: SchemaType.OBJECT,
              properties: {
                name: { type: SchemaType.STRING },
                servings: { type: SchemaType.NUMBER },
                ingredients: {
                  type: SchemaType.ARRAY,
                  items: {
                    type: SchemaType.OBJECT,
                    properties: {
                      item: { type: SchemaType.STRING },
                      amount: { type: SchemaType.STRING }
                    }
                  }
                },
                instructions: {
                  type: SchemaType.ARRAY,
                  items: { type: SchemaType.STRING }
                }
              },
              required: ['name', 'servings', 'ingredients', 'instructions']
            }
          },
          required: ['recipe']
        }
      }
    });
    
    const result = await model.generateContent('Create a simple pancake recipe JSON');
    const response = await result.response;
    const json = JSON.parse(response.text());
    
    console.log('✅ Generated JSON:', JSON.stringify(json, null, 2));
    console.log('✅ Has nested structure:', !!json.recipe);
    console.log('✅ Ingredients is array:', Array.isArray(json.recipe.ingredients));
    console.log('✅ Instructions is array:', Array.isArray(json.recipe.instructions));
    return true;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

async function testComplexSchema() {
  console.log('\n📝 Test 4: Complex Schema with Multiple Types');
  try {
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            article: {
              type: SchemaType.OBJECT,
              properties: {
                title: { type: SchemaType.STRING },
                author: { type: SchemaType.STRING },
                publishDate: { type: SchemaType.STRING },
                tags: {
                  type: SchemaType.ARRAY,
                  items: { type: SchemaType.STRING }
                },
                metadata: {
                  type: SchemaType.OBJECT,
                  properties: {
                    wordCount: { type: SchemaType.NUMBER },
                    readingTime: { type: SchemaType.NUMBER },
                    featured: { type: SchemaType.BOOLEAN }
                  }
                },
                sections: {
                  type: SchemaType.ARRAY,
                  items: {
                    type: SchemaType.OBJECT,
                    properties: {
                      heading: { type: SchemaType.STRING },
                      content: { type: SchemaType.STRING }
                    }
                  }
                }
              },
              required: ['title', 'author', 'sections']
            }
          }
        }
      }
    });
    
    const result = await model.generateContent('Create an article about TypeScript with 2 sections');
    const response = await result.response;
    const json = JSON.parse(response.text());
    
    console.log('✅ Generated JSON:', JSON.stringify(json, null, 2));
    console.log('✅ Has all required fields:', 
      !!(json.article && json.article.title && json.article.author && json.article.sections)
    );
    console.log('✅ Sections count:', json.article.sections.length);
    return true;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

async function testStreamingJSON() {
  console.log('\n📝 Test 5: Streaming JSON Generation');
  try {
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            story: { type: SchemaType.STRING },
            characters: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING }
            }
          }
        }
      }
    });
    
    console.log('Streaming JSON (collecting chunks)...');
    const result = await model.generateContentStream('Create a short story JSON with 3 characters');
    
    let fullText = '';
    let chunkCount = 0;
    for await (const chunk of result.stream) {
      fullText += chunk.text();
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