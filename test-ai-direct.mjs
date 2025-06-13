#!/usr/bin/env node

import 'dotenv/config';

console.log('=== TEST AI DIRECT START ===');
console.log('Time:', new Date().toISOString());
console.log('GOOGLE_GENAI_API_KEY exists:', !!process.env.GOOGLE_GENAI_API_KEY);
console.log('GOOGLE_GENAI_API_KEY length:', process.env.GOOGLE_GENAI_API_KEY?.length || 0);

// Import after env is loaded
const { generateWorkflowOverview } = await import('./src/ai/flows/generate-workflow-overview-flow.ts');

const testInput = {
  workflowName: "Test Workflow",
  workflowDescription: "A test workflow for debugging",
  stages: [
    { title: "Stage 1", description: "First stage" },
    { title: "Stage 2", description: "Second stage" }
  ]
};

console.log('\nTest input:', JSON.stringify(testInput, null, 2));

try {
  console.log('\nCalling generateWorkflowOverview...');
  const startTime = Date.now();
  
  // Set a hard timeout
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => {
      console.error('\n!!! TIMEOUT: AI call took longer than 15 seconds !!!');
      reject(new Error('Timeout after 15 seconds'));
    }, 15000);
  });
  
  const result = await Promise.race([
    generateWorkflowOverview(testInput),
    timeoutPromise
  ]);
  
  const endTime = Date.now();
  console.log('\nSUCCESS! Time taken:', endTime - startTime, 'ms');
  console.log('Result:', JSON.stringify(result, null, 2));
  
} catch (error) {
  console.error('\nERROR:', error.message);
  console.error('Error type:', error.constructor.name);
  console.error('Stack:', error.stack);
}

console.log('\n=== TEST AI DIRECT END ===');
process.exit(0);