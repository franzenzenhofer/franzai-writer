import { test, expect } from '@playwright/test';

test.describe('Export Persistence with Reload', () => {
  test('exports persist after page reload', async ({ page }) => {
    // Navigate to poem workflow
    await page.goto('/w/poem/new');
    await page.waitForLoadState('networkidle');
    
    // Fill in poem topic
    console.log('Step 1: Filling poem topic...');
    await page.fill('textarea', 'The beauty of autumn leaves');
    await page.click('button:has-text("Continue")');
    
    // Wait for poem generation to complete
    console.log('Step 2: Waiting for poem generation...');
    await expect(page.locator('text=✅').first()).toBeVisible({ timeout: 120000 });
    
    // Skip HTML briefing
    console.log('Step 3: Continuing through HTML briefing...');
    await page.click('button:has-text("Continue")');
    
    // Wait for HTML preview generation
    console.log('Step 4: Waiting for HTML preview generation...');
    await expect(page.locator('text=✅').nth(1)).toBeVisible({ timeout: 120000 });
    
    // Scroll to export stage
    console.log('Step 5: Scrolling to export stage...');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    // Find and click export button
    console.log('Step 6: Triggering export...');
    const exportButton = page.locator('button', { hasText: 'Export & Publish Poem' }).or(
      page.locator('button', { hasText: 'Generate Export Formats' })
    );
    await exportButton.click();
    
    // Wait for export completion
    console.log('Step 7: Waiting for export completion...');
    await expect(page.locator('text=Live Preview').or(page.locator('text=Export Downloads'))).toBeVisible({ timeout: 120000 });
    
    // Verify export content is visible
    console.log('Step 8: Verifying export content...');
    const styledButton = page.locator('button', { hasText: 'Styled' });
    const cleanButton = page.locator('button', { hasText: 'Clean' });
    
    await expect(styledButton.or(cleanButton)).toBeVisible({ timeout: 10000 });
    console.log('✅ Export preview buttons found');
    
    // Check for export formats
    const exportFormats = page.locator('text=Ready ✓');
    const formatCount = await exportFormats.count();
    expect(formatCount).toBeGreaterThan(0);
    console.log(`✅ Found ${formatCount} ready export formats`);
    
    // Get current URL for reload
    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);
    
    // Reload the page
    console.log('Step 9: Reloading page...');
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Wait for the export stage to be visible again
    console.log('Step 10: Waiting for export stage after reload...');
    await page.waitForTimeout(2000); // Give the page time to restore state
    
    // Scroll to export stage again
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    // Verify export preview is still visible after reload
    console.log('Step 11: Verifying export content persisted after reload...');
    const reloadedStyledButton = page.locator('button', { hasText: 'Styled' });
    const reloadedCleanButton = page.locator('button', { hasText: 'Clean' });
    
    await expect(reloadedStyledButton.or(reloadedCleanButton)).toBeVisible({ timeout: 10000 });
    console.log('✅ Export preview buttons still visible after reload');
    
    // Verify export formats are still ready after reload
    const reloadedExportFormats = page.locator('text=Ready ✓');
    const reloadedFormatCount = await reloadedExportFormats.count();
    expect(reloadedFormatCount).toBeGreaterThan(0);
    console.log(`✅ Still found ${reloadedFormatCount} ready export formats after reload`);
    
    // Test copy functionality after reload
    const copyButtons = await page.locator('button[title*="Copy"]').or(page.locator('button:has(svg.lucide-copy)'));
    const copyCount = await copyButtons.count();
    expect(copyCount).toBeGreaterThan(0);
    console.log(`✅ Found ${copyCount} copy buttons after reload`);
    
    // Take final screenshot
    await page.screenshot({ path: './test-results/export-persistence-reload-success.png', fullPage: true });
    console.log('✅ Export persistence test completed successfully!');
  });
});