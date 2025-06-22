# Test info

- Name: Poem Workflow Working Test (Chrome Only) >> should complete poem workflow with document isolation
- Location: /Users/franzenzenhofer/dev/franzai-writer/tests/e2e/poem-workflow-working.spec.ts:6:7

# Error details

```
Error: page.waitForSelector: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('text=Poem Title') to be visible

    at /Users/franzenzenhofer/dev/franzai-writer/tests/e2e/poem-workflow-working.spec.ts:27:16
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
  - heading "New Poem Generator" [level=1]
  - paragraph: "Workflow: Poem Generator"
  - text: Progress 1 / 8 Stages
  - progressbar
  - img
  - text: Saving...
  - img
  - text: Poem Topic What is the topic of your poem?
  - button:
    - img
  - paragraph: A majestic eagle soaring above mountains
  - button "Edit":
    - img
    - text: Edit
  - img
  - text: Generate Poem & Title AI will generate a poem and title based on your topic.
  - button:
    - img
  - heading "Generating..." [level=4]
  - text: AI is processing your request...
  - paragraph: Generating content...
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
   3 | test.describe('Poem Workflow Working Test (Chrome Only)', () => {
   4 |   test.skip(({ browserName }) => browserName !== 'chromium', 'Chrome only per CLAUDE.md guidelines');
   5 |
   6 |   test('should complete poem workflow with document isolation', async ({ page, browser }) => {
   7 |     console.log('🧪 Starting poem workflow test...');
   8 |     
   9 |     // Navigate directly to poem workflow
   10 |     await page.goto('/w/poem/new');
   11 |     await page.waitForLoadState('networkidle');
   12 |     
   13 |     // Wait for the wizard shell to load
   14 |     await page.waitForSelector('text=Poem Generator', { timeout: 10000 });
   15 |     
   16 |     // Stage 1: Enter poem topic
   17 |     const topicTextarea = page.locator('textarea').first();
   18 |     await topicTextarea.fill('A majestic eagle soaring above mountains');
   19 |     
   20 |     // Click the continue button for poem topic stage
   21 |     await page.click('button:has-text("Continue")').catch(() => {
   22 |       // Try alternative selector
   23 |       return page.click('#process-stage-poem-topic');
   24 |     });
   25 |     
   26 |     // Wait for poem to be generated
>  27 |     await page.waitForSelector('text=Poem Title', { timeout: 30000 });
      |                ^ Error: page.waitForSelector: Test timeout of 30000ms exceeded.
   28 |     console.log('✅ Poem generated');
   29 |     
   30 |     // Get document URL
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
```