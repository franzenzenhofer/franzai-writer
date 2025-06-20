import { test, expect } from '@playwright/test';

test.describe('Debug Press Release', () => {
  test('debug template variable resolution', async ({ page }) => {
    console.log('Starting debug test');
    
    await page.goto('/w/press-release/new');
    await page.waitForLoadState('networkidle');
    
    // Fill only basic info
    await page.locator('input[placeholder*="New Product Launch"]').fill('Debug Test');
    await page.locator('textarea[placeholder*="We\'re launching"]').fill('Testing debug');
    await page.locator('input[placeholder*="TechCorp Inc."]').fill('DebugCorp');
    
    await page.click('#process-stage-basic-info');
    await expect(page.locator('[data-testid="stage-card-basic-info"]')).toHaveClass(/border-green-500/, { 
      timeout: 30000 
    });
    
    // Check what's in the basic-info output
    const basicInfoStage = page.locator('[data-testid="stage-card-basic-info"]');
    const basicInfoContent = await basicInfoStage.textContent();
    console.log('Basic Info Output:', basicInfoContent);
    
    // Wait for tone briefing
    await expect(page.locator('[data-testid="stage-card-tone-briefing"]')).toHaveClass(/border-green-500/, { 
      timeout: 60000 
    });
    
    // Check tone briefing output
    const toneStage = page.locator('[data-testid="stage-card-tone-briefing"]');
    const toneContent = await toneStage.textContent();
    console.log('Tone Briefing Output:', toneContent);
    
    // Check console for errors
    const consoleLogs = await page.evaluate(() => {
      return window.console.logs || [];
    });
    console.log('Console logs:', consoleLogs);
    
    // Check for any error messages on the page
    const errorElements = await page.locator('.text-red-500, .text-destructive, [class*="error"]').all();
    for (const element of errorElements) {
      const text = await element.textContent();
      console.log('Error element found:', text);
    }
  });
});