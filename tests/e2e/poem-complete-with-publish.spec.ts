import { test, expect } from '@playwright/test';

test.describe('Poem Complete Workflow with Publishing', () => {
  test.skip(({ browserName }) => browserName !== 'chromium', 'Chrome only per CLAUDE.md');
  
  test('Complete poem workflow - skip optional stages and publish', async ({ page }) => {
    console.log('🚀 Starting poem workflow with skip optional and publish...');
    
    // Go to poem workflow
    await page.goto('http://localhost:9002/w/poem-generator/new');
    await page.waitForLoadState('networkidle');
    
    // Stage 1: Enter poem topic
    await page.fill('textarea[placeholder*="Compose a heartfelt poem"]', 'The beauty of a sunrise over mountains');
    await page.click('#process-stage-poem-topic');
    
    // Stage 2: Wait for poem generation
    await page.waitForSelector('[data-testid="stage-card-generate-poem-with-title"] .text-green-600:has-text("Completed")', { 
      timeout: 30000 
    });
    console.log('✅ Poem generated');
    
    // Stage 3: Skip optional image briefing - go with defaults
    await page.click('#process-stage-image-briefing');
    
    // Stage 4: Wait for image prompt creation (should autorun)
    await page.waitForSelector('[data-testid="stage-card-create-image-prompt"] .text-green-600:has-text("Completed")', { 
      timeout: 30000 
    });
    console.log('✅ Image prompt created');
    
    // Stage 5: Wait for image generation (should autorun)
    await page.waitForSelector('[data-testid="stage-card-generate-poem-image"] img', { 
      timeout: 60000 
    });
    console.log('✅ Image generated');
    
    // Stage 6: Skip optional HTML briefing
    // HTML preview should be ACTIVE now but NOT autorun (needs both dependencies)
    const htmlPreviewButton = page.locator('#process-stage-generate-html-preview');
    await expect(htmlPreviewButton).toBeVisible({ timeout: 5000 });
    console.log('✅ HTML preview is active (can be manually triggered)');
    
    // Manually trigger HTML preview since we skipped HTML briefing
    await htmlPreviewButton.click();
    
    // Wait for HTML preview to complete
    await page.waitForSelector('[data-testid="stage-card-generate-html-preview"] .text-green-600:has-text("Completed")', { 
      timeout: 30000 
    });
    console.log('✅ HTML preview generated');
    
    // Stage 7: Export & Publish
    await page.click('#trigger-export-export-publish');
    
    // Wait for export interface to load
    await page.waitForSelector('h3:has-text("Styled HTML")', { timeout: 30000 });
    console.log('✅ Export interface loaded');
    
    // Wait for all formats to be ready
    await page.waitForSelector('.text-green-600:has-text("Ready")', { timeout: 60000 });
    
    // Verify all formats are ready
    const readyFormats = await page.locator('.text-green-600:has-text("Ready")').count();
    expect(readyFormats).toBeGreaterThanOrEqual(3); // At least HTML styled, clean, and markdown
    console.log(`✅ ${readyFormats} formats ready for export`);
    
    // Click publish button
    const publishButton = page.locator('button:has-text("Publish Document")');
    await publishButton.click();
    
    // Wait for publishing to complete
    await page.waitForSelector('text=Published successfully', { timeout: 30000 });
    console.log('✅ Document published successfully');
    
    // Get published URLs
    const publishedUrlElement = await page.locator('a[href*="franzai-writer"]').first();
    const publishedUrl = await publishedUrlElement.getAttribute('href');
    console.log(`📎 Published URL: ${publishedUrl}`);
    
    // Verify the URL works
    if (publishedUrl) {
      const response = await page.request.get(publishedUrl);
      expect(response.status()).toBe(200);
      console.log('✅ Published URL is accessible');
    }
    
    // Get document ID for reference
    const url = page.url();
    const documentId = url.split('/').pop();
    console.log(`📄 Document ID: ${documentId}`);
    
    console.log('🎉 Poem workflow completed with publishing!');
  });
  
  test('Complete poem workflow - with optional stages and publish', async ({ page }) => {
    console.log('🚀 Starting poem workflow with ALL optional stages...');
    
    // Go to poem workflow  
    await page.goto('http://localhost:9002/w/poem-generator/new');
    await page.waitForLoadState('networkidle');
    
    // Stage 1: Enter poem topic
    await page.fill('textarea[placeholder*="Compose a heartfelt poem"]', 'The mystery of ocean waves at night');
    await page.click('#process-stage-poem-topic');
    
    // Stage 2: Wait for poem generation
    await page.waitForSelector('[data-testid="stage-card-generate-poem-with-title"] .text-green-600:has-text("Completed")', { 
      timeout: 30000 
    });
    console.log('✅ Poem generated');
    
    // Stage 3: Customize image settings
    await page.fill('textarea[name="additionalPrompt"]', 'mystical atmosphere with bioluminescence');
    await page.selectOption('select[name="aspectRatio"]', '16:9');
    await page.selectOption('select[name="style"]', 'photorealistic');
    await page.selectOption('select[name="numberOfImages"]', '2');
    await page.click('#process-stage-image-briefing');
    console.log('✅ Image settings customized');
    
    // Stage 4: Wait for image prompt creation (should autorun)
    await page.waitForSelector('[data-testid="stage-card-create-image-prompt"] .text-green-600:has-text("Completed")', { 
      timeout: 30000 
    });
    console.log('✅ Image prompt created');
    
    // Stage 5: Wait for image generation (should autorun)
    await page.waitForSelector('[data-testid="stage-card-generate-poem-image"] img', { 
      timeout: 60000 
    });
    console.log('✅ Images generated');
    
    // Stage 6: Add HTML briefing
    await page.fill('#stage-html-briefing textarea', 'Use a dark theme with ocean colors');
    await page.click('#process-stage-html-briefing');
    console.log('✅ HTML briefing added');
    
    // HTML preview should AUTORUN now (both dependencies met)
    await page.waitForSelector('[data-testid="stage-card-generate-html-preview"] .text-green-600:has-text("Completed")', { 
      timeout: 30000 
    });
    console.log('✅ HTML preview auto-generated');
    
    // Stage 7: Export & Publish
    await page.click('#trigger-export-export-publish');
    
    // Wait for export interface
    await page.waitForSelector('h3:has-text("Styled HTML")', { timeout: 30000 });
    
    // Wait for formats to be ready
    await page.waitForSelector('.text-green-600:has-text("Ready")', { timeout: 60000 });
    
    // Publish
    await page.click('button:has-text("Publish Document")');
    await page.waitForSelector('text=Published successfully', { timeout: 30000 });
    
    // Get URLs
    const urls = await page.locator('a[href*="franzai-writer"]').allTextContents();
    console.log('📎 Published URLs:', urls);
    
    console.log('🎉 Poem workflow with all stages completed!');
  });
});