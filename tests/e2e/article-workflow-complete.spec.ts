import { test, expect } from '@playwright/test';

test.describe('Complete Article Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Set demo mode for testing
    await page.goto('/dashboard');
  });

  test('should create article from start to finish', async ({ page }) => {
    // Navigate to article workflow
    await page.locator('text=Targeted Page SEO Optimized').first().click();
    await page.locator('a:has-text("Start")').first().click();
    
    // Wait for wizard to load
    await page.waitForURL('**/wizard/**');
    await expect(page.getByTestId('wizard-page-title')).toContainText('Targeted Page SEO Optimized');
    
    // Stage 1: Define Your Topic
    await page.locator('textarea').first().fill('Best practices for implementing React Server Components in Next.js 14');
    await page.locator('button:has-text("Process Stage")').first().click();
    
    // Wait for processing
    await page.waitForTimeout(2000);
    
    // Verify stage completed
    await expect(page.locator('text=Progress')).toBeVisible();
    
    // Stage 2: Audience Analysis
    const demographicsInput = page.locator('input[placeholder*="demographics"], input').first();
    await demographicsInput.fill('Web developers, software engineers, front-end developers with 2-5 years experience');
    
    const interestsInput = page.locator('input[placeholder*="interests"], input').nth(1);
    await interestsInput.fill('Performance optimization, modern web development, React ecosystem, TypeScript');
    
    // Select knowledge level
    await page.locator('input[type="radio"][value="Intermediate"]').check();
    
    // Process audience analysis
    await page.locator('button:has-text("Process Stage")').first().click();
    await page.waitForTimeout(2000);
    
    // Stage 3: Skip competitor research
    await page.locator('button:has-text("Skip Stage")').click();
    
    // Wait for AI stages to become available
    await page.waitForTimeout(1000);
    
    // Stage 4: Content Angle - should auto-run
    await page.waitForTimeout(3000);
    
    // Stage 5: Generate Page Title
    const angleSelect = page.locator('select').first();
    await angleSelect.selectOption({ index: 1 }); // Select first option
    await page.locator('button:has-text("Process Stage")').click();
    await page.waitForTimeout(2000);
    
    // Stage 6: Create Content Outline
    const titleSelect = page.locator('select').nth(1);
    await titleSelect.selectOption({ index: 1 }); // Select first option
    await page.locator('button:has-text("Process Stage")').click();
    await page.waitForTimeout(2000);
    
    // Stage 7: Generate Full Draft - should auto-run
    await page.waitForTimeout(5000);
    
    // Verify all stages completed
    await expect(page.locator('text=7 / 7 Stages')).toBeVisible();
    
    // Test completed successfully - workflow is now complete
    console.log('Article workflow completed successfully');
  });

  test('should handle errors gracefully', async ({ page }) => {
    // This test checks that 500 errors are handled properly
    await page.goto('/dashboard');
    
    // Set up to intercept API calls
    await page.route('**/api/**', route => {
      if (route.request().method() === 'POST') {
        route.fulfill({
          status: 500,
          body: JSON.stringify({ error: 'Internal Server Error' })
        });
      } else {
        route.continue();
      }
    });
    
    // Try to run workflow
    await page.locator('text=Targeted Page SEO Optimized').first().click();
    await page.locator('a:has-text("Start")').first().click();
    
    // Fill first stage
    await page.locator('textarea').first().fill('Test topic');
    await page.locator('button:has-text("Process Stage")').first().click();
    
    // Should show error message instead of crashing
    await expect(page.locator('text=error').first()).toBeVisible({ timeout: 5000 });
  });

  test('should save progress automatically', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Start workflow
    await page.locator('text=Targeted Page SEO Optimized').first().click();
    await page.locator('a:has-text("Start")').first().click();
    
    // Fill first stage
    await page.locator('textarea').first().fill('Auto-save test topic');
    
    // Wait for auto-save
    await page.waitForTimeout(3000);
    
    // Check for save indicator
    await expect(page.locator('text=Saving').or(page.locator('text=Last saved'))).toBeVisible({ timeout: 10000 });
  });
});