# Test info

- Name: Complete Poem Generator Workflow >> should create poem from start to finish
- Location: /Users/franzenzenhofer/dev/franzai-writer/tests/e2e/poem-generator-workflow.spec.ts:9:7

# Error details

```
Error: page.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('#workflow-start-poem-generator')

    at /Users/franzenzenhofer/dev/franzai-writer/tests/e2e/poem-generator-workflow.spec.ts:11:16
```

# Page snapshot

```yaml
- alert
- button "Open Next.js Dev Tools":
  - img
- button "Open issues overlay": 1 Issue
- navigation:
  - button "previous" [disabled]:
    - img "previous"
  - text: 1/1
  - button "next" [disabled]:
    - img "next"
- img
- img
- text: Next.js 15.3.3 Webpack
- img
- dialog "Build Error":
  - text: Build Error
  - button "Copy Stack Trace":
    - img
  - button "No related documentation found" [disabled]:
    - img
  - link "Learn more about enabling Node.js inspector for server code with Chrome DevTools":
    - /url: https://nextjs.org/docs/app/building-your-application/configuring/debugging#server-side-code
    - img
  - paragraph: "Module parse failed: Identifier 'result' has already been declared (120:18)"
  - img
  - text: ./src/lib/google-genai/modules/tools.ts
  - button "Open in editor":
    - img
  - text: "Module parse failed: Identifier 'result' has already been declared (120:18) | } | } > const result = { | text: response.text() || '', | functionCalls: functionCalls.length > 0 ? functionCalls : undefined,"
- contentinfo:
  - paragraph: This error occurred during the build process and can only be dismissed by fixing the error.
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
> 11 |     await page.click('#workflow-start-poem-generator');
     |                ^ Error: page.click: Test timeout of 30000ms exceeded.
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
  60 |     await page.locator('button:has-text("Process Stage")').first().click();
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