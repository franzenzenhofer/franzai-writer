import { test, expect } from '@playwright/test';

test.describe('Complete Recipe Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Set demo mode for testing
    await page.goto('/dashboard');
  });

  test('should create recipe from start to finish', async ({ page }) => {
    // Navigate to recipe workflow
    await page.locator('text=SEO Optimized Cooking Recipe').first().click();
    await page.locator('a:has-text("Start")').nth(1).click(); // Second Start button
    
    // Wait for wizard to load
    await page.waitForURL('**/wizard/**');
    await expect(page.getByTestId('wizard-page-title')).toContainText('SEO-Optimized Recipe');
    
    // Stage 1: Dish Name
    await page.locator('textarea').first().fill('Classic Italian Margherita Pizza');
    await page.locator('button:has-text("Process Stage")').first().click();
    await page.waitForTimeout(2000);
    
    // Stage 2: Cuisine Type & Main Ingredients
    await page.locator('textarea').first().fill('Italian cuisine, tomatoes, mozzarella, basil, pizza dough');
    await page.locator('button:has-text("Process Stage")').first().click();
    await page.waitForTimeout(2000);
    
    // Stage 3: Target Audience (optional) - Skip
    await page.locator('button:has-text("Skip Stage")').first().click();
    
    // Stage 4: Recipe Tone Selection
    const toneSelect = page.locator('select').first();
    await toneSelect.selectOption('Casual and friendly');
    await page.locator('button:has-text("Process Stage")').first().click();
    await page.waitForTimeout(2000);
    
    // Stage 5: SEO Keywords (optional) - Skip
    await page.locator('button:has-text("Skip Stage")').first().click();
    
    // Stage 6: Recipe Description - should auto-run
    await page.waitForTimeout(3000);
    
    // Stage 7: Ingredients Input
    await page.locator('textarea').first().fill(`
    For the dough:
    - 500g bread flour
    - 325ml warm water
    - 2 tsp active dry yeast
    - 2 tsp salt
    - 2 tbsp olive oil
    
    For the toppings:
    - 200ml tomato sauce
    - 250g fresh mozzarella
    - Fresh basil leaves
    - Extra virgin olive oil
    - Salt and pepper to taste
    `);
    await page.locator('button:has-text("Process Stage")').first().click();
    await page.waitForTimeout(2000);
    
    // Stage 8: Instructions Input
    await page.locator('textarea').first().fill(`
    1. Make the dough: Mix warm water and yeast, let bloom for 5 minutes
    2. Add flour, salt, and olive oil. Knead for 10 minutes until smooth
    3. Let rise in a warm place for 1-2 hours until doubled
    4. Preheat oven to 250°C (480°F) with pizza stone if available
    5. Roll out dough to desired thickness
    6. Spread tomato sauce, leaving 1cm border
    7. Add torn mozzarella pieces
    8. Bake for 10-12 minutes until crust is golden
    9. Add fresh basil and drizzle with olive oil before serving
    `);
    await page.locator('button:has-text("Process Stage")').first().click();
    await page.waitForTimeout(2000);
    
    // Stage 9: Preparation Details
    await page.locator('input[placeholder*="time"]').first().fill('30 minutes');
    await page.locator('input[placeholder*="Cook"]').first().fill('12 minutes');
    await page.locator('input[placeholder*="servings"]').first().fill('4');
    await page.locator('button:has-text("Process Stage")').first().click();
    await page.waitForTimeout(2000);
    
    // Stage 10: Full Recipe Compilation - should auto-run
    await page.waitForTimeout(5000);
    
    // Verify all stages completed
    await expect(page.locator('text=10 / 10 Stages')).toBeVisible();
    
    // Finalize document
    await expect(page.getByTestId('finalize-document-button')).toBeEnabled();
    await page.getByTestId('finalize-document-button').click();
    
    // Verify final document dialog
    await expect(page.locator('text=Your document is ready!')).toBeVisible();
  });

  test('should handle optional stages correctly', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Start recipe workflow
    await page.locator('text=SEO Optimized Cooking Recipe').first().click();
    await page.locator('a:has-text("Start")').nth(1).click();
    
    // Complete required stages
    await page.locator('textarea').first().fill('Quick Pasta Recipe');
    await page.locator('button:has-text("Process Stage")').first().click();
    await page.waitForTimeout(2000);
    
    // Skip multiple optional stages
    const skipButtons = page.locator('button:has-text("Skip Stage")');
    const skipCount = await skipButtons.count();
    
    // Verify we can skip optional stages
    expect(skipCount).toBeGreaterThan(0);
    
    // Skip first optional stage
    await skipButtons.first().click();
    
    // Verify stage marked as skipped
    await expect(page.locator('text=Skipped').first()).toBeVisible({ timeout: 5000 });
  });

  test('should validate form inputs', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Start recipe workflow
    await page.locator('text=SEO Optimized Cooking Recipe').first().click();
    await page.locator('a:has-text("Start")').nth(1).click();
    
    // Try to process empty stage
    await page.locator('button:has-text("Process Stage")').first().click();
    
    // Should show validation or not proceed
    await page.waitForTimeout(1000);
    
    // Progress should still be 0
    await expect(page.locator('text=0 / 10 Stages')).toBeVisible();
  });

  test('should auto-populate title from dish name', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Start recipe workflow
    await page.locator('text=SEO Optimized Cooking Recipe').first().click();
    await page.locator('a:has-text("Start")').nth(1).click();
    
    // Enter dish name
    const dishName = 'Chocolate Chip Cookies';
    await page.locator('textarea').first().fill(dishName);
    await page.locator('button:has-text("Process Stage")').first().click();
    await page.waitForTimeout(2000);
    
    // Check if title updated
    await expect(page.getByTestId('wizard-page-title')).toContainText(dishName);
  });
});