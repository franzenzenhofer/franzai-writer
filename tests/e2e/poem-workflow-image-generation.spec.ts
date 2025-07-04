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
    await page.locator('#process-stage-poem-topic').click();
    
    // Step 2: Wait for poem generation to complete by checking for poem content
    await page.waitForSelector('text=Poem Title', {
      timeout: 30000
    });
    await page.waitForSelector('text=Poem Content', {
      timeout: 5000
    });
    
    // Verify poem was generated by checking for poem title and content in the page
    const poemTitle = await page.locator('text=Poem Title').textContent();
    expect(poemTitle).toBeTruthy();
    
    const poemContentSection = await page.locator('text=Poem Content').textContent();
    expect(poemContentSection).toBeTruthy();
    
    // Verify the actual poem text is visible (look for common poem words)
    const pageText = await page.textContent('body');
    expect(pageText).toContain('Poem Title');
    expect(pageText).toContain('Poem Content');
    expect(pageText?.length || 0).toBeGreaterThan(200); // Ensure substantial content
    
    // Step 2a: Fill out the image briefing form
    // Wait for the image customization form to appear
    await page.waitForSelector('text=Image Customization', { timeout: 10000 });
    await page.waitForSelector('text=Additional Image Instructions', { timeout: 5000 });
    
    // Fill optional text field (find the textarea after "Additional Image Instructions")
    const additionalInstructionsTextarea = page.locator('textarea').nth(1); // Should be the second textarea after poem topic
    await additionalInstructionsTextarea.fill('Beautiful mountain scenery');
    
    // The form fields should have default values already selected
    // Aspect ratio: 3:4, Style: Artistic, Number: 2
    
    // Click the continue button for the image briefing form using the specific stage ID
    await page.locator('#process-stage-image-briefing').click();
    
    // Step 3: Wait for image generation to complete
    console.log('Waiting for image generation...');
    
    // Wait for the image stage to become visible and show completion
    await page.waitForSelector('[data-testid="stage-card-generate-poem-image"]', {
      timeout: 10000
    });
    
    // Wait for the stage to show completed status by looking for a checkmark or success indicator
    await page.waitForSelector('[data-testid="stage-card-generate-poem-image"] svg[data-testid*="check"]', {
      timeout: 90000 // Image generation can take longer
    }).catch(async () => {
      // Alternative: wait for image output to appear
      await page.waitForSelector('[data-testid="stage-card-generate-poem-image"] img', {
        timeout: 90000
      });
    });
    
    // Verify image was generated and displayed
    const imageElement = await page.locator('[data-testid="stage-card-generate-poem-image"] img').first();
    await expect(imageElement).toBeVisible();
    
    // Get image URL
    const imageUrl = await imageElement.getAttribute('src');
    expect(imageUrl).toBeTruthy();
    
    // Check if it's a data URL or a public URL
    const isValidImageUrl = imageUrl?.startsWith('data:image/') || imageUrl?.includes('storage.googleapis.com');
    expect(isValidImageUrl).toBe(true);
    
    // Verify download button exists
    const downloadButton = page.locator('[data-testid="stage-card-generate-poem-image"] button:has-text("Download")').first();
    await expect(downloadButton).toBeVisible();
    
    // Step 4: Check HTML generation includes the image
    // Wait for HTML preview to be generated
    await page.waitForSelector('[data-testid="stage-card-generate-html-preview"]', {
      timeout: 30000
    });
    
    // Get HTML preview content
    const htmlPreviewFrame = page.locator('[data-testid="stage-card-generate-html-preview"] iframe').first();
    
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
      const htmlContent = await page.locator('[data-testid="stage-card-generate-html-preview"] .prose').innerHTML();
      expect(htmlContent).toContain('<img');
      expect(htmlContent).toContain(imageUrl || '');
    }
    
    console.log('✅ Poem with image generation test passed!');
  });

  test('should handle multiple aspect ratios', async ({ page }) => {
    // Enter poem topic
    await page.locator('textarea').first().fill( 'A peaceful forest');
    await page.locator('#process-stage-poem-topic').click();
    
    // Wait for poem generation
    await page.waitForSelector('text=Poem Title', {
      timeout: 30000
    });
    await page.waitForSelector('text=Poem Content', {
      timeout: 5000
    });
    
    // Fill image briefing form with different aspect ratio
    await page.waitForSelector('text=Image Customization', { timeout: 10000 });
    
    // Select a different aspect ratio (16:9) - handle shadcn/ui select
    const aspectRatioButton = page.getByRole('combobox').filter({ hasText: 'Portrait (3:4) - Book Cover' });
    await aspectRatioButton.click();
    await page.getByRole('option', { name: 'Widescreen (16:9) - Desktop' }).click();
    
    await page.locator('#process-stage-image-briefing').click();
    
    // Wait for stages to complete
    await page.waitForSelector('[data-testid="stage-card-generate-poem-image"] [data-testid*="check"]', {
      timeout: 60000
    });
    
    // Check aspect ratio badge
    const aspectRatioBadge = page.locator('[data-testid="stage-card-generate-poem-image"] .badge').first();
    await expect(aspectRatioBadge).toBeVisible();
    const aspectRatio = await aspectRatioBadge.textContent();
    expect(['1:1', '3:4', '4:3', '16:9', '9:16']).toContain(aspectRatio);
  });

  test('should show multiple images if generated', async ({ page }) => {
    // Enter poem topic
    await page.locator('textarea').first().fill( 'The beauty of the ocean');
    await page.locator('#process-stage-poem-topic').click();
    
    // Wait for poem generation
    await page.waitForSelector('text=Poem Title', {
      timeout: 30000
    });
    await page.waitForSelector('text=Poem Content', {
      timeout: 5000
    });
    
    // Fill image briefing form with 3 images
    await page.waitForSelector('text=Image Customization', { timeout: 10000 });
    
    // Select number of images - handle shadcn/ui select
    const numberOfImagesButton = page.getByRole('combobox').filter({ hasText: '2 Images' });
    await numberOfImagesButton.click();
    await page.getByRole('option', { name: '3 Images' }).click();
    
    await page.locator('#process-stage-image-briefing').click();
    
    // Wait for image generation
    await page.waitForSelector('[data-testid="stage-card-generate-poem-image"] [data-testid*="check"]', {
      timeout: 60000
    });
    
    // Check if multiple images were generated (Imagen typically returns 2 images)
    const thumbnails = page.locator('[data-testid="stage-card-generate-poem-image"] button[class*="rounded-lg"][class*="overflow-hidden"]');
    const thumbnailCount = await thumbnails.count();
    
    if (thumbnailCount > 1) {
      console.log(`Found ${thumbnailCount} images generated`);
      
      // Click on second thumbnail
      await thumbnails.nth(1).click();
      
      // Verify main image changed
      await page.waitForTimeout(500); // Small wait for UI update
      
      // Check that clicking thumbnail changes the main image
      const mainImage = page.locator('[data-testid="stage-card-generate-poem-image"] img[alt*="Generated"]').first();
      await expect(mainImage).toBeVisible();
    }
  });

  test('should handle AI redo for images', async ({ page }) => {
    // Generate initial poem and image
    await page.locator('textarea').first().fill( 'A stormy night');
    await page.locator('#process-stage-poem-topic').click();
    
    // Wait for poem generation
    await page.waitForSelector('text=Poem Title', {
      timeout: 30000
    });
    await page.waitForSelector('text=Poem Content', {
      timeout: 5000
    });
    
    // Fill image briefing form
    await page.waitForSelector('text=Image Customization', { timeout: 10000 });
    
    await page.locator('#process-stage-image-briefing').click();
    
    // Wait for image generation
    await page.waitForSelector('[data-testid="stage-card-generate-poem-image"] [data-testid*="check"]', {
      timeout: 60000
    });
    
    // Get initial image URL
    const initialImage = page.locator('[data-testid="stage-card-generate-poem-image"] img[alt*="Generated"]').first();
    const initialImageUrl = await initialImage.getAttribute('src');
    
    // Click AI Redo button if available
    const aiRedoButton = page.locator('[data-testid="stage-card-generate-poem-image"] button:has-text("AI Redo")');
    
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
      await page.waitForSelector('[data-testid="stage-card-generate-poem-image"] [data-testid*="check"]', {
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
    await page.locator('#process-stage-poem-topic').click();
    
    // Wait for poem generation
    await page.waitForSelector('text=Poem Title', {
      timeout: 30000
    });
    await page.waitForSelector('text=Poem Content', {
      timeout: 5000
    });
    
    // Fill image briefing form
    await page.waitForSelector('text=Image Customization', { timeout: 10000 });
    
    await page.locator('#process-stage-image-briefing').click();
    
    // Wait for all stages including export
    await page.waitForSelector('[data-testid="stage-card-generate-poem-image"] [data-testid*="check"]', {
      timeout: 60000
    });
    
    await page.waitForSelector('[data-testid="stage-card-generate-html-preview"] [data-testid*="check"]', {
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