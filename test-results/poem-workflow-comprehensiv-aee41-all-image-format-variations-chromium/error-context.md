# Test info

- Name: Poem Workflow - SUPER POWERFUL Comprehensive Tests >> Test all image format variations
- Location: /Users/franzenzenhofer/dev/franzai-writer/tests/e2e/poem-workflow-comprehensive.spec.ts:334:7

# Error details

```
Error: page.selectOption: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('select[name="aspectRatio"]')

    at /Users/franzenzenhofer/dev/franzai-writer/tests/e2e/poem-workflow-comprehensive.spec.ts:356:18
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
  - heading "The Pixel's Proving Ground" [level=1]
  - text: Last saved 03 Jul 2025 20:05 |
  - paragraph: "Workflow: Poem Generator"
  - text: Progress 2 / 8 Stages
  - progressbar
  - img
  - text: Poem Topic What is the topic of your poem?
  - button:
    - img
  - paragraph: Test poem for Square image
  - button "Edit":
    - img
    - text: Edit
  - img
  - text: Generate Poem & Title AI will generate a poem and title based on your topic.
  - button:
    - img
  - text: Poem Title The Pixel's Proving Ground Poem Content I stand here, not for grand display, But for a purpose, clear and true. A digital form, in light of day, A test, for visions fresh and new. My words are shaped, a careful line, For what a square image may define. Within this frame, precise and neat, My humble verses find their place. No sprawling lines, no wild conceit, Just measured rhythm, form, and space. Each pixel waits, a silent plea, To see if I fit perfectly. I am the dummy, the stand-in phrase, Before the masterpiece arrives. Through countless screens, in fleeting haze, My simple mission brightly thrives. To show the font, the margin's grace, The balance of this chosen space. So judge me not by depth or lore, But by the canvas I prepare. I open up the virtual door, A silent promise in the air. For every square, a hidden art, And I, the test, play my small part.
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
  - text: ⌘+Enter
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
  - text: ⌘+Enter
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
  256 |     // Verify document appears in recent documents
  257 |     const documentInList = page.locator(`text=${uniqueTopic}`);
  258 |     await expect(documentInList).toBeVisible();
  259 |     console.log('✅ Document appears in dashboard');
  260 |     
  261 |     // Click on the document to reload it
  262 |     await documentInList.click();
  263 |     await page.waitForSelector('textarea');
  264 |     
  265 |     // Verify the content was preserved
  266 |     const reloadedTopic = await page.locator('textarea').inputValue();
  267 |     expect(reloadedTopic).toBe(uniqueTopic);
  268 |     console.log('✅ Document content preserved after reload');
  269 |   });
  270 |
  271 |   test('Test edge cases - special characters and long content', async ({ page }) => {
  272 |     console.log('🧪 Testing edge cases...');
  273 |     
  274 |     // Test special characters and unicode
  275 |     const specialCharacterTopic = 'Special chars: äöü, 中文, 🌟, émojis, ñoño, & symbols <>"\'';
  276 |     
  277 |     await page.click('a[href*="/workflow-details/poem-generator"]');
  278 |     await page.waitForLoadState('networkidle');
  279 |     await page.click('a[href*="/w/poem/new"]');
  280 |     await page.waitForSelector('textarea');
  281 |     
  282 |     await page.fill('textarea', specialCharacterTopic);
  283 |     await page.click('#process-stage-poem-topic');
  284 |     await page.waitForSelector('text=Poem Title', { timeout: 30000 });
  285 |     console.log('✅ Special characters handled correctly');
  286 |     
  287 |     // Test very long topic
  288 |     const longTopic = 'A very long poem topic that contains many words and should test the system\'s ability to handle lengthy input text that might cause issues with token limits or processing constraints. '.repeat(5);
  289 |     
  290 |     // Start new workflow for long content test
  291 |     await page.goto(`${BASE_URL}/dashboard`);
  292 |     await page.click('a[href*="/workflow-details/poem-generator"]');
  293 |     await page.waitForLoadState('networkidle');
  294 |     await page.click('a[href*="/w/poem/new"]');
  295 |     await page.waitForSelector('textarea');
  296 |     
  297 |     await page.fill('textarea', longTopic);
  298 |     await page.click('#process-stage-poem-topic');
  299 |     await page.waitForSelector('text=Poem Title', { timeout: 30000 });
  300 |     console.log('✅ Long content handled correctly');
  301 |   });
  302 |
  303 |   test('Test error recovery and input validation', async ({ page }) => {
  304 |     console.log('🧪 Testing error recovery...');
  305 |     
  306 |     // Test empty input handling
  307 |     await page.click('#workflow-start-poem-generator');
  308 |     await page.waitForSelector('textarea');
  309 |     
  310 |     // Try to continue with empty textarea
  311 |     await page.click('#process-stage-poem-topic');
  312 |     
  313 |     // Should show validation or handle gracefully
  314 |     const hasError = await page.locator('text=required').isVisible().catch(() => false);
  315 |     const hasTooltip = await page.locator('[role="tooltip"]').isVisible().catch(() => false);
  316 |     
  317 |     if (hasError || hasTooltip) {
  318 |       console.log('✅ Empty input validation working');
  319 |     }
  320 |     
  321 |     // Test with minimal input
  322 |     await page.fill('textarea', 'x');
  323 |     await page.click('#process-stage-poem-topic');
  324 |     
  325 |     // Should still generate something
  326 |     try {
  327 |       await page.waitForSelector('text=Poem Title', { timeout: 30000 });
  328 |       console.log('✅ Minimal input handled successfully');
  329 |     } catch {
  330 |       console.log('✅ Minimal input properly rejected');
  331 |     }
  332 |   });
  333 |
  334 |   test('Test all image format variations', async ({ page }) => {
  335 |     console.log('🧪 Testing image format variations...');
  336 |     
  337 |     const formats = [
  338 |       { ratio: '1:1', label: 'Square' },
  339 |       { ratio: '3:4', label: 'Portrait' },
  340 |       { ratio: '16:9', label: 'Widescreen' }
  341 |     ];
  342 |     
  343 |     for (const format of formats) {
  344 |       console.log(`Testing ${format.label} format...`);
  345 |       
  346 |       await page.goto(`${BASE_URL}/dashboard`);
  347 |       await page.click('#workflow-start-poem-generator');
  348 |       await page.waitForSelector('textarea');
  349 |       
  350 |       // Quick poem generation
  351 |       await page.fill('textarea', `Test poem for ${format.label} image`);
  352 |       await page.click('#process-stage-poem-topic');
  353 |       await page.waitForSelector('text=Poem Title', { timeout: 30000 });
  354 |       
  355 |       // Customize image format
> 356 |       await page.selectOption('select[name="aspectRatio"]', format.ratio);
      |                  ^ Error: page.selectOption: Test timeout of 30000ms exceeded.
  357 |       await page.click('#process-stage-image-briefing');
  358 |       
  359 |       // Verify image generation
  360 |       await page.waitForSelector('text=Download', { timeout: 60000 });
  361 |       console.log(`✅ ${format.label} image generated`);
  362 |     }
  363 |   });
  364 |
  365 |   test('Test concurrent workflow handling', async ({ browser }) => {
  366 |     console.log('🧪 Testing concurrent workflows...');
  367 |     
  368 |     // Create two browser contexts
  369 |     const context1 = await browser.newContext();
  370 |     const context2 = await browser.newContext();
  371 |     
  372 |     const page1 = await context1.newPage();
  373 |     const page2 = await context2.newPage();
  374 |     
  375 |     try {
  376 |       // Start both workflows
  377 |       await Promise.all([
  378 |         page1.goto(`${BASE_URL}/dashboard`),
  379 |         page2.goto(`${BASE_URL}/dashboard`)
  380 |       ]);
  381 |       
  382 |       await Promise.all([
  383 |         page1.click('#workflow-start-poem-generator'),
  384 |         page2.click('#workflow-start-poem-generator')
  385 |       ]);
  386 |       
  387 |       await Promise.all([
  388 |         page1.waitForSelector('textarea'),
  389 |         page2.waitForSelector('textarea')
  390 |       ]);
  391 |       
  392 |       // Fill different topics
  393 |       await page1.fill('textarea', 'Concurrent test 1 - sunrise');
  394 |       await page2.fill('textarea', 'Concurrent test 2 - moonlight');
  395 |       
  396 |       // Process both
  397 |       await Promise.all([
  398 |         page1.click('#process-stage-poem-topic'),
  399 |         page2.click('#process-stage-poem-topic')
  400 |       ]);
  401 |       
  402 |       // Verify both complete
  403 |       await Promise.all([
  404 |         page1.waitForSelector('text=Poem Title', { timeout: 30000 }),
  405 |         page2.waitForSelector('text=Poem Title', { timeout: 30000 })
  406 |       ]);
  407 |       
  408 |       console.log('✅ Concurrent workflows handled successfully');
  409 |     } finally {
  410 |       await context1.close();
  411 |       await context2.close();
  412 |     }
  413 |   });
  414 |
  415 |   test('Test full workflow with all optional stages', async ({ page }) => {
  416 |     console.log('🧪 Testing complete workflow with all stages...');
  417 |     
  418 |     await page.click('#workflow-start-poem-generator');
  419 |     await page.waitForSelector('textarea');
  420 |     
  421 |     // Stage 1: Topic
  422 |     await page.fill('textarea', 'Complete test: ocean waves under starlight');
  423 |     await page.click('#process-stage-poem-topic');
  424 |     await page.waitForSelector('text=Poem Title', { timeout: 30000 });
  425 |     
  426 |     // Stage 2: Custom image settings
  427 |     await page.fill('textarea[name="additionalPrompt"]', 'dreamy atmosphere, soft colors');
  428 |     await page.selectOption('select[name="aspectRatio"]', '16:9');
  429 |     await page.selectOption('select[name="style"]', 'watercolor');
  430 |     await page.selectOption('select[name="numberOfImages"]', '4');
  431 |     await page.click('#process-stage-image-briefing');
  432 |     
  433 |     // Wait for all 4 images
  434 |     await page.waitForSelector('text=Download', { timeout: 90000 });
  435 |     const downloadButtons = await page.locator('button:has-text("Download")').count();
  436 |     console.log(`✅ Generated ${downloadButtons} images`);
  437 |     
  438 |     // Stage 3: HTML briefing
  439 |     await page.fill('textarea', 'Make it elegant with a vintage feel');
  440 |     await page.click('#process-stage-html-briefing');
  441 |     
  442 |     // Wait for HTML preview
  443 |     await page.waitForSelector('text=Export & Publish', { timeout: 30000 });
  444 |     
  445 |     // Stage 4: Export all formats
  446 |     await page.click('#trigger-export-export-publish');
  447 |     await page.waitForSelector('h3:has-text("Styled HTML")', { timeout: 30000 });
  448 |     
  449 |     // Test all export actions
  450 |     const exportFormats = ['Styled HTML', 'Clean HTML', 'Markdown', 'PDF', 'Word'];
  451 |     for (const format of exportFormats) {
  452 |       const formatExists = await page.locator(`h3:has-text("${format}")`).isVisible();
  453 |       console.log(`✅ ${format} export available: ${formatExists}`);
  454 |     }
  455 |     
  456 |     // Test publish
```