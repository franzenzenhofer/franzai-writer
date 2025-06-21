# Test info

- Name: Recent Documents Display >> created documents should appear in recent documents list
- Location: /Users/franzenzenhofer/dev/franzai-writer/tests/e2e/recent-documents-test.spec.ts:4:7

# Error details

```
TimeoutError: page.waitForSelector: Timeout 10000ms exceeded.
Call log:
  - waiting for locator('#poem-topic textarea') to be visible

    at /Users/franzenzenhofer/dev/franzai-writer/tests/e2e/recent-documents-test.spec.ts:11:16
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
  - heading "New Poem Generator" [level=1]
  - text: Last saved 22 Jun 2025 at 01:11 |
  - paragraph: "Workflow: Poem Generator"
  - text: Progress 0 / 8 Stages
  - progressbar
  - text: Poem Topic What is the topic of your poem?
  - button:
    - img
  - textbox "Compose a heartfelt poem about the sun and moon's timeless dance—describe the scene, emotions it evokes, and why this celestial love story matters to you."
  - button "Continue":
    - img
    - text: Continue
  - img
  - text: "Waiting for: Poem Topic Generate Poem & Title AI will generate a poem and title based on your topic."
  - button:
    - img
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
   3 | test.describe('Recent Documents Display', () => {
   4 |   test('created documents should appear in recent documents list', async ({ page, context }) => {
   5 |     // Go to the poem workflow
   6 |     await page.goto('/w/poem/new');
   7 |     await page.waitForLoadState('networkidle');
   8 |     
   9 |     // Fill poem topic
   10 |     console.log('Filling poem topic...');
>  11 |     await page.waitForSelector('#poem-topic textarea', { timeout: 10000 });
      |                ^ TimeoutError: page.waitForSelector: Timeout 10000ms exceeded.
   12 |     await page.fill('#poem-topic textarea', 'A beautiful sunset over the ocean');
   13 |     
   14 |     // Complete the poem topic stage
   15 |     await page.click('#poem-topic button:has-text("Continue")');
   16 |     
   17 |     // Wait for poem generation
   18 |     console.log('Waiting for poem generation...');
   19 |     await page.waitForSelector('[data-testid="stage-card-generate-poem-with-title"] .text-green-600', { timeout: 30000 });
   20 |     
   21 |     // Get the generated poem title for verification
   22 |     const poemTitleElement = await page.locator('#generate-poem-with-title .bg-muted\\/50 .font-medium').first();
   23 |     const poemTitle = await poemTitleElement.textContent();
   24 |     console.log('Generated poem title:', poemTitle);
   25 |     
   26 |     // Go to dashboard
   27 |     console.log('Navigating to dashboard...');
   28 |     await page.goto('/dashboard');
   29 |     await page.waitForLoadState('networkidle');
   30 |     
   31 |     // Wait for documents to load
   32 |     await page.waitForTimeout(3000);
   33 |     
   34 |     // Check if the created document appears in recent documents
   35 |     const recentDocumentsSection = page.locator('h2:has-text("Recent documents")').locator('..');
   36 |     
   37 |     // Look for the document in the table
   38 |     const documentRows = recentDocumentsSection.locator('tbody tr');
   39 |     const documentCount = await documentRows.count();
   40 |     
   41 |     console.log(`Found ${documentCount} documents in recent list`);
   42 |     
   43 |     if (documentCount > 0) {
   44 |       // Check if our poem appears in the list
   45 |       let foundOurDocument = false;
   46 |       
   47 |       for (let i = 0; i < documentCount; i++) {
   48 |         const row = documentRows.nth(i);
   49 |         const titleCell = row.locator('td').first();
   50 |         const title = await titleCell.textContent();
   51 |         
   52 |         console.log(`Document ${i + 1}: ${title}`);
   53 |         
   54 |         if (title && (title.includes(poemTitle || '') || title.includes('Poem Generator'))) {
   55 |           foundOurDocument = true;
   56 |           console.log('✅ Found our created document in recent list!');
   57 |           break;
   58 |         }
   59 |       }
   60 |       
   61 |       if (foundOurDocument) {
   62 |         console.log('✅ PASS: Created document appears in recent documents');
   63 |       } else {
   64 |         console.log('❌ FAIL: Created document not found in recent documents');
   65 |         
   66 |         // Take screenshot for debugging
   67 |         await page.screenshot({ path: './test-results/recent-documents-fail.png', fullPage: true });
   68 |         
   69 |         // Log all documents for debugging
   70 |         for (let i = 0; i < documentCount; i++) {
   71 |           const row = documentRows.nth(i);
   72 |           const cells = row.locator('td');
   73 |           const cellCount = await cells.count();
   74 |           const rowData: string[] = [];
   75 |           
   76 |           for (let j = 0; j < cellCount; j++) {
   77 |             const cellText = await cells.nth(j).textContent();
   78 |             rowData.push(cellText || '');
   79 |           }
   80 |           
   81 |           console.log(`Row ${i + 1}:`, rowData);
   82 |         }
   83 |         
   84 |         throw new Error('Created document not found in recent documents list');
   85 |       }
   86 |     } else {
   87 |       console.log('❌ FAIL: No documents found in recent list');
   88 |       
   89 |       // Check if there's an error message or empty state
   90 |       const emptyState = await recentDocumentsSection.locator('text=No documents yet').count();
   91 |       const errorState = await recentDocumentsSection.locator('.text-destructive').count();
   92 |       
   93 |       if (emptyState > 0) {
   94 |         console.log('Empty state shown: "No documents yet"');
   95 |       }
   96 |       
   97 |       if (errorState > 0) {
   98 |         const errorText = await recentDocumentsSection.locator('.text-destructive').textContent();
   99 |         console.log('Error state shown:', errorText);
  100 |       }
  101 |       
  102 |       // Take screenshot for debugging
  103 |       await page.screenshot({ path: './test-results/recent-documents-empty.png', fullPage: true });
  104 |       
  105 |       throw new Error('No documents found in recent documents list');
  106 |     }
  107 |   });
  108 |
  109 |   test('dashboard should handle missing user gracefully', async ({ page, context }) => {
  110 |     // Test the dashboard without creating any documents first
  111 |     // This tests the graceful degradation when no userId is available
```