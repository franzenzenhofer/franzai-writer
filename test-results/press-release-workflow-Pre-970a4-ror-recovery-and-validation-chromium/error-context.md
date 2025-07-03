# Test info

- Name: Press Release Workflow - Master Test (Chrome Only) >> Test press release error recovery and validation
- Location: /Users/franzenzenhofer/dev/franzai-writer/tests/e2e/press-release-workflow.spec.ts:326:7

# Error details

```
Error: page.waitForSelector: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('[data-testid="stage-card-tone-briefing"]') to be visible

    at /Users/franzenzenhofer/dev/franzai-writer/tests/e2e/press-release-workflow.spec.ts:340:16
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
  - heading "New Press Release Generator" [level=1]
  - paragraph: "Workflow: Press Release Generator"
  - text: Progress 0 / 14 Stages
  - progressbar
  - text: Basic Information Provide the core details for your press release
  - button:
    - img
  - text: Company Name
  - textbox "e.g., TechCorp Inc."
  - paragraph
  - text: Announcement Topic
  - textbox "e.g., New Product Launch, Partnership Announcement"
  - paragraph
  - text: Key Message
  - textbox "Describe what you're announcing and why it matters..."
  - paragraph
  - text: Company Website
  - textbox "e.g., https://example.com"
  - paragraph
  - text: Company Location
  - textbox "e.g., San Francisco, CA"
  - paragraph
  - text: ⌘+Enter
  - button "Continue":
    - img
    - text: Continue
  - text: Reference Materials Optional Upload existing press releases or company materials to match your tone (optional)
  - button:
    - img
  - text: Manual Context Input
  - textbox "Manual Context Input"
  - text: Or Upload File Content (Smart Dropzone)
  - button "Choose File"
  - img
  - paragraph: Drag 'n' drop files here, or click to select
  - paragraph: Supports .txt, .md, .html. (Limited support for .docx, .pdf, .csv, .xlsx)
  - text: ⌘+Enter
  - button "Continue":
    - img
    - text: Continue
  - text: Research URLs Optional Add URLs for deeper research and fact verification (optional)
  - button:
    - img
  - text: Research URLs
  - 'textbox "Add URLs (one per line): - Company investor pages - Recent press releases - Industry reports - News articles"'
  - paragraph
  - text: Research Focus
  - combobox: Comprehensive Analysis
  - text: ⌘+Enter
  - button "Continue":
    - img
    - text: Continue
  - text: Supporting Documents Optional Upload any supporting documents, data sheets, or reports (optional)
  - button:
    - img
  - text: Manual Context Input
  - textbox "Manual Context Input"
  - text: Or Upload File Content (Smart Dropzone)
  - button "Choose File"
  - img
  - paragraph: Drag 'n' drop files here, or click to select
  - paragraph: Supports .txt, .md, .html. (Limited support for .docx, .pdf, .csv, .xlsx)
  - text: ⌘+Enter
  - button "Continue":
    - img
    - text: Continue
  - text: Contact Preferences Optional Specify media contact preferences (optional)
  - button:
    - img
  - text: Department
  - combobox: Communications/PR
  - text: Include PR Agency Contact
  - combobox: No - Internal contact only
  - text: ⌘+Enter
  - button "Continue":
    - img
    - text: Continue
  - img
  - text: "Waiting for: Basic Information Tone & Style Analysis AI analyzes your company's communication style"
  - button:
    - img
  - img
  - text: "Waiting for: Basic Information Company & Industry Research AI researches company background and industry context"
  - button:
    - img
  - img
  - text: "Waiting for: Basic Information, Tone & Style Analysis, Company & Industry Research Generate Headline & Key Facts AI creates newsworthy headline and key facts"
  - button:
    - img
  - img
  - text: "Waiting for: Generate Headline & Key Facts Generate Contact Information AI creates appropriate media contact details"
  - button:
    - img
  - img
  - text: "Waiting for: Generate Contact Information Fact-Check & Verification AI verifies all claims and statistics"
  - button:
    - img
  - img
  - text: "Waiting for: Fact-Check & Verification Generate Final Press Release Create the complete press release document"
  - button:
    - img
  - img
  - text: "Waiting for: Generate Final Press Release Press Photo Briefing Optional Specify the type of image to accompany your press release"
  - button:
    - img
  - text: Image Type
  - combobox: Product Photography
  - text: Image Description
  - textbox "Describe the image you want..."
  - paragraph
  - text: Aspect Ratio
  - combobox: 16:9 - Standard Press
  - text: Number of Images
  - combobox: 2 Images
  - img
  - text: "Waiting for: Press Photo Briefing Generate Press Photo Optional AI creates professional images for your press release"
  - button:
    - img
  - text: Export & Publish Transform your press release into professional formats and publish instantly
  - button:
    - img
  - img
  - text: "Waiting for: Generate Final Press Release"
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
  240 |       console.log('✅ Publishing tested');
  241 |     }
  242 |     
  243 |     // Get current URL for persistence test
  244 |     const currentUrl = page.url();
  245 |     console.log('📍 Current URL:', currentUrl);
  246 |     
  247 |     // Test persistence - reload the page
  248 |     console.log('🔄 Testing persistence after reload...');
  249 |     await page.reload();
  250 |     await page.waitForLoadState('networkidle');
  251 |     
  252 |     // Verify all data persisted
  253 |     await page.waitForSelector('[data-testid="stage-card-basic-info"]', { timeout: 15000 });
  254 |     
  255 |     // Check basic info persisted
  256 |     const basicInfoCard = page.locator('[data-testid="stage-card-basic-info"]');
  257 |     await expect(basicInfoCard).toContainText(prData.topic);
  258 |     
  259 |     // Check final press release persisted
  260 |     const reloadedFinalPR = page.locator('[data-testid="stage-card-final-press-release"]');
  261 |     await expect(reloadedFinalPR).toContainText('FOR IMMEDIATE RELEASE');
  262 |     await expect(reloadedFinalPR).toContainText('$25 million');
  263 |     
  264 |     // Check export data persisted
  265 |     const reloadedExport = page.locator('[data-testid="stage-card-export"]');
  266 |     await expect(reloadedExport).toBeVisible();
  267 |     
  268 |     console.log('✅ All data persisted after reload');
  269 |     
  270 |     // Verify workflow completion
  271 |     const completedStages = await page.locator('text=Completed').count();
  272 |     expect(completedStages).toBeGreaterThanOrEqual(7);
  273 |     console.log(`✅ Workflow completed (${completedStages} stages done)`);
  274 |     
  275 |     console.log('🎉 Press Release Master Test PASSED!');
  276 |   });
  277 |
  278 |   test('Test press release with international content and special characters', async ({ page }) => {
  279 |     console.log('🌍 Testing international content...');
  280 |     
  281 |     await page.click('#workflow-start-press-release');
  282 |     await page.waitForSelector('input[name="topic"]', { timeout: 10000 });
  283 |     
  284 |     // Test with international characters
  285 |     const intlData = {
  286 |       topic: 'Expansión a América Latina - €15M inversión',
  287 |       message: 'München-based TechGmbH announces expansion to São Paulo, México City, and Buenos Aires with €15 million investment from European VCs.',
  288 |       company: 'TechGmbH München',
  289 |       website: 'https://techgmbh.de'
  290 |     };
  291 |     
  292 |     await page.fill('input[name="topic"]', intlData.topic);
  293 |     await page.fill('textarea[name="message"]', intlData.message);
  294 |     await page.fill('input[name="company"]', intlData.company);
  295 |     await page.fill('input[name="website"]', intlData.website);
  296 |     
  297 |     await page.click('#process-stage-basic-info');
  298 |     
  299 |     // Process tone briefing
  300 |     await page.waitForSelector('[data-testid="stage-card-tone-briefing"]', { timeout: 10000 });
  301 |     await page.click('#process-stage-tone-briefing');
  302 |     await page.waitForSelector('[data-testid="stage-card-tone-briefing"] code', { timeout: 45000 });
  303 |     console.log('✅ International characters handled correctly');
  304 |     
  305 |     // Continue to key facts
  306 |     await page.waitForSelector('[data-testid="stage-card-key-facts"]', { timeout: 30000 });
  307 |     await page.click('#process-stage-key-facts');
  308 |     
  309 |     await page.waitForSelector('textarea[name="quotes"]', { timeout: 15000 });
  310 |     
  311 |     // Add international quotes
  312 |     const intlQuotes = `"Estamos muy emocionados de expandir nuestras operaciones a América Latina," said Hans Müller, CEO. "Cette expansion représente une étape importante dans notre stratégie globale."`;
  313 |     
  314 |     await page.fill('textarea[name="quotes"]', intlQuotes);
  315 |     await page.click('#process-stage-key-facts');
  316 |     
  317 |     // Verify international content preserved
  318 |     await page.waitForSelector('[data-testid="stage-card-final-press-release"]', { timeout: 45000 });
  319 |     const finalPR = page.locator('[data-testid="stage-card-final-press-release"]');
  320 |     await expect(finalPR).toContainText('€15');
  321 |     await expect(finalPR).toContainText('München');
  322 |     
  323 |     console.log('✅ International content processed successfully');
  324 |   });
  325 |
  326 |   test('Test press release error recovery and validation', async ({ page }) => {
  327 |     console.log('🛡️ Testing error recovery...');
  328 |     
  329 |     await page.click('#workflow-start-press-release');
  330 |     await page.waitForSelector('input[name="topic"]', { timeout: 10000 });
  331 |     
  332 |     // Test with minimal input
  333 |     await page.fill('input[name="topic"]', 'Test');
  334 |     await page.fill('textarea[name="message"]', 'Short message.');
  335 |     await page.fill('input[name="company"]', 'Co');
  336 |     
  337 |     await page.click('#process-stage-basic-info');
  338 |     
  339 |     // Should still process
> 340 |     await page.waitForSelector('[data-testid="stage-card-tone-briefing"]', { timeout: 45000 });
      |                ^ Error: page.waitForSelector: Test timeout of 30000ms exceeded.
  341 |     console.log('✅ Minimal input handled gracefully');
  342 |     
  343 |     // Test fact-checking rejection
  344 |     await page.waitForSelector('[data-testid="stage-card-fact-check"]', { timeout: 60000 });
  345 |     await page.click('#process-stage-fact-check');
  346 |     
  347 |     await page.waitForSelector('select[name="approval_status"]', { timeout: 10000 });
  348 |     await page.selectOption('select[name="approval_status"]', 'rejected');
  349 |     await page.fill('textarea[name="fact_checker_notes"]', 'Claims need verification');
  350 |     
  351 |     await page.click('#process-stage-fact-check');
  352 |     
  353 |     // Verify rejection handled
  354 |     const factCheckStatus = await page.locator('[data-testid="stage-card-fact-check"]').textContent();
  355 |     expect(factCheckStatus).toContain('rejected');
  356 |     console.log('✅ Fact-check rejection handled correctly');
  357 |   });
  358 | });
```