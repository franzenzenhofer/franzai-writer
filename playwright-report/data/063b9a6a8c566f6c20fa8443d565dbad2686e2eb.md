# Test info

- Name: Complete Article Workflow >> should handle errors gracefully
- Location: /Users/franzenzenhofer/dev/franzai-writer/tests/e2e/article-workflow-complete.spec.ts:77:7

# Error details

```
Error: Timed out 5000ms waiting for expect(locator).toBeVisible()

Locator: locator('text=error').first()
Expected: visible
Received: <element(s) not found>
Call log:
  - expect.toBeVisible with timeout 5000ms
  - waiting for locator('text=error').first()

    at /Users/franzenzenhofer/dev/franzai-writer/tests/e2e/article-workflow-complete.spec.ts:102:54
```

# Page snapshot

```yaml
- banner:
  - link "Franz AI Writer":
    - /url: /
    - img
    - text: Franz AI Writer
  - navigation:
    - link "Dashboard":
      - /url: /dashboard
  - navigation:
    - link "Login":
      - /url: /login
- main:
  - heading "New Targeted Page SEO Optimized V3" [level=1]
  - paragraph: "Workflow: Targeted Page SEO Optimized V3"
  - text: Progress 1 / 7 Stages
  - progressbar
  - img
  - text: Define Your Topic Clearly state the main topic or keyword for your page.
  - heading "Output:" [level=4]
  - paragraph: Test topic
  - button "Edit Input":
    - img
    - text: Edit Input
  - button "Edit Output":
    - img
    - text: Edit Output
  - button "Accept & Continue":
    - img
    - text: Accept & Continue
  - text: Audience Analysis Describe your target audience. Who are you trying to reach?
  - heading "Input:" [level=4]
  - text: Key Demographics
  - textbox "Key Demographics"
  - paragraph
  - text: Interests & Pain Points
  - textbox "Interests & Pain Points"
  - paragraph
  - text: Knowledge Level
  - combobox: Intermediate
  - button "Process Stage":
    - img
    - text: Process Stage
  - text: Competitor Research (Optional) List a few competitor pages or URLs for analysis. You can use the Smart Dropzone to upload a text file with URLs, or paste them directly. Optional
  - heading "Input:" [level=4]
  - text: Manual Context Input
  - textbox "Manual Context Input"
  - text: "Estimated Tokens: ~0 Or Upload File Content (Smart Dropzone)"
  - button "Choose File"
  - img
  - paragraph: Drag 'n' drop files here, or click to select
  - paragraph: Supports .txt, .md, .html. (Limited support for .docx, .pdf, .csv, .xlsx)
  - button "Skip Stage":
    - img
    - text: Skip Stage
  - button "Process Stage":
    - img
    - text: Process Stage
  - img
  - text: "Waiting for: Audience Analysis, Competitor Research (Optional) Content Angle Identification Based on your topic and audience, the AI will suggest unique content angles."
  - img
  - text: "Waiting for: Content Angle Identification Generate Page Title AI will generate compelling page titles based on the chosen angle."
  - heading "Input:" [level=4]
  - text: Select Content Angle
  - combobox: Select one of the generated angles
  - paragraph
  - img
  - text: "Waiting for: Generate Page Title, Audience Analysis Create Content Outline Generate a detailed outline for your page."
  - heading "Input:" [level=4]
  - text: Select Page Title
  - combobox: Select one of the generated titles
  - paragraph
  - img
  - text: "Waiting for: Create Content Outline, Audience Analysis Generate Full Draft AI will write the full draft based on the outline and title."
  - button "Finalize Document" [disabled]:
    - img
    - text: Finalize Document
- contentinfo:
  - paragraph:
    - text: Built by
    - link "YourName/Team":
      - /url: https://github.com/your-repo/franz-ai-writer
    - text: . The source code is available on
    - link "GitHub":
      - /url: https://github.com/your-repo/franz-ai-writer
    - text: .
  - text: © 2025 Franz AI Writer
  - link "GitHub":
    - /url: https://github.com/your-repo/franz-ai-writer
    - img
    - text: GitHub
- region "Notifications (F8)":
  - list:
    - status:
      - text: Stage Processed Stage "Define Your Topic" marked as complete.
      - button:
        - img
- alert
- button "Open Next.js Dev Tools":
  - img
```

# Test source

```ts
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
   69 |     // Finalize document
   70 |     await expect(page.getByTestId('finalize-document-button')).toBeEnabled();
   71 |     await page.getByTestId('finalize-document-button').click();
   72 |     
   73 |     // Verify final document dialog
   74 |     await expect(page.locator('text=Your document is ready!')).toBeVisible();
   75 |   });
   76 |
   77 |   test('should handle errors gracefully', async ({ page }) => {
   78 |     // This test checks that 500 errors are handled properly
   79 |     await page.goto('/dashboard');
   80 |     
   81 |     // Set up to intercept API calls
   82 |     await page.route('**/api/**', route => {
   83 |       if (route.request().method() === 'POST') {
   84 |         route.fulfill({
   85 |           status: 500,
   86 |           body: JSON.stringify({ error: 'Internal Server Error' })
   87 |         });
   88 |       } else {
   89 |         route.continue();
   90 |       }
   91 |     });
   92 |     
   93 |     // Try to run workflow
   94 |     await page.locator('text=Targeted Page SEO Optimized').first().click();
   95 |     await page.locator('a:has-text("Start")').first().click();
   96 |     
   97 |     // Fill first stage
   98 |     await page.locator('textarea').first().fill('Test topic');
   99 |     await page.locator('button:has-text("Process Stage")').first().click();
  100 |     
  101 |     // Should show error message instead of crashing
> 102 |     await expect(page.locator('text=error').first()).toBeVisible({ timeout: 5000 });
      |                                                      ^ Error: Timed out 5000ms waiting for expect(locator).toBeVisible()
  103 |   });
  104 |
  105 |   test('should save progress automatically', async ({ page }) => {
  106 |     await page.goto('/dashboard');
  107 |     
  108 |     // Start workflow
  109 |     await page.locator('text=Targeted Page SEO Optimized').first().click();
  110 |     await page.locator('a:has-text("Start")').first().click();
  111 |     
  112 |     // Fill first stage
  113 |     await page.locator('textarea').first().fill('Auto-save test topic');
  114 |     
  115 |     // Wait for auto-save
  116 |     await page.waitForTimeout(3000);
  117 |     
  118 |     // Check for save indicator
  119 |     await expect(page.locator('text=Saving').or(page.locator('text=Last saved'))).toBeVisible({ timeout: 10000 });
  120 |   });
  121 | });
```