import { test, expect } from '@playwright/test';

test.describe('Footer Links', () => {
  test('should have updated footer navigation with correct links', async ({ page }) => {
    // Navigate to homepage
    await page.goto('/');
    
    // Wait for page to load
    await page.waitForTimeout(1000);
    
    // Verify footer is present
    await expect(page.locator('footer')).toBeVisible();
    
    // Check that all expected footer links are present
    await expect(page.locator('footer a[href="/"]')).toHaveText('Home');
    await expect(page.locator('footer a[href="https://www.franzai.com"]')).toHaveText('FranzAI.com');
    await expect(page.locator('footer a[href="/privacy"]')).toHaveText('Privacy');
    await expect(page.locator('footer a[href="/terms"]')).toHaveText('Terms');
    
    // Verify external link has correct attributes
    const franzaiLink = page.locator('footer a[href="https://www.franzai.com"]');
    await expect(franzaiLink).toHaveAttribute('target', '_blank');
    await expect(franzaiLink).toHaveAttribute('rel', 'noreferrer');
    
    console.log('✅ Footer links verification completed successfully');
  });

  test('should navigate to privacy page', async ({ page }) => {
    await page.goto('/');
    
    // Click privacy link in footer
    await page.locator('footer a[href="/privacy"]').click();
    
    // Verify navigation to privacy page
    await expect(page).toHaveURL('/privacy');
    await expect(page.locator('h1')).toHaveText('Privacy Policy');
    
    console.log('✅ Privacy page navigation test completed successfully');
  });

  test('should navigate to terms page', async ({ page }) => {
    await page.goto('/');
    
    // Click terms link in footer
    await page.locator('footer a[href="/terms"]').click();
    
    // Verify navigation to terms page
    await expect(page).toHaveURL('/terms');
    await expect(page.locator('h1')).toHaveText('Terms of Service');
    
    console.log('✅ Terms page navigation test completed successfully');
  });

  test('should not have GitHub link in footer', async ({ page }) => {
    await page.goto('/');
    
    // Verify GitHub link is not present
    await expect(page.locator('footer a[href*="github"]')).toHaveCount(0);
    
    console.log('✅ GitHub link removal verification completed successfully');
  });
});