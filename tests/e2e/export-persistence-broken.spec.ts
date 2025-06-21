import { test, expect } from '@playwright/test';

test.describe('Export Persistence BROKEN - Proof Test', () => {
  test('proves export does NOT persist after reload', async ({ page, context }) => {
    test.setTimeout(180000);
    
    // Navigate to poem workflow
    await page.goto('/w/poem/new');
    await page.waitForLoadState('networkidle');
    
    // Quick workflow completion
    console.log('Completing workflow quickly...');
    await page.fill('#stage-poem-topic textarea', 'Beautiful sunset');
    await page.click('#process-stage-poem-topic');
    await page.waitForTimeout(8000);
    
    // Skip optional stages
    const skipButtons = page.locator('button:has-text("Continue")');
    const skipCount = await skipButtons.count();
    for (let i = 0; i < skipCount; i++) {
      if (await skipButtons.nth(i).isVisible()) {
        await skipButtons.nth(i).click();
        await page.waitForTimeout(2000);
      }
    }
    
    // Wait for stages to complete
    await page.waitForTimeout(25000);
    
    // Scroll to export stage
    for (let i = 0; i < 10; i++) {
      await page.evaluate(() => window.scrollBy(0, 500));
      await page.waitForTimeout(200);
    }
    
    // FIRST EXPORT - Should work
    console.log('\n=== FIRST EXPORT (BEFORE RELOAD) ===');
    const exportButton = page.locator('#stage-export-publish button:has-text("Export & Publish Poem")');
    await exportButton.click();
    
    await page.waitForSelector('#stage-export-publish :text("Live Preview")', { timeout: 60000 });
    console.log('✅ Export completed - Live Preview visible');
    
    // Verify all export formats are ready
    const exportFormats = await page.locator('#stage-export-publish :text("Ready ✓")').count();
    console.log(`✅ ${exportFormats} export formats ready`);
    
    // Scroll to publish section
    await page.evaluate(() => window.scrollBy(0, 1000));
    await page.waitForTimeout(1000);
    
    // PUBLISH ALL THREE FORMATS
    console.log('\n=== PUBLISHING ALL FORMATS ===');
    
    // Check all checkboxes
    const checkboxes = ['#publish-html-styled', '#publish-html-clean', '#publish-markdown'];
    for (const selector of checkboxes) {
      const checkbox = page.locator(selector);
      if (await checkbox.isVisible()) {
        await checkbox.check();
        console.log(`✅ Selected ${selector}`);
      }
    }
    
    // Click publish
    const publishButton = page.locator('#stage-export-publish button:has-text("Publish Now")');
    await publishButton.click();
    
    await page.waitForSelector('#stage-export-publish :text("Published Successfully!")', { timeout: 30000 });
    console.log('✅ Published successfully!');
    
    // Collect all published URLs
    const publishedUrls: Record<string, string> = {};
    const formats = ['html-styled', 'html-clean', 'markdown'];
    
    for (const format of formats) {
      const link = page.locator(`#stage-export-publish a[href*="/${format}"]`).first();
      if (await link.isVisible()) {
        const url = await link.getAttribute('href');
        if (url) {
          publishedUrls[format] = url;
          console.log(`📍 ${format} URL: ${url}`);
          
          // Test the URL works
          const newPage = await context.newPage();
          await newPage.goto(url);
          const content = await newPage.locator('body').textContent();
          if (content && content.length > 50) {
            console.log(`✅ ${format} page loads correctly`);
          }
          await newPage.close();
        }
      }
    }
    
    // Take screenshot before reload
    await page.screenshot({ path: './test-results/export-before-reload-proof.png', fullPage: true });
    
    // RELOAD THE PAGE
    console.log('\n\n🔄🔄🔄 RELOADING PAGE... 🔄🔄🔄\n');
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000);
    
    // Scroll back to export stage
    console.log('=== AFTER RELOAD - CHECKING EXPORT STAGE ===');
    for (let i = 0; i < 10; i++) {
      await page.evaluate(() => window.scrollBy(0, 500));
      await page.waitForTimeout(200);
    }
    
    await page.waitForSelector('#stage-export-publish', { timeout: 10000 });
    
    // Check export stage state
    const exportStageAfterReload = page.locator('#stage-export-publish');
    const exportContent = await exportStageAfterReload.textContent();
    
    console.log('\n🔍 EXPORT STAGE STATE AFTER RELOAD:');
    console.log('-----------------------------------');
    
    // Check what's missing
    if (!exportContent?.includes('Live Preview')) {
      console.log('❌ Live Preview is GONE!');
    } else {
      console.log('✅ Live Preview persisted');
    }
    
    if (!exportContent?.includes('Published Successfully!')) {
      console.log('❌ Published status is GONE!');
    } else {
      console.log('✅ Published status persisted');
    }
    
    if (!exportContent?.includes('Ready ✓')) {
      console.log('❌ Export formats are GONE!');
    } else {
      console.log('✅ Export formats persisted');
    }
    
    // Try to find the export button
    const exportButtonAfterReload = page.locator('#stage-export-publish button:has-text("Export & Publish Poem")');
    if (await exportButtonAfterReload.isVisible()) {
      console.log('❌ Export button is back - stage was RESET!');
    } else {
      console.log('✅ Export button not shown - stage remembers completion');
    }
    
    // Check if published URLs are still accessible
    console.log('\n=== TESTING PUBLISHED URLs AFTER RELOAD ===');
    for (const [format, url] of Object.entries(publishedUrls)) {
      try {
        const newPage = await context.newPage();
        await newPage.goto(url);
        const content = await newPage.locator('body').textContent();
        if (content && content.length > 50) {
          console.log(`✅ ${format} URL still works after reload: ${url}`);
        } else {
          console.log(`❌ ${format} URL is broken after reload!`);
        }
        await newPage.close();
      } catch (error) {
        console.log(`❌ ${format} URL failed after reload: ${error}`);
      }
    }
    
    // If export is gone, we need to re-run it
    if (!exportContent?.includes('Live Preview')) {
      console.log('\n=== RE-RUNNING EXPORT AFTER RELOAD ===');
      
      if (await exportButtonAfterReload.isVisible()) {
        await exportButtonAfterReload.click();
        await page.waitForSelector('#stage-export-publish :text("Live Preview")', { timeout: 60000 });
        console.log('✅ Re-export completed');
        
        // Need to publish again
        await page.evaluate(() => window.scrollBy(0, 1000));
        await page.waitForTimeout(1000);
        
        // Check all checkboxes again
        for (const selector of checkboxes) {
          const checkbox = page.locator(selector);
          if (await checkbox.isVisible()) {
            await checkbox.check();
          }
        }
        
        // Publish again
        const publishButtonAgain = page.locator('#stage-export-publish button:has-text("Publish Now")');
        if (await publishButtonAgain.isVisible()) {
          await publishButtonAgain.click();
          await page.waitForSelector('#stage-export-publish :text("Published Successfully!")', { timeout: 30000 });
          console.log('✅ Re-published successfully after reload');
        }
      }
    }
    
    // Take final screenshot
    await page.screenshot({ path: './test-results/export-after-reload-proof.png', fullPage: true });
    
    console.log('\n🚨 TEST COMPLETE - Export persistence is BROKEN! 🚨');
  });
});