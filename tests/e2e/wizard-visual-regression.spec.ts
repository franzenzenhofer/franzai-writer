import { test, expect } from '@playwright/test';

test.describe('Wizard Visual Regression Tests', () => {
  // Set reasonable timeout for AI-powered workflows
  test.setTimeout(180000);

  test.beforeEach(async ({ page }) => {
    // Wait for fonts to load and animations to settle
    await page.addInitScript(() => {
      // Disable animations for consistent screenshots
      window.CSS?.registerProperty?.({
        name: '--animation-duration',
        syntax: '<time>',
        inherits: false,
        initialValue: '0s'
      });
    });
  });

  test('wizard shell - initial state', async ({ page }) => {
    await page.goto('/w/poem/new');
    await page.waitForLoadState('networkidle');
    
    // Wait for wizard page title to be fully rendered
    await page.waitForSelector('[data-testid="wizard-page-title"]', { timeout: 10000 });
    
    // Wait for animations to complete
    await page.waitForTimeout(2000);
    
    // Take screenshot of entire page body (wizard shell)
    await expect(page.locator('body')).toHaveScreenshot('wizard-shell-initial.png');
  });

  test('stage card - empty state', async ({ page }) => {
    await page.goto('/w/poem/new');
    await page.waitForLoadState('networkidle');
    
    // Wait for first stage card to be fully rendered
    await page.waitForSelector('[data-testid="stage-card-poem-topic"]', { timeout: 10000 });
    await page.waitForTimeout(2000);
    
    // Take screenshot of first stage card in empty state
    await expect(page.locator('[data-testid="stage-card-poem-topic"]')).toHaveScreenshot('stage-card-empty.png');
  });

  test('stage card - with input', async ({ page }) => {
    await page.goto('/w/poem/new');
    await page.waitForLoadState('networkidle');
    
    // Fill in the poem topic using the correct selector
    await page.waitForSelector('#textarea-poem-topic', { timeout: 10000 });
    await page.fill('#textarea-poem-topic', 'Beautiful sunset over the ocean');
    await page.waitForTimeout(1000);
    
    // Take screenshot of stage card with input
    await expect(page.locator('[data-testid="stage-card-poem-topic"]')).toHaveScreenshot('stage-card-with-input.png');
  });

  test('stage card - processing state', async ({ page }) => {
    await page.goto('/w/poem/new');
    await page.waitForLoadState('networkidle');
    
    // Fill in and trigger processing using correct selectors
    await page.waitForSelector('#textarea-poem-topic', { timeout: 10000 });
    await page.fill('#textarea-poem-topic', 'Beautiful sunset over the ocean');
    await page.click('#process-stage-poem-topic');
    
    // Wait for processing state to appear (look for loading icon or disabled state)
    await page.waitForTimeout(2000);
    
    // Take screenshot of processing state
    await expect(page.locator('[data-testid="stage-card-poem-topic"]')).toHaveScreenshot('stage-card-processing.png');
  });

  test('stage card - completed state', async ({ page }) => {
    await page.goto('/w/poem/new');
    await page.waitForLoadState('networkidle');
    
    // Fill in and trigger processing using correct selectors
    await page.waitForSelector('#textarea-poem-topic', { timeout: 10000 });
    await page.fill('#textarea-poem-topic', 'Beautiful sunset over the ocean');
    await page.click('#process-stage-poem-topic');
    
    // Wait for completion - look for output content in the stage card
    await page.waitForSelector('[data-testid="stage-card-poem-topic"] p', { timeout: 30000 });
    
    // Wait for UI to settle
    await page.waitForTimeout(2000);
    
    // Take screenshot of completed state
    await expect(page.locator('[data-testid="stage-card-poem-topic"]')).toHaveScreenshot('stage-card-completed.png');
  });

  test('multiple stages - workflow progression', async ({ page }) => {
    await page.goto('/w/poem/new');
    await page.waitForLoadState('networkidle');
    
    // Complete first stage using correct selectors
    await page.waitForSelector('#textarea-poem-topic', { timeout: 10000 });
    await page.fill('#textarea-poem-topic', 'Beautiful sunset over the ocean');
    await page.click('#process-stage-poem-topic');
    
    // Wait for first stage completion
    await page.waitForSelector('[data-testid="stage-card-poem-topic"] p', { timeout: 30000 });
    
    // Wait for subsequent stages to appear
    await page.waitForTimeout(3000);
    
    // Take screenshot of workflow with multiple stages
    await expect(page.locator('body')).toHaveScreenshot('wizard-workflow-progression.png');
  });

  test('stage input area - different input types', async ({ page }) => {
    await page.goto('/w/poem/new');
    await page.waitForLoadState('networkidle');
    
    // Wait for textarea input using correct selector
    await page.waitForSelector('#textarea-poem-topic', { timeout: 10000 });
    await page.waitForTimeout(1000);
    
    // Take screenshot of textarea input area
    await expect(page.locator('[data-testid="stage-card-poem-topic"]')).toHaveScreenshot('input-area-textarea.png');
  });

  test('stage output area - text output', async ({ page }) => {
    await page.goto('/w/poem/new');
    await page.waitForLoadState('networkidle');
    
    // Complete stage to get output using correct selectors
    await page.waitForSelector('#textarea-poem-topic', { timeout: 10000 });
    await page.fill('#textarea-poem-topic', 'Beautiful sunset over the ocean');
    await page.click('#process-stage-poem-topic');
    
    // Wait for output area to appear
    await page.waitForSelector('[data-testid="stage-card-poem-topic"] p', { timeout: 30000 });
    await page.waitForTimeout(2000);
    
    // Take screenshot of output area
    await expect(page.locator('[data-testid="stage-card-poem-topic"]')).toHaveScreenshot('output-area-text.png');
  });

  test('export stage - initial state', async ({ page }) => {
    await page.goto('/w/poem/new');
    await page.waitForLoadState('networkidle');
    
    // Navigate through workflow to reach export stage using correct selectors
    await page.waitForSelector('#textarea-poem-topic', { timeout: 10000 });
    await page.fill('#textarea-poem-topic', 'Beautiful sunset over the ocean');
    await page.click('#process-stage-poem-topic');
    
    // Wait for poem completion
    await page.waitForSelector('[data-testid="stage-card-poem-topic"] p', { timeout: 30000 });
    
    // Skip optional stages to reach export
    await page.waitForTimeout(5000);
    
    // Skip image briefing if present
    const imageContinue = page.locator('#stage-image-briefing button:has-text("Continue")');
    if (await imageContinue.count() > 0) {
      await imageContinue.click();
      await page.waitForTimeout(2000);
    }
    
    // Wait for image generation
    await page.waitForTimeout(20000);
    
    // Skip HTML briefing if present
    const htmlContinue = page.locator('#stage-html-briefing button:has-text("Continue")');
    if (await htmlContinue.count() > 0) {
      await htmlContinue.click();
      await page.waitForTimeout(2000);
    }
    
    // Wait for HTML preview
    await page.waitForTimeout(10000);
    
    // Wait for export stage to appear
    await page.waitForSelector('[data-testid="stage-card-export"]', { timeout: 30000 });
    await page.waitForTimeout(3000);
    
    // Take screenshot of export stage
    await expect(page.locator('[data-testid="stage-card-export"]')).toHaveScreenshot('export-stage-initial.png');
  });

  test('mobile responsive - wizard shell', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 812 });
    
    await page.goto('/w/poem/new');
    await page.waitForLoadState('networkidle');
    
    // Wait for wizard page title to be fully rendered
    await page.waitForSelector('[data-testid="wizard-page-title"]', { timeout: 10000 });
    await page.waitForTimeout(2000);
    
    // Take screenshot of mobile wizard shell
    await expect(page.locator('body')).toHaveScreenshot('wizard-shell-mobile.png');
  });

  test('error states - stage card error', async ({ page }) => {
    await page.goto('/w/poem/new');
    await page.waitForLoadState('networkidle');
    
    // Try to trigger an error by submitting empty content using correct selectors
    await page.waitForSelector('#textarea-poem-topic', { timeout: 10000 });
    await page.fill('#textarea-poem-topic', '');
    await page.click('#process-stage-poem-topic');
    
    // Wait for error state (if it appears)
    await page.waitForTimeout(5000);
    
    // Take screenshot regardless of error state
    await expect(page.locator('[data-testid="stage-card-poem-topic"]')).toHaveScreenshot('stage-card-error-state.png');
  });

  test('wizard shell - full workflow completed', async ({ page }) => {
    // This test may take longer due to full workflow
    test.setTimeout(300000);
    
    await page.goto('/w/poem/new');
    await page.waitForLoadState('networkidle');
    
    // Complete first stage using correct selectors
    await page.waitForSelector('#textarea-poem-topic', { timeout: 10000 });
    await page.fill('#textarea-poem-topic', 'Beautiful sunset over the ocean');
    await page.click('#process-stage-poem-topic');
    
    // Wait for completion and let workflow auto-progress
    await page.waitForSelector('[data-testid="stage-card-poem-topic"] p', { timeout: 30000 });
    
    // Wait for workflow to complete (this may take a while)
    await page.waitForTimeout(60000);
    
    // Take screenshot of completed workflow
    await expect(page.locator('body')).toHaveScreenshot('wizard-workflow-completed.png');
  });
});