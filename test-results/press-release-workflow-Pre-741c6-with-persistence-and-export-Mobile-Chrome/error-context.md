# Test info

- Name: Press Release Workflow - Master Test (Chrome Only) >> Complete press release workflow with persistence and export
- Location: /Users/franzenzenhofer/dev/franzai-writer/tests/e2e/press-release-workflow.spec.ts:21:7

# Error details

```
TimeoutError: page.waitForSelector: Timeout 10000ms exceeded.
Call log:
  - waiting for locator('input[name="topic"]') to be visible

    at /Users/franzenzenhofer/dev/franzai-writer/tests/e2e/press-release-workflow.spec.ts:26:16
```

# Page snapshot

```yaml
- banner:
  - button "Toggle menu":
    - img
    - text: Toggle menu
  - text: FranzAI Writer
  - navigation
- main
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
   3 | /**
   4 |  * Master E2E test for Press Release workflow
   5 |  * Complete workflow: basic info → tone → research → key facts → contact → final → photo → export
   6 |  * Chrome only for performance per CLAUDE.md guidelines
   7 |  */
   8 |
   9 | test.describe('Press Release Workflow - Master Test (Chrome Only)', () => {
   10 |   test.skip(({ browserName }) => browserName !== 'chromium', 'Chrome only per CLAUDE.md guidelines');
   11 |   
   12 |   // Test configuration
   13 |   const BASE_URL = 'http://localhost:9002';
   14 |   
   15 |   test.beforeEach(async ({ page }) => {
   16 |     // Start each test from a clean dashboard
   17 |     await page.goto(`${BASE_URL}/dashboard`);
   18 |     await page.waitForSelector('text=Start a new document', { timeout: 10000 });
   19 |   });
   20 |
   21 |   test('Complete press release workflow with persistence and export', async ({ page }) => {
   22 |     console.log('🚀 Starting Press Release Master Test...');
   23 |     
   24 |     // Start press release generator
   25 |     await page.click('#workflow-start-press-release');
>  26 |     await page.waitForSelector('input[name="topic"]', { timeout: 10000 });
      |                ^ TimeoutError: page.waitForSelector: Timeout 10000ms exceeded.
   27 |     
   28 |     // Stage 1: Basic Information
   29 |     console.log('📝 Stage 1: Basic Information');
   30 |     const prData = {
   31 |       topic: 'Series A Funding Round - $25M Investment',
   32 |       message: 'TechStartup Inc., a leading AI-powered analytics platform, today announced the successful completion of its $25 million Series A funding round led by Sequoia Capital, with participation from Andreessen Horowitz and existing investors.',
   33 |       company: 'TechStartup Inc.',
   34 |       website: 'https://techstartup.com'
   35 |     };
   36 |     
   37 |     await page.fill('input[name="topic"]', prData.topic);
   38 |     await page.fill('textarea[name="message"]', prData.message);
   39 |     await page.fill('input[name="company"]', prData.company);
   40 |     await page.fill('input[name="website"]', prData.website);
   41 |     
   42 |     await page.click('#process-stage-basic-info');
   43 |     
   44 |     // Wait for auto-save indicator
   45 |     await page.waitForSelector('text=Last saved', { timeout: 15000 });
   46 |     console.log('✅ Basic information saved');
   47 |     
   48 |     // Stage 2: Tone Briefing (manual - context stage)
   49 |     console.log('🎯 Stage 2: Tone Analysis');
   50 |     await page.waitForSelector('[data-testid="stage-card-tone-briefing"]', { timeout: 10000 });
   51 |     
   52 |     // Context stages need manual processing
   53 |     await page.click('#process-stage-tone-briefing');
   54 |     
   55 |     // Wait for the tone analysis to complete - look for code output or accept button
   56 |     const toneCompleted = await Promise.race([
   57 |       page.waitForSelector('[data-testid="stage-card-tone-briefing"] code', { timeout: 45000 })
   58 |         .then(() => 'code'),
   59 |       page.waitForSelector('[data-testid="stage-card-tone-briefing"] button:has-text("Accept & Continue")', { timeout: 45000 })
   60 |         .then(() => 'accept')
   61 |     ]);
   62 |     
   63 |     if (toneCompleted === 'accept') {
   64 |       // Click accept if the button appears
   65 |       await page.click('[data-testid="stage-card-tone-briefing"] button:has-text("Accept & Continue")');
   66 |     }
   67 |     
   68 |     console.log('✅ Tone analysis completed');
   69 |     
   70 |     // Stage 3: Research (requires manual processing)
   71 |     console.log('🔍 Stage 3: Research');
   72 |     await page.waitForSelector('[data-testid="stage-card-research"]', { timeout: 10000 });
   73 |     
   74 |     // Wait for the research stage to be ready and click Run AI
   75 |     const runAIButton = page.locator('[data-testid="stage-card-research"] button:has-text("Run AI")');
   76 |     await runAIButton.waitFor({ state: 'visible', timeout: 10000 });
   77 |     await runAIButton.click();
   78 |     
   79 |     console.log('🔄 Research processing started...');
   80 |     
   81 |     // Wait for research to complete - could show code or other output
   82 |     const researchCompleted = await Promise.race([
   83 |       page.waitForSelector('[data-testid="stage-card-research"] code', { timeout: 60000 })
   84 |         .then(() => 'code'),
   85 |       page.waitForSelector('[data-testid="stage-card-research"] button:has-text("Accept & Continue")', { timeout: 60000 })
   86 |         .then(() => 'accept'),
   87 |       page.waitForSelector('[data-testid="stage-card-research"] button:has-text("AI REDO")', { timeout: 60000 })
   88 |         .then(() => 'redo')
   89 |     ]);
   90 |     
   91 |     console.log(`✅ Research completed with: ${researchCompleted}`);
   92 |     
   93 |     // If there's an accept button, click it
   94 |     if (researchCompleted === 'accept') {
   95 |       await page.click('[data-testid="stage-card-research"] button:has-text("Accept & Continue")');
   96 |     }
   97 |     
   98 |     // Wait for dependencies to update
   99 |     await page.waitForTimeout(2000);
  100 |     
  101 |     // Stage 4: Key Facts (requires manual processing)
  102 |     console.log('📊 Stage 4: Key Facts');
  103 |     await page.waitForSelector('[data-testid="stage-card-key-facts"]', { timeout: 30000 });
  104 |     
  105 |     // Wait for the stage to be active (not waiting)
  106 |     await page.waitForSelector('[data-testid="stage-card-key-facts"]:not(:has-text("Waiting for"))', { timeout: 15000 });
  107 |     
  108 |     // Click the process button
  109 |     const keyFactsButton = page.locator('#process-stage-key-facts');
  110 |     await keyFactsButton.waitFor({ state: 'visible', timeout: 10000 });
  111 |     await keyFactsButton.click();
  112 |     
  113 |     await page.waitForSelector('input[name="headline"]', { timeout: 15000 });
  114 |     
  115 |     // Verify auto-generated headline
  116 |     const headline = await page.locator('input[name="headline"]').inputValue();
  117 |     expect(headline).toBeTruthy();
  118 |     
  119 |     // Add custom key points
  120 |     const keyPoints = `• Raised $25 million in Series A funding
  121 | • Led by Sequoia Capital with top-tier investor participation
  122 | • Funding will accelerate product development and market expansion
  123 | • Company has grown 400% year-over-year
  124 | • Plans to double team size to 100 employees by year-end`;
  125 |     
  126 |     await page.fill('textarea[name="key_points"]', keyPoints);
```