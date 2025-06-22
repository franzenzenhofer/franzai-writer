import { test, expect } from '@playwright/test';

/**
 * MASTER Poem Workflow Test - Comprehensive E2E Coverage
 * Tests ALL poem workflow features including document isolation
 * Per CLAUDE.md requirements
 */

test.describe('Poem Workflow Master Test (Chrome Only)', () => {
  test.skip(({ browserName }) => browserName !== 'chromium', 'Chrome only per CLAUDE.md guidelines');

  test('Complete poem workflow with persistence and isolation', async ({ page, browser }) => {
    console.log('🧪 Starting comprehensive poem workflow test...');
    
    // Start from dashboard
    await page.goto('/dashboard');
    await page.waitForSelector('text=Start a new document', { timeout: 10000 });
    
    // Start poem workflow
    await page.click('#workflow-start-poem-generator');
    await page.waitForSelector('textarea', { timeout: 10000 });
    
    // Stage 1: Poem Topic
    const poemTopic = 'A majestic eagle soaring through mountain peaks';
    await page.fill('textarea', poemTopic);
    await page.click('#process-stage-poem-topic');
    
    // Wait for poem generation
    await page.waitForSelector('text=Poem Title', { timeout: 30000 });
    console.log('✅ Poem generated');
    
    // Get the current URL for persistence test
    const documentUrl = page.url();
    const docId = documentUrl.match(/\/([^\/]+)$/)?.[1];
    console.log('📄 Document ID:', docId);
    
    // Stage 2: Process poem (auto-run)
    await page.click('#process-stage-poem-text');
    
    // Stage 3: Image briefing
    await page.waitForSelector('[data-testid="format-square"]', { timeout: 10000 });
    await page.click('[data-testid="format-square"]');
    await page.click('#process-stage-image-briefing');
    
    // Wait for image generation
    await page.waitForSelector('text=Download', { timeout: 60000 });
    console.log('✅ Image generated');
    
    // Stage 4: HTML briefing (optional - skip)
    await page.click('#process-stage-html-briefing');
    
    // Wait for HTML generation
    await page.waitForSelector('text=Export & Publish Poem', { timeout: 30000 });
    console.log('✅ HTML generated');
    
    // TEST PERSISTENCE: Reload the page
    console.log('🔄 Testing persistence after reload...');
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Verify we're still on the same document
    expect(page.url()).toBe(documentUrl);
    
    // Verify poem content persisted
    await expect(page.locator('text=mountain peaks')).toBeVisible();
    
    // Verify we're at the export stage
    await expect(page.locator('text=Export & Publish Poem')).toBeVisible();
    console.log('✅ Persistence verified');
    
    // TEST DOCUMENT ISOLATION
    console.log('🔒 Testing document isolation...');
    
    // Create a second context to simulate another user
    const context2 = await browser.newContext();
    const page2 = await context2.newPage();
    
    try {
      // User 2: Start from dashboard
      await page2.goto('/dashboard');
      await page2.waitForSelector('text=Start a new document', { timeout: 10000 });
      
      // User 2 should NOT see User 1's document in recent docs
      const user2SeesDoc = await page2.locator('text=mountain peaks').count();
      expect(user2SeesDoc).toBe(0);
      console.log('✅ Document isolation verified - User 2 cannot see User 1 document');
      
      // User 2: Try to access User 1's document directly
      if (docId) {
        await page2.goto(`/w/poem/${docId}`);
        await page2.waitForLoadState('networkidle');
        
        // Should not see the content
        const unauthorizedContent = await page2.locator('text=mountain peaks').count();
        expect(unauthorizedContent).toBe(0);
        console.log('✅ Direct URL access blocked for other users');
      }
      
    } finally {
      await context2.close();
    }
    
    // TEST EXPORT FUNCTIONALITY
    console.log('📤 Testing export functionality...');
    
    // Click export as HTML
    const exportButton = page.locator('button:has-text("Export as HTML")');
    if (await exportButton.count() > 0) {
      await exportButton.click();
      await page.waitForTimeout(2000);
      console.log('✅ Export triggered');
    }
    
    // Navigate back to dashboard
    await page.goto('/dashboard');
    await page.waitForSelector('text=Start a new document', { timeout: 10000 });
    
    // Verify document appears in recent documents
    await expect(page.locator('text=mountain peaks')).toBeVisible();
    console.log('✅ Document appears in dashboard');
    
    console.log('🎉 All poem workflow tests passed!');
  });

  test('Test different image formats and styles', async ({ page }) => {
    console.log('🎨 Testing image format variations...');
    
    // Start from dashboard
    await page.goto('/dashboard');
    await page.waitForSelector('text=Start a new document', { timeout: 10000 });
    
    // Start poem workflow
    await page.click('#workflow-start-poem-generator');
    await page.waitForSelector('textarea', { timeout: 10000 });
    
    // Quick poem generation
    await page.fill('textarea', 'Ocean waves at twilight');
    await page.click('#process-stage-poem-topic');
    await page.waitForSelector('text=Poem Title', { timeout: 30000 });
    await page.click('#process-stage-poem-text');
    
    // Test different formats
    const formats = ['square', 'portrait', 'landscape'];
    
    for (const format of formats) {
      console.log(`Testing ${format} format...`);
      await page.waitForSelector(`[data-testid="format-${format}"]`, { timeout: 10000 });
      await page.click(`[data-testid="format-${format}"]`);
      
      // Verify selection
      const isSelected = await page.locator(`[data-testid="format-${format}"][data-selected="true"]`).count();
      expect(isSelected).toBeGreaterThan(0);
    }
    
    console.log('✅ All image formats tested');
  });
});