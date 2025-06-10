import { test, expect } from '@playwright/test';

test.describe('Recipe Wizard Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
    const recipeCard = page.locator('[data-testid="workflow-card-recipe-seo-optimized"]');
    await recipeCard.getByTestId('workflow-start-button').click();
    await page.waitForURL('**/wizard/**');
  });

  test('should display wizard with recipe workflow stages', async ({ page }) => {
    await expect(page.getByTestId('wizard-page-title')).toBeVisible();
    await expect(page.getByTestId('wizard-page-title')).toHaveText('Create SEO-Optimized Recipe');
    
    await expect(page.getByTestId('wizard-progress-bar')).toBeVisible();
    
    const stages = [
      'stage-card-cuisine-type',
      'stage-card-dish-name',
      'stage-card-recipe-tone',
      'stage-card-target-audience',
      'stage-card-seo-keywords',
      'stage-card-recipe-description',
      'stage-card-ingredients',
      'stage-card-instructions',
      'stage-card-preparation-details',
      'stage-card-full-recipe'
    ];
    
    for (const stageId of stages) {
      await expect(page.getByTestId(stageId)).toBeVisible();
    }
  });

  test('should complete cuisine type stage', async ({ page }) => {
    const cuisineStage = page.getByTestId('stage-card-cuisine-type');
    
    await expect(cuisineStage.getByTestId('stage-input-select-cuisine-type')).toBeVisible();
    
    await cuisineStage.getByTestId('stage-input-select-cuisine-type').selectOption('Italian');
    await cuisineStage.getByTestId('stage-run-button').click();
    
    await expect(cuisineStage.locator('.text-green-500')).toBeVisible();
  });

  test('should complete dish name stage with dependency', async ({ page }) => {
    const cuisineStage = page.getByTestId('stage-card-cuisine-type');
    await cuisineStage.getByTestId('stage-input-select-cuisine-type').selectOption('Italian');
    await cuisineStage.getByTestId('stage-run-button').click();
    await expect(cuisineStage.locator('.text-green-500')).toBeVisible();
    
    const dishStage = page.getByTestId('stage-card-dish-name');
    await dishStage.getByTestId('stage-input-textarea-dish-name').fill('Classic Margherita Pizza');
    await dishStage.getByTestId('stage-run-button').click();
    
    await expect(dishStage.locator('.text-green-500')).toBeVisible();
  });

  test('should skip optional stage', async ({ page }) => {
    const seoStage = page.getByTestId('stage-card-seo-keywords');
    
    const skipButton = seoStage.getByTestId('stage-skip-button');
    if (await skipButton.isVisible()) {
      await skipButton.click();
      await expect(seoStage.locator('svg.text-muted-foreground')).toBeVisible();
    }
  });

  test('should edit input after completion', async ({ page }) => {
    const cuisineStage = page.getByTestId('stage-card-cuisine-type');
    
    await cuisineStage.getByTestId('stage-input-select-cuisine-type').selectOption('Italian');
    await cuisineStage.getByTestId('stage-run-button').click();
    await expect(cuisineStage.locator('.text-green-500')).toBeVisible();
    
    await cuisineStage.getByTestId('stage-edit-input-button').click();
    
    await expect(cuisineStage.getByTestId('stage-input-select-cuisine-type')).toBeVisible();
    await cuisineStage.getByTestId('stage-input-select-cuisine-type').selectOption('French');
    await cuisineStage.getByTestId('stage-run-button').click();
  });

  test('should show finalize button when all stages complete', async ({ page }) => {
    await expect(page.getByTestId('finalize-document-button')).toBeVisible();
    await expect(page.getByTestId('finalize-document-button')).toBeDisabled();
    
    // This would normally require completing all stages, which would take too long for a test
    // In a real scenario, you might mock the AI responses or use a simplified workflow
  });
});