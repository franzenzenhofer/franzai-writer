import { test, expect } from '@playwright/test';

test.describe('Export Persistence with Reload - Fixed', () => {
  test('exports persist after page reload', async ({ page }) => {
    // Navigate to poem workflow
    await page.goto('/w/poem/new');
    await page.waitForLoadState('networkidle');
    
    // Fill in poem topic
    console.log('Step 1: Filling poem topic...');
    await page.waitForSelector('#stage-poem-topic', { timeout: 10000 });
    const topicTextarea = page.locator('#stage-poem-topic textarea');
    await topicTextarea.fill('The beauty of autumn leaves');
    await page.click('#process-stage-poem-topic');
    
    // Wait for poem generation to complete
    console.log('Step 2: Waiting for poem generation...');
    // The poem generation stage should auto-run, wait for it to complete
    await page.waitForSelector('#stage-generate-poem-with-title', { timeout: 60000 });
    // Wait for the stage to have completed status
    await page.waitForFunction(
      () => {
        const poemStage = document.querySelector('#stage-generate-poem-with-title');
        return poemStage && (poemStage.textContent?.includes('Poem Title') || poemStage.textContent?.includes('Poem Content'));
      },
      { timeout: 60000 }
    );
    console.log('✅ Poem generated successfully');
    
    // Handle image briefing (optional stage) - just click Continue to skip
    console.log('Step 3: Skipping image briefing...');
    const imageBriefingContinue = page.locator('#stage-image-briefing button:has-text("Continue")');
    if (await imageBriefingContinue.isVisible({ timeout: 5000 })) {
      await imageBriefingContinue.click();
      console.log('✅ Skipped image briefing');
    }
    
    // Wait for image generation to complete (it should auto-run)
    console.log('Step 4: Waiting for image generation...');
    await page.waitForTimeout(20000); // Give time for image generation
    
    // Scroll down to see HTML briefing
    await page.evaluate(() => window.scrollBy(0, 500));
    await page.waitForTimeout(1000);
    
    // Handle HTML briefing (optional stage) - just click Continue to skip
    console.log('Step 5: Skipping HTML briefing...');
    const htmlBriefingContinue = page.locator('#stage-html-briefing button:has-text("Continue")');
    if (await htmlBriefingContinue.isVisible({ timeout: 5000 })) {
      await htmlBriefingContinue.click();
      console.log('✅ Skipped HTML briefing');
    }
    
    // Wait for HTML preview generation (auto-run)
    console.log('Step 6: Waiting for HTML preview generation...');
    await page.waitForSelector('#stage-generate-html-preview', { timeout: 30000 });
    // Wait for the HTML preview to actually render (look for the iframe)
    await page.waitForFunction(
      () => {
        const htmlPreviewStage = document.querySelector('#stage-generate-html-preview');
        return htmlPreviewStage && htmlPreviewStage.querySelector('iframe');
      },
      { timeout: 30000 }
    );
    console.log('✅ HTML preview generated');
    
    // Scroll down multiple times to ensure we reach the export stage
    console.log('Step 7: Scrolling to find export stage...');
    for (let i = 0; i < 5; i++) {
      await page.evaluate(() => window.scrollBy(0, 500));
      await page.waitForTimeout(500);
    }
    
    // Wait for export stage to be visible
    await page.waitForSelector('#stage-export-publish', { timeout: 10000 });
    console.log('✅ Export stage found');
    
    // Find and click export button - the button is inside the export stage card
    console.log('Step 8: Triggering export...');
    const exportButton = page.locator('#stage-export-publish button:has-text("Export & Publish Poem")');
    await expect(exportButton).toBeVisible({ timeout: 10000 });
    await exportButton.click();
    
    // Wait for export completion - wait for the export stage to show completed status
    console.log('Step 9: Waiting for export completion...');
    await page.waitForFunction(
      () => {
        const exportStage = document.querySelector('#stage-export-publish');
        return exportStage && exportStage.classList.contains('border-green-500');
      },
      { timeout: 60000 }
    );
    
    // Also wait for Live Preview to be visible
    await page.waitForSelector('text="Live Preview"', { timeout: 10000 });
    console.log('✅ Export completed - Live Preview visible');
    
    // Verify export content is visible
    console.log('Step 8: Verifying export content...');
    const exportStage = page.locator('#stage-export-publish');
    const styledButton = exportStage.locator('button:has-text("Styled")');
    const cleanButton = exportStage.locator('button:has-text("Clean")');
    
    await expect(styledButton.or(cleanButton)).toBeVisible({ timeout: 10000 });
    console.log('✅ Export preview buttons found');
    
    // Check for the preview iframe
    const previewFrame = exportStage.locator('[title*="preview"]');
    await expect(previewFrame).toBeVisible({ timeout: 10000 });
    console.log('✅ Preview iframe is visible');
    
    // Check for export formats
    const exportFormats = exportStage.locator('text="Ready ✓"');
    const formatCount = await exportFormats.count();
    console.log(`✅ Found ${formatCount} ready export formats`);
    
    // Test publishing functionality
    console.log('Step 9: Testing publish functionality...');
    const publishSection = exportStage.locator('text="Publish to Web"');
    if (await publishSection.isVisible()) {
      console.log('✅ Publish section found');
      
      // Select formats to publish
      const htmlStyledCheckbox = exportStage.locator('input[id="publish-html-styled"]');
      if (await htmlStyledCheckbox.isVisible()) {
        await htmlStyledCheckbox.check();
        console.log('✅ Selected HTML Styled format for publishing');
      }
      
      // Click publish button
      const publishButton = exportStage.locator('button:has-text("Publish Now")');
      if (await publishButton.isVisible()) {
        await publishButton.click();
        console.log('⏳ Publishing content...');
        
        // Wait for publish success
        await page.waitForSelector('text="Published Successfully!"', { timeout: 30000 });
        console.log('✅ Content published successfully!');
        
        // Check for published URL
        const publishedUrl = await exportStage.locator('a[href*="/html-styled"]').first().getAttribute('href');
        console.log('📍 Published URL:', publishedUrl);
      }
    }
    
    // Get current URL for reload
    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);
    
    // Take screenshot before reload
    await page.screenshot({ path: './test-results/export-before-reload.png', fullPage: true });
    
    // Reload the page
    console.log('Step 10: Reloading page...');
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000); // Give time for state restoration
    
    // Scroll to export stage again
    console.log('Step 11: Scrolling to export stage after reload...');
    await page.evaluate(() => {
      const exportStage = document.querySelector('#stage-export-publish');
      if (exportStage) {
        exportStage.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
    await page.waitForTimeout(1000);
    
    // Verify export preview is still visible after reload
    console.log('Step 12: Verifying export content persisted after reload...');
    const reloadedExportStage = page.locator('#stage-export-publish');
    const reloadedLivePreview = reloadedExportStage.locator('text="Live Preview"');
    await expect(reloadedLivePreview).toBeVisible({ timeout: 10000 });
    console.log('✅ Live Preview text still visible after reload');
    
    const reloadedStyledButton = reloadedExportStage.locator('button:has-text("Styled")');
    const reloadedCleanButton = reloadedExportStage.locator('button:has-text("Clean")');
    
    await expect(reloadedStyledButton.or(reloadedCleanButton)).toBeVisible({ timeout: 10000 });
    console.log('✅ Export preview buttons still visible after reload');
    
    // Check for the preview iframe after reload
    const reloadedPreviewFrame = reloadedExportStage.locator('[title*="preview"]');
    await expect(reloadedPreviewFrame).toBeVisible({ timeout: 10000 });
    console.log('✅ Preview iframe still visible after reload');
    
    // Verify export formats are still ready
    const reloadedExportFormats = reloadedExportStage.locator('text="Ready ✓"');
    const reloadedFormatCount = await reloadedExportFormats.count();
    console.log(`✅ Still found ${reloadedFormatCount} ready export formats after reload`);
    
    // Check if published URL is still visible after reload
    const reloadedPublishSection = reloadedExportStage.locator('text="Published Successfully!"');
    if (await reloadedPublishSection.isVisible({ timeout: 5000 })) {
      console.log('✅ Published content still visible after reload!');
      
      // Verify published URL is still accessible
      const reloadedPublishedUrl = await reloadedExportStage.locator('a[href*="/html-styled"]').first().getAttribute('href');
      console.log('📍 Published URL after reload:', reloadedPublishedUrl);
    }
    
    // Test switching between Styled and Clean views after reload
    if (await reloadedCleanButton.isVisible()) {
      await reloadedCleanButton.click();
      await page.waitForTimeout(500);
      console.log('✅ Switched to Clean view after reload');
      
      await reloadedStyledButton.click();
      await page.waitForTimeout(500);
      console.log('✅ Switched back to Styled view after reload');
    }
    
    // Take final screenshot
    await page.screenshot({ path: './test-results/export-after-reload-success.png', fullPage: true });
    console.log('✅ Export persistence test completed successfully!');
  });
});