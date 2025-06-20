# Test info

- Name: Press Release Workflow >> should complete full press release workflow with all stages
- Location: /Users/franzenzenhofer/dev/franzai-writer/tests/e2e/press-release-workflow.spec.ts:9:7

# Error details

```
Error: locator.fill: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('input[placeholder*="New Product Launch"]')

    at /Users/franzenzenhofer/dev/franzai-writer/tests/e2e/press-release-workflow.spec.ts:17:70
    at /Users/franzenzenhofer/dev/franzai-writer/tests/e2e/press-release-workflow.spec.ts:13:16
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
  - heading "New Press Release Generator" [level=1]
  - paragraph: "Workflow: Press Release Generator"
  - text: Progress 0 / 8 Stages
  - progressbar
  - text: Last saved 7:51:06 AM Provide the topic, key message, and company name for your press release
  - button:
    - img
  - paragraph: Form fields not configured for this stage.
  - button "Continue":
    - img
    - text: Continue
  - img
  - text: "Waiting for: basic-info Analyze company's existing press releases to match their tone and style"
  - button:
    - img
  - text: Manual Context Input
  - textbox "Manual Context Input"
  - text: Or Upload File Content (Smart Dropzone)
  - button "Choose File"
  - img
  - paragraph: Drag 'n' drop files here, or click to select
  - paragraph: Supports .txt, .md, .html. (Limited support for .docx, .pdf, .csv, .xlsx)
  - img
  - text: "Waiting for: basic-info, tone-briefing Research company background and industry context"
  - button:
    - img
  - img
  - text: "Waiting for: research Review and edit the key facts for your press release"
  - button:
    - img
  - paragraph: Form fields not configured for this stage.
  - img
  - text: "Waiting for: key-facts Provide contact details for media inquiries"
  - button:
    - img
  - paragraph: Form fields not configured for this stage.
  - img
  - text: "Waiting for: key-facts, contact-info, tone-briefing Create the final press release following official standards"
  - button:
    - img
  - img
  - text: "Waiting for: final-press-release Optional Create a professional image to accompany the press release"
  - button:
    - img
  - paragraph: Form fields not configured for this stage.
  - text: Export your press release in various formats
  - button:
    - img
  - img
  - text: "Waiting for: final-press-release"
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
   3 | test.describe('Press Release Workflow', () => {
   4 |   test.beforeEach(async ({ page }) => {
   5 |     await page.goto('/w/press-release/new');
   6 |     await page.waitForLoadState('networkidle');
   7 |   });
   8 |
   9 |   test('should complete full press release workflow with all stages', async ({ page }) => {
   10 |     console.log('Starting press release workflow test');
   11 |
   12 |     // Stage 1: Basic Information
   13 |     await test.step('Fill basic information', async () => {
   14 |       console.log('Filling basic information form');
   15 |       
   16 |       // Fill topic
>  17 |       await page.locator('input[placeholder*="New Product Launch"]').fill('Revolutionary AI Platform Launch');
      |                                                                      ^ Error: locator.fill: Test timeout of 30000ms exceeded.
   18 |       
   19 |       // Fill message
   20 |       await page.locator('textarea[placeholder*="We\'re launching"]').fill(
   21 |         'We are excited to announce the launch of our groundbreaking AI platform that revolutionizes how businesses analyze and predict customer behavior using advanced machine learning algorithms.'
   22 |       );
   23 |       
   24 |       // Fill company name
   25 |       await page.locator('input[placeholder*="TechCorp Inc."]').fill('InnovateTech Solutions');
   26 |       
   27 |       // Fill website (optional)
   28 |       await page.locator('input[placeholder*="https://example.com"]').fill('https://innovatetech.com');
   29 |       
   30 |       // Process stage
   31 |       await page.click('#process-stage-basic-info');
   32 |       
   33 |       // Wait for completion
   34 |       await expect(page.locator('[data-testid="stage-card-basic-info"]')).toHaveClass(/border-green-500/, { 
   35 |         timeout: 30000 
   36 |       });
   37 |       console.log('Basic information stage completed');
   38 |     });
   39 |
   40 |     // Stage 2: Tone of Voice Analysis (auto-runs)
   41 |     await test.step('Wait for tone analysis to complete', async () => {
   42 |       console.log('Waiting for tone analysis to auto-run');
   43 |       
   44 |       // Since this stage auto-runs, just wait for completion
   45 |       await expect(page.locator('[data-testid="stage-card-tone-briefing"]')).toHaveClass(/border-green-500/, { 
   46 |         timeout: 60000 
   47 |       });
   48 |       
   49 |       // Optionally upload example press releases
   50 |       const dropzone = page.locator('[data-stage-id="tone-briefing"] [data-testid="dropzone"]');
   51 |       if (await dropzone.isVisible()) {
   52 |         console.log('Dropzone available for tone examples, but skipping for basic test');
   53 |       }
   54 |       
   55 |       console.log('Tone analysis completed');
   56 |     });
   57 |
   58 |     // Stage 3: Research (auto-runs)
   59 |     await test.step('Wait for research to complete', async () => {
   60 |       console.log('Waiting for research stage to auto-run');
   61 |       
   62 |       await expect(page.locator('[data-testid="stage-card-research"]')).toHaveClass(/border-green-500/, { 
   63 |         timeout: 90000 // Longer timeout for web search
   64 |       });
   65 |       
   66 |       console.log('Research stage completed');
   67 |     });
   68 |
   69 |     // Stage 4: Edit Key Facts
   70 |     await test.step('Edit key facts', async () => {
   71 |       console.log('Editing key facts');
   72 |       
   73 |       // The form should be pre-populated from research, but we can edit
   74 |       // Fill headline if empty
   75 |       const headlineInput = page.locator('input[id*="headline"]').first();
   76 |       const headlineValue = await headlineInput.inputValue();
   77 |       if (!headlineValue) {
   78 |         await headlineInput.fill('InnovateTech Solutions Unveils Game-Changing AI Platform for Predictive Customer Analytics');
   79 |       }
   80 |       
   81 |       // Add quotes if empty
   82 |       const quotesTextarea = page.locator('textarea[placeholder*="This launch represents"]');
   83 |       const quotesValue = await quotesTextarea.inputValue();
   84 |       if (!quotesValue) {
   85 |         await quotesTextarea.fill(
   86 |           '"This platform represents a significant leap forward in AI-powered business intelligence," said John Smith, CEO of InnovateTech Solutions. "We\'re empowering businesses to make data-driven decisions with unprecedented accuracy."'
   87 |         );
   88 |       }
   89 |       
   90 |       // Process stage
   91 |       await page.click('#process-stage-key-facts');
   92 |       
   93 |       // Wait for completion
   94 |       await expect(page.locator('[data-testid="stage-card-key-facts"]')).toHaveClass(/border-green-500/, { 
   95 |         timeout: 30000 
   96 |       });
   97 |       console.log('Key facts editing completed');
   98 |     });
   99 |
  100 |     // Stage 5: Edit Contact Information
  101 |     await test.step('Fill contact information', async () => {
  102 |       console.log('Filling contact information');
  103 |       
  104 |       // Fill contact details
  105 |       await page.locator('input[placeholder*="Jane Smith"]').fill('Sarah Johnson');
  106 |       await page.locator('input[placeholder*="Director of Communications"]').fill('VP of Marketing Communications');
  107 |       await page.locator('input[placeholder*="press@company.com"]').fill('press@innovatetech.com');
  108 |       await page.locator('input[placeholder*="+1 (555)"]').fill('+1 (555) 987-6543');
  109 |       
  110 |       // Process stage
  111 |       await page.click('#process-stage-contact-info');
  112 |       
  113 |       // Wait for completion
  114 |       await expect(page.locator('[data-testid="stage-card-contact-info"]')).toHaveClass(/border-green-500/, { 
  115 |         timeout: 30000 
  116 |       });
  117 |       console.log('Contact information completed');
```