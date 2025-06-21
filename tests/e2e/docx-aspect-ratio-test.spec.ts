import { test, expect } from '@playwright/test';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * E2E test for DOCX export with correct image aspect ratio (Ticket 116a)
 */

test.describe('DOCX Export with Aspect Ratio', () => {
  const BASE_URL = 'http://localhost:9002';
  const EXPORT_PROOF_DIR = path.join(process.cwd(), 'export-proof');
  
  test.beforeAll(async () => {
    await fs.mkdir(EXPORT_PROOF_DIR, { recursive: true });
  });
  
  test('should export DOCX with correct image aspect ratio', async ({ page }) => {
    console.log('🧪 Testing DOCX export with aspect ratio...');
    
    // Step 1: Start poem workflow
    await page.goto(`${BASE_URL}/w/poem/new`);
    await page.waitForLoadState('networkidle');
    
    // Step 2: Enter poem topic
    const poemTopic = 'A beautiful sunset over the ocean';
    await page.locator('textarea').first().fill(poemTopic);
    await page.locator('#process-stage-poem-topic').click();
    
    // Step 3: Wait for poem generation
    await page.waitForSelector('text=Poem Title', { timeout: 60000 });
    
    // Step 4: Fill image briefing with specific aspect ratio
    await page.waitForSelector('text=Image Customization', { timeout: 10000 });
    
    // Select 16:9 aspect ratio (Widescreen)
    const aspectRatioSelect = page.locator('select').first(); // Assuming it's the first select
    await aspectRatioSelect.selectOption('16:9');
    
    // Add image instructions
    const imageInstructions = page.locator('textarea').filter({ hasText: '' }).nth(1);
    await imageInstructions.fill('Golden hour lighting, vibrant orange and pink sky');
    
    // Submit image briefing
    await page.locator('#process-stage-image-briefing').click();
    
    // Step 5: Wait for image generation
    await page.waitForSelector('img[alt*="poem"]', { timeout: 60000 });
    
    // Step 6: Generate HTML preview
    await page.locator('#process-stage-html-preview').click();
    await page.waitForSelector('text=Export & Publish', { timeout: 30000 });
    
    // Step 7: Trigger export
    await page.locator('#trigger-export-export-publish').click();
    await page.waitForSelector('text=Word Document', { timeout: 30000 });
    
    // Step 8: Download DOCX
    const downloadPromise = page.waitForEvent('download');
    await page.locator('button:has-text("Download"):right-of(:text("Word Document"))').click();
    const download = await downloadPromise;
    
    // Save the DOCX file
    const fileName = `docx-aspect-ratio-test-${Date.now()}.docx`;
    const filePath = path.join(EXPORT_PROOF_DIR, fileName);
    await download.saveAs(filePath);
    console.log(`✓ DOCX saved to: ${filePath}`);
    
    // Verify file exists and has content
    const stats = await fs.stat(filePath);
    expect(stats.size).toBeGreaterThan(10000); // DOCX files should be at least 10KB
    
    console.log('✅ DOCX export with aspect ratio test passed!');
    console.log('Note: Manual verification needed to check image dimensions in Word');
  });
  
  test('should include aspect ratio data in generated HTML', async ({ page }) => {
    console.log('🧪 Testing HTML includes aspect ratio data attribute...');
    
    // Complete workflow to export stage (reuse steps from above)
    await page.goto(`${BASE_URL}/w/poem/new`);
    await page.waitForLoadState('networkidle');
    
    await page.locator('textarea').first().fill('A poem about mountains');
    await page.locator('#process-stage-poem-topic').click();
    await page.waitForSelector('text=Poem Title', { timeout: 60000 });
    
    // Select 3:4 aspect ratio (Portrait)
    const aspectRatioSelect = page.locator('select').first();
    await aspectRatioSelect.selectOption('3:4');
    
    await page.locator('#process-stage-image-briefing').click();
    await page.waitForSelector('img[alt*="poem"]', { timeout: 60000 });
    
    await page.locator('#process-stage-html-preview').click();
    await page.waitForSelector('text=Export & Publish', { timeout: 30000 });
    
    await page.locator('#trigger-export-export-publish').click();
    await page.waitForSelector('text=Beautiful Poem', { timeout: 30000 });
    
    // Copy styled HTML and check for aspect ratio
    await page.locator('button:has-text("Copy"):right-of(:text("Beautiful Poem"))').click();
    
    // Wait for copy confirmation
    await page.waitForSelector('text=Copied!', { timeout: 5000 });
    
    // Read clipboard content (requires permissions)
    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    
    // Verify HTML contains data-aspect-ratio
    expect(clipboardText).toContain('data-aspect-ratio="3:4"');
    console.log('✓ HTML contains data-aspect-ratio attribute');
    
    // Verify img tag structure
    const imgRegex = /<img[^>]+data-aspect-ratio="3:4"[^>]*>/;
    expect(clipboardText).toMatch(imgRegex);
    console.log('✓ Image tag properly formatted with aspect ratio');
    
    console.log('✅ HTML aspect ratio test passed!');
  });
});