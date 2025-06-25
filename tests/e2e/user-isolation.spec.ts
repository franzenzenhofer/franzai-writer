import { test, expect } from '@playwright/test';

test.describe('User Isolation Tests (Chrome Only)', () => {
  test.skip(({ browserName }) => browserName !== 'chromium', 'Chrome only per CLAUDE.md guidelines');

  test('should ensure documents do not spill between users', async ({ page, browser }) => {
    console.log('🧪 Starting user isolation test...');
    
    // Create first user session
    await page.goto('/documents');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('text=All Documents', { timeout: 10000 });
    
    // Get initial document count for user 1
    const user1DocumentsText = await page.locator('text*="Showing"').textContent();
    const user1Count = extractDocumentCount(user1DocumentsText);
    console.log(`👤 User 1 has ${user1Count} documents`);
    
    // Get all document IDs for user 1
    const user1DocCards = page.locator('[data-testid^="enhanced-document-card-"]');
    const user1DocCount = await user1DocCards.count();
    const user1DocIds: string[] = [];
    
    for (let i = 0; i < user1DocCount; i++) {
      const card = user1DocCards.nth(i);
      const testId = await card.getAttribute('data-testid');
      if (testId) {
        const docId = testId.replace('enhanced-document-card-', '');
        user1DocIds.push(docId);
      }
    }
    
    console.log(`👤 User 1 document IDs: ${user1DocIds.join(', ')}`);
    
    // Also check assets page for user 1
    await page.goto('/assets');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('text=Asset Manager', { timeout: 10000 });
    
    const user1AssetsGrid = page.locator('[data-testid="assets-grid"]');
    const user1HasAssets = await user1AssetsGrid.isVisible();
    let user1AssetIds: string[] = [];
    
    if (user1HasAssets) {
      const user1AssetCards = page.locator('[data-testid^="asset-card-"]');
      const user1AssetCount = await user1AssetCards.count();
      
      for (let i = 0; i < user1AssetCount; i++) {
        const card = user1AssetCards.nth(i);
        const testId = await card.getAttribute('data-testid');
        if (testId) {
          const assetId = testId.replace('asset-card-', '');
          user1AssetIds.push(assetId);
        }
      }
    }
    
    console.log(`👤 User 1 asset IDs: ${user1AssetIds.join(', ')}`);
    
    // Create second user session (new context = different user)
    const context2 = await browser.newContext();
    const page2 = await context2.newPage();
    
    try {
      // Navigate to documents as user 2
      await page2.goto('/documents');
      await page2.waitForLoadState('networkidle');
      await page2.waitForSelector('text=All Documents', { timeout: 10000 });
      
      // Get document count for user 2
      const user2DocumentsText = await page2.locator('text*="Showing"').textContent();
      const user2Count = extractDocumentCount(user2DocumentsText);
      console.log(`👤 User 2 has ${user2Count} documents`);
      
      // Get all document IDs for user 2
      const user2DocCards = page2.locator('[data-testid^="enhanced-document-card-"]');
      const user2DocCount = await user2DocCards.count();
      const user2DocIds: string[] = [];
      
      for (let i = 0; i < user2DocCount; i++) {
        const card = user2DocCards.nth(i);
        const testId = await card.getAttribute('data-testid');
        if (testId) {
          const docId = testId.replace('enhanced-document-card-', '');
          user2DocIds.push(docId);
        }
      }
      
      console.log(`👤 User 2 document IDs: ${user2DocIds.join(', ')}`);
      
      // Also check assets page for user 2
      await page2.goto('/assets');
      await page2.waitForLoadState('networkidle');
      await page2.waitForSelector('text=Asset Manager', { timeout: 10000 });
      
      const user2AssetsGrid = page2.locator('[data-testid="assets-grid"]');
      const user2HasAssets = await user2AssetsGrid.isVisible();
      let user2AssetIds: string[] = [];
      
      if (user2HasAssets) {
        const user2AssetCards = page2.locator('[data-testid^="asset-card-"]');
        const user2AssetCount = await user2AssetCards.count();
        
        for (let i = 0; i < user2AssetCount; i++) {
          const card = user2AssetCards.nth(i);
          const testId = await card.getAttribute('data-testid');
          if (testId) {
            const assetId = testId.replace('asset-card-', '');
            user2AssetIds.push(assetId);
          }
        }
      }
      
      console.log(`👤 User 2 asset IDs: ${user2AssetIds.join(', ')}`);
      
      // CRITICAL TEST: Verify no document overlap between users
      const documentOverlap = user1DocIds.filter(id => user2DocIds.includes(id));
      if (documentOverlap.length > 0) {
        console.error(`❌ DOCUMENT ISOLATION FAILURE: Found overlapping documents: ${documentOverlap.join(', ')}`);
        throw new Error(`Document isolation failed! Users share documents: ${documentOverlap.join(', ')}`);
      } else {
        console.log('✅ DOCUMENT ISOLATION VERIFIED: No document overlap between users');
      }
      
      // CRITICAL TEST: Verify no asset overlap between users
      const assetOverlap = user1AssetIds.filter(id => user2AssetIds.includes(id));
      if (assetOverlap.length > 0) {
        console.error(`❌ ASSET ISOLATION FAILURE: Found overlapping assets: ${assetOverlap.join(', ')}`);
        throw new Error(`Asset isolation failed! Users share assets: ${assetOverlap.join(', ')}`);
      } else {
        console.log('✅ ASSET ISOLATION VERIFIED: No asset overlap between users');
      }
      
      // Additional verification: Check that user-specific content is not visible
      // If user 1 has documents, user 2 should not see them in their lists
      if (user1DocIds.length > 0) {
        for (const docId of user1DocIds) {
          const user1DocInUser2 = page2.locator(`[data-testid="enhanced-document-card-${docId}"]`);
          const isVisible = await user1DocInUser2.isVisible();
          if (isVisible) {
            throw new Error(`ISOLATION BREACH: User 2 can see User 1's document ${docId}`);
          }
        }
        console.log('✅ User 1 documents are not visible to User 2');
      }
      
      if (user1AssetIds.length > 0) {
        for (const assetId of user1AssetIds) {
          const user1AssetInUser2 = page2.locator(`[data-testid="asset-card-${assetId}"]`);
          const isVisible = await user1AssetInUser2.isVisible();
          if (isVisible) {
            throw new Error(`ISOLATION BREACH: User 2 can see User 1's asset ${assetId}`);
          }
        }
        console.log('✅ User 1 assets are not visible to User 2');
      }
      
      console.log('🎉 USER ISOLATION TEST PASSED: All data is properly isolated between users');
      
    } finally {
      await context2.close();
    }
  });

  test('should maintain session continuity within same user', async ({ page }) => {
    console.log('🧪 Testing session continuity for single user...');
    
    // Navigate to documents
    await page.goto('/documents');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('text=All Documents', { timeout: 10000 });
    
    // Get initial document list
    const initialDocCards = page.locator('[data-testid^="enhanced-document-card-"]');
    const initialCount = await initialDocCards.count();
    const initialDocIds: string[] = [];
    
    for (let i = 0; i < initialCount; i++) {
      const card = initialDocCards.nth(i);
      const testId = await card.getAttribute('data-testid');
      if (testId) {
        const docId = testId.replace('enhanced-document-card-', '');
        initialDocIds.push(docId);
      }
    }
    
    console.log(`📋 Initial documents: ${initialDocIds.length} found`);
    
    // Navigate to assets page
    await page.goto('/assets');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('text=Asset Manager', { timeout: 10000 });
    
    // Get asset list
    const assetsGrid = page.locator('[data-testid="assets-grid"]');
    const hasAssets = await assetsGrid.isVisible();
    let assetCount = 0;
    
    if (hasAssets) {
      const assetCards = page.locator('[data-testid^="asset-card-"]');
      assetCount = await assetCards.count();
    }
    
    console.log(`🖼️ Assets found: ${assetCount}`);
    
    // Navigate back to documents
    await page.goto('/documents');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('text=All Documents', { timeout: 10000 });
    
    // Verify same documents are still there
    const returnDocCards = page.locator('[data-testid^="enhanced-document-card-"]');
    const returnCount = await returnDocCards.count();
    
    expect(returnCount).toBe(initialCount);
    console.log('✅ Same number of documents after navigation');
    
    // Verify same document IDs
    const returnDocIds: string[] = [];
    for (let i = 0; i < returnCount; i++) {
      const card = returnDocCards.nth(i);
      const testId = await card.getAttribute('data-testid');
      if (testId) {
        const docId = testId.replace('enhanced-document-card-', '');
        returnDocIds.push(docId);
      }
    }
    
    // Check if all initial documents are still present
    const missingDocs = initialDocIds.filter(id => !returnDocIds.includes(id));
    const newDocs = returnDocIds.filter(id => !initialDocIds.includes(id));
    
    expect(missingDocs.length).toBe(0);
    console.log('✅ No documents lost during navigation');
    
    if (newDocs.length > 0) {
      console.log(`📋 New documents found: ${newDocs.length} (this is normal)`);
    }
    
    console.log('🎉 Session continuity test passed!');
  });
});

function extractDocumentCount(text: string | null): number {
  if (!text) return 0;
  const match = text.match(/Showing (\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}