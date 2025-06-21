import { test, expect } from '@playwright/test';

/**
 * Comprehensive E2E test for reload persistence
 * Tests that all stage states are preserved when reloading the page
 */

test.describe('Reload Persistence', () => {
  const BASE_URL = 'http://localhost:9002';
  
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForSelector('text=Start a new document', { timeout: 10000 });
  });

  test('Stage 1: Poem topic persists after reload', async ({ page }) => {
    console.log('🧪 Testing Stage 1 reload persistence...');
    
    await page.click('#workflow-start-poem-generator');
    await page.waitForSelector('textarea');
    
    const poemTopic = 'A majestic waterfall in the rainforest';
    await page.fill('textarea', poemTopic);
    
    // Wait for autosave
    await page.waitForTimeout(2500);
    await page.waitForSelector('text=Last saved');
    
    // Reload
    await page.reload();
    await page.waitForSelector('textarea');
    
    // Verify topic is preserved
    const savedTopic = await page.locator('textarea').inputValue();
    expect(savedTopic).toBe(poemTopic);
    console.log('✅ Poem topic preserved after reload');
  });

  test('Stage 2: Generated poem persists after reload', async ({ page }) => {
    console.log('🧪 Testing Stage 2 reload persistence...');
    
    await page.click('#workflow-start-poem-generator');
    await page.waitForSelector('textarea');
    
    await page.fill('textarea', 'Sunset over the ocean');
    await page.click('#process-stage-poem-topic');
    await page.waitForSelector('text=Poem Title', { timeout: 30000 });
    
    // Get poem title and content
    const poemTitle = await page.locator('text=Poem Title').locator('..').textContent();
    const poemContent = await page.locator('text=Poem Content').locator('..').textContent();
    
    // Wait for autosave
    await page.waitForTimeout(2500);
    await page.waitForSelector('text=Last saved');
    
    // Reload
    await page.reload();
    await page.waitForSelector('text=Poem Title');
    
    // Verify poem is preserved
    const savedTitle = await page.locator('text=Poem Title').locator('..').textContent();
    const savedContent = await page.locator('text=Poem Content').locator('..').textContent();
    
    expect(savedTitle).toBe(poemTitle);
    expect(savedContent).toBe(poemContent);
    console.log('✅ Generated poem preserved after reload');
  });

  test('Stage 3: Image customization settings persist after reload', async ({ page }) => {
    console.log('🧪 Testing Stage 3 reload persistence...');
    
    await page.click('#workflow-start-poem-generator');
    await page.waitForSelector('textarea');
    
    await page.fill('textarea', 'Mountain peaks at dawn');
    await page.click('#process-stage-poem-topic');
    await page.waitForSelector('text=Poem Title', { timeout: 30000 });
    
    // Image customization is auto-run with defaults
    // Just verify it completes
    await page.click('#process-stage-image-briefing');
    
    // Wait for autosave
    await page.waitForTimeout(2500);
    await page.waitForSelector('text=Last saved');
    
    // Reload
    await page.reload();
    
    // Verify stage shows as completed
    const imageBriefingSection = page.locator('text=Image Customization').locator('..');
    await expect(imageBriefingSection).toContainText('Image Format');
    console.log('✅ Image customization preserved after reload');
  });

  test('Stage 4: Image prompt persists after reload', async ({ page }) => {
    console.log('🧪 Testing Stage 4 reload persistence...');
    
    // Quick workflow to stage 4
    await page.click('#workflow-start-poem-generator');
    await page.waitForSelector('textarea');
    
    await page.fill('textarea', 'Desert landscape');
    await page.click('#process-stage-poem-topic');
    await page.waitForSelector('text=Poem Title', { timeout: 30000 });
    await page.click('#process-stage-image-briefing');
    
    // Wait for image prompt generation
    await page.waitForSelector('text=Optimized Imagen Prompt', { timeout: 30000 });
    
    // Get the generated prompt
    const imagePrompt = await page.locator('text=Optimized Imagen Prompt').locator('..').textContent();
    
    // Wait for autosave
    await page.waitForTimeout(2500);
    await page.waitForSelector('text=Last saved');
    
    // Reload
    await page.reload();
    await page.waitForSelector('text=Optimized Imagen Prompt');
    
    // Verify prompt is preserved
    const savedPrompt = await page.locator('text=Optimized Imagen Prompt').locator('..').textContent();
    expect(savedPrompt).toBe(imagePrompt);
    console.log('✅ Image prompt preserved after reload');
  });

  test('Stage 5: Selected image persists after reload', async ({ page }) => {
    console.log('🧪 Testing Stage 5 reload persistence...');
    
    // Complete workflow to image generation
    await page.click('#workflow-start-poem-generator');
    await page.waitForSelector('textarea');
    
    await page.fill('textarea', 'Northern lights dancing');
    await page.click('#process-stage-poem-topic');
    await page.waitForSelector('text=Poem Title', { timeout: 30000 });
    await page.click('#process-stage-image-briefing');
    
    // Wait for image generation
    await page.waitForSelector('text=Download', { timeout: 60000 });
    
    // Check if there are multiple images and select the second one
    const thumbnails = await page.locator('button[title*="Thumbnail"]').count();
    if (thumbnails > 1) {
      await page.click('button[title="Thumbnail 2"]');
      console.log('✅ Selected second image');
    }
    
    // Wait for autosave
    await page.waitForTimeout(2500);
    await page.waitForSelector('text=Last saved');
    
    // Reload
    await page.reload();
    await page.waitForSelector('text=Download', { timeout: 10000 });
    
    // Verify image is still displayed
    const imageElement = page.locator('img[alt*="Generated image"]');
    await expect(imageElement).toBeVisible();
    console.log('✅ Generated image preserved after reload');
  });

  test('Stage 6: HTML briefing persists after reload', async ({ page }) => {
    console.log('🧪 Testing Stage 6 reload persistence...');
    
    // Quick workflow to HTML briefing
    await page.click('#workflow-start-poem-generator');
    await page.waitForSelector('textarea');
    
    await page.fill('textarea', 'City lights at night');
    await page.click('#process-stage-poem-topic');
    await page.waitForSelector('text=Poem Title', { timeout: 30000 });
    await page.click('#process-stage-image-briefing');
    await page.waitForSelector('text=Download', { timeout: 60000 });
    
    // HTML briefing is optional, just continue
    await page.click('#process-stage-html-briefing');
    
    // Wait for autosave
    await page.waitForTimeout(2500);
    await page.waitForSelector('text=Last saved');
    
    // Reload
    await page.reload();
    
    // Verify stage state
    const htmlBriefingSection = page.locator('text=HTML Briefing').locator('..');
    await expect(htmlBriefingSection).toBeVisible();
    console.log('✅ HTML briefing state preserved after reload');
  });

  test('Stage 7: HTML preview persists after reload', async ({ page }) => {
    console.log('🧪 Testing Stage 7 reload persistence...');
    
    // Complete workflow to HTML preview
    await page.click('#workflow-start-poem-generator');
    await page.waitForSelector('textarea');
    
    await page.fill('textarea', 'Autumn leaves falling');
    await page.click('#process-stage-poem-topic');
    await page.waitForSelector('text=Poem Title', { timeout: 30000 });
    await page.click('#process-stage-image-briefing');
    await page.waitForSelector('text=Download', { timeout: 60000 });
    await page.click('#process-stage-html-briefing');
    
    // Wait for HTML generation
    await page.waitForSelector('text=Export & Publish', { timeout: 30000 });
    
    // Wait for autosave
    await page.waitForTimeout(2500);
    await page.waitForSelector('text=Last saved');
    
    // Reload
    await page.reload();
    
    // Verify HTML preview stage is complete
    const htmlPreviewSection = page.locator('text=Generate HTML Preview').locator('..');
    await expect(htmlPreviewSection).toBeVisible();
    console.log('✅ HTML preview state preserved after reload');
  });

  test('Stage 8: Export formats and publish state persist after reload', async ({ page }) => {
    console.log('🧪 Testing Stage 8 reload persistence...');
    
    // Complete full workflow
    await page.click('#workflow-start-poem-generator');
    await page.waitForSelector('textarea');
    
    await page.fill('textarea', 'Stars in the night sky');
    await page.click('#process-stage-poem-topic');
    await page.waitForSelector('text=Poem Title', { timeout: 30000 });
    await page.click('#process-stage-image-briefing');
    await page.waitForSelector('text=Download', { timeout: 60000 });
    await page.click('#process-stage-html-briefing');
    await page.waitForSelector('text=Export & Publish', { timeout: 30000 });
    
    // Trigger export
    await page.click('#trigger-export-export-publish');
    await page.waitForSelector('h3:has-text("Styled HTML")', { timeout: 30000 });
    
    // Select publish formats
    await page.check('#publish-html-clean');
    await page.check('#publish-markdown');
    
    // Publish
    await page.click('button:has-text("Publish Now")');
    await page.waitForSelector('text=Published Successfully', { timeout: 10000 });
    
    // Get published URL
    const publishedUrlElement = await page.locator('a[href*="/published/"]').first();
    const publishedUrl = await publishedUrlElement.getAttribute('href');
    
    // Wait for autosave
    await page.waitForTimeout(2500);
    await page.waitForSelector('text=Last saved');
    
    // Reload
    await page.reload();
    await page.waitForSelector('h3:has-text("Styled HTML")', { timeout: 10000 });
    
    // Verify all export formats are visible
    await expect(page.locator('h3:has-text("Clean HTML")')).toBeVisible();
    await expect(page.locator('h3:has-text("Markdown")')).toBeVisible();
    await expect(page.locator('h3:has-text("PDF Document")')).toBeVisible();
    await expect(page.locator('h3:has-text("Word Document")')).toBeVisible();
    console.log('✅ All export formats preserved after reload');
    
    // Verify publish state is preserved
    await expect(page.locator('text=Published Successfully')).toBeVisible();
    const reloadedUrlElement = await page.locator('a[href*="/published/"]').first();
    const reloadedUrl = await reloadedUrlElement.getAttribute('href');
    expect(reloadedUrl).toBe(publishedUrl);
    console.log('✅ Published URL preserved after reload');
    
    // Verify selected formats are preserved
    await expect(page.locator('#publish-html-clean')).toBeChecked();
    await expect(page.locator('#publish-markdown')).toBeChecked();
    console.log('✅ Publish selections preserved after reload');
  });

  test('Progress state persists after reload', async ({ page }) => {
    console.log('🧪 Testing progress persistence...');
    
    await page.click('#workflow-start-poem-generator');
    await page.waitForSelector('textarea');
    
    // Complete a few stages
    await page.fill('textarea', 'Progress test poem');
    await page.click('#process-stage-poem-topic');
    await page.waitForSelector('text=Poem Title', { timeout: 30000 });
    await page.click('#process-stage-image-briefing');
    await page.waitForSelector('text=Download', { timeout: 60000 });
    
    // Check progress
    const progressBefore = await page.locator('[data-testid="wizard-progress-bar"]').getAttribute('aria-valuenow');
    const stageLabelBefore = await page.locator('text=Progress').locator('..').textContent();
    
    // Wait for autosave
    await page.waitForTimeout(2500);
    await page.waitForSelector('text=Last saved');
    
    // Reload
    await page.reload();
    await page.waitForSelector('[data-testid="wizard-progress-bar"]');
    
    // Verify progress is preserved
    const progressAfter = await page.locator('[data-testid="wizard-progress-bar"]').getAttribute('aria-valuenow');
    const stageLabelAfter = await page.locator('text=Progress').locator('..').textContent();
    
    expect(progressAfter).toBe(progressBefore);
    expect(stageLabelAfter).toBe(stageLabelBefore);
    console.log('✅ Progress state preserved after reload');
  });

  test('Multiple reloads preserve state correctly', async ({ page }) => {
    console.log('🧪 Testing multiple reloads...');
    
    await page.click('#workflow-start-poem-generator');
    await page.waitForSelector('textarea');
    
    const poemTopic = 'Testing multiple reloads';
    await page.fill('textarea', poemTopic);
    await page.click('#process-stage-poem-topic');
    await page.waitForSelector('text=Poem Title', { timeout: 30000 });
    
    // Wait for autosave
    await page.waitForTimeout(2500);
    await page.waitForSelector('text=Last saved');
    
    // First reload
    await page.reload();
    await page.waitForSelector('textarea');
    let savedTopic = await page.locator('textarea').inputValue();
    expect(savedTopic).toBe(poemTopic);
    await expect(page.locator('text=Poem Title')).toBeVisible();
    console.log('✅ First reload successful');
    
    // Second reload
    await page.reload();
    await page.waitForSelector('textarea');
    savedTopic = await page.locator('textarea').inputValue();
    expect(savedTopic).toBe(poemTopic);
    await expect(page.locator('text=Poem Title')).toBeVisible();
    console.log('✅ Second reload successful');
    
    // Third reload
    await page.reload();
    await page.waitForSelector('textarea');
    savedTopic = await page.locator('textarea').inputValue();
    expect(savedTopic).toBe(poemTopic);
    await expect(page.locator('text=Poem Title')).toBeVisible();
    console.log('✅ Third reload successful - state remains consistent');
  });
});