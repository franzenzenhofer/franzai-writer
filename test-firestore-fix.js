#!/usr/bin/env node

/**
 * Test script to verify Firestore nested entity fix
 * Run this to test if our stage state cleaning prevents nested entity errors
 */

const { documentPersistence } = require('./src/lib/document-persistence.ts');

// Mock complex stage state that previously caused nested entity errors
const mockComplexStageState = {
  stageId: 'test-stage',
  status: 'completed',
  userInput: 'Simple user input',
  output: {
    title: 'Test Poem',
    poem: 'A simple test poem\nWith line breaks',
    // Complex nested objects that cause issues
    groundingMetadata: {
      searchEntryPoint: {
        renderedContent: 'Complex search content with deep nesting',
        metadata: {
          level1: {
            level2: {
              level3: {
                level4: 'This would cause nested entity errors'
              }
            }
          }
        }
      },
      groundingChunks: [
        {
          web: {
            title: 'Some web title',
            uri: 'https://example.com',
            snippet: 'Content snippet',
            metadata: {
              deep: {
                nested: {
                  object: 'value'
                }
              }
            }
          }
        }
      ]
    },
    functionCalls: [
      {
        toolName: 'test-tool',
        input: {
          complex: {
            nested: {
              data: 'value'
            }
          }
        },
        output: {
          result: {
            deep: {
              nesting: {
                here: 'causes problems'
              }
            }
          }
        }
      }
    ],
    thinkingSteps: [
      {
        type: 'textLog',
        message: 'Thinking step',
        metadata: {
          complex: {
            nested: {
              thinking: 'data'
            }
          }
        }
      }
    ]
  },
  completedAt: new Date().toISOString()
};

async function testFirestoreFix() {
  console.log('🧪 Testing Firestore nested entity fix...');
  
  try {
    // Test document persistence with complex nested data
    const result = await documentPersistence.saveDocument(
      null, // New document
      'Test Poem - Firestore Fix Test',
      'poem-generator',
      {
        'test-stage': mockComplexStageState
      }
    );
    
    if (result.success) {
      console.log('✅ SUCCESS: Document saved without nested entity errors!');
      console.log(`📄 Document ID: ${result.documentId}`);
      
      // Test loading the document back
      const loadResult = await documentPersistence.loadDocument(result.documentId);
      if (loadResult.success) {
        console.log('✅ SUCCESS: Document loaded successfully!');
        console.log('📋 Stage states keys:', Object.keys(loadResult.stageStates || {}));
      } else {
        console.log('❌ FAILED: Could not load document:', loadResult.error);
      }
    } else {
      console.log('❌ FAILED: Document save failed:', result.error);
    }
  } catch (error) {
    console.log('❌ FAILED: Test threw error:', error.message);
    console.log('Stack:', error.stack);
  }
}

// Run the test
testFirestoreFix().then(() => {
  console.log('🏁 Test completed');
  process.exit(0);
}).catch(error => {
  console.log('💥 Test crashed:', error);
  process.exit(1);
});