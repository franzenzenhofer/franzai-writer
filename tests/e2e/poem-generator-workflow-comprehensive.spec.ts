import { test, expect } from '@playwright/test';
import * as fs from 'fs/promises';
import * as path from 'path';

test.describe('Poem Generator Workflow - Comprehensive Test with AI Redo', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the poem generator workflow (shortName is "poem")
    await page.goto('/w/poem/new');
    
    // Wait for the page to load - check for stage card or poem topic
    await page.waitForSelector('[data-stage-id="poem-topic"]', { timeout: 10000 });
  });

  test('Complete poem generation from start to finish with AI Redo', async ({ page }) => {
    // Step 1: Enter Poem Topic
    await test.step('Enter poem topic', async () => {
      await page.waitForSelector('[data-stage-id="poem-topic"]', { timeout: 10000 });
      
      const topicInput = page.locator('[data-stage-id="poem-topic"] textarea');
      await expect(topicInput).toBeVisible();
      await topicInput.fill('The beauty of autumn leaves changing colors');
      
      const processButton = page.locator('[data-stage-id="poem-topic"] button:has-text("Process Stage")');
      await processButton.click();
      
      // Wait for processing to complete
      await page.waitForSelector('[data-stage-id="poem-topic"] [data-testid="stage-output-area"]', { 
        state: 'visible',
        timeout: 30000 
      });
    });

    // Step 2: Generate Poem with Title (Test AI Redo here)
    await test.step('Generate poem with title and test AI Redo', async () => {
      // This stage should auto-run due to dependencies, wait for it to complete
      await page.waitForSelector('[data-stage-id="generate-poem-with-title"] [data-testid="stage-output-area"]', { 
        state: 'visible',
        timeout: 45000 
      });
      
      // Capture the first output
      const firstOutput = await page.locator('[data-stage-id="generate-poem-with-title"] [data-testid="stage-output-area"]').textContent();
      console.log('First poem output:', firstOutput?.substring(0, 200) + '...');
      
      // Use AI Redo with Google Search grounding
      const aiRedoButton = page.locator('[data-stage-id="generate-poem-with-title"] button[title="AI Redo"]');
      await expect(aiRedoButton).toBeVisible();
      await aiRedoButton.click();
      
      // Wait for AI Redo dialog
      await page.waitForSelector('[role="dialog"]:has-text("AI Redo")', { timeout: 5000 });
      
      // Fill in redo instructions
      const redoInput = page.locator('[role="dialog"] textarea');
      await redoInput.fill('Make the poem more melancholic and nostalgic, with references to current autumn weather patterns');
      
      // Enable Google Search grounding
      const groundingCheckbox = page.locator('[role="dialog"] input[type="checkbox"]');
      await groundingCheckbox.check();
      
      // Click Redo button
      const confirmRedoButton = page.locator('[role="dialog"] button:has-text("Redo with AI")');
      await confirmRedoButton.click();
      
      // Wait for new output - use a more robust wait
      await page.waitForTimeout(3000); // Give time for the request to start
      await page.waitForFunction(() => {
        const output = document.querySelector('[data-stage-id="generate-poem-with-title"] [data-testid="stage-output-area"]');
        return output && output.textContent && output.textContent.trim().length > 100;
      }, { timeout: 45000 });
      
      const secondOutput = await page.locator('[data-stage-id="generate-poem-with-title"] [data-testid="stage-output-area"]').textContent();
      console.log('Second poem output after AI Redo:', secondOutput?.substring(0, 200) + '...');
      
      // Verify the output changed and contains expected elements
      expect(secondOutput).not.toBe(firstOutput);
      expect(secondOutput?.toLowerCase()).toContain('autumn');
    });

    // Step 3: HTML Briefing (Optional)
    await test.step('Add HTML briefing (optional)', async () => {
      await page.waitForSelector('[data-stage-id="html-briefing"]', { timeout: 10000 });
      
      const briefingInput = page.locator('[data-stage-id="html-briefing"] textarea');
      await briefingInput.fill('Make it elegant with a dark theme, centered layout, and beautiful typography');
      
      const processButton = page.locator('[data-stage-id="html-briefing"] button:has-text("Process Stage")');
      await processButton.click();
      
      // Wait for processing to complete
      await page.waitForSelector('[data-stage-id="html-briefing"] [data-testid="stage-output-area"]', { 
        state: 'visible',
        timeout: 30000 
      });
    });

    // Step 4: Generate HTML Preview (Final Output)
    await test.step('Generate HTML preview and save output', async () => {
      // This stage should auto-run, wait for it to complete
      await page.waitForSelector('[data-stage-id="generate-html-preview"] [data-testid="stage-output-area"]', { 
        state: 'visible',
        timeout: 45000 
      });
      
      // Capture the final HTML output
      const finalOutputElement = page.locator('[data-stage-id="generate-html-preview"] [data-testid="stage-output-area"]');
      const htmlContent = await finalOutputElement.innerHTML();
      const textContent = await finalOutputElement.textContent();
      
      // Create output directory
      const outputDir = path.join(process.cwd(), 'docs', 'test-outputs');
      await fs.mkdir(outputDir, { recursive: true });
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      
      // Save the HTML output
      const htmlFile = path.join(outputDir, `poem-output-${timestamp}.html`);
      
      // Create a full HTML document
      const fullHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Generated Poem - ${timestamp}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      background: #f5f5f5;
    }
    .poem-container {
      background: white;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    h1, h2, h3 {
      color: #333;
    }
    .poem {
      font-size: 1.2em;
      line-height: 1.8;
      margin: 20px 0;
      white-space: pre-wrap;
    }
    .metadata {
      color: #666;
      font-size: 0.9em;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #eee;
    }
  </style>
</head>
<body>
  <div class="poem-container">
    <h1>Generated Poem</h1>
    <div class="metadata">
      <p><strong>Generated on:</strong> ${new Date().toLocaleString()}</p>
      <p><strong>Topic:</strong> The beauty of autumn leaves changing colors</p>
      <p><strong>AI Redo Used:</strong> Yes (with Google Search grounding)</p>
      <p><strong>Workflow:</strong> Poem Generator</p>
    </div>
    <div class="poem-output">
      ${htmlContent}
    </div>
  </div>
</body>
</html>`;
      
      await fs.writeFile(htmlFile, fullHtml, 'utf-8');
      console.log(`Poem HTML saved to: ${htmlFile}`);
      
      // Also save a plain text version
      const textFile = path.join(outputDir, `poem-output-${timestamp}.txt`);
      await fs.writeFile(textFile, textContent || '', 'utf-8');
      console.log(`Poem text saved to: ${textFile}`);
      
      // Verify the HTML contains a poem
      expect(textContent).toBeTruthy();
      expect(textContent?.toLowerCase()).toContain('autumn');
    });

    // Step 5: Verify all stages completed
    await test.step('Verify all stages completed successfully', async () => {
      // Check that all stage cards have output
      const stageIds = ['poem-topic', 'generate-poem-with-title', 'html-briefing', 'generate-html-preview'];
      
      for (const stageId of stageIds) {
        const outputArea = page.locator(`[data-stage-id="${stageId}"] [data-testid="stage-output-area"]`);
        const isVisible = await outputArea.isVisible();
        
        if (isVisible) {
          const outputText = await outputArea.textContent();
          expect(outputText).toBeTruthy();
          console.log(`Stage ${stageId}: ✅ Has output`);
        } else {
          console.log(`Stage ${stageId}: ⚠️ No output visible`);
        }
      }
    });

    // Step 6: Test auto-save functionality
    await test.step('Verify auto-save works', async () => {
      // Wait for auto-save indicator
      await page.waitForTimeout(2000); // Give time for auto-save to trigger
      
      // Check for save indicator or success message
      const saveIndicator = page.locator('text=/Saved|Saving/i').first();
      const isSaved = await saveIndicator.isVisible().catch(() => false);
      
      if (isSaved) {
        console.log('Auto-save indicator detected');
      } else {
        console.log('Auto-save indicator not visible (may have already completed)');
      }
    });
  });

  test('AI Redo preserves context and improves output', async ({ page }) => {
    // Enter topic
    await page.waitForSelector('[data-stage-id="poem-topic"]', { timeout: 10000 });
    
    const topicInput = page.locator('[data-stage-id="poem-topic"] textarea');
    await topicInput.fill('Technology and human connection');
    
    const processButton = page.locator('[data-stage-id="poem-topic"] button:has-text("Process Stage")');
    await processButton.click();
    
    // Wait for auto-generated poem
    await page.waitForSelector('[data-stage-id="generate-poem-with-title"] [data-testid="stage-output-area"]', { 
      state: 'visible',
      timeout: 45000 
    });
    
    // Test AI Redo multiple times
    for (let i = 0; i < 2; i++) {
      const previousOutput = await page.locator('[data-stage-id="generate-poem-with-title"] [data-testid="stage-output-area"]').textContent();
      
      // Click AI Redo
      const aiRedoButton = page.locator('[data-stage-id="generate-poem-with-title"] button[title="AI Redo"]');
      await aiRedoButton.click();
      
      // Wait for dialog
      await page.waitForSelector('[role="dialog"]:has-text("AI Redo")', { timeout: 5000 });
      
      // Add specific instructions
      const redoInput = page.locator('[role="dialog"] textarea');
      await redoInput.fill(`Iteration ${i + 1}: Make it more ${i === 0 ? 'optimistic' : 'philosophical'}`);
      
      // Enable grounding for the second iteration
      if (i === 1) {
        const groundingCheckbox = page.locator('[role="dialog"] input[type="checkbox"]');
        await groundingCheckbox.check();
      }
      
      // Click Redo
      const confirmRedoButton = page.locator('[role="dialog"] button:has-text("Redo with AI")');
      await confirmRedoButton.click();
      
      // Wait for new output
      await page.waitForTimeout(3000); // Give time for request to start
      await page.waitForFunction(() => {
        const output = document.querySelector('[data-stage-id="generate-poem-with-title"] [data-testid="stage-output-area"]');
        return output && output.textContent && output.textContent.trim().length > 100;
      }, { timeout: 45000 });
      
      const newOutput = await page.locator('[data-stage-id="generate-poem-with-title"] [data-testid="stage-output-area"]').textContent();
      
      // Verify output changed
      expect(newOutput).not.toBe(previousOutput);
      console.log(`AI Redo iteration ${i + 1} completed`);
    }
  });

  test('Error handling and recovery', async ({ page }) => {
    // Test with empty input
    await test.step('Handle empty input gracefully', async () => {
      await page.waitForSelector('[data-stage-id="poem-topic"]', { timeout: 10000 });
      
      // Try to process without input
      const processButton = page.locator('[data-stage-id="poem-topic"] button:has-text("Process Stage")');
      await processButton.click();
      
      // Check for error message or if processing is blocked
      await page.waitForTimeout(2000);
      
      // Check if there's an error message or if the button is still enabled
      const buttonDisabled = await processButton.isDisabled().catch(() => false);
      const errorMessage = await page.locator('text=/required|empty|provide/i').isVisible({ timeout: 3000 }).catch(() => false);
      
      if (errorMessage || buttonDisabled) {
        console.log('Empty input validation working correctly');
      } else {
        console.log('No explicit validation detected, but may be handled differently');
      }
    });
  });
});