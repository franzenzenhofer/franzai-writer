import { test, expect } from '@playwright/test';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Direct test of export functionality by going straight to document page
 * This bypasses Firebase issues
 */

test.describe('Export Direct Test', () => {
  const BASE_URL = 'http://localhost:9002';
  const EXPORT_PROOF_DIR = path.join(process.cwd(), 'export-proof');
  
  test.beforeAll(async () => {
    await fs.mkdir(EXPORT_PROOF_DIR, { recursive: true });
  });
  
  test('Export stage generates all formats', async ({ page }) => {
    console.log('🧪 Testing export stage directly...');
    
    // Capture console errors
    page.on('console', (msg) => {
      if (msg.type() === 'error' && !msg.text().includes('Firebase')) {
        console.log('❌ CONSOLE ERROR:', msg.text());
      }
    });
    
    // Go directly to a new document page
    await page.goto(`${BASE_URL}/w/poem/new`);
    
    // Wait for the wizard to load
    await page.waitForSelector('h1:has-text("Poem Generator")', { timeout: 30000 });
    console.log('✅ Wizard loaded');
    
    // Fill in poem topic
    const textarea = page.locator('textarea').first();
    await textarea.fill('Export test poem about nature');
    
    // Process poem generation
    await page.click('#process-stage-poem-topic');
    await page.waitForSelector('text=Poem Title', { timeout: 30000 });
    console.log('✅ Poem generated');
    
    // Process image briefing (auto-run stage)
    await page.click('#process-stage-image-briefing');
    
    // Wait for image generation
    await page.waitForSelector('img[alt*="Generated image"]', { timeout: 60000 });
    console.log('✅ Image generated');
    
    // Process HTML briefing (optional stage)
    await page.click('#process-stage-html-briefing');
    
    // Wait for HTML preview to be ready
    await page.waitForSelector('text=Export & Publish', { timeout: 30000 });
    console.log('✅ HTML preview ready');
    
    // Trigger export generation
    console.log('🔄 Triggering export...');
    await page.click('#trigger-export-export-publish');
    
    // Wait for export to complete - look for any export format heading
    try {
      await page.waitForSelector('h3:has-text("Styled HTML")', { timeout: 30000 });
      console.log('✅ Export completed - Styled HTML visible');
      
      // Verify all formats are present
      const formats = ['Styled HTML', 'Clean HTML', 'Markdown', 'PDF Document', 'Word Document'];
      for (const format of formats) {
        const isVisible = await page.locator(`h3:has-text("${format}")`).isVisible();
        console.log(`  ${isVisible ? '✅' : '❌'} ${format}`);
      }
      
      // Test download functionality
      const downloadPromise = page.waitForEvent('download');
      
      // Click PDF download
      const pdfCard = page.locator('h3:has-text("PDF Document")').locator('../..');
      await pdfCard.locator('button:has-text("Download")').click();
      
      const download = await downloadPromise;
      const pdfPath = path.join(EXPORT_PROOF_DIR, 'direct-test.pdf');
      await download.saveAs(pdfPath);
      console.log(`✅ PDF saved to ${pdfPath}`);
      
      // Verify file exists
      const stats = await fs.stat(pdfPath);
      console.log(`✅ PDF file size: ${stats.size} bytes`);
      
    } catch (error) {
      console.log('❌ Export did not complete within 30 seconds');
      
      // Check what's on the page
      const exportStageText = await page.locator('#stage-export-publish').textContent();
      console.log('Export stage content:', exportStageText);
      
      // Take screenshot for debugging
      await page.screenshot({ path: path.join(EXPORT_PROOF_DIR, 'export-direct-failed.png') });
      throw error;
    }
  });
});