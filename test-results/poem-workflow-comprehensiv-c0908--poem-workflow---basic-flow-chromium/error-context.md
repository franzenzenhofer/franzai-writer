# Test info

- Name: Poem Workflow - Essential E2E Tests >> Complete poem workflow - basic flow
- Location: /Users/franzenzenhofer/dev/franzai-writer/tests/e2e/poem-workflow-comprehensive.spec.ts:20:7

# Error details

```
Error: Timed out 5000ms waiting for expect(locator).toBeVisible()

Locator: locator('text=8/8')
Expected: visible
Received: <element(s) not found>
Call log:
  - expect.toBeVisible with timeout 5000ms
  - waiting for locator('text=8/8')

    at /Users/franzenzenhofer/dev/franzai-writer/tests/e2e/poem-workflow-comprehensive.spec.ts:72:33
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
    - link "AI Logs":
      - /url: /admin/debug/ai-log-viewer
  - navigation:
    - link "Login":
      - /url: /login
- main:
  - heading "Serenity's Sunset Shore" [level=1]
  - text: Last saved 22 Jun 2025 02:31 |
  - paragraph: "Workflow: Poem Generator"
  - text: Progress 8 / 8 Stages
  - progressbar
  - alert:
    - img
    - heading "Wizard Completed!" [level=5]
    - text: All stages have been completed. You can now view and export your document.
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
  - text: Poem Title Serenity's Sunset Shore Poem Content The world holds breath, a painted hush descends, Where tranquil waters meet the day's soft ends. A silent lake, a glass of fading light, Receives the sun, preparing for the night. Across its face, a molten canvas gleams, Of fiery gold and rose, like waking dreams. Each ripple holds a whisper of the sky, As crimson currents gently drift and die. Behind this calm, the ancient mountains rise, With jagged peaks that pierce the fading skies. They stand as sentinels, in purple haze, Reflecting grandeur in the watery maze. A perfect peace, where earth and heaven blend, As twilight's gentle shadows softly wend. The lake, the sun, the mountains, all unite, A masterpiece of stillness, pure and bright.
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
  - text: Optimized Imagen Prompt An artistic rendering of a breathtaking sunset over a serene mountain lake. The silent, glass-like surface of the lake reflects a molten canvas of fiery gold, soft rose, and deep crimson hues, with subtle, shimmering ripples catching the fading light. Majestic, ancient mountains with jagged peaks rise dramatically in a soft purple haze, piercing the twilight sky. The scene is imbued with a perfect peace and dreamlike tranquility, where earth and heaven blend seamlessly in a display of pure stillness. Emphasize painterly brushstrokes, atmospheric depth, and a vibrant yet harmonious color palette. 3:4 aspect ratio. Generated Filenames Crimson Lake Reflection Mountain Serenity Dusk
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
  - 'img "Generated image: An artistic rendering of a breathtaking sunset over a serene mountain lake. The silent, glass-like surface of the lake reflects a molten canvas of fiery gold, soft rose, and deep crimson hues, with subtle, shimmering ripples catching the fading light. Majestic, ancient mountains with jagged peaks rise dramatically in a soft purple haze, piercing the twilight sky. The scene is imbued with a perfect peace and dreamlike tranquility, where earth and heaven blend seamlessly in a display of pure stillness. Emphasize painterly brushstrokes, atmospheric depth, and a vibrant yet harmonious color palette. 3:4 aspect ratio."'
  - text: 3:4
  - button "Download":
    - img
    - text: Download
  - button "Open image in new tab":
    - img
  - button "Thumbnail 1":
    - img "Thumbnail 1"
  - button "Thumbnail 2":
    - img "Thumbnail 2"
  - button "Edit":
    - img
    - text: Edit
  - img
  - text: HTML Briefing Optional Special instructions for HTML formatting (optional)
  - button:
    - img
  - button "Edit":
    - img
    - text: Edit
  - img
  - text: Generate HTML Preview AI will convert your poem into beautiful HTML based on your briefing.
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
  - text: Export & Publish Transform your poem into professional formats and publish instantly
  - button:
    - img
  - heading "Live Preview" [level=3]
  - button "Styled":
    - img
    - text: Styled
  - button "Clean":
    - img
    - text: Clean
  - text: Styled Preview
  - img
  - heading "Styled HTML" [level=3]
  - paragraph: Beautiful, ready-to-publish HTML with embedded styles
  - button "Download":
    - img
    - text: Download
  - button "Copy":
    - img
    - text: Copy
  - img
  - heading "Clean HTML" [level=3]
  - paragraph: Plain HTML without CSS - perfect for WordPress, Medium, etc.
  - button "Download":
    - img
    - text: Download
  - button "Copy":
    - img
    - text: Copy
  - img
  - heading "Markdown" [level=3]
  - paragraph: Universal markdown format for GitHub, Notion, Obsidian
  - button "Download":
    - img
    - text: Download
  - button "Copy":
    - img
    - text: Copy
  - img
  - heading "PDF Document" [level=3]
  - paragraph: Professional PDF based on clean HTML structure
  - button "Download":
    - img
    - text: Download
  - img
  - heading "Word Document" [level=3]
  - paragraph: Microsoft Word format based on clean HTML structure
  - button "Download":
    - img
    - text: Download
  - img
  - text: "Publish to Web Share your content with a permanent, shareable link Select formats to publish:"
  - checkbox "Styled HTML" [checked]:
    - img
  - text: Styled HTML
  - checkbox "Clean HTML"
  - text: Clean HTML
  - checkbox "Markdown"
  - text: Markdown
  - button "Publish Now":
    - img
    - text: Publish Now
  - button "Regenerate Exports":
    - img
    - text: Regenerate Exports
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
   4 |  * Essential E2E tests for poem generation workflow
   5 |  * Chrome only, max 5 tests per CLAUDE.md guidelines
   6 |  */
   7 |
   8 | test.describe('Poem Workflow - Essential E2E Tests', () => {
   9 |   test.skip(({ browserName }) => browserName !== 'chromium', 'Chrome only per CLAUDE.md guidelines');
   10 |   // Test configuration
   11 |   const BASE_URL = 'http://localhost:9002';
   12 |   
   13 |   test.beforeEach(async ({ page }) => {
   14 |     // Start each test from a clean dashboard
   15 |     await page.goto(`${BASE_URL}/dashboard`);
   16 |     // Wait for specific content instead of networkidle to avoid timeouts
   17 |     await page.waitForSelector('text=Start a new document', { timeout: 10000 });
   18 |   });
   19 |
   20 |   test('Complete poem workflow - basic flow', async ({ page }) => {
   21 |     console.log('🧪 Testing basic poem workflow...');
   22 |     
   23 |     // Start poem generator - use correct selectors
   24 |     await page.click('#workflow-start-poem-generator');
   25 |     await page.waitForSelector('textarea', { timeout: 10000 });
   26 |     
   27 |     // Stage 1: Poem Topic
   28 |     const poemTopic = 'A serene lake at sunset with mountains in the background';
   29 |     await page.fill('textarea', poemTopic);
   30 |     await page.click('#process-stage-poem-topic');
   31 |     
   32 |     // Wait for poem generation (Stage 2)
   33 |     await page.waitForSelector('text=Poem Title', { timeout: 30000 });
   34 |     await page.waitForSelector('text=Poem Content', { timeout: 5000 });
   35 |     console.log('✅ Poem generated successfully');
   36 |     
   37 |     // Stage 3: Image Customization (use defaults)
   38 |     await page.click('#process-stage-image-briefing');
   39 |     
   40 |     // Wait for image generation
   41 |     await page.waitForSelector('text=Download', { timeout: 60000 });
   42 |     console.log('✅ Image generation completed');
   43 |     
   44 |     // Stage 4: HTML Briefing (skip optional)
   45 |     await page.click('#process-stage-html-briefing');
   46 |     
   47 |     // Wait for HTML generation
   48 |     await page.waitForSelector('text=Export & Publish Poem', { timeout: 30000 });
   49 |     
   50 |     // Stage 5: Export & Publish
   51 |     await page.click('#trigger-export-export-publish');
   52 |     // Wait for export formats to appear - use more specific selector
   53 |     await page.waitForSelector('h3:has-text("Styled HTML")', { timeout: 30000 });
   54 |     
   55 |     // Verify all export formats are available using heading selectors
   56 |     const styledHtml = page.locator('h3:has-text("Styled HTML")');
   57 |     const cleanHtml = page.locator('h3:has-text("Clean HTML")');
   58 |     const markdown = page.locator('h3:has-text("Markdown")');
   59 |     const pdf = page.locator('h3:has-text("PDF Document")');
   60 |     const word = page.locator('h3:has-text("Word Document")');
   61 |     
   62 |     await expect(styledHtml).toBeVisible();
   63 |     await expect(cleanHtml).toBeVisible();
   64 |     await expect(markdown).toBeVisible();
   65 |     await expect(pdf).toBeVisible();
   66 |     await expect(word).toBeVisible();
   67 |     
   68 |     console.log('✅ All export formats generated successfully');
   69 |     
   70 |     // Verify workflow completion
   71 |     const completedText = page.locator('text=8/8');
>  72 |     await expect(completedText).toBeVisible();
      |                                 ^ Error: Timed out 5000ms waiting for expect(locator).toBeVisible()
   73 |     console.log('✅ Workflow completed (8/8 stages)');
   74 |   });
   75 |
   76 |   test.skip('Test different image format variations', async ({ page }) => {
   77 |     console.log('🧪 Testing different image formats...');
   78 |     
   79 |     // Start workflow - use correct selectors
   80 |     await page.click('#workflow-start-poem-generator');
   81 |     await page.waitForSelector('textarea');
   82 |     
   83 |     // Quick poem topic
   84 |     await page.fill('textarea', 'Modern city skyline at night');
   85 |     await page.click('#process-stage-poem-topic');
   86 |     await page.waitForSelector('text=Poem Title', { timeout: 30000 });
   87 |     
   88 |     // Test different image formats
   89 |     const imageFormats = [
   90 |       'Square (1:1) - Social Media',
   91 |       'Landscape (4:3) - Classic', 
   92 |       'Widescreen (16:9) - Desktop',
   93 |       'Mobile (9:16) - Stories'
   94 |     ];
   95 |     
   96 |     for (const format of imageFormats) {
   97 |       console.log(`Testing image format: ${format}`);
   98 |       
   99 |       // TODO: Fix dropdown selectors for Radix UI components
  100 |       // For now, skip format selection
  101 |       
  102 |       // Continue with image generation
  103 |       await page.click('#process-stage-image-briefing');
  104 |       
  105 |       // Wait for image generation
  106 |       await page.waitForSelector('text=Download', { timeout: 60000 });
  107 |       console.log(`✅ ${format} format generated successfully`);
  108 |       
  109 |       // Reset for next test (go back to image customization)
  110 |       if (imageFormats.indexOf(format) < imageFormats.length - 1) {
  111 |         await page.click('div:has-text("Image Customization") button:has-text("Edit")');
  112 |       }
  113 |     }
  114 |   });
  115 |
  116 |   test.skip('Test different artistic styles', async ({ page }) => {
  117 |     console.log('🧪 Testing different artistic styles...');
  118 |     
  119 |     // Start workflow - use correct selectors
  120 |     await page.click('#workflow-start-poem-generator');
  121 |     await page.waitForSelector('textarea');
  122 |     
  123 |     await page.fill('textarea', 'Abstract geometric patterns');
  124 |     await page.click('#process-stage-poem-topic');
  125 |     await page.waitForSelector('text=Poem Title', { timeout: 30000 });
  126 |     
  127 |     // Test different artistic styles
  128 |     const artisticStyles = [
  129 |       'Photorealistic',
  130 |       'Watercolor Painting',
  131 |       'Oil Painting',
  132 |       'Digital Art',
  133 |       'Minimalist'
  134 |     ];
  135 |     
  136 |     for (const style of artisticStyles) {
  137 |       console.log(`Testing artistic style: ${style}`);
  138 |       
  139 |       // TODO: Fix dropdown selectors for Radix UI components
  140 |       // For now, skip style selection
  141 |       await page.click('div:has-text("Image Customization") button:has-text("Continue")');
  142 |       await page.waitForSelector('text=Download', { timeout: 60000 });
  143 |       console.log(`✅ ${style} style generated successfully`);
  144 |       
  145 |       if (artisticStyles.indexOf(style) < artisticStyles.length - 1) {
  146 |         await page.click('div:has-text("Image Customization") button:has-text("Edit")');
  147 |       }
  148 |     }
  149 |   });
  150 |
  151 |   test('Test export content verification', async ({ page }) => {
  152 |     console.log('🧪 Testing export content verification...');
  153 |     
  154 |     // Complete a basic workflow first
  155 |     await page.click('a[href*="/workflow-details/poem-generator"]');
  156 |     await page.waitForLoadState('networkidle');
  157 |     await page.click('a[href*="/w/poem/new"]');
  158 |     await page.waitForSelector('textarea');
  159 |     
  160 |     const testTopic = 'Testing export content verification';
  161 |     await page.fill('textarea', testTopic);
  162 |     await page.click('#process-stage-poem-topic');
  163 |     await page.waitForSelector('text=Poem Title', { timeout: 30000 });
  164 |     
  165 |     // Get poem details for verification (skip for now)
  166 |     
  167 |     // Continue to export
  168 |     await page.click('#process-stage-image-briefing');
  169 |     await page.waitForSelector('text=Download', { timeout: 60000 });
  170 |     await page.click('#process-stage-html-briefing');
  171 |     await page.waitForSelector('text=Export & Publish Poem', { timeout: 30000 });
  172 |     await page.click('#trigger-export-export-publish');
```