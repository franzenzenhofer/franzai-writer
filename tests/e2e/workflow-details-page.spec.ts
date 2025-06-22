import { test, expect } from '@playwright/test';

test.describe('Workflow Details Page E2E Tests (Chrome Only)', () => {
  test.skip(({ browserName }) => browserName !== 'chromium', 'Chrome only per CLAUDE.md guidelines');
  test.beforeEach(async ({ page }) => {
    // Navigate directly to a workflow details page (poem workflow)
    await page.goto('/workflow-details/poem');
    await page.waitForLoadState('networkidle');
  });

  test('should display workflow hero section with stats', async ({ page }) => {
    // Check workflow name is displayed
    await expect(page.locator('h1')).toContainText('Poem');
    
    // Check stats are visible
    await expect(page.locator('text=Total Stages')).toBeVisible();
    await expect(page.locator('text=AI Stages')).toBeVisible();
    await expect(page.locator('text=Input Stages')).toBeVisible();
    await expect(page.locator('text=Optional')).toBeVisible();
    
    // Check CTA buttons
    await expect(page.locator('button:has-text("Start Workflow")')).toBeVisible();
    await expect(page.locator('button:has-text("View Examples")')).toBeVisible();
  });

  test('should navigate between tabs', async ({ page }) => {
    // Check default tab (Overview)
    await expect(page.locator('text=AI-Powered Analysis')).toBeVisible();
    
    // Click Stages tab
    await page.getByRole('tab', { name: 'Stages' }).click();
    await expect(page.locator('text=Workflow Pipeline')).toBeVisible();
    
    // Click Configuration tab
    await page.getByRole('tab', { name: 'Configuration' }).click();
    await expect(page.locator('text=AI Models')).toBeVisible();
    await expect(page.locator('text=Temperature Control')).toBeVisible();
  });

  test('should display workflow stages with details', async ({ page }) => {
    // Navigate to Stages tab
    await page.getByRole('tab', { name: 'Stages' }).click();
    
    // Check that stages are displayed
    await expect(page.locator('text=Step 1')).toBeVisible();
    
    // Check stage details are shown
    await expect(page.locator('text=Input:')).toBeVisible();
    await expect(page.locator('text=Output:')).toBeVisible();
  });

  test('should show AI configuration details', async ({ page }) => {
    // Navigate to Configuration tab
    await page.getByRole('tab', { name: 'Configuration' }).click();
    
    // Check AI models section
    const modelsSection = page.locator('text=AI Models').locator('..');
    await expect(modelsSection).toBeVisible();
    
    // Check temperature control
    const tempSection = page.locator('text=Temperature Control').locator('..');
    await expect(tempSection).toBeVisible();
    
    // Check workflow configuration stats
    await expect(page.locator('text=Auto-run Stages')).toBeVisible();
    await expect(page.locator('text=Show Thinking')).toBeVisible();
    await expect(page.locator('text=Auto Scroll')).toBeVisible();
  });

  test('should display key features based on workflow capabilities', async ({ page }) => {
    // Stay on Overview tab
    await expect(page.getByRole('tab', { name: 'Overview' })).toHaveAttribute('data-state', 'active');
    
    // Check for key features section
    const featuresSection = page.locator('text=Key Features').locator('..');
    await expect(featuresSection).toBeVisible();
    
    // For poem workflow, should show image generation
    await expect(page.locator('text=Image Generation')).toBeVisible();
  });

  test('should show related workflows', async ({ page }) => {
    // Scroll to bottom to see related workflows
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    // Check if related workflows section exists
    const relatedSection = page.locator('text=Explore Other Workflows');
    if (await relatedSection.count() > 0) {
      await expect(relatedSection).toBeVisible();
      
      // Check that workflow cards have view details buttons
      const viewDetailsButtons = page.locator('button:has-text("View Details")');
      expect(await viewDetailsButtons.count()).toBeGreaterThan(0);
    }
  });

  test('should navigate back to dashboard', async ({ page }) => {
    // Click back button
    await page.locator('button:has-text("Back to Dashboard")').click();
    
    // Should navigate to dashboard
    await expect(page).toHaveURL('/dashboard');
  });
});