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
    let generatedTitle = '';
    
    // Step 1: Create a new poem
    await test.step('Create a new poem document', async () => {
      await page.goto('http://localhost:9002/dashboard');
      await page.waitForSelector('text=Start a new document', { timeout: 10000 });
      
      // Start poem workflow - use the same selector as working test
      await page.click('#workflow-start-poem-generator');
      await page.waitForSelector('textarea', { timeout: 10000 });
      
      // Fill poem topic
      await page.fill('textarea', uniqueTitle);
      await page.click('#process-stage-poem-topic');
      
      // Wait for poem generation using the same pattern as working test
      await page.waitForSelector('text=Poem Title', { timeout: 30000 });
      await page.waitForSelector('text=Poem Content', { timeout: 5000 });
      console.log('✅ Poem generated successfully');
      
      // Wait for auto-save
      await page.waitForSelector('text=Last saved', { timeout: 10000 });
      console.log('✅ Poem created and auto-saved');
      
      // Get the actual title that was generated
      // Let's wait a bit for the title to update in the document
      await page.waitForTimeout(3000); // Give time for title update
      
      // Get the page title which should have been updated with the generated title
      generatedTitle = await page.title();
      // Remove the " - Franz AI Writer" suffix
      generatedTitle = generatedTitle.replace(' - Franz AI Writer', '');
      
      console.log(`📝 Generated poem title: "${generatedTitle.trim()}"`);
      
      // Also check what the page title shows
      const pageTitle = await page.title();
      console.log(`📄 Page title: "${pageTitle}"`);
    });
    
    // Step 2: Verify document appears in dashboard
    await test.step('Verify document appears in dashboard', async () => {
      // Wait a bit more to ensure document is saved
      await page.waitForTimeout(5000);
      
      await page.goto('http://localhost:9002/dashboard');
      await page.waitForSelector('text=Recent documents', { timeout: 10000 });
      
      // Look for the generated title in the dashboard
      // The title update is working, so we should see it
      const documentRow = page.locator('table').nth(1).locator('tbody tr').filter({ hasText: generatedTitle.trim() }).first();
      await expect(documentRow).toBeVisible({ timeout: 10000 });
      console.log('✅ Document with correct title appears in dashboard');
      
      // Click the Continue link to open the document
      const continueLink = documentRow.locator('a:has-text("Continue")');
      await continueLink.click();
      await page.waitForURL('**/w/poem/**');
      
      // Verify we're on the correct document
      await page.waitForSelector('text=Poem Topic', { timeout: 10000 });
      const poemTopicText = page.locator('[data-testid="stage-card-poem-topic"]').locator('p').first();
      await expect(poemTopicText).toContainText(uniqueTitle);
      console.log('✅ Document opens correctly from dashboard');
    });
    
    // Step 3: Verify document appears in all documents page
    await test.step('Verify document appears in all documents page', async () => {
      // Navigate to documents page via the navigation menu
      // First go to dashboard to ensure session is established
      await page.goto('http://localhost:9002/dashboard');
      await page.waitForSelector('text=Recent documents', { timeout: 10000 });
      
      // Click on Documents link in navigation
      const documentsLink = page.locator('nav a[href="/documents"], a[href="/documents"]').first();
      await documentsLink.click();
      
      // Wait for navigation and page load
      await page.waitForURL('**/documents');
      await page.waitForLoadState('domcontentloaded');
      
      // Wait for the documents page to load
      await page.waitForSelector('h1:has-text("All Documents")', { timeout: 15000 });
      
      // Wait for documents to load (look for the document count text)
      await page.waitForSelector('text=documents', { timeout: 10000 });
      
      // Debug: log what we see on the page
      const pageContent = await page.textContent('body');
      console.log('Documents page loaded, looking for:', generatedTitle.trim());
      
      // Look for our document by its generated title
      // The documents page doesn't use data-testid, so let's find by text
      const documentText = page.locator(`text="${generatedTitle.trim()}"`).first();
      await expect(documentText).toBeVisible({ timeout: 10000 });
      console.log('✅ Document with correct title appears in all documents page');
      
      // Find the first document card that contains our title
      // Use a more specific selector based on the card structure
      const documentCards = page.locator('.group').filter({ hasText: generatedTitle.trim() });
      const firstCard = documentCards.first();
      
      // Click the Open button/link within this specific card
      await firstCard.locator('text=Open').click();
      await page.waitForURL('**/w/poem/**');
      
      // Wait for the page to load - look for the stage card
      await page.waitForSelector('[data-testid="stage-card-poem-topic"]', { timeout: 10000 });
      
      // Verify we're viewing the correct document by checking the poem topic content
      const poemTopicContent = await page.textContent('[data-testid="stage-card-poem-topic"]');
      expect(poemTopicContent).toContain(uniqueTitle);
      console.log('✅ Document opens correctly from all documents page');
    });
    
  });

  test('should persist document visibility after reload', async ({ page }) => {
    console.log('📄 Testing document persistence after reload');
    
    const uniqueTitle = `Reload Test ${Date.now()}`;
    let generatedTitle = '';
    
    // Create document
    await page.goto('http://localhost:9002/dashboard');
    await page.waitForSelector('text=Start a new document', { timeout: 10000 });
    
    // Start poem workflow
    await page.click('#workflow-start-poem-generator');
    await page.waitForSelector('textarea', { timeout: 10000 });
    
    await page.fill('textarea', uniqueTitle);
    await page.click('#process-stage-poem-topic');
    
    // Wait for poem generation
    await page.waitForSelector('text=Poem Title', { timeout: 30000 });
    await page.waitForSelector('text=Poem Content', { timeout: 5000 });
    
    // Get the generated title from the page title
    await page.waitForTimeout(3000); // Give time for title update
    generatedTitle = await page.title();
    // Remove the " - Franz AI Writer" suffix
    generatedTitle = generatedTitle.replace(' - Franz AI Writer', '');
    console.log(`📝 Generated poem title: "${generatedTitle.trim()}"`);
    
    await page.waitForSelector('text=Last saved', { timeout: 10000 });
    
    // Get document URL
    const documentUrl = page.url();
    
    // Reload page
    await page.reload();
    await page.waitForSelector('textarea', { timeout: 10000 });
    
    // Verify document still loads - check the poem topic text in the first stage
    await page.waitForSelector('text=Poem Topic', { timeout: 10000 });
    const poemTopicText = page.locator('[data-testid="stage-card-poem-topic"]').locator('p').first();
    await expect(poemTopicText).toContainText(uniqueTitle);
    console.log('✅ Document persists after reload');
    
    // Check dashboard after reload
    await page.goto('http://localhost:9002/dashboard');
    await page.waitForSelector('text=Recent documents', { timeout: 10000 });
    
    // The document should be visible with its generated title
    const documentInDashboard = page.locator(`text="${generatedTitle.trim()}"`).first();
    await expect(documentInDashboard).toBeVisible({ timeout: 10000 });
    console.log('✅ Document still visible in dashboard after reload');
    
    // Check all documents page after reload
    await page.goto('http://localhost:9002/documents');
    await page.waitForSelector('text=All Documents', { timeout: 10000 });
    
    // Verify our document with its title
    const documentInAllDocs = page.locator(`text="${generatedTitle.trim()}"`).first();
    await expect(documentInAllDocs).toBeVisible({ timeout: 10000 });
    console.log('✅ Document still visible in all documents page after reload');
  });
});