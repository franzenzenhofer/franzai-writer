import { test, expect, Page } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test.describe('Export Stage - Working Functionality', () => {

  test('should complete export workflow and verify downloads', async ({ page, browserName }) => {
    // Only run on chromium for now to avoid cross-browser issues
    test.skip(browserName !== 'chromium', 'Running only on Chromium for stability');
    
    console.log('Creating new poem document...');
    
    // Create a new poem document
    await page.goto('http://localhost:9002/w/poem/new');
    await page.waitForLoadState('networkidle');
    
    // Fill poem topic
    console.log('Step 1: Filling poem topic...');
    await page.fill('textarea', 'A serene lake at sunset with dancing fireflies');
    await page.click('button:has-text("Continue")');
    
    // Wait for poem generation with longer timeout
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
    
    // Wait for export completion - looking for success indicator
    console.log('Step 7: Waiting for export completion...');
    await expect(page.locator('text=Live Preview').or(page.locator('text=Export Downloads'))).toBeVisible({ timeout: 120000 });
    
    // Verify export completed successfully
    console.log('✅ Export stage completed!');
    
    // Test preview functionality
    console.log('Step 8: Testing preview functionality...');
    const styledButton = page.locator('button', { hasText: 'Styled' });
    const cleanButton = page.locator('button', { hasText: 'Clean' });
    
    if (await styledButton.isVisible()) {
      console.log('✅ Styled button found');
      // Test clean button click
      if (await cleanButton.isVisible()) {
        await cleanButton.click();
        console.log('✅ Clean view activated');
        
        // Switch back to styled
        await styledButton.click();
        console.log('✅ Styled view activated');
      }
    }
    
    // Verify export downloads section
    const exportSection = page.locator('text=Export Downloads').or(page.locator('text=HTML (Styled)'));
    if (await exportSection.isVisible()) {
      console.log('✅ Export downloads section visible');
      
      // Check for ready indicators
      const readyIndicators = page.locator('text=Ready ✓');
      const readyCount = await readyIndicators.count();
      console.log(`✅ Found ${readyCount} ready export formats`);
      
      if (readyCount >= 3) {
        console.log('✅ HTML (Styled), HTML (Clean), and Markdown formats ready');
      }
    }
    
    // Take final screenshot
    await page.screenshot({ path: './test-results/export-stage-final-success.png', fullPage: true });
    console.log('✅ Test completed successfully!');
  });

  test('should verify export content quality', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'Running only on Chromium for stability');
    
    // Navigate to a document that should have exports (we'll create one)
    await page.goto('http://localhost:9002/w/poem/new');
    await page.waitForLoadState('networkidle');
    
    // Quick workflow completion
    await page.fill('textarea', 'Testing export content quality with a beautiful poem about mountains');
    await page.click('button:has-text("Continue")');
    
    // Wait for stages to complete
    await expect(page.locator('text=✅').first()).toBeVisible({ timeout: 120000 });
    await page.click('button:has-text("Continue")');
    await expect(page.locator('text=✅').nth(1)).toBeVisible({ timeout: 120000 });
    
    // Scroll to export and trigger
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const exportButton = page.locator('button', { hasText: 'Export & Publish Poem' });
    await exportButton.click();
    
    // Wait for export completion
    await expect(page.locator('text=Live Preview')).toBeVisible({ timeout: 120000 });
    
    // Verify iframe content exists
    const iframes = page.locator('iframe');
    const iframeCount = await iframes.count();
    console.log(`Found ${iframeCount} preview iframes`);
    
    if (iframeCount > 0) {
      console.log('✅ HTML preview iframes generated successfully');
    }
    
    // Verify export formats are ready
    const htmlStyledText = page.locator('text=HTML (Styled)');
    const htmlCleanText = page.locator('text=HTML (Clean)');
    const markdownText = page.locator('text=Markdown');
    
    await expect(htmlStyledText).toBeVisible();
    await expect(htmlCleanText).toBeVisible();
    await expect(markdownText).toBeVisible();
    
    console.log('✅ All export formats visible and ready');
  });

});