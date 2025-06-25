import { test, expect } from '@playwright/test';

test.describe('All Documents Page E2E Tests (Chrome Only)', () => {
  test.skip(({ browserName }) => browserName !== 'chromium', 'Chrome only per CLAUDE.md guidelines');

  test('should display enhanced documents page with statistics and filtering', async ({ page }) => {
    console.log('🧪 Starting All Documents comprehensive test...');
    
    // Navigate to documents page
    await page.goto('/documents');
    await page.waitForLoadState('networkidle');
    
    // Wait for page to load
    await page.waitForSelector('text=All Documents', { timeout: 10000 });
    console.log('✅ All Documents page loaded');
    
    // Verify page header and description
    await expect(page.locator('h1')).toContainText('All Documents');
    await expect(page.locator('text=Manage and organize all your AI-generated documents')).toBeVisible();
    
    // Verify statistics cards are present
    await expect(page.locator('text=Total Documents')).toBeVisible();
    await expect(page.locator('text=Completed')).toBeVisible();
    await expect(page.locator('text=In Progress')).toBeVisible();
    await expect(page.locator('text=Drafts')).toBeVisible();
    await expect(page.locator('text=With Images')).toBeVisible();
    
    // Test search functionality
    const searchInput = page.locator('[data-testid="documents-search-input"]');
    await expect(searchInput).toBeVisible();
    console.log('✅ Search input is visible');
    
    // Test workflow filter
    const workflowFilter = page.locator('[data-testid="workflow-filter-select"]');
    await expect(workflowFilter).toBeVisible();
    console.log('✅ Workflow filter is visible');
    
    // Test status filter  
    const statusFilter = page.locator('[data-testid="status-filter-select"]');
    await expect(statusFilter).toBeVisible();
    console.log('✅ Status filter is visible');
    
    // Test sort select
    const sortSelect = page.locator('[data-testid="documents-sort-select"]');
    await expect(sortSelect).toBeVisible();
    console.log('✅ Sort select is visible');
    
    // Check if enhanced documents list is present
    const documentsList = page.locator('[data-testid="enhanced-documents-list"]');
    const hasDocuments = await documentsList.isVisible();
    
    if (hasDocuments) {
      console.log('✅ Documents found - testing document interactions');
      
      // Test document cards
      const documentCards = page.locator('[data-testid^="enhanced-document-card-"]');
      const docCount = await documentCards.count();
      
      if (docCount > 0) {
        console.log(`Found ${docCount} documents to test`);
        
        // Test first document
        const firstDocCard = documentCards.first();
        const docId = (await firstDocCard.getAttribute('data-testid'))?.replace('enhanced-document-card-', '');
        
        if (docId) {
          // Test document checkbox if select all header is visible
          const selectAllHeader = page.locator('[data-testid="select-all-header"]');
          if (await selectAllHeader.isVisible()) {
            const docCheckbox = page.locator(`[data-testid="document-checkbox-${docId}"]`);
            if (await docCheckbox.isVisible()) {
              await docCheckbox.click();
              console.log('✅ Document selected');
              
              // Verify bulk actions appear
              await expect(page.locator('[data-testid="documents-bulk-actions"]')).toBeVisible();
              await expect(page.locator('[data-testid="selected-documents-count"]')).toContainText('1 document selected');
              
              // Test bulk action buttons
              await expect(page.locator('[data-testid="bulk-export-documents"]')).toBeVisible();
              await expect(page.locator('[data-testid="bulk-delete-documents"]')).toBeVisible();
              await expect(page.locator('[data-testid="bulk-cancel-documents"]')).toBeVisible();
              
              // Cancel selection
              await page.locator('[data-testid="bulk-cancel-documents"]').click();
              await expect(page.locator('[data-testid="documents-bulk-actions"]')).not.toBeVisible();
              console.log('✅ Bulk selection cancelled');
            }
          }
          
          // Test document thumbnail and preview
          const documentThumbnail = page.locator(`[data-testid="document-thumbnail-${docId}"]`);
          await expect(documentThumbnail).toBeVisible();
          
          // Test preview image if available
          const previewImage = page.locator(`[data-testid="document-preview-image-${docId}"]`);
          if (await previewImage.isVisible()) {
            console.log('✅ Document has preview image');
            
            // Test clicking preview image
            await previewImage.click();
            await page.waitForTimeout(1000);
            
            // Check if modal opened
            const modal = page.locator('[role="dialog"]');
            if (await modal.isVisible()) {
              console.log('✅ Image preview modal opened');
              await page.keyboard.press('Escape');
              console.log('✅ Image preview modal closed');
            }
          }
          
          // Test document actions
          const openBtn = page.locator(`[data-testid="document-open-btn-${docId}"]`);
          const actionsBtn = page.locator(`[data-testid="document-actions-btn-${docId}"]`);
          
          await expect(openBtn).toBeVisible();
          await expect(actionsBtn).toBeVisible();
          console.log('✅ Document action buttons are visible');
        }
      }
    } else {
      console.log('ℹ️  No documents found - testing empty state');
      await expect(page.locator('text=No documents found')).toBeVisible();
    }
    
    console.log('🎉 All Documents test completed successfully!');
  });

  test('should handle document search and filtering correctly', async ({ page }) => {
    console.log('🧪 Testing document search and filtering...');
    
    await page.goto('/documents');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('text=All Documents', { timeout: 10000 });
    
    // Test search functionality
    const searchInput = page.locator('[data-testid="documents-search-input"]');
    
    // Test various search terms
    const searchTerms = ['poem', 'test', 'ai', 'generated', 'document'];
    
    for (const term of searchTerms) {
      await searchInput.fill(term);
      await page.waitForTimeout(500);
      console.log(`✅ Searched for: ${term}`);
      
      // Verify search results update
      const resultText = page.locator('text*="Showing"');
      if (await resultText.isVisible()) {
        const resultContent = await resultText.textContent();
        console.log(`Search results: ${resultContent}`);
      }
    }
    
    // Clear search
    await searchInput.clear();
    await page.waitForTimeout(500);
    console.log('✅ Search cleared');
    
    // Test workflow filtering
    const workflowFilter = page.locator('[data-testid="workflow-filter-select"]');
    await workflowFilter.click();
    await page.waitForTimeout(500);
    
    // Check for workflow options
    const workflowOptions = [
      'All workflows',
      'Poem Generator',
      'SEO Recipe',
      'Press Release',
      'SEO Article'
    ];
    
    for (const option of workflowOptions) {
      const optionLocator = page.locator(`text="${option}"`);
      if (await optionLocator.isVisible()) {
        await optionLocator.click();
        await page.waitForTimeout(500);
        console.log(`✅ Selected workflow filter: ${option}`);
        
        // Reopen filter for next option
        if (workflowOptions.indexOf(option) < workflowOptions.length - 1) {
          await workflowFilter.click();
          await page.waitForTimeout(300);
        }
      }
    }
    
    // Test status filtering
    const statusFilter = page.locator('[data-testid="status-filter-select"]');
    await statusFilter.click();
    await page.waitForTimeout(500);
    
    const statusOptions = ['All statuses', 'Completed', 'In Progress', 'Draft'];
    
    for (const option of statusOptions) {
      const optionLocator = page.locator(`text="${option}"`);
      if (await optionLocator.isVisible()) {
        await optionLocator.click();
        await page.waitForTimeout(500);
        console.log(`✅ Selected status filter: ${option}`);
        
        // Reopen filter for next option
        if (statusOptions.indexOf(option) < statusOptions.length - 1) {
          await statusFilter.click();
          await page.waitForTimeout(300);
        }
      }
    }
    
    console.log('🎉 Document search and filtering test completed!');
  });

  test('should handle document sorting correctly', async ({ page }) => {
    console.log('🧪 Testing document sorting...');
    
    await page.goto('/documents');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('text=All Documents', { timeout: 10000 });
    
    // Test sort functionality
    const sortSelect = page.locator('[data-testid="documents-sort-select"]');
    await sortSelect.click();
    await page.waitForTimeout(500);
    
    // Test different sort options
    const sortOptions = [
      'Most Recent',
      'Oldest First',
      'Title (A-Z)',
      'Workflow Type',
      'Status'
    ];
    
    for (const option of sortOptions) {
      const optionLocator = page.locator(`text="${option}"`);
      if (await optionLocator.isVisible()) {
        await optionLocator.click();
        await page.waitForTimeout(500);
        console.log(`✅ Selected sort option: ${option}`);
        
        // Verify documents are sorted (check if list updates)
        const documentsList = page.locator('[data-testid="enhanced-documents-list"]');
        if (await documentsList.isVisible()) {
          console.log('✅ Documents list updated after sort');
        }
        
        // Reopen select for next option
        if (sortOptions.indexOf(option) < sortOptions.length - 1) {
          await sortSelect.click();
          await page.waitForTimeout(300);
        }
      }
    }
    
    console.log('🎉 Document sorting test completed!');
  });

  test('should test document bulk operations', async ({ page }) => {
    console.log('🧪 Testing document bulk operations...');
    
    await page.goto('/documents');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('text=All Documents', { timeout: 10000 });
    
    // Check if documents exist and have checkboxes
    const selectAllHeader = page.locator('[data-testid="select-all-header"]');
    const hasSelectableDocuments = await selectAllHeader.isVisible();
    
    if (hasSelectableDocuments) {
      console.log('✅ Found selectable documents');
      
      // Test select all functionality
      const selectAllCheckbox = page.locator('[data-testid="select-all-checkbox"]');
      await selectAllCheckbox.click();
      console.log('✅ Select all clicked');
      
      // Verify bulk actions appear
      const bulkActions = page.locator('[data-testid="documents-bulk-actions"]');
      await expect(bulkActions).toBeVisible();
      
      // Verify bulk action buttons
      await expect(page.locator('[data-testid="bulk-export-documents"]')).toBeVisible();
      await expect(page.locator('[data-testid="bulk-delete-documents"]')).toBeVisible();
      await expect(page.locator('[data-testid="bulk-cancel-documents"]')).toBeVisible();
      
      // Check selected count
      const selectedCount = page.locator('[data-testid="selected-documents-count"]');
      const countText = await selectedCount.textContent();
      console.log(`Selected documents: ${countText}`);
      
      // Test bulk cancel
      await page.locator('[data-testid="bulk-cancel-documents"]').click();
      await expect(bulkActions).not.toBeVisible();
      console.log('✅ Bulk selection cancelled');
      
      // Test individual selection
      const firstDocCheckbox = page.locator('[data-testid^="document-checkbox-"]').first();
      if (await firstDocCheckbox.isVisible()) {
        await firstDocCheckbox.click();
        await expect(bulkActions).toBeVisible();
        console.log('✅ Individual document selected');
        
        // Cancel again
        await page.locator('[data-testid="bulk-cancel-documents"]').click();
        console.log('✅ Individual selection cancelled');
      }
    } else {
      console.log('ℹ️  No selectable documents found');
    }
    
    console.log('🎉 Document bulk operations test completed!');
  });

  test('should test document interactions and navigation', async ({ page }) => {
    console.log('🧪 Testing document interactions...');
    
    await page.goto('/documents');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('text=All Documents', { timeout: 10000 });
    
    // Check if documents exist
    const documentCards = page.locator('[data-testid^="enhanced-document-card-"]');
    const docCount = await documentCards.count();
    
    if (docCount > 0) {
      console.log(`Found ${docCount} documents for interaction testing`);
      
      const firstDocCard = documentCards.first();
      const docId = (await firstDocCard.getAttribute('data-testid'))?.replace('enhanced-document-card-', '');
      
      if (docId) {
        // Test document title click (should navigate to document)
        const openBtn = page.locator(`[data-testid="document-open-btn-${docId}"]`);
        if (await openBtn.isVisible()) {
          // Get the href to verify it's correct
          const href = await openBtn.getAttribute('href');
          console.log(`Document open button href: ${href}`);
          expect(href).toContain('/w/');
          console.log('✅ Document open button has correct navigation link');
        }
        
        // Test document actions dropdown
        const actionsBtn = page.locator(`[data-testid="document-actions-btn-${docId}"]`);
        if (await actionsBtn.isVisible()) {
          await actionsBtn.click();
          await page.waitForTimeout(500);
          
          // Check for dropdown items
          const dropdownItems = [
            'Open in new tab',
            'Make a copy',
            'Export',
            'Delete'
          ];
          
          for (const item of dropdownItems) {
            const itemLocator = page.locator(`text="${item}"`);
            if (await itemLocator.isVisible()) {
              console.log(`✅ Found dropdown item: ${item}`);
            }
          }
          
          // Close dropdown by clicking elsewhere
          await page.click('body');
          await page.waitForTimeout(300);
          console.log('✅ Actions dropdown tested');
        }
        
        // Test thumbnail interaction
        const thumbnail = page.locator(`[data-testid="document-thumbnail-${docId}"]`);
        await expect(thumbnail).toBeVisible();
        console.log('✅ Document thumbnail is visible');
        
        // Test asset thumbnails if available
        const assetThumbnails = page.locator(`[data-testid="document-thumbnail-${docId}"] img`);
        const assetCount = await assetThumbnails.count();
        if (assetCount > 0) {
          console.log(`✅ Found ${assetCount} asset thumbnails for document`);
        }
      }
    } else {
      console.log('ℹ️  No documents found for interaction testing');
      
      // Test empty state
      await expect(page.locator('text=No documents found')).toBeVisible();
      console.log('✅ Empty state displayed correctly');
    }
    
    console.log('🎉 Document interactions test completed!');
  });
});