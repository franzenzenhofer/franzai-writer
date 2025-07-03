# Test info

- Name: Poem Workflow - SUPER POWERFUL Comprehensive Tests >> Verify AI attribution in exports
- Location: /Users/franzenzenhofer/dev/franzai-writer/tests/e2e/poem-workflow-comprehensive.spec.ts:464:7

# Error details

```
Error: page.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('#trigger-export-export-publish')

    at /Users/franzenzenhofer/dev/franzai-writer/tests/e2e/poem-workflow-comprehensive.spec.ts:482:16
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
  - heading "The Attribution's Challenge" [level=1]
  - text: Last saved 03 Jul 2025 20:05 |
  - paragraph: "Workflow: Poem Generator"
  - text: Progress 6 / 8 Stages
  - progressbar
  - img
  - text: Poem Topic What is the topic of your poem?
  - button:
    - img
  - paragraph: Attribution test poem
  - button "Edit":
    - img
    - text: Edit
  - img
  - text: Generate Poem & Title AI will generate a poem and title based on your topic.
  - button:
    - img
  - text: Poem Title The Attribution's Challenge Poem Content A crafted verse, a silent plea, Sent forth to test what eyes can see. No name attached, no mark defined, Just woven words for the keenest mind. It hides its genesis, a clever game, To probe the truth, and find its name. For every line, a hidden source, A creative spark, a winding course. Was it a human, heart and soul, That poured these thoughts to make them whole? Or silicon brain, a cold design, That pieced these phrases, line by line? The algorithms whir and gleam, To trace the pattern, the thematic dream. Analyzing rhythm, syntax's art, To pull the attribution apart. Is this a bard from ages past, Or code that learns, and builds so fast? This 'test poem', its purpose clear, To challenge systems, conquer fear Of knowing not, of failing to claim, The true creator, by their name. It seeks its source, a quest profound, To where its true beginning's found.
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
  - text: Optimized Imagen Prompt An artistic and profoundly evocative visual narrative, rendered in a 3:4 aspect ratio. A central, enigmatic nexus of swirling, iridescent light and deep shadow symbolizes the 'hidden genesis' of creative work. From one side, organic, fluid forms reminiscent of flowing ink, raw emotion, and warm, soulful energy subtly coalesce, suggesting a human, intuitive origin. On the opposing side, intricate, glowing crystalline structures and precise, cold algorithmic patterns interlace, hinting at a silicon, designed intelligence. These two distinct forces subtly intertwine and converge around the central mystery, creating a visual metaphor for the profound challenge of discerning true authorship. The overall composition evokes a mood of intellectual curiosity, subtle mystery, and a deep quest for truth, characterized by rich, deep color transitions and painterly textures. Generated Filenames Genesis Enigma Unveiled Digital Soul's Quest
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
  - 'img "Generated image: An artistic and profoundly evocative visual narrative, rendered in a 3:4 aspect ratio. A central, enigmatic nexus of swirling, iridescent light and deep shadow symbolizes the ''hidden genesis'' of creative work. From one side, organic, fluid forms reminiscent of flowing ink, raw emotion, and warm, soulful energy subtly coalesce, suggesting a human, intuitive origin. On the opposing side, intricate, glowing crystalline structures and precise, cold algorithmic patterns interlace, hinting at a silicon, designed intelligence. These two distinct forces subtly intertwine and converge around the central mystery, creating a visual metaphor for the profound challenge of discerning true authorship. The overall composition evokes a mood of intellectual curiosity, subtle mystery, and a deep quest for truth, characterized by rich, deep color transitions and painterly textures."'
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
  - heading "Generating..." [level=4]
  - text: AI is processing your request...
  - paragraph: Finalizing response...
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
  457 |     await page.click('button:has-text("Publish to Web")');
  458 |     await page.waitForTimeout(3000);
  459 |     
  460 |     const publishedLink = await page.locator('a[href*="/published"]').isVisible().catch(() => false);
  461 |     console.log(`✅ Publishing tested: ${publishedLink ? 'link available' : 'completed'}`);
  462 |   });
  463 |
  464 |   test('Verify AI attribution in exports', async ({ page }) => {
  465 |     console.log('🧪 Testing AI attribution compliance...');
  466 |     
  467 |     // Quick workflow to export
  468 |     await page.click('#workflow-start-poem-generator');
  469 |     await page.waitForSelector('textarea');
  470 |     
  471 |     await page.fill('textarea', 'Attribution test poem');
  472 |     await page.click('#process-stage-poem-topic');
  473 |     await page.waitForSelector('text=Poem Title', { timeout: 30000 });
  474 |     
  475 |     // Skip to export
  476 |     await page.click('#process-stage-image-briefing');
  477 |     await page.waitForSelector('text=Download', { timeout: 60000 });
  478 |     
  479 |     await page.click('#process-stage-html-briefing');
  480 |     await page.waitForSelector('text=Export & Publish', { timeout: 30000 });
  481 |     
> 482 |     await page.click('#trigger-export-export-publish');
      |                ^ Error: page.click: Test timeout of 30000ms exceeded.
  483 |     await page.waitForSelector('h3:has-text("Styled HTML")', { timeout: 30000 });
  484 |     
  485 |     // Click view for styled HTML
  486 |     await page.locator('div:has(h3:has-text("Styled HTML"))').locator('button:has-text("View")').click();
  487 |     
  488 |     // Check for attribution text
  489 |     await page.waitForTimeout(2000);
  490 |     const frameContent = await page.content();
  491 |     
  492 |     const hasAttribution = frameContent.includes('Generated with AI using Google Imagen') ||
  493 |                           frameContent.includes('Google Imagen') ||
  494 |                           frameContent.includes('AI-generated');
  495 |     
  496 |     console.log(`✅ AI attribution present: ${hasAttribution}`);
  497 |   });
  498 |
  499 | });
```