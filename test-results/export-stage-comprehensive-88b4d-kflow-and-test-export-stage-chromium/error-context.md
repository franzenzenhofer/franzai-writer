# Test info

- Name: Export Stage - Comprehensive Testing >> should complete full workflow and test export stage
- Location: /Users/franzenzenhofer/dev/franzai-writer/tests/e2e/export-stage-comprehensive.spec.ts:31:7

# Error details

```
Error: expect(locator).toContainText(expected)

Locator: locator('[data-testid="stage-card-generate-poem-with-title"]')
- Expected string  -  1
+ Received string  + 19

- ✅
+ Generate Poem & TitleAI will generate a poem and title based on your topic.Poem TitleLumiflora: Midnight's Gleaming GrovePoem ContentBeneath a sky of velvet deep,
+ Where secrets ancient softly sleep,
+ A forest breathes in shadowed grace,
+ Illumined by a fungal face.
+
+ Each mushroom cap, a gentle gleam,
+ A constellation's fractured dream,
+ They paint the moss in emerald light,
+ A beacon burning in the night.
+
+ No mortal path has dared to tread,
+ Where willow wisps and whispers spread,
+ But sprites and fae in silent dance,
+ Around the luminescent trance.
+
+ So hush, and heed the magic near,
+ Let wonder banish every fear,
+ For in this grove, at midnight's chime,
+ Dreams blossom in the heart of time.AI REDOEdit
Call log:
  - expect.toContainText with timeout 60000ms
  - waiting for locator('[data-testid="stage-card-generate-poem-with-title"]')
    6 × locator resolved to <div id="stage-generate-poem-with-title" data-testid="stage-card-generate-poem-with-title" class="rounded-lg border bg-card text-card-foreground mb-6 transition-all duration-300 border-primary shadow-accent/30 shadow-xl ring-2 ring-accent">…</div>
      - unexpected value "Generate Poem & TitleAI will generate a poem and title based on your topic.Generating...AI is processing your request...Analyzing your request..."
    - locator resolved to <div id="stage-generate-poem-with-title" data-testid="stage-card-generate-poem-with-title" class="rounded-lg border bg-card text-card-foreground mb-6 transition-all duration-300 border-primary shadow-accent/30 shadow-xl ring-2 ring-accent">…</div>
    - unexpected value "Generate Poem & TitleAI will generate a poem and title based on your topic.Generating...AI is processing your request...Generating content..."
    27 × locator resolved to <div id="stage-generate-poem-with-title" data-testid="stage-card-generate-poem-with-title" class="rounded-lg border bg-card text-card-foreground shadow-sm mb-6 transition-all duration-300 border-green-500">…</div>
       - unexpected value "Generate Poem & TitleAI will generate a poem and title based on your topic.Poem TitleLumiflora: Midnight's Gleaming GrovePoem ContentBeneath a sky of velvet deep,
Where secrets ancient softly sleep,
A forest breathes in shadowed grace,
Illumined by a fungal face.

Each mushroom cap, a gentle gleam,
A constellation's fractured dream,
They paint the moss in emerald light,
A beacon burning in the night.

No mortal path has dared to tread,
Where willow wisps and whispers spread,
But sprites and fae in silent dance,
Around the luminescent trance.

So hush, and heed the magic near,
Let wonder banish every fear,
For in this grove, at midnight's chime,
Dreams blossom in the heart of time.AI REDOEdit"

    at /Users/franzenzenhofer/dev/franzai-writer/tests/e2e/export-stage-comprehensive.spec.ts:39:87
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
  - 'heading "Lumiflora: Midnight''s Gleaming Grove" [level=1]'
  - paragraph: "Workflow: Poem Generator"
  - text: Progress 2 / 8 Stages
  - progressbar
  - text: Last saved 9:34:20 PM
  - img
  - text: Poem Topic What is the topic of your poem?
  - button:
    - img
  - paragraph: A magical forest at midnight with glowing mushrooms
  - button "Edit":
    - img
    - text: Edit
  - img
  - text: Generate Poem & Title AI will generate a poem and title based on your topic.
  - button:
    - img
  - text: "Poem Title Lumiflora: Midnight's Gleaming Grove Poem Content Beneath a sky of velvet deep, Where secrets ancient softly sleep, A forest breathes in shadowed grace, Illumined by a fungal face. Each mushroom cap, a gentle gleam, A constellation's fractured dream, They paint the moss in emerald light, A beacon burning in the night. No mortal path has dared to tread, Where willow wisps and whispers spread, But sprites and fae in silent dance, Around the luminescent trance. So hush, and heed the magic near, Let wonder banish every fear, For in this grove, at midnight's chime, Dreams blossom in the heart of time."
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
  - textbox "Additional Image Instructions (Optional)"
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
   5 | test.describe('Export Stage - Comprehensive Testing', () => {
   6 |   let page: Page;
   7 |   let documentId: string;
   8 |
   9 |   test.beforeAll(async ({ browser }) => {
   10 |     page = await browser.newPage();
   11 |     
   12 |     // Create a new poem document to test export functionality
   13 |     await page.goto('http://localhost:9002/w/poem/new');
   14 |     await page.waitForLoadState('networkidle');
   15 |     
   16 |     // Extract document ID from URL
   17 |     const url = page.url();
   18 |     const match = url.match(/\/w\/poem\/([^/]+)$/);
   19 |     if (match) {
   20 |       documentId = match[1];
   21 |       console.log('Created document with ID:', documentId);
   22 |     } else {
   23 |       throw new Error('Failed to create new document');
   24 |     }
   25 |   });
   26 |
   27 |   test.afterAll(async () => {
   28 |     await page.close();
   29 |   });
   30 |
   31 |   test('should complete full workflow and test export stage', async () => {
   32 |     // Step 1: Complete poem topic stage
   33 |     console.log('Step 1: Filling poem topic...');
   34 |     await page.fill('textarea', 'A magical forest at midnight with glowing mushrooms');
   35 |     await page.click('button:has-text("Continue")');
   36 |     
   37 |     // Wait for AI to complete poem generation
   38 |     console.log('Step 2: Waiting for poem generation...');
>  39 |     await expect(page.locator('[data-testid="stage-card-generate-poem-with-title"]')).toContainText('✅', { timeout: 60000 });
      |                                                                                       ^ Error: expect(locator).toContainText(expected)
   40 |     
   41 |     // Step 3: Skip HTML briefing (optional stage)
   42 |     console.log('Step 3: Skipping HTML briefing...');
   43 |     await page.click('button:has-text("Continue")');
   44 |     
   45 |     // Wait for HTML preview generation
   46 |     console.log('Step 4: Waiting for HTML preview generation...');
   47 |     await expect(page.locator('[data-testid="stage-card-generate-html-preview"]')).toContainText('✅', { timeout: 60000 });
   48 |     
   49 |     // Step 5: Test export stage
   50 |     console.log('Step 5: Testing export stage...');
   51 |     const exportStage = page.locator('[data-testid="stage-card-export-publish"]');
   52 |     await exportStage.scrollIntoView();
   53 |     
   54 |     // Verify export stage is visible and has correct title
   55 |     await expect(exportStage).toBeVisible();
   56 |     await expect(exportStage).toContainText('Export & Publish ✨');
   57 |     
   58 |     // Click the export trigger button
   59 |     const exportButton = exportStage.locator('button', { hasText: 'Generate Export Formats' }).or(
   60 |       exportStage.locator('button', { hasText: 'Retry Export' })
   61 |     );
   62 |     await exportButton.click();
   63 |     
   64 |     // Wait for export to complete
   65 |     console.log('Step 6: Waiting for export completion...');
   66 |     await expect(exportStage).toContainText('✅', { timeout: 120000 });
   67 |     
   68 |     console.log('✅ Export stage completed successfully!');
   69 |   });
   70 |
   71 |   test('should test live preview functionality', async () => {
   72 |     // Navigate to the document with completed export
   73 |     await page.goto(`http://localhost:9002/w/poem/${documentId}`);
   74 |     await page.waitForLoadState('networkidle');
   75 |     
   76 |     const exportStage = page.locator('[data-testid="stage-card-export-publish"]');
   77 |     await exportStage.scrollIntoView();
   78 |     
   79 |     // Test styled view (should be default)
   80 |     console.log('Testing styled HTML preview...');
   81 |     const styledButton = exportStage.locator('button', { hasText: 'Styled' });
   82 |     await expect(styledButton).toBeVisible();
   83 |     
   84 |     // Verify iframe with styled content exists
   85 |     const styledIframe = exportStage.locator('iframe[title*="styled HTML preview"]');
   86 |     await expect(styledIframe).toBeVisible();
   87 |     
   88 |     // Switch to clean view
   89 |     console.log('Testing clean HTML preview...');
   90 |     const cleanButton = exportStage.locator('button', { hasText: 'Clean' });
   91 |     await cleanButton.click();
   92 |     
   93 |     // Verify clean view is active
   94 |     await expect(cleanButton).toHaveClass(/bg-primary/);
   95 |     
   96 |     // Verify clean iframe content
   97 |     const cleanIframe = exportStage.locator('iframe[title*="clean HTML preview"]');
   98 |     await expect(cleanIframe).toBeVisible();
   99 |     
  100 |     // Verify clean preview description
  101 |     await expect(exportStage).toContainText('Clean HTML preview - Perfect for pasting into any CMS');
  102 |     
  103 |     console.log('✅ Live preview functionality working perfectly!');
  104 |   });
  105 |
  106 |   test('should test all export format downloads', async () => {
  107 |     // Navigate to the document with completed export
  108 |     await page.goto(`http://localhost:9002/w/poem/${documentId}`);
  109 |     await page.waitForLoadState('networkidle');
  110 |     
  111 |     const exportStage = page.locator('[data-testid="stage-card-export-publish"]');
  112 |     await exportStage.scrollIntoView();
  113 |     
  114 |     // Test HTML (Styled) download
  115 |     console.log('Testing HTML (Styled) download...');
  116 |     const downloadPromiseStyled = page.waitForEvent('download');
  117 |     await exportStage.locator('button', { hasText: 'Download' }).first().click();
  118 |     const downloadStyled = await downloadPromiseStyled;
  119 |     
  120 |     expect(downloadStyled.suggestedFilename()).toMatch(/\.html$/);
  121 |     const styledPath = path.join('./downloads', `styled-${Date.now()}.html`);
  122 |     await downloadStyled.saveAs(styledPath);
  123 |     
  124 |     // Verify styled HTML file
  125 |     const styledContent = fs.readFileSync(styledPath, 'utf-8');
  126 |     expect(styledContent).toContain('<!DOCTYPE html>');
  127 |     expect(styledContent).toContain('<style>');
  128 |     expect(styledContent).toContain('magical forest');
  129 |     console.log('✅ Styled HTML download successful and valid!');
  130 |     
  131 |     // Test HTML (Clean) download
  132 |     console.log('Testing HTML (Clean) download...');
  133 |     const cleanDownloadButtons = exportStage.locator('button', { hasText: 'Download' });
  134 |     const downloadPromiseClean = page.waitForEvent('download');
  135 |     await cleanDownloadButtons.nth(1).click();
  136 |     const downloadClean = await downloadPromiseClean;
  137 |     
  138 |     expect(downloadClean.suggestedFilename()).toMatch(/\.html$/);
  139 |     const cleanPath = path.join('./downloads', `clean-${Date.now()}.html`);
```