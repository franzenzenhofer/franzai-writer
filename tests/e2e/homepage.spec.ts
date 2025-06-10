import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should display homepage content', async ({ page }) => {
    await page.goto('/');
    
    await expect(page).toHaveTitle(/Franz AI Writer/);
    
    await expect(page.getByTestId('hero-title')).toBeVisible();
    await expect(page.getByTestId('hero-description')).toBeVisible();
    
    await expect(page.getByTestId('hero-demo-button')).toBeVisible();
    await expect(page.getByTestId('hero-demo-button')).toHaveText('Try it for free');
    
    await expect(page.getByTestId('header-login-button')).toBeVisible();
  });

  test('should navigate to dashboard when clicking demo button', async ({ page }) => {
    await page.goto('/');
    
    await page.getByTestId('hero-demo-button').click();
    
    await page.waitForURL('**/dashboard');
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test('should navigate to login when clicking login button', async ({ page }) => {
    await page.goto('/');
    
    await page.getByTestId('header-login-button').click();
    
    await page.waitForURL('**/login');
    await expect(page).toHaveURL(/\/login$/);
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    await expect(page.getByTestId('hero-title')).toBeVisible();
    await expect(page.getByTestId('hero-demo-button')).toBeVisible();
    
    const desktopNav = page.locator('.hidden.md\\:flex');
    await expect(desktopNav).not.toBeVisible();
    
    const mobileMenuButton = page.locator('button[aria-label="Toggle menu"]');
    await expect(mobileMenuButton).toBeVisible();
  });
});