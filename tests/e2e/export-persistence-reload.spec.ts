import { test, expect } from '@playwright/test';

test.describe('Export Persistence with Reload', () => {
  test('exports persist after page reload', async ({ page }) => {
    // Navigate to poem workflow
    await page.goto('/w/poem/new');
    
    // Wait for page to load
    await page.waitForSelector('[data-testid="stage-card-poem-topic"]', { timeout: 10000 });
    
    // Fill in poem topic
    await page.fill('#stage-poem-topic-input', 'The beauty of autumn leaves');
    await page.click('#process-stage-poem-topic');
    
    // Wait for poem generation
    await page.waitForSelector('#stage-poem-output-display', { timeout: 30000 });
    
    // Run Export & Publish stage
    await page.click('#process-stage-export');
    
    // Wait for export completion - look for the preview
    await page.waitForSelector('[title="clean HTML preview"]', { timeout: 60000 });
    
    // Verify export UI is visible
    const exportPreview = await page.locator('[title="clean HTML preview"]');
    await expect(exportPreview).toBeVisible();
    
    // Check that download buttons are enabled
    const downloadButtons = await page.locator('button:has-text("Download")');
    const downloadCount = await downloadButtons.count();
    expect(downloadCount).toBeGreaterThan(0);
    
    // Verify at least one download button is enabled
    const firstDownloadButton = downloadButtons.first();
    await expect(firstDownloadButton).toBeEnabled();
    
    // Get current URL for reload
    const currentUrl = page.url();
    
    // Reload the page
    await page.reload();
    
    // Wait for page to reload
    await page.waitForSelector('[data-testid="stage-card-export"]', { timeout: 10000 });
    
    // Verify export preview is still visible after reload
    const reloadedExportPreview = await page.locator('[title="clean HTML preview"]');
    await expect(reloadedExportPreview).toBeVisible();
    
    // Verify download buttons are still enabled after reload
    const reloadedDownloadButtons = await page.locator('button:has-text("Download")');
    const reloadedDownloadCount = await reloadedDownloadButtons.count();
    expect(reloadedDownloadCount).toBeGreaterThan(0);
    
    const firstReloadedDownloadButton = reloadedDownloadButtons.first();
    await expect(firstReloadedDownloadButton).toBeEnabled();
    
    // Test copy functionality after reload
    const copyButtons = await page.locator('button:has-text("Copy")');
    const copyCount = await copyButtons.count();
    expect(copyCount).toBeGreaterThan(0);
    
    const firstCopyButton = copyButtons.first();
    await expect(firstCopyButton).toBeEnabled();
    
    // Click copy and verify feedback
    await firstCopyButton.click();
    
    // Check for copy success indicator (green checkmark)
    await page.waitForSelector('.text-green-500', { timeout: 5000 });
  });
});