# Test info

- Name: Poem Generator Workflow - Comprehensive Test with AI Redo >> AI Redo preserves context and improves output
- Location: /Users/franzenzenhofer/dev/franzai-writer/tests/e2e/poem-generator-workflow-comprehensive.spec.ts:324:7

# Error details

```
TimeoutError: page.waitForSelector: Timeout 10000ms exceeded.
Call log:
  - waiting for locator('[data-testid="wizard-shell"]') to be visible

    at /Users/franzenzenhofer/dev/franzai-writer/tests/e2e/poem-generator-workflow-comprehensive.spec.ts:11:16
```

# Page snapshot

```yaml
- banner:
  - button "Toggle menu":
    - img
    - text: Toggle menu
  - text: FranzAI Writer
  - navigation
- main:
  - heading "404" [level=1]
  - heading "This page could not be found." [level=2]
- contentinfo:
  - paragraph: © 2025 Franz AI Writer. All rights reserved.
  - paragraph:
    - text: Made with
    - img
    - text: using AI-powered workflows
  - link "Privacy":
    - /url: /privacy
  - link "Terms":
    - /url: /terms
  - link "GitHub":
    - /url: https://github.com/your-repo/franz-ai-writer
    - img
    - text: GitHub
- region "Notifications (F8)":
  - list
- alert
- button "Open Next.js Dev Tools":
  - img
- button "Open issues overlay": 1 Issue
- button "Collapse issues badge":
  - img
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 | import * as fs from 'fs/promises';
   3 | import * as path from 'path';
   4 |
   5 | test.describe('Poem Generator Workflow - Comprehensive Test with AI Redo', () => {
   6 |   test.beforeEach(async ({ page }) => {
   7 |     // Navigate to the poem generator workflow
   8 |     await page.goto('/w/poem-generator/new');
   9 |     
   10 |     // Wait for the wizard shell to load
>  11 |     await page.waitForSelector('[data-testid="wizard-shell"]', { timeout: 10000 });
      |                ^ TimeoutError: page.waitForSelector: Timeout 10000ms exceeded.
   12 |   });
   13 |
   14 |   test('Complete poem generation from start to finish with AI Redo', async ({ page }) => {
   15 |     // Step 1: Topic Selection
   16 |     await test.step('Enter poem topic', async () => {
   17 |       await page.waitForSelector('[data-stage-id="topic-selection"]', { timeout: 10000 });
   18 |       
   19 |       const topicInput = page.locator('[data-stage-id="topic-selection"] textarea');
   20 |       await expect(topicInput).toBeVisible();
   21 |       await topicInput.fill('The beauty of autumn leaves changing colors');
   22 |       
   23 |       const processButton = page.locator('[data-stage-id="topic-selection"] button:has-text("Process Stage")');
   24 |       await processButton.click();
   25 |       
   26 |       // Wait for processing to complete
   27 |       await page.waitForSelector('[data-stage-id="topic-selection"] [data-testid="stage-output-area"]', { 
   28 |         state: 'visible',
   29 |         timeout: 30000 
   30 |       });
   31 |     });
   32 |
   33 |     // Step 2: Poem Style
   34 |     await test.step('Select poem style', async () => {
   35 |       await page.waitForSelector('[data-stage-id="poem-style"] button:has-text("Process Stage")', { 
   36 |         state: 'visible',
   37 |         timeout: 10000 
   38 |       });
   39 |       
   40 |       const styleButton = page.locator('[data-stage-id="poem-style"] button:has-text("Process Stage")');
   41 |       await styleButton.click();
   42 |       
   43 |       // Wait for style to be generated
   44 |       await page.waitForSelector('[data-stage-id="poem-style"] [data-testid="stage-output-area"]', { 
   45 |         state: 'visible',
   46 |         timeout: 30000 
   47 |       });
   48 |     });
   49 |
   50 |     // Step 3: Tone and Mood (Test AI Redo here)
   51 |     await test.step('Generate tone and mood with AI Redo', async () => {
   52 |       await page.waitForSelector('[data-stage-id="tone-mood"] button:has-text("Process Stage")', { 
   53 |         state: 'visible',
   54 |         timeout: 10000 
   55 |       });
   56 |       
   57 |       // First generation
   58 |       const toneButton = page.locator('[data-stage-id="tone-mood"] button:has-text("Process Stage")');
   59 |       await toneButton.click();
   60 |       
   61 |       // Wait for tone to be generated
   62 |       await page.waitForSelector('[data-stage-id="tone-mood"] [data-testid="stage-output-area"]', { 
   63 |         state: 'visible',
   64 |         timeout: 30000 
   65 |       });
   66 |       
   67 |       // Capture the first output
   68 |       const firstOutput = await page.locator('[data-stage-id="tone-mood"] [data-testid="stage-output-area"]').textContent();
   69 |       console.log('First tone output:', firstOutput);
   70 |       
   71 |       // Use AI Redo with Google Search grounding
   72 |       const aiRedoButton = page.locator('[data-stage-id="tone-mood"] button[title="AI Redo"]');
   73 |       await expect(aiRedoButton).toBeVisible();
   74 |       await aiRedoButton.click();
   75 |       
   76 |       // Wait for AI Redo dialog
   77 |       await page.waitForSelector('[role="dialog"]:has-text("AI Redo")', { timeout: 5000 });
   78 |       
   79 |       // Fill in redo instructions
   80 |       const redoInput = page.locator('[role="dialog"] textarea');
   81 |       await redoInput.fill('Make the tone more melancholic and nostalgic, with references to current autumn weather patterns');
   82 |       
   83 |       // Enable Google Search grounding
   84 |       const groundingCheckbox = page.locator('[role="dialog"] input[type="checkbox"]');
   85 |       await groundingCheckbox.check();
   86 |       
   87 |       // Click Redo button
   88 |       const confirmRedoButton = page.locator('[role="dialog"] button:has-text("Redo with AI")');
   89 |       await confirmRedoButton.click();
   90 |       
   91 |       // Wait for new output
   92 |       await page.waitForFunction(() => {
   93 |         const output = document.querySelector('[data-stage-id="tone-mood"] [data-testid="stage-output-area"]');
   94 |         return output && output.textContent !== '';
   95 |       }, { timeout: 30000 });
   96 |       
   97 |       const secondOutput = await page.locator('[data-stage-id="tone-mood"] [data-testid="stage-output-area"]').textContent();
   98 |       console.log('Second tone output after AI Redo:', secondOutput);
   99 |       
  100 |       // Verify the output changed
  101 |       expect(secondOutput).not.toBe(firstOutput);
  102 |       expect(secondOutput?.toLowerCase()).toContain('melancholic');
  103 |     });
  104 |
  105 |     // Step 4: Key Imagery
  106 |     await test.step('Generate key imagery', async () => {
  107 |       await page.waitForSelector('[data-stage-id="key-imagery"] button:has-text("Process Stage")', { 
  108 |         state: 'visible',
  109 |         timeout: 10000 
  110 |       });
  111 |       
```