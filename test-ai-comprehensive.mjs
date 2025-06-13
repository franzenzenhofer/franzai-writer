#!/usr/bin/env node

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env.local
dotenv.config({ path: join(__dirname, '.env.local') });

const TEST_REPORT = {
  timestamp: new Date().toISOString(),
  environment: {
    nodeVersion: process.version,
    platform: process.platform,
    apiKeyLoaded: !!process.env.GOOGLE_GENAI_API_KEY,
    apiKeyPrefix: process.env.GOOGLE_GENAI_API_KEY?.substring(0, 10) + '...',
    useEmulator: process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR,
  },
  tests: []
};

function log(message, data = null) {
  const logEntry = `[${new Date().toISOString()}] ${message}`;
  console.log(logEntry);
  if (data) {
    console.log(JSON.stringify(data, null, 2));
  }
}

async function testDirectAI() {
  log('=== TEST 1: Direct AI Call (via Genkit) ===');
  const testStart = Date.now();
  
  try {
    const { generateWorkflowOverview } = await import('./src/ai/flows/generate-workflow-overview-flow.ts');
    
    const input = {
      workflowName: "Test Workflow",
      workflowDescription: "A test workflow for debugging",
      stages: [
        { title: "Stage 1", description: "First stage" },
        { title: "Stage 2", description: "Second stage" }
      ]
    };
    
    log('Calling generateWorkflowOverview directly...');
    const result = await generateWorkflowOverview(input);
    
    const duration = Date.now() - testStart;
    log(`SUCCESS in ${duration}ms`, result);
    
    TEST_REPORT.tests.push({
      name: 'Direct AI Call',
      success: true,
      duration,
      result
    });
    
  } catch (error) {
    const duration = Date.now() - testStart;
    log(`ERROR after ${duration}ms:`, {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    
    TEST_REPORT.tests.push({
      name: 'Direct AI Call',
      success: false,
      duration,
      error: {
        message: error.message,
        code: error.code,
        type: error.constructor.name
      }
    });
  }
}

async function testAPIRoute() {
  log('\n=== TEST 2: API Route Call ===');
  const testStart = Date.now();
  
  try {
    const requestBody = {
      workflowName: "API Test Workflow",
      workflowDescription: "Testing via API route",
      stages: [
        { title: "API Stage 1", description: "First API stage" }
      ]
    };
    
    log('Calling API route http://localhost:9002/api/workflow-overview');
    log('Request body:', requestBody);
    
    const response = await fetch('http://localhost:9002/api/workflow-overview', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });
    
    const duration = Date.now() - testStart;
    const data = await response.json();
    
    log(`Response status: ${response.status} ${response.statusText}`);
    log(`Response time: ${duration}ms`);
    log('Response data:', data);
    
    TEST_REPORT.tests.push({
      name: 'API Route Call',
      success: response.ok,
      duration,
      status: response.status,
      statusText: response.statusText,
      result: data
    });
    
  } catch (error) {
    const duration = Date.now() - testStart;
    log(`ERROR after ${duration}ms:`, {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    
    TEST_REPORT.tests.push({
      name: 'API Route Call',
      success: false,
      duration,
      error: {
        message: error.message,
        code: error.code,
        type: error.constructor.name
      }
    });
  }
}

async function testFirebaseConnection() {
  log('\n=== TEST 3: Firebase Connection Status ===');
  const testStart = Date.now();
  
  try {
    // Check if emulators are running
    const authEmulatorUrl = `http://${process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST || 'localhost:9099'}`;
    const firestoreEmulatorUrl = 'http://localhost:8080';
    
    log('Checking Auth emulator at:', authEmulatorUrl);
    try {
      const authResponse = await fetch(authEmulatorUrl);
      log(`Auth emulator status: ${authResponse.status}`);
      TEST_REPORT.tests.push({
        name: 'Auth Emulator Check',
        success: authResponse.ok,
        status: authResponse.status,
        url: authEmulatorUrl
      });
    } catch (e) {
      log('Auth emulator NOT RUNNING:', e.message);
      TEST_REPORT.tests.push({
        name: 'Auth Emulator Check',
        success: false,
        error: e.message,
        url: authEmulatorUrl
      });
    }
    
    log('Checking Firestore emulator at:', firestoreEmulatorUrl);
    try {
      const firestoreResponse = await fetch(firestoreEmulatorUrl);
      log(`Firestore emulator status: ${firestoreResponse.status}`);
      TEST_REPORT.tests.push({
        name: 'Firestore Emulator Check',
        success: firestoreResponse.ok,
        status: firestoreResponse.status,
        url: firestoreEmulatorUrl
      });
    } catch (e) {
      log('Firestore emulator NOT RUNNING:', e.message);
      TEST_REPORT.tests.push({
        name: 'Firestore Emulator Check',
        success: false,
        error: e.message,
        url: firestoreEmulatorUrl
      });
    }
    
  } catch (error) {
    log('Firebase connection test error:', error.message);
    TEST_REPORT.tests.push({
      name: 'Firebase Connection Test',
      success: false,
      error: error.message
    });
  }
}

async function generateReport() {
  log('\n=== GENERATING TEST REPORT ===');
  
  const reportPath = join(__dirname, 'logs', `ai-test-report-${Date.now()}.json`);
  await fs.mkdir(join(__dirname, 'logs'), { recursive: true });
  await fs.writeFile(reportPath, JSON.stringify(TEST_REPORT, null, 2));
  
  log(`Report saved to: ${reportPath}`);
  
  // Print summary
  console.log('\n========== TEST SUMMARY ==========');
  console.log(`Total tests: ${TEST_REPORT.tests.length}`);
  console.log(`Successful: ${TEST_REPORT.tests.filter(t => t.success).length}`);
  console.log(`Failed: ${TEST_REPORT.tests.filter(t => !t.success).length}`);
  console.log('\nTest Results:');
  TEST_REPORT.tests.forEach(test => {
    const status = test.success ? '✅' : '❌';
    const info = test.duration ? ` (${test.duration}ms)` : '';
    console.log(`${status} ${test.name}${info}`);
    if (!test.success && test.error) {
      console.log(`   Error: ${test.error.message || test.error}`);
    }
  });
  console.log('==================================\n');
}

// Run all tests
async function runAllTests() {
  console.log('🔍 COMPREHENSIVE AI TEST SCRIPT');
  console.log('================================\n');
  
  await testFirebaseConnection();
  await testDirectAI();
  await testAPIRoute();
  await generateReport();
  
  process.exit(0);
}

runAllTests().catch(error => {
  console.error('Test runner failed:', error);
  process.exit(1);
});