import { test, expect } from '@playwright/test';

test.describe('Export Stage Dashboard Test', () => {
  test('should complete poem workflow and test export functionality', async ({ page }) => {
    console.log('Starting export stage test from dashboard');
    
    // Navigate to dashboard
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });
    console.log('Navigated to dashboard');
    
    // Click on Poem Generator
    await page.click('#workflow-start-poem-generator');
    await page.waitForURL('**/w/poem/**');
    console.log('Started new poem document');
    
    // Get the document ID from URL for later
    const url = page.url();
    const documentId = url.split('/').pop();
    console.log('Document ID:', documentId);
    
    // Stage 1: Poem Topic
    await page.waitForSelector('#process-stage-poem-topic', { timeout: 10000 });
    await page.fill('textarea[name="topic"]', 'A sunset over the ocean');
    await page.click('#process-stage-poem-topic');
    console.log('Submitted poem topic');
    
    // Wait for poem topic to complete
    await page.waitForSelector('[data-testid="stage-card-poem-topic"] svg.text-green-500', { timeout: 60000 });
    console.log('Poem topic stage completed');
    
    // Wait for auto-run stages to complete
    await page.waitForSelector('[data-testid="stage-card-image-briefing"] svg.text-green-500', { timeout: 60000 });
    console.log('Image briefing stage completed');
    
    await page.waitForSelector('[data-testid="stage-card-html-briefing"] svg.text-green-500', { timeout: 60000 });
    console.log('HTML briefing stage completed');
    
    // Now test the export stage
    console.log('Testing export stage');
    await page.waitForSelector('#trigger-export-export-publish', { timeout: 10000 });
    
    // Take a screenshot before clicking export
    await page.screenshot({ path: 'export-proof/before-export.png', fullPage: true });
    
    // Click the Export & Publish button
    await page.click('#trigger-export-export-publish');
    console.log('Clicked Export & Publish button');
    
    // Wait for export to complete (look for the export preview)
    await page.waitForSelector('.export-preview', { timeout: 120000 });
    console.log('Export stage completed - preview visible');
    
    // Take a screenshot after export completes
    await page.screenshot({ path: 'export-proof/after-export.png', fullPage: true });
    
    // Verify all export formats are available
    const formats = ['HTML (Styled)', 'HTML (Clean)', 'Markdown', 'PDF', 'Word'];
    for (const format of formats) {
      await expect(page.locator(`text=${format}`)).toBeVisible();
      console.log(`Format available: ${format}`);
    }
    
    console.log('Export stage test completed successfully!');
    
    // Log the current URL and document state
    console.log('Final URL:', page.url());
    console.log('Test completed for document:', documentId);
  });
});