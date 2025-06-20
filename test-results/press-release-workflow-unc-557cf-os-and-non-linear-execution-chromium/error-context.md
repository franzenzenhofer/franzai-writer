# Test info

- Name: Press Release Workflow - Unconventional Usage >> should handle multiple AI redos and non-linear execution
- Location: /Users/franzenzenhofer/dev/franzai-writer/tests/e2e/press-release-workflow-unconventional.spec.ts:9:7

# Error details

```
Error: Timed out 5000ms waiting for expect(locator).toBeVisible()

Locator: locator('[data-testid="stage-card-tone-briefing"]').locator('button[title="AI Redo"]')
Expected: visible
Received: <element(s) not found>
Call log:
  - expect.toBeVisible with timeout 5000ms
  - waiting for locator('[data-testid="stage-card-tone-briefing"]').locator('button[title="AI Redo"]')

    at /Users/franzenzenhofer/dev/franzai-writer/tests/e2e/press-release-workflow-unconventional.spec.ts:43:34
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
  - text: Last saved 10:07:26 AM
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
  - list:
    - status:
      - text: Stage Processed Stage "undefined" marked as complete.
      - button:
        - img
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
   33 |       const toneStage = page.locator('[data-testid="stage-card-tone-briefing"]');
   34 |       await expect(toneStage).toHaveClass(/border-green-500/, { 
   35 |         timeout: 60000 
   36 |       });
   37 |       
   38 |       // Add a small delay to ensure UI is ready
   39 |       await page.waitForTimeout(1000);
   40 |       
   41 |       // First AI redo
   42 |       const aiRedoButton = toneStage.locator('button[title="AI Redo"]');
>  43 |       await expect(aiRedoButton).toBeVisible({ timeout: 5000 });
      |                                  ^ Error: Timed out 5000ms waiting for expect(locator).toBeVisible()
   44 |       await aiRedoButton.click();
   45 |       await page.waitForSelector('[role="dialog"]:has-text("AI Redo")');
   46 |       await page.locator('[role="dialog"] textarea').fill('Make it extremely formal and corporate');
   47 |       await page.locator('[role="dialog"] button:has-text("Redo with AI")').click();
   48 |       await expect(toneStage).toHaveClass(/border-green-500/, { timeout: 60000 });
   49 |       
   50 |       // Second AI redo
   51 |       await toneStage.locator('button[title="AI Redo"]').click();
   52 |       await page.waitForSelector('[role="dialog"]:has-text("AI Redo")');
   53 |       await page.locator('[role="dialog"] textarea').fill('Actually, make it very casual and startup-like');
   54 |       await page.locator('[role="dialog"] button:has-text("Redo with AI")').click();
   55 |       await expect(toneStage).toHaveClass(/border-green-500/, { timeout: 60000 });
   56 |       
   57 |       // Third AI redo
   58 |       await toneStage.locator('button[title="AI Redo"]').click();
   59 |       await page.waitForSelector('[role="dialog"]:has-text("AI Redo")');
   60 |       await page.locator('[role="dialog"] textarea').fill('Find a balance between formal and casual, professional but approachable');
   61 |       await page.locator('[role="dialog"] button:has-text("Redo with AI")').click();
   62 |       await expect(toneStage).toHaveClass(/border-green-500/, { timeout: 60000 });
   63 |       
   64 |       console.log('Completed 3 AI redos on tone analysis');
   65 |     });
   66 |
   67 |     // Stage 3: Edit research after it completes
   68 |     await test.step('Edit auto-generated research', async () => {
   69 |       console.log('Waiting for research to complete, then editing');
   70 |       
   71 |       await expect(page.locator('[data-testid="stage-card-research"]')).toHaveClass(/border-green-500/, { 
   72 |         timeout: 90000 
   73 |       });
   74 |       
   75 |       // Click edit button
   76 |       const researchStage = page.locator('[data-testid="stage-card-research"]');
   77 |       await researchStage.locator('button[title="Edit"]').click();
   78 |       
   79 |       // Wait for edit mode
   80 |       await page.waitForTimeout(1000);
   81 |       
   82 |       // Find the textarea in edit mode and modify content
   83 |       const editTextarea = researchStage.locator('textarea').first();
   84 |       const currentContent = await editTextarea.inputValue();
   85 |       await editTextarea.fill(currentContent + '\n\nEDITED: Added custom research notes about competitors.');
   86 |       
   87 |       // Save edits
   88 |       await researchStage.locator('button:has-text("Save")').click();
   89 |       
   90 |       console.log('Research edited after auto-generation');
   91 |     });
   92 |
   93 |     // Stage 4: Leave key facts mostly empty
   94 |     await test.step('Submit key facts with minimal data', async () => {
   95 |       console.log('Testing with mostly empty key facts');
   96 |       
   97 |       // Only fill headline, leave everything else empty
   98 |       await page.locator('input[placeholder="Main headline for the press release"]').fill('Minimal Test Headline');
   99 |       
  100 |       // Process with mostly empty fields
  101 |       await page.click('#process-stage-key-facts');
  102 |       await expect(page.locator('[data-testid="stage-card-key-facts"]')).toHaveClass(/border-green-500/, { 
  103 |         timeout: 30000 
  104 |       });
  105 |     });
  106 |
  107 |     // Go back and edit basic info AFTER other stages completed
  108 |     await test.step('Edit basic info after progression', async () => {
  109 |       console.log('Going back to edit basic info');
  110 |       
  111 |       const basicInfoStage = page.locator('[data-testid="stage-card-basic-info"]');
  112 |       await basicInfoStage.locator('button[title="Edit"]').click();
  113 |       
  114 |       // Wait for edit mode
  115 |       await page.waitForTimeout(1000);
  116 |       
  117 |       // Update the company name
  118 |       const companyInput = page.locator('input[placeholder*="TechCorp Inc."]');
  119 |       await companyInput.clear();
  120 |       await companyInput.fill('Updated Company Name LLC');
  121 |       
  122 |       // Save changes
  123 |       await basicInfoStage.locator('button:has-text("Save")').click();
  124 |       
  125 |       console.log('Basic info updated after other stages completed');
  126 |     });
  127 |
  128 |     // Stage 5: Skip contact info initially, then fill later
  129 |     await test.step('Skip and return to contact info', async () => {
  130 |       console.log('Testing non-linear stage completion');
  131 |       
  132 |       // Skip contact info for now
  133 |       const contactStage = page.locator('[data-testid="stage-card-contact-info"]');
  134 |       
  135 |       // Try to proceed without filling contact info
  136 |       // The final press release should wait for this dependency
  137 |       
  138 |       // Fill contact info after attempting to skip
  139 |       await page.locator('input[placeholder*="Jane Smith"]').fill('J');
  140 |       await page.locator('input[placeholder*="Director of Communications"]').fill('CEO');
  141 |       await page.locator('input[placeholder*="press@company.com"]').fill('x@y.z');
  142 |       await page.locator('input[placeholder*="+1 (555)"]').fill('1');
  143 |       
```