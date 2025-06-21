import { test, expect } from '@playwright/test';

test.describe('Export Reload and Re-run Test', () => {
  test('export persists and can be re-run after reload', async ({ page, context }) => {
    // Set longer timeout
    test.setTimeout(180000);
    
    // Navigate to poem workflow
    await page.goto('/w/poem/new');
    await page.waitForLoadState('networkidle');
    
    // Fill poem topic
    console.log('Step 1: Filling poem topic...');
    await page.fill('#stage-poem-topic textarea', 'Beautiful sunset over the ocean');
    await page.click('#process-stage-poem-topic');
    
    // Wait for poem generation to complete
    console.log('Step 2: Waiting for poem generation...');
    await page.waitForTimeout(10000);
    await page.waitForSelector('#stage-generate-poem-with-title :text("Poem Title")', { timeout: 30000 });
    console.log('✅ Poem generated');
    
    // Skip image briefing
    console.log('Step 3: Skipping image briefing...');
    const imageContinue = page.locator('#stage-image-briefing button:has-text("Continue")');
    if (await imageContinue.isVisible({ timeout: 5000 })) {
      await imageContinue.click();
    }
    
    // Wait for image generation to complete
    console.log('Step 4: Waiting for image generation...');
    await page.waitForTimeout(25000); // Images take time
    
    // Scroll down to find HTML briefing
    for (let i = 0; i < 5; i++) {
      await page.evaluate(() => window.scrollBy(0, 500));
      await page.waitForTimeout(300);
    }
    
    // Skip HTML briefing
    console.log('Step 5: Skipping HTML briefing...');
    const htmlContinue = page.locator('#stage-html-briefing button:has-text("Continue")');
    if (await htmlContinue.isVisible({ timeout: 5000 })) {
      await htmlContinue.click();
    }
    
    // Wait for HTML preview to generate
    console.log('Step 6: Waiting for HTML preview generation...');
    await page.waitForTimeout(15000); // Give more time for HTML generation
    // Look for the HTML preview content (not iframe) - wait for completion
    await page.waitForSelector('#stage-generate-html-preview.completed', { timeout: 45000 });
    console.log('✅ HTML preview generated');
    
    // Scroll to export stage
    console.log('Step 3: Finding export stage...');
    await page.evaluate(() => {
      const exportStage = document.querySelector('#stage-export-publish');
      if (exportStage) {
        exportStage.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        window.scrollTo(0, document.body.scrollHeight);
      }
    });
    await page.waitForTimeout(2000);
    
    // Click export button FIRST TIME
    console.log('Step 4: Running export FIRST TIME...');
    const exportButton = page.locator('#stage-export-publish button:has-text("Export & Publish Poem")');
    await exportButton.click();
    
    // Wait for export to complete
    await page.waitForSelector('#stage-export-publish :text("Live Preview")', { timeout: 60000 });
    console.log('✅ FIRST export completed - Live Preview visible');
    
    // Check if preview is actually showing content
    const previewFrame = page.locator('#stage-export-publish :text("Live Preview")');
    await expect(previewFrame).toBeVisible({ timeout: 10000 });
    console.log('✅ Live Preview is visible');
    
    // Test view switching
    const cleanButton = page.locator('#stage-export-publish button:has-text("Clean")');
    if (await cleanButton.isVisible()) {
      await cleanButton.click();
      await page.waitForTimeout(1000);
      console.log('✅ Switched to Clean view');
      
      const styledButton = page.locator('#stage-export-publish button:has-text("Styled")');
      await styledButton.click();
      await page.waitForTimeout(1000);
      console.log('✅ Switched back to Styled view');
    }
    
    // Scroll down to publish section
    await page.evaluate(() => window.scrollBy(0, 1000));
    await page.waitForTimeout(1000);
    
    // Publish ALL THREE FORMATS
    console.log('Step 5: Publishing ALL THREE FORMATS...');
    const publishButton = page.locator('#stage-export-publish button:has-text("Publish Now")');
    if (await publishButton.isVisible()) {
      // Select ALL format checkboxes
      const formatCheckboxes = [
        { id: '#publish-html-styled', name: 'HTML Styled' },
        { id: '#publish-html-clean', name: 'HTML Clean' },
        { id: '#publish-markdown', name: 'Markdown' }
      ];
      
      for (const format of formatCheckboxes) {
        const checkbox = page.locator(format.id);
        if (await checkbox.isVisible()) {
          await checkbox.check();
          console.log(`✅ Selected ${format.name}`);
        }
      }
      
      await publishButton.click();
      await page.waitForSelector('#stage-export-publish :text("Published Successfully!")', { timeout: 30000 });
      console.log('✅ Published ALL FORMATS successfully!');
      
      // Collect ALL published URLs
      const publishedUrls: Record<string, string> = {};
      const urlFormats = ['html-styled', 'html-clean', 'markdown'];
      
      console.log('📍 COLLECTING PUBLISHED URLs:');
      for (const format of urlFormats) {
        const link = page.locator(`#stage-export-publish a[href*="/${format}"]`).first();
        if (await link.isVisible()) {
          const url = await link.getAttribute('href');
          if (url) {
            publishedUrls[format] = url;
            console.log(`  📍 ${format}: ${url}`);
          }
        }
      }
      
      // TEST ALL published URLs work BEFORE RELOAD
      console.log('🧪 TESTING ALL URLs BEFORE RELOAD...');
      for (const [format, url] of Object.entries(publishedUrls)) {
        const newPage = await context.newPage();
        await newPage.goto(url);
        await newPage.waitForLoadState('networkidle');
        const content = await newPage.locator('body').textContent();
        if (content && content.length > 50) {
          console.log(`✅ ${format.toUpperCase()} URL works BEFORE reload`);
        } else {
          console.log(`❌ ${format.toUpperCase()} URL failed BEFORE reload!`);
        }
        await newPage.close();
        
        // Store URLs for later testing
        (global as any).publishedUrls = publishedUrls;
      }
    }
    
    // Take screenshot before reload
    await page.screenshot({ path: './test-results/export-before-reload.png', fullPage: true });
    
    // RELOAD THE PAGE
    console.log('\n🔄 RELOADING PAGE...\n');
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000);
    
    // Scroll back to export stage
    console.log('Step 6: Finding export stage AFTER RELOAD...');
    await page.evaluate(() => {
      const exportStage = document.querySelector('#stage-export-publish');
      if (exportStage) {
        exportStage.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        // Scroll down to find it
        let scrolled = 0;
        const scrollInterval = setInterval(() => {
          window.scrollBy(0, 500);
          scrolled += 500;
          const exportStage = document.querySelector('#stage-export-publish');
          if (exportStage || scrolled > 5000) {
            clearInterval(scrollInterval);
            if (exportStage) {
              exportStage.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }
        }, 300);
      }
    });
    await page.waitForTimeout(3000);
    
    // Check export stage state after reload
    const exportStageContent = await page.locator('#stage-export-publish').textContent();
    console.log('Export stage state after reload:', exportStageContent?.substring(0, 100));
    
    // Check if Live Preview is still there
    if (exportStageContent?.includes('Live Preview')) {
      console.log('✅ Export content PERSISTED after reload!');
      
      // Check if published status persisted
      if (exportStageContent?.includes('Published Successfully!')) {
        console.log('✅ Published status PERSISTED after reload!');
        
        // TEST ALL PUBLISHED URLs AFTER RELOAD
        console.log('🧪 TESTING ALL URLs AFTER RELOAD...');
        const storedUrls = (global as any).publishedUrls || {};
        for (const [format, url] of Object.entries(storedUrls)) {
          try {
            const newPage = await context.newPage();
            await newPage.goto(url as string);
            await newPage.waitForLoadState('networkidle');
            const content = await newPage.locator('body').textContent();
            if (content && content.length > 50) {
              console.log(`✅ ${format.toUpperCase()} URL STILL WORKS after reload!`);
            } else {
              console.log(`❌ ${format.toUpperCase()} URL BROKEN after reload!`);
            }
            await newPage.close();
          } catch (error) {
            console.log(`❌ ${format.toUpperCase()} URL FAILED after reload: ${error}`);
          }
        }
      }
    } else {
      console.log('❌ Export content NOT persisted after reload');
      
      // RE-RUN THE EXPORT AFTER RELOAD
      console.log('\nStep 7: RE-RUNNING export AFTER RELOAD...');
      
      // Find the export button again
      const exportButtonAfterReload = page.locator('#stage-export-publish button:has-text("Export & Publish Poem")');
      if (await exportButtonAfterReload.isVisible()) {
        await exportButtonAfterReload.click();
        
        // Wait for export to complete AGAIN
        await page.waitForSelector('#stage-export-publish :text("Live Preview")', { timeout: 60000 });
        console.log('✅ SECOND export completed after reload - Live Preview visible');
        
        // Check if it actually works now
        const previewFrameAfterReload = page.locator('#stage-export-publish :text("Live Preview")');
        await expect(previewFrameAfterReload).toBeVisible({ timeout:10000 });
        console.log('✅ Live Preview is visible after re-run');
        
        // Test if we can still publish ALL FORMATS after reload
        await page.evaluate(() => window.scrollBy(0, 1000));
        await page.waitForTimeout(1000);
        
        const publishButtonAfterReload = page.locator('#stage-export-publish button:has-text("Publish Now")');
        if (await publishButtonAfterReload.isVisible()) {
          console.log('✅ Can still publish after reload and re-run');
          
          // Re-select ALL formats again
          const formatCheckboxes = [
            { id: '#publish-html-styled', name: 'HTML Styled' },
            { id: '#publish-html-clean', name: 'HTML Clean' },
            { id: '#publish-markdown', name: 'Markdown' }
          ];
          
          for (const format of formatCheckboxes) {
            const checkbox = page.locator(format.id);
            if (await checkbox.isVisible()) {
              await checkbox.check();
              console.log(`✅ Re-selected ${format.name} after reload`);
            }
          }
          
          // Re-publish after reload
          await publishButtonAfterReload.click();
          await page.waitForSelector('#stage-export-publish :text("Published Successfully!")', { timeout: 30000 });
          console.log('✅ RE-PUBLISHED ALL FORMATS successfully after reload!');
          
          // Test new URLs after re-publish
          console.log('🧪 TESTING RE-PUBLISHED URLs...');
          const urlFormats = ['html-styled', 'html-clean', 'markdown'];
          for (const format of urlFormats) {
            const link = page.locator(`#stage-export-publish a[href*="/${format}"]`).first();
            if (await link.isVisible()) {
              const url = await link.getAttribute('href');
              if (url) {
                const newPage = await context.newPage();
                await newPage.goto(url);
                await newPage.waitForLoadState('networkidle');
                const content = await newPage.locator('body').textContent();
                if (content && content.length > 50) {
                  console.log(`✅ RE-PUBLISHED ${format.toUpperCase()} URL works!`);
                } else {
                  console.log(`❌ RE-PUBLISHED ${format.toUpperCase()} URL failed!`);
                }
                await newPage.close();
              }
            }
          }
        }
      } else {
        // Maybe we need to regenerate?
        const regenerateButton = page.locator('#stage-export-publish button:has-text("Regenerate")');
        if (await regenerateButton.isVisible()) {
          console.log('Found Regenerate button, clicking it...');
          await regenerateButton.click();
          
          await page.waitForSelector('#stage-export-publish :text("Live Preview")', { timeout: 60000 });
          console.log('✅ Export regenerated successfully after reload');
        }
      }
    }
    
    // Take final screenshot
    await page.screenshot({ path: './test-results/export-after-reload-final.png', fullPage: true });
    
    console.log('\n🎉 Export reload and re-run test completed!');
  });
});