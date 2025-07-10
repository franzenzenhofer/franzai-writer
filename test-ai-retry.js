/**
 * Simple JavaScript test runner for AI retry functionality
 * This file tests the AI retry logic by importing the compiled version
 */

const { withRetry, withAIRetry, RETRY_CONFIGS, AIRetryError } = require('./src/lib/ai-retry');

// Mock functions for testing
const createMockFunction = (failures, errorType = 'network') => {
  let attempts = 0;
  return async () => {
    attempts++;
    if (attempts <= failures) {
      const error = new Error(`Mock ${errorType} error`);
      switch (errorType) {
        case 'rate_limit':
          error.status = 429;
          error.code = 'rate_limit_exceeded';
          break;
        case 'server_error':
          error.status = 500;
          break;
        case 'network':
          error.code = 'ECONNRESET';
          break;
        case 'timeout':
          error.code = 'timeout';
          break;
        case 'client_error':
          error.status = 400;
          break;
        default:
          break;
      }
      throw error;
    }
    return `Success after ${attempts} attempts`;
  };
};

// Test basic retry functionality
async function testBasicRetry() {
  console.log('🧪 Testing basic retry functionality...');
  
  // Test successful retry after 1 failure
  const fn1 = createMockFunction(1, 'network');
  try {
    const result1 = await withRetry(fn1, { maxAttempts: 3, baseDelay: 10 });
    console.log('✅ Basic retry test passed:', result1);
  } catch (error) {
    console.log('❌ Basic retry test failed:', error.message);
  }
  
  // Test failure after max attempts
  const fn2 = createMockFunction(5, 'network');
  try {
    await withRetry(fn2, { maxAttempts: 3, baseDelay: 10 });
    console.log('❌ Expected error but got success');
  } catch (error) {
    if (error instanceof AIRetryError) {
      console.log('✅ Max attempts test passed:', error.message);
    } else {
      console.log('❌ Unexpected error type:', error.message);
    }
  }
}

// Test different error types
async function testErrorTypes() {
  console.log('🧪 Testing different error types...');
  
  // Test server error (should retry)
  const serverErrorFn = createMockFunction(1, 'server_error');
  try {
    const serverResult = await withRetry(serverErrorFn, { maxAttempts: 2, baseDelay: 10 });
    console.log('✅ Server error retry test passed:', serverResult);
  } catch (error) {
    console.log('❌ Server error retry test failed:', error.message);
  }
  
  // Test client error (should not retry)
  const clientErrorFn = createMockFunction(1, 'client_error');
  try {
    await withRetry(clientErrorFn, { maxAttempts: 3, baseDelay: 10 });
    console.log('❌ Expected error but got success');
  } catch (error) {
    console.log('✅ Client error no-retry test passed:', error.message);
  }
}

// Test configuration scenarios
async function testConfigurationScenarios() {
  console.log('🧪 Testing configuration scenarios...');
  
  // Test CONSERVATIVE config
  const conservativeFn = createMockFunction(1, 'network');
  try {
    const conservativeResult = await withAIRetry(conservativeFn, 'CONSERVATIVE');
    console.log('✅ Conservative config test passed:', conservativeResult);
  } catch (error) {
    console.log('❌ Conservative config test failed:', error.message);
  }
  
  // Test FAST config
  const fastFn = createMockFunction(1, 'network');
  try {
    const fastResult = await withAIRetry(fastFn, 'FAST');
    console.log('✅ Fast config test passed:', fastResult);
  } catch (error) {
    console.log('❌ Fast config test failed:', error.message);
  }
}

// Integration test function
async function runAllTests() {
  console.log('🚀 Starting AI retry tests...');
  
  try {
    await testBasicRetry();
    await testErrorTypes();
    await testConfigurationScenarios();
    
    console.log('✅ All AI retry tests completed!');
    return true;
  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
}

// Run all tests
if (require.main === module) {
  runAllTests().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('❌ Test runner failed:', error);
    process.exit(1);
  });
}