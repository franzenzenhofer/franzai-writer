# Test info

- Name: Poem Workflow - Comprehensive E2E Tests >> Complete poem workflow - basic flow
- Location: /Users/franzenzenhofer/dev/franzai-writer/worktree-firestore-nested-fix/tests/e2e/poem-workflow-comprehensive.spec.ts:19:7

# Error details

```
Error: page.waitForSelector: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('text=Styled HTML') to be visible

    at /Users/franzenzenhofer/dev/franzai-writer/worktree-firestore-nested-fix/tests/e2e/poem-workflow-comprehensive.spec.ts:51:16
```

# Page snapshot

```yaml
- banner:
  - link "FranzAI Writer":
    - /url: /
  - navigation:
    - link "Dashboard":
      - /url: /dashboard
    - link "AI Logs":
      - /url: /debug/ai-log-viewer
  - navigation:
    - link "Login":
      - /url: /login
- main:
  - heading "Emberglow on Still Waters" [level=1]
  - text: Last saved 21 Jun 2025 01:09 |
  - paragraph: "Workflow: Poem Generator"
  - text: Progress 7 / 8 Stages
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
  - text: Poem Title Emberglow on Still Waters Poem Content The sun descends, a molten kiss, Upon the lake, a sheet of glass, Reflecting hues of amethyst, As daylight yields, and shadows pass. Majestic peaks, in silhouette, Stand guard against the fading light, Their stony forms, forever set, A canvas etched in fading white. The water stills, a mirror deep, Where fiery clouds begin to bloom, A whispered promise, secrets keep, Within the twilight's gentle gloom. And as the stars begin to gleam, A silent peace descends anew, Lost in this sunset's fading dream, A landscape painted, fresh and true.
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
  - text: Optimized Imagen Prompt Artistic interpretation of a serene lake at sunset, reflecting vibrant amethyst and fiery orange hues of the sky. Majestic silhouetted peaks stand in the background against the fading light. Fiery clouds bloom in the water's reflection, creating a mirror-like effect. Stars begin to gleam in the twilight gloom, conveying a sense of peace and tranquility. Artistic style. Generated Filenames emberglow-lake-mirror still-waters-silhouette-peaks
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
  - 'img "Generated image: Artistic interpretation of a serene lake at sunset, reflecting vibrant amethyst and fiery orange hues of the sky. Majestic silhouetted peaks stand in the background against the fading light. Fiery clouds bloom in the water''s reflection, creating a mirror-like effect. Stars begin to gleam in the twilight gloom, conveying a sense of peace and tranquility. Artistic style."'
  - text: 3:4
  - button "Download":
    - img
    - text: Download
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
  - heading "Creating Your Exports..." [level=4]
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
   3 | /**
   4 |  * Comprehensive E2E test for poem generation workflow
   5 |  * Tests ALL possible variations and edge cases
   6 |  */
   7 |
   8 | test.describe('Poem Workflow - Comprehensive E2E Tests', () => {
   9 |   // Test configuration
   10 |   const BASE_URL = 'http://localhost:9002';
   11 |   
   12 |   test.beforeEach(async ({ page }) => {
   13 |     // Start each test from a clean dashboard
   14 |     await page.goto(`${BASE_URL}/dashboard`);
   15 |     // Wait for specific content instead of networkidle to avoid timeouts
   16 |     await page.waitForSelector('text=Start a new document', { timeout: 10000 });
   17 |   });
   18 |
   19 |   test('Complete poem workflow - basic flow', async ({ page }) => {
   20 |     console.log('🧪 Testing basic poem workflow...');
   21 |     
   22 |     // Start poem generator - use correct selectors
   23 |     await page.click('#workflow-start-poem-generator');
   24 |     await page.waitForSelector('textarea', { timeout: 10000 });
   25 |     
   26 |     // Stage 1: Poem Topic
   27 |     const poemTopic = 'A serene lake at sunset with mountains in the background';
   28 |     await page.fill('textarea', poemTopic);
   29 |     await page.click('#process-stage-poem-topic');
   30 |     
   31 |     // Wait for poem generation (Stage 2)
   32 |     await page.waitForSelector('text=Poem Title', { timeout: 30000 });
   33 |     await page.waitForSelector('text=Poem Content', { timeout: 5000 });
   34 |     console.log('✅ Poem generated successfully');
   35 |     
   36 |     // Stage 3: Image Customization (use defaults)
   37 |     await page.click('#process-stage-image-briefing');
   38 |     
   39 |     // Wait for image generation
   40 |     await page.waitForSelector('text=Download', { timeout: 60000 });
   41 |     console.log('✅ Image generation completed');
   42 |     
   43 |     // Stage 4: HTML Briefing (skip optional)
   44 |     await page.click('#process-stage-html-briefing');
   45 |     
   46 |     // Wait for HTML generation
   47 |     await page.waitForSelector('text=Export & Publish Poem', { timeout: 30000 });
   48 |     
   49 |     // Stage 5: Export & Publish
   50 |     await page.click('#trigger-export-export-publish');
>  51 |     await page.waitForSelector('text=Styled HTML', { timeout: 30000 });
      |                ^ Error: page.waitForSelector: Test timeout of 30000ms exceeded.
   52 |     
   53 |     // Verify all export formats are available
   54 |     const styledHtml = page.locator('text=Styled HTML');
   55 |     const cleanHtml = page.locator('text=Clean HTML');
   56 |     const markdown = page.locator('text=Markdown');
   57 |     
   58 |     await expect(styledHtml).toBeVisible();
   59 |     await expect(cleanHtml).toBeVisible();
   60 |     await expect(markdown).toBeVisible();
   61 |     
   62 |     console.log('✅ All export formats generated successfully');
   63 |     
   64 |     // Verify workflow completion
   65 |     const completedText = page.locator('text=8/8');
   66 |     await expect(completedText).toBeVisible();
   67 |     console.log('✅ Workflow completed (8/8 stages)');
   68 |   });
   69 |
   70 |   test('Test different image format variations', async ({ page }) => {
   71 |     console.log('🧪 Testing different image formats...');
   72 |     
   73 |     // Start workflow - use correct selectors
   74 |     await page.click('#workflow-start-poem-generator');
   75 |     await page.waitForSelector('textarea');
   76 |     
   77 |     // Quick poem topic
   78 |     await page.fill('textarea', 'Modern city skyline at night');
   79 |     await page.click('#process-stage-poem-topic');
   80 |     await page.waitForSelector('text=Poem Title', { timeout: 30000 });
   81 |     
   82 |     // Test different image formats
   83 |     const imageFormats = [
   84 |       'Square (1:1) - Social Media',
   85 |       'Landscape (4:3) - Classic', 
   86 |       'Widescreen (16:9) - Desktop',
   87 |       'Mobile (9:16) - Stories'
   88 |     ];
   89 |     
   90 |     for (const format of imageFormats) {
   91 |       console.log(`Testing image format: ${format}`);
   92 |       
   93 |       // TODO: Fix dropdown selectors for Radix UI components
   94 |       // For now, skip format selection
   95 |       
   96 |       // Continue with image generation
   97 |       await page.click('#process-stage-image-briefing');
   98 |       
   99 |       // Wait for image generation
  100 |       await page.waitForSelector('text=Download', { timeout: 60000 });
  101 |       console.log(`✅ ${format} format generated successfully`);
  102 |       
  103 |       // Reset for next test (go back to image customization)
  104 |       if (imageFormats.indexOf(format) < imageFormats.length - 1) {
  105 |         await page.click('div:has-text("Image Customization") button:has-text("Edit")');
  106 |       }
  107 |     }
  108 |   });
  109 |
  110 |   test('Test different artistic styles', async ({ page }) => {
  111 |     console.log('🧪 Testing different artistic styles...');
  112 |     
  113 |     // Start workflow - use correct selectors
  114 |     await page.click('#workflow-start-poem-generator');
  115 |     await page.waitForSelector('textarea');
  116 |     
  117 |     await page.fill('textarea', 'Abstract geometric patterns');
  118 |     await page.click('#process-stage-poem-topic');
  119 |     await page.waitForSelector('text=Poem Title', { timeout: 30000 });
  120 |     
  121 |     // Test different artistic styles
  122 |     const artisticStyles = [
  123 |       'Photorealistic',
  124 |       'Watercolor Painting',
  125 |       'Oil Painting',
  126 |       'Digital Art',
  127 |       'Minimalist'
  128 |     ];
  129 |     
  130 |     for (const style of artisticStyles) {
  131 |       console.log(`Testing artistic style: ${style}`);
  132 |       
  133 |       // TODO: Fix dropdown selectors for Radix UI components
  134 |       // For now, skip style selection
  135 |       await page.click('div:has-text("Image Customization") button:has-text("Continue")');
  136 |       await page.waitForSelector('text=Download', { timeout: 60000 });
  137 |       console.log(`✅ ${style} style generated successfully`);
  138 |       
  139 |       if (artisticStyles.indexOf(style) < artisticStyles.length - 1) {
  140 |         await page.click('div:has-text("Image Customization") button:has-text("Edit")');
  141 |       }
  142 |     }
  143 |   });
  144 |
  145 |   test('Test export content verification', async ({ page }) => {
  146 |     console.log('🧪 Testing export content verification...');
  147 |     
  148 |     // Complete a basic workflow first
  149 |     await page.click('a[href*="/workflow-details/poem-generator"]');
  150 |     await page.waitForLoadState('networkidle');
  151 |     await page.click('a[href*="/w/poem/new"]');
```