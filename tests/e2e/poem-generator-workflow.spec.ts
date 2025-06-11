import { test, expect } from '@playwright/test';

test.describe('Complete Poem Generator Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Set demo mode for testing
    await page.goto('/dashboard');
  });

  test('should create poem from start to finish', async ({ page }) => {
    // Navigate to poem generator workflow
    await page.locator('text=Poem Generator').first().click();
    await page.locator('a:has-text("Start")').nth(0).click(); // First Start button

    // Wait for wizard to load
    await page.waitForURL('**/wizard/**');
    await expect(page.getByTestId('wizard-page-title')).toContainText('Poem Generator');

    // Stage 1: Poem Topic
    const poemTopic = 'a beautiful sunny day';
    await page.locator('textarea').first().fill(poemTopic);
    await page.locator('button:has-text("Process Stage")').first().click();
    await page.waitForTimeout(2000); // Wait for processing

    // Stage 2: Generate Poem - should auto-run
    // Wait for the poem to be generated (adjust timeout as needed)
    await page.waitForTimeout(5000);

    // Verify all stages completed
    await expect(page.locator('text=2 / 2 Stages')).toBeVisible();

    // Verify poem output is visible
    const poemOutput = page.getByTestId('stage-output-area-markdown');
    await expect(poemOutput).toBeVisible();
    await expect(poemOutput.locator('p')).toHaveCountGreaterThanOrEqual(1); // Check for at least one paragraph in the poem

    // Finalize document
    await expect(page.getByTestId('finalize-document-button')).toBeEnabled();
    await page.getByTestId('finalize-document-button').click();

    // Verify final document dialog
    await expect(page.locator('text=Your document is ready!')).toBeVisible();

    // Verify the title was set from the poem topic
    // Note: The title in the final document dialog might not update immediately
    // or might have a generic title. This depends on implementation.
    // For now, we'll check the wizard title was updated.
    await expect(page.getByTestId('wizard-page-title')).toContainText(poemTopic);
  });

  test('should show validation if topic is empty', async ({ page }) => {
    await page.goto('/dashboard');

    // Navigate to poem generator workflow
    await page.locator('text=Poem Generator').first().click();
    await page.locator('a:has-text("Start")').nth(0).click();

    // Wait for wizard to load
    await page.waitForURL('**/wizard/**');
    await expect(page.getByTestId('wizard-page-title')).toContainText('Poem Generator');

    // Try to process empty stage
    await page.locator('button:has-text("Process Stage")').first().click();
    await page.waitForTimeout(1000); // Wait for potential validation message or lack of progression

    // Progress should still be 0
    await expect(page.locator('text=0 / 2 Stages')).toBeVisible();

    // Ensure no error toast appeared for this specific action (optional, depends on app behavior)
    // await expect(page.locator('[data-testid="toast-error"]')).not.toBeVisible();
  });
});
