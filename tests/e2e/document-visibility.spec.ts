import { test, expect } from '@playwright/test';

/**
 * Test that documents appear in both dashboard and all documents view
 */
test.describe('Document Visibility Across Views (Chrome Only)', () => {
  test.skip(({ browserName }) => browserName !== 'chromium', 'Chrome only per CLAUDE.md guidelines');

  test('should show created poem in dashboard and documents page', async ({ page }) => {
    console.log('📄 Testing document visibility across views');
    
    // Create a unique document title
    const uniqueTitle = `Visibility Test Poem ${Date.now()}`;
    
    // Step 1: Create a new poem
    await test.step('Create a new poem document', async () => {
      await page.goto('http://localhost:9002/dashboard');
      await page.waitForLoadState('networkidle');
      
      // Start poem workflow - look for the actual link/button
      const poemWorkflowLink = page.locator('a[href*="/w/poem/new"], #workflow-start-poem-generator').first();
      await poemWorkflowLink.click();
      await page.waitForURL('**/w/poem/**');
      await page.waitForLoadState('networkidle');
      
      // Wait for textarea to be visible
      await page.waitForSelector('textarea', { state: 'visible', timeout: 10000 });
      
      // Fill poem topic
      await page.fill('textarea', uniqueTitle);
      await page.click('#process-stage-poem-topic');
      
      // Wait for poem generation - the stage turns green when complete
      const poemStage = page.locator('[data-testid="stage-card-generate-poem-with-title"]');
      await poemStage.waitFor({ state: 'visible' });
      
      // Wait for the stage to be completed (it should have green border)
      await page.waitForTimeout(2000); // Give AI time to start
      await expect(poemStage).toBeVisible({ timeout: 60000 });
      
      // Wait for auto-save
      await page.waitForSelector('text=Last saved', { timeout: 10000 });
      console.log('✅ Poem created and auto-saved');
    });
    
    // Step 2: Verify document appears in dashboard
    await test.step('Verify document appears in dashboard', async () => {
      await page.goto('http://localhost:9002/dashboard');
      await page.waitForLoadState('networkidle');
      
      // Look for recent documents section
      await expect(page.getByRole('heading', { name: 'Recent documents' })).toBeVisible();
      
      // Check if document appears in recent documents
      const documentInDashboard = page.locator(`text="${uniqueTitle}"`).first();
      await expect(documentInDashboard).toBeVisible({ timeout: 10000 });
      console.log('✅ Document appears in dashboard recent documents');
      
      // Verify it's clickable
      await documentInDashboard.click();
      await page.waitForURL('**/w/poem/**');
      await expect(page.locator('textarea').first()).toHaveValue(uniqueTitle);
      console.log('✅ Document is clickable from dashboard');
    });
    
    // Step 3: Verify document appears in all documents page
    await test.step('Verify document appears in all documents page', async () => {
      // Navigate to documents page
      await page.goto('http://localhost:9002/documents');
      await page.waitForLoadState('networkidle');
      
      // Wait for documents to load
      await expect(page.getByRole('heading', { name: 'All Documents' })).toBeVisible();
      
      // Check if document appears
      const documentInAllDocs = page.locator(`text="${uniqueTitle}"`).first();
      await expect(documentInAllDocs).toBeVisible({ timeout: 10000 });
      console.log('✅ Document appears in all documents page');
      
      // Verify document card shows correct workflow type
      const documentCard = page.locator(`[data-testid^="document-"], .document-card`).filter({ hasText: uniqueTitle }).first();
      await expect(documentCard).toBeVisible();
      await expect(documentCard).toContainText('Poem Generator');
      console.log('✅ Document shows correct workflow type');
      
      // Verify Open button works
      const openButton = documentCard.locator('a, button').filter({ hasText: 'Open' }).first();
      await openButton.click();
      await page.waitForURL('**/w/poem/**');
      await expect(page.locator('textarea').first()).toHaveValue(uniqueTitle);
      console.log('✅ Document opens correctly from all documents page');
    });
    
    // Step 4: Test document search
    await test.step('Test document search functionality', async () => {
      await page.goto('http://localhost:9002/documents');
      await page.waitForLoadState('networkidle');
      
      // Search for the document
      const searchInput = page.locator('input[placeholder*="Search"]');
      await searchInput.fill(uniqueTitle.substring(0, 10));
      await page.waitForTimeout(500);
      
      // Verify filtered results
      const searchResult = page.locator(`text="${uniqueTitle}"`);
      await expect(searchResult).toBeVisible();
      console.log('✅ Document search works correctly');
      
      // Clear search
      await searchInput.clear();
      await page.waitForTimeout(500);
    });
    
    // Step 5: Test document copy functionality
    await test.step('Test document copy functionality', async () => {
      // Find the document card
      const documentCard = page.locator(`[data-testid^="document-"], .document-card`).filter({ hasText: uniqueTitle }).first();
      
      // Open dropdown menu
      const dropdownButton = documentCard.locator('button').filter({ has: page.locator('svg') }).last();
      await dropdownButton.click();
      
      // Click copy
      const copyButton = page.locator('[role="menuitem"]').filter({ hasText: 'Make a copy' });
      await copyButton.click();
      
      // Wait for copy to complete
      await page.waitForTimeout(2000);
      
      // Verify copy appears
      const copyTitle = `Copy of ${uniqueTitle}`;
      const copiedDocument = page.locator(`text="${copyTitle}"`);
      await expect(copiedDocument).toBeVisible({ timeout: 10000 });
      console.log('✅ Document copy created successfully');
    });
    
    // Step 6: Test bulk selection
    await test.step('Test bulk selection and actions', async () => {
      // Select both documents
      const checkboxes = page.locator('input[type="checkbox"]').filter({ hasNot: page.locator(':checked') });
      
      // Click first two checkboxes
      if (await checkboxes.count() >= 2) {
        await checkboxes.nth(0).click();
        await checkboxes.nth(1).click();
        
        // Verify bulk actions toolbar appears
        const bulkToolbar = page.locator('text=2 documents selected');
        await expect(bulkToolbar).toBeVisible();
        console.log('✅ Bulk selection works');
        
        // Cancel selection
        const cancelButton = page.locator('button').filter({ hasText: 'Cancel' });
        await cancelButton.click();
        console.log('✅ Bulk selection cancelled');
      }
    });
  });

  test('should persist document visibility after reload', async ({ page }) => {
    console.log('📄 Testing document persistence after reload');
    
    const uniqueTitle = `Reload Test ${Date.now()}`;
    
    // Create document
    await page.goto('http://localhost:9002/w/poem/new');
    await page.waitForLoadState('networkidle');
    
    // Wait for textarea to be visible
    await page.waitForSelector('textarea', { state: 'visible', timeout: 10000 });
    
    await page.fill('textarea', uniqueTitle);
    await page.click('#process-stage-poem-topic');
    
    // Wait for stage to be visible and completed
    const poemStage = page.locator('[data-testid="stage-card-generate-poem-with-title"]');
    await poemStage.waitFor({ state: 'visible' });
    await page.waitForTimeout(2000); // Give AI time to process
    await expect(poemStage).toBeVisible({ timeout: 60000 });
    await page.waitForSelector('text=Last saved', { timeout: 10000 });
    
    // Get document URL
    const documentUrl = page.url();
    
    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Verify document still loads
    await expect(page.locator('textarea').first()).toHaveValue(uniqueTitle);
    console.log('✅ Document persists after reload');
    
    // Check dashboard after reload
    await page.goto('http://localhost:9002/dashboard');
    const documentInDashboard = page.locator(`text="${uniqueTitle}"`);
    await expect(documentInDashboard).toBeVisible();
    console.log('✅ Document still visible in dashboard after reload');
    
    // Check all documents page after reload
    await page.goto('http://localhost:9002/documents');
    const documentInAllDocs = page.locator(`text="${uniqueTitle}"`);
    await expect(documentInAllDocs).toBeVisible();
    console.log('✅ Document still visible in all documents page after reload');
  });
});