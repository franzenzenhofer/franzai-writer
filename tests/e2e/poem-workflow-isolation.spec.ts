import { test, expect } from '@playwright/test';

test.describe('Poem Workflow - Document Isolation Test (Chrome Only)', () => {
  test.skip(({ browserName }) => browserName !== 'chromium', 'Chrome only per CLAUDE.md guidelines');

  test('should ensure documents are isolated between different user sessions', async ({ browser }) => {
    // Create two different browser contexts to simulate different users
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();
    
    const page1 = await context1.newPage();
    const page2 = await context2.newPage();
    
    try {
      // User 1: Create a poem
      await page1.goto('/w/poem/new');
      await page1.waitForLoadState('networkidle');
      
      // Fill poem topic for user 1
      await page1.fill('#poem-topic textarea', 'User 1: Sunset over mountains');
      await page1.click('#process-stage-poem-topic');
      
      // Wait for poem generation
      await page1.waitForSelector('#process-stage-poem-text', { state: 'visible', timeout: 60000 });
      
      // Get the document URL for user 1
      const user1Url = page1.url();
      const user1DocId = user1Url.match(/\/([^\/]+)$/)?.[1];
      console.log('User 1 document ID:', user1DocId);
      
      // User 2: Create a different poem
      await page2.goto('/w/poem/new');
      await page2.waitForLoadState('networkidle');
      
      // Fill poem topic for user 2
      await page2.fill('#poem-topic textarea', 'User 2: Ocean waves at night');
      await page2.click('#process-stage-poem-topic');
      
      // Wait for poem generation
      await page2.waitForSelector('#process-stage-poem-text', { state: 'visible', timeout: 60000 });
      
      // Get the document URL for user 2
      const user2Url = page2.url();
      const user2DocId = user2Url.match(/\/([^\/]+)$/)?.[1];
      console.log('User 2 document ID:', user2DocId);
      
      // Verify documents have different IDs
      expect(user1DocId).not.toBe(user2DocId);
      
      // User 1: Navigate to dashboard and verify only sees their document
      await page1.goto('/dashboard');
      await page1.waitForLoadState('networkidle');
      
      // User 1 should see their document
      const user1Dashboard = await page1.locator('text=Sunset over mountains').count();
      expect(user1Dashboard).toBeGreaterThan(0);
      
      // User 1 should NOT see User 2's document
      const user1SeesUser2 = await page1.locator('text=Ocean waves at night').count();
      expect(user1SeesUser2).toBe(0);
      
      // User 2: Navigate to dashboard and verify only sees their document
      await page2.goto('/dashboard');
      await page2.waitForLoadState('networkidle');
      
      // User 2 should see their document
      const user2Dashboard = await page2.locator('text=Ocean waves at night').count();
      expect(user2Dashboard).toBeGreaterThan(0);
      
      // User 2 should NOT see User 1's document
      const user2SeesUser1 = await page2.locator('text=Sunset over mountains').count();
      expect(user2SeesUser1).toBe(0);
      
      // Test direct URL access isolation
      // User 2 tries to access User 1's document directly
      if (user1DocId) {
        await page2.goto(`/w/poem/${user1DocId}`);
        await page2.waitForLoadState('networkidle');
        
        // Should not see User 1's content
        const unauthorizedAccess = await page2.locator('text=Sunset over mountains').count();
        expect(unauthorizedAccess).toBe(0);
      }
      
    } finally {
      // Clean up
      await context1.close();
      await context2.close();
    }
  });

  test('should complete full poem workflow with persistence', async ({ page }) => {
    // Navigate to poem workflow
    await page.goto('/w/poem/new');
    await page.waitForLoadState('networkidle');
    
    // Fill poem topic
    await page.fill('#poem-topic textarea', 'A beautiful sunrise in spring');
    await page.click('#process-stage-poem-topic');
    
    // Wait for poem generation
    await page.waitForSelector('#process-stage-poem-text', { state: 'visible', timeout: 60000 });
    await page.click('#process-stage-poem-text');
    
    // Wait for image briefing
    await page.waitForSelector('#process-stage-image-briefing', { state: 'visible', timeout: 60000 });
    
    // Select image format
    await page.click('[data-testid="format-square"]');
    await page.click('#process-stage-image-briefing');
    
    // Wait for image generation
    await page.waitForSelector('[data-testid="stage-card-image-generation"]', { state: 'visible', timeout: 60000 });
    
    // Get current URL for reload test
    const currentUrl = page.url();
    
    // Reload the page
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Verify URL is maintained
    expect(page.url()).toBe(currentUrl);
    
    // Verify poem content persisted
    await expect(page.locator('text=A beautiful sunrise in spring')).toBeVisible();
    
    // Verify we're at the image generation stage
    await expect(page.locator('[data-testid="stage-card-image-generation"]')).toBeVisible();
  });
});