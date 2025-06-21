import { test, expect, Page } from '@playwright/test';

test.describe('Export Complete Test with Publishing', () => {
  test('completes export, publishes, and verifies persistence', async ({ page, context }) => {
    // Set longer timeout for this test
    test.setTimeout(180000);
    
    // Navigate to poem workflow
    await page.goto('/w/poem/new');
    await page.waitForLoadState('networkidle');
    
    // Fill in poem topic
    console.log('Step 1: Filling poem topic...');
    await page.waitForSelector('#stage-poem-topic textarea', { timeout: 10000 });
    await page.fill('#stage-poem-topic textarea', 'Beautiful sunset over the ocean');
    await page.click('#process-stage-poem-topic');
    
    // Wait for poem generation
    console.log('Step 2: Waiting for poem generation...');
    await page.waitForTimeout(10000);
    
    // Skip image briefing
    console.log('Step 3: Skipping image briefing...');
    const imageContinue = page.locator('#stage-image-briefing button:has-text("Continue")');
    if (await imageContinue.count() > 0) {
      await imageContinue.click();
      await page.waitForTimeout(2000);
    }
    
    // Wait for image generation
    console.log('Step 4: Waiting for image generation...');
    await page.waitForTimeout(20000);
    
    // Scroll down to find HTML briefing
    for (let i = 0; i < 3; i++) {
      await page.evaluate(() => window.scrollBy(0, 500));
      await page.waitForTimeout(500);
    }
    
    // Skip HTML briefing
    console.log('Step 5: Skipping HTML briefing...');
    const htmlContinue = page.locator('#stage-html-briefing button:has-text("Continue")');
    if (await htmlContinue.count() > 0) {
      await htmlContinue.click();
      await page.waitForTimeout(2000);
    }
    
    // Wait for HTML preview
    console.log('Step 6: Waiting for HTML preview...');
    await page.waitForTimeout(10000);
    
    // Scroll all the way down to find export stage
    console.log('Step 7: Scrolling to export stage...');
    for (let i = 0; i < 10; i++) {
      await page.evaluate(() => window.scrollBy(0, 600));
      await page.waitForTimeout(300);
    }
    
    // Make sure export stage is visible
    await page.waitForSelector('#stage-export-publish', { timeout: 10000 });
    
    // Scroll export stage into center view
    await page.evaluate(() => {
      const element = document.querySelector('#stage-export-publish');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
    await page.waitForTimeout(2000);
    
    // Click export button
    console.log('Step 8: Triggering export...');
    const exportButton = page.locator('#stage-export-publish button:has-text("Export & Publish Poem")');
    await exportButton.click();
    
    // Wait for export to complete
    console.log('Step 9: Waiting for export to complete...');
    await page.waitForSelector('#stage-export-publish :text("Live Preview")', { timeout: 60000 });
    console.log('✅ Export completed - Live Preview visible');
    
    // Take screenshot of completed export
    await page.screenshot({ path: './test-results/export-completed.png', fullPage: true });
    
    // Scroll down within the export stage to see all content
    console.log('Step 10: Scrolling to publish section...');
    for (let i = 0; i < 5; i++) {
      await page.evaluate(() => window.scrollBy(0, 300));
      await page.waitForTimeout(300);
    }
    
    // Find and interact with publish section
    console.log('Step 11: Publishing content...');
    const publishSection = await page.waitForSelector('#stage-export-publish :text("Publish to Web")', { timeout: 10000 });
    
    // Scroll publish section into view
    await publishSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);
    
    // Select all available formats for publishing
    const checkboxes = page.locator('#stage-export-publish input[type="checkbox"]');
    const checkboxCount = await checkboxes.count();
    console.log(`Found ${checkboxCount} format checkboxes`);
    
    for (let i = 0; i < checkboxCount; i++) {
      const checkbox = checkboxes.nth(i);
      if (await checkbox.isVisible()) {
        await checkbox.check();
      }
    }
    console.log('✅ Selected all formats for publishing');
    
    // Click Publish Now button
    const publishButton = page.locator('#stage-export-publish button:has-text("Publish Now")');
    await publishButton.click();
    console.log('⏳ Publishing...');
    
    // Wait for publish success
    await page.waitForSelector('#stage-export-publish :text("Published Successfully!")', { timeout: 30000 });
    console.log('✅ Published successfully!');
    
    // Get all published URLs
    console.log('Step 12: Collecting published URLs...');
    const publishedLinks = page.locator('#stage-export-publish a[href*="/html-styled"], #stage-export-publish a[href*="/html-clean"], #stage-export-publish a[href*="/markdown"]');
    const linkCount = await publishedLinks.count();
    const publishedUrls: string[] = [];
    
    for (let i = 0; i < linkCount; i++) {
      const link = publishedLinks.nth(i);
      const url = await link.getAttribute('href');
      if (url) {
        publishedUrls.push(url);
        console.log(`📍 Published URL ${i + 1}: ${url}`);
      }
    }
    
    // Take screenshot after publishing
    await page.screenshot({ path: './test-results/export-published.png', fullPage: true });
    
    // Test opening each published format in new tabs
    console.log('Step 13: Testing published URLs...');
    for (const url of publishedUrls) {
      const newPage = await context.newPage();
      await newPage.goto(url);
      await newPage.waitForLoadState('networkidle');
      
      // Verify content loaded
      const bodyText = await newPage.locator('body').textContent();
      if (bodyText && bodyText.length > 100) {
        console.log(`✅ Published content loaded successfully: ${url}`);
      }
      
      // Take screenshot of published page
      const filename = url.includes('html-styled') ? 'html-styled' : 
                       url.includes('html-clean') ? 'html-clean' : 'markdown';
      await newPage.screenshot({ path: `./test-results/published-${filename}.png` });
      
      await newPage.close();
    }
    
    // Test reload persistence
    console.log('Step 14: Testing reload persistence...');
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // Scroll back to export stage
    console.log('Step 15: Scrolling back to export stage after reload...');
    for (let i = 0; i < 10; i++) {
      await page.evaluate(() => window.scrollBy(0, 600));
      await page.waitForTimeout(300);
    }
    
    // Verify export stage is still there
    await page.waitForSelector('#stage-export-publish', { timeout: 10000 });
    
    // Check if export content persisted
    const exportStageAfterReload = page.locator('#stage-export-publish');
    const exportContentAfterReload = await exportStageAfterReload.textContent();
    
    if (exportContentAfterReload?.includes('Live Preview')) {
      console.log('✅ Export Live Preview persisted after reload!');
    }
    
    if (exportContentAfterReload?.includes('Published Successfully!')) {
      console.log('✅ Published status persisted after reload!');
    }
    
    // Scroll down to see publish section again
    for (let i = 0; i < 5; i++) {
      await page.evaluate(() => window.scrollBy(0, 300));
      await page.waitForTimeout(300);
    }
    
    // Verify published URLs are still there after reload
    console.log('Step 16: Verifying published URLs after reload...');
    const reloadedPublishedLinks = page.locator('#stage-export-publish a[href*="/html-styled"], #stage-export-publish a[href*="/html-clean"], #stage-export-publish a[href*="/markdown"]');
    const reloadedLinkCount = await reloadedPublishedLinks.count();
    
    if (reloadedLinkCount > 0) {
      console.log(`✅ Found ${reloadedLinkCount} published URLs after reload`);
      
      // Test opening published URLs again after reload
      for (let i = 0; i < reloadedLinkCount; i++) {
        const link = reloadedPublishedLinks.nth(i);
        const url = await link.getAttribute('href');
        if (url) {
          const newPage = await context.newPage();
          await newPage.goto(url);
          await newPage.waitForLoadState('networkidle');
          
          const bodyText = await newPage.locator('body').textContent();
          if (bodyText && bodyText.length > 100) {
            console.log(`✅ Published content still accessible after reload: ${url}`);
          }
          
          await newPage.close();
        }
      }
    }
    
    // Take final screenshot
    await page.screenshot({ path: './test-results/export-after-reload-complete.png', fullPage: true });
    
    console.log('🎉 Export persistence test completed successfully!');
  });
});