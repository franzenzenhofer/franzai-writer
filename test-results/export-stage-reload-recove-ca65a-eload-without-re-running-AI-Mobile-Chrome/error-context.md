# Test info

- Name: Export Stage Reload Recovery - Critical Bug Fix >> should complete full workflow, export, and survive page reload without re-running AI
- Location: /Users/franzenzenhofer/dev/franzai-writer/tests/e2e/export-stage-reload-recovery.spec.ts:15:7

# Error details

```
Error: expect(locator).toHaveClass(expected)

Locator: locator('[data-testid="stage-card-export-publish"]')
Expected pattern: /border-green-500/
Received string:  "rounded-lg border text-card-foreground shadow-sm mb-6 transition-all duration-300 min-h-[400px] border-primary bg-gradient-to-br from-background to-muted/20"
Call log:
  - expect.toHaveClass with timeout 120000ms
  - waiting for locator('[data-testid="stage-card-export-publish"]')
    2 × locator resolved to <div id="stage-export-publish" data-testid="stage-card-export-publish" class="rounded-lg border text-card-foreground shadow-sm mb-6 transition-all duration-300 min-h-[400px] border-primary bg-gradient-to-br from-background to-muted/20">…</div>
      - unexpected value "rounded-lg border text-card-foreground shadow-sm mb-6 transition-all duration-300 min-h-[400px] border-primary bg-gradient-to-br from-background to-muted/20"

    at /Users/franzenzenhofer/dev/franzai-writer/tests/e2e/export-stage-reload-recovery.spec.ts:120:42
```

# Page snapshot

```yaml
- banner:
  - button "Toggle menu":
    - img
    - text: Toggle menu
  - text: FranzAI Writer
  - navigation
- main:
  - 'heading "Starlight Bloom: A Crystalline Eden" [level=1]'
  - paragraph: "Workflow: Poem Generator"
  - text: Progress 7 / 8 Stages
  - progressbar
  - text: Last saved 7:29:48 AM
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
  - text: "Poem Title Starlight Bloom: A Crystalline Eden Poem Content Where winter's breath, a silver sigh, Transforms the world beneath the sky, A garden sleeps, yet wakes anew, With crystalline blooms, kissed by the dew. Each frozen petal, sharp and bright, Reflects the starlight's gentle light, A symphony of ice and gleam, A silent, shimmering, waking dream. No earthly scent these blossoms hold, But secrets whispered, ages old, Of frozen sprites and winter's grace, In this enchanted, hallowed place. So tread with care, and softly gaze, Upon this wonderland of frozen days, For in its beauty, stark and pure, A magic blooms that will endure."
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
  - text: Optimized Imagen Prompt Artistic rendering of a frozen garden under a starlit sky. Crystalline flowers, sculpted from ice, reflect the soft glow of distant stars. Delicate, sharp petals shimmer with an ethereal light. Winter's breath creates a silent, shimmering dreamscape. Capture the stark beauty and frozen magic of this enchanted place. Generated Filenames crystalline-eden-awakening starlight-frozen-symphony
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
  - 'img "Generated image: Artistic rendering of a frozen garden under a starlit sky. Crystalline flowers, sculpted from ice, reflect the soft glow of distant stars. Delicate, sharp petals shimmer with an ethereal light. Winter''s breath creates a silent, shimmering dreamscape. Capture the stark beauty and frozen magic of this enchanted place."'
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
  - textbox "Optional notes for AI regeneration..."
  - button "AI REDO":
    - img
    - text: AI REDO
  - button "Edit":
    - img
    - text: Edit
  - img
  - text: Export & Publish Transform your poem into professional formats and publish instantly
  - button:
    - img
  - heading "Creating Your Exports..." [level=4]
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
      - text: AI Stage Completed AI processing for "Generate HTML Preview" finished.
      - button:
        - img
- alert
- button "Open Next.js Dev Tools":
  - img
- button "Open issues overlay": 1 Issue
- button "Collapse issues badge":
  - img
- status: Notification AI Stage CompletedAI processing for "Generate HTML Preview" finished.
```

# Test source

```ts
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
  107 |       await expect(page.locator('[data-testid="stage-card-generate-html-preview"]')).toHaveClass(/border-green-500/, { timeout: 120000 });
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
> 120 |     await expect(exportStageAfterReload).toHaveClass(/border-green-500/, { timeout: 120000 });
      |                                          ^ Error: expect(locator).toHaveClass(expected)
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
  208 |       // Create and complete a new workflow
  209 |       await page.goto('http://localhost:9002/w/poem/new');
  210 |       await page.waitForLoadState('networkidle');
  211 |       
  212 |       await page.fill('textarea', 'Test persistence of export results');
  213 |       await page.click('#process-stage-poem-topic');
  214 |       await expect(page.locator('[data-testid="stage-card-generate-poem-with-title"]')).toHaveClass(/border-green-500/, { timeout: 90000 });
  215 |       
  216 |       // Complete image workflow
  217 |       await page.click('#process-stage-image-briefing');
  218 |       await expect(page.locator('[data-testid="stage-card-create-image-prompt"]')).toHaveClass(/border-green-500/, { timeout: 60000 });
  219 |       await expect(page.locator('[data-testid="stage-card-generate-poem-image"]')).toHaveClass(/border-green-500/, { timeout: 120000 });
  220 |       
```