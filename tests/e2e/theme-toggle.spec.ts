import { test, expect } from '@playwright/test';

test.describe('Theme Toggle', () => {
  test('can toggle between light and dark themes', async ({ page }) => {
    // Navigate to home page
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check that theme toggle button exists
    const themeToggle = page.locator('[data-testid="theme-toggle-button"]');
    await expect(themeToggle).toBeVisible();

    // Click the theme toggle to open dropdown
    await themeToggle.click();
    await page.waitForTimeout(500);

    // Check that theme options are visible
    const lightOption = page.locator('[data-testid="theme-light"]');
    const darkOption = page.locator('[data-testid="theme-dark"]');
    const systemOption = page.locator('[data-testid="theme-system"]');

    await expect(lightOption).toBeVisible();
    await expect(darkOption).toBeVisible();
    await expect(systemOption).toBeVisible();

    // Test switching to dark mode
    await darkOption.click();
    await page.waitForTimeout(500);

    // Check that dark class is applied to html element
    const htmlElement = page.locator('html');
    await expect(htmlElement).toHaveClass(/dark/);

    // Open theme toggle again
    await themeToggle.click();
    await page.waitForTimeout(500);

    // Switch back to light mode
    await lightOption.click();
    await page.waitForTimeout(500);

    // Check that dark class is removed from html element
    await expect(htmlElement).not.toHaveClass(/dark/);

    // Test system theme
    await themeToggle.click();
    await page.waitForTimeout(500);
    await systemOption.click();
    await page.waitForTimeout(500);

    // Verify localStorage persistence
    const themeValue = await page.evaluate(() => localStorage.getItem('theme'));
    expect(themeValue).toBe('system');
  });

  test('persists theme preference across page reloads', async ({ page }) => {
    // Navigate to home page
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Set theme to dark
    const themeToggle = page.locator('[data-testid="theme-toggle-button"]');
    await themeToggle.click();
    await page.waitForTimeout(500);

    const darkOption = page.locator('[data-testid="theme-dark"]');
    await darkOption.click();
    await page.waitForTimeout(500);

    // Verify dark mode is applied
    const htmlElement = page.locator('html');
    await expect(htmlElement).toHaveClass(/dark/);

    // Reload the page
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Check that dark mode is still applied after reload
    await expect(htmlElement).toHaveClass(/dark/);

    // Verify localStorage still has the theme
    const themeValue = await page.evaluate(() => localStorage.getItem('theme'));
    expect(themeValue).toBe('dark');
  });
});