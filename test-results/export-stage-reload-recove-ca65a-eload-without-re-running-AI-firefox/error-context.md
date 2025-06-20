# Test info

- Name: Export Stage Reload Recovery - Critical Bug Fix >> should complete full workflow, export, and survive page reload without re-running AI
- Location: /Users/franzenzenhofer/dev/franzai-writer/tests/e2e/export-stage-reload-recovery.spec.ts:15:7

# Error details

```
Error: expect(locator).toHaveClass(expected)

Locator: locator('[data-testid="stage-card-generate-html-preview"]')
Expected pattern: /border-green-500/
Received string:  "rounded-lg border bg-card text-card-foreground mb-6 transition-all duration-300 border-primary shadow-accent/30 shadow-xl ring-2 ring-accent"
Call log:
  - expect.toHaveClass with timeout 120000ms
  - waiting for locator('[data-testid="stage-card-generate-html-preview"]')
    7 × locator resolved to <div id="stage-generate-html-preview" data-testid="stage-card-generate-html-preview" class="rounded-lg border bg-card text-card-foreground mb-6 transition-all duration-300 border-primary shadow-accent/30 shadow-xl ring-2 ring-accent">…</div>
      - unexpected value "rounded-lg border bg-card text-card-foreground mb-6 transition-all duration-300 border-primary shadow-accent/30 shadow-xl ring-2 ring-accent"

    at /Users/franzenzenhofer/dev/franzai-writer/tests/e2e/export-stage-reload-recovery.spec.ts:107:86
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
  - 'heading "Starlight Bloom: A Crystalline Eden" [level=1]'
  - paragraph: "Workflow: Poem Generator"
  - text: Progress 6 / 8 Stages
  - progressbar
  - text: Last saved 7:29:51 AM
  - img
  - text: Poem Topic What is the topic of your poem?
  - button:
    - img
  - paragraph: A magical winter garden where crystalline flowers bloom under starlight
  - button "Edit":
    - img
    - text: Edit
  - img
  - text: Generate Poem & Title AI will generate a poem and title based on your topic.
  - button:
    - img
  - text: "Poem Title Starlight Bloom: A Crystalline Eden Poem Content Where winter's breath, a frosted kiss, Awakens dreams in silent bliss, A garden sleeps, in silver sheen, Where crystalline flowers are born unseen. Beneath the velvet, starlit dome, Each petal etched, a frozen poem, Of ice and light, a fragile grace, A shimmering smile on winter's face. No earthly soil, no sunlit ray, Nourishes blooms that hold their sway, But starlight's touch, a gentle hand, Creates this wonder, in a frozen land. So wander slow, and softly tread, Where magic blooms, though summer's fled, In this crystalline, starlit dream, A winter garden, it would seem."
  - button:
    - img
  - textbox "Optional notes for AI regeneration..."
  - button "AI REDO":
    - img
    - text: AI REDO
  - button "Edit":
    - img
    - text: Edit
  - img
  - text: Image Customization Optional Customize how your poem should be illustrated
  - button:
    - img
  - text: Additional Image Instructions (Optional) Not provided Image Format Portrait (3:4) - Book Cover Artistic Style Artistic & Creative Number of Variations 2 Images
  - button "Edit":
    - img
    - text: Edit
  - img
  - text: Create Image Prompt AI will create optimized imagen prompts and unique filenames for your poem illustrations.
  - button:
    - img
  - text: Optimized Imagen Prompt Artistic rendering of a fantastical winter garden under a starlit sky. Crystalline flowers, formed of ice and light, shimmer with delicate details. Frozen petals etched with intricate patterns, reflecting the starlight. A dreamlike landscape, where magic blooms in a land untouched by earthly soil or sunlight. Capture the fragile grace and ethereal beauty of this frozen eden. Generated Filenames starlight-frost-eden crystalline-winter-dream
  - textbox "Optional notes for AI regeneration..."
  - button "AI REDO":
    - img
    - text: AI REDO
  - button "Edit":
    - img
    - text: Edit
  - img
  - text: Generate Poem Illustration AI will create an image that complements your poem.
  - button:
    - img
  - 'img "Generated image: Artistic rendering of a fantastical winter garden under a starlit sky. Crystalline flowers, formed of ice and light, shimmer with delicate details. Frozen petals etched with intricate patterns, reflecting the starlight. A dreamlike landscape, where magic blooms in a land untouched by earthly soil or sunlight. Capture the fragile grace and ethereal beauty of this frozen eden."'
  - text: 3:4
  - button "Download":
    - img
    - text: Download
  - button "Thumbnail 1":
    - img "Thumbnail 1"
  - button "Thumbnail 2":
    - img "Thumbnail 2"
  - button "Edit":
    - img
    - text: Edit
  - img
  - text: HTML Briefing Optional Special instructions for HTML formatting (optional)
  - button:
    - img
  - button "Edit":
    - img
    - text: Edit
  - img
  - text: Generate HTML Preview AI will convert your poem into beautiful HTML based on your briefing.
  - button:
    - img
  - heading "Generating..." [level=4]
  - text: AI is processing your request...
  - paragraph: Generating content...
  - text: Export & Publish Transform your poem into professional formats and publish instantly
  - button:
    - img
  - img
  - text: "Waiting for: Generate HTML Preview"
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
- button "Open issues overlay": 1 Issue
- button "Collapse issues badge":
  - img
```

# Test source

```ts
   7 |   test.beforeAll(async ({ browser }) => {
   8 |     page = await browser.newPage();
   9 |   });
   10 |
   11 |   test.afterAll(async () => {
   12 |     await page.close();
   13 |   });
   14 |
   15 |   test('should complete full workflow, export, and survive page reload without re-running AI', async () => {
   16 |     // Step 1: Create a new poem document
   17 |     console.log('🚀 Step 1: Creating new poem document...');
   18 |     await page.goto('http://localhost:9002/w/poem/new');
   19 |     await page.waitForLoadState('networkidle');
   20 |     
   21 |     // Extract document ID from URL
   22 |     const url = page.url();
   23 |     const match = url.match(/\/w\/poem\/([^/]+)$/);
   24 |     if (match) {
   25 |       documentId = match[1];
   26 |       console.log('✅ Created document with ID:', documentId);
   27 |     } else {
   28 |       throw new Error('❌ Failed to create new document');
   29 |     }
   30 |
   31 |     // Step 2: Complete poem topic stage
   32 |     console.log('📝 Step 2: Filling poem topic...');
   33 |     await page.fill('textarea', 'A magical winter garden where crystalline flowers bloom under starlight');
   34 |     await page.click('#process-stage-poem-topic');
   35 |     
   36 |     // Wait for AI to complete poem generation - should show completed state
   37 |     console.log('🤖 Step 3: Waiting for poem generation completion...');
   38 |     await expect(page.locator('[data-testid="stage-card-generate-poem-with-title"]')).toHaveClass(/border-green-500/, { timeout: 90000 });
   39 |     
   40 |     // Verify poem was generated and persisted
   41 |     const poemContent = await page.locator('[data-testid="stage-card-generate-poem-with-title"]').textContent();
   42 |     expect(poemContent).toContain('Poem Title');
   43 |     expect(poemContent).toContain('Poem Content');
   44 |     console.log('✅ Poem generation completed and content visible');
   45 |
   46 |     // Step 4: Complete image briefing stage (required for HTML preview)
   47 |     console.log('🎨 Step 4: Completing image briefing...');
   48 |     await page.click('#process-stage-image-briefing');
   49 |     
   50 |     // Wait for image creation prompt
   51 |     console.log('⚡ Step 5: Waiting for image prompt creation...');
   52 |     await expect(page.locator('[data-testid="stage-card-create-image-prompt"]')).toHaveClass(/border-green-500/, { timeout: 60000 });
   53 |     
   54 |     // Wait for image generation
   55 |     console.log('🖼️ Step 6: Waiting for image generation...');
   56 |     await expect(page.locator('[data-testid="stage-card-generate-poem-image"]')).toHaveClass(/border-green-500/, { timeout: 120000 });
   57 |     
   58 |     // Skip HTML briefing (optional stage)
   59 |     console.log('⏭️ Step 7: Skipping HTML briefing...');
   60 |     await page.click('#process-stage-html-briefing');
   61 |     
   62 |     // Wait for HTML preview generation
   63 |     console.log('🔄 Step 8: Waiting for HTML preview generation...');
   64 |     await expect(page.locator('[data-testid="stage-card-generate-html-preview"]')).toHaveClass(/border-green-500/, { timeout: 90000 });
   65 |     console.log('✅ HTML preview generation completed');
   66 |
   67 |     // Step 9: Trigger export stage - this is the critical test point
   68 |     console.log('🎯 Step 9: Starting export stage...');
   69 |     const exportStage = page.locator('[data-testid="stage-card-export-publish"]');
   70 |     await exportStage.scrollIntoViewIfNeeded();
   71 |     
   72 |     // Verify export stage is visible
   73 |     await expect(exportStage).toBeVisible();
   74 |     await expect(exportStage).toContainText('Export & Publish');
   75 |     
   76 |     // Click the export trigger button
   77 |     await page.locator('button', { hasText: 'Export & Publish Poem' }).click();
   78 |     
   79 |     // Verify export stage status changes to "running"
   80 |     console.log('⏳ Step 10: Export stage should be running...');
   81 |     await expect(exportStage).toHaveClass(/border-primary/, { timeout: 5000 });
   82 |     
   83 |     // THIS IS THE CRITICAL TEST: Reload page while export is running
   84 |     console.log('🔄 Step 11: CRITICAL TEST - Reloading page while export is running...');
   85 |     await page.reload();
   86 |     await page.waitForLoadState('networkidle');
   87 |     
   88 |     // Verify document loaded correctly after reload
   89 |     expect(page.url()).toContain(documentId);
   90 |     console.log('✅ Page reloaded successfully');
   91 |
   92 |     // Step 12: Verify export stage recovery - should be reset to idle
   93 |     console.log('🛠️ Step 12: Verifying export stage recovery...');
   94 |     const exportStageAfterReload = page.locator('[data-testid="stage-card-export-publish"]');
   95 |     await exportStageAfterReload.scrollIntoViewIfNeeded();
   96 |     
   97 |     // Export stage should be reset to idle (not stuck in running)
   98 |     await expect(exportStageAfterReload).not.toHaveClass(/border-primary/);
   99 |     await expect(exportStageAfterReload).toBeVisible();
  100 |     
  101 |     // Check if HTML preview needs to be re-completed after recovery
  102 |     console.log('🔍 Step 13: Checking if HTML preview needs completion after recovery...');
  103 |     const runAiButton = page.locator('button', { hasText: 'Run AI' });
  104 |     if (await runAiButton.isVisible({ timeout: 5000 })) {
  105 |       console.log('💡 Triggering HTML preview completion...');
  106 |       await runAiButton.click();
> 107 |       await expect(page.locator('[data-testid="stage-card-generate-html-preview"]')).toHaveClass(/border-green-500/, { timeout: 120000 });
      |                                                                                      ^ Error: expect(locator).toHaveClass(expected)
  108 |     }
  109 |
  110 |     // Should show the export button again (not stuck or errored)
  111 |     await expect(page.locator('button', { hasText: 'Export & Publish Poem' })).toBeVisible();
  112 |     console.log('✅ Export stage successfully recovered to idle state');
  113 |
  114 |     // Step 14: Re-run export after recovery
  115 |     console.log('🔁 Step 14: Re-running export after recovery...');
  116 |     await page.locator('button', { hasText: 'Export & Publish Poem' }).click();
  117 |     
  118 |     // Wait for export to complete this time
  119 |     console.log('⏱️ Step 15: Waiting for export completion...');
  120 |     await expect(exportStageAfterReload).toHaveClass(/border-green-500/, { timeout: 120000 });
  121 |     
  122 |     // Verify export completed successfully
  123 |     await expect(exportStageAfterReload).toContainText('Ready');
  124 |     console.log('✅ Export completed successfully after recovery');
  125 |
  126 |     // Step 16: FINAL CRITICAL TEST - Reload again with completed export
  127 |     console.log('🎯 Step 16: FINAL TEST - Reloading with completed export...');
  128 |     await page.reload();
  129 |     await page.waitForLoadState('networkidle');
  130 |     
  131 |     // Verify all stages remain in completed state - NO NEW AI REQUESTS
  132 |     console.log('🔍 Step 17: Verifying all stages remain completed without new AI requests...');
  133 |     
  134 |     // Poem stage should remain completed
  135 |     await expect(page.locator('[data-testid="stage-card-generate-poem-with-title"]')).toHaveClass(/border-green-500/);
  136 |     
  137 |     // Image stages should remain completed
  138 |     await expect(page.locator('[data-testid="stage-card-generate-poem-image"]')).toHaveClass(/border-green-500/);
  139 |     
  140 |     // HTML preview stage should remain completed  
  141 |     await expect(page.locator('[data-testid="stage-card-generate-html-preview"]')).toHaveClass(/border-green-500/);
  142 |     
  143 |     // Export stage should remain completed
  144 |     const finalExportStage = page.locator('[data-testid="stage-card-export-publish"]');
  145 |     await finalExportStage.scrollIntoViewIfNeeded();
  146 |     await expect(finalExportStage).toHaveClass(/border-green-500/);
  147 |     await expect(finalExportStage).toContainText('Ready');
  148 |     
  149 |     // Verify export results are still available
  150 |     await expect(finalExportStage).toContainText('HTML (Styled)');
  151 |     await expect(finalExportStage).toContainText('HTML (Clean)');
  152 |     await expect(finalExportStage).toContainText('Markdown');
  153 |     
  154 |     console.log('🎉 ALL TESTS PASSED! Export stage reload recovery working perfectly!');
  155 |     
  156 |     // Log the final state for verification
  157 |     const finalPoemContent = await page.locator('[data-testid="stage-card-generate-poem-with-title"]').textContent();
  158 |     console.log('📋 Final poem content preserved:', finalPoemContent?.substring(0, 100) + '...');
  159 |   });
  160 |
  161 |   test('should handle export stage stuck in running state from previous session', async () => {
  162 |     // This test simulates a document that was left with export stage in "running" state
  163 |     console.log('🧪 Testing recovery from stuck export stage...');
  164 |     
  165 |     // Create a new document first  
  166 |     await page.goto('http://localhost:9002/w/poem/new');
  167 |     await page.waitForLoadState('networkidle');
  168 |     
  169 |     // Complete the workflow quickly
  170 |     await page.fill('textarea', 'Quick test for stuck export recovery');
  171 |     await page.click('#process-stage-poem-topic');
  172 |     await expect(page.locator('[data-testid="stage-card-generate-poem-with-title"]')).toHaveClass(/border-green-500/, { timeout: 90000 });
  173 |     
  174 |     // Complete image workflow
  175 |     await page.click('#process-stage-image-briefing');
  176 |     await expect(page.locator('[data-testid="stage-card-create-image-prompt"]')).toHaveClass(/border-green-500/, { timeout: 60000 });
  177 |     await expect(page.locator('[data-testid="stage-card-generate-poem-image"]')).toHaveClass(/border-green-500/, { timeout: 120000 });
  178 |     
  179 |     await page.click('#process-stage-html-briefing');
  180 |     await expect(page.locator('[data-testid="stage-card-generate-html-preview"]')).toHaveClass(/border-green-500/, { timeout: 90000 });
  181 |     
  182 |     // Start export and immediately reload (simulating interruption)
  183 |     await page.locator('button', { hasText: 'Export & Publish Poem' }).click();
  184 |     
  185 |     // Reload immediately to simulate the stuck scenario
  186 |     await page.reload();
  187 |     await page.waitForLoadState('networkidle');
  188 |     
  189 |     // Verify recovery worked
  190 |     const exportStage = page.locator('[data-testid="stage-card-export-publish"]');
  191 |     await exportStage.scrollIntoViewIfNeeded();
  192 |     
  193 |     // Should not be stuck in running state
  194 |     await expect(exportStage).not.toHaveClass(/border-primary/);
  195 |     await expect(page.locator('#process-stage-export-publish')).toBeVisible();
  196 |     
  197 |     console.log('✅ Stuck export stage recovery test passed!');
  198 |   });
  199 |
  200 |   test('should preserve export results across multiple page reloads', async () => {
  201 |     console.log('🔄 Testing export result persistence across multiple reloads...');
  202 |     
  203 |     // Use the document from the first test if available
  204 |     if (documentId) {
  205 |       await page.goto(`http://localhost:9002/w/poem/${documentId}`);
  206 |       await page.waitForLoadState('networkidle');
  207 |     } else {
```