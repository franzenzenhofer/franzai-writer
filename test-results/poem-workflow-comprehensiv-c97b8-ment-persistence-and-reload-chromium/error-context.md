# Test info

- Name: Poem Workflow - Essential E2E Tests >> Test document persistence and reload
- Location: /Users/franzenzenhofer/dev/franzai-writer/tests/e2e/poem-workflow-comprehensive.spec.ts:230:7

# Error details

```
Error: locator.click: Test timeout of 60000ms exceeded.
Call log:
  - waiting for locator('text=Persistence test 1750552277820')
    - locator resolved to <p class="whitespace-pre-wrap font-body">Persistence test 1750552277820</p>
  - attempting click action
    - waiting for element to be visible, enabled and stable
    - element is not stable
  - retrying click action
    - waiting for element to be visible, enabled and stable
  - element was detached from the DOM, retrying

    at /Users/franzenzenhofer/dev/franzai-writer/tests/e2e/poem-workflow-comprehensive.spec.ts:261:26
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
  - heading "Start a new document" [level=1]
  - table:
    - rowgroup:
      - row "Workflow Description Actions":
        - cell "Workflow"
        - cell "Description"
        - cell "Actions"
    - rowgroup:
      - row "Targeted Page SEO Optimized V3 Create a comprehensive, SEO-optimized page targeting a specific keyword. Start":
        - cell "Targeted Page SEO Optimized V3"
        - cell "Create a comprehensive, SEO-optimized page targeting a specific keyword."
        - cell "Start":
          - link:
            - /url: /workflow-details/targeted-page-seo-optimized-v3
            - img
          - link "Start":
            - /url: /w/article/new
            - text: Start
            - img
      - row "SEO Optimized Cooking Recipe Create a detailed, SEO-friendly cooking recipe with AI assistance. Start":
        - cell "SEO Optimized Cooking Recipe"
        - cell "Create a detailed, SEO-friendly cooking recipe with AI assistance."
        - cell "Start":
          - link:
            - /url: /workflow-details/recipe-seo-optimized
            - img
          - link "Start":
            - /url: /w/recipe/new
            - text: Start
            - img
      - row "Poem Generator Create a poem with AI assistance. Start":
        - cell "Poem Generator"
        - cell "Create a poem with AI assistance."
        - cell "Start":
          - link:
            - /url: /workflow-details/poem-generator
            - img
          - link "Start":
            - /url: /w/poem/new
            - text: Start
            - img
      - row "Gemini AI Tools Test Comprehensive test workflow demonstrating all Gemini AI advanced features Start":
        - cell "Gemini AI Tools Test"
        - cell "Comprehensive test workflow demonstrating all Gemini AI advanced features"
        - cell "Start":
          - link:
            - /url: /workflow-details/gemini-tools-test
            - img
          - link "Start":
            - /url: /w/gemini-test/new
            - text: Start
            - img
      - row "Press Release Generator Create professional press releases with AI-powered research, tone analysis, and fact-checking Start":
        - cell "Press Release Generator"
        - cell "Create professional press releases with AI-powered research, tone analysis, and fact-checking"
        - cell "Start":
          - link:
            - /url: /workflow-details/press-release
            - img
          - link "Start":
            - /url: /w/press-release/new
            - text: Start
            - img
  - heading "Recent documents" [level=2]
  - img
  - heading "Ready to Save Your Work?" [level=3]
  - paragraph: Log in or sign up to keep track of your documents.
  - link "Login / Sign Up":
    - /url: /login
    - img
    - text: Login / Sign Up
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
  161 |     await page.fill('textarea', testTopic);
  162 |     await page.click('#process-stage-poem-topic');
  163 |     await page.waitForSelector('text=Poem Title', { timeout: 30000 });
  164 |     
  165 |     // Get poem details for verification (skip for now)
  166 |     
  167 |     // Continue to export
  168 |     await page.click('#process-stage-image-briefing');
  169 |     await page.waitForSelector('text=Download', { timeout: 60000 });
  170 |     await page.click('#process-stage-html-briefing');
  171 |     await page.waitForSelector('text=Export & Publish Poem', { timeout: 30000 });
  172 |     await page.click('#trigger-export-export-publish');
  173 |     await page.waitForSelector('text=Styled HTML', { timeout: 30000 });
  174 |     
  175 |     // Test copy functionality for each export format
  176 |     const formats = ['Styled HTML', 'Clean HTML', 'Markdown'];
  177 |     
  178 |     for (const format of formats) {
  179 |       console.log(`Testing ${format} export...`);
  180 |       
  181 |       // Click copy button for this format
  182 |       const copyButton = page.locator(`div:has-text("${format}") button:has-text("Copy")`);
  183 |       await copyButton.click();
  184 |       
  185 |       // Verify copy success (look for success message or similar)
  186 |       // Note: Actual clipboard testing requires special permissions
  187 |       console.log(`✅ ${format} copy button clicked successfully`);
  188 |     }
  189 |     
  190 |     // Test download functionality
  191 |     for (const format of ['PDF Document', 'Word Document']) {
  192 |       console.log(`Testing ${format} download...`);
  193 |       
  194 |       const downloadButton = page.locator(`div:has-text("${format}") button:has-text("Download")`);
  195 |       await downloadButton.click();
  196 |       console.log(`✅ ${format} download initiated`);
  197 |     }
  198 |   });
  199 |
  200 |   test('Test publishing functionality', async ({ page }) => {
  201 |     console.log('🧪 Testing publishing functionality...');
  202 |     
  203 |     // Complete workflow to export stage
  204 |     await page.click('a[href*="/workflow-details/poem-generator"]');
  205 |     await page.waitForLoadState('networkidle');
  206 |     await page.click('a[href*="/w/poem/new"]');
  207 |     await page.waitForSelector('textarea');
  208 |     
  209 |     await page.fill('textarea', 'Testing publishing functionality');
  210 |     await page.click('#process-stage-poem-topic');
  211 |     await page.waitForSelector('text=Poem Title', { timeout: 30000 });
  212 |     
  213 |     await page.click('div:has-text("Image Customization") button:has-text("Continue")');
  214 |     await page.waitForSelector('text=Download', { timeout: 60000 });
  215 |     await page.click('div:has-text("HTML Briefing") button:has-text("Continue")');
  216 |     await page.waitForSelector('text=Export & Publish Poem', { timeout: 30000 });
  217 |     await page.click('button:has-text("Export & Publish Poem")');
  218 |     await page.waitForSelector('text=Publish Now', { timeout: 30000 });
  219 |     
  220 |     // Test publishing
  221 |     const publishButton = page.locator('button:has-text("Publish Now")');
  222 |     await publishButton.click();
  223 |     
  224 |     // Wait for publish to complete or show result
  225 |     await page.waitForTimeout(5000);
  226 |     
  227 |     console.log('✅ Publishing functionality tested');
  228 |   });
  229 |
  230 |   test('Test document persistence and reload', async ({ page }) => {
  231 |     console.log('🧪 Testing document persistence and reload...');
  232 |     
  233 |     // Start a workflow
  234 |     await page.click('a[href*="/workflow-details/poem-generator"]');
  235 |     await page.waitForLoadState('networkidle');
  236 |     await page.click('a[href*="/w/poem/new"]');
  237 |     await page.waitForSelector('textarea');
  238 |     
  239 |     const uniqueTopic = `Persistence test ${Date.now()}`;
  240 |     await page.fill('textarea', uniqueTopic);
  241 |     await page.click('#process-stage-poem-topic');
  242 |     await page.waitForSelector('text=Poem Title', { timeout: 30000 });
  243 |     
  244 |     // Get the document title for later verification
  245 |     const documentTitle = await page.locator('h1, h2, [data-testid="document-title"]').first().textContent();
  246 |     
  247 |     // Wait for auto-save
  248 |     await page.waitForSelector('text=Last saved', { timeout: 10000 });
  249 |     console.log('✅ Document auto-saved');
  250 |     
  251 |     // Go back to dashboard
  252 |     await page.click('a:has-text("Dashboard")');
  253 |     await page.waitForLoadState('networkidle');
  254 |     
  255 |     // Verify document appears in recent documents
  256 |     const documentInList = page.locator(`text=${uniqueTopic}`);
  257 |     await expect(documentInList).toBeVisible();
  258 |     console.log('✅ Document appears in dashboard');
  259 |     
  260 |     // Click on the document to reload it
> 261 |     await documentInList.click();
      |                          ^ Error: locator.click: Test timeout of 60000ms exceeded.
  262 |     await page.waitForSelector('textarea');
  263 |     
  264 |     // Verify the content was preserved
  265 |     const reloadedTopic = await page.locator('textarea').inputValue();
  266 |     expect(reloadedTopic).toBe(uniqueTopic);
  267 |     console.log('✅ Document content preserved after reload');
  268 |   });
  269 |
  270 |   test('Test edge cases - special characters and long content', async ({ page }) => {
  271 |     console.log('🧪 Testing edge cases...');
  272 |     
  273 |     // Test special characters and unicode
  274 |     const specialCharacterTopic = 'Special chars: äöü, 中文, 🌟, émojis, ñoño, & symbols <>"\'';
  275 |     
  276 |     await page.click('a[href*="/workflow-details/poem-generator"]');
  277 |     await page.waitForLoadState('networkidle');
  278 |     await page.click('a[href*="/w/poem/new"]');
  279 |     await page.waitForSelector('textarea');
  280 |     
  281 |     await page.fill('textarea', specialCharacterTopic);
  282 |     await page.click('#process-stage-poem-topic');
  283 |     await page.waitForSelector('text=Poem Title', { timeout: 30000 });
  284 |     console.log('✅ Special characters handled correctly');
  285 |     
  286 |     // Test very long topic
  287 |     const longTopic = 'A very long poem topic that contains many words and should test the system\'s ability to handle lengthy input text that might cause issues with token limits or processing constraints. '.repeat(5);
  288 |     
  289 |     // Start new workflow for long content test
  290 |     await page.goto(`${BASE_URL}/dashboard`);
  291 |     await page.click('a[href*="/workflow-details/poem-generator"]');
  292 |     await page.waitForLoadState('networkidle');
  293 |     await page.click('a[href*="/w/poem/new"]');
  294 |     await page.waitForSelector('textarea');
  295 |     
  296 |     await page.fill('textarea', longTopic);
  297 |     await page.click('#process-stage-poem-topic');
  298 |     await page.waitForSelector('text=Poem Title', { timeout: 30000 });
  299 |     console.log('✅ Long content handled correctly');
  300 |   });
  301 |
  302 | });
```