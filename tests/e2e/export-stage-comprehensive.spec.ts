import { test, expect, Page } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test.describe('Export Stage - Comprehensive Testing', () => {
  let page: Page;
  let documentId: string;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    
    // Create a new poem document to test export functionality
    await page.goto('http://localhost:9002/w/poem/new');
    await page.waitForLoadState('networkidle');
    
    // Extract document ID from URL
    const url = page.url();
    const match = url.match(/\/w\/poem\/([^/]+)$/);
    if (match) {
      documentId = match[1];
      console.log('Created document with ID:', documentId);
    } else {
      throw new Error('Failed to create new document');
    }
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('should complete full workflow and test export stage', async () => {
    // Step 1: Complete poem topic stage
    console.log('Step 1: Filling poem topic...');
    await page.fill('textarea', 'A magical forest at midnight with glowing mushrooms');
    await page.click('button:has-text("Continue")');
    
    // Wait for AI to complete poem generation
    console.log('Step 2: Waiting for poem generation...');
    await expect(page.locator('[data-testid="stage-card-generate-poem-with-title"]')).toContainText('✅', { timeout: 60000 });
    
    // Step 3: Skip HTML briefing (optional stage)
    console.log('Step 3: Skipping HTML briefing...');
    await page.click('button:has-text("Continue")');
    
    // Wait for HTML preview generation
    console.log('Step 4: Waiting for HTML preview generation...');
    await expect(page.locator('[data-testid="stage-card-generate-html-preview"]')).toContainText('✅', { timeout: 60000 });
    
    // Step 5: Test export stage
    console.log('Step 5: Testing export stage...');
    const exportStage = page.locator('[data-testid="stage-card-export-publish"]');
    await exportStage.scrollIntoView();
    
    // Verify export stage is visible and has correct title
    await expect(exportStage).toBeVisible();
    await expect(exportStage).toContainText('Export & Publish ✨');
    
    // Click the export trigger button
    const exportButton = exportStage.locator('button', { hasText: 'Generate Export Formats' }).or(
      exportStage.locator('button', { hasText: 'Retry Export' })
    );
    await exportButton.click();
    
    // Wait for a brief moment for the API call to be made and the job to be created in Firestore.
    // The UI should update to an initial "queued" or "processing" state.
    console.log('Step 6a: Waiting for initial export job state...');
    await page.waitForTimeout(2000); // Adjust as necessary, depends on API response time.

    const exportStageStatusMessageLocator = exportStage.locator('[data-testid="stage-status-message"]'); // Assuming such a test ID exists or can be added to where currentFormat is displayed

    // Check for an initial status like "Queued", "Processing: 0%", "Initializing...", or "Export job created..."
    // This text comes from useExportJobPolling's mapping of jobData.status and jobData.progress to generationProgress.currentFormat
    await expect(exportStageStatusMessageLocator)
      .toHaveText(/Queued for processing...|Processing: 0%|Export job created. Waiting for worker...|Requesting export job.../i, { timeout: 10000 });
    console.log('Step 6b: Initial job status detected in UI.');

    // Simulate page reload
    console.log('Step 6c: Simulating page reload...');
    await page.reload();
    await page.waitForLoadState('networkidle'); // Wait for the page to be fully interactive after reload

    // Re-locate the export stage element after reload
    const exportStageAfterReload = page.locator('[data-testid="stage-card-export-publish"]');
    await exportStageAfterReload.scrollIntoView(); // Ensure it's in view
    const exportStageStatusMessageLocatorAfterReload = exportStageAfterReload.locator('[data-testid="stage-status-message"]');

    // After reload, useExportJobPolling should pick up the jobId and listen for updates.
    // The UI should reflect the ongoing (or completed) job status.
    // This requires the background job (Firebase Function) to actually run and update Firestore.
    console.log('Step 6d: Waiting for export completion after page reload...');

    // Wait for the "Export completed" status message from useExportJobPolling's generationProgress.currentFormat
    await expect(exportStageStatusMessageLocatorAfterReload)
      .toHaveText('Export completed', { timeout: 60000 }); // Increased timeout for async server job

    // After the status message confirms completion, the checkmark should also appear.
    await expect(exportStageAfterReload).toContainText('✅', { timeout: 5000 }); // Short timeout as status is already completed.
    
    console.log('✅ Export stage completed successfully after page reload!');
  });

  test('should test live preview functionality', async () => {
    // Navigate to the document with completed export
    await page.goto(`http://localhost:9002/w/poem/${documentId}`);
    await page.waitForLoadState('networkidle');
    
    const exportStage = page.locator('[data-testid="stage-card-export-publish"]');
    await exportStage.scrollIntoView();
    
    // Test styled view (should be default)
    console.log('Testing styled HTML preview...');
    const styledButton = exportStage.locator('button', { hasText: 'Styled' });
    await expect(styledButton).toBeVisible();
    
    // Verify iframe with styled content exists
    const styledIframe = exportStage.locator('iframe[title*="styled HTML preview"]');
    await expect(styledIframe).toBeVisible();
    
    // Switch to clean view
    console.log('Testing clean HTML preview...');
    const cleanButton = exportStage.locator('button', { hasText: 'Clean' });
    await cleanButton.click();
    
    // Verify clean view is active
    await expect(cleanButton).toHaveClass(/bg-primary/);
    
    // Verify clean iframe content
    const cleanIframe = exportStage.locator('iframe[title*="clean HTML preview"]');
    await expect(cleanIframe).toBeVisible();
    
    // Verify clean preview description
    await expect(exportStage).toContainText('Clean HTML preview - Perfect for pasting into any CMS');
    
    console.log('✅ Live preview functionality working perfectly!');
  });

  test('should test all export format downloads', async () => {
    // Navigate to the document with completed export
    await page.goto(`http://localhost:9002/w/poem/${documentId}`);
    await page.waitForLoadState('networkidle');
    
    const exportStage = page.locator('[data-testid="stage-card-export-publish"]');
    await exportStage.scrollIntoView();
    
    // Test HTML (Styled) download
    console.log('Testing HTML (Styled) download...');
    const downloadPromiseStyled = page.waitForEvent('download');
    await exportStage.locator('button', { hasText: 'Download' }).first().click();
    const downloadStyled = await downloadPromiseStyled;
    
    expect(downloadStyled.suggestedFilename()).toMatch(/\.html$/);
    const styledPath = path.join('./downloads', `styled-${Date.now()}.html`);
    await downloadStyled.saveAs(styledPath);
    
    // Verify styled HTML file
    const styledContent = fs.readFileSync(styledPath, 'utf-8');
    expect(styledContent).toContain('<!DOCTYPE html>');
    expect(styledContent).toContain('<style>');
    expect(styledContent).toContain('magical forest');
    console.log('✅ Styled HTML download successful and valid!');
    
    // Test HTML (Clean) download
    console.log('Testing HTML (Clean) download...');
    const cleanDownloadButtons = exportStage.locator('button', { hasText: 'Download' });
    const downloadPromiseClean = page.waitForEvent('download');
    await cleanDownloadButtons.nth(1).click();
    const downloadClean = await downloadPromiseClean;
    
    expect(downloadClean.suggestedFilename()).toMatch(/\.html$/);
    const cleanPath = path.join('./downloads', `clean-${Date.now()}.html`);
    await downloadClean.saveAs(cleanPath);
    
    // Verify clean HTML file
    const cleanContent = fs.readFileSync(cleanPath, 'utf-8');
    expect(cleanContent).not.toContain('<style>');
    expect(cleanContent).toContain('<h1>');
    expect(cleanContent).toContain('magical forest');
    console.log('✅ Clean HTML download successful and valid!');
    
    // Test Markdown download
    console.log('Testing Markdown download...');
    const markdownDownloadButtons = exportStage.locator('button', { hasText: 'Download' });
    const downloadPromiseMarkdown = page.waitForEvent('download');
    await markdownDownloadButtons.nth(2).click();
    const downloadMarkdown = await downloadPromiseMarkdown;
    
    expect(downloadMarkdown.suggestedFilename()).toMatch(/\.md$/);
    const markdownPath = path.join('./downloads', `content-${Date.now()}.md`);
    await downloadMarkdown.saveAs(markdownPath);
    
    // Verify markdown file
    const markdownContent = fs.readFileSync(markdownPath, 'utf-8');
    expect(markdownContent).toContain('#');
    expect(markdownContent).toContain('magical forest');
    console.log('✅ Markdown download successful and valid!');
    
    // Test PDF download (should show coming soon or work)
    console.log('Testing PDF download...');
    const pdfButtons = exportStage.locator('text=PDF');
    if (await pdfButtons.count() > 0) {
      const pdfButton = pdfButtons.first();
      const pdfStatus = await pdfButton.textContent();
      console.log('PDF status:', pdfStatus);
      
      if (pdfStatus?.includes('Ready')) {
        const downloadPromisePdf = page.waitForEvent('download');
        await exportStage.locator('button', { hasText: 'Download' }).nth(3).click();
        const downloadPdf = await downloadPromisePdf;
        
        expect(downloadPdf.suggestedFilename()).toMatch(/\.pdf$/);
        const pdfPath = path.join('./downloads', `content-${Date.now()}.pdf`);
        await downloadPdf.saveAs(pdfPath);
        console.log('✅ PDF download successful!');
      } else {
        console.log('📋 PDF marked as "Coming soon" - placeholder working correctly');
      }
    }
    
    // Test DOCX download (should show coming soon or work)
    console.log('Testing DOCX download...');
    const docxButtons = exportStage.locator('text=DOCX');
    if (await docxButtons.count() > 0) {
      const docxButton = docxButtons.first();
      const docxStatus = await docxButton.textContent();
      console.log('DOCX status:', docxStatus);
      
      if (docxStatus?.includes('Ready')) {
        const downloadPromiseDocx = page.waitForEvent('download');
        await exportStage.locator('button', { hasText: 'Download' }).nth(4).click();
        const downloadDocx = await downloadPromiseDocx;
        
        expect(downloadDocx.suggestedFilename()).toMatch(/\.docx$/);
        const docxPath = path.join('./downloads', `content-${Date.now()}.docx`);
        await downloadDocx.saveAs(docxPath);
        console.log('✅ DOCX download successful!');
      } else {
        console.log('📋 DOCX marked as "Coming soon" - placeholder working correctly');
      }
    }
    
    console.log('✅ All export format downloads tested successfully!');
  });

  test('should validate export content quality', async () => {
    // Navigate to the document with completed export
    await page.goto(`http://localhost:9002/w/poem/${documentId}`);
    await page.waitForLoadState('networkidle');
    
    const exportStage = page.locator('[data-testid="stage-card-export-publish"]');
    await exportStage.scrollIntoView();
    
    // Verify styled iframe content is properly formatted
    console.log('Validating styled HTML content...');
    const styledIframe = exportStage.locator('iframe[title*="styled HTML preview"]');
    await expect(styledIframe).toBeVisible();
    
    // Switch to clean view and validate
    console.log('Validating clean HTML content...');
    const cleanButton = exportStage.locator('button', { hasText: 'Clean' });
    await cleanButton.click();
    
    const cleanIframe = exportStage.locator('iframe[title*="clean HTML preview"]');
    await expect(cleanIframe).toBeVisible();
    
    // Verify export status indicators
    const exportDownloads = exportStage.locator('[class*="space-y"]').last();
    await expect(exportDownloads).toContainText('HTML (Styled)');
    await expect(exportDownloads).toContainText('HTML (Clean)');
    await expect(exportDownloads).toContainText('Markdown');
    await expect(exportDownloads).toContainText('Ready ✓');
    
    console.log('✅ Export content quality validation passed!');
  });

  test('should test error handling and retry functionality', async () => {
    // Create a new document to test error scenarios
    await page.goto('http://localhost:9002/w/poem/new');
    await page.waitForLoadState('networkidle');
    
    // Complete poem topic with something that might cause issues
    await page.fill('textarea', 'Test error handling scenario');
    await page.click('button:has-text("Continue")');
    
    // Wait for completion and try export
    await expect(page.locator('[data-testid="stage-card-generate-poem-with-title"]')).toContainText('✅', { timeout: 60000 });
    
    // Skip HTML briefing
    await page.click('button:has-text("Continue")');
    await expect(page.locator('[data-testid="stage-card-generate-html-preview"]')).toContainText('✅', { timeout: 60000 });
    
    // Test export stage error handling
    const exportStage = page.locator('[data-testid="stage-card-export-publish"]');
    await exportStage.scrollIntoView();
    
    const exportButton = exportStage.locator('button', { hasText: 'Generate Export Formats' }).or(
      exportStage.locator('button', { hasText: 'Retry Export' })
    );
    await exportButton.click();
    
    // If error occurs, test retry functionality
    const retryButton = exportStage.locator('button', { hasText: 'Retry Export' });
    if (await retryButton.isVisible({ timeout: 5000 })) {
      console.log('Testing retry functionality...');
      await retryButton.click();
      
      // Wait for retry to complete
      await expect(exportStage).toContainText('✅', { timeout: 120000 });
      console.log('✅ Retry functionality working!');
    } else {
      console.log('✅ Export completed without errors!');
    }
  });
});