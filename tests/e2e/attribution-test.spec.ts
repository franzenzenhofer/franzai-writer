import { test, expect } from '@playwright/test';

test.describe('Image Attribution Test', () => {
  test('Should include Imagen attribution in poem exports', async ({ page }) => {
    // Navigate to poem workflow
    await page.goto('/');
    await page.click('text=Create a Poem');
    
    // Fill in poem topic
    await page.fill('textarea[placeholder*="Compose a heartfelt poem"]', 'a simple test poem about the sun');
    await page.click('#process-stage-poem-topic');
    
    // Wait for poem generation
    await page.waitForSelector('[data-testid="stage-card-generate-poem-with-title"][data-stage-status="completed"]', { timeout: 15000 });
    
    // Skip image briefing (use defaults)
    await page.click('#process-stage-export-publish');
    
    // Wait for export to complete
    await page.waitForSelector('[data-testid="stage-card-export-publish"][data-stage-status="completed"]', { timeout: 30000 });
    
    // Check styled HTML for attribution
    await page.click('text=Beautiful Poem');
    await page.click('text=View Document');
    
    // Wait for content and check for attribution
    await page.waitForTimeout(2000);
    const content = await page.content();
    
    // Should contain attribution text
    expect(content).toContain('Generated with AI using Google Imagen');
    
    console.log('✅ Attribution found in HTML content');
  });
});