# Test info

- Name: Recipe Workflow - Image Understanding >> should allow image upload, process it, and display results
- Location: /app/tests/e2e/recipe-workflow-image-understanding.spec.ts:60:7

# Error details

```
Error: browserType.launch: Executable doesn't exist at /home/swebot/.cache/ms-playwright/webkit-2158/pw_run.sh
╔═════════════════════════════════════════════════════════════════════════╗
║ Looks like Playwright Test or Playwright was just installed or updated. ║
║ Please run the following command to download new browsers:              ║
║                                                                         ║
║     npx playwright install                                              ║
║                                                                         ║
║ <3 Playwright Team                                                      ║
╚═════════════════════════════════════════════════════════════════════════╝
```

# Test source

```ts
   1 | import { test, expect, Page } from '@playwright/test';
   2 | import path from 'path';
   3 |
   4 | const RECIPE_WORKFLOW_URL = '/w/recipe';
   5 | const DISH_NAME_TEXT = 'Test Dish with Image';
   6 | const MOCKED_IMAGE_DESCRIPTION = 'This is a test description of the uploaded image.';
   7 | const MOCKED_IDENTIFIED_OBJECTS = ['test object 1', 'test object 2'];
   8 |
   9 | // Helper function to interact with a stage
   10 | async function handleStage(
   11 |   page: Page,
   12 |   stageId: string,
   13 |   action: 'input' | 'process' | 'check-output',
   14 |   inputValue?: string | { filePath: string } | Record<string, any>,
   15 |   expectedOutput?: string | RegExp
   16 | ) {
   17 |   const stageCardSelector = `[data-testid="stage-card-${stageId}"]`;
   18 |   const stageCard = page.locator(stageCardSelector);
   19 |
   20 |   await expect(stageCard).toBeVisible({ timeout: 15000 }); // Increased timeout
   21 |
   22 |   if (action === 'input') {
   23 |     if (typeof inputValue === 'string') {
   24 |       const inputArea = stageCard.locator(`textarea, input[type="text"]`).first();
   25 |       await inputArea.fill(inputValue);
   26 |     } else if (inputValue && 'filePath' in inputValue) { // For file uploads
   27 |       const fileInput = stageCard.locator('input[type="file"]');
   28 |       await fileInput.setInputFiles(inputValue.filePath);
   29 |     }
   30 |   } else if (action === 'process') {
   31 |     const processButton = stageCard.locator('button[data-testid="process-stage-button"], button:has-text("Process")').first();
   32 |     await processButton.click();
   33 |   } else if (action === 'check-output') {
   34 |     const outputArea = stageCard.locator('[data-testid="stage-output-area"]');
   35 |     if (expectedOutput instanceof RegExp) {
   36 |         await expect(outputArea).toHaveText(expectedOutput, { timeout: 20000 }); // Increased timeout for AI processing
   37 |     } else {
   38 |         await expect(outputArea).toHaveText(expectedOutput!, { timeout: 20000 });
   39 |     }
   40 |   }
   41 | }
   42 |
   43 |
   44 | test.describe('Recipe Workflow - Image Understanding', () => {
   45 |   test.beforeEach(async ({ page }) => {
   46 |     // Log in if necessary (assuming auth is handled or not required for this test path)
   47 |     // await page.goto('/login');
   48 |     // await page.fill('input[name="email"]', 'test@example.com');
   49 |     // await page.fill('input[name="password"]', 'password123');
   50 |     // await page.click('button[type="submit"]');
   51 |     await page.waitForURL('**/dashboard', {timeout: 10000});
   52 |
   53 |     // Navigate to the new recipe workflow
   54 |     await page.getByTestId('create-new-document-button').click();
   55 |     const recipeWorkflowCard = page.locator('[data-testid="workflow-card-recipe-seo-optimized"]');
   56 |     await recipeWorkflowCard.click();
   57 |     await page.waitForURL(`**${RECIPE_WORKFLOW_URL}/**`, {timeout: 10000});
   58 |   });
   59 |
>  60 |   test('should allow image upload, process it, and display results', async ({ page }) => {
      |       ^ Error: browserType.launch: Executable doesn't exist at /home/swebot/.cache/ms-playwright/webkit-2158/pw_run.sh
   61 |     const documentId = page.url().split('/').pop();
   62 |     expect(documentId).toBeDefined();
   63 |
   64 |     // Mock the AI response for the image analysis stage
   65 |     await page.route('**/api/ai', async (route) => {
   66 |       const request = route.request();
   67 |       const postData = request.postDataJSON();
   68 |
   69 |       if (postData?.promptTemplate?.includes("Analyze the provided image")) {
   70 |         console.log('Mocking AI response for image analysis');
   71 |         await route.fulfill({
   72 |           status: 200,
   73 |           contentType: 'application/json',
   74 |           body: JSON.stringify({
   75 |             content: JSON.stringify({
   76 |               imageDescription: MOCKED_IMAGE_DESCRIPTION,
   77 |               identifiedObjects: MOCKED_IDENTIFIED_OBJECTS
   78 |             })
   79 |           }),
   80 |         });
   81 |       } else {
   82 |         // Let other AI calls pass through or mock them as needed
   83 |         await route.continue();
   84 |       }
   85 |     });
   86 |
   87 |     // 1. Input Dish Name
   88 |     await handleStage(page, 'dish-name', 'input', DISH_NAME_TEXT);
   89 |     await handleStage(page, 'dish-name', 'process'); // Assuming some auto-processing or button click if needed
   90 |
   91 |     // 2. Upload Image to "Analyze Dish Image" stage
   92 |     const imageStageId = 'image-analysis';
   93 |     const imagePath = path.resolve('test-image.png'); // Use the image created earlier
   94 |
   95 |     const stageCardSelector = `[data-testid="stage-card-${imageStageId}"]`;
   96 |     const stageCard = page.locator(stageCardSelector);
   97 |     await expect(stageCard).toBeVisible({ timeout: 10000 });
   98 |
   99 |     const fileInput = stageCard.locator('input[type="file"]');
  100 |     await fileInput.setInputFiles(imagePath);
  101 |
  102 |     // Verify image preview (optional, but good for confidence)
  103 |     const imagePreview = stageCard.locator('img[alt="Selected preview"]');
  104 |     await expect(imagePreview).toBeVisible({ timeout: 5000 });
  105 |     await expect(imagePreview).toHaveAttribute('src', /^data:image\/png;base64,/);
  106 |
  107 |     // 3. Process the Image Analysis Stage
  108 |     const processButton = stageCard.locator('button[data-testid="process-stage-button"], button:has-text("Process")').first();
  109 |     await processButton.click();
  110 |
  111 |     // 4. Check for the (mocked) output
  112 |     const outputArea = stageCard.locator('[data-testid="stage-output-area"]');
  113 |     // The output is JSON, so we check for parts of it.
  114 |     await expect(outputArea).toContainText(MOCKED_IMAGE_DESCRIPTION, { timeout: 15000 });
  115 |     await expect(outputArea).toContainText(MOCKED_IDENTIFIED_OBJECTS[0], { timeout: 5000 });
  116 |
  117 |     // 5. (Optional) Verify this output is used in a subsequent stage
  118 |     // For example, if 'recipe-description-generation' uses the image description
  119 |     const recipeDescStageId = 'recipe-description-generation';
  120 |     const recipeDescStageCard = page.locator(`[data-testid="stage-card-${recipeDescStageId}"]`);
  121 |
  122 |     // We need to ensure the dependent stages like cuisine-type, target-audience, etc. are filled
  123 |     // or the recipe-description-generation stage might not run correctly or its prompt might be empty.
  124 |     // For simplicity, this example assumes recipe-description-generation might be auto-run
  125 |     // or we manually trigger it after its dependencies (including image-analysis) are met.
  126 |
  127 |     // Let's assume 'cuisine-type' is filled to allow 'recipe-description-generation' to proceed
  128 |     await handleStage(page, 'cuisine-type', 'input', 'Test Cuisine');
  129 |     await handleStage(page, 'cuisine-type', 'process'); // if it needs processing
  130 |
  131 |     // Now check the recipe description stage (it's auto-run in the workflow)
  132 |     // We'll need to mock its AI response too if we want to check its output precisely
  133 |     await page.route('**/api/ai', async (route) => {
  134 |       const request = route.request();
  135 |       const postData = request.postDataJSON();
  136 |       if (postData?.promptTemplate?.includes("Write a captivating and SEO-friendly introduction")) {
  137 |         if (postData?.promptTemplate?.includes(MOCKED_IMAGE_DESCRIPTION)) {
  138 |           console.log('Mocking AI response for recipe description with image insights');
  139 |           await route.fulfill({
  140 |             status: 200,
  141 |             contentType: 'application/json',
  142 |             body: JSON.stringify({ content: `Recipe intro including: ${MOCKED_IMAGE_DESCRIPTION}` }),
  143 |           });
  144 |         } else {
  145 |            console.log('Mocking AI response for recipe description WITHOUT image insights (should not happen in this test)');
  146 |            await route.fulfill({
  147 |             status: 200,
  148 |             contentType: 'application/json',
  149 |             body: JSON.stringify({ content: `Recipe intro (no image insights)` }),
  150 |           });
  151 |         }
  152 |       } else {
  153 |         await route.continue(); // Continue for other AI calls like the initial image analysis
  154 |       }
  155 |     }, { times: 1 }); // Ensure this more specific mock is added for the next call
  156 |
  157 |     const recipeDescOutputArea = recipeDescStageCard.locator('[data-testid="stage-output-area"]');
  158 |     await expect(recipeDescOutputArea).toContainText(MOCKED_IMAGE_DESCRIPTION, { timeout: 20000 });
  159 |     console.log('E2E test for image understanding in recipe workflow completed successfully.');
  160 |   });
```