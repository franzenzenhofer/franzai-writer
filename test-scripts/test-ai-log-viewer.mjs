#!/usr/bin/env node

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:9002';

async function generateTestLogs() {
  console.log('Generating test logs...');
  
  const testEntries = [
    {
      level: 'info',
      category: 'ai-request',
      message: 'AI Request to gemini-2.0-flash',
      data: {
        model: 'gemini-2.0-flash',
        temperature: 0.7,
        promptLength: 1500,
        hasGrounding: true
      },
      model: 'gemini-2.0-flash'
    },
    {
      level: 'info',
      category: 'ai-response',
      message: 'AI Response from gemini-2.0-flash',
      data: {
        contentLength: 2500,
        hasGroundingMetadata: true,
        groundingSourcesCount: 3,
        finishReason: 'STOP'
      },
      model: 'gemini-2.0-flash',
      tokenCount: 1250,
      duration: 1834
    },
    {
      level: 'warning',
      category: 'grounding',
      message: 'Grounding source validation warning',
      data: {
        searchQueries: ['Next.js best practices', 'React performance optimization'],
        chunksCount: 5,
        supportsCount: 3
      }
    },
    {
      level: 'error',
      category: 'ai-request',
      message: 'Failed to process AI request',
      data: {
        error: 'Rate limit exceeded',
        model: 'gemini-2.0-flash',
        retryAfter: 60
      },
      model: 'gemini-2.0-flash'
    },
    {
      level: 'debug',
      category: 'thinking',
      message: 'Thinking mode analysis',
      data: {
        stepsCount: 12,
        thinkingTokens: 450,
        totalTokens: 2100
      },
      tokenCount: 2100
    },
    {
      level: 'info',
      category: 'image-generation',
      message: 'Image generation request',
      data: {
        model: 'imagen-3.0-generate-002',
        aspectRatio: '16:9',
        numberOfImages: 2,
        prompt: 'A serene landscape with mountains and a lake at sunset'
      },
      model: 'imagen-3.0-generate-002'
    },
    {
      level: 'info',
      category: 'image-generation',
      message: 'Image generation completed',
      data: {
        model: 'imagen-3.0-generate-002',
        successCount: 2,
        filenames: ['serene-mountain-lake-sunset-1.png', 'serene-mountain-lake-sunset-2.png']
      },
      model: 'imagen-3.0-generate-002',
      duration: 3420
    }
  ];
  
  // Send test logs with delays to simulate real activity
  for (const entry of testEntries) {
    try {
      const response = await fetch(`${BASE_URL}/api/debug/ai-log-stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(entry)
      });
      
      const result = await response.json();
      console.log(`✅ Generated ${entry.level} log: ${entry.message}`);
      
      // Wait a bit between logs to simulate real timing
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`❌ Failed to generate log:`, error);
    }
  }
  
  console.log('\n✨ Test logs generated successfully!');
  console.log(`\n📊 Visit http://localhost:9002/debug/ai-log-viewer to view the logs`);
}

// Run the test
if (import.meta.url === `file://${process.argv[1]}`) {
  generateTestLogs().catch(console.error);
}