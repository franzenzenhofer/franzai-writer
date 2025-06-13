#!/usr/bin/env node
import fetch from 'node-fetch';

const API_KEY = 'AIzaSyCEglZ6yyEbtSWdLLZ5JgBW2Jh2A4OTKMk';

const models = [
  'gemini-pro',
  'gemini-pro-vision',
  'gemini-1.5-pro',
  'gemini-1.5-pro-latest',
  'gemini-1.5-flash',
  'gemini-1.5-flash-latest',
  'gemini-2.0-flash-exp',
  'gemini-exp-1206',
  'gemini-exp-1121',
  'gemini-exp-1114'
];

async function testModel(model) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`;
  
  const body = {
    contents: [{
      parts: [{
        text: "What model are you and what's your version? Reply in one short sentence."
      }]
    }]
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000); // 20 second timeout

  try {
    console.log(`\n🔄 Testing ${model}...`);
    const startTime = Date.now();
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: controller.signal
    });

    clearTimeout(timeout);
    const elapsed = Date.now() - startTime;

    if (response.ok) {
      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response text';
      console.log(`✅ ${model} - SUCCESS (${elapsed}ms)`);
      console.log(`   Response: ${text.trim()}`);
      return { model, status: 'success', response: text.trim(), time: elapsed };
    } else {
      const error = await response.text();
      console.log(`❌ ${model} - FAILED (${response.status})`);
      console.log(`   Error: ${error.substring(0, 100)}...`);
      return { model, status: 'failed', error: response.status, message: error };
    }
  } catch (error) {
    clearTimeout(timeout);
    console.log(`❌ ${model} - ERROR`);
    console.log(`   Error: ${error.message}`);
    return { model, status: 'error', error: error.message };
  }
}

async function main() {
  console.log('🚀 Testing Gemini Models with API Key');
  console.log(`📅 Date: ${new Date().toISOString()}`);
  console.log(`🔑 API Key: ${API_KEY.substring(0, 10)}...`);
  console.log('⏱️  Timeout: 20 seconds per model\n');

  const results = [];
  
  for (const model of models) {
    const result = await testModel(model);
    results.push(result);
  }

  console.log('\n\n📊 Summary:');
  console.log('=' .repeat(50));
  
  const successful = results.filter(r => r.status === 'success');
  const failed = results.filter(r => r.status !== 'success');
  
  console.log(`\n✅ Working Models (${successful.length}):`);
  successful.forEach(r => {
    console.log(`   - ${r.model} (${r.time}ms)`);
  });
  
  console.log(`\n❌ Failed Models (${failed.length}):`);
  failed.forEach(r => {
    console.log(`   - ${r.model}: ${r.error || r.message?.substring(0, 50)}`);
  });
}

main().catch(console.error);