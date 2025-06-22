# Test info

- Name: Poem Workflow Working Test (Chrome Only) >> should navigate through poem workflow stages
- Location: /Users/franzenzenhofer/dev/franzai-writer/tests/e2e/poem-workflow-working.spec.ts:107:7

# Error details

```
Error: expect.toBeVisible: Error: strict mode violation: locator('text=spring') resolved to 4 elements:
    1) <h1 data-testid="wizard-page-title" class="text-2xl md:text-3xl font-bold font-headline mb-2">Spring's Emerald Embrace</h1> aka getByTestId('wizard-page-title')
    2) <p class="whitespace-pre-wrap font-body">Beautiful spring morning</p> aka getByText('Beautiful spring morning')
    3) <div class="font-body">Spring's Emerald Embrace</div> aka getByTestId('stage-card-generate-poem-with-title').getByText('Spring\'s Emerald Embrace')
    4) <div class="whitespace-pre-wrap font-body">The dawn's first blush, a tender, golden grace,↵P…</div> aka getByText('The dawn\'s first blush, a')

Call log:
  - expect.toBeVisible with timeout 5000ms
  - waiting for locator('text=spring')

    at /Users/franzenzenhofer/dev/franzai-writer/tests/e2e/poem-workflow-working.spec.ts:131:47
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
  - heading "Spring's Emerald Embrace" [level=1]
  - text: Last saved 22 Jun 2025 12:18 |
  - paragraph: "Workflow: Poem Generator"
  - text: Progress 3 / 8 Stages
  - progressbar
  - img
  - text: Poem Topic What is the topic of your poem?
  - button:
    - img
  - paragraph: Beautiful spring morning
  - button "Edit":
    - img
    - text: Edit
  - img
  - text: Generate Poem & Title AI will generate a poem and title based on your topic.
  - button:
    - img
  - text: Poem Title Spring's Emerald Embrace Poem Content The dawn's first blush, a tender, golden grace, Paints silent beauty on the waking space. Through misty veils, the sunbeams softly creep, Where dewdrops glisten, on blades freshly steeped. A breath of promise fills the air so light, Chasing the last faint whispers of the night. From leafy boughs, a chorus starts to swell, As robin's carols break the morning spell. The busy bee, with purpose, takes its flight, Towards the blossoms, vibrant, pure, and bright. Each petal unfurls, a silent, soft design, A symphony of colors, truly divine. The air, a tapestry of scents profound, Where lilac whispers and sweet jasmine's found. Of damp, dark earth, and petals newly born, A fragrant balm on this sweet spring-kissed morn. The gentle warmth upon the skin does lie, Beneath the vast, cerulean, hopeful sky. Oh, beautiful morning, fresh and deeply clear, A perfect moment, banishing all fear. A simple joy, a gift from nature's hand, Awakening life across the vibrant land. In every bud and bird, a pure delight, A promise whispered in the morning light.
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
  - heading "Generating..." [level=4]
  - text: AI is processing your request...
  - paragraph: Analyzing your request...
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
   31 |     const documentUrl = page.url();
   32 |     const docId = documentUrl.match(/\/([^\/]+)$/)?.[1];
   33 |     console.log('📄 Document ID:', docId);
   34 |     
   35 |     // TEST PERSISTENCE: Reload the page
   36 |     console.log('🔄 Testing persistence...');
   37 |     await page.reload();
   38 |     await page.waitForLoadState('networkidle');
   39 |     
   40 |     // Verify URL is maintained
   41 |     expect(page.url()).toBe(documentUrl);
   42 |     
   43 |     // Verify poem topic persisted
   44 |     await expect(page.locator('text=eagle')).toBeVisible();
   45 |     console.log('✅ Persistence verified');
   46 |     
   47 |     // TEST DOCUMENT ISOLATION
   48 |     console.log('🔒 Testing document isolation...');
   49 |     const context2 = await browser.newContext();
   50 |     const page2 = await context2.newPage();
   51 |     
   52 |     try {
   53 |       // User 2: Create a different poem
   54 |       await page2.goto('/w/poem/new');
   55 |       await page2.waitForLoadState('networkidle');
   56 |       
   57 |       const topicTextarea2 = page2.locator('textarea').first();
   58 |       await topicTextarea2.fill('Ocean waves at sunset');
   59 |       
   60 |       await page2.click('button:has-text("Continue")').catch(() => {
   61 |         return page2.click('#process-stage-poem-topic');
   62 |       });
   63 |       
   64 |       // Wait for poem generation
   65 |       await page2.waitForSelector('text=Poem Title', { timeout: 30000 });
   66 |       
   67 |       // Get User 2's document ID
   68 |       const doc2Url = page2.url();
   69 |       const doc2Id = doc2Url.match(/\/([^\/]+)$/)?.[1];
   70 |       
   71 |       // Verify different document IDs
   72 |       expect(doc2Id).not.toBe(docId);
   73 |       console.log('✅ Documents have different IDs');
   74 |       
   75 |       // Navigate to dashboard for both users
   76 |       await page.goto('/dashboard');
   77 |       await page.waitForLoadState('networkidle');
   78 |       
   79 |       await page2.goto('/dashboard');
   80 |       await page2.waitForLoadState('networkidle');
   81 |       
   82 |       // User 1 should see their document
   83 |       const user1SeesOwn = await page.locator('text=eagle').count();
   84 |       expect(user1SeesOwn).toBeGreaterThan(0);
   85 |       
   86 |       // User 1 should NOT see User 2's document
   87 |       const user1SeesOther = await page.locator('text=Ocean waves').count();
   88 |       expect(user1SeesOther).toBe(0);
   89 |       
   90 |       // User 2 should see their document
   91 |       const user2SeesOwn = await page2.locator('text=Ocean waves').count();
   92 |       expect(user2SeesOwn).toBeGreaterThan(0);
   93 |       
   94 |       // User 2 should NOT see User 1's document
   95 |       const user2SeesOther = await page2.locator('text=eagle').count();
   96 |       expect(user2SeesOther).toBe(0);
   97 |       
   98 |       console.log('✅ Document isolation verified');
   99 |       
  100 |     } finally {
  101 |       await context2.close();
  102 |     }
  103 |     
  104 |     console.log('🎉 All tests passed!');
  105 |   });
  106 |
  107 |   test('should navigate through poem workflow stages', async ({ page }) => {
  108 |     // Start poem workflow
  109 |     await page.goto('/w/poem/new');
  110 |     await page.waitForLoadState('networkidle');
  111 |     
  112 |     // Enter topic
  113 |     await page.fill('textarea', 'Beautiful spring morning');
  114 |     await page.click('button:has-text("Continue")').catch(() => {
  115 |       return page.click('#process-stage-poem-topic');
  116 |     });
  117 |     
  118 |     // Wait for poem generation and continue
  119 |     await page.waitForSelector('text=Poem Title', { timeout: 30000 });
  120 |     
  121 |     // Continue to next stage if button is available
  122 |     const continueButtons = page.locator('button:has-text("Continue")');
  123 |     const buttonCount = await continueButtons.count();
  124 |     
  125 |     if (buttonCount > 0) {
  126 |       await continueButtons.first().click();
  127 |       console.log('✅ Progressed to next stage');
  128 |     }
  129 |     
  130 |     // Verify we can see the poem content
> 131 |     await expect(page.locator('text=spring')).toBeVisible();
      |                                               ^ Error: expect.toBeVisible: Error: strict mode violation: locator('text=spring') resolved to 4 elements:
  132 |   });
  133 | });
```