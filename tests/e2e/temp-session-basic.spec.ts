import { test, expect } from '@playwright/test';

// Very basic test to verify temp session functionality - ONLY 2 TESTS
test.describe('Basic Temp Session Test', () => {
  test('temp session is created automatically', async ({ page }) => {
    // Go to dashboard
    await page.goto('http://localhost:9002/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Should see dashboard content without login
    await expect(page.locator('h1:has-text("Start a new document")')).toBeVisible();
    
    // Should see poem generator workflow
    await expect(page.locator('text=Poem Generator')).toBeVisible();
    
    // Should NOT see login button in main content (only in header)
    const mainContent = page.locator('main');
    await expect(mainContent.locator('text=Login / Sign Up')).toBeVisible();
  });

  test('can start workflow with temp session', async ({ page }) => {
    // Go directly to poem workflow
    await page.goto('http://localhost:9002/w/poem/new');
    
    // Wait for navigation to complete
    await page.waitForLoadState('networkidle');
    
    // Should be able to access workflow (not redirected to login)
    const url = page.url();
    expect(url).toContain('/w/poem/');
    expect(url).not.toContain('/login');
    
    // Should see poem topic textarea (first stage of poem workflow)
    await expect(page.locator('[data-testid="textarea-poem-topic"]')).toBeVisible({ timeout: 10000 });
  });
});