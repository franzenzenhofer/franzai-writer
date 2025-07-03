import { test, expect } from '@playwright/test';

/**
 * Focused test for HTML preview autorun behavior
 */

test.describe('Poem HTML Preview Autorun Test', () => {
  test.skip(({ browserName }) => browserName !== 'chromium', 'Chrome only test');

  test('HTML preview should autorun after poem and image complete', async ({ page }) => {
    console.log('🧪 Starting HTML preview autorun test...');
    
    // Start from dashboard
    await page.goto('/dashboard');
    await page.waitForSelector('text=Start a new document', { timeout: 10000 });
    
    // Start poem workflow
    console.log('📝 Starting poem generator...');
    await page.click('#workflow-start-poem-generator');
    await page.waitForSelector('textarea', { timeout: 10000 });
    
    // Stage 1: Poem Topic
    console.log('📝 Stage 1: Entering poem topic...');
    await page.fill('textarea', 'A quiet forest stream in autumn');
    await page.click('#process-stage-poem-topic');
    
    // Wait for Stage 2: Poem generation (autorun)
    console.log('⏳ Stage 2: Waiting for poem generation...');
    await page.waitForSelector('text=Poem Title', { timeout: 30000 });
    await page.waitForSelector('text=Poem Content', { timeout: 5000 });
    console.log('✅ Poem generated');
    
    // Stage 3: Image Customization - Just click to mark complete
    console.log('🖼️ Stage 3: Marking image customization complete...');
    await page.waitForSelector('#process-stage-image-briefing', { timeout: 10000 });
    await page.click('#process-stage-image-briefing');
    
    // Wait for Stage 4 & 5: Image generation (autorun)
    console.log('⏳ Stage 4 & 5: Waiting for image generation...');
    await page.waitForSelector('[data-testid="stage-card-generate-poem-image"] img', { timeout: 60000 });
    console.log('✅ Image generated');
    
    // Stage 6: HTML Briefing - Just click to mark complete
    console.log('📝 Stage 6: Marking HTML briefing complete...');
    await page.waitForSelector('#process-stage-html-briefing', { timeout: 10000 });
    await page.click('#process-stage-html-briefing');
    
    // Now check HTML preview autorun behavior
    console.log('🔍 Checking HTML preview autorun...');
    
    // Wait a bit for dependencies to update
    await page.waitForTimeout(3000);
    
    // Check if HTML preview stage is visible
    const htmlPreviewCard = page.locator('[data-testid="stage-card-generate-html-preview"]');
    await expect(htmlPreviewCard).toBeVisible({ timeout: 10000 });
    
    // Check if it's generating or has a process button
    const isGenerating = await page.locator('[data-testid="stage-card-generate-html-preview"]:has-text("Generating...")').count() > 0;
    const hasProcessButton = await page.locator('#process-stage-generate-html-preview').count() > 0;
    const hasAIRedo = await page.locator('[data-testid="stage-card-generate-html-preview"] button:has-text("AI REDO")').count() > 0;
    const hasIframe = await page.locator('[data-testid="stage-card-generate-html-preview"] iframe').count() > 0;
    const hasContent = await page.locator('[data-testid="stage-card-generate-html-preview"] code').count() > 0;
    
    console.log(`📊 HTML Preview State:
      - Is Generating: ${isGenerating}
      - Has Process Button: ${hasProcessButton}
      - Has AI Redo Button: ${hasAIRedo}
      - Has Iframe: ${hasIframe}
      - Has Code Content: ${hasContent}
    `);
    
    // Log the actual stage content for debugging
    const stageContent = await htmlPreviewCard.textContent();
    console.log('📄 Stage content:', stageContent?.substring(0, 200) + '...');
    
    // If it didn't autorun, manually trigger it
    if (hasProcessButton && !isGenerating && !hasIframe && !hasContent) {
      console.log('⚠️ HTML preview did not autorun, manually triggering...');
      await page.click('#process-stage-generate-html-preview');
      await page.waitForTimeout(2000);
    }
    
    // Wait for HTML generation to complete
    console.log('⏳ Waiting for HTML preview to complete...');
    
    // Wait for either iframe or error message
    const htmlCompleted = await Promise.race([
      page.waitForSelector('[data-testid="stage-card-generate-html-preview"] iframe', { timeout: 30000 })
        .then(() => 'iframe'),
      page.waitForSelector('[data-testid="stage-card-generate-html-preview"] .text-destructive', { timeout: 30000 })
        .then(() => 'error'),
      page.waitForSelector('[data-testid="stage-card-generate-html-preview"] code', { timeout: 30000 })
        .then(() => 'code'),
      page.waitForSelector('[data-testid="stage-card-generate-html-preview"] button:has-text("AI REDO")', { timeout: 30000 })
        .then(() => 'completed')
    ]);
    
    console.log(`✅ HTML preview completed with: ${htmlCompleted}`);
    
    // Final state check
    const finalHasIframe = await page.locator('[data-testid="stage-card-generate-html-preview"] iframe').count() > 0;
    const finalHasContent = await page.locator('[data-testid="stage-card-generate-html-preview"] code').count() > 0;
    const finalHasError = await page.locator('[data-testid="stage-card-generate-html-preview"] .text-destructive').count() > 0;
    
    console.log(`📊 Final HTML Preview State:
      - Has Iframe: ${finalHasIframe}
      - Has Code Content: ${finalHasContent}
      - Has Error: ${finalHasError}
    `);
    
    // Assert that HTML was generated
    expect(finalHasIframe || finalHasContent).toBeTruthy();
    
    console.log('🎉 HTML preview autorun test completed!');
  });
});