import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test('should display dashboard with workflows', async ({ page }) => {
    await page.goto('/dashboard');
    
    await expect(page.getByRole('heading', { name: 'AI Writing Workflows' })).toBeVisible();
    
    const workflowCards = page.locator('[data-testid^="workflow-card-"]');
    await expect(workflowCards).toHaveCount(2);
    
    await expect(page.getByText('Recipe SEO Optimized')).toBeVisible();
    await expect(page.getByText('Targeted Page SEO Optimized')).toBeVisible();
  });

  test('should navigate to wizard when selecting a workflow', async ({ page }) => {
    await page.goto('/dashboard');
    
    const recipeCard = page.locator('[data-testid="workflow-card-recipe-seo-optimized"]');
    await expect(recipeCard).toBeVisible();
    
    await recipeCard.getByTestId('workflow-start-button').click();
    
    await page.waitForURL('**/wizard/**');
    await expect(page).toHaveURL(/\/wizard\/.+$/);
  });

  test('should display recent documents section', async ({ page }) => {
    await page.goto('/dashboard');
    
    await expect(page.getByRole('heading', { name: 'Recent documents' })).toBeVisible();
    
    const loginPrompt = page.getByText('Ready to Save Your Work?');
    if (await loginPrompt.isVisible()) {
      await expect(page.getByTestId('dashboard-login-button')).toBeVisible();
    }
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/dashboard');
    
    await expect(page.getByRole('heading', { name: 'AI Writing Workflows' })).toBeVisible();
    
    const workflowCards = page.locator('[data-testid^="workflow-card-"]');
    const cardCount = await workflowCards.count();
    
    for (let i = 0; i < cardCount; i++) {
      const card = workflowCards.nth(i);
      const box = await card.boundingBox();
      
      expect(box?.width).toBeGreaterThan(300);
    }
  });
});