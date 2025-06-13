#!/usr/bin/env node

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env.local
dotenv.config({ path: join(__dirname, '.env.local') });

console.log('=== TEST GENKIT INIT ===');
console.log('GOOGLE_GENAI_API_KEY:', process.env.GOOGLE_GENAI_API_KEY?.substring(0, 10) + '...');

// Now import genkit after env is loaded
const { ai } = await import('./src/ai/genkit.ts');
const { generateWorkflowOverview } = await import('./src/ai/flows/generate-workflow-overview-flow.ts');

console.log('\nGenkit AI object loaded:', !!ai);
console.log('generateWorkflowOverview function loaded:', !!generateWorkflowOverview);

const testInput = {
  workflowName: "Test Workflow",
  workflowDescription: "A test workflow for debugging",
  stages: [
    { title: "Stage 1", description: "First stage" }
  ]
};

console.log('\nCalling generateWorkflowOverview with 20s timeout...');

try {
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Timeout after 20 seconds')), 20000);
  });
  
  const result = await Promise.race([
    generateWorkflowOverview(testInput),
    timeoutPromise
  ]);
  
  console.log('\nSUCCESS!');
  console.log('Result:', JSON.stringify(result, null, 2));
} catch (error) {
  console.error('\nERROR:', error.message);
  console.error('Stack:', error.stack);
}

process.exit(0);