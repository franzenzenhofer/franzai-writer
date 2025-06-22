# Test info

- Name: Document Visibility Across Views (Chrome Only) >> should show created poem in dashboard and documents page
- Location: /Users/franzenzenhofer/dev/franzai-writer/tests/e2e/document-visibility.spec.ts:9:7

# Error details

```
TimeoutError: page.waitForSelector: Timeout 10000ms exceeded.
Call log:
  - waiting for locator('text=Start a new document') to be visible

    at /Users/franzenzenhofer/dev/franzai-writer/tests/e2e/document-visibility.spec.ts:19:18
    at /Users/franzenzenhofer/dev/franzai-writer/tests/e2e/document-visibility.spec.ts:17:5
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
    - link "AI Logs":
      - /url: /admin/debug/ai-log-viewer
  - navigation:
    - link "Login":
      - /url: /login
- main:
  - alert:
    - img
    - heading "Oops! Something went wrong" [level=5]
    - text: We encountered an error while processing your request. Please try again or contact support if the problem persists.
  - heading "Error details" [level=3]
  - paragraph: Table is not defined
  - button "Try again":
    - img
    - text: Try again
  - link "Go home":
    - /url: /
    - img
    - text: Go home
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
- button "Open issues overlay": 2 Issue
- button "Collapse issues badge":
  - img
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 |
   3 | /**
   4 |  * Test that documents appear in both dashboard and all documents view
   5 |  */
   6 | test.describe('Document Visibility Across Views (Chrome Only)', () => {
   7 |   test.skip(({ browserName }) => browserName !== 'chromium', 'Chrome only per CLAUDE.md guidelines');
   8 |
   9 |   test('should show created poem in dashboard and documents page', async ({ page }) => {
   10 |     console.log('📄 Testing document visibility across views');
   11 |     
   12 |     // Create a unique document title
   13 |     const uniqueTitle = `Visibility Test Poem ${Date.now()}`;
   14 |     let generatedTitle = '';
   15 |     
   16 |     // Step 1: Create a new poem
   17 |     await test.step('Create a new poem document', async () => {
   18 |       await page.goto('http://localhost:9002/dashboard');
>  19 |       await page.waitForSelector('text=Start a new document', { timeout: 10000 });
      |                  ^ TimeoutError: page.waitForSelector: Timeout 10000ms exceeded.
   20 |       
   21 |       // Start poem workflow - use the same selector as working test
   22 |       await page.click('#workflow-start-poem-generator');
   23 |       await page.waitForSelector('textarea', { timeout: 10000 });
   24 |       
   25 |       // Fill poem topic
   26 |       await page.fill('textarea', uniqueTitle);
   27 |       await page.click('#process-stage-poem-topic');
   28 |       
   29 |       // Wait for poem generation using the same pattern as working test
   30 |       await page.waitForSelector('text=Poem Title', { timeout: 30000 });
   31 |       await page.waitForSelector('text=Poem Content', { timeout: 5000 });
   32 |       console.log('✅ Poem generated successfully');
   33 |       
   34 |       // Wait for auto-save
   35 |       await page.waitForSelector('text=Last saved', { timeout: 10000 });
   36 |       console.log('✅ Poem created and auto-saved');
   37 |       
   38 |       // Get the actual title that was generated
   39 |       // Let's wait a bit for the title to update in the document
   40 |       await page.waitForTimeout(3000); // Give time for title update
   41 |       
   42 |       // Get the page title which should have been updated with the generated title
   43 |       generatedTitle = await page.title();
   44 |       // Remove the " - Franz AI Writer" suffix
   45 |       generatedTitle = generatedTitle.replace(' - Franz AI Writer', '');
   46 |       
   47 |       console.log(`📝 Generated poem title: "${generatedTitle.trim()}"`);
   48 |       
   49 |       // Also check what the page title shows
   50 |       const pageTitle = await page.title();
   51 |       console.log(`📄 Page title: "${pageTitle}"`);
   52 |     });
   53 |     
   54 |     // Step 2: Verify document appears in dashboard
   55 |     await test.step('Verify document appears in dashboard', async () => {
   56 |       // Wait a bit more to ensure document is saved
   57 |       await page.waitForTimeout(5000);
   58 |       
   59 |       await page.goto('http://localhost:9002/dashboard');
   60 |       await page.waitForSelector('text=Recent documents', { timeout: 10000 });
   61 |       
   62 |       // Look for the generated title in the dashboard
   63 |       // The title update is working, so we should see it
   64 |       const documentRow = page.locator('table').nth(1).locator('tbody tr').filter({ hasText: generatedTitle.trim() }).first();
   65 |       await expect(documentRow).toBeVisible({ timeout: 10000 });
   66 |       console.log('✅ Document with correct title appears in dashboard');
   67 |       
   68 |       // Click the Continue link to open the document
   69 |       const continueLink = documentRow.locator('a:has-text("Continue")');
   70 |       await continueLink.click();
   71 |       await page.waitForURL('**/w/poem/**');
   72 |       
   73 |       // Verify we're on the correct document
   74 |       await page.waitForSelector('text=Poem Topic', { timeout: 10000 });
   75 |       const poemTopicText = page.locator('[data-testid="stage-card-poem-topic"]').locator('p').first();
   76 |       await expect(poemTopicText).toContainText(uniqueTitle);
   77 |       console.log('✅ Document opens correctly from dashboard');
   78 |     });
   79 |     
   80 |     // Step 3: Verify document appears in all documents page
   81 |     await test.step('Verify document appears in all documents page', async () => {
   82 |       // Navigate to documents page via the navigation menu
   83 |       // First go to dashboard to ensure session is established
   84 |       await page.goto('http://localhost:9002/dashboard');
   85 |       await page.waitForSelector('text=Recent documents', { timeout: 10000 });
   86 |       
   87 |       // Click on Documents link in navigation
   88 |       const documentsLink = page.locator('nav a[href="/documents"], a[href="/documents"]').first();
   89 |       await documentsLink.click();
   90 |       
   91 |       // Wait for navigation and page load
   92 |       await page.waitForURL('**/documents');
   93 |       await page.waitForLoadState('domcontentloaded');
   94 |       
   95 |       // Wait for the documents page to load
   96 |       await page.waitForSelector('h1:has-text("All Documents")', { timeout: 15000 });
   97 |       
   98 |       // Wait for documents to load (look for the document count text)
   99 |       await page.waitForSelector('text=documents', { timeout: 10000 });
  100 |       
  101 |       // Debug: log what we see on the page
  102 |       const pageContent = await page.textContent('body');
  103 |       console.log('Documents page loaded, looking for:', generatedTitle.trim());
  104 |       
  105 |       // Look for our document by its generated title
  106 |       // The documents page doesn't use data-testid, so let's find by text
  107 |       const documentText = page.locator(`text="${generatedTitle.trim()}"`).first();
  108 |       await expect(documentText).toBeVisible({ timeout: 10000 });
  109 |       console.log('✅ Document with correct title appears in all documents page');
  110 |       
  111 |       // Find the first document card that contains our title
  112 |       // Use a more specific selector based on the card structure
  113 |       const documentCards = page.locator('.group').filter({ hasText: generatedTitle.trim() });
  114 |       const firstCard = documentCards.first();
  115 |       
  116 |       // Click the Open button/link within this specific card
  117 |       await firstCard.locator('text=Open').click();
  118 |       await page.waitForURL('**/w/poem/**');
  119 |       
```