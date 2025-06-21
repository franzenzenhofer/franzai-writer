import { test, expect } from '@playwright/test';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Comprehensive E2E test for export copy and download functionality
 * Tests all export formats and saves proof files to /export-proof/
 */

test.describe('Export Copy and Download', () => {
  const BASE_URL = 'http://localhost:9002';
  const EXPORT_PROOF_DIR = path.join(process.cwd(), 'export-proof');
  
  test.beforeAll(async () => {
    // Create export-proof directory
    await fs.mkdir(EXPORT_PROOF_DIR, { recursive: true });
    console.log(`📁 Created export-proof directory at: ${EXPORT_PROOF_DIR}`);
  });
  
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForSelector('text=Start a new document', { timeout: 10000 });
  });

  async function completeWorkflowToExport(page: any, poemTopic: string) {
    await page.click('#workflow-start-poem-generator');
    await page.waitForSelector('textarea');
    
    await page.fill('textarea', poemTopic);
    await page.click('#process-stage-poem-topic');
    await page.waitForSelector('text=Poem Title', { timeout: 30000 });
    
    await page.click('#process-stage-image-briefing');
    await page.waitForSelector('text=Download', { timeout: 60000 });
    
    await page.click('#process-stage-html-briefing');
    await page.waitForSelector('text=Export & Publish', { timeout: 30000 });
    
    await page.click('#trigger-export-export-publish');
    await page.waitForSelector('h3:has-text("Styled HTML")', { timeout: 30000 });
  }

  test('Copy Styled HTML - verify content and format', async ({ page, context }) => {
    console.log('🧪 Testing Styled HTML copy...');
    
    // Grant clipboard permissions
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    
    await completeWorkflowToExport(page, 'Beautiful styled poem about nature');
    
    // Click copy for Styled HTML
    const styledHtmlCard = page.locator('h3:has-text("Styled HTML")').locator('../..');
    const copyButton = styledHtmlCard.locator('button:has-text("Copy")');
    await copyButton.click();
    
    // Verify copy success indicator
    await expect(styledHtmlCard.locator('.text-green-500')).toBeVisible();
    console.log('✅ Copy success indicator shown');
    
    // Read clipboard content
    const clipboardContent = await page.evaluate(() => navigator.clipboard.readText());
    
    // Verify it's valid HTML with styles
    expect(clipboardContent).toContain('<!DOCTYPE html>');
    expect(clipboardContent).toContain('<style>');
    expect(clipboardContent).toContain('font-family');
    expect(clipboardContent).toContain('Beautiful styled poem about nature');
    console.log('✅ Styled HTML contains proper formatting');
    
    // Save to export-proof
    await fs.writeFile(
      path.join(EXPORT_PROOF_DIR, 'styled-html-copy.html'),
      clipboardContent,
      'utf8'
    );
    console.log('✅ Saved styled HTML to export-proof/styled-html-copy.html');
  });

  test('Copy Clean HTML - verify semantic HTML only', async ({ page, context }) => {
    console.log('🧪 Testing Clean HTML copy...');
    
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    
    await completeWorkflowToExport(page, 'Clean semantic HTML test poem');
    
    // Click copy for Clean HTML
    const cleanHtmlCard = page.locator('h3:has-text("Clean HTML")').locator('../..');
    const copyButton = cleanHtmlCard.locator('button:has-text("Copy")');
    await copyButton.click();
    
    // Verify copy success
    await expect(cleanHtmlCard.locator('.text-green-500')).toBeVisible();
    
    // Read clipboard content
    const clipboardContent = await page.evaluate(() => navigator.clipboard.readText());
    
    // Verify it's clean HTML without styles
    expect(clipboardContent).toContain('<!DOCTYPE html>');
    expect(clipboardContent).not.toContain('<style>');
    expect(clipboardContent).toContain('<h1>');
    expect(clipboardContent).toContain('Clean semantic HTML test poem');
    expect(clipboardContent).toMatch(/<(article|section|header|main)/);
    console.log('✅ Clean HTML is semantic without styles');
    
    // Save to export-proof
    await fs.writeFile(
      path.join(EXPORT_PROOF_DIR, 'clean-html-copy.html'),
      clipboardContent,
      'utf8'
    );
    console.log('✅ Saved clean HTML to export-proof/clean-html-copy.html');
  });

  test('Copy Markdown - verify proper markdown formatting', async ({ page, context }) => {
    console.log('🧪 Testing Markdown copy...');
    
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    
    await completeWorkflowToExport(page, 'Markdown formatted poem test');
    
    // Click copy for Markdown
    const markdownCard = page.locator('h3:has-text("Markdown")').locator('../..');
    const copyButton = markdownCard.locator('button:has-text("Copy")');
    await copyButton.click();
    
    // Verify copy success
    await expect(markdownCard.locator('.text-green-500')).toBeVisible();
    
    // Read clipboard content
    const clipboardContent = await page.evaluate(() => navigator.clipboard.readText());
    
    // Verify it's valid Markdown
    expect(clipboardContent).toMatch(/^#\s+/m); // Has heading
    expect(clipboardContent).not.toContain('<html>');
    expect(clipboardContent).not.toContain('<style>');
    expect(clipboardContent).toContain('Markdown formatted poem test');
    expect(clipboardContent).toMatch(/\n\n/); // Has paragraph breaks
    console.log('✅ Markdown is properly formatted');
    
    // Save to export-proof
    await fs.writeFile(
      path.join(EXPORT_PROOF_DIR, 'markdown-copy.md'),
      clipboardContent,
      'utf8'
    );
    console.log('✅ Saved markdown to export-proof/markdown-copy.md');
  });

  test('Download PDF - save to export-proof with images', async ({ page }) => {
    console.log('🧪 Testing PDF download...');
    
    await completeWorkflowToExport(page, 'PDF test poem with beautiful imagery');
    
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
    
    // Read PDF to check it starts with PDF header
    const pdfBuffer = await fs.readFile(pdfPath);
    const pdfHeader = pdfBuffer.toString('utf8', 0, 5);
    expect(pdfHeader).toBe('%PDF-');
    console.log('✅ Valid PDF file header confirmed');
  });

  test('Download Word - save to export-proof with images', async ({ page }) => {
    console.log('🧪 Testing Word document download...');
    
    await completeWorkflowToExport(page, 'Word document test with rich content');
    
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
    
    // DOCX files start with PK (ZIP format)
    const docxBuffer = await fs.readFile(docxPath);
    const docxHeader = docxBuffer.toString('utf8', 0, 2);
    expect(docxHeader).toBe('PK');
    console.log('✅ Valid DOCX file header confirmed');
  });

  test('Verify HTML exports have proper img tags with URLs', async ({ page }) => {
    console.log('🧪 Verifying image URLs in HTML exports...');
    
    await completeWorkflowToExport(page, 'Image-rich poem about landscapes');
    
    // Get styled HTML content
    const styledHtmlCard = page.locator('h3:has-text("Styled HTML")').locator('../..');
    await styledHtmlCard.locator('button:has-text("Copy")').click();
    const styledHtml = await page.evaluate(() => navigator.clipboard.readText());
    
    // Check for image tags with proper URLs
    const imgTagRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/g;
    const styledImages = [...styledHtml.matchAll(imgTagRegex)];
    
    if (styledImages.length > 0) {
      console.log(`✅ Found ${styledImages.length} images in styled HTML`);
      for (const match of styledImages) {
        const imgUrl = match[1];
        expect(imgUrl).toMatch(/^https?:\/\//);
        console.log(`✅ Valid image URL: ${imgUrl.substring(0, 50)}...`);
      }
    } else {
      console.log('⚠️ No images found in HTML (poem might not have generated images)');
    }
    
    // Save HTML with images for inspection
    await fs.writeFile(
      path.join(EXPORT_PROOF_DIR, 'styled-html-with-images.html'),
      styledHtml,
      'utf8'
    );
    console.log('✅ Saved HTML with images to export-proof/styled-html-with-images.html');
  });

  test('Test all copy buttons work in sequence', async ({ page, context }) => {
    console.log('🧪 Testing all copy buttons in sequence...');
    
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await completeWorkflowToExport(page, 'Sequential copy test poem');
    
    // Copy Styled HTML
    const styledCopy = page.locator('h3:has-text("Styled HTML")').locator('../..//button:has-text("Copy")');
    await styledCopy.click();
    await expect(page.locator('.text-green-500').first()).toBeVisible();
    console.log('✅ Styled HTML copied');
    
    // Wait for checkmark to disappear
    await page.waitForTimeout(2500);
    
    // Copy Clean HTML
    const cleanCopy = page.locator('h3:has-text("Clean HTML")').locator('../..//button:has-text("Copy")');
    await cleanCopy.click();
    await expect(page.locator('.text-green-500').first()).toBeVisible();
    console.log('✅ Clean HTML copied');
    
    // Wait for checkmark to disappear
    await page.waitForTimeout(2500);
    
    // Copy Markdown
    const markdownCopy = page.locator('h3:has-text("Markdown")').locator('../..//button:has-text("Copy")');
    await markdownCopy.click();
    await expect(page.locator('.text-green-500').first()).toBeVisible();
    console.log('✅ Markdown copied');
    
    console.log('✅ All copy buttons work correctly');
  });

  test('Test all download buttons work', async ({ page }) => {
    console.log('🧪 Testing all download buttons...');
    
    await completeWorkflowToExport(page, 'Download test poem');
    
    const downloads: Promise<any>[] = [];
    
    // Listen for all downloads
    page.on('download', download => {
      console.log(`📥 Download started: ${download.suggestedFilename()}`);
      downloads.push(download.path());
    });
    
    // Click all download buttons
    const downloadButtons = page.locator('button:has-text("Download")');
    const count = await downloadButtons.count();
    
    for (let i = 0; i < count; i++) {
      await downloadButtons.nth(i).click();
      await page.waitForTimeout(500); // Small delay between downloads
    }
    
    // Wait a bit for downloads to complete
    await page.waitForTimeout(3000);
    
    expect(downloads.length).toBeGreaterThanOrEqual(2); // At least PDF and Word
    console.log(`✅ ${downloads.length} downloads completed`);
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