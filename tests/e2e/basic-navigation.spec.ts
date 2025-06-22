import { test, expect } from '@playwright/test';

test.describe('Basic Navigation Tests (Chrome Only)', () => {
  test.skip(({ browserName }) => browserName !== 'chromium', 'Chrome only per CLAUDE.md guidelines');

  test('should navigate from homepage to dashboard', async ({ page }) => {
    // Go to homepage
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check we're on the homepage
    await expect(page).toHaveTitle(/Franz AI Writer/);
    
    // Look for and click the "Start Writing Now" button
    await page.click('text=Start Writing Now');
    
    // Should navigate to dashboard
    await expect(page).toHaveURL('/dashboard');
    
    // Dashboard should have the expected content
    await expect(page.locator('h1')).toContainText('Your Documents');
  });

  test('should show login page and allow navigation', async ({ page }) => {
    // Go to login page
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    // Check login page elements
    await expect(page.locator('h2')).toContainText('Sign in to your account');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should navigate to settings page', async ({ page }) => {
    // Start from dashboard to create session
    await page.goto('/dashboard');
    await page.waitForSelector('text=Start a new document', { timeout: 10000 });
    
    // Navigate to settings
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');
    
    // Check settings page structure
    await expect(page.locator('h1')).toContainText('Profile & Settings');
    await expect(page.locator('text=Profile Information')).toBeVisible();
    await expect(page.locator('text=Content Management')).toBeVisible();
    await expect(page.locator('text=Account Actions')).toBeVisible();
  });

  test('should navigate to all documents page', async ({ page }) => {
    // Start from dashboard
    await page.goto('/dashboard');
    await page.waitForSelector('text=Start a new document', { timeout: 10000 });
    
    // Navigate to documents
    await page.goto('/documents');
    await page.waitForLoadState('networkidle');
    
    // Check documents page
    await expect(page.locator('h1')).toContainText('All Documents');
  });

  test('should navigate to workflow details page', async ({ page }) => {
    // Go to poem workflow details
    await page.goto('/workflow-details/poem');
    await page.waitForLoadState('networkidle');
    
    // Check workflow details page
    await expect(page.locator('h1')).toContainText('Poem');
    await expect(page.locator('button:has-text("Start Workflow")')).toBeVisible();
  });
});