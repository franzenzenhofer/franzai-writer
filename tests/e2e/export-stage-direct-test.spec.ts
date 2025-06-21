import { test, expect } from '@playwright/test';

test.describe('Export Stage Direct Test', () => {
  test('should test export functionality on existing poem', async ({ page }) => {
    console.log('Starting export stage direct test');
    
    // Navigate directly to a test poem document
    await page.goto('http://localhost:9002/w/poem/test-export-stage', { waitUntil: 'domcontentloaded' });
    console.log('Navigated to test poem document');
    
    // Wait for the page to load
    await page.waitForSelector('[data-testid="stage-card-poem-topic"]', { timeout: 30000 });
    console.log('Page loaded');
    
    // Fill in poem topic if needed
    const topicStageStatus = await page.locator('[data-testid="stage-card-poem-topic"] svg.text-green-500').count();
    if (topicStageStatus === 0) {
      console.log('Poem topic not completed, filling it in');
      await page.fill('textarea[name="topic"]', 'A beautiful sunset over the ocean');
      await page.click('#process-stage-poem-topic');
      await page.waitForSelector('[data-testid="stage-card-poem-topic"] svg.text-green-500', { timeout: 60000 });
      console.log('Poem topic completed');
    }
    
    // Wait for dependent stages to complete
    await page.waitForSelector('[data-testid="stage-card-image-briefing"] svg.text-green-500', { timeout: 60000 });
    console.log('Image briefing completed');
    
    await page.waitForSelector('[data-testid="stage-card-html-briefing"] svg.text-green-500', { timeout: 60000 });
    console.log('HTML briefing completed');
    
    // Now test the export stage
    console.log('Testing export stage');
    
    // Check if export is already completed
    const exportCompleted = await page.locator('[data-testid="stage-card-export-publish"] svg.text-green-500').count();
    
    if (exportCompleted === 0) {
      // Click the Export & Publish button
      await page.waitForSelector('#trigger-export-export-publish', { timeout: 10000 });
      await page.click('#trigger-export-export-publish');
      console.log('Clicked Export & Publish button');
      
      // Wait for export to complete
      await page.waitForSelector('.export-preview', { timeout: 120000 });
      console.log('Export completed - preview visible');
    } else {
      console.log('Export already completed');
    }
    
    // Verify export formats are available
    await expect(page.locator('text=HTML (Styled)')).toBeVisible();
    await expect(page.locator('text=HTML (Clean)')).toBeVisible();
    await expect(page.locator('text=Markdown')).toBeVisible();
    await expect(page.locator('text=PDF')).toBeVisible();
    await expect(page.locator('text=Word')).toBeVisible();
    console.log('All export formats are available');
    
    // Test publishing
    const publishedAlready = await page.locator('text=Published Successfully!').count();
    
    if (publishedAlready === 0) {
      console.log('Testing publish functionality');
      
      // Select formats to publish
      await page.check('#publish-html-styled');
      await page.check('#publish-html-clean');
      
      // Click Publish Now
      await page.click('button:has-text("Publish Now")');
      console.log('Clicked Publish Now');
      
      // Wait for published confirmation
      await page.waitForSelector('text=Published Successfully!', { timeout: 30000 });
      console.log('Content published successfully');
    } else {
      console.log('Content already published');
    }
    
    // Verify published URLs are displayed
    await expect(page.locator('text=Styled HTML:')).toBeVisible();
    await expect(page.locator('text=Clean HTML:')).toBeVisible();
    
    console.log('Export stage test completed successfully!');
  });
});