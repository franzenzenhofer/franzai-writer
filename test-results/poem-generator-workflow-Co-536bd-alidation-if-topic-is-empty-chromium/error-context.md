# Test info

- Name: Complete Poem Generator Workflow >> should show validation if topic is empty
- Location: /Users/franzenzenhofer/dev/franzai-writer/tests/e2e/poem-generator-workflow.spec.ts:50:7

# Error details

```
Error: page.waitForURL: Test timeout of 30000ms exceeded.
=========================== logs ===========================
waiting for navigation to "**/wizard/**" until "load"
  navigated to "http://localhost:9002/w/article/new"
============================================================
    at /Users/franzenzenhofer/dev/franzai-writer/tests/e2e/poem-generator-workflow.spec.ts:58:16
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
- main
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
- paragraph: Running in emulator mode. Do not use with production credentials.
- alert
- button "Open Next.js Dev Tools":
  - img
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 |
   3 | test.describe('Complete Poem Generator Workflow', () => {
   4 |   test.beforeEach(async ({ page }) => {
   5 |     // Set demo mode for testing
   6 |     await page.goto('/dashboard');
   7 |   });
   8 |
   9 |   test('should create poem from start to finish', async ({ page }) => {
  10 |     // Navigate to poem generator workflow
  11 |     await page.locator('text=Poem Generator').first().click();
  12 |     await page.locator('a:has-text("Start")').nth(0).click(); // First Start button
  13 |
  14 |     // Wait for wizard to load
  15 |     await page.waitForURL('**/wizard/**');
  16 |     await expect(page.getByTestId('wizard-page-title')).toContainText('Poem Generator');
  17 |
  18 |     // Stage 1: Poem Topic
  19 |     const poemTopic = 'a beautiful sunny day';
  20 |     await page.locator('textarea').first().fill(poemTopic);
  21 |     await page.locator('button:has-text("Process Stage")').first().click();
  22 |     await page.waitForTimeout(2000); // Wait for processing
  23 |
  24 |     // Stage 2: Generate Poem - should auto-run
  25 |     // Wait for the poem to be generated (adjust timeout as needed)
  26 |     await page.waitForTimeout(5000);
  27 |
  28 |     // Verify all stages completed
  29 |     await expect(page.locator('text=2 / 2 Stages')).toBeVisible();
  30 |
  31 |     // Verify poem output is visible
  32 |     const poemOutput = page.getByTestId('stage-output-area-markdown');
  33 |     await expect(poemOutput).toBeVisible();
  34 |     await expect(poemOutput.locator('p')).toHaveCount(1); // Check for at least one paragraph in the poem
  35 |
  36 |     // Finalize document
  37 |     await expect(page.getByTestId('finalize-document-button')).toBeEnabled();
  38 |     await page.getByTestId('finalize-document-button').click();
  39 |
  40 |     // Verify final document dialog
  41 |     await expect(page.locator('text=Your document is ready!')).toBeVisible();
  42 |
  43 |     // Verify the title was set from the poem topic
  44 |     // Note: The title in the final document dialog might not update immediately
  45 |     // or might have a generic title. This depends on implementation.
  46 |     // For now, we'll check the wizard title was updated.
  47 |     await expect(page.getByTestId('wizard-page-title')).toContainText(poemTopic);
  48 |   });
  49 |
  50 |   test('should show validation if topic is empty', async ({ page }) => {
  51 |     await page.goto('/dashboard');
  52 |
  53 |     // Navigate to poem generator workflow
  54 |     await page.locator('text=Poem Generator').first().click();
  55 |     await page.locator('a:has-text("Start")').nth(0).click();
  56 |
  57 |     // Wait for wizard to load
> 58 |     await page.waitForURL('**/wizard/**');
     |                ^ Error: page.waitForURL: Test timeout of 30000ms exceeded.
  59 |     await expect(page.getByTestId('wizard-page-title')).toContainText('Poem Generator');
  60 |
  61 |     // Try to process empty stage
  62 |     await page.locator('button:has-text("Process Stage")').first().click();
  63 |     await page.waitForTimeout(1000); // Wait for potential validation message or lack of progression
  64 |
  65 |     // Progress should still be 0
  66 |     await expect(page.locator('text=0 / 2 Stages')).toBeVisible();
  67 |
  68 |     // Ensure no error toast appeared for this specific action (optional, depends on app behavior)
  69 |     // await expect(page.locator('[data-testid="toast-error"]')).not.toBeVisible();
  70 |   });
  71 | });
  72 |
```