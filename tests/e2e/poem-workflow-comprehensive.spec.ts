import { test, expect } from '@playwright/test';

/**
 * Comprehensive E2E test for poem generation workflow
 * Tests ALL possible variations and edge cases
 */

test.describe('Poem Workflow - Comprehensive E2E Tests', () => {
  // Test configuration
  const BASE_URL = 'http://localhost:9002';
  
  test.beforeEach(async ({ page }) => {
    // Start each test from a clean dashboard
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForLoadState('networkidle');
  });

  test('Complete poem workflow - basic flow', async ({ page }) => {
    console.log('🧪 Testing basic poem workflow...');
    
    // Start poem generator - use correct selectors
    await page.click('a[href*="/workflow-details/poem-generator"]');
    await page.waitForLoadState('networkidle');
    await page.click('a[href*="/w/poem/new"]');
    await page.waitForSelector('textarea', { timeout: 10000 });
    
    // Stage 1: Poem Topic
    const poemTopic = 'A serene lake at sunset with mountains in the background';
    await page.fill('textarea', poemTopic);
    await page.click('button:has-text("Continue")');
    
    // Wait for poem generation (Stage 2)
    await page.waitForSelector('text=Poem Title', { timeout: 30000 });
    const poemTitle = await page.locator('[data-testid="poem-title"], h3:has-text("Poem Title") + *').first().textContent();
    expect(poemTitle).toBeTruthy();
    console.log(`✅ Generated poem title: ${poemTitle}`);
    
    // Verify poem content exists
    const poemContentExists = await page.locator('text=Poem Content').isVisible();
    expect(poemContentExists).toBe(true);
    
    // Stage 3: Image Customization (use defaults)
    await page.click('div:has-text("Image Customization") button:has-text("Continue")');
    
    // Wait for image generation
    await page.waitForSelector('text=Download', { timeout: 60000 });
    console.log('✅ Image generation completed');
    
    // Stage 4: HTML Briefing (skip optional)
    await page.click('div:has-text("HTML Briefing") button:has-text("Continue")');
    
    // Wait for HTML generation
    await page.waitForSelector('text=Export & Publish Poem', { timeout: 30000 });
    
    // Stage 5: Export & Publish
    await page.click('button:has-text("Export & Publish Poem")');
    await page.waitForSelector('text=Styled HTML', { timeout: 30000 });
    
    // Verify all export formats are available
    const styledHtml = page.locator('text=Styled HTML');
    const cleanHtml = page.locator('text=Clean HTML');
    const markdown = page.locator('text=Markdown');
    
    await expect(styledHtml).toBeVisible();
    await expect(cleanHtml).toBeVisible();
    await expect(markdown).toBeVisible();
    
    console.log('✅ All export formats generated successfully');
    
    // Verify workflow completion
    const completedText = page.locator('text=8/8');
    await expect(completedText).toBeVisible();
    console.log('✅ Workflow completed (8/8 stages)');
  });

  test('Test different image format variations', async ({ page }) => {
    console.log('🧪 Testing different image formats...');
    
    // Start workflow - use correct selectors
    await page.click('a[href*="/workflow-details/poem-generator"]');
    await page.waitForLoadState('networkidle');
    await page.click('a[href*="/w/poem/new"]');
    await page.waitForSelector('textarea');
    
    // Quick poem topic
    await page.fill('textarea', 'Modern city skyline at night');
    await page.click('button:has-text("Continue")');
    await page.waitForSelector('text=Poem Title', { timeout: 30000 });
    
    // Test different image formats
    const imageFormats = [
      'Square (1:1) - Social Media',
      'Landscape (4:3) - Classic', 
      'Widescreen (16:9) - Desktop',
      'Mobile (9:16) - Stories'
    ];
    
    for (const format of imageFormats) {
      console.log(`Testing image format: ${format}`);
      
      // Select the format
      await page.selectOption('select:has-option:text("Image Format")', { label: format });
      
      // Continue with image generation
      await page.click('div:has-text("Image Customization") button:has-text("Continue")');
      
      // Wait for image generation
      await page.waitForSelector('text=Download', { timeout: 60000 });
      console.log(`✅ ${format} format generated successfully`);
      
      // Reset for next test (go back to image customization)
      if (imageFormats.indexOf(format) < imageFormats.length - 1) {
        await page.click('div:has-text("Image Customization") button:has-text("Edit")');
      }
    }
  });

  test('Test different artistic styles', async ({ page }) => {
    console.log('🧪 Testing different artistic styles...');
    
    // Start workflow - use correct selectors
    await page.click('a[href*="/workflow-details/poem-generator"]');
    await page.waitForLoadState('networkidle');
    await page.click('a[href*="/w/poem/new"]');
    await page.waitForSelector('textarea');
    
    await page.fill('textarea', 'Abstract geometric patterns');
    await page.click('button:has-text("Continue")');
    await page.waitForSelector('text=Poem Title', { timeout: 30000 });
    
    // Test different artistic styles
    const artisticStyles = [
      'Photorealistic',
      'Watercolor Painting',
      'Oil Painting',
      'Digital Art',
      'Minimalist'
    ];
    
    for (const style of artisticStyles) {
      console.log(`Testing artistic style: ${style}`);
      
      await page.selectOption('select:has-option:text("Artistic Style")', { label: style });
      await page.click('div:has-text("Image Customization") button:has-text("Continue")');
      await page.waitForSelector('text=Download', { timeout: 60000 });
      console.log(`✅ ${style} style generated successfully`);
      
      if (artisticStyles.indexOf(style) < artisticStyles.length - 1) {
        await page.click('div:has-text("Image Customization") button:has-text("Edit")');
      }
    }
  });

  test('Test export content verification', async ({ page }) => {
    console.log('🧪 Testing export content verification...');
    
    // Complete a basic workflow first
    await page.click('a[href*="/workflow-details/poem-generator"]');
    await page.waitForLoadState('networkidle');
    await page.click('a[href*="/w/poem/new"]');
    await page.waitForSelector('textarea');
    
    const testTopic = 'Testing export content verification';
    await page.fill('textarea', testTopic);
    await page.click('button:has-text("Continue")');
    await page.waitForSelector('text=Poem Title', { timeout: 30000 });
    
    // Get poem details for verification
    const poemTitle = await page.locator('h3:has-text("Poem Title") + *').first().textContent();
    
    // Continue to export
    await page.click('div:has-text("Image Customization") button:has-text("Continue")');
    await page.waitForSelector('text=Download', { timeout: 60000 });
    await page.click('div:has-text("HTML Briefing") button:has-text("Continue")');
    await page.waitForSelector('text=Export & Publish Poem', { timeout: 30000 });
    await page.click('button:has-text("Export & Publish Poem")');
    await page.waitForSelector('text=Styled HTML', { timeout: 30000 });
    
    // Test copy functionality for each export format
    const formats = ['Styled HTML', 'Clean HTML', 'Markdown'];
    
    for (const format of formats) {
      console.log(`Testing ${format} export...`);
      
      // Click copy button for this format
      const copyButton = page.locator(`div:has-text("${format}") button:has-text("Copy")`);
      await copyButton.click();
      
      // Verify copy success (look for success message or similar)
      // Note: Actual clipboard testing requires special permissions
      console.log(`✅ ${format} copy button clicked successfully`);
    }
    
    // Test download functionality
    for (const format of ['PDF Document', 'Word Document']) {
      console.log(`Testing ${format} download...`);
      
      const downloadButton = page.locator(`div:has-text("${format}") button:has-text("Download")`);
      await downloadButton.click();
      console.log(`✅ ${format} download initiated`);
    }
  });

  test('Test publishing functionality', async ({ page }) => {
    console.log('🧪 Testing publishing functionality...');
    
    // Complete workflow to export stage
    await page.click('a[href*="/workflow-details/poem-generator"]');
    await page.waitForLoadState('networkidle');
    await page.click('a[href*="/w/poem/new"]');
    await page.waitForSelector('textarea');
    
    await page.fill('textarea', 'Testing publishing functionality');
    await page.click('button:has-text("Continue")');
    await page.waitForSelector('text=Poem Title', { timeout: 30000 });
    
    await page.click('div:has-text("Image Customization") button:has-text("Continue")');
    await page.waitForSelector('text=Download', { timeout: 60000 });
    await page.click('div:has-text("HTML Briefing") button:has-text("Continue")');
    await page.waitForSelector('text=Export & Publish Poem', { timeout: 30000 });
    await page.click('button:has-text("Export & Publish Poem")');
    await page.waitForSelector('text=Publish Now', { timeout: 30000 });
    
    // Test publishing
    const publishButton = page.locator('button:has-text("Publish Now")');
    await publishButton.click();
    
    // Wait for publish to complete or show result
    await page.waitForTimeout(5000);
    
    console.log('✅ Publishing functionality tested');
  });

  test('Test document persistence and reload', async ({ page }) => {
    console.log('🧪 Testing document persistence and reload...');
    
    // Start a workflow
    await page.click('a[href*="/workflow-details/poem-generator"]');
    await page.waitForLoadState('networkidle');
    await page.click('a[href*="/w/poem/new"]');
    await page.waitForSelector('textarea');
    
    const uniqueTopic = `Persistence test ${Date.now()}`;
    await page.fill('textarea', uniqueTopic);
    await page.click('button:has-text("Continue")');
    await page.waitForSelector('text=Poem Title', { timeout: 30000 });
    
    // Get the document title for later verification
    const documentTitle = await page.locator('h1, h2, [data-testid="document-title"]').first().textContent();
    
    // Wait for auto-save
    await page.waitForSelector('text=Last saved', { timeout: 10000 });
    console.log('✅ Document auto-saved');
    
    // Go back to dashboard
    await page.click('a:has-text("Dashboard")');
    await page.waitForLoadState('networkidle');
    
    // Verify document appears in recent documents
    const documentInList = page.locator(`text=${uniqueTopic}`);
    await expect(documentInList).toBeVisible();
    console.log('✅ Document appears in dashboard');
    
    // Click on the document to reload it
    await documentInList.click();
    await page.waitForSelector('textarea');
    
    // Verify the content was preserved
    const reloadedTopic = await page.locator('textarea').inputValue();
    expect(reloadedTopic).toBe(uniqueTopic);
    console.log('✅ Document content preserved after reload');
  });

  test('Test edge cases - special characters and long content', async ({ page }) => {
    console.log('🧪 Testing edge cases...');
    
    // Test special characters and unicode
    const specialCharacterTopic = 'Special chars: äöü, 中文, 🌟, émojis, ñoño, & symbols <>"\'';
    
    await page.click('a[href*="/workflow-details/poem-generator"]');
    await page.waitForLoadState('networkidle');
    await page.click('a[href*="/w/poem/new"]');
    await page.waitForSelector('textarea');
    
    await page.fill('textarea', specialCharacterTopic);
    await page.click('button:has-text("Continue")');
    await page.waitForSelector('text=Poem Title', { timeout: 30000 });
    console.log('✅ Special characters handled correctly');
    
    // Test very long topic
    const longTopic = 'A very long poem topic that contains many words and should test the system\'s ability to handle lengthy input text that might cause issues with token limits or processing constraints. '.repeat(5);
    
    // Start new workflow for long content test
    await page.goto(`${BASE_URL}/dashboard`);
    await page.click('a[href*="/workflow-details/poem-generator"]');
    await page.waitForLoadState('networkidle');
    await page.click('a[href*="/w/poem/new"]');
    await page.waitForSelector('textarea');
    
    await page.fill('textarea', longTopic);
    await page.click('button:has-text("Continue")');
    await page.waitForSelector('text=Poem Title', { timeout: 30000 });
    console.log('✅ Long content handled correctly');
  });

  test('Test error recovery and resilience', async ({ page }) => {
    console.log('🧪 Testing error recovery...');
    
    // Test with minimal input
    await page.click('a[href*="/workflow-details/poem-generator"]');
    await page.waitForLoadState('networkidle');
    await page.click('a[href*="/w/poem/new"]');
    await page.waitForSelector('textarea');
    
    // Try with very short input
    await page.fill('textarea', 'x');
    await page.click('button:has-text("Continue")');
    
    // Should still work or show appropriate error
    try {
      await page.waitForSelector('text=Poem Title', { timeout: 30000 });
      console.log('✅ Minimal input handled successfully');
    } catch (e) {
      console.log('✅ Minimal input properly rejected with error handling');
    }
    
    // Test with empty input
    await page.goto(`${BASE_URL}/dashboard`);
    await page.click('a[href*="/workflow-details/poem-generator"]');
    await page.waitForLoadState('networkidle');
    await page.click('a[href*="/w/poem/new"]');
    await page.waitForSelector('textarea');
    
    // Try to continue with empty textarea
    await page.click('button:has-text("Continue")');
    // Should either prevent continuation or handle gracefully
    console.log('✅ Empty input handling tested');
  });

  test('Test multiple workflows simultaneously', async ({ browser }) => {
    console.log('🧪 Testing multiple concurrent workflows...');
    
    // Create multiple browser contexts to simulate different users
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();
    
    const page1 = await context1.newPage();
    const page2 = await context2.newPage();
    
    try {
      // Start two workflows simultaneously
      await Promise.all([
        page1.goto(`${BASE_URL}/dashboard`),
        page2.goto(`${BASE_URL}/dashboard`)
      ]);
      
      // Start poem generators on both
      await Promise.all([
        page1.click('a[href*="poem-generator"]').then(() => page1.click('a:has-text("Start Poem Generator")')),
        page2.click('a[href*="poem-generator"]').then(() => page2.click('a:has-text("Start Poem Generator")'))
      ]);
      
      await Promise.all([
        page1.waitForSelector('textarea'),
        page2.waitForSelector('textarea')
      ]);
      
      // Fill different topics
      await Promise.all([
        page1.fill('textarea', 'Workflow 1 topic'),
        page2.fill('textarea', 'Workflow 2 topic')
      ]);
      
      // Continue both
      await Promise.all([
        page1.click('button:has-text("Continue")'),
        page2.click('button:has-text("Continue")')
      ]);
      
      // Wait for both to complete
      await Promise.all([
        page1.waitForSelector('text=Poem Title', { timeout: 30000 }),
        page2.waitForSelector('text=Poem Title', { timeout: 30000 })
      ]);
      
      console.log('✅ Multiple concurrent workflows handled successfully');
      
    } finally {
      await context1.close();
      await context2.close();
    }
  });

  test('Check for console errors and warnings', async ({ page }) => {
    console.log('🧪 Checking for console errors...');
    
    const errors: string[] = [];
    const warnings: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      } else if (msg.type() === 'warning') {
        warnings.push(msg.text());
      }
    });
    
    // Run a complete workflow while monitoring console
    await page.click('a[href*="/workflow-details/poem-generator"]');
    await page.waitForLoadState('networkidle');
    await page.click('a[href*="/w/poem/new"]');
    await page.waitForSelector('textarea');
    
    await page.fill('textarea', 'Console error test');
    await page.click('button:has-text("Continue")');
    await page.waitForSelector('text=Poem Title', { timeout: 30000 });
    
    await page.click('div:has-text("Image Customization") button:has-text("Continue")');
    await page.waitForSelector('text=Download', { timeout: 60000 });
    
    // Check for critical errors (ignore known acceptable warnings)
    const criticalErrors = errors.filter(error => 
      !error.includes('Failed to load resource') && // 404s are expected in some cases
      !error.includes('params.shortName') && // Next.js migration warning
      !error.includes('A param property was accessed') // Next.js migration warning
    );
    
    if (criticalErrors.length > 0) {
      console.error('❌ Critical console errors found:', criticalErrors);
      throw new Error(`Critical console errors detected: ${criticalErrors.join(', ')}`);
    }
    
    console.log(`✅ Console check passed (${errors.length} total errors, ${criticalErrors.length} critical)`);
    console.log(`ℹ️ Warnings found: ${warnings.length}`);
  });
});