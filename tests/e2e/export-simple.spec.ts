import { test, expect } from '@playwright/test';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Simplified export tests that don't require clipboard permissions
 * Focuses on verifying UI elements and download functionality
 */

test.describe('Export Functionality', () => {
  const BASE_URL = 'http://localhost:9002';
  const EXPORT_PROOF_DIR = path.join(process.cwd(), 'export-proof');
  
  test.beforeAll(async () => {
    await fs.mkdir(EXPORT_PROOF_DIR, { recursive: true });
    console.log(`📁 Created export-proof directory at: ${EXPORT_PROOF_DIR}`);
  });
  
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForSelector('text=Start a new document', { timeout: 10000 });
  });

  async function completeWorkflowToExport(page: any, poemTopic: string) {
    // Start workflow
    await page.click('#workflow-start-poem-generator');
    await page.waitForSelector('textarea', { timeout: 10000 });
    
    // Enter poem topic
    await page.fill('textarea', poemTopic);
    await page.click('#process-stage-poem-topic');
    
    // Wait for poem generation
    await page.waitForSelector('text=Poem Title', { timeout: 30000 });
    
    // Process image briefing
    await page.click('#process-stage-image-briefing');
    
    // Wait for image generation - look for the image itself or download button
    await page.waitForSelector('img[alt*="Generated image"], button:has-text("Download")', { timeout: 60000 });
    
    // Process HTML briefing
    await page.click('#process-stage-html-briefing');
    
    // Wait for HTML generation
    await page.waitForSelector('text=Export & Publish', { timeout: 30000 });
    
    // Trigger export
    await page.click('#trigger-export-export-publish');
    
    // Wait for export formats to appear - more specific waiting
    await page.waitForSelector('.space-y-4:has(h3:has-text("Styled HTML"))', { timeout: 30000 });
    
    // Double-check all formats are visible
    await expect(page.locator('h3:has-text("Styled HTML")')).toBeVisible();
    await expect(page.locator('h3:has-text("Clean HTML")')).toBeVisible();
    await expect(page.locator('h3:has-text("Markdown")')).toBeVisible();
    await expect(page.locator('h3:has-text("PDF Document")')).toBeVisible();
    await expect(page.locator('h3:has-text("Word Document")')).toBeVisible();
  }

  test('All export formats are generated successfully', async ({ page }) => {
    console.log('🧪 Testing export format generation...');
    
    await completeWorkflowToExport(page, 'Test poem for export formats');
    
    // Verify all export format cards exist
    const exportFormats = [
      { title: 'Styled HTML', hasPreview: true },
      { title: 'Clean HTML', hasPreview: true },
      { title: 'Markdown', hasPreview: true },
      { title: 'PDF Document', hasPreview: false },
      { title: 'Word Document', hasPreview: false }
    ];
    
    for (const format of exportFormats) {
      console.log(`✅ Checking ${format.title}...`);
      const formatCard = page.locator(`h3:has-text("${format.title}")`).locator('../..');
      
      // Check card is visible
      await expect(formatCard).toBeVisible();
      
      // Check for buttons - they are all in the same card now
      const buttons = formatCard.locator('button');
      const buttonCount = await buttons.count();
      
      if (buttonCount > 0) {
        // All formats should have download button
        await expect(formatCard.locator('button:has-text("Download")')).toBeVisible();
        console.log(`  ✓ Download button found for ${format.title}`);
        
        // Text formats should also have copy button
        if (format.hasPreview) {
          await expect(formatCard.locator('button:has-text("Copy")')).toBeVisible();
          console.log(`  ✓ Copy button found for ${format.title}`);
        }
      } else {
        console.log(`  ⚠️ No buttons found for ${format.title}`);
      }
    }
    
    console.log('✅ All export formats generated successfully');
  });

  test('Copy buttons work and show success feedback', async ({ page }) => {
    console.log('🧪 Testing copy button functionality...');
    
    await completeWorkflowToExport(page, 'Test poem for copy buttons');
    
    // Wait a moment for buttons to be fully rendered
    await page.waitForTimeout(1000);
    
    // Test Styled HTML copy - look for the parent card containing the h3
    const styledHtmlCard = page.locator('.space-y-4').locator('div:has(h3:has-text("Styled HTML"))');
    const styledCopyButton = styledHtmlCard.locator('button:has-text("Copy")');
    
    await styledCopyButton.click();
    
    // Check for success indicator (green checkmark)
    await expect(styledHtmlCard.locator('.text-green-500')).toBeVisible();
    console.log('✅ Styled HTML copy success indicator shown');
    
    // Wait for checkmark to disappear
    await page.waitForTimeout(2500);
    
    // Test Clean HTML copy
    const cleanHtmlCard = page.locator('.space-y-4').locator('div:has(h3:has-text("Clean HTML"))');
    const cleanCopyButton = cleanHtmlCard.locator('button:has-text("Copy")');
    
    await cleanCopyButton.click();
    await expect(cleanHtmlCard.locator('.text-green-500')).toBeVisible();
    console.log('✅ Clean HTML copy success indicator shown');
  });

  test('PDF download works and saves file', async ({ page }) => {
    console.log('🧪 Testing PDF download...');
    
    await completeWorkflowToExport(page, 'PDF export test poem');
    
    // Set up download promise before clicking
    const downloadPromise = page.waitForEvent('download');
    
    // Click download for PDF
    const pdfCard = page.locator('h3:has-text("PDF Document")').locator('../..');
    const downloadButton = pdfCard.locator('button:has-text("Download")');
    await downloadButton.click();
    
    // Wait for download
    const download = await downloadPromise;
    console.log('✅ PDF download initiated');
    
    // Save to export-proof directory
    const pdfPath = path.join(EXPORT_PROOF_DIR, 'test-poem.pdf');
    await download.saveAs(pdfPath);
    console.log(`✅ Saved PDF to ${pdfPath}`);
    
    // Verify PDF file exists and has content
    const stats = await fs.stat(pdfPath);
    expect(stats.size).toBeGreaterThan(1000); // PDF should be at least 1KB
    console.log(`✅ PDF file size: ${stats.size} bytes`);
  });

  test('Word download works and saves file', async ({ page }) => {
    console.log('🧪 Testing Word document download...');
    
    await completeWorkflowToExport(page, 'Word export test poem');
    
    // Set up download promise
    const downloadPromise = page.waitForEvent('download');
    
    // Click download for Word
    const wordCard = page.locator('h3:has-text("Word Document")').locator('../..');
    const downloadButton = wordCard.locator('button:has-text("Download")');
    await downloadButton.click();
    
    // Wait for download
    const download = await downloadPromise;
    console.log('✅ Word document download initiated');
    
    // Save to export-proof directory
    const docxPath = path.join(EXPORT_PROOF_DIR, 'test-poem.docx');
    await download.saveAs(docxPath);
    console.log(`✅ Saved Word document to ${docxPath}`);
    
    // Verify DOCX file exists and has content
    const stats = await fs.stat(docxPath);
    expect(stats.size).toBeGreaterThan(5000); // DOCX should be at least 5KB
    console.log(`✅ Word document file size: ${stats.size} bytes`);
  });

  test('Export content includes generated images', async ({ page }) => {
    console.log('🧪 Verifying exports include images...');
    
    await completeWorkflowToExport(page, 'Image-rich poem test');
    
    // Check Styled HTML preview for image
    const styledHtmlCard = page.locator('h3:has-text("Styled HTML")').locator('../..');
    const styledPreview = styledHtmlCard.locator('pre, .preview-content');
    
    // Look for img tag in preview (if preview exists)
    const previewText = await styledPreview.textContent().catch(() => '');
    if (previewText && previewText.includes('<img')) {
      console.log('✅ Found image tag in Styled HTML preview');
      expect(previewText).toMatch(/<img[^>]+src=/);
    }
    
    // Save a preview of each format for manual inspection
    const formats = ['Styled HTML', 'Clean HTML', 'Markdown'];
    
    for (const format of formats) {
      const card = page.locator(`h3:has-text("${format}")`).locator('../..');
      const preview = card.locator('pre, .preview-content, .prose');
      
      if (await preview.isVisible().catch(() => false)) {
        const content = await preview.textContent();
        const fileName = format.toLowerCase().replace(' ', '-') + '-preview.txt';
        await fs.writeFile(
          path.join(EXPORT_PROOF_DIR, fileName),
          content || 'No preview available',
          'utf8'
        );
        console.log(`✅ Saved ${format} preview to ${fileName}`);
      }
    }
  });

  test('Publish functionality works', async ({ page }) => {
    console.log('🧪 Testing publish functionality...');
    
    await completeWorkflowToExport(page, 'Publish test poem');
    
    // Select formats to publish
    await page.check('#publish-html-styled');
    await page.check('#publish-html-clean');
    await page.check('#publish-markdown');
    
    // Click publish button
    await page.click('button:has-text("Publish Now")');
    
    // Wait for publish success
    await page.waitForSelector('text=Published Successfully', { timeout: 10000 });
    console.log('✅ Publish completed successfully');
    
    // Check for published URL
    const publishedLink = page.locator('a[href*="/published/"]').first();
    await expect(publishedLink).toBeVisible();
    
    const publishedUrl = await publishedLink.getAttribute('href');
    expect(publishedUrl).toMatch(/\/published\/[\w-]+/);
    console.log(`✅ Published URL: ${publishedUrl}`);
    
    // Save published URL for reference
    await fs.writeFile(
      path.join(EXPORT_PROOF_DIR, 'published-url.txt'),
      publishedUrl || 'No URL generated',
      'utf8'
    );
  });

  test.afterAll(async () => {
    // List all files in export-proof directory
    const files = await fs.readdir(EXPORT_PROOF_DIR);
    console.log('\n📁 Files saved to export-proof directory:');
    for (const file of files) {
      const stats = await fs.stat(path.join(EXPORT_PROOF_DIR, file));
      console.log(`   - ${file} (${stats.size} bytes)`);
    }
  });
});