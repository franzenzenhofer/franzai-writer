import { test, expect } from '@playwright/test';

/**
 * Debug test to figure out why export stage is not completing
 */

test.describe('Debug Export Stage', () => {
  const BASE_URL = 'http://localhost:9002';
  
  test('Debug export stage execution', async ({ page }) => {
    console.log('🧪 Debugging export stage...');
    
    // Capture console logs
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.log('❌ BROWSER ERROR:', msg.text());
      } else if (msg.text().includes('Export') || msg.text().includes('export')) {
        console.log('📝 BROWSER LOG:', msg.text());
      }
    });
    
    // Capture network errors
    page.on('pageerror', (error) => {
      console.log('❌ PAGE ERROR:', error.message);
    });
    
    // Monitor API calls
    page.on('response', (response) => {
      if (response.url().includes('/api/') && response.status() >= 400) {
        console.log(`❌ API ERROR: ${response.url()} - ${response.status()}`);
      }
    });
    
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForSelector('text=Start a new document', { timeout: 10000 });
    
    // Start workflow
    await page.click('#workflow-start-poem-generator');
    await page.waitForSelector('textarea', { timeout: 10000 });
    
    // Enter poem topic
    await page.fill('textarea', 'Debug export test');
    await page.click('#process-stage-poem-topic');
    
    // Wait for poem generation
    await page.waitForSelector('text=Poem Title', { timeout: 30000 });
    console.log('✅ Poem generated');
    
    // Process image briefing
    await page.click('#process-stage-image-briefing');
    
    // Wait for image generation
    await page.waitForSelector('img[alt*="Generated image"]', { timeout: 60000 });
    console.log('✅ Image generated');
    
    // Process HTML briefing
    await page.click('#process-stage-html-briefing');
    
    // Wait for HTML generation
    await page.waitForSelector('text=Export & Publish', { timeout: 30000 });
    console.log('✅ HTML preview ready');
    
    // Trigger export with console monitoring
    console.log('🔄 Triggering export...');
    await page.click('#trigger-export-export-publish');
    
    // Wait a bit to see what happens
    await page.waitForTimeout(5000);
    
    // Check current state
    const exportStageContent = await page.locator('#stage-export-publish').textContent();
    console.log('📋 Export stage content:', exportStageContent);
    
    // Look for any error messages
    const errorMessages = await page.locator('.text-destructive').allTextContents();
    if (errorMessages.length > 0) {
      console.log('❌ Error messages found:', errorMessages);
    }
    
    // Check if formats are visible
    const hasStyledHtml = await page.locator('text=Styled HTML').isVisible().catch(() => false);
    const hasCleanHtml = await page.locator('text=Clean HTML').isVisible().catch(() => false);
    const hasMarkdown = await page.locator('text=Markdown').isVisible().catch(() => false);
    
    console.log('📊 Export formats visible:', {
      styledHtml: hasStyledHtml,
      cleanHtml: hasCleanHtml,
      markdown: hasMarkdown
    });
    
    // Wait longer to see if it eventually completes
    try {
      await page.waitForSelector('h3:has-text("Styled HTML")', { timeout: 30000 });
      console.log('✅ Export completed successfully!');
    } catch (e) {
      console.log('❌ Export did not complete within 30 seconds');
      
      // Take a screenshot for debugging
      await page.screenshot({ path: 'export-debug-screenshot.png' });
      console.log('📸 Screenshot saved to export-debug-screenshot.png');
    }
  });
});