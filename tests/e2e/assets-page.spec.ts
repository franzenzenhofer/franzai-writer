import { test, expect } from '@playwright/test';

const testUser = {
  email: 'test@example.com',
  password: 'testpassword123'
};

test.describe('Assets Page E2E Tests (Chrome Only)', () => {
  test.skip(({ browserName }) => browserName !== 'chromium', 'Chrome only per CLAUDE.md guidelines');
  test.beforeEach(async ({ page }) => {
    // Login and navigate to assets
    await page.goto('/login');
    await page.fill('input[type="email"]', testUser.email);
    await page.fill('input[type="password"]', testUser.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
    
    // Navigate to assets page
    await page.goto('/assets');
    await page.waitForLoadState('networkidle');
  });

  test('should display assets page with storage overview', async ({ page }) => {
    // Check page header
    await expect(page.locator('h1')).toContainText('Asset Manager');
    
    // Check storage overview cards
    await expect(page.locator('text=Total Storage')).toBeVisible();
    await expect(page.locator('text=Images')).toBeVisible();
    await expect(page.locator('text=Documents')).toBeVisible();
    await expect(page.locator('text=Exports')).toBeVisible();
  });

  test('should filter assets by type', async ({ page }) => {
    // Wait for initial load
    await page.waitForSelector('[role="tablist"]');
    
    // Click on Images tab
    await page.getByRole('tab', { name: 'Images' }).click();
    
    // Check that the tab is selected
    await expect(page.getByRole('tab', { name: 'Images' })).toHaveAttribute('data-state', 'active');
    
    // Click on Documents tab
    await page.getByRole('tab', { name: 'Documents' }).click();
    await expect(page.getByRole('tab', { name: 'Documents' })).toHaveAttribute('data-state', 'active');
    
    // Click back to All
    await page.getByRole('tab', { name: 'All' }).click();
    await expect(page.getByRole('tab', { name: 'All' })).toHaveAttribute('data-state', 'active');
  });

  test('should search assets by name', async ({ page }) => {
    // Type in search box
    const searchInput = page.locator('input[placeholder="Search assets..."]');
    await searchInput.fill('poem');
    
    // Verify search input has value
    await expect(searchInput).toHaveValue('poem');
    
    // Clear search
    await searchInput.clear();
    await expect(searchInput).toHaveValue('');
  });

  test('should handle asset selection and bulk actions', async ({ page }) => {
    // Wait for assets to load
    const firstCheckbox = page.locator('input[type="checkbox"]').first();
    
    // If there are assets, test selection
    if (await firstCheckbox.count() > 0) {
      // Select first asset
      await firstCheckbox.click();
      
      // Check bulk actions bar appears
      await expect(page.locator('text=1 selected')).toBeVisible();
      await expect(page.locator('button:has-text("Delete")').last()).toBeVisible();
      
      // Click cancel
      await page.locator('button:has-text("Cancel")').click();
      
      // Verify selection cleared
      await expect(page.locator('text=1 selected')).not.toBeVisible();
    }
  });

  test('should show asset actions dropdown', async ({ page }) => {
    // Find first asset card action button
    const actionButton = page.locator('button:has([class*="h-4 w-4"])').first();
    
    // If there are assets, test dropdown
    if (await actionButton.count() > 0) {
      await actionButton.click();
      
      // Check dropdown menu items
      await expect(page.locator('text=Preview')).toBeVisible();
      await expect(page.locator('text=Download')).toBeVisible();
      await expect(page.locator('[role="menuitem"]:has-text("Delete")')).toBeVisible();
      
      // Close dropdown by clicking outside
      await page.click('body');
    }
  });

  test('should handle empty state correctly', async ({ page }) => {
    // Search for something that doesn't exist
    await page.fill('input[placeholder="Search assets..."]', 'nonexistentasset123456');
    
    // Check empty state appears
    await expect(page.locator('text=No assets found')).toBeVisible();
    await expect(page.locator('text=Try adjusting your filters.')).toBeVisible();
  });
});