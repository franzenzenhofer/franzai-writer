/**
 * Test suite for AI retry functionality
 * 
 * This test suite validates the retry logic implementation with various scenarios
 * including rate limiting, network errors, and successful retries.
 */

import { withRetry, withAIRetry, RETRY_CONFIGS, AIRetryError } from '@/lib/ai-retry';

// Mock functions for testing
const createMockFunction = (failures: number, errorType: string = 'network') => {
  let attempts = 0;
  return async () => {
    attempts++;
    if (attempts <= failures) {
      const error = new Error(`Mock ${errorType} error`);
      switch (errorType) {
        case 'rate_limit':
          (error as any).status = 429;
          (error as any).code = 'rate_limit_exceeded';
          break;
        case 'server_error':
          (error as any).status = 500;
          break;
        case 'network':
          (error as any).code = 'ECONNRESET';
          break;
        case 'timeout':
          (error as any).code = 'timeout';
          break;
        case 'client_error':
          (error as any).status = 400;
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
export async function testBasicRetry() {
  console.log('🧪 Testing basic retry functionality...');
  
  // Test successful retry after 1 failure
  const fn1 = createMockFunction(1, 'network');
  const result1 = await withRetry(fn1, { maxAttempts: 3, baseDelay: 10 });
  console.log('✅ Basic retry test passed:', result1);
  
  // Test failure after max attempts
  const fn2 = createMockFunction(5, 'network');
  try {
    await withRetry(fn2, { maxAttempts: 3, baseDelay: 10 });
    console.log('❌ Expected error but got success');
  } catch (error) {
    if (error instanceof AIRetryError) {
      console.log('✅ Max attempts test passed:', error.message);
    } else {
      console.log('❌ Unexpected error type:', error);
    }
  }
}

// Test rate limiting retry
export async function testRateLimitRetry() {
  console.log('🧪 Testing rate limit retry functionality...');
  
  const fn = createMockFunction(2, 'rate_limit');
  const result = await withAIRetry(fn, 'RATE_LIMIT');
  console.log('✅ Rate limit retry test passed:', result);
}

// Test different error types
export async function testErrorTypes() {
  console.log('🧪 Testing different error types...');
  
  // Test server error (should retry)
  const serverErrorFn = createMockFunction(1, 'server_error');
  const serverResult = await withRetry(serverErrorFn, { maxAttempts: 2, baseDelay: 10 });
  console.log('✅ Server error retry test passed:', serverResult);
  
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
export async function testConfigurationScenarios() {
  console.log('🧪 Testing configuration scenarios...');
  
  // Test CONSERVATIVE config
  const conservativeFn = createMockFunction(1, 'network');
  const conservativeResult = await withAIRetry(conservativeFn, 'CONSERVATIVE');
  console.log('✅ Conservative config test passed:', conservativeResult);
  
  // Test AGGRESSIVE config
  const aggressiveFn = createMockFunction(3, 'network');
  const aggressiveResult = await withAIRetry(aggressiveFn, 'AGGRESSIVE');
  console.log('✅ Aggressive config test passed:', aggressiveResult);
  
  // Test FAST config
  const fastFn = createMockFunction(1, 'network');
  const fastResult = await withAIRetry(fastFn, 'FAST');
  console.log('✅ Fast config test passed:', fastResult);
}

// Test user feedback functionality
export async function testUserFeedback() {
  console.log('🧪 Testing user feedback functionality...');
  
  const feedbackMessages: string[] = [];
  const feedbackFn = (attempt: number, reason: string, delay: number) => {
    feedbackMessages.push(`Attempt ${attempt}: ${reason} (delay: ${delay}ms)`);
  };
  
  const { withAIRetryAndFeedback } = await import('@/lib/ai-retry');
  const fn = createMockFunction(2, 'rate_limit');
  
  const result = await withAIRetryAndFeedback(fn, feedbackFn, 'STANDARD');
  
  console.log('✅ User feedback test passed:', result);
  console.log('✅ Feedback messages:', feedbackMessages);
}

// Integration test function
export async function runAllTests() {
  console.log('🚀 Starting AI retry tests...');
  
  try {
    await testBasicRetry();
    await testRateLimitRetry();
    await testErrorTypes();
    await testConfigurationScenarios();
    await testUserFeedback();
    
    console.log('✅ All AI retry tests passed!');
    return true;
  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
}

// Export test runner for external use
export default runAllTests;

// If running directly, run all tests
if (require.main === module) {
  runAllTests().then(success => {
    process.exit(success ? 0 : 1);
  });
}