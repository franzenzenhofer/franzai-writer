# Test info

- Name: Poem Workflow with Image Generation >> should generate poem with image and include in HTML
- Location: /Users/franzenzenhofer/dev/franzai-writer/tests/e2e/poem-workflow-image-generation.spec.ts:10:7

# Error details

```
Error: locator.textContent: Test ended.
Call log:
  - waiting for locator('[data-stage-id="generate-poem-with-title"] .whitespace-pre-wrap')

    at /Users/franzenzenhofer/dev/franzai-writer/tests/e2e/poem-workflow-image-generation.spec.ts:29:111
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 |
   3 | test.describe('Poem Workflow with Image Generation', () => {
   4 |   test.beforeEach(async ({ page }) => {
   5 |     // Navigate to poem workflow
   6 |     await page.goto('/w/poem/new');
   7 |     await page.waitForLoadState('networkidle');
   8 |   });
   9 |
   10 |   test('should generate poem with image and include in HTML', async ({ page }) => {
   11 |     // Step 1: Enter poem topic
   12 |     const poemTopic = 'A majestic mountain at sunrise';
   13 |     // Find the first textarea on the page (poem topic input)
   14 |     await page.locator('textarea').first().fill(poemTopic);
   15 |     
   16 |     // Click continue to trigger poem generation
   17 |     const continueButton = page.locator('button:has-text("Continue")').first();
   18 |     await continueButton.click();
   19 |     
   20 |     // Step 2: Wait for poem generation to complete by checking for poem content
   21 |     await page.waitForSelector('text=Poem Title', {
   22 |       timeout: 30000
   23 |     });
   24 |     await page.waitForSelector('text=Poem Content', {
   25 |       timeout: 5000
   26 |     });
   27 |     
   28 |     // Verify poem was generated
>  29 |     const poemContent = await page.locator('[data-stage-id="generate-poem-with-title"] .whitespace-pre-wrap').textContent();
      |                                                                                                               ^ Error: locator.textContent: Test ended.
   30 |     expect(poemContent).toBeTruthy();
   31 |     expect(poemContent?.length).toBeGreaterThan(50);
   32 |     
   33 |     // Step 2a: Fill out the image briefing form
   34 |     // The image briefing stage should now be visible
   35 |     await page.waitForSelector('[data-stage-id="image-briefing"]', { timeout: 10000 });
   36 |     
   37 |     // Fill optional text field (can be empty)
   38 |     await page.locator('[data-stage-id="image-briefing"] textarea').fill('Beautiful mountain scenery');
   39 |     
   40 |     // Select aspect ratio (already defaulted to 3:4)
   41 |     // Select style (already defaulted to artistic)
   42 |     // Select number of images (already defaulted to 2)
   43 |     
   44 |     // Click continue to submit the form
   45 |     await page.locator('[data-stage-id="image-briefing"] button:has-text("Continue")').click();
   46 |     
   47 |     // Step 3: Wait for image generation to complete
   48 |     console.log('Waiting for image generation...');
   49 |     await page.waitForSelector('[data-stage-id="generate-poem-image"][data-stage-status="completed"]', {
   50 |       timeout: 60000 // Image generation can take longer
   51 |     });
   52 |     
   53 |     // Verify image was generated and displayed
   54 |     const imageElement = await page.locator('[data-stage-id="generate-poem-image"] img[alt*="Generated"]').first();
   55 |     await expect(imageElement).toBeVisible();
   56 |     
   57 |     // Get image URL
   58 |     const imageUrl = await imageElement.getAttribute('src');
   59 |     expect(imageUrl).toBeTruthy();
   60 |     
   61 |     // Check if it's a data URL or a public URL
   62 |     const isValidImageUrl = imageUrl?.startsWith('data:image/') || imageUrl?.includes('storage.googleapis.com');
   63 |     expect(isValidImageUrl).toBe(true);
   64 |     
   65 |     // Verify download button exists
   66 |     const downloadButton = page.locator('[data-stage-id="generate-poem-image"] button:has-text("Download")').first();
   67 |     await expect(downloadButton).toBeVisible();
   68 |     
   69 |     // Step 4: Check HTML generation includes the image
   70 |     // Wait for HTML preview to be generated
   71 |     await page.waitForSelector('[data-stage-id="generate-html-preview"][data-stage-status="completed"]', {
   72 |       timeout: 30000
   73 |     });
   74 |     
   75 |     // Get HTML preview content
   76 |     const htmlPreviewFrame = page.locator('[data-stage-id="generate-html-preview"] iframe').first();
   77 |     
   78 |     // Check if image is included in the HTML
   79 |     if (await htmlPreviewFrame.count() > 0) {
   80 |       // If HTML is in iframe
   81 |       const frame = page.frame({ url: /^data:/ });
   82 |       if (frame) {
   83 |         const htmlImage = frame.locator('img');
   84 |         await expect(htmlImage).toHaveCount(1);
   85 |         const htmlImageSrc = await htmlImage.getAttribute('src');
   86 |         expect(htmlImageSrc).toBe(imageUrl);
   87 |       }
   88 |     } else {
   89 |       // If HTML is rendered directly
   90 |       const htmlContent = await page.locator('[data-stage-id="generate-html-preview"] .prose').innerHTML();
   91 |       expect(htmlContent).toContain('<img');
   92 |       expect(htmlContent).toContain(imageUrl || '');
   93 |     }
   94 |     
   95 |     console.log('✅ Poem with image generation test passed!');
   96 |   });
   97 |
   98 |   test('should handle multiple aspect ratios', async ({ page }) => {
   99 |     // Enter poem topic
  100 |     await page.locator('textarea').first().fill( 'A peaceful forest');
  101 |     await page.locator('button:has-text("Continue")').first().click();
  102 |     
  103 |     // Wait for poem generation
  104 |     await page.waitForSelector('text=Poem Title', {
  105 |       timeout: 30000
  106 |     });
  107 |     await page.waitForSelector('text=Poem Content', {
  108 |       timeout: 5000
  109 |     });
  110 |     
  111 |     // Fill image briefing form with different aspect ratio
  112 |     await page.waitForSelector('[data-stage-id="image-briefing"]', { timeout: 10000 });
  113 |     
  114 |     // Select a different aspect ratio (16:9)
  115 |     await page.locator('[data-stage-id="image-briefing"] [name="aspectRatio"]').selectOption('16:9');
  116 |     await page.locator('[data-stage-id="image-briefing"] button:has-text("Continue")').click();
  117 |     
  118 |     // Wait for stages to complete
  119 |     await page.waitForSelector('[data-stage-id="generate-poem-image"][data-stage-status="completed"]', {
  120 |       timeout: 60000
  121 |     });
  122 |     
  123 |     // Check aspect ratio badge
  124 |     const aspectRatioBadge = page.locator('[data-stage-id="generate-poem-image"] .badge').first();
  125 |     await expect(aspectRatioBadge).toBeVisible();
  126 |     const aspectRatio = await aspectRatioBadge.textContent();
  127 |     expect(['1:1', '3:4', '4:3', '16:9', '9:16']).toContain(aspectRatio);
  128 |   });
  129 |
```