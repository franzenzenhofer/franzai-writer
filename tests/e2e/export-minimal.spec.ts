import { test, expect } from '@playwright/test';

/**
 * Minimal test to debug export stage issue
 * Goes directly to the document wizard and tests export
 */

test.describe('Export Minimal Test', () => {
  const BASE_URL = 'http://localhost:9002';
  
  test('Export stage basic functionality', async ({ page }) => {
    console.log('🧪 Starting minimal export test...');
    
    // Monitor console logs
    page.on('console', (msg) => {
      const text = msg.text();
      if (text.includes('[Export') || text.includes('[handleRunStage]') || text.includes('Error')) {
        console.log(`📝 ${msg.type().toUpperCase()}: ${text}`);
      }
    });
    
    // Monitor network requests
    page.on('response', (response) => {
      if (response.url().includes('/api/') && response.status() >= 400) {
        console.log(`❌ API ERROR: ${response.url()} - ${response.status()}`);
      }
    });
    
    // Navigate to the poem wizard with a specific document ID
    const documentId = 'test-export-' + Date.now();
    await page.goto(`${BASE_URL}/w/poem/${documentId}`);
    
    // Wait for the wizard to load
    try {
      await page.waitForSelector('h1:has-text("Poem Generator")', { timeout: 30000 });
      console.log('✅ Wizard loaded successfully');
    } catch (e) {
      console.log('❌ Failed to load wizard, trying dashboard approach...');
      
      // Alternative: go through dashboard
      await page.goto(`${BASE_URL}/dashboard`);
      await page.waitForSelector('text=Start a new document', { timeout: 10000 });
      await page.click('#workflow-start-poem-generator');
      await page.waitForSelector('textarea', { timeout: 10000 });
    }
    
    // Ensure we have a textarea for poem topic
    const textarea = page.locator('textarea').first();
    await textarea.fill('Minimal test poem');
    console.log('✅ Filled poem topic');
    
    // Process poem generation
    await page.click('#process-stage-poem-topic');
    await page.waitForSelector('text=Poem Title', { timeout: 30000 });
    console.log('✅ Poem generated');
    
    // Process image briefing
    await page.click('#process-stage-image-briefing');
    console.log('⏳ Waiting for image generation...');
    
    // Wait for image - increased timeout
    await page.waitForSelector('img[alt*="Generated image"]', { timeout: 90000 });
    console.log('✅ Image generated');
    
    // Process HTML briefing
    await page.click('#process-stage-html-briefing');
    console.log('⏳ Processing HTML briefing...');
    
    // Wait for export button
    await page.waitForSelector('#trigger-export-export-publish', { timeout: 30000 });
    console.log('✅ Export button ready');
    
    // Take a screenshot before triggering export
    await page.screenshot({ path: 'before-export.png', fullPage: true });
    
    // Trigger export
    console.log('🔄 Triggering export...');
    await page.click('#trigger-export-export-publish');
    
    // Wait for a bit to see progress
    await page.waitForTimeout(3000);
    
    // Check if we're stuck on "Creating Your Exports..."
    const isStuck = await page.locator('text=Creating Your Exports...').isVisible();
    if (isStuck) {
      console.log('⚠️ Export stage is stuck on "Creating Your Exports..."');
      
      // Take screenshot of stuck state
      await page.screenshot({ path: 'export-stuck.png', fullPage: true });
      
      // Check for any error messages
      const errors = await page.locator('.text-destructive').allTextContents();
      if (errors.length > 0) {
        console.log('❌ Error messages found:', errors);
      }
      
      // Wait longer to see if it eventually completes
      console.log('⏳ Waiting 20 more seconds to see if export completes...');
      
      try {
        await page.waitForSelector('h3:has-text("Styled HTML")', { timeout: 20000 });
        console.log('✅ Export completed after extended wait!');
      } catch (e) {
        console.log('❌ Export did not complete within extended timeout');
        
        // Get the full page content for debugging
        const exportStageContent = await page.locator('#stage-export-publish').textContent();
        console.log('Export stage content:', exportStageContent);
        
        // Final screenshot
        await page.screenshot({ path: 'export-final-state.png', fullPage: true });
        
        throw new Error('Export stage failed to complete');
      }
    } else {
      // Check if export completed immediately
      const hasFormats = await page.locator('h3:has-text("Styled HTML")').isVisible();
      if (hasFormats) {
        console.log('✅ Export completed successfully!');
      } else {
        console.log('❓ Unknown export state');
      }
    }
    
    // If we get here, export should be complete
    const formats = ['Styled HTML', 'Clean HTML', 'Markdown', 'PDF Document', 'Word Document'];
    for (const format of formats) {
      const isVisible = await page.locator(`h3:has-text("${format}")`).isVisible();
      console.log(`  ${isVisible ? '✅' : '❌'} ${format}`);
    }
  });
});