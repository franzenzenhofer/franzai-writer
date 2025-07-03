import { test, expect } from '@playwright/test';

/**
 * Focused test to debug autorunDependsOn feature in poem workflow
 * Tests that HTML preview autoruns when poem and image are done,
 * but NOT waiting for optional html-briefing
 */

test.describe('Poem Workflow - AutorunDependsOn Debug Test', () => {
  test.skip(({ browserName }) => browserName !== 'chromium', 'Chrome only for debugging');
  
  const BASE_URL = 'http://localhost:9002';
  
  test('autorunDependsOn should trigger HTML preview without html-briefing', async ({ page }) => {
    console.log('🔍 Starting autorunDependsOn debug test...');
    
    // Enable console logging to see debug messages
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('[Autorun') || text.includes('generate-html-preview')) {
        console.log('🖥️ Browser:', text);
      }
    });
    
    // Navigate to dashboard
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForSelector('text=Start a new document', { timeout: 10000 });
    
    // Start poem generator
    console.log('📝 Starting poem generator...');
    await page.click('#workflow-start-poem-generator');
    await page.waitForSelector('textarea', { timeout: 10000 });
    
    // Stage 1: Enter poem topic
    console.log('📝 Stage 1: Entering poem topic...');
    const poemTopic = 'A simple test poem about debugging code';
    await page.fill('textarea', poemTopic);
    await page.click('#process-stage-poem-topic');
    
    // Wait for Stage 2: Poem generation (autorun)
    console.log('⏳ Stage 2: Waiting for poem generation...');
    // Wait for the poem content to appear
    await page.waitForSelector('text=Poem Title', { timeout: 30000 });
    await page.waitForSelector('text=Poem Content', { timeout: 5000 });
    console.log('✅ Poem generated');
    
    // Stage 3: Image customization (manual)
    console.log('🖼️ Stage 3: Processing image customization...');
    await page.waitForSelector('#process-stage-image-briefing', { timeout: 10000 });
    await page.click('#process-stage-image-briefing');
    
    // Wait for Stage 4: Image prompt creation (autorun)
    console.log('⏳ Stage 4: Waiting for image prompt creation...');
    // Wait for the stage to no longer show "Waiting for"
    await page.waitForFunction(() => {
      const stageEl = document.querySelector('[data-testid="stage-card-create-image-prompt"]');
      return stageEl && !stageEl.textContent?.includes('Waiting for:');
    }, { timeout: 30000 });
    console.log('✅ Image prompt created');
    
    // Wait for Stage 5: Image generation (autorun)
    console.log('⏳ Stage 5: Waiting for image generation...');
    await page.waitForSelector('[data-testid="stage-card-generate-poem-image"] img', { 
      timeout: 60000 
    });
    console.log('✅ Image generated');
    
    // Critical test: HTML preview should autorun NOW without html-briefing
    console.log('🎯 CRITICAL: Checking if HTML preview autoruns...');
    
    // Check html-briefing stage status (should be idle/optional)
    const htmlBriefingCard = page.locator('[data-testid="stage-card-html-briefing"]');
    await expect(htmlBriefingCard).toBeVisible();
    
    // Get the status of html-briefing - it should NOT be completed
    const htmlBriefingStatus = await htmlBriefingCard.evaluate(el => {
      const statusEl = el.querySelector('[data-status]');
      return statusEl?.getAttribute('data-status') || 'unknown';
    });
    console.log(`📋 HTML Briefing status: ${htmlBriefingStatus}`);
    expect(htmlBriefingStatus).not.toBe('completed');
    
    // HTML preview should autorun despite html-briefing not being completed
    console.log('⏳ Waiting for HTML preview to autorun...');
    
    // Add timeout and detailed error for debugging
    try {
      await page.waitForSelector('[data-testid="stage-card-generate-html-preview"] iframe', { 
        timeout: 15000 
      });
      console.log('✅ HTML preview autorun SUCCESS!');
    } catch (error) {
      // If it fails, check the stage status
      const htmlPreviewCard = page.locator('[data-testid="stage-card-generate-html-preview"]');
      const isVisible = await htmlPreviewCard.isVisible();
      
      if (isVisible) {
        const previewStatus = await htmlPreviewCard.evaluate(el => {
          const statusEl = el.querySelector('[data-status]');
          return statusEl?.getAttribute('data-status') || 'unknown';
        });
        console.error(`❌ HTML preview did NOT autorun. Status: ${previewStatus}`);
        
        // Check if manual button is visible (indicates it didn't autorun)
        const manualButton = page.locator('#process-stage-generate-html-preview');
        const buttonVisible = await manualButton.isVisible();
        console.error(`❌ Manual process button visible: ${buttonVisible}`);
      }
      
      throw new Error('HTML preview did not autorun as expected with autorunDependsOn');
    }
    
    // Verify the workflow completion
    console.log('🔍 Verifying final state...');
    
    // HTML briefing should still be optional/incomplete
    const finalHtmlBriefingStatus = await htmlBriefingCard.evaluate(el => {
      const badge = el.querySelector('.badge');
      return badge?.textContent || 'unknown';
    });
    console.log(`📋 Final HTML Briefing status: ${finalHtmlBriefingStatus}`);
    expect(finalHtmlBriefingStatus).toContain('Optional');
    
    // Export button should be visible
    await expect(page.locator('text=Export & Publish Poem')).toBeVisible();
    
    console.log('🎉 autorunDependsOn test completed successfully!');
  });
});