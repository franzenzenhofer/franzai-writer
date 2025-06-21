import { test, expect } from '@playwright/test';

// Simple test to verify temp session works - ONLY 2 TESTS MAX
test.describe('Simple Temp Session Test', () => {
  test.skip(({ browserName }) => browserName !== 'chromium', 'Only chromium to save money');

  test('temp session allows workflow access', async ({ page }) => {
    // Go to dashboard first to ensure temp session is created
    await page.goto('http://localhost:9002/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Click on poem generator workflow
    const poemWorkflowLink = page.locator('a[href="/w/poem/new"]');
    await expect(poemWorkflowLink).toBeVisible();
    await poemWorkflowLink.click();
    
    // Wait for wizard to load
    await page.waitForURL('**/w/poem/**', { timeout: 10000 });
    
    // Check if we're on wizard page (not login)
    const url = page.url();
    expect(url).toContain('/w/poem/');
    expect(url).not.toContain('/login');
    
    // Should see wizard loaded
    await expect(page.locator('[data-testid="wizard-page-title"]')).toBeVisible({ timeout: 10000 });
  });

  test('temp session persists data', async ({ page }) => {
    // Go to dashboard and navigate to poem workflow
    await page.goto('http://localhost:9002/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Click on poem generator workflow
    await page.locator('a[href="/w/poem/new"]').click();
    await page.waitForURL('**/w/poem/**', { timeout: 10000 });
    
    // Wait for wizard to load
    await expect(page.locator('[data-testid="wizard-page-title"]')).toBeVisible();
    
    // Fill in poem topic
    const textarea = page.locator('textarea').first();
    await textarea.fill('My test poem topic');
    
    // Get document ID from URL
    const url = page.url();
    
    // Reload page
    await page.reload();
    
    // Should still be on same URL with same data
    await expect(page).toHaveURL(url);
    await expect(page.locator('textarea').first()).toHaveValue('My test poem topic');
  });
});