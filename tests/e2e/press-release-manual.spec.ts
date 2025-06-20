import { test, expect } from '@playwright/test';

test.describe('Press Release Manual Flow', () => {
  test('manually process all stages to generate press release', async ({ page }) => {
    console.log('Starting manual press release test');
    
    // Navigate to the workflow
    await page.goto('/w/press-release/new');
    await page.waitForLoadState('networkidle');
    
    // Fill basic information
    await page.locator('input[placeholder*="New Product Launch"]').fill('AI Analytics Platform Launch');
    await page.locator('textarea[placeholder*="We\'re launching"]').fill(
      'We are launching DataSense AI, an advanced analytics platform that uses machine learning to provide real-time business insights.'
    );
    await page.locator('input[placeholder*="TechCorp Inc."]').fill('InnovateTech Solutions');
    await page.locator('input[placeholder*="https://example.com"]').fill('https://www.innovatetech.com');
    
    // Process basic info
    await page.click('#process-stage-basic-info');
    await expect(page.locator('[data-testid="stage-card-basic-info"]')).toHaveClass(/border-green-500/, { 
      timeout: 15000 
    });
    console.log('✅ Basic info completed');
    
    // Manually run tone-briefing
    await page.click('button[data-testid="ai-redo-tone-briefing"], #process-stage-tone-briefing');
    await expect(page.locator('[data-testid="stage-card-tone-briefing"]')).toHaveClass(/border-green-500/, { 
      timeout: 30000 
    });
    console.log('✅ Tone briefing completed');
    
    // Manually run research
    await page.click('button[data-testid="ai-redo-research"], #process-stage-research');
    await expect(page.locator('[data-testid="stage-card-research"]')).toHaveClass(/border-green-500/, { 
      timeout: 60000 
    });
    console.log('✅ Research completed');
    
    // Check if key-facts is already completed (auto-run)
    const keyFactsCard = page.locator('[data-testid="stage-card-key-facts"]');
    const keyFactsClasses = await keyFactsCard.getAttribute('class');
    
    if (keyFactsClasses?.includes('border-green-500')) {
      console.log('✅ Key facts already completed (auto-run)');
    } else {
      // If not completed, run it manually
      await page.click('button[data-testid="ai-redo-key-facts"], #process-stage-key-facts');
      await expect(keyFactsCard).toHaveClass(/border-green-500/, { 
        timeout: 30000 
      });
      console.log('✅ Key facts completed');
    }
    
    // Check if contact-info is already completed (auto-run)
    const contactInfoCard = page.locator('[data-testid="stage-card-contact-info"]');
    const contactInfoClasses = await contactInfoCard.getAttribute('class');
    
    if (contactInfoClasses?.includes('border-green-500')) {
      console.log('✅ Contact info already completed (auto-run)');
    } else {
      // If not completed, run it manually
      await page.click('button[data-testid="ai-redo-contact-info"], #process-stage-contact-info');
      await expect(contactInfoCard).toHaveClass(/border-green-500/, { 
        timeout: 30000 
      });
      console.log('✅ Contact info completed');
    }
    
    // Check if final press release is already completed (auto-run)
    const finalPRCard = page.locator('[data-testid="stage-card-final-press-release"]');
    const finalPRClasses = await finalPRCard.getAttribute('class');
    
    if (finalPRClasses?.includes('border-green-500')) {
      console.log('✅ Final press release already completed (auto-run)');
    } else {
      // If not completed, run it manually
      await page.click('button[data-testid="ai-redo-final-press-release"], #process-stage-final-press-release');
      await expect(finalPRCard).toHaveClass(/border-green-500/, { 
        timeout: 60000 
      });
      console.log('✅ Final press release completed');
    }
    
    // Extract press release content
    const finalStage = page.locator('[data-testid="stage-card-final-press-release"]');
    const content = await finalStage.locator('.prose, [data-testid="markdown-content"], pre, .whitespace-pre-wrap').first().textContent();
    
    console.log('\n=== PRESS RELEASE GENERATED ===');
    console.log(content);
    console.log('=== END ===\n');
    
    // Verify content includes key elements
    expect(content).toContain('FOR IMMEDIATE RELEASE');
    expect(content).toContain('InnovateTech Solutions');
    expect(content).toContain('DataSense AI');
    
    // Take screenshot
    await page.screenshot({ path: 'press-release-manual-complete.png', fullPage: true });
    console.log('Screenshot saved: press-release-manual-complete.png');
  });
});