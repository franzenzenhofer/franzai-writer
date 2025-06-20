import { test, expect } from '@playwright/test';

test.describe('Press Release Dashboard Integration', () => {
  test('verify press release workflow appears on dashboard', async ({ page }) => {
    console.log('Navigating to dashboard...');
    
    // Navigate to dashboard
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Look for the press release workflow in the table
    const workflowRow = page.locator('tr:has-text("Press Release Generator")');
    await expect(workflowRow).toBeVisible({ timeout: 10000 });
    
    console.log('✅ Press Release workflow found on dashboard');
    
    // Verify the workflow has the correct elements
    const startButton = workflowRow.locator('a:has-text("Start")');
    await expect(startButton).toBeVisible();
    
    // Verify the start button has the correct href
    const href = await startButton.getAttribute('href');
    expect(href).toBe('/w/press-release/new');
    
    console.log('✅ Start button configured correctly');
    
    // Click the start button
    await startButton.click();
    
    // Verify we're on the press release workflow page
    await expect(page.locator('h1')).toContainText('Press Release Generator');
    
    console.log('✅ Successfully navigated to press release workflow');
    
    // Take screenshot of dashboard with press release workflow
    await page.goto('/dashboard');
    await page.screenshot({ path: 'dashboard-with-press-release.png', fullPage: true });
    console.log('Screenshot saved: dashboard-with-press-release.png');
  });
});