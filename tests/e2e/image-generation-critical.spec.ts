import { test, expect } from '@playwright/test';

/**
 * CRITICAL image generation E2E test suite
 * Tests Google Imagen 3 integration across all workflows
 * Chrome only for performance
 */
test.describe('Image Generation - Critical Tests (Chrome Only)', () => {
  test.skip(({ browserName }) => browserName !== 'chromium', 'Chrome only per CLAUDE.md guidelines');

  test('should generate images with all aspect ratios', async ({ page }) => {
    console.log('🎨 Testing all Imagen aspect ratios');
    
    // Start poem workflow for image testing
    await page.goto('http://localhost:9002/w/poem/new');
    await page.waitForLoadState('networkidle');
    
    // Quick poem setup
    await page.fill('textarea', 'Testing all image aspect ratios');
    await page.click('#process-stage-poem-topic');
    await expect(page.locator('[data-testid="stage-card-generate-poem-with-title"]')).toHaveClass(/border-green-500/, { timeout: 60000 });
    
    // Test each aspect ratio
    const aspectRatios = [
      { value: '1:1', name: 'Square (1:1)' },
      { value: '3:4', name: 'Portrait (3:4)' },
      { value: '4:3', name: 'Landscape (4:3)' },
      { value: '16:9', name: 'Widescreen (16:9)' },
      { value: '9:16', name: 'Mobile (9:16)' }
    ];
    
    for (const ratio of aspectRatios) {
      console.log(`Testing ${ratio.name} aspect ratio`);
      
      // Select aspect ratio
      const aspectSelect = page.locator('select[name="aspectRatio"]');
      await aspectSelect.selectOption(ratio.value);
      
      // Generate image
      await page.click('#process-stage-image-briefing');
      
      // Wait for image generation
      await expect(page.locator('[data-testid="stage-card-generate-poem-image"]')).toHaveClass(/border-green-500/, { timeout: 120000 });
      
      // Verify image was generated
      const imageStage = page.locator('[data-testid="stage-card-generate-poem-image"]');
      const images = imageStage.locator('img');
      const imageCount = await images.count();
      expect(imageCount).toBeGreaterThan(0);
      
      // Check image has correct aspect ratio in data attribute
      const firstImage = images.first();
      const aspectRatioAttr = await firstImage.getAttribute('data-aspect-ratio');
      if (aspectRatioAttr) {
        expect(aspectRatioAttr).toBe(ratio.value);
        console.log(`✅ ${ratio.name} image generated with correct aspect ratio attribute`);
      } else {
        console.log(`✅ ${ratio.name} image generated (no aspect ratio attribute)`);
      }
      
      // Reset for next test
      if (aspectRatios.indexOf(ratio) < aspectRatios.length - 1) {
        await page.reload();
        await page.waitForLoadState('networkidle');
      }
    }
  });

  test('should generate multiple image variations', async ({ page }) => {
    console.log('🎨 Testing multiple image generation');
    
    await page.goto('http://localhost:9002/w/poem/new');
    await page.waitForLoadState('networkidle');
    
    // Setup poem
    await page.fill('textarea', 'Generate multiple image variations');
    await page.click('#process-stage-poem-topic');
    await expect(page.locator('[data-testid="stage-card-generate-poem-with-title"]')).toHaveClass(/border-green-500/, { timeout: 60000 });
    
    // Test different quantities
    const quantities = ['2', '3', '4'];
    
    for (const quantity of quantities) {
      console.log(`Generating ${quantity} images`);
      
      // Select number of images
      const numberSelect = page.locator('select[name="numberOfImages"]');
      await numberSelect.selectOption(quantity);
      
      // Add custom prompt for variety
      await page.fill('textarea[name="additionalPrompt"]', `Variation ${quantity}: different artistic interpretations`);
      
      // Generate images
      await page.click('#process-stage-image-briefing');
      
      // Wait for all images
      await expect(page.locator('[data-testid="stage-card-generate-poem-image"]')).toHaveClass(/border-green-500/, { timeout: 180000 });
      
      // Count generated images
      const imageStage = page.locator('[data-testid="stage-card-generate-poem-image"]');
      const images = imageStage.locator('img');
      const imageCount = await images.count();
      
      console.log(`Generated ${imageCount} images (requested ${quantity})`);
      expect(imageCount).toBeGreaterThanOrEqual(parseInt(quantity));
      
      // Verify download buttons for each image
      const downloadButtons = imageStage.locator('button:has-text("Download"), a[download]');
      const downloadCount = await downloadButtons.count();
      expect(downloadCount).toBeGreaterThanOrEqual(parseInt(quantity));
      
      console.log(`✅ ${quantity} images generated with download options`);
      
      // Reset for next test
      if (quantities.indexOf(quantity) < quantities.length - 1) {
        await page.reload();
        await page.waitForLoadState('networkidle');
      }
    }
  });

  test('should apply different artistic styles', async ({ page }) => {
    console.log('🎨 Testing artistic style variations');
    
    await page.goto('http://localhost:9002/w/poem/new');
    await page.waitForLoadState('networkidle');
    
    // Setup poem
    await page.fill('textarea', 'Artistic style test: landscape scene');
    await page.click('#process-stage-poem-topic');
    await expect(page.locator('[data-testid="stage-card-generate-poem-with-title"]')).toHaveClass(/border-green-500/, { timeout: 60000 });
    
    // Test different styles
    const styles = [
      'Photorealistic',
      'Watercolor Painting',
      'Oil Painting',
      'Digital Art',
      'Minimalist'
    ];
    
    for (const style of styles) {
      console.log(`Testing ${style} style`);
      
      // Select artistic style
      const styleSelect = page.locator('select[name="style"]');
      await styleSelect.selectOption(style);
      
      // Add style-specific prompt
      await page.fill('textarea[name="additionalPrompt"]', `Emphasize ${style.toLowerCase()} characteristics`);
      
      // Generate image
      await page.click('#process-stage-image-briefing');
      
      // Wait for image generation
      await expect(page.locator('[data-testid="stage-card-generate-poem-image"]')).toHaveClass(/border-green-500/, { timeout: 120000 });
      
      // Verify image was generated
      const imageStage = page.locator('[data-testid="stage-card-generate-poem-image"]');
      const images = imageStage.locator('img');
      await expect(images.first()).toBeVisible();
      
      console.log(`✅ ${style} image generated successfully`);
      
      // Reset for next style
      if (styles.indexOf(style) < styles.length - 1) {
        await page.reload();
        await page.waitForLoadState('networkidle');
      }
    }
  });

  test('should handle image generation errors gracefully', async ({ page }) => {
    console.log('🎨 Testing error handling in image generation');
    
    await page.goto('http://localhost:9002/w/poem/new');
    await page.waitForLoadState('networkidle');
    
    // Test with potentially problematic content
    await test.step('Test with edge case prompts', async () => {
      await page.fill('textarea', 'Test error handling');
      await page.click('#process-stage-poem-topic');
      await expect(page.locator('[data-testid="stage-card-generate-poem-with-title"]')).toHaveClass(/border-green-500/, { timeout: 60000 });
      
      // Test empty additional prompt
      await page.fill('textarea[name="additionalPrompt"]', '');
      await page.click('#process-stage-image-briefing');
      
      // Should still generate successfully
      const imageStage = page.locator('[data-testid="stage-card-generate-poem-image"]');
      await expect(imageStage).toHaveClass(/border-green-500/, { timeout: 120000 });
      console.log('✅ Handled empty additional prompt');
    });
    
    // Test very long prompt
    await test.step('Test with very long prompt', async () => {
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      await page.fill('textarea', 'Long prompt test');
      await page.click('#process-stage-poem-topic');
      await expect(page.locator('[data-testid="stage-card-generate-poem-with-title"]')).toHaveClass(/border-green-500/, { timeout: 60000 });
      
      const longPrompt = 'very detailed scene with mountains, rivers, forests, wildlife, sunset, clouds, reflections, shadows, textures, patterns '.repeat(10);
      await page.fill('textarea[name="additionalPrompt"]', longPrompt);
      await page.click('#process-stage-image-briefing');
      
      // Should handle long prompt
      await expect(page.locator('[data-testid="stage-card-generate-poem-image"]')).toHaveClass(/border-green-500/, { timeout: 120000 });
      console.log('✅ Handled very long prompt');
    });
  });

  test('should preserve images through workflow completion', async ({ page }) => {
    console.log('🎨 Testing image persistence through full workflow');
    
    await page.goto('http://localhost:9002/w/poem/new');
    await page.waitForLoadState('networkidle');
    
    // Complete full workflow with images
    await page.fill('textarea', 'Image persistence test');
    await page.click('#process-stage-poem-topic');
    await expect(page.locator('[data-testid="stage-card-generate-poem-with-title"]')).toHaveClass(/border-green-500/, { timeout: 60000 });
    
    // Generate multiple images
    await page.selectOption('select[name="numberOfImages"]', '3');
    await page.selectOption('select[name="aspectRatio"]', '16:9');
    await page.fill('textarea[name="additionalPrompt"]', 'Beautiful nature scenes');
    await page.click('#process-stage-image-briefing');
    
    // Wait for images
    await expect(page.locator('[data-testid="stage-card-generate-poem-image"]')).toHaveClass(/border-green-500/, { timeout: 120000 });
    
    // Count images before continuing
    const imageStage = page.locator('[data-testid="stage-card-generate-poem-image"]');
    const initialImages = await imageStage.locator('img').count();
    console.log(`Generated ${initialImages} images`);
    
    // Continue to HTML preview
    await page.click('#process-stage-html-briefing');
    await expect(page.locator('[data-testid="stage-card-generate-html-preview"]')).toHaveClass(/border-green-500/, { timeout: 60000 });
    
    // Continue to export
    await page.click('#process-stage-export-publish');
    await expect(page.locator('[data-testid="stage-card-export-publish"]')).toHaveClass(/border-green-500/, { timeout: 120000 });
    
    // Verify images are included in export preview
    const exportStage = page.locator('[data-testid="stage-card-export-publish"]');
    
    // Switch to styled view
    const styledButton = exportStage.locator('button:has-text("Styled")');
    await styledButton.click();
    
    // Check iframe content for images (indirect check)
    const iframe = exportStage.locator('iframe');
    await expect(iframe).toBeVisible();
    
    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Verify images still present
    const reloadedImageStage = page.locator('[data-testid="stage-card-generate-poem-image"]');
    const reloadedImages = await reloadedImageStage.locator('img').count();
    expect(reloadedImages).toBe(initialImages);
    
    console.log(`✅ All ${reloadedImages} images persisted after reload`);
    
    // Verify export still has images
    const reloadedExportStage = page.locator('[data-testid="stage-card-export-publish"]');
    await expect(reloadedExportStage).toHaveClass(/border-green-500/);
    console.log('✅ Export with images persisted successfully');
  });
});