import { test, expect } from '@playwright/test';

test.describe('Press Release Debug', () => {
  test('debug auto-run stages', async ({ page }) => {
    console.log('Starting debug test');
    
    // Navigate to the workflow
    await page.goto('/w/press-release/new');
    await page.waitForLoadState('networkidle');
    
    // Fill basic information
    await page.locator('input[placeholder*="New Product Launch"]').fill('Debug Test Launch');
    await page.locator('textarea[placeholder*="We\'re launching"]').fill('Debug test message');
    await page.locator('input[placeholder*="TechCorp Inc."]').fill('Debug Company');
    await page.locator('input[placeholder*="https://example.com"]').fill('https://debug.com');
    
    // Process basic info stage
    await page.click('#process-stage-basic-info');
    
    // Wait for basic info to complete
    await expect(page.locator('[data-testid="stage-card-basic-info"]')).toHaveClass(/border-green-500/, { 
      timeout: 15000 
    });
    
    console.log('Basic info completed');
    
    // Monitor tone-briefing stage
    const toneBriefingCard = page.locator('[data-testid="stage-card-tone-briefing"]');
    console.log('Waiting for tone-briefing to start...');
    
    // Check if tone-briefing has an error
    await page.waitForTimeout(5000); // Give it time to process
    
    const toneBriefingError = await toneBriefingCard.locator('.text-destructive, .text-red-500').textContent().catch(() => null);
    if (toneBriefingError) {
      console.log('TONE BRIEFING ERROR:', toneBriefingError);
    }
    
    const toneBriefingContent = await toneBriefingCard.locator('pre, code').first().textContent().catch(() => null);
    if (toneBriefingContent) {
      console.log('TONE BRIEFING OUTPUT:', toneBriefingContent.substring(0, 200) + '...');
    }
    
    // Check research stage
    const researchCard = page.locator('[data-testid="stage-card-research"]');
    await page.waitForTimeout(10000); // Give more time for research
    
    const researchError = await researchCard.locator('.text-destructive, .text-red-500').textContent().catch(() => null);
    if (researchError) {
      console.log('RESEARCH ERROR:', researchError);
    }
    
    const researchContent = await researchCard.locator('pre, code').first().textContent().catch(() => null);
    if (researchContent) {
      console.log('RESEARCH OUTPUT:', researchContent.substring(0, 200) + '...');
    }
    
    // Check key-facts stage
    const keyFactsCard = page.locator('[data-testid="stage-card-key-facts"]');
    const keyFactsError = await keyFactsCard.locator('.text-destructive, .text-red-500').textContent().catch(() => null);
    if (keyFactsError) {
      console.log('KEY FACTS ERROR:', keyFactsError);
    }
    
    // Take screenshot
    await page.screenshot({ path: 'press-release-debug.png', fullPage: true });
    console.log('Screenshot saved to press-release-debug.png');
    
    // Print all stage states
    const stages = ['basic-info', 'tone-briefing', 'research', 'key-facts', 'contact-info', 'final-press-release'];
    for (const stage of stages) {
      const card = page.locator(`[data-testid="stage-card-${stage}"]`);
      const classes = await card.getAttribute('class').catch(() => 'not found');
      const hasGreenBorder = classes.includes('border-green-500');
      const hasRedBorder = classes.includes('border-destructive');
      console.log(`Stage ${stage}: ${hasGreenBorder ? '✅ SUCCESS' : hasRedBorder ? '❌ ERROR' : '⏳ PENDING'}`);
    }
  });
});