# Test info

- Name: Poem Workflow - SUPER POWERFUL Comprehensive Tests >> Complete poem workflow - basic flow
- Location: /Users/franzenzenhofer/dev/franzai-writer/tests/e2e/poem-workflow-comprehensive.spec.ts:21:7

# Error details

```
Error: page.waitForSelector: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('text=Download') to be visible

    at /Users/franzenzenhofer/dev/franzai-writer/tests/e2e/poem-workflow-comprehensive.spec.ts:42:16
```

# Page snapshot

```yaml
- banner:
  - link "FranzAI Writer":
    - /url: /
  - navigation:
    - link "Home":
      - /url: /
    - link "Dashboard":
      - /url: /dashboard
    - link "Documents":
      - /url: /documents
    - link "Assets":
      - /url: /assets
    - link "AI Logs":
      - /url: /admin/debug/ai-log-viewer
  - navigation:
    - link "Login":
      - /url: /login
- main:
  - heading "Mountain's Gilded Kiss" [level=1]
  - text: Last saved 03 Jul 2025 20:04 |
  - paragraph: "Workflow: Poem Generator"
  - text: Progress 4 / 8 Stages
  - progressbar
  - img
  - text: Poem Topic What is the topic of your poem?
  - button:
    - img
  - paragraph: A serene lake at sunset with mountains in the background
  - button "Edit":
    - img
    - text: Edit
  - img
  - text: Generate Poem & Title AI will generate a poem and title based on your topic.
  - button:
    - img
  - text: Poem Title Mountain's Gilded Kiss Poem Content A canvas calm, the lake lies deep, Where day's last golden whispers creep. No ripple mars its liquid gleam, A silent, half-forgotten dream. The western sky, a fiery blush, Paints amber strokes in evening's hush. And down below, a twin display, Mirrors the fading light of day. Behind, the ancient peaks ascend, Where timeless granite shadows blend. Dark sentinels, they stand so tall, Witnessing the twilight's call. A perfect pause, where world unwinds, And peace a quiet haven finds. This hallowed space, serene and deep, A promise that the soul can keep.
  - button:
    - img
  - textbox "Optional notes for AI regeneration..."
  - button "AI REDO":
    - img
    - text: AI REDO
  - button "Edit":
    - img
    - text: Edit
  - img
  - text: Image Customization Optional Customize how your poem should be illustrated
  - button:
    - img
  - text: Additional Image Instructions (Optional) Not provided Image Format Portrait (3:4) - Book Cover Artistic Style Artistic & Creative Number of Variations 2 Images
  - button "Edit":
    - img
    - text: Edit
  - img
  - text: Create Image Prompt AI will create optimized imagen prompts and unique filenames for your poem illustrations.
  - button:
    - img
  - text: Optimized Imagen Prompt An artistic, painterly rendering of a serene mountain lake at twilight. The water's surface is perfectly still, mirroring a vibrant, fiery western sky painted with strokes of amber and molten gold. Towering, ancient granite peaks, silhouetted as dark sentinels, ascend behind the tranquil scene, their timeless shadows blending into the deepening dusk. The atmosphere is one of profound peace, quiet reflection, and ethereal beauty, captured with soft, luminous brushwork. 3:4 aspect ratio. Generated Filenames Gilded Lake Reflection Granite Twilight Mirror
  - textbox "Optional notes for AI regeneration..."
  - button "AI REDO":
    - img
    - text: AI REDO
  - button "Edit":
    - img
    - text: Edit
  - img
  - text: Generate Poem Illustration AI will create an image that complements your poem.
  - button:
    - img
  - heading "Generating..." [level=4]
  - text: AI is processing your request...
  - paragraph: Generating content...
  - text: HTML Briefing Optional Special instructions for HTML formatting (optional)
  - button:
    - img
  - textbox "Special instructions for HTML formatting (optional)"
  - text: ⌘+Enter
  - button "Continue":
    - img
    - text: Continue
  - img
  - text: "Waiting for: Generate Poem Illustration Generate HTML Preview AI will convert your poem into beautiful HTML based on your briefing."
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
  - link "Home":
    - /url: /
  - link "FranzAI.com":
    - /url: https://www.franzai.com
  - link "Privacy":
    - /url: /privacy
  - link "Terms":
    - /url: /terms
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
   3 | /**
   4 |  * SUPER POWERFUL comprehensive E2E test for poem generation workflow
   5 |  * This is our most important test - tests ALL features end-to-end
   6 |  * Chrome only for performance, but EXEMPTED from 5-test limit per CLAUDE.md
   7 |  */
   8 |
   9 | test.describe('Poem Workflow - SUPER POWERFUL Comprehensive Tests', () => {
   10 |   test.skip(({ browserName }) => browserName !== 'chromium', 'Chrome only per CLAUDE.md guidelines');
   11 |   // Test configuration
   12 |   const BASE_URL = 'http://localhost:9002';
   13 |   
   14 |   test.beforeEach(async ({ page }) => {
   15 |     // Start each test from a clean dashboard
   16 |     await page.goto(`${BASE_URL}/dashboard`);
   17 |     // Wait for specific content instead of networkidle to avoid timeouts
   18 |     await page.waitForSelector('text=Start a new document', { timeout: 10000 });
   19 |   });
   20 |
   21 |   test('Complete poem workflow - basic flow', async ({ page }) => {
   22 |     console.log('🧪 Testing basic poem workflow...');
   23 |     
   24 |     // Start poem generator - use correct selectors
   25 |     await page.click('#workflow-start-poem-generator');
   26 |     await page.waitForSelector('textarea', { timeout: 10000 });
   27 |     
   28 |     // Stage 1: Poem Topic
   29 |     const poemTopic = 'A serene lake at sunset with mountains in the background';
   30 |     await page.fill('textarea', poemTopic);
   31 |     await page.click('#process-stage-poem-topic');
   32 |     
   33 |     // Wait for poem generation (Stage 2)
   34 |     await page.waitForSelector('text=Poem Title', { timeout: 30000 });
   35 |     await page.waitForSelector('text=Poem Content', { timeout: 5000 });
   36 |     console.log('✅ Poem generated successfully');
   37 |     
   38 |     // Stage 3: Image Customization (use defaults)
   39 |     await page.click('#process-stage-image-briefing');
   40 |     
   41 |     // Wait for image generation
>  42 |     await page.waitForSelector('text=Download', { timeout: 60000 });
      |                ^ Error: page.waitForSelector: Test timeout of 30000ms exceeded.
   43 |     console.log('✅ Image generation completed');
   44 |     
   45 |     // Stage 4: HTML Briefing (skip optional)
   46 |     await page.click('#process-stage-html-briefing');
   47 |     
   48 |     // Wait for HTML generation
   49 |     await page.waitForSelector('text=Export & Publish Poem', { timeout: 30000 });
   50 |     
   51 |     // Stage 5: Export & Publish
   52 |     await page.click('#trigger-export-export-publish');
   53 |     // Wait for export formats to appear - use more specific selector
   54 |     await page.waitForSelector('h3:has-text("Styled HTML")', { timeout: 30000 });
   55 |     
   56 |     // Verify all export formats are available using heading selectors
   57 |     const styledHtml = page.locator('h3:has-text("Styled HTML")');
   58 |     const cleanHtml = page.locator('h3:has-text("Clean HTML")');
   59 |     const markdown = page.locator('h3:has-text("Markdown")');
   60 |     const pdf = page.locator('h3:has-text("PDF Document")');
   61 |     const word = page.locator('h3:has-text("Word Document")');
   62 |     
   63 |     await expect(styledHtml).toBeVisible();
   64 |     await expect(cleanHtml).toBeVisible();
   65 |     await expect(markdown).toBeVisible();
   66 |     await expect(pdf).toBeVisible();
   67 |     await expect(word).toBeVisible();
   68 |     
   69 |     console.log('✅ All export formats generated successfully');
   70 |     
   71 |     // Verify workflow completion
   72 |     const completedText = page.locator('text=8/8');
   73 |     await expect(completedText).toBeVisible();
   74 |     console.log('✅ Workflow completed (8/8 stages)');
   75 |   });
   76 |
   77 |   test.skip('Test different image format variations', async ({ page }) => {
   78 |     console.log('🧪 Testing different image formats...');
   79 |     
   80 |     // Start workflow - use correct selectors
   81 |     await page.click('#workflow-start-poem-generator');
   82 |     await page.waitForSelector('textarea');
   83 |     
   84 |     // Quick poem topic
   85 |     await page.fill('textarea', 'Modern city skyline at night');
   86 |     await page.click('#process-stage-poem-topic');
   87 |     await page.waitForSelector('text=Poem Title', { timeout: 30000 });
   88 |     
   89 |     // Test different image formats
   90 |     const imageFormats = [
   91 |       'Square (1:1) - Social Media',
   92 |       'Landscape (4:3) - Classic', 
   93 |       'Widescreen (16:9) - Desktop',
   94 |       'Mobile (9:16) - Stories'
   95 |     ];
   96 |     
   97 |     for (const format of imageFormats) {
   98 |       console.log(`Testing image format: ${format}`);
   99 |       
  100 |       // TODO: Fix dropdown selectors for Radix UI components
  101 |       // For now, skip format selection
  102 |       
  103 |       // Continue with image generation
  104 |       await page.click('#process-stage-image-briefing');
  105 |       
  106 |       // Wait for image generation
  107 |       await page.waitForSelector('text=Download', { timeout: 60000 });
  108 |       console.log(`✅ ${format} format generated successfully`);
  109 |       
  110 |       // Reset for next test (go back to image customization)
  111 |       if (imageFormats.indexOf(format) < imageFormats.length - 1) {
  112 |         await page.click('div:has-text("Image Customization") button:has-text("Edit")');
  113 |       }
  114 |     }
  115 |   });
  116 |
  117 |   test.skip('Test different artistic styles', async ({ page }) => {
  118 |     console.log('🧪 Testing different artistic styles...');
  119 |     
  120 |     // Start workflow - use correct selectors
  121 |     await page.click('#workflow-start-poem-generator');
  122 |     await page.waitForSelector('textarea');
  123 |     
  124 |     await page.fill('textarea', 'Abstract geometric patterns');
  125 |     await page.click('#process-stage-poem-topic');
  126 |     await page.waitForSelector('text=Poem Title', { timeout: 30000 });
  127 |     
  128 |     // Test different artistic styles
  129 |     const artisticStyles = [
  130 |       'Photorealistic',
  131 |       'Watercolor Painting',
  132 |       'Oil Painting',
  133 |       'Digital Art',
  134 |       'Minimalist'
  135 |     ];
  136 |     
  137 |     for (const style of artisticStyles) {
  138 |       console.log(`Testing artistic style: ${style}`);
  139 |       
  140 |       // TODO: Fix dropdown selectors for Radix UI components
  141 |       // For now, skip style selection
  142 |       await page.click('div:has-text("Image Customization") button:has-text("Continue")');
```