import { test, expect } from '@playwright/test';

test.describe('Recent Documents Display', () => {
  test('created documents should appear in recent documents list', async ({ page, context }) => {
    // Go to the poem workflow
    await page.goto('/w/poem/new');
    await page.waitForLoadState('networkidle');
    
    // Fill poem topic
    console.log('Filling poem topic...');
    await page.waitForSelector('#poem-topic textarea', { timeout: 10000 });
    await page.fill('#poem-topic textarea', 'A beautiful sunset over the ocean');
    
    // Complete the poem topic stage
    await page.click('#poem-topic button:has-text("Continue")');
    
    // Wait for poem generation
    console.log('Waiting for poem generation...');
    await page.waitForSelector('[data-testid="stage-card-generate-poem-with-title"] .text-green-600', { timeout: 30000 });
    
    // Get the generated poem title for verification
    const poemTitleElement = await page.locator('#generate-poem-with-title .bg-muted\\/50 .font-medium').first();
    const poemTitle = await poemTitleElement.textContent();
    console.log('Generated poem title:', poemTitle);
    
    // Go to dashboard
    console.log('Navigating to dashboard...');
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Wait for documents to load
    await page.waitForTimeout(3000);
    
    // Check if the created document appears in recent documents
    const recentDocumentsSection = page.locator('h2:has-text("Recent documents")').locator('..');
    
    // Look for the document in the table
    const documentRows = recentDocumentsSection.locator('tbody tr');
    const documentCount = await documentRows.count();
    
    console.log(`Found ${documentCount} documents in recent list`);
    
    if (documentCount > 0) {
      // Check if our poem appears in the list
      let foundOurDocument = false;
      
      for (let i = 0; i < documentCount; i++) {
        const row = documentRows.nth(i);
        const titleCell = row.locator('td').first();
        const title = await titleCell.textContent();
        
        console.log(`Document ${i + 1}: ${title}`);
        
        if (title && (title.includes(poemTitle || '') || title.includes('Poem Generator'))) {
          foundOurDocument = true;
          console.log('✅ Found our created document in recent list!');
          break;
        }
      }
      
      if (foundOurDocument) {
        console.log('✅ PASS: Created document appears in recent documents');
      } else {
        console.log('❌ FAIL: Created document not found in recent documents');
        
        // Take screenshot for debugging
        await page.screenshot({ path: './test-results/recent-documents-fail.png', fullPage: true });
        
        // Log all documents for debugging
        for (let i = 0; i < documentCount; i++) {
          const row = documentRows.nth(i);
          const cells = row.locator('td');
          const cellCount = await cells.count();
          const rowData: string[] = [];
          
          for (let j = 0; j < cellCount; j++) {
            const cellText = await cells.nth(j).textContent();
            rowData.push(cellText || '');
          }
          
          console.log(`Row ${i + 1}:`, rowData);
        }
        
        throw new Error('Created document not found in recent documents list');
      }
    } else {
      console.log('❌ FAIL: No documents found in recent list');
      
      // Check if there's an error message or empty state
      const emptyState = await recentDocumentsSection.locator('text=No documents yet').count();
      const errorState = await recentDocumentsSection.locator('.text-destructive').count();
      
      if (emptyState > 0) {
        console.log('Empty state shown: "No documents yet"');
      }
      
      if (errorState > 0) {
        const errorText = await recentDocumentsSection.locator('.text-destructive').textContent();
        console.log('Error state shown:', errorText);
      }
      
      // Take screenshot for debugging
      await page.screenshot({ path: './test-results/recent-documents-empty.png', fullPage: true });
      
      throw new Error('No documents found in recent documents list');
    }
  });

  test('dashboard should handle missing user gracefully', async ({ page, context }) => {
    // Test the dashboard without creating any documents first
    // This tests the graceful degradation when no userId is available
    
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Wait for the page to load
    await page.waitForTimeout(3000);
    
    // The page should load without errors
    const recentDocumentsSection = page.locator('h2:has-text("Recent documents")');
    await expect(recentDocumentsSection).toBeVisible();
    
    // Should show either empty state or documents (graceful handling)
    const emptyState = page.locator('text=No documents yet');
    const documentTable = page.locator('table tbody tr');
    const loginPrompt = page.locator('text=Ready to Save Your Work?');
    
    // One of these should be visible (empty state, documents, or login prompt)
    const hasEmptyState = await emptyState.isVisible();
    const hasDocuments = await documentTable.count() > 0;
    const hasLoginPrompt = await loginPrompt.isVisible();
    
    console.log('Dashboard state:', {
      hasEmptyState,
      hasDocuments,
      hasLoginPrompt
    });
    
    if (!hasEmptyState && !hasDocuments && !hasLoginPrompt) {
      await page.screenshot({ path: './test-results/dashboard-error-state.png', fullPage: true });
      throw new Error('Dashboard not showing expected state (empty, documents, or login prompt)');
    }
    
    console.log('✅ PASS: Dashboard handles missing user gracefully');
  });
});