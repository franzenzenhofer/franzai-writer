# Test info

- Name: Export Stage - Working Functionality >> should verify export content quality
- Location: /Users/franzenzenhofer/dev/franzai-writer/tests/e2e/export-stage-working.spec.ts:90:7

# Error details

```
Error: expect(locator).toBeVisible()

Locator: locator('text=✅').first()
Expected: visible
Received: <element(s) not found>
Call log:
  - expect.toBeVisible with timeout 120000ms
  - waiting for locator('text=✅').first()

    at /Users/franzenzenhofer/dev/franzai-writer/tests/e2e/export-stage-working.spec.ts:102:50
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
  - 'heading "Summit''s Echo: A Content Quality Test" [level=1]'
  - text: Last saved 21 Jun 2025 21:47 |
  - paragraph: "Workflow: Poem Generator"
  - text: Progress 2 / 8 Stages
  - progressbar
  - img
  - text: Poem Topic What is the topic of your poem?
  - button:
    - img
  - paragraph: Testing export content quality with a beautiful poem about mountains
  - button "Edit":
    - img
    - text: Edit
  - img
  - text: Generate Poem & Title AI will generate a poem and title based on your topic.
  - button:
    - img
  - text: "Poem Title Summit's Echo: A Content Quality Test Poem Content The peaks ascend, a jagged, frosted script, Each crag a pixel in a granite glyph. We test the clarity, the visual might, If every detail shines, a perfect light. Does the content render, sharp and true? A mountain's majesty, for me and you. From azure valleys, where the rivers gleam, To summits veiled in an ethereal dream, We probe the format, every font and line, Ensuring beauty, flawlessly divine. No glitch, no stutter, just a pristine view, Of nature's canvas, painted fresh and new. Consider avalanches, carving paths below, Each falling flake, a data point to know. We stress the system, push beyond the norm, To weather storms, and keep the content warm. No broken link, no error to be found, Just solid ground, on consecrated ground. So let the mountains stand, a testament clear, To quality assured, dispelling every fear. The export passes, with a vista grand, A testament to effort, close at hand. A perfect image, etched against the sky, A content kingdom, reaching ever high."
  - button:
    - img
  - textbox "Optional notes for AI regeneration..."
  - button "AI REDO":
    - img
    - text: AI REDO
  - button "Edit":
    - img
    - text: Edit
  - text: Image Customization Optional Customize how your poem should be illustrated
  - button:
    - img
  - text: Additional Image Instructions (Optional)
  - textbox "Add any specific details you'd like in the image (e.g., 'warm colors', 'dramatic lighting', 'peaceful mood')"
  - paragraph
  - text: Image Format
  - combobox: Portrait (3:4) - Book Cover
  - text: Artistic Style
  - combobox: Artistic & Creative
  - text: Number of Variations
  - combobox: 2 Images
  - button "Continue":
    - img
    - text: Continue
  - img
  - text: "Waiting for: Image Customization Create Image Prompt AI will create optimized imagen prompts and unique filenames for your poem illustrations."
  - button:
    - img
  - img
  - text: "Waiting for: Create Image Prompt Generate Poem Illustration AI will create an image that complements your poem."
  - button:
    - img
  - text: HTML Briefing Optional Special instructions for HTML formatting (optional)
  - button:
    - img
  - textbox "Special instructions for HTML formatting (optional)"
  - button "Continue":
    - img
    - text: Continue
  - img
  - text: "Waiting for: Generate Poem Illustration, Image Customization Generate HTML Preview AI will convert your poem into beautiful HTML based on your briefing."
  - button:
    - img
  - text: Export & Publish Transform your poem into professional formats and publish instantly
  - button:
    - img
  - img
  - text: "Waiting for: Generate HTML Preview"
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
   24 |     await expect(page.locator('text=✅').first()).toBeVisible({ timeout: 120000 });
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
> 102 |     await expect(page.locator('text=✅').first()).toBeVisible({ timeout: 120000 });
      |                                                  ^ Error: expect(locator).toBeVisible()
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
  125 |     const htmlCleanText = page.locator('text=HTML (Clean)');
  126 |     const markdownText = page.locator('text=Markdown');
  127 |     
  128 |     await expect(htmlStyledText).toBeVisible();
  129 |     await expect(htmlCleanText).toBeVisible();
  130 |     await expect(markdownText).toBeVisible();
  131 |     
  132 |     console.log('✅ All export formats visible and ready');
  133 |   });
  134 |
  135 | });
```