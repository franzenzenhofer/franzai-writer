# Test info

- Name: Press Release Workflow - Unconventional Usage >> should handle multiple AI redos and non-linear execution
- Location: /Users/franzenzenhofer/dev/franzai-writer/tests/e2e/press-release-workflow-unconventional.spec.ts:9:7

# Error details

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('[data-testid="stage-card-tone-briefing"]').locator('button[title="AI Redo"]')

    at /Users/franzenzenhofer/dev/franzai-writer/tests/e2e/press-release-workflow-unconventional.spec.ts:39:58
    at /Users/franzenzenhofer/dev/franzai-writer/tests/e2e/press-release-workflow-unconventional.spec.ts:29:5
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
  - text: Progress 3 / 8 Stages
  - progressbar
  - text: Last saved 9:57:55 AM
  - img
  - text: Provide the topic, key message, and company name for your press release
  - button:
    - img
  - text: Press Release Topic Test Key Message Testing Company Name X Company Website (Optional) Not provided
  - button:
    - img
  - button "Edit":
    - img
    - text: Edit
  - img
  - text: Analyze company's existing press releases to match their tone and style
  - button:
    - img
  - button "Edit":
    - img
    - text: Edit
  - img
  - text: Research company background and industry context
  - button:
    - img
  - text: Review and edit the key facts for your press release
  - button:
    - img
  - text: Headline
  - textbox "Headline"
  - paragraph
  - text: Subheadline
  - textbox "Subheadline"
  - paragraph
  - text: Key Points
  - textbox "Key Points"
  - paragraph
  - text: Quotes
  - textbox "Quotes"
  - paragraph
  - text: Statistics & Data
  - textbox "Statistics & Data"
  - paragraph
  - button "Continue":
    - img
    - text: Continue
  - img
  - text: "Waiting for: key-facts Provide contact details for media inquiries"
  - button:
    - img
  - text: Contact Name
  - textbox "Contact Name"
  - paragraph
  - text: Contact Title
  - textbox "Contact Title"
  - paragraph
  - text: Contact Email
  - textbox "Contact Email"
  - paragraph
  - text: Contact Phone
  - textbox "Contact Phone"
  - paragraph
  - text: Additional Contacts (Optional)
  - textbox "Additional Contacts (Optional)"
  - paragraph
  - img
  - text: "Waiting for: key-facts, contact-info Create the final press release following official standards"
  - button:
    - img
  - img
  - text: "Waiting for: final-press-release Optional Create a professional image to accompany the press release"
  - button:
    - img
  - text: Image Description
  - textbox "Image Description"
  - paragraph
  - text: Image Style
  - combobox: Photorealistic
  - text: Aspect Ratio
  - combobox: 16:9 (Landscape)
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
   3 | test.describe('Press Release Workflow - Unconventional Usage', () => {
   4 |   test.beforeEach(async ({ page }) => {
   5 |     await page.goto('/w/press-release/new');
   6 |     await page.waitForLoadState('networkidle');
   7 |   });
   8 |
   9 |   test('should handle multiple AI redos and non-linear execution', async ({ page }) => {
   10 |     console.log('Starting unconventional press release workflow test');
   11 |
   12 |     // Stage 1: Minimal basic information
   13 |     await test.step('Fill minimal basic information', async () => {
   14 |       console.log('Filling minimal info - testing with bare minimum');
   15 |       
   16 |       // Only fill required fields with minimal data
   17 |       await page.locator('input[placeholder*="New Product Launch"]').fill('Test');
   18 |       await page.locator('textarea[placeholder*="We\'re launching"]').fill('Testing');
   19 |       await page.locator('input[placeholder*="TechCorp Inc."]').fill('X');
   20 |       // Skip optional website field
   21 |       
   22 |       await page.click('#process-stage-basic-info');
   23 |       await expect(page.locator('[data-testid="stage-card-basic-info"]')).toHaveClass(/border-green-500/, { 
   24 |         timeout: 30000 
   25 |       });
   26 |     });
   27 |
   28 |     // Stage 2: Multiple AI redos on tone analysis
   29 |     await test.step('Multiple AI redos on tone analysis', async () => {
   30 |       console.log('Testing multiple AI redos on tone analysis');
   31 |       
   32 |       // Wait for initial completion
   33 |       await expect(page.locator('[data-testid="stage-card-tone-briefing"]')).toHaveClass(/border-green-500/, { 
   34 |         timeout: 60000 
   35 |       });
   36 |       
   37 |       // First AI redo
   38 |       const toneStage = page.locator('[data-testid="stage-card-tone-briefing"]');
>  39 |       await toneStage.locator('button[title="AI Redo"]').click();
      |                                                          ^ Error: locator.click: Test timeout of 30000ms exceeded.
   40 |       await page.waitForSelector('[role="dialog"]:has-text("AI Redo")');
   41 |       await page.locator('[role="dialog"] textarea').fill('Make it extremely formal and corporate');
   42 |       await page.locator('[role="dialog"] button:has-text("Redo with AI")').click();
   43 |       await expect(toneStage).toHaveClass(/border-green-500/, { timeout: 60000 });
   44 |       
   45 |       // Second AI redo
   46 |       await toneStage.locator('button[title="AI Redo"]').click();
   47 |       await page.waitForSelector('[role="dialog"]:has-text("AI Redo")');
   48 |       await page.locator('[role="dialog"] textarea').fill('Actually, make it very casual and startup-like');
   49 |       await page.locator('[role="dialog"] button:has-text("Redo with AI")').click();
   50 |       await expect(toneStage).toHaveClass(/border-green-500/, { timeout: 60000 });
   51 |       
   52 |       // Third AI redo
   53 |       await toneStage.locator('button[title="AI Redo"]').click();
   54 |       await page.waitForSelector('[role="dialog"]:has-text("AI Redo")');
   55 |       await page.locator('[role="dialog"] textarea').fill('Find a balance between formal and casual, professional but approachable');
   56 |       await page.locator('[role="dialog"] button:has-text("Redo with AI")').click();
   57 |       await expect(toneStage).toHaveClass(/border-green-500/, { timeout: 60000 });
   58 |       
   59 |       console.log('Completed 3 AI redos on tone analysis');
   60 |     });
   61 |
   62 |     // Stage 3: Edit research after it completes
   63 |     await test.step('Edit auto-generated research', async () => {
   64 |       console.log('Waiting for research to complete, then editing');
   65 |       
   66 |       await expect(page.locator('[data-testid="stage-card-research"]')).toHaveClass(/border-green-500/, { 
   67 |         timeout: 90000 
   68 |       });
   69 |       
   70 |       // Click edit button
   71 |       const researchStage = page.locator('[data-testid="stage-card-research"]');
   72 |       await researchStage.locator('button[title="Edit"]').click();
   73 |       
   74 |       // Wait for edit mode
   75 |       await page.waitForTimeout(1000);
   76 |       
   77 |       // Find the textarea in edit mode and modify content
   78 |       const editTextarea = researchStage.locator('textarea').first();
   79 |       const currentContent = await editTextarea.inputValue();
   80 |       await editTextarea.fill(currentContent + '\n\nEDITED: Added custom research notes about competitors.');
   81 |       
   82 |       // Save edits
   83 |       await researchStage.locator('button:has-text("Save")').click();
   84 |       
   85 |       console.log('Research edited after auto-generation');
   86 |     });
   87 |
   88 |     // Stage 4: Leave key facts mostly empty
   89 |     await test.step('Submit key facts with minimal data', async () => {
   90 |       console.log('Testing with mostly empty key facts');
   91 |       
   92 |       // Only fill headline, leave everything else empty
   93 |       await page.locator('input[placeholder="Main headline for the press release"]').fill('Minimal Test Headline');
   94 |       
   95 |       // Process with mostly empty fields
   96 |       await page.click('#process-stage-key-facts');
   97 |       await expect(page.locator('[data-testid="stage-card-key-facts"]')).toHaveClass(/border-green-500/, { 
   98 |         timeout: 30000 
   99 |       });
  100 |     });
  101 |
  102 |     // Go back and edit basic info AFTER other stages completed
  103 |     await test.step('Edit basic info after progression', async () => {
  104 |       console.log('Going back to edit basic info');
  105 |       
  106 |       const basicInfoStage = page.locator('[data-testid="stage-card-basic-info"]');
  107 |       await basicInfoStage.locator('button[title="Edit"]').click();
  108 |       
  109 |       // Wait for edit mode
  110 |       await page.waitForTimeout(1000);
  111 |       
  112 |       // Update the company name
  113 |       const companyInput = page.locator('input[placeholder*="TechCorp Inc."]');
  114 |       await companyInput.clear();
  115 |       await companyInput.fill('Updated Company Name LLC');
  116 |       
  117 |       // Save changes
  118 |       await basicInfoStage.locator('button:has-text("Save")').click();
  119 |       
  120 |       console.log('Basic info updated after other stages completed');
  121 |     });
  122 |
  123 |     // Stage 5: Skip contact info initially, then fill later
  124 |     await test.step('Skip and return to contact info', async () => {
  125 |       console.log('Testing non-linear stage completion');
  126 |       
  127 |       // Skip contact info for now
  128 |       const contactStage = page.locator('[data-testid="stage-card-contact-info"]');
  129 |       
  130 |       // Try to proceed without filling contact info
  131 |       // The final press release should wait for this dependency
  132 |       
  133 |       // Fill contact info after attempting to skip
  134 |       await page.locator('input[placeholder*="Jane Smith"]').fill('J');
  135 |       await page.locator('input[placeholder*="Director of Communications"]').fill('CEO');
  136 |       await page.locator('input[placeholder*="press@company.com"]').fill('x@y.z');
  137 |       await page.locator('input[placeholder*="+1 (555)"]').fill('1');
  138 |       
  139 |       await page.click('#process-stage-contact-info');
```