import { test, expect, Page } from '@playwright/test';
import path from 'path';

const RECIPE_WORKFLOW_URL = '/w/recipe';
const DISH_NAME_TEXT = 'Test Dish with Image';
const MOCKED_IMAGE_DESCRIPTION = 'This is a test description of the uploaded image.';
const MOCKED_IDENTIFIED_OBJECTS = ['test object 1', 'test object 2'];

// Helper function to interact with a stage
async function handleStage(
  page: Page,
  stageId: string,
  action: 'input' | 'process' | 'check-output',
  inputValue?: string | { filePath: string } | Record<string, any>,
  expectedOutput?: string | RegExp
) {
  const stageCardSelector = `[data-testid="stage-card-${stageId}"]`;
  const stageCard = page.locator(stageCardSelector);

  await expect(stageCard).toBeVisible({ timeout: 15000 }); // Increased timeout

  if (action === 'input') {
    if (typeof inputValue === 'string') {
      const inputArea = stageCard.locator(`textarea, input[type="text"]`).first();
      await inputArea.fill(inputValue);
    } else if (inputValue && 'filePath' in inputValue) { // For file uploads
      const fileInput = stageCard.locator('input[type="file"]');
      await fileInput.setInputFiles(inputValue.filePath);
    }
  } else if (action === 'process') {
    const processButton = stageCard.locator('button[data-testid="process-stage-button"], button:has-text("Process")').first();
    await processButton.click();
  } else if (action === 'check-output') {
    const outputArea = stageCard.locator('[data-testid="stage-output-area"]');
    if (expectedOutput instanceof RegExp) {
        await expect(outputArea).toHaveText(expectedOutput, { timeout: 20000 }); // Increased timeout for AI processing
    } else {
        await expect(outputArea).toHaveText(expectedOutput!, { timeout: 20000 });
    }
  }
}


test.describe('Recipe Workflow - Image Understanding', () => {
  test.beforeEach(async ({ page }) => {
    // Log in if necessary (assuming auth is handled or not required for this test path)
    // await page.goto('/login');
    // await page.fill('input[name="email"]', 'test@example.com');
    // await page.fill('input[name="password"]', 'password123');
    // await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', {timeout: 10000});

    // Navigate to the new recipe workflow
    await page.getByTestId('create-new-document-button').click();
    const recipeWorkflowCard = page.locator('[data-testid="workflow-card-recipe-seo-optimized"]');
    await recipeWorkflowCard.click();
    await page.waitForURL(`**${RECIPE_WORKFLOW_URL}/**`, {timeout: 10000});
  });

  test('should allow image upload, process it, and display results', async ({ page }) => {
    const documentId = page.url().split('/').pop();
    expect(documentId).toBeDefined();

    // Mock the AI response for the image analysis stage
    await page.route('**/api/ai', async (route) => {
      const request = route.request();
      const postData = request.postDataJSON();

      if (postData?.promptTemplate?.includes("Analyze the provided image")) {
        console.log('Mocking AI response for image analysis');
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            content: JSON.stringify({
              imageDescription: MOCKED_IMAGE_DESCRIPTION,
              identifiedObjects: MOCKED_IDENTIFIED_OBJECTS
            })
          }),
        });
      } else {
        // Let other AI calls pass through or mock them as needed
        await route.continue();
      }
    });

    // 1. Input Dish Name
    await handleStage(page, 'dish-name', 'input', DISH_NAME_TEXT);
    await handleStage(page, 'dish-name', 'process'); // Assuming some auto-processing or button click if needed

    // 2. Upload Image to "Analyze Dish Image" stage
    const imageStageId = 'image-analysis';
    const imagePath = path.resolve('test-image.png'); // Use the image created earlier

    const stageCardSelector = `[data-testid="stage-card-${imageStageId}"]`;
    const stageCard = page.locator(stageCardSelector);
    await expect(stageCard).toBeVisible({ timeout: 10000 });

    const fileInput = stageCard.locator('input[type="file"]');
    await fileInput.setInputFiles(imagePath);

    // Verify image preview (optional, but good for confidence)
    const imagePreview = stageCard.locator('img[alt="Selected preview"]');
    await expect(imagePreview).toBeVisible({ timeout: 5000 });
    await expect(imagePreview).toHaveAttribute('src', /^data:image\/png;base64,/);

    // 3. Process the Image Analysis Stage
    const processButton = stageCard.locator('button[data-testid="process-stage-button"], button:has-text("Process")').first();
    await processButton.click();

    // 4. Check for the (mocked) output
    const outputArea = stageCard.locator('[data-testid="stage-output-area"]');
    // The output is JSON, so we check for parts of it.
    await expect(outputArea).toContainText(MOCKED_IMAGE_DESCRIPTION, { timeout: 15000 });
    await expect(outputArea).toContainText(MOCKED_IDENTIFIED_OBJECTS[0], { timeout: 5000 });

    // 5. (Optional) Verify this output is used in a subsequent stage
    // For example, if 'recipe-description-generation' uses the image description
    const recipeDescStageId = 'recipe-description-generation';
    const recipeDescStageCard = page.locator(`[data-testid="stage-card-${recipeDescStageId}"]`);

    // We need to ensure the dependent stages like cuisine-type, target-audience, etc. are filled
    // or the recipe-description-generation stage might not run correctly or its prompt might be empty.
    // For simplicity, this example assumes recipe-description-generation might be auto-run
    // or we manually trigger it after its dependencies (including image-analysis) are met.

    // Let's assume 'cuisine-type' is filled to allow 'recipe-description-generation' to proceed
    await handleStage(page, 'cuisine-type', 'input', 'Test Cuisine');
    await handleStage(page, 'cuisine-type', 'process'); // if it needs processing

    // Now check the recipe description stage (it's auto-run in the workflow)
    // We'll need to mock its AI response too if we want to check its output precisely
    await page.route('**/api/ai', async (route) => {
      const request = route.request();
      const postData = request.postDataJSON();
      if (postData?.promptTemplate?.includes("Write a captivating and SEO-friendly introduction")) {
        if (postData?.promptTemplate?.includes(MOCKED_IMAGE_DESCRIPTION)) {
          console.log('Mocking AI response for recipe description with image insights');
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ content: `Recipe intro including: ${MOCKED_IMAGE_DESCRIPTION}` }),
          });
        } else {
           console.log('Mocking AI response for recipe description WITHOUT image insights (should not happen in this test)');
           await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ content: `Recipe intro (no image insights)` }),
          });
        }
      } else {
        await route.continue(); // Continue for other AI calls like the initial image analysis
      }
    }, { times: 1 }); // Ensure this more specific mock is added for the next call

    const recipeDescOutputArea = recipeDescStageCard.locator('[data-testid="stage-output-area"]');
    await expect(recipeDescOutputArea).toContainText(MOCKED_IMAGE_DESCRIPTION, { timeout: 20000 });
    console.log('E2E test for image understanding in recipe workflow completed successfully.');
  });
});
