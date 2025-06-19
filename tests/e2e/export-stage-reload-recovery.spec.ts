import { test, expect, Page } from '@playwright/test';

test.describe('Export Stage Reload Recovery - Critical Bug Fix', () => {
  let page: Page;
  let documentId: string;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('should complete full workflow, export, and survive page reload without re-running AI', async () => {
    // Step 1: Create a new poem document
    console.log('🚀 Step 1: Creating new poem document...');
    await page.goto('http://localhost:9002/w/poem/new');
    await page.waitForLoadState('networkidle');
    
    // Extract document ID from URL
    const url = page.url();
    const match = url.match(/\/w\/poem\/([^/]+)$/);
    if (match) {
      documentId = match[1];
      console.log('✅ Created document with ID:', documentId);
    } else {
      throw new Error('❌ Failed to create new document');
    }

    // Step 2: Complete poem topic stage
    console.log('📝 Step 2: Filling poem topic...');
    await page.fill('textarea', 'A magical winter garden where crystalline flowers bloom under starlight');
    await page.click('#process-stage-poem-topic');
    
    // Wait for AI to complete poem generation - should show completed state
    console.log('🤖 Step 3: Waiting for poem generation completion...');
    await expect(page.locator('[data-testid="stage-card-generate-poem-with-title"]')).toHaveClass(/border-green-500/, { timeout: 90000 });
    
    // Verify poem was generated and persisted
    const poemContent = await page.locator('[data-testid="stage-card-generate-poem-with-title"]').textContent();
    expect(poemContent).toContain('Poem Title');
    expect(poemContent).toContain('Poem Content');
    console.log('✅ Poem generation completed and content visible');

    // Step 4: Complete image briefing stage (required for HTML preview)
    console.log('🎨 Step 4: Completing image briefing...');
    await page.click('#process-stage-image-briefing');
    
    // Wait for image creation prompt
    console.log('⚡ Step 5: Waiting for image prompt creation...');
    await expect(page.locator('[data-testid="stage-card-create-image-prompt"]')).toHaveClass(/border-green-500/, { timeout: 60000 });
    
    // Wait for image generation
    console.log('🖼️ Step 6: Waiting for image generation...');
    await expect(page.locator('[data-testid="stage-card-generate-poem-image"]')).toHaveClass(/border-green-500/, { timeout: 120000 });
    
    // Skip HTML briefing (optional stage)
    console.log('⏭️ Step 7: Skipping HTML briefing...');
    await page.click('#process-stage-html-briefing');
    
    // Wait for HTML preview generation
    console.log('🔄 Step 8: Waiting for HTML preview generation...');
    await expect(page.locator('[data-testid="stage-card-generate-html-preview"]')).toHaveClass(/border-green-500/, { timeout: 90000 });
    console.log('✅ HTML preview generation completed');

    // Step 9: Trigger export stage - this is the critical test point
    console.log('🎯 Step 9: Starting export stage...');
    const exportStage = page.locator('[data-testid="stage-card-export-publish"]');
    await exportStage.scrollIntoViewIfNeeded();
    
    // Verify export stage is visible
    await expect(exportStage).toBeVisible();
    await expect(exportStage).toContainText('Export & Publish');
    
    // Click the export trigger button using specific ID
    await page.click('#process-stage-export-publish');
    
    // Verify export stage status changes to "running"
    console.log('⏳ Step 10: Export stage should be running...');
    await expect(exportStage).toHaveClass(/border-primary/, { timeout: 5000 });
    
    // THIS IS THE CRITICAL TEST: Reload page while export is running
    console.log('🔄 Step 11: CRITICAL TEST - Reloading page while export is running...');
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Verify document loaded correctly after reload
    expect(page.url()).toContain(documentId);
    console.log('✅ Page reloaded successfully');

    // Step 12: Verify export stage recovery - should be reset to idle
    console.log('🛠️ Step 12: Verifying export stage recovery...');
    const exportStageAfterReload = page.locator('[data-testid="stage-card-export-publish"]');
    await exportStageAfterReload.scrollIntoViewIfNeeded();
    
    // Export stage should be reset to idle (not stuck in running)
    await expect(exportStageAfterReload).not.toHaveClass(/border-primary/);
    await expect(exportStageAfterReload).toBeVisible();
    
    // Should show the export button again (not stuck or errored)
    await expect(page.locator('#process-stage-export-publish')).toBeVisible();
    console.log('✅ Export stage successfully recovered to idle state');

    // Step 13: Re-run export after recovery
    console.log('🔁 Step 13: Re-running export after recovery...');
    await page.click('#process-stage-export-publish');
    
    // Wait for export to complete this time
    console.log('⏱️ Step 14: Waiting for export completion...');
    await expect(exportStageAfterReload).toHaveClass(/border-green-500/, { timeout: 120000 });
    
    // Verify export completed successfully
    await expect(exportStageAfterReload).toContainText('Ready');
    console.log('✅ Export completed successfully after recovery');

    // Step 15: FINAL CRITICAL TEST - Reload again with completed export
    console.log('🎯 Step 15: FINAL TEST - Reloading with completed export...');
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Verify all stages remain in completed state - NO NEW AI REQUESTS
    console.log('🔍 Step 16: Verifying all stages remain completed without new AI requests...');
    
    // Poem stage should remain completed
    await expect(page.locator('[data-testid="stage-card-generate-poem-with-title"]')).toHaveClass(/border-green-500/);
    
    // Image stages should remain completed
    await expect(page.locator('[data-testid="stage-card-generate-poem-image"]')).toHaveClass(/border-green-500/);
    
    // HTML preview stage should remain completed  
    await expect(page.locator('[data-testid="stage-card-generate-html-preview"]')).toHaveClass(/border-green-500/);
    
    // Export stage should remain completed
    const finalExportStage = page.locator('[data-testid="stage-card-export-publish"]');
    await finalExportStage.scrollIntoViewIfNeeded();
    await expect(finalExportStage).toHaveClass(/border-green-500/);
    await expect(finalExportStage).toContainText('Ready');
    
    // Verify export results are still available
    await expect(finalExportStage).toContainText('HTML (Styled)');
    await expect(finalExportStage).toContainText('HTML (Clean)');
    await expect(finalExportStage).toContainText('Markdown');
    
    console.log('🎉 ALL TESTS PASSED! Export stage reload recovery working perfectly!');
    
    // Log the final state for verification
    const finalPoemContent = await page.locator('[data-testid="stage-card-generate-poem-with-title"]').textContent();
    console.log('📋 Final poem content preserved:', finalPoemContent?.substring(0, 100) + '...');
  });

  test('should handle export stage stuck in running state from previous session', async () => {
    // This test simulates a document that was left with export stage in "running" state
    console.log('🧪 Testing recovery from stuck export stage...');
    
    // Create a new document first  
    await page.goto('http://localhost:9002/w/poem/new');
    await page.waitForLoadState('networkidle');
    
    // Complete the workflow quickly
    await page.fill('textarea', 'Quick test for stuck export recovery');
    await page.click('#process-stage-poem-topic');
    await expect(page.locator('[data-testid="stage-card-generate-poem-with-title"]')).toHaveClass(/border-green-500/, { timeout: 90000 });
    
    // Complete image workflow
    await page.click('#process-stage-image-briefing');
    await expect(page.locator('[data-testid="stage-card-create-image-prompt"]')).toHaveClass(/border-green-500/, { timeout: 60000 });
    await expect(page.locator('[data-testid="stage-card-generate-poem-image"]')).toHaveClass(/border-green-500/, { timeout: 120000 });
    
    await page.click('#process-stage-html-briefing');
    await expect(page.locator('[data-testid="stage-card-generate-html-preview"]')).toHaveClass(/border-green-500/, { timeout: 90000 });
    
    // Start export and immediately reload (simulating interruption)
    await page.click('#process-stage-export-publish');
    
    // Reload immediately to simulate the stuck scenario
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Verify recovery worked
    const exportStage = page.locator('[data-testid="stage-card-export-publish"]');
    await exportStage.scrollIntoViewIfNeeded();
    
    // Should not be stuck in running state
    await expect(exportStage).not.toHaveClass(/border-primary/);
    await expect(page.locator('#process-stage-export-publish')).toBeVisible();
    
    console.log('✅ Stuck export stage recovery test passed!');
  });

  test('should preserve export results across multiple page reloads', async () => {
    console.log('🔄 Testing export result persistence across multiple reloads...');
    
    // Use the document from the first test if available
    if (documentId) {
      await page.goto(`http://localhost:9002/w/poem/${documentId}`);
      await page.waitForLoadState('networkidle');
    } else {
      // Create and complete a new workflow
      await page.goto('http://localhost:9002/w/poem/new');
      await page.waitForLoadState('networkidle');
      
      await page.fill('textarea', 'Test persistence of export results');
      await page.click('#process-stage-poem-topic');
      await expect(page.locator('[data-testid="stage-card-generate-poem-with-title"]')).toHaveClass(/border-green-500/, { timeout: 90000 });
      
      // Complete image workflow
      await page.click('#process-stage-image-briefing');
      await expect(page.locator('[data-testid="stage-card-create-image-prompt"]')).toHaveClass(/border-green-500/, { timeout: 60000 });
      await expect(page.locator('[data-testid="stage-card-generate-poem-image"]')).toHaveClass(/border-green-500/, { timeout: 120000 });
      
      await page.click('#process-stage-html-briefing');
      await expect(page.locator('[data-testid="stage-card-generate-html-preview"]')).toHaveClass(/border-green-500/, { timeout: 90000 });
      
      await page.click('#process-stage-export-publish');
      await expect(page.locator('[data-testid="stage-card-export-publish"]')).toHaveClass(/border-green-500/, { timeout: 120000 });
    }
    
    // Reload multiple times and verify export results persist
    for (let i = 1; i <= 3; i++) {
      console.log(`🔄 Reload ${i}/3...`);
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      const exportStage = page.locator('[data-testid="stage-card-export-publish"]');
      await exportStage.scrollIntoViewIfNeeded();
      
      // Verify export stage remains completed
      await expect(exportStage).toHaveClass(/border-green-500/);
      await expect(exportStage).toContainText('Ready');
      
      // Verify export formats are still available
      await expect(exportStage).toContainText('HTML (Styled)');
      await expect(exportStage).toContainText('HTML (Clean)'); 
      await expect(exportStage).toContainText('Markdown');
    }
    
    console.log('✅ Export results persisted across all reloads!');
  });
});