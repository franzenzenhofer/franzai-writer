import { test, expect } from '@playwright/test';

test.describe('Assets Page Basic Tests (Chrome Only)', () => {
  test.skip(({ browserName }) => browserName !== 'chromium', 'Chrome only per CLAUDE.md guidelines');

  test('should load assets page and show login prompt for unauthenticated users', async ({ page }) => {
    // Navigate directly to assets
    await page.goto('/assets');
    await page.waitForLoadState('networkidle');
    
    // Should show login prompt for unauthenticated users
    await expect(page.locator('text=Please log in to view your assets.')).toBeVisible();
  });

  test('should show assets page structure when authenticated', async ({ page }) => {
    // Start from dashboard
    await page.goto('/dashboard');
    await page.waitForSelector('text=Start a new document', { timeout: 10000 });
    
    // Now navigate to assets
    await page.goto('/assets');
    await page.waitForSelector('h1', { timeout: 10000 });
    
    // Check page structure
    await expect(page.locator('h1')).toContainText('Asset Manager');
    
    // Check storage overview cards
    await expect(page.locator('text=Total Storage')).toBeVisible();
    await expect(page.locator('text=Images')).toBeVisible();
    await expect(page.locator('text=Documents')).toBeVisible();
    await expect(page.locator('text=Exports')).toBeVisible();
  });

  test('should show filter tabs and search functionality', async ({ page }) => {
    // Start from dashboard
    await page.goto('/dashboard');
    await page.waitForSelector('text=Start a new document', { timeout: 10000 });
    
    // Navigate to assets
    await page.goto('/assets');
    await page.waitForSelector('h1', { timeout: 10000 });
    
    // Check filter tabs
    await expect(page.getByRole('tab', { name: 'All' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Images' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Documents' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Exports' })).toBeVisible();
    
    // Check search input
    await expect(page.locator('input[placeholder="Search assets..."]')).toBeVisible();
  });
});