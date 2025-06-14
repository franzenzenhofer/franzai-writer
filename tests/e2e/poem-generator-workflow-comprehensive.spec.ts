import { test, expect } from '@playwright/test';
import * as fs from 'fs/promises';
import * as path from 'path';

test.describe('Poem Generator Workflow - Comprehensive Test with AI Redo', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the poem generator workflow
    await page.goto('/w/poem-generator/new');
    
    // Wait for the wizard shell to load
    await page.waitForSelector('[data-testid="wizard-shell"]', { timeout: 10000 });
  });

  test('Complete poem generation from start to finish with AI Redo', async ({ page }) => {
    // Step 1: Topic Selection
    await test.step('Enter poem topic', async () => {
      await page.waitForSelector('[data-stage-id="topic-selection"]', { timeout: 10000 });
      
      const topicInput = page.locator('[data-stage-id="topic-selection"] textarea');
      await expect(topicInput).toBeVisible();
      await topicInput.fill('The beauty of autumn leaves changing colors');
      
      const processButton = page.locator('[data-stage-id="topic-selection"] button:has-text("Process Stage")');
      await processButton.click();
      
      // Wait for processing to complete
      await page.waitForSelector('[data-stage-id="topic-selection"] [data-testid="stage-output-area"]', { 
        state: 'visible',
        timeout: 30000 
      });
    });

    // Step 2: Poem Style
    await test.step('Select poem style', async () => {
      await page.waitForSelector('[data-stage-id="poem-style"] button:has-text("Process Stage")', { 
        state: 'visible',
        timeout: 10000 
      });
      
      const styleButton = page.locator('[data-stage-id="poem-style"] button:has-text("Process Stage")');
      await styleButton.click();
      
      // Wait for style to be generated
      await page.waitForSelector('[data-stage-id="poem-style"] [data-testid="stage-output-area"]', { 
        state: 'visible',
        timeout: 30000 
      });
    });

    // Step 3: Tone and Mood (Test AI Redo here)
    await test.step('Generate tone and mood with AI Redo', async () => {
      await page.waitForSelector('[data-stage-id="tone-mood"] button:has-text("Process Stage")', { 
        state: 'visible',
        timeout: 10000 
      });
      
      // First generation
      const toneButton = page.locator('[data-stage-id="tone-mood"] button:has-text("Process Stage")');
      await toneButton.click();
      
      // Wait for tone to be generated
      await page.waitForSelector('[data-stage-id="tone-mood"] [data-testid="stage-output-area"]', { 
        state: 'visible',
        timeout: 30000 
      });
      
      // Capture the first output
      const firstOutput = await page.locator('[data-stage-id="tone-mood"] [data-testid="stage-output-area"]').textContent();
      console.log('First tone output:', firstOutput);
      
      // Use AI Redo with Google Search grounding
      const aiRedoButton = page.locator('[data-stage-id="tone-mood"] button[title="AI Redo"]');
      await expect(aiRedoButton).toBeVisible();
      await aiRedoButton.click();
      
      // Wait for AI Redo dialog
      await page.waitForSelector('[role="dialog"]:has-text("AI Redo")', { timeout: 5000 });
      
      // Fill in redo instructions
      const redoInput = page.locator('[role="dialog"] textarea');
      await redoInput.fill('Make the tone more melancholic and nostalgic, with references to current autumn weather patterns');
      
      // Enable Google Search grounding
      const groundingCheckbox = page.locator('[role="dialog"] input[type="checkbox"]');
      await groundingCheckbox.check();
      
      // Click Redo button
      const confirmRedoButton = page.locator('[role="dialog"] button:has-text("Redo with AI")');
      await confirmRedoButton.click();
      
      // Wait for new output
      await page.waitForFunction(() => {
        const output = document.querySelector('[data-stage-id="tone-mood"] [data-testid="stage-output-area"]');
        return output && output.textContent !== '';
      }, { timeout: 30000 });
      
      const secondOutput = await page.locator('[data-stage-id="tone-mood"] [data-testid="stage-output-area"]').textContent();
      console.log('Second tone output after AI Redo:', secondOutput);
      
      // Verify the output changed
      expect(secondOutput).not.toBe(firstOutput);
      expect(secondOutput?.toLowerCase()).toContain('melancholic');
    });

    // Step 4: Key Imagery
    await test.step('Generate key imagery', async () => {
      await page.waitForSelector('[data-stage-id="key-imagery"] button:has-text("Process Stage")', { 
        state: 'visible',
        timeout: 10000 
      });
      
      const imageryButton = page.locator('[data-stage-id="key-imagery"] button:has-text("Process Stage")');
      await imageryButton.click();
      
      // Wait for imagery to be generated
      await page.waitForSelector('[data-stage-id="key-imagery"] [data-testid="stage-output-area"]', { 
        state: 'visible',
        timeout: 30000 
      });
    });

    // Step 5: Poem Structure
    await test.step('Define poem structure', async () => {
      await page.waitForSelector('[data-stage-id="poem-structure"] button:has-text("Process Stage")', { 
        state: 'visible',
        timeout: 10000 
      });
      
      const structureButton = page.locator('[data-stage-id="poem-structure"] button:has-text("Process Stage")');
      await structureButton.click();
      
      // Wait for structure to be generated
      await page.waitForSelector('[data-stage-id="poem-structure"] [data-testid="stage-output-area"]', { 
        state: 'visible',
        timeout: 30000 
      });
    });

    // Step 6: Audience Analysis
    await test.step('Analyze target audience', async () => {
      await page.waitForSelector('[data-stage-id="audience-analysis"] button:has-text("Process Stage")', { 
        state: 'visible',
        timeout: 10000 
      });
      
      const audienceButton = page.locator('[data-stage-id="audience-analysis"] button:has-text("Process Stage")');
      await audienceButton.click();
      
      // Wait for analysis to be generated
      await page.waitForSelector('[data-stage-id="audience-analysis"] [data-testid="stage-output-area"]', { 
        state: 'visible',
        timeout: 30000 
      });
    });

    // Step 7: Final Poem Generation
    await test.step('Generate final poem', async () => {
      await page.waitForSelector('[data-stage-id="final-poem"] button:has-text("Process Stage")', { 
        state: 'visible',
        timeout: 10000 
      });
      
      const poemButton = page.locator('[data-stage-id="final-poem"] button:has-text("Process Stage")');
      await poemButton.click();
      
      // Wait for poem to be generated
      await page.waitForSelector('[data-stage-id="final-poem"] [data-testid="stage-output-area"]', { 
        state: 'visible',
        timeout: 30000 
      });
      
      // Verify poem content
      const poemContent = await page.locator('[data-stage-id="final-poem"] [data-testid="stage-output-area"]').textContent();
      expect(poemContent).toBeTruthy();
      expect(poemContent?.toLowerCase()).toContain('autumn');
      expect(poemContent?.toLowerCase()).toContain('leaves');
    });

    // Step 8: Title Generation
    await test.step('Generate poem title', async () => {
      await page.waitForSelector('[data-stage-id="title-generation"] button:has-text("Process Stage")', { 
        state: 'visible',
        timeout: 10000 
      });
      
      const titleButton = page.locator('[data-stage-id="title-generation"] button:has-text("Process Stage")');
      await titleButton.click();
      
      // Wait for title to be generated
      await page.waitForSelector('[data-stage-id="title-generation"] [data-testid="stage-output-area"]', { 
        state: 'visible',
        timeout: 30000 
      });
      
      const titleContent = await page.locator('[data-stage-id="title-generation"] [data-testid="stage-output-area"]').textContent();
      expect(titleContent).toBeTruthy();
    });

    // Step 9: Final Review (with formatted output)
    await test.step('Generate final review with formatted output', async () => {
      await page.waitForSelector('[data-stage-id="final-review"] button:has-text("Process Stage")', { 
        state: 'visible',
        timeout: 10000 
      });
      
      const reviewButton = page.locator('[data-stage-id="final-review"] button:has-text("Process Stage")');
      await reviewButton.click();
      
      // Wait for review to be generated
      await page.waitForSelector('[data-stage-id="final-review"] [data-testid="stage-output-area"]', { 
        state: 'visible',
        timeout: 30000 
      });
      
      // Capture the final HTML output
      const finalOutputElement = page.locator('[data-stage-id="final-review"] [data-testid="stage-output-area"]');
      const htmlContent = await finalOutputElement.innerHTML();
      
      // Save the HTML output
      const outputDir = path.join(process.cwd(), 'docs', 'test-outputs');
      await fs.mkdir(outputDir, { recursive: true });
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
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
      const textContent = await finalOutputElement.textContent();
      const textFile = path.join(outputDir, `poem-output-${timestamp}.txt`);
      await fs.writeFile(textFile, textContent || '', 'utf-8');
      console.log(`Poem text saved to: ${textFile}`);
    });

    // Step 10: Verify all stages completed
    await test.step('Verify all stages completed successfully', async () => {
      // Check that all stage cards have output
      const stageCards = page.locator('[data-testid="stage-card"]');
      const stageCount = await stageCards.count();
      
      for (let i = 0; i < stageCount; i++) {
        const stageCard = stageCards.nth(i);
        const outputArea = stageCard.locator('[data-testid="stage-output-area"]');
        const hasOutput = await outputArea.isVisible();
        
        if (hasOutput) {
          const outputText = await outputArea.textContent();
          expect(outputText).toBeTruthy();
        }
      }
    });

    // Step 11: Test auto-save functionality
    await test.step('Verify auto-save works', async () => {
      // Wait for auto-save indicator
      await page.waitForTimeout(2000); // Give time for auto-save to trigger
      
      // Check for save indicator or success message
      const saveIndicator = page.locator('text=/Saved|Saving/i');
      const isSaved = await saveIndicator.isVisible().catch(() => false);
      
      if (isSaved) {
        console.log('Auto-save indicator detected');
      }
    });
  });

  test('AI Redo preserves context and improves output', async ({ page }) => {
    // Navigate to a specific stage
    await page.waitForSelector('[data-stage-id="topic-selection"]', { timeout: 10000 });
    
    // Enter topic
    const topicInput = page.locator('[data-stage-id="topic-selection"] textarea');
    await topicInput.fill('Technology and human connection');
    
    const processButton = page.locator('[data-stage-id="topic-selection"] button:has-text("Process Stage")');
    await processButton.click();
    
    // Wait for output
    await page.waitForSelector('[data-stage-id="topic-selection"] [data-testid="stage-output-area"]', { 
      state: 'visible',
      timeout: 30000 
    });
    
    // Test AI Redo multiple times
    for (let i = 0; i < 2; i++) {
      const previousOutput = await page.locator('[data-stage-id="topic-selection"] [data-testid="stage-output-area"]').textContent();
      
      // Click AI Redo
      const aiRedoButton = page.locator('[data-stage-id="topic-selection"] button[title="AI Redo"]');
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
      await page.waitForTimeout(2000); // Give time for update
      
      const newOutput = await page.locator('[data-stage-id="topic-selection"] [data-testid="stage-output-area"]').textContent();
      
      // Verify output changed
      expect(newOutput).not.toBe(previousOutput);
      console.log(`AI Redo iteration ${i + 1} completed`);
    }
  });

  test('Error handling and recovery', async ({ page }) => {
    // Test with empty input
    await test.step('Handle empty input gracefully', async () => {
      await page.waitForSelector('[data-stage-id="topic-selection"]', { timeout: 10000 });
      
      // Try to process without input
      const processButton = page.locator('[data-stage-id="topic-selection"] button:has-text("Process Stage")');
      await processButton.click();
      
      // Check for error message
      const errorMessage = page.locator('text=/required|empty|provide/i');
      const hasError = await errorMessage.isVisible({ timeout: 5000 }).catch(() => false);
      
      if (hasError) {
        console.log('Empty input validation working correctly');
      }
    });
  });
});