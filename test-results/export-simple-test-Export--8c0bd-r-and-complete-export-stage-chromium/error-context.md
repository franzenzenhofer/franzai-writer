# Test info

- Name: Export Stage Simple Test >> can trigger and complete export stage
- Location: /Users/franzenzenhofer/dev/franzai-writer/tests/e2e/export-simple-test.spec.ts:4:7

# Error details

```
Error: Timed out 30000ms waiting for expect(locator).toBeVisible()

Locator: locator('text="Live Preview"')
Expected: visible
Received: <element(s) not found>
Call log:
  - expect.toBeVisible with timeout 30000ms
  - waiting for locator('text="Live Preview"')

    at /Users/franzenzenhofer/dev/franzai-writer/tests/e2e/export-simple-test.spec.ts:118:31
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
  - heading "New Poem Generator" [level=1]
  - text: Last saved 22 Jun 2025 01:48 |
  - paragraph: "Workflow: Poem Generator"
  - text: Progress 1 / 8 Stages
  - progressbar
  - img
  - text: Poem Topic What is the topic of your poem?
  - button:
    - img
  - paragraph: Beautiful sunset over the ocean
  - button "Edit":
    - img
    - text: Edit
  - img
  - text: Generate Poem & Title AI will generate a poem and title based on your topic.
  - button:
    - img
  - img
  - paragraph: AI Stage Error
  - paragraph: "got status: 404 Not Found. {\"error\":{\"message\":\"\",\"code\":404,\"status\":\"Not Found\"}}"
  - button "Copy error details":
    - img
  - text: ⌘+Enter
  - button "Run AI":
    - img
    - text: Run AI
  - img
  - text: "Waiting for: Generate Poem & Title Image Customization Optional Customize how your poem should be illustrated"
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
  - img
  - text: "Waiting for: Generate Poem & Title, Image Customization Create Image Prompt AI will create optimized imagen prompts and unique filenames for your poem illustrations."
  - button:
    - img
  - img
  - text: "Waiting for: Create Image Prompt Generate Poem Illustration AI will create an image that complements your poem."
  - button:
    - img
  - img
  - text: "Waiting for: Generate Poem & Title HTML Briefing Optional Special instructions for HTML formatting (optional)"
  - button:
    - img
  - textbox "Special instructions for HTML formatting (optional)"
  - img
  - text: "Waiting for: Generate Poem & Title, Generate Poem Illustration, Image Customization Generate HTML Preview AI will convert your poem into beautiful HTML based on your briefing."
  - button:
    - img
  - text: Export & Publish Transform your poem into professional formats and publish instantly
  - button:
    - img
  - text: Export & Publish
  - button:
    - img
  - text: "Model: gemini-2.5-flash Tools: - Deps: Generate HTML Preview Auto: No Input: none Output: export-interface"
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
   18 |     // Wait for poem generation
   19 |     console.log('Waiting for poem generation...');
   20 |     await page.waitForTimeout(10000);
   21 |     
   22 |     // Skip all optional stages by clicking Continue
   23 |     console.log('Skipping optional stages...');
   24 |     
   25 |     // Skip image briefing
   26 |     const imageContinue = page.locator('#stage-image-briefing button:has-text("Continue")');
   27 |     if (await imageContinue.count() > 0) {
   28 |       await imageContinue.click();
   29 |       await page.waitForTimeout(2000);
   30 |     }
   31 |     
   32 |     // Wait for image generation
   33 |     console.log('Waiting for image generation...');
   34 |     await page.waitForTimeout(20000);
   35 |     
   36 |     // Scroll down
   37 |     await page.evaluate(() => window.scrollBy(0, 1000));
   38 |     await page.waitForTimeout(1000);
   39 |     
   40 |     // Skip HTML briefing
   41 |     const htmlContinue = page.locator('#stage-html-briefing button:has-text("Continue")');
   42 |     if (await htmlContinue.count() > 0) {
   43 |       await htmlContinue.click();
   44 |       await page.waitForTimeout(2000);
   45 |     }
   46 |     
   47 |     // Wait for HTML preview
   48 |     console.log('Waiting for HTML preview...');
   49 |     await page.waitForTimeout(10000);
   50 |     
   51 |     // Scroll to bottom to find export stage
   52 |     console.log('Scrolling to export stage...');
   53 |     await page.evaluate(() => {
   54 |       const element = document.querySelector('#stage-export-publish');
   55 |       if (element) {
   56 |         element.scrollIntoView({ behavior: 'smooth', block: 'center' });
   57 |       } else {
   58 |         window.scrollTo(0, document.body.scrollHeight);
   59 |       }
   60 |     });
   61 |     await page.waitForTimeout(2000);
   62 |     
   63 |     // Take screenshot to see current state
   64 |     await page.screenshot({ path: './test-results/export-stage-before-click.png', fullPage: true });
   65 |     
   66 |     // DEBUG: Dump the export stage HTML to see what's actually there
   67 |     const exportStageHTML = await page.locator('#stage-export-publish').innerHTML();
   68 |     console.log('Export stage HTML:', exportStageHTML);
   69 |     
   70 |     // Try to find and click the export button
   71 |     console.log('Looking for export button...');
   72 |     
   73 |     // Try multiple selectors
   74 |     const exportSelectors = [
   75 |       '#trigger-export-export-publish',
   76 |       '#stage-export-publish button:has-text("Export & Publish Poem")',
   77 |       '#stage-export-publish button:has-text("Export")',
   78 |       '#process-stage-export-publish',
   79 |       '#stage-export-publish [data-testid="trigger-export-export-publish"]',
   80 |       '#stage-export-publish button'
   81 |     ];
   82 |     
   83 |     let exportButton = null;
   84 |     for (const selector of exportSelectors) {
   85 |       const button = page.locator(selector);
   86 |       if (await button.count() > 0) {
   87 |         exportButton = button;
   88 |         console.log(`Found export button with selector: ${selector}`);
   89 |         break;
   90 |       }
   91 |     }
   92 |     
   93 |     if (!exportButton) {
   94 |       throw new Error('Could not find export button');
   95 |     }
   96 |     
   97 |     // Wait for React to hydrate and attach event handlers
   98 |     console.log('Waiting for React hydration...');
   99 |     await page.waitForTimeout(3000);
  100 |     
  101 |     // Ensure button is visible and enabled
  102 |     await exportButton.waitFor({ state: 'visible' });
  103 |     console.log('Button is visible');
  104 |     
  105 |     const isEnabled = await exportButton.isEnabled();
  106 |     console.log('Button is enabled:', isEnabled);
  107 |     
  108 |     // Click export button with force option
  109 |     console.log('Clicking export button...');
  110 |     await exportButton.click({ force: true });
  111 |     
  112 |     // Wait for export to complete
  113 |     console.log('Waiting for export to complete...');
  114 |     await page.waitForTimeout(30000);
  115 |     
  116 |     // Check if Live Preview appeared
  117 |     const livePreview = page.locator('text="Live Preview"');
> 118 |     await expect(livePreview).toBeVisible({ timeout: 30000 });
      |                               ^ Error: Timed out 30000ms waiting for expect(locator).toBeVisible()
  119 |     console.log('✅ Export completed - Live Preview visible');
  120 |     
  121 |     // Take final screenshot
  122 |     await page.screenshot({ path: './test-results/export-stage-completed.png', fullPage: true });
  123 |     
  124 |     // Check for preview buttons
  125 |     const styledButton = page.locator('#stage-export-publish button:has-text("Styled")');
  126 |     const cleanButton = page.locator('#stage-export-publish button:has-text("Clean")');
  127 |     
  128 |     if (await styledButton.count() > 0 || await cleanButton.count() > 0) {
  129 |       console.log('✅ Export preview buttons found');
  130 |     }
  131 |     
  132 |     // Test publishing functionality
  133 |     console.log('Testing publish functionality...');
  134 |     
  135 |     // Scroll down within the export stage to find publish section
  136 |     await page.evaluate(() => {
  137 |       const exportStage = document.querySelector('#stage-export-publish');
  138 |       if (exportStage) {
  139 |         // Scroll within the stage card to see publish section
  140 |         const cardContent = exportStage.querySelector('.space-y-4');
  141 |         if (cardContent) {
  142 |           cardContent.scrollIntoView({ behavior: 'smooth', block: 'end' });
  143 |         }
  144 |       }
  145 |     });
  146 |     await page.waitForTimeout(2000);
  147 |     
  148 |     // Look for Publish to Web section
  149 |     const publishSection = page.locator('#stage-export-publish :text("Publish to Web")');
  150 |     if (await publishSection.count() > 0) {
  151 |       console.log('✅ Publish section found');
  152 |       
  153 |       // Select ALL THREE formats for publishing
  154 |       const formatCheckboxes = [
  155 |         { id: '#publish-html-styled', name: 'HTML Styled' },
  156 |         { id: '#publish-html-clean', name: 'HTML Clean' },
  157 |         { id: '#publish-markdown', name: 'Markdown' }
  158 |       ];
  159 |       
  160 |       for (const format of formatCheckboxes) {
  161 |         const checkbox = page.locator(`#stage-export-publish input[id="${format.id.replace('#', '')}"]`);
  162 |         if (await checkbox.count() > 0) {
  163 |           await checkbox.check();
  164 |           console.log(`✅ Selected ${format.name} for publishing`);
  165 |         }
  166 |       }
  167 |       
  168 |       // Click Publish Now button
  169 |       const publishButton = page.locator('#stage-export-publish button:has-text("Publish Now")');
  170 |       if (await publishButton.count() > 0) {
  171 |         await publishButton.click();
  172 |         console.log('⏳ Publishing ALL FORMATS...');
  173 |         
  174 |         // Wait for publish success
  175 |         await page.waitForSelector('#stage-export-publish :text("Published Successfully!")', { timeout: 30000 });
  176 |         console.log('✅ Published ALL FORMATS successfully!');
  177 |         
  178 |         // Collect ALL published URLs
  179 |         const publishedUrls: Record<string, string> = {};
  180 |         const urlFormats = ['html-styled', 'html-clean', 'markdown'];
  181 |         
  182 |         console.log('📍 COLLECTING ALL PUBLISHED URLs:');
  183 |         for (const format of urlFormats) {
  184 |           const link = page.locator(`#stage-export-publish a[href*="/${format}"]`).first();
  185 |           if (await link.count() > 0) {
  186 |             const url = await link.getAttribute('href');
  187 |             if (url) {
  188 |               publishedUrls[format] = url;
  189 |               console.log(`  📍 ${format}: ${url}`);
  190 |             }
  191 |           }
  192 |         }
  193 |         
  194 |         // Store URLs globally for after-reload testing
  195 |         (global as any).publishedUrls = publishedUrls;
  196 |       }
  197 |     }
  198 |     
  199 |     // Take screenshot after publishing
  200 |     await page.screenshot({ path: './test-results/export-stage-published.png', fullPage: true });
  201 |     
  202 |     // Test reload persistence
  203 |     console.log('\n🔄 TESTING RELOAD PERSISTENCE...');
  204 |     await page.reload();
  205 |     await page.waitForLoadState('networkidle');
  206 |     await page.waitForTimeout(5000);
  207 |     
  208 |     // Scroll down to bottom to find export stage after reload
  209 |     console.log('Scrolling to bottom to find export stage after reload...');
  210 |     await page.evaluate(() => {
  211 |       window.scrollTo(0, document.body.scrollHeight);
  212 |     });
  213 |     await page.waitForTimeout(2000);
  214 |     
  215 |     // Then scroll to export stage specifically
  216 |     await page.evaluate(() => {
  217 |       const element = document.querySelector('#stage-export-publish');
  218 |       if (element) {
```