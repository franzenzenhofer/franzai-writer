import { test, expect } from '@playwright/test';

test.describe('Settings Page Basic Tests (Chrome Only)', () => {
  test.skip(({ browserName }) => browserName !== 'chromium', 'Chrome only per CLAUDE.md guidelines');

  test('should load settings page and show login prompt for unauthenticated users', async ({ page }) => {
    // Navigate directly to settings
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');
    
    // Should show login prompt for unauthenticated users
    await expect(page.locator('text=Please log in to access your settings.')).toBeVisible();
  });

  test('should show settings page structure when authenticated', async ({ page }) => {
    // Start from dashboard (creates demo session)
    await page.goto('/dashboard');
    await page.waitForSelector('text=Start a new document', { timeout: 10000 });
    
    // Now navigate to settings
    await page.goto('/settings');
    await page.waitForSelector('h1', { timeout: 10000 });
    
    // Check page structure
    await expect(page.locator('h1')).toContainText('Settings');
    
    // Check tabs are present
    await expect(page.getByRole('tab', { name: /Account/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /Preferences/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /Appearance/i })).toBeVisible();
  });

  test('should switch between settings tabs', async ({ page }) => {
    // Start from dashboard
    await page.goto('/dashboard');
    await page.waitForSelector('text=Start a new document', { timeout: 10000 });
    
    // Navigate to settings
    await page.goto('/settings');
    await page.waitForSelector('h1', { timeout: 10000 });
    
    // Click on Preferences tab
    await page.getByRole('tab', { name: /Preferences/i }).click();
    await expect(page.locator('text=Document Preferences')).toBeVisible();
    
    // Click on Appearance tab
    await page.getByRole('tab', { name: /Appearance/i }).click();
    await expect(page.locator('text=Color theme')).toBeVisible();
  });
});