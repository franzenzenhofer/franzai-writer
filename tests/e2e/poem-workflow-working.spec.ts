import { test, expect } from '@playwright/test';

test.describe('Poem Workflow Working Test (Chrome Only)', () => {
  test.skip(({ browserName }) => browserName !== 'chromium', 'Chrome only per CLAUDE.md guidelines');

  test('should complete poem workflow with document isolation', async ({ page, browser }) => {
    console.log('🧪 Starting poem workflow test...');
    
    // Navigate directly to poem workflow
    await page.goto('/w/poem/new');
    await page.waitForLoadState('networkidle');
    
    // Wait for the wizard shell to load
    await page.waitForSelector('text=Poem Generator', { timeout: 10000 });
    
    // Stage 1: Enter poem topic
    const topicTextarea = page.locator('textarea').first();
    await topicTextarea.fill('A majestic eagle soaring above mountains');
    
    // Click the continue button for poem topic stage
    await page.click('button:has-text("Continue")').catch(() => {
      // Try alternative selector
      return page.click('#process-stage-poem-topic');
    });
    
    // Wait for poem to be generated
    await page.waitForSelector('text=Poem Title', { timeout: 30000 });
    console.log('✅ Poem generated');
    
    // Get document URL
    const documentUrl = page.url();
    const docId = documentUrl.match(/\/([^\/]+)$/)?.[1];
    console.log('📄 Document ID:', docId);
    
    // TEST PERSISTENCE: Reload the page
    console.log('🔄 Testing persistence...');
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Verify URL is maintained
    expect(page.url()).toBe(documentUrl);
    
    // Verify poem topic persisted
    await expect(page.locator('text=eagle')).toBeVisible();
    console.log('✅ Persistence verified');
    
    // TEST DOCUMENT ISOLATION
    console.log('🔒 Testing document isolation...');
    const context2 = await browser.newContext();
    const page2 = await context2.newPage();
    
    try {
      // User 2: Create a different poem
      await page2.goto('/w/poem/new');
      await page2.waitForLoadState('networkidle');
      
      const topicTextarea2 = page2.locator('textarea').first();
      await topicTextarea2.fill('Ocean waves at sunset');
      
      await page2.click('button:has-text("Continue")').catch(() => {
        return page2.click('#process-stage-poem-topic');
      });
      
      // Wait for poem generation
      await page2.waitForSelector('text=Poem Title', { timeout: 30000 });
      
      // Get User 2's document ID
      const doc2Url = page2.url();
      const doc2Id = doc2Url.match(/\/([^\/]+)$/)?.[1];
      
      // Verify different document IDs
      expect(doc2Id).not.toBe(docId);
      console.log('✅ Documents have different IDs');
      
      // Navigate to dashboard for both users
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');
      
      await page2.goto('/dashboard');
      await page2.waitForLoadState('networkidle');
      
      // User 1 should see their document
      const user1SeesOwn = await page.locator('text=eagle').count();
      expect(user1SeesOwn).toBeGreaterThan(0);
      
      // User 1 should NOT see User 2's document
      const user1SeesOther = await page.locator('text=Ocean waves').count();
      expect(user1SeesOther).toBe(0);
      
      // User 2 should see their document
      const user2SeesOwn = await page2.locator('text=Ocean waves').count();
      expect(user2SeesOwn).toBeGreaterThan(0);
      
      // User 2 should NOT see User 1's document
      const user2SeesOther = await page2.locator('text=eagle').count();
      expect(user2SeesOther).toBe(0);
      
      console.log('✅ Document isolation verified');
      
    } finally {
      await context2.close();
    }
    
    console.log('🎉 All tests passed!');
  });

  test('should navigate through poem workflow stages', async ({ page }) => {
    // Start poem workflow
    await page.goto('/w/poem/new');
    await page.waitForLoadState('networkidle');
    
    // Enter topic
    await page.fill('textarea', 'Beautiful spring morning');
    await page.click('button:has-text("Continue")').catch(() => {
      return page.click('#process-stage-poem-topic');
    });
    
    // Wait for poem generation and continue
    await page.waitForSelector('text=Poem Title', { timeout: 30000 });
    
    // Continue to next stage if button is available
    const continueButtons = page.locator('button:has-text("Continue")');
    const buttonCount = await continueButtons.count();
    
    if (buttonCount > 0) {
      await continueButtons.first().click();
      console.log('✅ Progressed to next stage');
    }
    
    // Verify we can see the poem content
    await expect(page.locator('text=spring')).toBeVisible();
  });
});