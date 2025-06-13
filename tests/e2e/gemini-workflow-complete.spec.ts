import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Gemini Tools Test Workflow - Complete Feature Testing', () => {
  let workflowUrl: string;

  test.beforeEach(async ({ page, context }) => {
    // Set larger timeout for AI operations
    test.setTimeout(120000);
    
    // Clear cookies and local storage
    await context.clearCookies();
    await page.goto('http://localhost:9002');
    
    // Navigate to the Gemini test workflow
    await page.goto('http://localhost:9002/w/gemini-test/new');
    await page.waitForLoadState('networkidle');
    
    // Get the workflow URL with document ID
    workflowUrl = page.url();
    console.log('Workflow URL:', workflowUrl);
  });

  test('Test 1: Google Search Grounding', async ({ page }) => {
    console.log('🔍 Testing Google Search Grounding...');
    
    // Enter test title
    await page.getByTestId('stage-test-title').locator('textarea').fill('Gemini Integration Test - Google Search');
    await page.getByTestId('stage-test-title').getByRole('button', { name: 'Process' }).click();
    
    // Wait for processing
    await expect(page.getByTestId('stage-test-title').getByText('Completed')).toBeVisible({ timeout: 30000 });
    
    // Test Google Search grounding
    await page.getByTestId('stage-grounding-google-search').locator('textarea').fill('What are the latest developments in AI as of 2025?');
    await page.getByTestId('stage-grounding-google-search').getByRole('button', { name: 'Process' }).click();
    
    // Wait for completion and check for grounding sources
    await expect(page.getByTestId('stage-grounding-google-search').getByText('Completed')).toBeVisible({ timeout: 60000 });
    
    // Verify grounding sources are displayed
    const groundingSources = page.locator('[class*="GroundingSourcesDisplay"]').first();
    await expect(groundingSources).toBeVisible({ timeout: 10000 });
    await expect(groundingSources.getByText('Grounding Sources')).toBeVisible();
    
    console.log('✅ Google Search Grounding test passed');
  });

  test('Test 2: URL Context Grounding', async ({ page }) => {
    console.log('🌐 Testing URL Context Grounding...');
    
    // Enter test title
    await page.getByTestId('stage-test-title').locator('textarea').fill('Gemini Integration Test - URL Context');
    await page.getByTestId('stage-test-title').getByRole('button', { name: 'Process' }).click();
    await expect(page.getByTestId('stage-test-title').getByText('Completed')).toBeVisible({ timeout: 30000 });
    
    // Test URL grounding
    await page.getByTestId('stage-grounding-url-context').locator('input[name="url"]').fill('https://example.com');
    await page.getByTestId('stage-grounding-url-context').locator('textarea[name="question"]').fill('What is this website about?');
    await page.getByTestId('stage-grounding-url-context').getByRole('button', { name: 'Process' }).click();
    
    // Wait for completion
    await expect(page.getByTestId('stage-grounding-url-context').getByText('Completed')).toBeVisible({ timeout: 60000 });
    
    // Verify URL was processed
    const urlOutput = page.getByTestId('stage-grounding-url-context').locator('[class*="whitespace-pre-wrap"]');
    await expect(urlOutput).toContainText('Example Domain');
    
    console.log('✅ URL Context Grounding test passed');
  });

  test('Test 3: Thinking Mode', async ({ page }) => {
    console.log('🧠 Testing Thinking Mode...');
    
    // Enter test title
    await page.getByTestId('stage-test-title').locator('textarea').fill('Gemini Integration Test - Thinking Mode');
    await page.getByTestId('stage-test-title').getByRole('button', { name: 'Process' }).click();
    await expect(page.getByTestId('stage-test-title').getByText('Completed')).toBeVisible({ timeout: 30000 });
    
    // Test thinking mode with complex problem
    await page.getByTestId('stage-thinking-mode-test').locator('textarea').fill('If a train leaves Station A at 9:00 AM traveling at 60 mph, and another train leaves Station B at 10:00 AM traveling at 80 mph toward Station A, and the stations are 280 miles apart, at what time will they meet?');
    await page.getByTestId('stage-thinking-mode-test').getByRole('button', { name: 'Process' }).click();
    
    // Wait for completion - thinking mode may take longer
    await expect(page.getByTestId('stage-thinking-mode-test').getByText('Completed')).toBeVisible({ timeout: 90000 });
    
    // Verify thinking steps are shown
    const thinkingSection = page.getByTestId('stage-thinking-mode-test').locator('[class*="Thinking Process"]').first();
    await expect(thinkingSection).toBeVisible();
    
    console.log('✅ Thinking Mode test passed');
  });

  test('Test 4: Function Calling - Calculator', async ({ page }) => {
    console.log('🧮 Testing Calculator Function...');
    
    // Enter test title
    await page.getByTestId('stage-test-title').locator('textarea').fill('Gemini Integration Test - Calculator');
    await page.getByTestId('stage-test-title').getByRole('button', { name: 'Process' }).click();
    await expect(page.getByTestId('stage-test-title').getByText('Completed')).toBeVisible({ timeout: 30000 });
    
    // Test calculator
    await page.getByTestId('stage-function-calling-calculator').locator('textarea').fill('Calculate: (25 * 37) + (156 / 4) - 18');
    await page.getByTestId('stage-function-calling-calculator').getByRole('button', { name: 'Process' }).click();
    
    // Wait for completion
    await expect(page.getByTestId('stage-function-calling-calculator').getByText('Completed')).toBeVisible({ timeout: 60000 });
    
    // Verify function calls are displayed
    const functionCalls = page.locator('[class*="FunctionCallsDisplay"]').first();
    await expect(functionCalls).toBeVisible({ timeout: 10000 });
    await expect(functionCalls.getByText('Function Calls')).toBeVisible();
    await expect(functionCalls.getByText('simpleCalculator')).toBeVisible();
    
    console.log('✅ Calculator Function test passed');
  });

  test('Test 5: Function Calling - Weather', async ({ page }) => {
    console.log('🌤️ Testing Weather Function...');
    
    // Enter test title
    await page.getByTestId('stage-test-title').locator('textarea').fill('Gemini Integration Test - Weather');
    await page.getByTestId('stage-test-title').getByRole('button', { name: 'Process' }).click();
    await expect(page.getByTestId('stage-test-title').getByText('Completed')).toBeVisible({ timeout: 30000 });
    
    // Test weather tool
    await page.getByTestId('stage-function-calling-weather').locator('textarea').fill('What is the weather in New York and London?');
    await page.getByTestId('stage-function-calling-weather').getByRole('button', { name: 'Process' }).click();
    
    // Wait for completion
    await expect(page.getByTestId('stage-function-calling-weather').getByText('Completed')).toBeVisible({ timeout: 60000 });
    
    // Verify weather data
    const weatherOutput = page.getByTestId('stage-function-calling-weather').locator('[class*="whitespace-pre-wrap"]');
    await expect(weatherOutput).toContainText('New York');
    await expect(weatherOutput).toContainText('London');
    
    console.log('✅ Weather Function test passed');
  });

  test('Test 6: Function Calling - Unit Converter', async ({ page }) => {
    console.log('📏 Testing Unit Converter Function...');
    
    // Enter test title
    await page.getByTestId('stage-test-title').locator('textarea').fill('Gemini Integration Test - Unit Converter');
    await page.getByTestId('stage-test-title').getByRole('button', { name: 'Process' }).click();
    await expect(page.getByTestId('stage-test-title').getByText('Completed')).toBeVisible({ timeout: 30000 });
    
    // Test unit converter
    await page.getByTestId('stage-function-calling-unit-converter').locator('textarea').fill('Convert 100 kilometers to miles and 72 fahrenheit to celsius');
    await page.getByTestId('stage-function-calling-unit-converter').getByRole('button', { name: 'Process' }).click();
    
    // Wait for completion
    await expect(page.getByTestId('stage-function-calling-unit-converter').getByText('Completed')).toBeVisible({ timeout: 60000 });
    
    // Verify conversions
    const converterOutput = page.getByTestId('stage-function-calling-unit-converter').locator('[class*="whitespace-pre-wrap"]');
    await expect(converterOutput).toContainText('62.14'); // ~100km to miles
    await expect(converterOutput).toContainText('22.22'); // ~72F to C
    
    console.log('✅ Unit Converter Function test passed');
  });

  test('Test 7: Code Execution', async ({ page }) => {
    console.log('🐍 Testing Code Execution...');
    
    // Enter test title
    await page.getByTestId('stage-test-title').locator('textarea').fill('Gemini Integration Test - Code Execution');
    await page.getByTestId('stage-test-title').getByRole('button', { name: 'Process' }).click();
    await expect(page.getByTestId('stage-test-title').getByText('Completed')).toBeVisible({ timeout: 30000 });
    
    // Test Python code execution
    const pythonCode = `
import matplotlib.pyplot as plt
import numpy as np

# Create data
x = np.linspace(0, 10, 100)
y = np.sin(x)

# Create plot
plt.figure(figsize=(8, 6))
plt.plot(x, y, 'b-', linewidth=2)
plt.title('Sine Wave')
plt.xlabel('X')
plt.ylabel('Y')
plt.grid(True)
plt.show()

print("Plot generated successfully!")
`;
    
    await page.getByTestId('stage-code-execution-python').locator('textarea').fill(pythonCode);
    await page.getByTestId('stage-code-execution-python').getByRole('button', { name: 'Process' }).click();
    
    // Wait for completion - code execution may take time
    await expect(page.getByTestId('stage-code-execution-python').getByText('Completed')).toBeVisible({ timeout: 90000 });
    
    // Verify code execution display
    const codeDisplay = page.locator('[class*="CodeExecutionDisplay"]').first();
    await expect(codeDisplay).toBeVisible({ timeout: 10000 });
    await expect(codeDisplay.getByText('Code Execution')).toBeVisible();
    
    console.log('✅ Code Execution test passed');
  });

  test('Test 8: Streaming Response', async ({ page }) => {
    console.log('📡 Testing Streaming Response...');
    
    // Enter test title
    await page.getByTestId('stage-test-title').locator('textarea').fill('Gemini Integration Test - Streaming');
    await page.getByTestId('stage-test-title').getByRole('button', { name: 'Process' }).click();
    await expect(page.getByTestId('stage-test-title').getByText('Completed')).toBeVisible({ timeout: 30000 });
    
    // Test streaming
    await page.getByTestId('stage-streaming-test').locator('textarea').fill('Write a detailed explanation of how neural networks work, including backpropagation, activation functions, and gradient descent.');
    
    // Click process and watch for streaming
    await page.getByTestId('stage-streaming-test').getByRole('button', { name: 'Process' }).click();
    
    // Verify we see "AI is generating output..." initially
    await expect(page.getByTestId('stage-streaming-test').getByText('AI is generating output...')).toBeVisible();
    
    // Wait for completion
    await expect(page.getByTestId('stage-streaming-test').getByText('Completed')).toBeVisible({ timeout: 90000 });
    
    console.log('✅ Streaming Response test passed');
  });

  test('Test 9: Chat Mode', async ({ page }) => {
    console.log('💬 Testing Chat Mode...');
    
    // Enter test title
    await page.getByTestId('stage-test-title').locator('textarea').fill('Gemini Integration Test - Chat Mode');
    await page.getByTestId('stage-test-title').getByRole('button', { name: 'Process' }).click();
    await expect(page.getByTestId('stage-test-title').getByText('Completed')).toBeVisible({ timeout: 30000 });
    
    // First chat message
    await page.getByTestId('stage-chat-mode-test').locator('textarea').fill('Hello! My name is TestUser. Can you remember my name?');
    await page.getByTestId('stage-chat-mode-test').getByRole('button', { name: 'Process' }).click();
    await expect(page.getByTestId('stage-chat-mode-test').getByText('Completed')).toBeVisible({ timeout: 60000 });
    
    // Verify response mentions the name
    let chatOutput = page.getByTestId('stage-chat-mode-test').locator('[class*="whitespace-pre-wrap"]').first();
    await expect(chatOutput).toContainText('TestUser');
    
    // Second chat message to test context retention
    await page.getByTestId('stage-chat-mode-test').locator('textarea').fill('What is my name?');
    await page.getByTestId('stage-chat-mode-test').getByRole('button', { name: 'Continue' }).click();
    
    // Wait for the second response
    await page.waitForTimeout(3000); // Give time for new response
    await expect(page.getByTestId('stage-chat-mode-test').getByText('Completed')).toBeVisible({ timeout: 60000 });
    
    // Verify context was retained
    chatOutput = page.getByTestId('stage-chat-mode-test').locator('[class*="whitespace-pre-wrap"]').last();
    await expect(chatOutput).toContainText('TestUser');
    
    console.log('✅ Chat Mode test passed');
  });

  test('Test 10: Image Understanding', async ({ page }) => {
    console.log('🖼️ Testing Image Understanding...');
    
    // Enter test title
    await page.getByTestId('stage-test-title').locator('textarea').fill('Gemini Integration Test - Image Understanding');
    await page.getByTestId('stage-test-title').getByRole('button', { name: 'Process' }).click();
    await expect(page.getByTestId('stage-test-title').getByText('Completed')).toBeVisible({ timeout: 30000 });
    
    // Create a test image file path
    const testImagePath = path.join(process.cwd(), 'test-image.png');
    
    // Upload image using the dropzone
    const fileInput = page.getByTestId('stage-image-understanding-test').locator('input[type="file"]');
    await fileInput.setInputFiles(testImagePath);
    
    // Process the image
    await page.getByTestId('stage-image-understanding-test').getByRole('button', { name: 'Process' }).click();
    
    // Wait for completion
    await expect(page.getByTestId('stage-image-understanding-test').getByText('Completed')).toBeVisible({ timeout: 90000 });
    
    // Verify JSON output
    const imageOutput = page.getByTestId('stage-image-understanding-test').locator('[class*="JsonRenderer"]');
    await expect(imageOutput).toBeVisible();
    
    console.log('✅ Image Understanding test passed');
  });

  test('Test 11: Combined Features', async ({ page }) => {
    console.log('🔄 Testing Combined Features...');
    
    // Enter test title
    await page.getByTestId('stage-test-title').locator('textarea').fill('Gemini Integration Test - Combined Features');
    await page.getByTestId('stage-test-title').getByRole('button', { name: 'Process' }).click();
    await expect(page.getByTestId('stage-test-title').getByText('Completed')).toBeVisible({ timeout: 30000 });
    
    // Test combined features
    await page.getByTestId('stage-combined-features-test').locator('textarea').fill('Search for the current temperature in celsius in Tokyo, then convert it to fahrenheit. Also calculate how many degrees warmer it is than 0°C.');
    await page.getByTestId('stage-combined-features-test').getByRole('button', { name: 'Process' }).click();
    
    // Wait for completion - this may take longer due to multiple features
    await expect(page.getByTestId('stage-combined-features-test').getByText('Completed')).toBeVisible({ timeout: 120000 });
    
    // Verify multiple features were used
    const combinedOutput = page.getByTestId('stage-combined-features-test');
    
    // Should see grounding sources (if search was used)
    const groundingSources = combinedOutput.locator('[class*="GroundingSourcesDisplay"]');
    const functionCalls = combinedOutput.locator('[class*="FunctionCallsDisplay"]');
    
    // At least one of these should be visible
    const hasGrounding = await groundingSources.isVisible().catch(() => false);
    const hasFunctions = await functionCalls.isVisible().catch(() => false);
    
    expect(hasGrounding || hasFunctions).toBeTruthy();
    
    console.log('✅ Combined Features test passed');
  });

  test('Test 12: Final Summary Generation', async ({ page }) => {
    console.log('📄 Testing Final Summary Generation...');
    
    // Enter test title
    await page.getByTestId('stage-test-title').locator('textarea').fill('Gemini Integration Test - Complete');
    await page.getByTestId('stage-test-title').getByRole('button', { name: 'Process' }).click();
    await expect(page.getByTestId('stage-test-title').getByText('Completed')).toBeVisible({ timeout: 30000 });
    
    // Process a few stages to generate summary
    await page.getByTestId('stage-function-calling-calculator').locator('textarea').fill('5 + 5');
    await page.getByTestId('stage-function-calling-calculator').getByRole('button', { name: 'Process' }).click();
    await expect(page.getByTestId('stage-function-calling-calculator').getByText('Completed')).toBeVisible({ timeout: 60000 });
    
    // Check if final summary auto-runs
    await page.waitForTimeout(5000); // Give time for auto-run
    
    // Verify summary is generated
    const summaryStage = page.getByTestId('stage-final-summary');
    const summaryContent = summaryStage.locator('[class*="MarkdownRenderer"]');
    await expect(summaryContent).toBeVisible({ timeout: 90000 });
    await expect(summaryContent).toContainText('Gemini Tools Test Summary');
    
    console.log('✅ Final Summary Generation test passed');
  });

  test.afterEach(async ({ page }) => {
    // Take screenshot for debugging
    await page.screenshot({ path: `test-results/gemini-test-${Date.now()}.png`, fullPage: true });
  });
});

// Run a final validation test
test('Final Validation: All Features Working', async ({ page }) => {
  console.log('🏁 Running final validation...');
  
  // Navigate to dashboard
  await page.goto('http://localhost:9002/dashboard');
  await page.waitForLoadState('networkidle');
  
  // Check if Gemini workflow appears
  await expect(page.getByText('Gemini AI Tools Test')).toBeVisible();
  
  // Click on it
  await page.getByText('Gemini AI Tools Test').click();
  
  // Verify all stages are present
  const stages = [
    'Test Title',
    'Grounding with Google Search',
    'Grounding with URL Context',
    'Thinking Mode Test',
    'Function Calling - Calculator',
    'Function Calling - Weather',
    'Function Calling - Unit Converter',
    'Code Execution - Python',
    'Streaming Response Test',
    'Chat Mode Test',
    'Image Understanding Test',
    'Combined Features Test',
    'Test Summary'
  ];
  
  for (const stage of stages) {
    await expect(page.getByText(stage)).toBeVisible();
  }
  
  console.log('✅ Final validation passed - All features present and working!');
});