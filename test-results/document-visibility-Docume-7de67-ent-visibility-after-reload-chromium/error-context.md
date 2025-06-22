# Test info

- Name: Document Visibility Across Views (Chrome Only) >> should persist document visibility after reload
- Location: /Users/franzenzenhofer/dev/franzai-writer/tests/e2e/document-visibility.spec.ts:131:7

# Error details

```
TimeoutError: page.waitForSelector: Timeout 10000ms exceeded.
Call log:
  - waiting for locator('text=Start a new document') to be visible

    at /Users/franzenzenhofer/dev/franzai-writer/tests/e2e/document-visibility.spec.ts:139:16
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
  120 |       // Wait for the page to load - look for the stage card
  121 |       await page.waitForSelector('[data-testid="stage-card-poem-topic"]', { timeout: 10000 });
  122 |       
  123 |       // Verify we're viewing the correct document by checking the poem topic content
  124 |       const poemTopicContent = await page.textContent('[data-testid="stage-card-poem-topic"]');
  125 |       expect(poemTopicContent).toContain(uniqueTitle);
  126 |       console.log('✅ Document opens correctly from all documents page');
  127 |     });
  128 |     
  129 |   });
  130 |
  131 |   test('should persist document visibility after reload', async ({ page }) => {
  132 |     console.log('📄 Testing document persistence after reload');
  133 |     
  134 |     const uniqueTitle = `Reload Test ${Date.now()}`;
  135 |     let generatedTitle = '';
  136 |     
  137 |     // Create document
  138 |     await page.goto('http://localhost:9002/dashboard');
> 139 |     await page.waitForSelector('text=Start a new document', { timeout: 10000 });
      |                ^ TimeoutError: page.waitForSelector: Timeout 10000ms exceeded.
  140 |     
  141 |     // Start poem workflow
  142 |     await page.click('#workflow-start-poem-generator');
  143 |     await page.waitForSelector('textarea', { timeout: 10000 });
  144 |     
  145 |     await page.fill('textarea', uniqueTitle);
  146 |     await page.click('#process-stage-poem-topic');
  147 |     
  148 |     // Wait for poem generation
  149 |     await page.waitForSelector('text=Poem Title', { timeout: 30000 });
  150 |     await page.waitForSelector('text=Poem Content', { timeout: 5000 });
  151 |     
  152 |     // Get the generated title from the page title
  153 |     await page.waitForTimeout(3000); // Give time for title update
  154 |     generatedTitle = await page.title();
  155 |     // Remove the " - Franz AI Writer" suffix
  156 |     generatedTitle = generatedTitle.replace(' - Franz AI Writer', '');
  157 |     console.log(`📝 Generated poem title: "${generatedTitle.trim()}"`);
  158 |     
  159 |     await page.waitForSelector('text=Last saved', { timeout: 10000 });
  160 |     
  161 |     // Get document URL
  162 |     const documentUrl = page.url();
  163 |     
  164 |     // Reload page
  165 |     await page.reload();
  166 |     await page.waitForSelector('textarea', { timeout: 10000 });
  167 |     
  168 |     // Verify document still loads - check the poem topic text in the first stage
  169 |     await page.waitForSelector('text=Poem Topic', { timeout: 10000 });
  170 |     const poemTopicText = page.locator('[data-testid="stage-card-poem-topic"]').locator('p').first();
  171 |     await expect(poemTopicText).toContainText(uniqueTitle);
  172 |     console.log('✅ Document persists after reload');
  173 |     
  174 |     // Check dashboard after reload
  175 |     await page.goto('http://localhost:9002/dashboard');
  176 |     await page.waitForSelector('text=Recent documents', { timeout: 10000 });
  177 |     
  178 |     // The document should be visible with its generated title
  179 |     const documentInDashboard = page.locator(`text="${generatedTitle.trim()}"`).first();
  180 |     await expect(documentInDashboard).toBeVisible({ timeout: 10000 });
  181 |     console.log('✅ Document still visible in dashboard after reload');
  182 |     
  183 |     // Check all documents page after reload
  184 |     await page.goto('http://localhost:9002/documents');
  185 |     await page.waitForSelector('text=All Documents', { timeout: 10000 });
  186 |     
  187 |     // Verify our document with its title
  188 |     const documentInAllDocs = page.locator(`text="${generatedTitle.trim()}"`).first();
  189 |     await expect(documentInAllDocs).toBeVisible({ timeout: 10000 });
  190 |     console.log('✅ Document still visible in all documents page after reload');
  191 |   });
  192 | });
```