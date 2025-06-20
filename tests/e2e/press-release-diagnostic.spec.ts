import { test, expect } from '@playwright/test';

test.describe('Press Release Diagnostic', () => {
  test('diagnose final press release generation', async ({ page }) => {
    console.log('Starting diagnostic test');
    
    // Navigate to the workflow
    await page.goto('/w/press-release/new');
    await page.waitForLoadState('networkidle');
    
    // Fill basic information
    await page.locator('input[placeholder*="New Product Launch"]').fill('Quick Test Launch');
    await page.locator('textarea[placeholder*="We\'re launching"]').fill('Quick test for diagnostics');
    await page.locator('input[placeholder*="TechCorp Inc."]').fill('Test Company');
    
    // Process basic info
    await page.click('#process-stage-basic-info');
    await expect(page.locator('[data-testid="stage-card-basic-info"]')).toHaveClass(/border-green-500/, { 
      timeout: 15000 
    });
    
    // Wait for all dependencies of final-press-release
    console.log('Waiting for dependencies...');
    
    const stages = ['tone-briefing', 'research', 'key-facts', 'contact-info'];
    for (const stage of stages) {
      const card = page.locator(`[data-testid="stage-card-${stage}"]`);
      console.log(`Waiting for ${stage}...`);
      
      try {
        await expect(card).toHaveClass(/border-green-500/, { timeout: 60000 });
        console.log(`✅ ${stage} completed`);
      } catch (e) {
        // Check for error
        const errorText = await card.locator('.text-destructive, .text-red-500').textContent().catch(() => null);
        if (errorText) {
          console.log(`❌ ${stage} ERROR:`, errorText);
        } else {
          console.log(`⏳ ${stage} still processing or stuck`);
        }
      }
    }
    
    // Check final-press-release status
    const finalCard = page.locator('[data-testid="stage-card-final-press-release"]');
    const finalClasses = await finalCard.getAttribute('class');
    console.log('Final press release classes:', finalClasses);
    
    // Check for any error
    const finalError = await finalCard.locator('.text-destructive, .text-red-500').textContent().catch(() => null);
    if (finalError) {
      console.log('❌ FINAL PRESS RELEASE ERROR:', finalError);
    }
    
    // Take diagnostic screenshot
    await page.screenshot({ path: 'press-release-diagnostic.png', fullPage: true });
    console.log('Diagnostic screenshot saved');
  });
});