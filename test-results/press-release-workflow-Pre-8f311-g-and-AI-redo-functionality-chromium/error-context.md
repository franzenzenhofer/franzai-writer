# Test info

- Name: Press Release Workflow >> should handle editing and AI redo functionality
- Location: /Users/franzenzenhofer/dev/franzai-writer/tests/e2e/press-release-workflow.spec.ts:174:7

# Error details

```
Error: locator.fill: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('input[placeholder*="New Product Launch"]')

    at /Users/franzenzenhofer/dev/franzai-writer/tests/e2e/press-release-workflow.spec.ts:178:68
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
  118 |     });
  119 |
  120 |     // Stage 6: Final Press Release (auto-runs)
  121 |     await test.step('Wait for final press release generation', async () => {
  122 |       console.log('Waiting for final press release to generate');
  123 |       
  124 |       await expect(page.locator('[data-testid="stage-card-final-press-release"]')).toHaveClass(/border-green-500/, { 
  125 |         timeout: 90000 
  126 |       });
  127 |       
  128 |       // Verify press release content
  129 |       const pressReleaseOutput = page.locator('[data-testid="stage-card-final-press-release"] [data-testid="stage-output-area"]');
  130 |       await expect(pressReleaseOutput).toContainText('FOR IMMEDIATE RELEASE');
  131 |       await expect(pressReleaseOutput).toContainText('InnovateTech Solutions');
  132 |       await expect(pressReleaseOutput).toContainText('###');
  133 |       
  134 |       console.log('Final press release generated successfully');
  135 |     });
  136 |
  137 |     // Stage 7: Optional Photo Generation (skip in basic test)
  138 |     await test.step('Check optional photo stage', async () => {
  139 |       console.log('Checking optional photo generation stage');
  140 |       
  141 |       const photoStage = page.locator('[data-testid="stage-card-press-photo"]');
  142 |       await expect(photoStage).toBeVisible();
  143 |       
  144 |       // Verify it's marked as optional
  145 |       await expect(photoStage).toContainText('Optional');
  146 |       
  147 |       console.log('Optional photo stage available but skipping');
  148 |     });
  149 |
  150 |     // Stage 8: Export
  151 |     await test.step('Test export functionality', async () => {
  152 |       console.log('Testing export stage');
  153 |       
  154 |       // Click export button
  155 |       const exportButton = page.locator('button', { hasText: 'Export Press Release' });
  156 |       await exportButton.click();
  157 |       
  158 |       // Wait for export interface
  159 |       await expect(page.locator('text=Live Preview')).toBeVisible({ timeout: 30000 });
  160 |       
  161 |       // Verify export formats
  162 |       await expect(page.locator('text=HTML (Styled)')).toBeVisible();
  163 |       await expect(page.locator('text=HTML (Clean)')).toBeVisible();
  164 |       await expect(page.locator('text=Markdown')).toBeVisible();
  165 |       await expect(page.locator('text=PDF')).toBeVisible();
  166 |       await expect(page.locator('text=DOCX')).toBeVisible();
  167 |       
  168 |       console.log('Export functionality verified');
  169 |     });
  170 |
  171 |     console.log('Press release workflow completed successfully!');
  172 |   });
  173 |
  174 |   test('should handle editing and AI redo functionality', async ({ page }) => {
  175 |     console.log('Testing editing and AI redo features');
  176 |
  177 |     // Complete basic info first
> 178 |     await page.locator('input[placeholder*="New Product Launch"]').fill('Test Announcement');
      |                                                                    ^ Error: locator.fill: Test timeout of 30000ms exceeded.
  179 |     await page.locator('textarea[placeholder*="We\'re launching"]').fill('Test message');
  180 |     await page.locator('input[placeholder*="TechCorp Inc."]').fill('Test Company');
  181 |     await page.click('#process-stage-basic-info');
  182 |     await expect(page.locator('[data-testid="stage-card-basic-info"]')).toHaveClass(/border-green-500/, { 
  183 |       timeout: 30000 
  184 |     });
  185 |
  186 |     // Wait for tone briefing to complete
  187 |     await expect(page.locator('[data-testid="stage-card-tone-briefing"]')).toHaveClass(/border-green-500/, { 
  188 |       timeout: 60000 
  189 |     });
  190 |
  191 |     // Test AI Redo on tone briefing
  192 |     await test.step('Test AI Redo functionality', async () => {
  193 |       console.log('Testing AI Redo on tone briefing stage');
  194 |       
  195 |       // Find and click AI Redo button
  196 |       const toneStage = page.locator('[data-testid="stage-card-tone-briefing"]');
  197 |       const aiRedoButton = toneStage.locator('button[title="AI Redo"]');
  198 |       await aiRedoButton.click();
  199 |       
  200 |       // Fill redo instructions
  201 |       await page.waitForSelector('[role="dialog"]:has-text("AI Redo")');
  202 |       await page.locator('[role="dialog"] textarea').fill('Make the tone more casual and startup-friendly');
  203 |       await page.locator('[role="dialog"] button:has-text("Redo with AI")').click();
  204 |       
  205 |       // Wait for redo to complete
  206 |       await expect(toneStage).toHaveClass(/border-green-500/, { timeout: 60000 });
  207 |       console.log('AI Redo completed successfully');
  208 |     });
  209 |
  210 |     // Test manual editing
  211 |     await test.step('Test manual editing', async () => {
  212 |       console.log('Testing manual edit functionality');
  213 |       
  214 |       // Wait for research to complete first
  215 |       await expect(page.locator('[data-testid="stage-card-research"]')).toHaveClass(/border-green-500/, { 
  216 |         timeout: 90000 
  217 |       });
  218 |       
  219 |       // Find and click Edit button on research stage
  220 |       const researchStage = page.locator('[data-testid="stage-card-research"]');
  221 |       const editButton = researchStage.locator('button[title="Edit"]');
  222 |       await editButton.click();
  223 |       
  224 |       // Wait for edit mode
  225 |       await page.waitForTimeout(1000);
  226 |       
  227 |       // The edit interface should be visible
  228 |       const saveButton = researchStage.locator('button:has-text("Save")');
  229 |       await expect(saveButton).toBeVisible();
  230 |       
  231 |       // Save without changes
  232 |       await saveButton.click();
  233 |       
  234 |       console.log('Manual editing tested successfully');
  235 |     });
  236 |   });
  237 |
  238 |   test('should generate optional press photo', async ({ page }) => {
  239 |     console.log('Testing optional photo generation');
  240 |
  241 |     // Complete required stages quickly
  242 |     await page.locator('input[placeholder*="New Product Launch"]').fill('Photo Test');
  243 |     await page.locator('textarea[placeholder*="We\'re launching"]').fill('Testing photo generation');
  244 |     await page.locator('input[placeholder*="TechCorp Inc."]').fill('PhotoTest Inc');
  245 |     await page.click('#process-stage-basic-info');
  246 |     
  247 |     // Wait for auto-run stages
  248 |     await expect(page.locator('[data-testid="stage-card-final-press-release"]')).toHaveClass(/border-green-500/, { 
  249 |       timeout: 120000 
  250 |     });
  251 |
  252 |     // Now test photo generation
  253 |     await test.step('Generate press photo', async () => {
  254 |       console.log('Filling photo generation form');
  255 |       
  256 |       const photoStage = page.locator('[data-testid="stage-card-press-photo"]');
  257 |       
  258 |       // Fill image description
  259 |       await photoStage.locator('textarea').fill('Modern office building with glass facade showing technology company headquarters');
  260 |       
  261 |       // Select style
  262 |       const styleSelect = photoStage.locator('button[role="combobox"]').first();
  263 |       await styleSelect.click();
  264 |       await page.getByRole('option', { name: 'Photorealistic' }).click();
  265 |       
  266 |       // Select aspect ratio
  267 |       const aspectSelect = photoStage.locator('button[role="combobox"]').nth(1);
  268 |       await aspectSelect.click();
  269 |       await page.getByRole('option', { name: '16:9 (Landscape)' }).click();
  270 |       
  271 |       // Generate image
  272 |       await page.click('#process-stage-press-photo');
  273 |       
  274 |       // Wait for image generation (this can take a while)
  275 |       await expect(photoStage).toHaveClass(/border-green-500/, { timeout: 120000 });
  276 |       
  277 |       // Verify images were generated
  278 |       const images = photoStage.locator('img');
```