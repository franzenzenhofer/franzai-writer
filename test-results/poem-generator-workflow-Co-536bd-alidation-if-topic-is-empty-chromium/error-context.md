# Test info

- Name: Complete Poem Generator Workflow >> should show validation if topic is empty
- Location: /Users/franzenzenhofer/dev/franzai-writer/tests/e2e/poem-generator-workflow.spec.ts:49:7

# Error details

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('button:has-text("Process Stage")').first()

    at /Users/franzenzenhofer/dev/franzai-writer/tests/e2e/poem-generator-workflow.spec.ts:60:68
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
  - text: Last saved 12:23:55 PM Poem Topic What is the topic of your poem?
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
   2 |
   3 | test.describe('Complete Poem Generator Workflow', () => {
   4 |   test.beforeEach(async ({ page }) => {
   5 |     // Set demo mode for testing
   6 |     await page.goto('/dashboard');
   7 |   });
   8 |
   9 |   test('should create poem from start to finish', async ({ page }) => {
  10 |     // Navigate to poem generator workflow
  11 |     await page.click('#workflow-start-poem-generator');
  12 |
  13 |     // Wait for wizard to load
  14 |     await page.waitForURL('**/w/poem/**');
  15 |     await expect(page.getByTestId('wizard-page-title')).toBeVisible();
  16 |
  17 |     // Stage 1: Poem Topic
  18 |     const poemTopic = 'a beautiful sunny day';
  19 |     await page.locator('textarea').first().fill(poemTopic);
  20 |     await page.locator('button:has-text("Process Stage")').first().click();
  21 |     await page.waitForTimeout(2000); // Wait for processing
  22 |
  23 |     // Stage 2: Generate Poem - should auto-run
  24 |     // Wait for the poem to be generated (adjust timeout as needed)
  25 |     await page.waitForTimeout(5000);
  26 |
  27 |     // Verify all stages completed
  28 |     await expect(page.locator('text=2 / 2 Stages')).toBeVisible();
  29 |
  30 |     // Verify poem output is visible
  31 |     const poemOutput = page.getByTestId('stage-output-area-markdown');
  32 |     await expect(poemOutput).toBeVisible();
  33 |     await expect(poemOutput.locator('p')).toHaveCount(1); // Check for at least one paragraph in the poem
  34 |
  35 |     // Finalize document
  36 |     await expect(page.getByTestId('finalize-document-button')).toBeEnabled();
  37 |     await page.getByTestId('finalize-document-button').click();
  38 |
  39 |     // Verify final document dialog
  40 |     await expect(page.locator('text=Your document is ready!')).toBeVisible();
  41 |
  42 |     // Verify the title was set from the poem topic
  43 |     // Note: The title in the final document dialog might not update immediately
  44 |     // or might have a generic title. This depends on implementation.
  45 |     // For now, we'll check the wizard title was updated.
  46 |     await expect(page.getByTestId('wizard-page-title')).toContainText(poemTopic);
  47 |   });
  48 |
  49 |   test('should show validation if topic is empty', async ({ page }) => {
  50 |     await page.goto('/dashboard');
  51 |
  52 |     // Navigate to poem generator workflow
  53 |     await page.click('#workflow-start-poem-generator');
  54 |
  55 |     // Wait for wizard to load
  56 |     await page.waitForURL('**/w/poem/**');
  57 |     await expect(page.getByTestId('wizard-page-title')).toBeVisible();
  58 |
  59 |     // Try to process empty stage
> 60 |     await page.locator('button:has-text("Process Stage")').first().click();
     |                                                                    ^ Error: locator.click: Test timeout of 30000ms exceeded.
  61 |     await page.waitForTimeout(1000); // Wait for potential validation message or lack of progression
  62 |
  63 |     // Progress should still be 0
  64 |     await expect(page.locator('text=0 / 2 Stages')).toBeVisible();
  65 |
  66 |     // Ensure no error toast appeared for this specific action (optional, depends on app behavior)
  67 |     // await expect(page.locator('[data-testid="toast-error"]')).not.toBeVisible();
  68 |   });
  69 | });
  70 |
```