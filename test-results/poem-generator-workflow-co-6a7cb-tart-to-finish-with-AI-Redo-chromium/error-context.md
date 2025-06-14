# Test info

- Name: Poem Generator Workflow - Comprehensive Test with AI Redo >> Complete poem generation from start to finish with AI Redo
- Location: /Users/franzenzenhofer/dev/franzai-writer/tests/e2e/poem-generator-workflow-comprehensive.spec.ts:14:7

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
  - link "FranzAI Writer":
    - /url: /
  - navigation:
    - link "Dashboard":
      - /url: /dashboard
  - navigation:
    - link "Login":
      - /url: /login
- main:
  - heading "New Poem Generator" [level=1]
  - paragraph: "Workflow: Poem Generator"
  - text: Progress 0 / 4 Stages
  - progressbar
  - text: Last saved 2:22:20 PM Poem Topic What is the topic of your poem?
  - textbox "What is the topic of your poem?"
  - button "Continue":
    - img
    - text: Continue
  - img
  - text: "Waiting for: Poem Topic Generate Poem & Title AI will generate a poem and title based on your topic."
  - img
  - text: "Waiting for: Generate Poem & Title HTML Briefing Optional Special instructions for HTML formatting (optional)"
  - textbox "Special instructions for HTML formatting (optional)"
  - img
  - text: "Waiting for: Generate Poem & Title Generate HTML Preview AI will convert your poem into beautiful HTML based on your briefing."
  - button "Finalize Document" [disabled]:
    - img
    - text: Finalize Document
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
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 | import * as fs from 'fs/promises';
   3 | import * as path from 'path';
   4 |
   5 | test.describe('Poem Generator Workflow - Comprehensive Test with AI Redo', () => {
   6 |   test.beforeEach(async ({ page }) => {
   7 |     // Navigate to the poem generator workflow (shortName is "poem")
   8 |     await page.goto('/w/poem/new');
   9 |     
   10 |     // Wait for the wizard shell to load
>  11 |     await page.waitForSelector('[data-testid="wizard-shell"]', { timeout: 10000 });
      |                ^ TimeoutError: page.waitForSelector: Timeout 10000ms exceeded.
   12 |   });
   13 |
   14 |   test('Complete poem generation from start to finish with AI Redo', async ({ page }) => {
   15 |     // Step 1: Enter Poem Topic
   16 |     await test.step('Enter poem topic', async () => {
   17 |       await page.waitForSelector('[data-stage-id="poem-topic"]', { timeout: 10000 });
   18 |       
   19 |       const topicInput = page.locator('[data-stage-id="poem-topic"] textarea');
   20 |       await expect(topicInput).toBeVisible();
   21 |       await topicInput.fill('The beauty of autumn leaves changing colors');
   22 |       
   23 |       const processButton = page.locator('[data-stage-id="poem-topic"] button:has-text("Process Stage")');
   24 |       await processButton.click();
   25 |       
   26 |       // Wait for processing to complete
   27 |       await page.waitForSelector('[data-stage-id="poem-topic"] [data-testid="stage-output-area"]', { 
   28 |         state: 'visible',
   29 |         timeout: 30000 
   30 |       });
   31 |     });
   32 |
   33 |     // Step 2: Generate Poem with Title (Test AI Redo here)
   34 |     await test.step('Generate poem with title and test AI Redo', async () => {
   35 |       // This stage should auto-run due to dependencies, wait for it to complete
   36 |       await page.waitForSelector('[data-stage-id="generate-poem-with-title"] [data-testid="stage-output-area"]', { 
   37 |         state: 'visible',
   38 |         timeout: 45000 
   39 |       });
   40 |       
   41 |       // Capture the first output
   42 |       const firstOutput = await page.locator('[data-stage-id="generate-poem-with-title"] [data-testid="stage-output-area"]').textContent();
   43 |       console.log('First poem output:', firstOutput?.substring(0, 200) + '...');
   44 |       
   45 |       // Use AI Redo with Google Search grounding
   46 |       const aiRedoButton = page.locator('[data-stage-id="generate-poem-with-title"] button[title="AI Redo"]');
   47 |       await expect(aiRedoButton).toBeVisible();
   48 |       await aiRedoButton.click();
   49 |       
   50 |       // Wait for AI Redo dialog
   51 |       await page.waitForSelector('[role="dialog"]:has-text("AI Redo")', { timeout: 5000 });
   52 |       
   53 |       // Fill in redo instructions
   54 |       const redoInput = page.locator('[role="dialog"] textarea');
   55 |       await redoInput.fill('Make the poem more melancholic and nostalgic, with references to current autumn weather patterns');
   56 |       
   57 |       // Enable Google Search grounding
   58 |       const groundingCheckbox = page.locator('[role="dialog"] input[type="checkbox"]');
   59 |       await groundingCheckbox.check();
   60 |       
   61 |       // Click Redo button
   62 |       const confirmRedoButton = page.locator('[role="dialog"] button:has-text("Redo with AI")');
   63 |       await confirmRedoButton.click();
   64 |       
   65 |       // Wait for new output - use a more robust wait
   66 |       await page.waitForTimeout(3000); // Give time for the request to start
   67 |       await page.waitForFunction(() => {
   68 |         const output = document.querySelector('[data-stage-id="generate-poem-with-title"] [data-testid="stage-output-area"]');
   69 |         return output && output.textContent && output.textContent.trim().length > 100;
   70 |       }, { timeout: 45000 });
   71 |       
   72 |       const secondOutput = await page.locator('[data-stage-id="generate-poem-with-title"] [data-testid="stage-output-area"]').textContent();
   73 |       console.log('Second poem output after AI Redo:', secondOutput?.substring(0, 200) + '...');
   74 |       
   75 |       // Verify the output changed and contains expected elements
   76 |       expect(secondOutput).not.toBe(firstOutput);
   77 |       expect(secondOutput?.toLowerCase()).toContain('autumn');
   78 |     });
   79 |
   80 |     // Step 3: HTML Briefing (Optional)
   81 |     await test.step('Add HTML briefing (optional)', async () => {
   82 |       await page.waitForSelector('[data-stage-id="html-briefing"]', { timeout: 10000 });
   83 |       
   84 |       const briefingInput = page.locator('[data-stage-id="html-briefing"] textarea');
   85 |       await briefingInput.fill('Make it elegant with a dark theme, centered layout, and beautiful typography');
   86 |       
   87 |       const processButton = page.locator('[data-stage-id="html-briefing"] button:has-text("Process Stage")');
   88 |       await processButton.click();
   89 |       
   90 |       // Wait for processing to complete
   91 |       await page.waitForSelector('[data-stage-id="html-briefing"] [data-testid="stage-output-area"]', { 
   92 |         state: 'visible',
   93 |         timeout: 30000 
   94 |       });
   95 |     });
   96 |
   97 |     // Step 4: Generate HTML Preview (Final Output)
   98 |     await test.step('Generate HTML preview and save output', async () => {
   99 |       // This stage should auto-run, wait for it to complete
  100 |       await page.waitForSelector('[data-stage-id="generate-html-preview"] [data-testid="stage-output-area"]', { 
  101 |         state: 'visible',
  102 |         timeout: 45000 
  103 |       });
  104 |       
  105 |       // Capture the final HTML output
  106 |       const finalOutputElement = page.locator('[data-stage-id="generate-html-preview"] [data-testid="stage-output-area"]');
  107 |       const htmlContent = await finalOutputElement.innerHTML();
  108 |       const textContent = await finalOutputElement.textContent();
  109 |       
  110 |       // Create output directory
  111 |       const outputDir = path.join(process.cwd(), 'docs', 'test-outputs');
```