# Test info

- Name: Complete Article Workflow >> should handle errors gracefully
- Location: /Users/franzenzenhofer/dev/franzai-writer/tests/e2e/article-workflow-complete.spec.ts:73:7

# Error details

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('button:has-text("Process Stage")').first()

    at /Users/franzenzenhofer/dev/franzai-writer/tests/e2e/article-workflow-complete.spec.ts:95:68
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
  - heading "New Targeted Page SEO Optimized V3" [level=1]
  - paragraph: "Workflow: Targeted Page SEO Optimized V3"
  - text: Progress 0 / 7 Stages
  - progressbar
  - img
  - text: Save failed Define Your Topic Clearly state the main topic or keyword for your page.
  - button:
    - img
  - textbox "Clearly state the main topic or keyword for your page.": Test topic
  - text: ~3 tokens
  - button "Continue":
    - img
    - text: Continue
  - img
  - text: "Waiting for: Define Your Topic Audience Analysis Describe your target audience. Who are you trying to reach?"
  - button:
    - img
  - text: Key Demographics
  - textbox "Key Demographics"
  - paragraph
  - text: Interests & Pain Points
  - textbox "Interests & Pain Points"
  - paragraph
  - text: Knowledge Level
  - combobox: Intermediate
  - img
  - text: "Waiting for: Define Your Topic Competitor Research (Optional) Optional List a few competitor pages or URLs for analysis. You can use the Smart Dropzone to upload a text file with URLs, or paste them directly."
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
  - text: "Waiting for: Define Your Topic, Audience Analysis, Competitor Research (Optional) Content Angle Identification Based on your topic and audience, the AI will suggest unique content angles."
  - button:
    - img
  - img
  - text: "Waiting for: Content Angle Identification, Define Your Topic Generate Page Title AI will generate compelling page titles based on the chosen angle."
  - button:
    - img
  - text: Select Content Angle
  - combobox: Select one of the generated angles
  - paragraph
  - img
  - text: "Waiting for: Generate Page Title, Audience Analysis, Define Your Topic Create Content Outline Generate a detailed outline for your page."
  - button:
    - img
  - text: Select Page Title
  - combobox: Select one of the generated titles
  - paragraph
  - img
  - text: "Waiting for: Create Content Outline, Define Your Topic, Audience Analysis Generate Full Draft AI will write the full draft based on the outline and title."
  - button:
    - img
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
   3 | test.describe('Complete Article Workflow', () => {
   4 |   test.beforeEach(async ({ page }) => {
   5 |     // Set demo mode for testing
   6 |     await page.goto('/dashboard');
   7 |   });
   8 |
   9 |   test('should create article from start to finish', async ({ page }) => {
   10 |     // Navigate to article workflow
   11 |     await page.locator('text=Targeted Page SEO Optimized').first().click();
   12 |     await page.locator('a:has-text("Start")').first().click();
   13 |     
   14 |     // Wait for wizard to load
   15 |     await page.waitForURL('**/wizard/**');
   16 |     await expect(page.getByTestId('wizard-page-title')).toContainText('Targeted Page SEO Optimized');
   17 |     
   18 |     // Stage 1: Define Your Topic
   19 |     await page.locator('textarea').first().fill('Best practices for implementing React Server Components in Next.js 14');
   20 |     await page.locator('button:has-text("Process Stage")').first().click();
   21 |     
   22 |     // Wait for processing
   23 |     await page.waitForTimeout(2000);
   24 |     
   25 |     // Verify stage completed
   26 |     await expect(page.locator('text=Progress')).toBeVisible();
   27 |     
   28 |     // Stage 2: Audience Analysis
   29 |     const demographicsInput = page.locator('input[placeholder*="demographics"], input').first();
   30 |     await demographicsInput.fill('Web developers, software engineers, front-end developers with 2-5 years experience');
   31 |     
   32 |     const interestsInput = page.locator('input[placeholder*="interests"], input').nth(1);
   33 |     await interestsInput.fill('Performance optimization, modern web development, React ecosystem, TypeScript');
   34 |     
   35 |     // Select knowledge level
   36 |     await page.locator('input[type="radio"][value="Intermediate"]').check();
   37 |     
   38 |     // Process audience analysis
   39 |     await page.locator('button:has-text("Process Stage")').first().click();
   40 |     await page.waitForTimeout(2000);
   41 |     
   42 |     // Stage 3: Skip competitor research
   43 |     await page.locator('button:has-text("Skip Stage")').click();
   44 |     
   45 |     // Wait for AI stages to become available
   46 |     await page.waitForTimeout(1000);
   47 |     
   48 |     // Stage 4: Content Angle - should auto-run
   49 |     await page.waitForTimeout(3000);
   50 |     
   51 |     // Stage 5: Generate Page Title
   52 |     const angleSelect = page.locator('select').first();
   53 |     await angleSelect.selectOption({ index: 1 }); // Select first option
   54 |     await page.locator('button:has-text("Process Stage")').click();
   55 |     await page.waitForTimeout(2000);
   56 |     
   57 |     // Stage 6: Create Content Outline
   58 |     const titleSelect = page.locator('select').nth(1);
   59 |     await titleSelect.selectOption({ index: 1 }); // Select first option
   60 |     await page.locator('button:has-text("Process Stage")').click();
   61 |     await page.waitForTimeout(2000);
   62 |     
   63 |     // Stage 7: Generate Full Draft - should auto-run
   64 |     await page.waitForTimeout(5000);
   65 |     
   66 |     // Verify all stages completed
   67 |     await expect(page.locator('text=7 / 7 Stages')).toBeVisible();
   68 |     
   69 |     // Test completed successfully - workflow is now complete
   70 |     console.log('Article workflow completed successfully');
   71 |   });
   72 |
   73 |   test('should handle errors gracefully', async ({ page }) => {
   74 |     // This test checks that 500 errors are handled properly
   75 |     await page.goto('/dashboard');
   76 |     
   77 |     // Set up to intercept API calls
   78 |     await page.route('**/api/**', route => {
   79 |       if (route.request().method() === 'POST') {
   80 |         route.fulfill({
   81 |           status: 500,
   82 |           body: JSON.stringify({ error: 'Internal Server Error' })
   83 |         });
   84 |       } else {
   85 |         route.continue();
   86 |       }
   87 |     });
   88 |     
   89 |     // Try to run workflow
   90 |     await page.locator('text=Targeted Page SEO Optimized').first().click();
   91 |     await page.locator('a:has-text("Start")').first().click();
   92 |     
   93 |     // Fill first stage
   94 |     await page.locator('textarea').first().fill('Test topic');
>  95 |     await page.locator('button:has-text("Process Stage")').first().click();
      |                                                                    ^ Error: locator.click: Test timeout of 30000ms exceeded.
   96 |     
   97 |     // Should show error message instead of crashing
   98 |     await expect(page.locator('text=error').first()).toBeVisible({ timeout: 5000 });
   99 |   });
  100 |
  101 |   test('should save progress automatically', async ({ page }) => {
  102 |     await page.goto('/dashboard');
  103 |     
  104 |     // Start workflow
  105 |     await page.locator('text=Targeted Page SEO Optimized').first().click();
  106 |     await page.locator('a:has-text("Start")').first().click();
  107 |     
  108 |     // Fill first stage
  109 |     await page.locator('textarea').first().fill('Auto-save test topic');
  110 |     
  111 |     // Wait for auto-save
  112 |     await page.waitForTimeout(3000);
  113 |     
  114 |     // Check for save indicator
  115 |     await expect(page.locator('text=Saving').or(page.locator('text=Last saved'))).toBeVisible({ timeout: 10000 });
  116 |   });
  117 | });
```