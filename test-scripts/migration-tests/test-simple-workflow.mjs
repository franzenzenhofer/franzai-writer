#!/usr/bin/env node

/**
 * Simple test to verify the new SDK integration works
 */

import 'dotenv/config';

async function testWorkflow() {
  console.log('🚀 Testing new SDK integration...\n');
  
  const baseUrl = 'http://localhost:9002';
  
  try {
    // Test the API directly
    console.log('Testing API endpoint...');
    const response = await fetch(`${baseUrl}/api/test-simple`, {
      method: 'GET'
    });
    
    if (!response.ok) {
      console.error('❌ API test failed:', response.status, response.statusText);
      return;
    }
    
    const data = await response.json();
    console.log('✅ API Response:', data);
    
    // Test AI generation through new SDK
    console.log('\nTesting AI generation...');
    const aiResponse = await fetch(`${baseUrl}/api/ai/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: 'Write a haiku about coding',
        model: 'gemini-2.0-flash',
        config: {
          temperature: 0.7
        }
      })
    });
    
    if (!aiResponse.ok) {
      console.error('❌ AI generation failed:', aiResponse.status, aiResponse.statusText);
      return;
    }
    
    console.log('✅ AI streaming endpoint working');
    
    // Read streaming response
    const reader = aiResponse.body.getReader();
    const decoder = new TextDecoder();
    let fullText = '';
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            console.log('\n✅ Stream complete');
            console.log('Generated haiku:', fullText);
            return;
          }
          
          try {
            const parsed = JSON.parse(data);
            if (parsed.text) {
              fullText += parsed.text;
              process.stdout.write(parsed.text);
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testWorkflow();