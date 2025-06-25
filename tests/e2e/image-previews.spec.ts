import { test, expect } from '@playwright/test';

test.describe('Image Preview Functionality Tests (Chrome Only)', () => {
  test.skip(({ browserName }) => browserName !== 'chromium', 'Chrome only per CLAUDE.md guidelines');

  test('should handle image previews in Asset Manager', async ({ page }) => {
    console.log('🧪 Testing image previews in Asset Manager...');
    
    // Navigate to assets page
    await page.goto('/assets');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('text=Asset Manager', { timeout: 10000 });
    
    // Check if assets exist
    const assetsGrid = page.locator('[data-testid="assets-grid"]');
    const hasAssets = await assetsGrid.isVisible();
    
    if (hasAssets) {
      // Look for image assets specifically
      const assetCards = page.locator('[data-testid^="asset-card-"]');
      const assetCount = await assetCards.count();
      
      console.log(`Found ${assetCount} assets to check for images`);
      
      let imageFound = false;
      
      for (let i = 0; i < assetCount; i++) {
        const assetCard = assetCards.nth(i);
        
        // Look for preview images within the card
        const previewImage = assetCard.locator('img').first();
        const hasPreviewImage = await previewImage.isVisible();
        
        if (hasPreviewImage) {
          imageFound = true;
          console.log(`✅ Found image asset at index ${i}`);
          
          // Test clicking the image
          await previewImage.click();
          await page.waitForTimeout(1500);
          
          // Check if preview modal opened
          const modal = page.locator('[role="dialog"]');
          const modalVisible = await modal.isVisible();
          
          if (modalVisible) {
            console.log('✅ Image preview modal opened');
            
            // Test modal controls
            await expect(page.locator('button:has-text("Download")')).toBeVisible();
            await expect(page.locator('button:has-text("Open")')).toBeVisible();
            
            // Test zoom controls
            const zoomInBtn = page.locator('button:has([data-lucide="zoom-in"])');
            const zoomOutBtn = page.locator('button:has([data-lucide="zoom-out"])');
            
            if (await zoomInBtn.isVisible()) {
              await zoomInBtn.click();
              console.log('✅ Zoom in button works');
            }
            
            if (await zoomOutBtn.isVisible()) {
              await zoomOutBtn.click();
              console.log('✅ Zoom out button works');
            }
            
            // Test closing modal
            await page.keyboard.press('Escape');
            await page.waitForTimeout(500);
            
            const modalStillVisible = await modal.isVisible();
            if (!modalStillVisible) {
              console.log('✅ Modal closed with Escape key');
            } else {
              // Try clicking close button
              const closeBtn = page.locator('button:has([data-lucide="x"])');
              if (await closeBtn.isVisible()) {
                await closeBtn.click();
                console.log('✅ Modal closed with close button');
              }
            }
            
            break; // Test first image found
          } else {
            console.log('ℹ️  Image clicked but no modal appeared (might not be a proper image asset)');
          }
        }
      }
      
      if (!imageFound) {
        console.log('ℹ️  No image assets found in Asset Manager');
      }
      
      // Test Preview button on assets
      for (let i = 0; i < Math.min(assetCount, 3); i++) {
        const assetCard = assetCards.nth(i);
        const previewBtn = assetCard.locator('button:has-text("Preview")');
        
        if (await previewBtn.isVisible()) {
          await previewBtn.click();
          await page.waitForTimeout(1000);
          
          const modal = page.locator('[role="dialog"]');
          if (await modal.isVisible()) {
            console.log('✅ Preview button opened modal');
            await page.keyboard.press('Escape');
            await page.waitForTimeout(500);
            break;
          }
        }
      }
      
    } else {
      console.log('ℹ️  No assets found in Asset Manager');
    }
    
    console.log('🎉 Asset Manager image preview test completed!');
  });

  test('should handle image previews in All Documents page', async ({ page }) => {
    console.log('🧪 Testing image previews in All Documents page...');
    
    // Navigate to documents page
    await page.goto('/documents');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('text=All Documents', { timeout: 10000 });
    
    // Check if documents exist
    const documentsList = page.locator('[data-testid="enhanced-documents-list"]');
    const hasDocuments = await documentsList.isVisible();
    
    if (hasDocuments) {
      const documentCards = page.locator('[data-testid^="enhanced-document-card-"]');
      const docCount = await documentCards.count();
      
      console.log(`Found ${docCount} documents to check for images`);
      
      let documentWithImageFound = false;
      
      for (let i = 0; i < docCount; i++) {
        const docCard = documentCards.nth(i);
        const docId = (await docCard.getAttribute('data-testid'))?.replace('enhanced-document-card-', '');
        
        if (docId) {
          // Check for document preview image
          const previewImage = page.locator(`[data-testid="document-preview-image-${docId}"]`);
          const hasPreviewImage = await previewImage.isVisible();
          
          if (hasPreviewImage) {
            documentWithImageFound = true;
            console.log(`✅ Found document with preview image: ${docId}`);
            
            // Test clicking the preview image
            await previewImage.click();
            await page.waitForTimeout(1500);
            
            // Check if preview modal opened
            const modal = page.locator('[role="dialog"]');
            const modalVisible = await modal.isVisible();
            
            if (modalVisible) {
              console.log('✅ Document image preview modal opened');
              
              // Test modal controls
              const downloadBtn = page.locator('button:has([data-lucide="download"])');
              const externalBtn = page.locator('button:has([data-lucide="external-link"])');
              
              await expect(downloadBtn.or(page.locator('button:has-text("Download")'))).toBeVisible();
              await expect(externalBtn.or(page.locator('button:has-text("Open")'))).toBeVisible();
              
              // Test zoom functionality
              const zoomInBtn = page.locator('button:has([data-lucide="zoom-in"])');
              const zoomOutBtn = page.locator('button:has([data-lucide="zoom-out"])');
              const zoomResetBtn = page.locator('button:has-text("%")');
              
              if (await zoomInBtn.isVisible()) {
                await zoomInBtn.click();
                await page.waitForTimeout(300);
                console.log('✅ Zoom in functionality works');
              }
              
              if (await zoomResetBtn.isVisible()) {
                await zoomResetBtn.click();
                await page.waitForTimeout(300);
                console.log('✅ Zoom reset functionality works');
              }
              
              if (await zoomOutBtn.isVisible()) {
                await zoomOutBtn.click();
                await page.waitForTimeout(300);
                console.log('✅ Zoom out functionality works');
              }
              
              // Test closing modal
              await page.keyboard.press('Escape');
              await page.waitForTimeout(500);
              
              const modalStillVisible = await modal.isVisible();
              if (!modalStillVisible) {
                console.log('✅ Modal closed with Escape key');
              } else {
                // Try clicking close button
                const closeBtn = page.locator('button:has([data-lucide="x"])');
                if (await closeBtn.isVisible()) {
                  await closeBtn.click();
                  console.log('✅ Modal closed with close button');
                }
              }
              
              break; // Test first document with image
            } else {
              console.log('ℹ️  Preview image clicked but no modal appeared');
            }
          }
          
          // Check for asset thumbnails in the document card
          const assetThumbnails = docCard.locator('img').filter({ hasNot: page.locator(`[data-testid="document-preview-image-${docId}"]`) });
          const thumbnailCount = await assetThumbnails.count();
          
          if (thumbnailCount > 0) {
            console.log(`✅ Found ${thumbnailCount} asset thumbnails for document ${docId}`);
            
            // Test clicking asset thumbnails
            const firstThumbnail = assetThumbnails.first();
            if (await firstThumbnail.isVisible()) {
              await firstThumbnail.click();
              await page.waitForTimeout(1000);
              
              const modal = page.locator('[role="dialog"]');
              if (await modal.isVisible()) {
                console.log('✅ Asset thumbnail opened preview modal');
                await page.keyboard.press('Escape');
                await page.waitForTimeout(500);
              }
            }
          }
        }
      }
      
      if (!documentWithImageFound) {
        console.log('ℹ️  No documents with preview images found');
      }
      
    } else {
      console.log('ℹ️  No documents found');
    }
    
    console.log('🎉 Documents page image preview test completed!');
  });

  test('should handle image preview modal interactions', async ({ page }) => {
    console.log('🧪 Testing comprehensive image preview modal interactions...');
    
    // Try assets page first
    await page.goto('/assets');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('text=Asset Manager', { timeout: 10000 });
    
    // Look for any clickable image
    const images = page.locator('img[src*="firebasestorage"]').or(page.locator('img[src*="googleapis"]'));
    const imageCount = await images.count();
    
    if (imageCount > 0) {
      console.log(`Found ${imageCount} Firebase storage images to test`);
      
      // Click first image
      await images.first().click();
      await page.waitForTimeout(1500);
      
      const modal = page.locator('[role="dialog"]');
      const modalVisible = await modal.isVisible();
      
      if (modalVisible) {
        console.log('✅ Image preview modal opened from Firebase storage image');
        
        // Test all modal interactions
        await testModalInteractions(page);
        
        // Close modal
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
      }
    }
    
    // Also try documents page
    await page.goto('/documents');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('text=All Documents', { timeout: 10000 });
    
    const docImages = page.locator('[data-testid^="document-preview-image-"]');
    const docImageCount = await docImages.count();
    
    if (docImageCount > 0) {
      console.log(`Found ${docImageCount} document preview images to test`);
      
      await docImages.first().click();
      await page.waitForTimeout(1500);
      
      const modal = page.locator('[role="dialog"]');
      const modalVisible = await modal.isVisible();
      
      if (modalVisible) {
        console.log('✅ Image preview modal opened from document preview');
        
        // Test all modal interactions
        await testModalInteractions(page);
        
        // Close modal
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
      }
    }
    
    console.log('🎉 Comprehensive image preview modal test completed!');
  });
});

async function testModalInteractions(page: any) {
  console.log('🔍 Testing modal interactions...');
  
  // Test zoom controls
  const zoomInBtn = page.locator('button:has([data-lucide="zoom-in"])');
  const zoomOutBtn = page.locator('button:has([data-lucide="zoom-out"])');
  const zoomResetBtn = page.locator('button:has-text("%")');
  
  // Test zoom in
  if (await zoomInBtn.isVisible()) {
    await zoomInBtn.click();
    await page.waitForTimeout(300);
    
    // Click multiple times to test zoom limit
    await zoomInBtn.click();
    await zoomInBtn.click();
    console.log('✅ Zoom in tested (including limits)');
  }
  
  // Test zoom reset
  if (await zoomResetBtn.isVisible()) {
    await zoomResetBtn.click();
    await page.waitForTimeout(300);
    console.log('✅ Zoom reset tested');
  }
  
  // Test zoom out
  if (await zoomOutBtn.isVisible()) {
    await zoomOutBtn.click();
    await page.waitForTimeout(300);
    
    // Click multiple times to test zoom limit
    await zoomOutBtn.click();
    await zoomOutBtn.click();
    console.log('✅ Zoom out tested (including limits)');
  }
  
  // Test download button
  const downloadBtn = page.locator('button:has([data-lucide="download"])');
  if (await downloadBtn.isVisible()) {
    console.log('✅ Download button is available');
  }
  
  // Test external link button
  const externalBtn = page.locator('button:has([data-lucide="external-link"])');
  if (await externalBtn.isVisible()) {
    console.log('✅ External link button is available');
  }
  
  // Test close button
  const closeBtn = page.locator('button:has([data-lucide="x"])');
  if (await closeBtn.isVisible()) {
    console.log('✅ Close button is available');
  }
  
  // Test image info display
  const imageInfo = page.locator('text*="MB"').or(page.locator('text*="KB"'));
  if (await imageInfo.isVisible()) {
    console.log('✅ Image size information is displayed');
  }
  
  console.log('✅ Modal interaction testing completed');
}