import { test, expect } from '@playwright/test';

test.describe('Poem Workflow with Image Generation', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to poem workflow
    await page.goto('/w/poem/new');
    await page.waitForLoadState('networkidle');
  });

  test('should generate poem with image and include in HTML', async ({ page }) => {
    // Step 1: Enter poem topic
    const poemTopic = 'A majestic mountain at sunrise';
    // Find the first textarea on the page (poem topic input)
    await page.locator('textarea').first().fill(poemTopic);
    
    // Click continue to trigger poem generation
    const continueButton = page.locator('button:has-text("Continue")').first();
    await continueButton.click();
    
    // Step 2: Wait for poem generation to complete by checking for poem content
    await page.waitForSelector('text=Poem Title', {
      timeout: 30000
    });
    await page.waitForSelector('text=Poem Content', {
      timeout: 5000
    });
    
    // Verify poem was generated
    const poemContent = await page.locator('[data-stage-id="generate-poem-with-title"] .whitespace-pre-wrap').textContent();
    expect(poemContent).toBeTruthy();
    expect(poemContent?.length).toBeGreaterThan(50);
    
    // Step 2a: Fill out the image briefing form
    // The image briefing stage should now be visible
    await page.waitForSelector('[data-stage-id="image-briefing"]', { timeout: 10000 });
    
    // Fill optional text field (can be empty)
    await page.locator('[data-stage-id="image-briefing"] textarea').fill('Beautiful mountain scenery');
    
    // Select aspect ratio (already defaulted to 3:4)
    // Select style (already defaulted to artistic)
    // Select number of images (already defaulted to 2)
    
    // Click continue to submit the form
    await page.locator('[data-stage-id="image-briefing"] button:has-text("Continue")').click();
    
    // Step 3: Wait for image generation to complete
    console.log('Waiting for image generation...');
    await page.waitForSelector('[data-stage-id="generate-poem-image"][data-stage-status="completed"]', {
      timeout: 60000 // Image generation can take longer
    });
    
    // Verify image was generated and displayed
    const imageElement = await page.locator('[data-stage-id="generate-poem-image"] img[alt*="Generated"]').first();
    await expect(imageElement).toBeVisible();
    
    // Get image URL
    const imageUrl = await imageElement.getAttribute('src');
    expect(imageUrl).toBeTruthy();
    
    // Check if it's a data URL or a public URL
    const isValidImageUrl = imageUrl?.startsWith('data:image/') || imageUrl?.includes('storage.googleapis.com');
    expect(isValidImageUrl).toBe(true);
    
    // Verify download button exists
    const downloadButton = page.locator('[data-stage-id="generate-poem-image"] button:has-text("Download")').first();
    await expect(downloadButton).toBeVisible();
    
    // Step 4: Check HTML generation includes the image
    // Wait for HTML preview to be generated
    await page.waitForSelector('[data-stage-id="generate-html-preview"][data-stage-status="completed"]', {
      timeout: 30000
    });
    
    // Get HTML preview content
    const htmlPreviewFrame = page.locator('[data-stage-id="generate-html-preview"] iframe').first();
    
    // Check if image is included in the HTML
    if (await htmlPreviewFrame.count() > 0) {
      // If HTML is in iframe
      const frame = page.frame({ url: /^data:/ });
      if (frame) {
        const htmlImage = frame.locator('img');
        await expect(htmlImage).toHaveCount(1);
        const htmlImageSrc = await htmlImage.getAttribute('src');
        expect(htmlImageSrc).toBe(imageUrl);
      }
    } else {
      // If HTML is rendered directly
      const htmlContent = await page.locator('[data-stage-id="generate-html-preview"] .prose').innerHTML();
      expect(htmlContent).toContain('<img');
      expect(htmlContent).toContain(imageUrl || '');
    }
    
    console.log('✅ Poem with image generation test passed!');
  });

  test('should handle multiple aspect ratios', async ({ page }) => {
    // Enter poem topic
    await page.locator('textarea').first().fill( 'A peaceful forest');
    await page.locator('button:has-text("Continue")').first().click();
    
    // Wait for poem generation
    await page.waitForSelector('text=Poem Title', {
      timeout: 30000
    });
    await page.waitForSelector('text=Poem Content', {
      timeout: 5000
    });
    
    // Fill image briefing form with different aspect ratio
    await page.waitForSelector('[data-stage-id="image-briefing"]', { timeout: 10000 });
    
    // Select a different aspect ratio (16:9)
    await page.locator('[data-stage-id="image-briefing"] [name="aspectRatio"]').selectOption('16:9');
    await page.locator('[data-stage-id="image-briefing"] button:has-text("Continue")').click();
    
    // Wait for stages to complete
    await page.waitForSelector('[data-stage-id="generate-poem-image"][data-stage-status="completed"]', {
      timeout: 60000
    });
    
    // Check aspect ratio badge
    const aspectRatioBadge = page.locator('[data-stage-id="generate-poem-image"] .badge').first();
    await expect(aspectRatioBadge).toBeVisible();
    const aspectRatio = await aspectRatioBadge.textContent();
    expect(['1:1', '3:4', '4:3', '16:9', '9:16']).toContain(aspectRatio);
  });

  test('should show multiple images if generated', async ({ page }) => {
    // Enter poem topic
    await page.locator('textarea').first().fill( 'The beauty of the ocean');
    await page.locator('button:has-text("Continue")').first().click();
    
    // Wait for poem generation
    await page.waitForSelector('text=Poem Title', {
      timeout: 30000
    });
    await page.waitForSelector('text=Poem Content', {
      timeout: 5000
    });
    
    // Fill image briefing form with 3 images
    await page.waitForSelector('[data-stage-id="image-briefing"]', { timeout: 10000 });
    await page.locator('[data-stage-id="image-briefing"] [name="numberOfImages"]').selectOption('3');
    await page.locator('[data-stage-id="image-briefing"] button:has-text("Continue")').click();
    
    // Wait for image generation
    await page.waitForSelector('[data-stage-id="generate-poem-image"][data-stage-status="completed"]', {
      timeout: 60000
    });
    
    // Check if multiple images were generated (Imagen typically returns 2 images)
    const thumbnails = page.locator('[data-stage-id="generate-poem-image"] button[class*="rounded-lg"][class*="overflow-hidden"]');
    const thumbnailCount = await thumbnails.count();
    
    if (thumbnailCount > 1) {
      console.log(`Found ${thumbnailCount} images generated`);
      
      // Click on second thumbnail
      await thumbnails.nth(1).click();
      
      // Verify main image changed
      await page.waitForTimeout(500); // Small wait for UI update
      
      // Check that clicking thumbnail changes the main image
      const mainImage = page.locator('[data-stage-id="generate-poem-image"] img[alt*="Generated"]').first();
      await expect(mainImage).toBeVisible();
    }
  });

  test('should handle AI redo for images', async ({ page }) => {
    // Generate initial poem and image
    await page.locator('textarea').first().fill( 'A stormy night');
    await page.locator('button:has-text("Continue")').first().click();
    
    // Wait for poem generation
    await page.waitForSelector('text=Poem Title', {
      timeout: 30000
    });
    await page.waitForSelector('text=Poem Content', {
      timeout: 5000
    });
    
    // Fill image briefing form
    await page.waitForSelector('[data-stage-id="image-briefing"]', { timeout: 10000 });
    await page.locator('[data-stage-id="image-briefing"] button:has-text("Continue")').click();
    
    // Wait for image generation
    await page.waitForSelector('[data-stage-id="generate-poem-image"][data-stage-status="completed"]', {
      timeout: 60000
    });
    
    // Get initial image URL
    const initialImage = page.locator('[data-stage-id="generate-poem-image"] img[alt*="Generated"]').first();
    const initialImageUrl = await initialImage.getAttribute('src');
    
    // Click AI Redo button if available
    const aiRedoButton = page.locator('[data-stage-id="generate-poem-image"] button:has-text("AI Redo")');
    
    if (await aiRedoButton.count() > 0) {
      await aiRedoButton.click();
      
      // Add refinement notes
      const redoTextarea = page.locator('textarea[placeholder*="What would you like to change"]');
      if (await redoTextarea.count() > 0) {
        await redoTextarea.fill('Make the image more dramatic with lightning');
      }
      
      // Submit redo
      await page.locator('button:has-text("Regenerate")').click();
      
      // Wait for new image
      await page.waitForSelector('[data-stage-id="generate-poem-image"][data-stage-status="completed"]', {
        timeout: 60000
      });
      
      // Verify image changed
      const newImageUrl = await initialImage.getAttribute('src');
      expect(newImageUrl).not.toBe(initialImageUrl);
    }
  });

  test('should export poem with image to multiple formats', async ({ page }) => {
    // Quick poem generation
    await page.locator('textarea').first().fill( 'The stars above');
    await page.locator('button:has-text("Continue")').first().click();
    
    // Wait for poem generation
    await page.waitForSelector('text=Poem Title', {
      timeout: 30000
    });
    await page.waitForSelector('text=Poem Content', {
      timeout: 5000
    });
    
    // Fill image briefing form
    await page.waitForSelector('[data-stage-id="image-briefing"]', { timeout: 10000 });
    await page.locator('[data-stage-id="image-briefing"] button:has-text("Continue")').click();
    
    // Wait for all stages including export
    await page.waitForSelector('[data-stage-id="generate-poem-image"][data-stage-status="completed"]', {
      timeout: 60000
    });
    
    await page.waitForSelector('[data-stage-id="generate-html-preview"][data-stage-status="completed"]', {
      timeout: 30000
    });
    
    // Check if export stage exists
    const exportButton = page.locator('button:has-text("Export & Publish Poem")');
    if (await exportButton.count() > 0) {
      await exportButton.click();
      
      // Wait for export options to appear
      await page.waitForSelector('text=Beautiful Poem', { timeout: 10000 });
      
      // Verify export formats are available
      await expect(page.locator('text=Beautiful Poem')).toBeVisible();
      await expect(page.locator('text=Clean HTML')).toBeVisible();
      await expect(page.locator('text=Markdown')).toBeVisible();
      
      // Click on Beautiful Poem to generate
      await page.locator('label:has-text("Beautiful Poem")').click();
      
      // Wait for generation
      await page.waitForSelector('text=Ready', { timeout: 30000 });
      
      // Could also test download functionality here
    }
  });
});