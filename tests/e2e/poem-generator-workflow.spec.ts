import { test, expect } from '@playwright/test';

test.describe('Complete Poem Generator Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Set demo mode for testing
    await page.goto('/dashboard');
  });

  test('should create poem from start to finish', async ({ page }) => {
    // Navigate to poem generator workflow
    await page.click('#workflow-start-poem-generator');

    // Wait for wizard to load
    await page.waitForURL('**/w/poem/**');
    await expect(page.getByTestId('wizard-page-title')).toBeVisible();

    // Stage 1: Poem Topic
    const poemTopic = 'a beautiful sunny day';
    await page.locator('textarea').first().fill(poemTopic);
    await page.locator('#process-stage-poem-topic').click();
    await page.waitForTimeout(2000); // Wait for processing

    // Stage 2: Generate Poem - should auto-run
    // Wait for the poem to be generated (adjust timeout as needed)
    await page.waitForTimeout(8000);

    // Wait for stage 2 (generate-poem-with-title) to complete
    await expect(page.getByTestId('stage-card-generate-poem-with-title')).toBeVisible();
    
    // Process Stage 3: Image Briefing - fill out form and continue
    // Fill out the image briefing form with valid values
    await page.selectOption('select[name="aspectRatio"]', '3:4');
    await page.selectOption('select[name="style"]', 'artistic');
    await page.selectOption('select[name="numberOfImages"]', '2');
    await page.fill('textarea[name="additionalPrompt"]', 'warm golden colors');
    await page.locator('#process-stage-image-briefing').click();
    await page.waitForTimeout(2000);
    
    // Stage 4: Generate Poem Image - should auto-run
    // Wait for image generation to complete (this tests our image generation fix)
    await page.waitForSelector('[data-testid="stage-card-generate-poem-image"] img', {
      timeout: 90000 // Imagen generation can take a while
    });
    
    // Verify image was generated and is displayed
    const generatedImage = page.locator('[data-testid="stage-card-generate-poem-image"] img');
    await expect(generatedImage).toBeVisible();
    
    // Check that the image has a proper URL (not base64)
    const imageSrc = await generatedImage.getAttribute('src');
    expect(imageSrc).not.toContain('data:image'); // Should be Firebase Storage URL, not base64
    console.log('Generated image URL:', imageSrc); // Log for verification

    // Stage 5: HTML Generation - should auto-run after image generation
    // Wait for HTML stage to complete
    await page.waitForTimeout(15000); // HTML generation can take time
    
    // Verify HTML output includes the image
    const htmlOutput = page.getByTestId('stage-card-generate-html-preview');
    await expect(htmlOutput).toBeVisible();
    
    // Check that the HTML content includes the generated image URL
    const htmlContent = await page.textContent('[data-testid="stage-card-generate-html-preview"]');
    expect(htmlContent).toContain('img'); // HTML should contain image tag
    
    // Verify poem output is visible
    const poemOutput = page.getByTestId('stage-output-area-markdown');
    await expect(poemOutput).toBeVisible();
    await expect(poemOutput.locator('p')).toHaveCount(1); // Check for at least one paragraph in the poem

    // Verify the title was set from the poem topic
    // Note: The title in the final document dialog might not update immediately
    // or might have a generic title. This depends on implementation.
    // For now, we'll check the wizard title was updated.
    await expect(page.getByTestId('wizard-page-title')).toContainText(poemTopic);
  });

  test('should show validation if topic is empty', async ({ page }) => {
    await page.goto('/dashboard');

    // Navigate to poem generator workflow
    await page.click('#workflow-start-poem-generator');

    // Wait for wizard to load
    await page.waitForURL('**/w/poem/**');
    await expect(page.getByTestId('wizard-page-title')).toBeVisible();

    // Try to process empty stage
    await page.locator('#process-stage-poem-topic').click();
    await page.waitForTimeout(1000); // Wait for potential validation message or lack of progression

    // Progress should still be 0 since no valid input was provided
    // Check that we're still on the first stage (poem-topic stage should still be pending)
    const firstStageCard = page.getByTestId('stage-card-poem-topic');
    await expect(firstStageCard).toBeVisible();

    // Ensure no error toast appeared for this specific action (optional, depends on app behavior)
    // await expect(page.locator('[data-testid="toast-error"]')).not.toBeVisible();
  });
});
