import { test, expect, Page } from '@playwright/test';
import path from 'path';

const RECIPE_WORKFLOW_URL = '/w/recipe';
const DISH_NAME_TEXT = 'Test Dish with Document';
const TEST_DOCUMENT_CONTENT = "This is a test document for the recipe workflow.\nIt contains some sample text that the AI should summarize.\nMain ingredients: Flour, Sugar, Eggs.\nInstructions: Mix well, bake at 350.";
const MOCKED_DOCUMENT_SUMMARY = 'The document contains a recipe with ingredients like Flour, Sugar, Eggs and instructions to mix and bake.';
const MOCKED_RAW_TEXT = TEST_DOCUMENT_CONTENT;

// Helper function to interact with a stage (can be shared if refactored into a common utils file)
async function handleStage(
  page: Page,
  stageId: string,
  action: 'input' | 'process' | 'check-output',
  inputValue?: string | { filePath: string } | Record<string, any>,
  expectedOutput?: string | RegExp
) {
  const stageCardSelector = `[data-testid="stage-card-${stageId}"]`;
  const stageCard = page.locator(stageCardSelector);

  await expect(stageCard).toBeVisible({ timeout: 15000 });

  if (action === 'input') {
    if (typeof inputValue === 'string') {
      const inputArea = stageCard.locator(`textarea, input[type="text"]`).first();
      await inputArea.fill(inputValue);
    } else if (inputValue && 'filePath' in inputValue) {
      const fileInput = stageCard.locator('input[type="file"]');
      await fileInput.setInputFiles(inputValue.filePath);
    }
  } else if (action === 'process') {
    const processButton = stageCard.locator('button[data-testid="process-stage-button"], button:has-text("Process")').first();
    await processButton.click();
  } else if (action === 'check-output') {
    const outputArea = stageCard.locator('[data-testid="stage-output-area"]');
    if (expectedOutput instanceof RegExp) {
        await expect(outputArea).toHaveText(expectedOutput, { timeout: 20000 });
    } else {
        await expect(outputArea).toHaveText(expectedOutput!, { timeout: 20000 });
    }
  }
}

test.describe('Recipe Workflow - Document Understanding', () => {
  test.beforeEach(async ({ page }) => {
    // Assuming login is handled or not required for this specific test path
    await page.goto('/dashboard'); // Start from dashboard or login page
    await page.waitForURL('**/dashboard', {timeout: 10000});

    await page.getByTestId('create-new-document-button').click();
    const recipeWorkflowCard = page.locator('[data-testid="workflow-card-recipe-seo-optimized"]');
    await recipeWorkflowCard.click();
    await page.waitForURL(`**${RECIPE_WORKFLOW_URL}/**`, {timeout: 10000});
  });

  test('should allow .txt document upload, process it, and display results', async ({ page }) => {
    const documentId = page.url().split('/').pop();
    expect(documentId).toBeDefined();

    // Mock the AI response for the document analysis stage
    await page.route('**/api/ai', async (route) => {
      const request = route.request();
      const postData = request.postDataJSON();

      // Check if the prompt is for document analysis and contains the expected document content
      if (postData?.promptTemplate?.includes("Extract key information, such as ingredients, instructions, or nutritional facts, from the provided document content:") &&
          postData?.promptTemplate?.includes(TEST_DOCUMENT_CONTENT.substring(0, 50))) { // Check for beginning of content
        console.log('Mocking AI response for document analysis');
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            content: JSON.stringify({ // The output of the AI stage is a JSON string
              extractedTextSummary: MOCKED_DOCUMENT_SUMMARY,
              rawExtractedText: MOCKED_RAW_TEXT
            })
          }),
        });
      } else {
        await route.continue(); // Let other AI calls pass
      }
    });

    // 1. Input Dish Name
    await handleStage(page, 'dish-name', 'input', DISH_NAME_TEXT);
    // Assuming dish-name stage might auto-run or doesn't need explicit process for this flow

    // 2. Upload Document to "Analyze Document" stage
    const docStageId = 'document-analysis';
    const docPath = path.resolve('test-doc.txt'); // Use the .txt document created earlier

    const stageCardSelector = `[data-testid="stage-card-${docStageId}"]`;
    const stageCard = page.locator(stageCardSelector);
    await expect(stageCard).toBeVisible({ timeout: 10000 });

    const fileInput = stageCard.locator('input[type="file"]');
    await fileInput.setInputFiles(docPath);

    // Verify file information is shown
    const docFileInfo = stageCard.locator(`text=/File: test-doc.txt (text\\/plain, ${TEST_DOCUMENT_CONTENT.length} bytes)/`);
    await expect(docFileInfo).toBeVisible({ timeout: 5000 });

    // 3. Process the Document Analysis Stage
    const processButton = stageCard.locator('button[data-testid="process-stage-button"], button:has-text("Process")').first();
    await processButton.click();

    // 4. Check for the (mocked) output
    const outputArea = stageCard.locator('[data-testid="stage-output-area"]');
    // The output is JSON, so we check for parts of it.
    await expect(outputArea).toContainText(MOCKED_DOCUMENT_SUMMARY, { timeout: 15000 });
    await expect(outputArea).toContainText("Flour, Sugar, Eggs", { timeout: 5000 }); // From rawExtractedText part

    // 5. (Optional) Verify this output is used in a subsequent stage (e.g., recipe-description-generation)
    const recipeDescStageId = 'recipe-description-generation';
    const recipeDescStageCard = page.locator(`[data-testid="stage-card-${recipeDescStageId}"]`);

    // Fill other dependencies for recipe-description-generation if any
    await handleStage(page, 'cuisine-type', 'input', 'Test Cuisine with Docs');
    // (image-analysis is also a dependency, skip for this doc-focused test or fill if necessary)

    // Mock the AI response for recipe-description-generation
    await page.route('**/api/ai', async (route) => {
      const request = route.request();
      const postData = request.postDataJSON();
      if (postData?.promptTemplate?.includes("Write a captivating and SEO-friendly introduction") &&
          postData?.promptTemplate?.includes(MOCKED_DOCUMENT_SUMMARY)) {
        console.log('Mocking AI response for recipe description with document insights');
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ content: `Recipe intro including doc summary: ${MOCKED_DOCUMENT_SUMMARY}` }),
        });
      } else {
        await route.continue();
      }
    }, { times: 1 }); // Specific mock for the next AI call

    // recipe-description-generation is auto-run in the workflow
    const recipeDescOutputArea = recipeDescStageCard.locator('[data-testid="stage-output-area"]');
    await expect(recipeDescOutputArea).toContainText(MOCKED_DOCUMENT_SUMMARY, { timeout: 20000 });
    console.log('E2E test for document understanding (.txt) in recipe workflow completed successfully.');
  });
});
