import { test, expect } from '@playwright/test';

test.describe('Export Stage Simple Test', () => {
  test('can trigger and complete export stage', async ({ page }) => {
    // Set longer timeout for this test
    test.setTimeout(120000);
    
    // Navigate to poem workflow
    await page.goto('/w/poem/new');
    await page.waitForLoadState('networkidle');
    
    // Fill in poem topic
    console.log('Filling poem topic...');
    await page.waitForSelector('#stage-poem-topic textarea', { timeout: 10000 });
    await page.fill('#stage-poem-topic textarea', 'Beautiful sunset over the ocean');
    await page.click('#process-stage-poem-topic');
    
    // Wait for poem generation
    console.log('Waiting for poem generation...');
    await page.waitForTimeout(10000);
    
    // Skip all optional stages by clicking Continue
    console.log('Skipping optional stages...');
    
    // Skip image briefing
    const imageContinue = page.locator('#stage-image-briefing button:has-text("Continue")');
    if (await imageContinue.count() > 0) {
      await imageContinue.click();
      await page.waitForTimeout(2000);
    }
    
    // Wait for image generation
    console.log('Waiting for image generation...');
    await page.waitForTimeout(20000);
    
    // Scroll down
    await page.evaluate(() => window.scrollBy(0, 1000));
    await page.waitForTimeout(1000);
    
    // Skip HTML briefing
    const htmlContinue = page.locator('#stage-html-briefing button:has-text("Continue")');
    if (await htmlContinue.count() > 0) {
      await htmlContinue.click();
      await page.waitForTimeout(2000);
    }
    
    // Wait for HTML preview
    console.log('Waiting for HTML preview...');
    await page.waitForTimeout(10000);
    
    // Scroll to bottom to find export stage
    console.log('Scrolling to export stage...');
    await page.evaluate(() => {
      const element = document.querySelector('#stage-export-publish');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        window.scrollTo(0, document.body.scrollHeight);
      }
    });
    await page.waitForTimeout(2000);
    
    // Take screenshot to see current state
    await page.screenshot({ path: './test-results/export-stage-before-click.png', fullPage: true });
    
    // DEBUG: Dump the export stage HTML to see what's actually there
    const exportStageHTML = await page.locator('#stage-export-publish').innerHTML();
    console.log('Export stage HTML:', exportStageHTML);
    
    // Try to find and click the export button
    console.log('Looking for export button...');
    
    // Try multiple selectors
    const exportSelectors = [
      '#trigger-export-export-publish',
      '#stage-export-publish button:has-text("Export & Publish Poem")',
      '#stage-export-publish button:has-text("Export")',
      '#process-stage-export-publish',
      '#stage-export-publish [data-testid="trigger-export-export-publish"]',
      '#stage-export-publish button'
    ];
    
    let exportButton = null;
    for (const selector of exportSelectors) {
      const button = page.locator(selector);
      if (await button.count() > 0) {
        exportButton = button;
        console.log(`Found export button with selector: ${selector}`);
        break;
      }
    }
    
    if (!exportButton) {
      throw new Error('Could not find export button');
    }
    
    // Wait for React to hydrate and attach event handlers
    console.log('Waiting for React hydration...');
    await page.waitForTimeout(3000);
    
    // Ensure button is visible and enabled
    await exportButton.waitFor({ state: 'visible' });
    console.log('Button is visible');
    
    const isEnabled = await exportButton.isEnabled();
    console.log('Button is enabled:', isEnabled);
    
    // Click export button with force option
    console.log('Clicking export button...');
    await exportButton.click({ force: true });
    
    // Wait for export to complete
    console.log('Waiting for export to complete...');
    await page.waitForTimeout(30000);
    
    // Check if Live Preview appeared
    const livePreview = page.locator('text="Live Preview"');
    await expect(livePreview).toBeVisible({ timeout: 30000 });
    console.log('✅ Export completed - Live Preview visible');
    
    // Take final screenshot
    await page.screenshot({ path: './test-results/export-stage-completed.png', fullPage: true });
    
    // Check for preview buttons
    const styledButton = page.locator('#stage-export-publish button:has-text("Styled")');
    const cleanButton = page.locator('#stage-export-publish button:has-text("Clean")');
    
    if (await styledButton.count() > 0 || await cleanButton.count() > 0) {
      console.log('✅ Export preview buttons found');
    }
    
    // Test publishing functionality
    console.log('Testing publish functionality...');
    
    // Scroll down within the export stage to find publish section
    await page.evaluate(() => {
      const exportStage = document.querySelector('#stage-export-publish');
      if (exportStage) {
        // Scroll within the stage card to see publish section
        const cardContent = exportStage.querySelector('.space-y-4');
        if (cardContent) {
          cardContent.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
      }
    });
    await page.waitForTimeout(2000);
    
    // Look for Publish to Web section
    const publishSection = page.locator('#stage-export-publish :text("Publish to Web")');
    if (await publishSection.count() > 0) {
      console.log('✅ Publish section found');
      
      // Select ALL THREE formats for publishing
      const formatCheckboxes = [
        { id: '#publish-html-styled', name: 'HTML Styled' },
        { id: '#publish-html-clean', name: 'HTML Clean' },
        { id: '#publish-markdown', name: 'Markdown' }
      ];
      
      for (const format of formatCheckboxes) {
        const checkbox = page.locator(`#stage-export-publish input[id="${format.id.replace('#', '')}"]`);
        if (await checkbox.count() > 0) {
          await checkbox.check();
          console.log(`✅ Selected ${format.name} for publishing`);
        }
      }
      
      // Click Publish Now button
      const publishButton = page.locator('#stage-export-publish button:has-text("Publish Now")');
      if (await publishButton.count() > 0) {
        await publishButton.click();
        console.log('⏳ Publishing ALL FORMATS...');
        
        // Wait for publish success
        await page.waitForSelector('#stage-export-publish :text("Published Successfully!")', { timeout: 30000 });
        console.log('✅ Published ALL FORMATS successfully!');
        
        // Collect ALL published URLs
        const publishedUrls: Record<string, string> = {};
        const urlFormats = ['html-styled', 'html-clean', 'markdown'];
        
        console.log('📍 COLLECTING ALL PUBLISHED URLs:');
        for (const format of urlFormats) {
          const link = page.locator(`#stage-export-publish a[href*="/${format}"]`).first();
          if (await link.count() > 0) {
            const url = await link.getAttribute('href');
            if (url) {
              publishedUrls[format] = url;
              console.log(`  📍 ${format}: ${url}`);
            }
          }
        }
        
        // Store URLs globally for after-reload testing
        (global as any).publishedUrls = publishedUrls;
      }
    }
    
    // Take screenshot after publishing
    await page.screenshot({ path: './test-results/export-stage-published.png', fullPage: true });
    
    // Test reload persistence
    console.log('\n🔄 TESTING RELOAD PERSISTENCE...');
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000);
    
    // Scroll down to bottom to find export stage after reload
    console.log('Scrolling to bottom to find export stage after reload...');
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await page.waitForTimeout(2000);
    
    // Then scroll to export stage specifically
    await page.evaluate(() => {
      const element = document.querySelector('#stage-export-publish');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
    await page.waitForTimeout(3000);
    
    // Check if the export stage shows the content
    const exportStage = page.locator('#stage-export-publish');
    await expect(exportStage).toBeVisible({ timeout: 10000 });
    
    // Check if export content persisted
    const exportContent = await exportStage.textContent();
    console.log('Export stage content after reload:', exportContent?.substring(0, 200));
    
    if (exportContent?.includes('Live Preview')) {
      console.log('✅ Live Preview PERSISTED after reload!');
      
      if (exportContent?.includes('Published Successfully!')) {
        console.log('✅ Published status PERSISTED after reload!');
        
        // TEST ALL PUBLISHED URLs AFTER RELOAD
        console.log('🧪 TESTING ALL PUBLISHED URLs AFTER RELOAD...');
        const storedUrls = (global as any).publishedUrls || {};
        
        for (const [format, url] of Object.entries(storedUrls)) {
          console.log(`Testing ${format.toUpperCase()} URL: ${url}`);
          
          // Open URL in new tab to test
          const newTab = await page.context().newPage();
          try {
            await newTab.goto(url as string);
            await newTab.waitForLoadState('networkidle');
            
            const content = await newTab.locator('body').textContent();
            if (content && content.length > 100) {
              console.log(`✅ ${format.toUpperCase()} URL WORKS after reload!`);
            } else {
              console.log(`❌ ${format.toUpperCase()} URL returned empty content!`);
            }
          } catch (error) {
            console.log(`❌ ${format.toUpperCase()} URL FAILED: ${error}`);
          } finally {
            await newTab.close();
          }
        }
      } else {
        console.log('❌ Published status NOT persisted after reload!');
      }
    } else {
      console.log('❌ Live Preview NOT persisted after reload!');
      console.log('Export stage is likely empty/reset after reload');
    }
    
    // Take screenshot after reload
    await page.screenshot({ path: './test-results/export-stage-after-reload.png', fullPage: true });
  });
});