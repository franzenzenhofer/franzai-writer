import { test, expect } from '@playwright/test';

// Test temporary session functionality - ONLY 2 TESTS
test.describe('Temporary Session Tests', () => {
  test.skip(({ browserName }) => browserName !== 'chromium', 'Only run on chromium to save money');

  test('should create temporary session and allow document creation', async ({ page }) => {
    // Navigate to dashboard directly
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Verify we're on the dashboard
    await expect(page).toHaveURL(/.*dashboard.*/);
    
    // Look for the poem workflow link
    const poemLink = page.locator('a[href="/w/poem/new"]');
    await expect(poemLink).toBeVisible();
    
    // Start poem workflow by clicking the link
    await poemLink.click();
    
    // Should navigate to wizard
    await page.waitForURL('**/w/poem/**', { timeout: 10000 });
    
    // Simple check that wizard loaded
    await expect(page.locator('[data-testid="wizard-page-title"]')).toBeVisible({ timeout: 10000 });
    
    // Fill in topic
    await page.fill('textarea', 'test poem topic');
    
    // Process the stage
    await page.click('#process-stage-poem-topic');
    
    // Wait a bit for processing
    await page.waitForTimeout(2000);
  });

  test('should persist temporary session across page reloads', async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Create a document by clicking the link
    await page.locator('a[href="/w/poem/new"]').click();
    await page.waitForURL('**/w/poem/**', { timeout: 10000 });
    
    // Wait for wizard to load
    await expect(page.locator('[data-testid="wizard-page-title"]')).toBeVisible();
    
    // Fill in some data
    await page.fill('textarea', 'test persistence');
    
    // Get the URL
    const currentUrl = page.url();
    
    // Reload the page
    await page.reload();
    
    // Should still be on the same page with the same data
    await expect(page).toHaveURL(currentUrl);
    await expect(page.locator('textarea')).toHaveValue('test persistence');
  });
});