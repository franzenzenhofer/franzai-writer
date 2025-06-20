import { test, expect } from '@playwright/test';

test.describe('Press Release Content Extraction', () => {
  test('extract and display full press release content', async ({ page }) => {
    console.log('Starting press release content extraction');
    
    // Navigate to the workflow
    await page.goto('/w/press-release/new');
    await page.waitForLoadState('networkidle');
    
    // Fill basic information with real data
    await page.locator('input[placeholder*="New Product Launch"]').fill('InnovateTech Solutions Launches Revolutionary AI-Powered Analytics Platform');
    await page.locator('textarea[placeholder*="We\'re launching"]').fill(
      'InnovateTech Solutions today announced the launch of DataSense AI, a groundbreaking analytics platform that leverages advanced machine learning to provide real-time business insights. The platform transforms how companies analyze customer behavior, predict market trends, and make data-driven decisions with unprecedented accuracy and speed.'
    );
    await page.locator('input[placeholder*="TechCorp Inc."]').fill('InnovateTech Solutions');
    await page.locator('input[placeholder*="https://example.com"]').fill('https://www.innovatetech.com');
    
    await page.click('#process-stage-basic-info');
    await expect(page.locator('[data-testid="stage-card-basic-info"]')).toHaveClass(/border-green-500/, { 
      timeout: 30000 
    });
    
    // Wait for all auto-run stages with more reasonable timeouts
    console.log('Waiting for auto-run stages to complete...');
    
    // Wait for tone-briefing
    await expect(page.locator('[data-testid="stage-card-tone-briefing"]')).toHaveClass(/border-green-500/, { 
      timeout: 30000 
    });
    console.log('✅ Tone briefing completed');
    
    // Wait for research (may take longer due to web search)
    await expect(page.locator('[data-testid="stage-card-research"]')).toHaveClass(/border-green-500/, { 
      timeout: 60000 
    });
    console.log('✅ Research completed');
    
    // Wait for key-facts auto-run
    await expect(page.locator('[data-testid="stage-card-key-facts"]')).toHaveClass(/border-green-500/, { 
      timeout: 30000 
    });
    console.log('✅ Key facts auto-generated');
    
    // Key facts are auto-generated, no need to fill manually
    // Wait a bit to ensure contact-info also auto-runs
    await expect(page.locator('[data-testid="stage-card-contact-info"]')).toHaveClass(/border-green-500/, { 
      timeout: 30000 
    });
    console.log('✅ Contact info auto-generated');
    
    // Contact info is auto-generated, no need to fill manually
    
    // Wait for final press release - it may show as processing (border-primary) while content is already visible
    console.log('Waiting for final press release generation...');
    const finalCard = page.locator('[data-testid="stage-card-final-press-release"]');
    
    // Wait for content to appear (the stage might still show as processing)
    await expect(finalCard.locator('text=FOR IMMEDIATE RELEASE')).toBeVisible({ 
      timeout: 60000 
    });
    console.log('✅ Final press release content is visible');
    
    // Wait a bit more to ensure rendering is complete
    await page.waitForTimeout(2000);
    
    // Check for any error messages
    const errorToast = await page.locator('[role="alert"]').textContent().catch(() => null);
    if (errorToast) {
      console.log('ERROR TOAST:', errorToast);
    }
    
    // Extract the press release content
    console.log('\n=== EXTRACTING PRESS RELEASE CONTENT ===\n');
    
    // The content is displayed as plain text in the stage card
    const pressReleaseContent = await finalCard.textContent();
    
    // Print the press release
    console.log('\n=== FULL PRESS RELEASE CONTENT ===\n');
    console.log(pressReleaseContent);
    console.log('\n=== END OF PRESS RELEASE ===\n');
    
    // Take a focused screenshot of just the press release stage
    const finalStage = page.locator('[data-testid="stage-card-final-press-release"]');
    await finalStage.screenshot({ path: 'final-press-release-stage.png' });
    
    // Also take a full page screenshot
    await page.screenshot({ path: 'full-workflow-completed.png', fullPage: true });
    
    console.log('Screenshots saved: final-press-release-stage.png and full-workflow-completed.png');
  });
});