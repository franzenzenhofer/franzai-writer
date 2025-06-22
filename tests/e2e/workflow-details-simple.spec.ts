import { test, expect } from '@playwright/test';

test.describe('Workflow Details Page Basic Tests (Chrome Only)', () => {
  test.skip(({ browserName }) => browserName !== 'chromium', 'Chrome only per CLAUDE.md guidelines');

  test('should display workflow details page with correct structure', async ({ page }) => {
    // Navigate to poem workflow details
    await page.goto('/workflow-details/poem');
    await page.waitForLoadState('networkidle');
    
    // Check hero section
    await expect(page.locator('h1')).toContainText('Poem');
    
    // Check stats are visible
    await expect(page.locator('text=Total Stages')).toBeVisible();
    await expect(page.locator('text=AI Stages')).toBeVisible();
    
    // Check CTA buttons
    await expect(page.locator('button:has-text("Start Workflow")')).toBeVisible();
  });

  test('should navigate between workflow detail tabs', async ({ page }) => {
    await page.goto('/workflow-details/poem');
    await page.waitForLoadState('networkidle');
    
    // Check default tab
    await expect(page.locator('text=AI-Powered Analysis')).toBeVisible();
    
    // Click Stages tab
    await page.getByRole('tab', { name: 'Stages' }).click();
    await expect(page.locator('text=Workflow Pipeline')).toBeVisible();
    
    // Click Configuration tab
    await page.getByRole('tab', { name: 'Configuration' }).click();
    await expect(page.locator('text=AI Models')).toBeVisible();
  });

  test('should start workflow from details page', async ({ page }) => {
    await page.goto('/workflow-details/poem');
    await page.waitForLoadState('networkidle');
    
    // Click Start Workflow button
    await page.locator('button:has-text("Start Workflow")').click();
    
    // Should navigate to poem workflow
    await expect(page).toHaveURL(/\/w\/poem\/new/);
  });
});