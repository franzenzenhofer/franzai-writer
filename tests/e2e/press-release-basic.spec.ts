import { test, expect } from '@playwright/test';

test.describe('Press Release Basic Flow', () => {
  test('verify press release workflow loads and processes basic info', async ({ page }) => {
    console.log('Starting basic press release test');
    
    // Navigate to the workflow
    await page.goto('/w/press-release/new');
    await page.waitForLoadState('networkidle');
    
    // Verify workflow loaded
    await expect(page.locator('h1')).toContainText('Press Release Generator');
    
    // Fill basic information
    await page.locator('input[placeholder*="New Product Launch"]').fill('Test Product Launch');
    await page.locator('textarea[placeholder*="We\'re launching"]').fill('Test message for press release');
    await page.locator('input[placeholder*="TechCorp Inc."]').fill('Test Company');
    
    // Process basic info stage
    await page.click('#process-stage-basic-info');
    
    // Wait for basic info to complete (shorter timeout)
    await expect(page.locator('[data-testid="stage-card-basic-info"]')).toHaveClass(/border-green-500/, { 
      timeout: 15000 
    });
    
    console.log('Basic info stage completed successfully');
    
    // Check if tone-briefing starts
    const toneBriefingStage = page.locator('[data-testid="stage-card-tone-briefing"]');
    await expect(toneBriefingStage).toBeVisible({ timeout: 5000 });
    
    console.log('Tone briefing stage is visible');
    
    // Take screenshot for debugging
    await page.screenshot({ path: 'press-release-basic-test.png', fullPage: true });
  });
});