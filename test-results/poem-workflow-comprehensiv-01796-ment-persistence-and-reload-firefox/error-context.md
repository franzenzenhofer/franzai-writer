# Test info

- Name: Poem Workflow - Comprehensive E2E Tests >> Test document persistence and reload
- Location: /Users/franzenzenhofer/dev/franzai-writer/worktree-firestore-nested-fix/tests/e2e/poem-workflow-comprehensive.spec.ts:229:7

# Error details

```
Error: expect.toBeVisible: Error: strict mode violation: locator('text=Persistence test 1750456437878') resolved to 3 elements:
    1) <h1 data-testid="wizard-page-title" class="text-2xl md:text-3xl font-bold font-headline mb-2">The Unyielding Echo: Persistence Test 17504564378…</h1> aka getByTestId('wizard-page-title')
    2) <p class="whitespace-pre-wrap font-body">Persistence test 1750456437878</p> aka getByTestId('stage-card-poem-topic').getByText('Persistence test')
    3) <div class="font-body">The Unyielding Echo: Persistence Test 17504564378…</div> aka getByTestId('stage-card-generate-poem-with-title').getByText('The Unyielding Echo:')

Call log:
  - expect.toBeVisible with timeout 5000ms
  - waiting for locator('text=Persistence test 1750456437878')

    at /Users/franzenzenhofer/dev/franzai-writer/worktree-firestore-nested-fix/tests/e2e/poem-workflow-comprehensive.spec.ts:255:34
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
  155 |     await page.click('a[href*="poem-generator"]');
  156 |     await page.click('a:has-text("Start Poem Generator")');
  157 |     await page.waitForSelector('textarea');
  158 |     
  159 |     const testTopic = 'Testing export content verification';
  160 |     await page.fill('textarea', testTopic);
  161 |     await page.click('button:has-text("Continue")');
  162 |     await page.waitForSelector('text=Poem Title', { timeout: 30000 });
  163 |     
  164 |     // Get poem details for verification
  165 |     const poemTitle = await page.locator('h3:has-text("Poem Title") + *').first().textContent();
  166 |     
  167 |     // Continue to export
  168 |     await page.click('div:has-text("Image Customization") button:has-text("Continue")');
  169 |     await page.waitForSelector('text=Download', { timeout: 60000 });
  170 |     await page.click('div:has-text("HTML Briefing") button:has-text("Continue")');
  171 |     await page.waitForSelector('text=Export & Publish Poem', { timeout: 30000 });
  172 |     await page.click('button:has-text("Export & Publish Poem")');
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
  204 |     await page.click('a[href*="poem-generator"]');
  205 |     await page.click('a:has-text("Start Poem Generator")');
  206 |     await page.waitForSelector('textarea');
  207 |     
  208 |     await page.fill('textarea', 'Testing publishing functionality');
  209 |     await page.click('button:has-text("Continue")');
  210 |     await page.waitForSelector('text=Poem Title', { timeout: 30000 });
  211 |     
  212 |     await page.click('div:has-text("Image Customization") button:has-text("Continue")');
  213 |     await page.waitForSelector('text=Download', { timeout: 60000 });
  214 |     await page.click('div:has-text("HTML Briefing") button:has-text("Continue")');
  215 |     await page.waitForSelector('text=Export & Publish Poem', { timeout: 30000 });
  216 |     await page.click('button:has-text("Export & Publish Poem")');
  217 |     await page.waitForSelector('text=Publish Now', { timeout: 30000 });
  218 |     
  219 |     // Test publishing
  220 |     const publishButton = page.locator('button:has-text("Publish Now")');
  221 |     await publishButton.click();
  222 |     
  223 |     // Wait for publish to complete or show result
  224 |     await page.waitForTimeout(5000);
  225 |     
  226 |     console.log('✅ Publishing functionality tested');
  227 |   });
  228 |
  229 |   test('Test document persistence and reload', async ({ page }) => {
  230 |     console.log('🧪 Testing document persistence and reload...');
  231 |     
  232 |     // Start a workflow
  233 |     await page.click('a[href*="poem-generator"]');
  234 |     await page.click('a:has-text("Start Poem Generator")');
  235 |     await page.waitForSelector('textarea');
  236 |     
  237 |     const uniqueTopic = `Persistence test ${Date.now()}`;
  238 |     await page.fill('textarea', uniqueTopic);
  239 |     await page.click('button:has-text("Continue")');
  240 |     await page.waitForSelector('text=Poem Title', { timeout: 30000 });
  241 |     
  242 |     // Get the document title for later verification
  243 |     const documentTitle = await page.locator('h1, h2, [data-testid="document-title"]').first().textContent();
  244 |     
  245 |     // Wait for auto-save
  246 |     await page.waitForSelector('text=Last saved', { timeout: 10000 });
  247 |     console.log('✅ Document auto-saved');
  248 |     
  249 |     // Go back to dashboard
  250 |     await page.click('a:has-text("Dashboard")');
  251 |     await page.waitForLoadState('networkidle');
  252 |     
  253 |     // Verify document appears in recent documents
  254 |     const documentInList = page.locator(`text=${uniqueTopic}`);
> 255 |     await expect(documentInList).toBeVisible();
      |                                  ^ Error: expect.toBeVisible: Error: strict mode violation: locator('text=Persistence test 1750456437878') resolved to 3 elements:
  256 |     console.log('✅ Document appears in dashboard');
  257 |     
  258 |     // Click on the document to reload it
  259 |     await documentInList.click();
  260 |     await page.waitForSelector('textarea');
  261 |     
  262 |     // Verify the content was preserved
  263 |     const reloadedTopic = await page.locator('textarea').inputValue();
  264 |     expect(reloadedTopic).toBe(uniqueTopic);
  265 |     console.log('✅ Document content preserved after reload');
  266 |   });
  267 |
  268 |   test('Test edge cases - special characters and long content', async ({ page }) => {
  269 |     console.log('🧪 Testing edge cases...');
  270 |     
  271 |     // Test special characters and unicode
  272 |     const specialCharacterTopic = 'Special chars: äöü, 中文, 🌟, émojis, ñoño, & symbols <>"\'';
  273 |     
  274 |     await page.click('a[href*="poem-generator"]');
  275 |     await page.click('a:has-text("Start Poem Generator")');
  276 |     await page.waitForSelector('textarea');
  277 |     
  278 |     await page.fill('textarea', specialCharacterTopic);
  279 |     await page.click('button:has-text("Continue")');
  280 |     await page.waitForSelector('text=Poem Title', { timeout: 30000 });
  281 |     console.log('✅ Special characters handled correctly');
  282 |     
  283 |     // Test very long topic
  284 |     const longTopic = 'A very long poem topic that contains many words and should test the system\'s ability to handle lengthy input text that might cause issues with token limits or processing constraints. '.repeat(5);
  285 |     
  286 |     // Start new workflow for long content test
  287 |     await page.goto(`${BASE_URL}/dashboard`);
  288 |     await page.click('a[href*="poem-generator"]');
  289 |     await page.click('a:has-text("Start Poem Generator")');
  290 |     await page.waitForSelector('textarea');
  291 |     
  292 |     await page.fill('textarea', longTopic);
  293 |     await page.click('button:has-text("Continue")');
  294 |     await page.waitForSelector('text=Poem Title', { timeout: 30000 });
  295 |     console.log('✅ Long content handled correctly');
  296 |   });
  297 |
  298 |   test('Test error recovery and resilience', async ({ page }) => {
  299 |     console.log('🧪 Testing error recovery...');
  300 |     
  301 |     // Test with minimal input
  302 |     await page.click('a[href*="poem-generator"]');
  303 |     await page.click('a:has-text("Start Poem Generator")');
  304 |     await page.waitForSelector('textarea');
  305 |     
  306 |     // Try with very short input
  307 |     await page.fill('textarea', 'x');
  308 |     await page.click('button:has-text("Continue")');
  309 |     
  310 |     // Should still work or show appropriate error
  311 |     try {
  312 |       await page.waitForSelector('text=Poem Title', { timeout: 30000 });
  313 |       console.log('✅ Minimal input handled successfully');
  314 |     } catch (e) {
  315 |       console.log('✅ Minimal input properly rejected with error handling');
  316 |     }
  317 |     
  318 |     // Test with empty input
  319 |     await page.goto(`${BASE_URL}/dashboard`);
  320 |     await page.click('a[href*="poem-generator"]');
  321 |     await page.click('a:has-text("Start Poem Generator")');
  322 |     await page.waitForSelector('textarea');
  323 |     
  324 |     // Try to continue with empty textarea
  325 |     await page.click('button:has-text("Continue")');
  326 |     // Should either prevent continuation or handle gracefully
  327 |     console.log('✅ Empty input handling tested');
  328 |   });
  329 |
  330 |   test('Test multiple workflows simultaneously', async ({ browser }) => {
  331 |     console.log('🧪 Testing multiple concurrent workflows...');
  332 |     
  333 |     // Create multiple browser contexts to simulate different users
  334 |     const context1 = await browser.newContext();
  335 |     const context2 = await browser.newContext();
  336 |     
  337 |     const page1 = await context1.newPage();
  338 |     const page2 = await context2.newPage();
  339 |     
  340 |     try {
  341 |       // Start two workflows simultaneously
  342 |       await Promise.all([
  343 |         page1.goto(`${BASE_URL}/dashboard`),
  344 |         page2.goto(`${BASE_URL}/dashboard`)
  345 |       ]);
  346 |       
  347 |       // Start poem generators on both
  348 |       await Promise.all([
  349 |         page1.click('a[href*="poem-generator"]').then(() => page1.click('a:has-text("Start Poem Generator")')),
  350 |         page2.click('a[href*="poem-generator"]').then(() => page2.click('a:has-text("Start Poem Generator")'))
  351 |       ]);
  352 |       
  353 |       await Promise.all([
  354 |         page1.waitForSelector('textarea'),
  355 |         page2.waitForSelector('textarea')
```