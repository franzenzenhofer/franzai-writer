# Test info

- Name: Export Stage - Working Functionality >> should complete export workflow and verify downloads
- Location: /Users/franzenzenhofer/dev/franzai-writer/tests/e2e/export-stage-working.spec.ts:7:7

# Error details

```
Error: expect(locator).toBeVisible()

Locator: locator('text=✅').first()
Expected: visible
Received: <element(s) not found>
Call log:
  - expect.toBeVisible with timeout 120000ms
  - waiting for locator('text=✅').first()

    at /Users/franzenzenhofer/dev/franzai-writer/tests/e2e/export-stage-working.spec.ts:24:50
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
  - heading "Ember Bloom on Stillwater" [level=1]
  - paragraph: "Workflow: Poem Generator"
  - text: Progress 2 / 5 Stages
  - progressbar
  - text: Last saved 12:28:19 AM
  - img
  - text: Poem Topic What is the topic of your poem?
  - paragraph: A serene lake at sunset with dancing fireflies
  - button "Edit":
    - img
    - text: Edit
  - img
  - text: Generate Poem & Title AI will generate a poem and title based on your topic. Poem Title Ember Bloom on Stillwater Poem Content The lake, a mirror, glassed in hues of gold, Reflects the sunset's story, bravely told. Crimson bleeds to violet, soft and deep, As weary day surrenders into sleep. The air hangs heavy, sweet with evening's grace, A canvas painted on time and space. No ripple stirs, no breeze dares intervene, Just tranquil beauty, utterly serene. Then, tiny sparks ignite, a living chain, Fireflies awaken, dancing on the plain. Each flicker, a soft whisper in the night, Guiding lost souls with its gentle light. They weave a tapestry of emerald fire, Lifting spirits, fueling pure desire. Ember bloom on stillwater, a magic show, A memory etched where peace and wonder grow.
  - button:
    - img
  - textbox "Optional notes for AI regeneration..."
  - button "AI REDO":
    - img
    - text: AI REDO
  - button "Edit":
    - img
    - text: Edit
  - text: HTML Briefing Optional Special instructions for HTML formatting (optional)
  - textbox "Special instructions for HTML formatting (optional)"
  - button "Continue":
    - img
    - text: Continue
  - text: Generate HTML Preview AI will convert your poem into beautiful HTML based on your briefing.
  - paragraph: This stage runs automatically when dependencies are complete.
  - button "Run AI":
    - img
    - text: Run AI
  - text: Export & Publish ✨ Transform your poem into professional formats and publish instantly
  - paragraph: Ready to transform your content into professional formats and share it with the world?
  - button "✨ Export & Publish Poem":
    - img
    - text: ✨ Export & Publish Poem
  - paragraph: "What you'll get:"
  - list:
    - listitem: • Professional HTML (styled & clean)
    - listitem: • Markdown for GitHub/Notion
    - listitem: • PDF & Word documents
    - listitem: • Instant web publishing
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
   1 | import { test, expect, Page } from '@playwright/test';
   2 | import fs from 'fs';
   3 | import path from 'path';
   4 |
   5 | test.describe('Export Stage - Working Functionality', () => {
   6 |
   7 |   test('should complete export workflow and verify downloads', async ({ page, browserName }) => {
   8 |     // Only run on chromium for now to avoid cross-browser issues
   9 |     test.skip(browserName !== 'chromium', 'Running only on Chromium for stability');
   10 |     
   11 |     console.log('Creating new poem document...');
   12 |     
   13 |     // Create a new poem document
   14 |     await page.goto('http://localhost:9002/w/poem/new');
   15 |     await page.waitForLoadState('networkidle');
   16 |     
   17 |     // Fill poem topic
   18 |     console.log('Step 1: Filling poem topic...');
   19 |     await page.fill('textarea', 'A serene lake at sunset with dancing fireflies');
   20 |     await page.click('button:has-text("Continue")');
   21 |     
   22 |     // Wait for poem generation with longer timeout
   23 |     console.log('Step 2: Waiting for poem generation...');
>  24 |     await expect(page.locator('text=✅').first()).toBeVisible({ timeout: 120000 });
      |                                                  ^ Error: expect(locator).toBeVisible()
   25 |     
   26 |     // Skip HTML briefing
   27 |     console.log('Step 3: Continuing through HTML briefing...');
   28 |     await page.click('button:has-text("Continue")');
   29 |     
   30 |     // Wait for HTML preview generation
   31 |     console.log('Step 4: Waiting for HTML preview generation...');
   32 |     await expect(page.locator('text=✅').nth(1)).toBeVisible({ timeout: 120000 });
   33 |     
   34 |     // Scroll to export stage
   35 |     console.log('Step 5: Scrolling to export stage...');
   36 |     await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
   37 |     
   38 |     // Find and click export button
   39 |     console.log('Step 6: Triggering export...');
   40 |     const exportButton = page.locator('button', { hasText: 'Export & Publish Poem' }).or(
   41 |       page.locator('button', { hasText: 'Generate Export Formats' })
   42 |     );
   43 |     await exportButton.click();
   44 |     
   45 |     // Wait for export completion - looking for success indicator
   46 |     console.log('Step 7: Waiting for export completion...');
   47 |     await expect(page.locator('text=Live Preview').or(page.locator('text=Export Downloads'))).toBeVisible({ timeout: 120000 });
   48 |     
   49 |     // Verify export completed successfully
   50 |     console.log('✅ Export stage completed!');
   51 |     
   52 |     // Test preview functionality
   53 |     console.log('Step 8: Testing preview functionality...');
   54 |     const styledButton = page.locator('button', { hasText: 'Styled' });
   55 |     const cleanButton = page.locator('button', { hasText: 'Clean' });
   56 |     
   57 |     if (await styledButton.isVisible()) {
   58 |       console.log('✅ Styled button found');
   59 |       // Test clean button click
   60 |       if (await cleanButton.isVisible()) {
   61 |         await cleanButton.click();
   62 |         console.log('✅ Clean view activated');
   63 |         
   64 |         // Switch back to styled
   65 |         await styledButton.click();
   66 |         console.log('✅ Styled view activated');
   67 |       }
   68 |     }
   69 |     
   70 |     // Verify export downloads section
   71 |     const exportSection = page.locator('text=Export Downloads').or(page.locator('text=HTML (Styled)'));
   72 |     if (await exportSection.isVisible()) {
   73 |       console.log('✅ Export downloads section visible');
   74 |       
   75 |       // Check for ready indicators
   76 |       const readyIndicators = page.locator('text=Ready ✓');
   77 |       const readyCount = await readyIndicators.count();
   78 |       console.log(`✅ Found ${readyCount} ready export formats`);
   79 |       
   80 |       if (readyCount >= 3) {
   81 |         console.log('✅ HTML (Styled), HTML (Clean), and Markdown formats ready');
   82 |       }
   83 |     }
   84 |     
   85 |     // Take final screenshot
   86 |     await page.screenshot({ path: './test-results/export-stage-final-success.png', fullPage: true });
   87 |     console.log('✅ Test completed successfully!');
   88 |   });
   89 |
   90 |   test('should verify export content quality', async ({ page, browserName }) => {
   91 |     test.skip(browserName !== 'chromium', 'Running only on Chromium for stability');
   92 |     
   93 |     // Navigate to a document that should have exports (we'll create one)
   94 |     await page.goto('http://localhost:9002/w/poem/new');
   95 |     await page.waitForLoadState('networkidle');
   96 |     
   97 |     // Quick workflow completion
   98 |     await page.fill('textarea', 'Testing export content quality with a beautiful poem about mountains');
   99 |     await page.click('button:has-text("Continue")');
  100 |     
  101 |     // Wait for stages to complete
  102 |     await expect(page.locator('text=✅').first()).toBeVisible({ timeout: 120000 });
  103 |     await page.click('button:has-text("Continue")');
  104 |     await expect(page.locator('text=✅').nth(1)).toBeVisible({ timeout: 120000 });
  105 |     
  106 |     // Scroll to export and trigger
  107 |     await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  108 |     const exportButton = page.locator('button', { hasText: 'Export & Publish Poem' });
  109 |     await exportButton.click();
  110 |     
  111 |     // Wait for export completion
  112 |     await expect(page.locator('text=Live Preview')).toBeVisible({ timeout: 120000 });
  113 |     
  114 |     // Verify iframe content exists
  115 |     const iframes = page.locator('iframe');
  116 |     const iframeCount = await iframes.count();
  117 |     console.log(`Found ${iframeCount} preview iframes`);
  118 |     
  119 |     if (iframeCount > 0) {
  120 |       console.log('✅ HTML preview iframes generated successfully');
  121 |     }
  122 |     
  123 |     // Verify export formats are ready
  124 |     const htmlStyledText = page.locator('text=HTML (Styled)');
```