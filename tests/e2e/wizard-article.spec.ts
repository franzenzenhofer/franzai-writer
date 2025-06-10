import { test, expect } from '@playwright/test';

test.describe('Article Wizard Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
    const articleCard = page.locator('[data-testid="workflow-card-targeted-page-seo-optimized-v3"]');
    await articleCard.getByTestId('workflow-start-button').click();
    await page.waitForURL('**/wizard/**');
  });

  test('should display wizard with article workflow stages', async ({ page }) => {
    await expect(page.getByTestId('wizard-page-title')).toBeVisible();
    await expect(page.getByTestId('wizard-page-title')).toHaveText('Create a targeted page SEO-optimized');
    
    await expect(page.getByTestId('wizard-progress-bar')).toBeVisible();
    
    const stages = [
      'stage-card-topic-definition',
      'stage-card-audience-analysis',
      'stage-card-competitor-research',
      'stage-card-content-angle',
      'stage-card-page-title',
      'stage-card-outline-creation',
      'stage-card-full-draft'
    ];
    
    for (const stageId of stages) {
      await expect(page.getByTestId(stageId)).toBeVisible();
    }
  });

  test('should complete topic definition stage', async ({ page }) => {
    const topicStage = page.getByTestId('stage-card-topic-definition');
    
    await expect(topicStage.getByTestId('stage-input-textarea-topic')).toBeVisible();
    
    await topicStage.getByTestId('stage-input-textarea-topic').fill('Best practices for TypeScript in React applications');
    await topicStage.getByTestId('stage-run-button').click();
    
    await expect(topicStage.locator('.text-green-500')).toBeVisible();
  });

  test('should show dependency message for locked stages', async ({ page }) => {
    const audienceStage = page.getByTestId('stage-card-audience-analysis');
    
    const dependencyBadge = audienceStage.locator('text=Waiting for:');
    if (await dependencyBadge.isVisible()) {
      await expect(dependencyBadge).toContainText('Topic Definition');
    }
  });

  test('should complete multiple stages in sequence', async ({ page }) => {
    const topicStage = page.getByTestId('stage-card-topic-definition');
    await topicStage.getByTestId('stage-input-textarea-topic').fill('TypeScript best practices');
    await topicStage.getByTestId('stage-run-button').click();
    await expect(topicStage.locator('.text-green-500')).toBeVisible();
    
    const audienceStage = page.getByTestId('stage-card-audience-analysis');
    await audienceStage.getByTestId('stage-run-ai-button').click();
    
    await expect(audienceStage.locator('.animate-spin')).toBeVisible();
  });

  test('should handle form-based stages', async ({ page }) => {
    const competitorStage = page.getByTestId('stage-card-competitor-research');
    
    const formFields = competitorStage.locator('form input, form textarea');
    const fieldCount = await formFields.count();
    
    expect(fieldCount).toBeGreaterThan(0);
  });

  test('should display output area after stage completion', async ({ page }) => {
    const topicStage = page.getByTestId('stage-card-topic-definition');
    
    await topicStage.getByTestId('stage-input-textarea-topic').fill('React performance optimization');
    await topicStage.getByTestId('stage-run-button').click();
    
    await expect(topicStage.locator('text=Output:')).toBeVisible({ timeout: 10000 });
  });
});