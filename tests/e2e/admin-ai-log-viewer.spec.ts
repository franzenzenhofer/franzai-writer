import { test, expect } from '@playwright/test';

test.describe('Admin AI Log Viewer', () => {
  test('should access AI log viewer in admin panel', async ({ page }) => {
    // Navigate directly to admin AI log viewer
    await page.goto('/admin/debug/ai-log-viewer');
    
    // Wait for page to load
    await page.waitForTimeout(2000);
    
    // Check that we're on the correct page
    await expect(page).toHaveTitle(/Franz AI Writer/);
    
    // Verify admin navigation is present
    await expect(page.locator('text=Admin Panel')).toBeVisible();
    
    // Verify AI Log Viewer title is present (use specific Card title)
    await expect(page.locator('div[class*="text-2xl"] >> text=AI Log Viewer').first()).toBeVisible();
    
    // Verify control buttons are present with correct design system
    // Stream button starts as "Pause Stream" by default since streaming is active
    await expect(page.locator('button').filter({ hasText: /Start Stream|Pause Stream/ })).toBeVisible();
    await expect(page.locator('button:has-text("Test AI")')).toBeVisible();
    await expect(page.locator('button:has-text("Clear Logs")')).toBeVisible();
    
    // Test the streaming toggle
    const streamButton = page.locator('button').filter({ hasText: /Start Stream|Pause Stream/ }).first();
    await streamButton.click();
    await page.waitForTimeout(1000);
    
    // Verify log stream container exists (check active tab panel)
    await expect(page.locator('[role="tabpanel"][data-state="active"]')).toBeVisible();
    
    // Test AI test functionality
    const testButton = page.locator('button:has-text("Test AI")');
    await testButton.click();
    
    // Wait for test to complete
    await page.waitForTimeout(3000);
    
    // Navigation test - verify breadcrumbs work
    await expect(page.locator('nav[aria-label="Breadcrumb"]')).toBeVisible();
    
    // Test back to app navigation (in admin nav)
    const backButton = page.locator('nav a:has-text("Back to App")');
    await expect(backButton).toBeVisible();
    
    console.log('✅ AI Log Viewer admin interface test completed successfully');
  });

  test('should navigate from admin dashboard to AI log viewer', async ({ page }) => {
    // Start at admin dashboard
    await page.goto('/admin');
    
    // Wait for page load
    await page.waitForTimeout(2000);
    
    // Verify admin dashboard loads
    await expect(page.locator('text=Admin Dashboard')).toBeVisible();
    
    // Click on AI Log Viewer card
    const aiLogCard = page.locator('text=Open AI Logs');
    await expect(aiLogCard).toBeVisible();
    await aiLogCard.click();
    
    // Verify navigation to AI log viewer
    await expect(page).toHaveURL('/admin/debug/ai-log-viewer');
    await expect(page.locator('div[class*="text-2xl"] >> text=AI Log Viewer').first()).toBeVisible();
    
    console.log('✅ Admin dashboard navigation test completed successfully');
  });
});