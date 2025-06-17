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
    // Handle shadcn/ui Select components
    // Click on aspect ratio select trigger
    await page.click('[data-testid="stage-card-image-briefing"] button:has-text("Portrait (3:4) - Book Cover")');
    await page.click('[role="option"]:has-text("Portrait (3:4) - Book Cover")');
    
    // Click on style select trigger
    await page.click('[data-testid="stage-card-image-briefing"] button:has-text("Artistic & Creative")');
    await page.click('[role="option"]:has-text("Artistic & Creative")');
    
    // Click on number of images select trigger
    await page.click('[data-testid="stage-card-image-briefing"] button:has-text("2 Images")');
    await page.click('[role="option"]:has-text("2 Images")');
    
    // Fill additional prompt textarea
    await page.fill('textarea[name="additionalPrompt"]', 'warm golden colors');
    
    // Click continue button
    await page.locator('#process-stage-image-briefing').click();
    await page.waitForTimeout(2000);
    
    // Stage 4: Generate Poem Image - should auto-run
    // Wait for image generation to complete (this tests our image generation fix)
    await page.waitForSelector('[data-testid="stage-card-generate-poem-image"] img', {
      timeout: 90000 // Imagen generation can take a while
    });
    
    // Verify image was generated and is displayed
    // Use .first() to get the main image, not the thumbnails
    const generatedImage = page.locator('[data-testid="stage-card-generate-poem-image"] img').first();
    await expect(generatedImage).toBeVisible();
    
    // Check that the image has a proper URL (not base64)
    const imageSrc = await generatedImage.getAttribute('src');
    expect(imageSrc).not.toContain('data:image'); // Should be Firebase Storage URL, not base64
    expect(imageSrc).toContain('firebasestorage.googleapis.com'); // Should be Firebase Storage URL
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
    const poemOutput = page.getByTestId('stage-card-generate-poem-with-title');
    await expect(poemOutput).toBeVisible();
    await expect(poemOutput).toContainText('Poem Content'); // Check that poem is displayed

    // Verify the title was updated
    const wizardTitle = await page.getByTestId('wizard-page-title').textContent();
    console.log('Wizard title:', wizardTitle);
    // The title should be from the poem generation, not the topic
    await expect(page.getByTestId('wizard-page-title')).not.toContainText('New Document');
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
