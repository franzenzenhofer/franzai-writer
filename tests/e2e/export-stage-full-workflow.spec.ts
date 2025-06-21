import { test, expect } from '@playwright/test';

test.describe('Export Stage Full Workflow Test', () => {
  test('should complete entire poem workflow and test all export functionality', async ({ page }) => {
    console.log('Starting export stage full workflow test');
    
    // Start from the homepage
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    console.log('Navigated to homepage');
    
    // Click on Poem Generator
    await page.click('text=Poem Generator');
    await page.waitForURL('**/w/poem/**');
    console.log('Started new poem document');
    
    // Get the document ID from URL for later
    const url = page.url();
    const documentId = url.split('/').pop();
    console.log('Document ID:', documentId);
    
    // Stage 1: Poem Topic
    await page.waitForSelector('#process-stage-poem-topic', { timeout: 10000 });
    await page.fill('textarea[name="topic"]', 'A beautiful sunset over the ocean with dolphins jumping');
    await page.click('#process-stage-poem-topic');
    console.log('Submitted poem topic');
    
    // Wait for poem topic to complete
    await page.waitForSelector('[data-testid="stage-card-poem-topic"] svg.text-green-500', { timeout: 60000 });
    console.log('Poem topic stage completed');
    
    // Stage 2: Image Briefing (should auto-run)
    await page.waitForSelector('[data-testid="stage-card-image-briefing"] svg.text-green-500', { timeout: 60000 });
    console.log('Image briefing stage completed');
    
    // Stage 3: HTML Briefing (should auto-run)
    await page.waitForSelector('[data-testid="stage-card-html-briefing"] svg.text-green-500', { timeout: 60000 });
    console.log('HTML briefing stage completed');
    
    // Stage 4: Export Stage
    console.log('Starting export stage test');
    await page.waitForSelector('#trigger-export-export-publish', { timeout: 10000 });
    
    // Click the Export & Publish button
    await page.click('#trigger-export-export-publish');
    console.log('Clicked Export & Publish button');
    
    // Wait for export to complete (look for the export preview)
    await page.waitForSelector('.export-preview', { timeout: 120000 });
    console.log('Export stage completed - preview visible');
    
    // Verify all export formats are available
    await expect(page.locator('text=HTML (Styled)')).toBeVisible();
    await expect(page.locator('text=HTML (Clean)')).toBeVisible();
    await expect(page.locator('text=Markdown')).toBeVisible();
    await expect(page.locator('text=PDF')).toBeVisible();
    await expect(page.locator('text=Word')).toBeVisible();
    console.log('All export formats are available');
    
    // Test Copy Styled HTML
    const copyStyledButton = page.locator('button:has-text("Copy"):near(text=HTML \\(Styled\\))').first();
    await copyStyledButton.click();
    console.log('Clicked Copy for Styled HTML');
    
    // Test Copy Clean HTML
    const copyCleanButton = page.locator('button:has-text("Copy"):near(text=HTML \\(Clean\\))').first();
    await copyCleanButton.click();
    console.log('Clicked Copy for Clean HTML');
    
    // Test Copy Markdown
    const copyMarkdownButton = page.locator('button:has-text("Copy"):near(text=Markdown)').first();
    await copyMarkdownButton.click();
    console.log('Clicked Copy for Markdown');
    
    // Create export-proof directory
    const fs = require('fs');
    const path = require('path');
    const exportDir = path.join(process.cwd(), 'export-proof');
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }
    
    // Test Download PDF
    const downloadPromisePdf = page.waitForEvent('download');
    await page.locator('button:has-text("Download"):near(text=PDF)').first().click();
    const downloadPdf = await downloadPromisePdf;
    await downloadPdf.saveAs(path.join(exportDir, 'test-poem.pdf'));
    console.log('Downloaded PDF to export-proof/test-poem.pdf');
    
    // Test Download Word
    const downloadPromiseWord = page.waitForEvent('download');
    await page.locator('button:has-text("Download"):near(text=Word)').first().click();
    const downloadWord = await downloadPromiseWord;
    await downloadWord.saveAs(path.join(exportDir, 'test-poem.docx'));
    console.log('Downloaded Word to export-proof/test-poem.docx');
    
    // Test Publish functionality
    await page.waitForSelector('text=Publish to Web', { timeout: 10000 });
    
    // Select formats to publish
    await page.check('#publish-html-styled');
    await page.check('#publish-html-clean');
    await page.check('#publish-markdown');
    console.log('Selected all formats for publishing');
    
    // Click Publish Now
    await page.click('button:has-text("Publish Now")');
    console.log('Clicked Publish Now');
    
    // Wait for published confirmation
    await page.waitForSelector('text=Published Successfully!', { timeout: 30000 });
    console.log('Content published successfully');
    
    // Verify published URLs are displayed
    await expect(page.locator('text=Styled HTML:')).toBeVisible();
    await expect(page.locator('text=Clean HTML:')).toBeVisible();
    await expect(page.locator('text=Markdown:')).toBeVisible();
    
    // Get published URL
    const publishedUrlElement = await page.locator('a[href*="/published/"]').first();
    const publishedUrl = await publishedUrlElement.getAttribute('href');
    console.log('Published URL:', publishedUrl);
    
    // Test that published URL is accessible
    if (publishedUrl) {
      const response = await page.request.get(publishedUrl);
      expect(response.status()).toBe(200);
      console.log('Published URL is accessible');
    }
    
    // Test reload persistence
    console.log('Testing reload persistence...');
    await page.reload({ waitUntil: 'domcontentloaded' });
    
    // Wait for export stage to load
    await page.waitForSelector('[data-testid="stage-card-export-publish"]', { timeout: 10000 });
    
    // Verify export stage is still completed
    await expect(page.locator('[data-testid="stage-card-export-publish"] svg.text-green-500')).toBeVisible();
    console.log('Export stage persisted after reload');
    
    // Verify published URL is still displayed
    await expect(page.locator('text=Published Successfully!')).toBeVisible();
    console.log('Published state persisted after reload');
    
    console.log('Export stage full workflow test completed successfully!');
  });
});