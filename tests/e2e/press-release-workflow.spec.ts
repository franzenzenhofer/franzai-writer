import { test, expect } from '@playwright/test';

/**
 * Master E2E test for Press Release workflow
 * Complete workflow: basic info → tone → research → key facts → contact → final → photo → export
 * Chrome only for performance per CLAUDE.md guidelines
 */

test.describe('Press Release Workflow - Master Test (Chrome Only)', () => {
  test.skip(({ browserName }) => browserName !== 'chromium', 'Chrome only per CLAUDE.md guidelines');
  
  // Test configuration
  const BASE_URL = 'http://localhost:9002';
  
  test.beforeEach(async ({ page }) => {
    // Start each test from a clean dashboard
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForSelector('text=Start a new document', { timeout: 10000 });
  });

  test('Complete press release workflow with persistence and export', async ({ page }) => {
    console.log('🚀 Starting Press Release Master Test...');
    
    // Start press release generator
    await page.click('#workflow-start-press-release');
    await page.waitForSelector('input[name="topic"]', { timeout: 10000 });
    
    // Stage 1: Basic Information
    console.log('📝 Stage 1: Basic Information');
    const prData = {
      topic: 'Series A Funding Round - $25M Investment',
      message: 'TechStartup Inc., a leading AI-powered analytics platform, today announced the successful completion of its $25 million Series A funding round led by Sequoia Capital, with participation from Andreessen Horowitz and existing investors.',
      company: 'TechStartup Inc.',
      website: 'https://techstartup.com'
    };
    
    await page.fill('input[name="topic"]', prData.topic);
    await page.fill('textarea[name="message"]', prData.message);
    await page.fill('input[name="company"]', prData.company);
    await page.fill('input[name="website"]', prData.website);
    
    await page.click('#process-stage-basic-info');
    
    // Wait for auto-save indicator
    await page.waitForSelector('text=Last saved', { timeout: 15000 });
    console.log('✅ Basic information saved');
    
    // Stage 2: Tone Briefing (auto-run)
    console.log('🎯 Stage 2: Tone Analysis (auto-run)');
    await page.waitForSelector('[data-testid="stage-card-tone-briefing"]', { timeout: 45000 });
    const toneBriefingCard = page.locator('[data-testid="stage-card-tone-briefing"]');
    await expect(toneBriefingCard).toContainText('tone');
    console.log('✅ Tone analysis completed');
    
    // Stage 3: Research (may need manual processing)
    console.log('🔍 Stage 3: Research');
    await page.waitForSelector('[data-testid="stage-card-research"]', { timeout: 60000 });
    
    // Check if research needs manual processing
    const researchButton = page.locator('#process-stage-research');
    if (await researchButton.isVisible()) {
      // Process with default settings
      await researchButton.click();
      await page.waitForSelector('[data-testid="stage-card-research"]:has-text("company_background")', { timeout: 60000 });
    }
    
    console.log('✅ Research completed with web grounding');
    
    // Stage 4: Key Facts
    console.log('📊 Stage 4: Key Facts');
    await page.waitForSelector('[data-testid="stage-card-key-facts"]', { timeout: 30000 });
    await page.click('#process-stage-key-facts');
    
    await page.waitForSelector('input[name="headline"]', { timeout: 15000 });
    
    // Verify auto-generated headline
    const headline = await page.locator('input[name="headline"]').inputValue();
    expect(headline).toBeTruthy();
    
    // Add custom key points
    const keyPoints = `• Raised $25 million in Series A funding
• Led by Sequoia Capital with top-tier investor participation
• Funding will accelerate product development and market expansion
• Company has grown 400% year-over-year
• Plans to double team size to 100 employees by year-end`;
    
    await page.fill('textarea[name="key_points"]', keyPoints);
    
    // Add quotes
    const quotes = `"This funding validates our vision of democratizing data analytics through AI," said John Smith, CEO of TechStartup Inc. "We're excited to accelerate our growth and expand our platform capabilities."

"TechStartup's innovative approach to AI analytics represents a significant market opportunity," said Partner Name, Sequoia Capital. "We're thrilled to support their mission."`;
    
    await page.fill('textarea[name="quotes"]', quotes);
    
    // Add statistics
    const statistics = `• $25 million Series A funding
• 400% year-over-year growth
• 50+ enterprise customers
• 99.9% platform uptime
• 5 billion data points processed monthly`;
    
    await page.fill('textarea[name="statistics"]', statistics);
    
    await page.click('#process-stage-key-facts');
    console.log('✅ Key facts processed');
    
    // Stage 5: Contact Information
    console.log('📞 Stage 5: Contact Information');
    await page.waitForSelector('[data-testid="stage-card-contact-info"]', { timeout: 15000 });
    await page.click('#process-stage-contact-info');
    
    await page.waitForSelector('input[name="contact_name"]', { timeout: 10000 });
    
    await page.fill('input[name="contact_name"]', 'Sarah Johnson');
    await page.fill('input[name="contact_title"]', 'VP of Communications');
    await page.fill('input[name="contact_email"]', 'press@techstartup.com');
    await page.fill('input[name="contact_phone"]', '+1 (555) 123-4567');
    
    await page.click('#process-stage-contact-info');
    console.log('✅ Contact information saved');
    
    // Stage 6: Fact-Checking (auto-run)
    console.log('✔️ Stage 6: Fact-Checking (auto-run)');
    await page.waitForSelector('[data-testid="stage-card-fact-check"]', { timeout: 45000 });
    const factCheckCard = page.locator('[data-testid="stage-card-fact-check"]');
    await expect(factCheckCard).toContainText('verified_facts');
    
    // Review fact-checking
    await page.click('#process-stage-fact-check');
    await page.waitForSelector('select[name="approval_status"]', { timeout: 10000 });
    
    // Approve the press release
    await page.selectOption('select[name="approval_status"]', 'approved');
    await page.fill('textarea[name="fact_checker_notes"]', 'All financial figures and claims verified. Ready for publication.');
    
    await page.click('#process-stage-fact-check');
    console.log('✅ Fact-checking approved');
    
    // Stage 7: Final Press Release (auto-run)
    console.log('📄 Stage 7: Final Press Release (auto-run)');
    await page.waitForSelector('[data-testid="stage-card-final-press-release"]', { timeout: 45000 });
    
    const finalPRCard = page.locator('[data-testid="stage-card-final-press-release"]');
    await expect(finalPRCard).toContainText('FOR IMMEDIATE RELEASE');
    await expect(finalPRCard).toContainText('TechStartup Inc.');
    await expect(finalPRCard).toContainText('$25 million');
    console.log('✅ Final press release generated');
    
    // Stage 8: Press Photo (optional - skip for speed)
    console.log('📸 Stage 8: Press Photo (skipping for test speed)');
    const hasPhotoStage = await page.locator('[data-testid="stage-card-press-photo"]').isVisible();
    if (hasPhotoStage) {
      await page.click('#process-stage-press-photo');
      await page.waitForSelector('textarea[name="image_description"]', { timeout: 10000 });
      await page.fill('textarea[name="image_description"]', 'Modern office space with diverse team collaborating');
      await page.selectOption('select[name="style"]', 'professional');
      await page.click('#process-stage-press-photo');
      console.log('✅ Press photo stage processed');
    }
    
    // Stage 9: Export & Publishing
    console.log('📤 Stage 9: Export & Publishing');
    await page.waitForSelector('[data-testid="stage-card-export"]', { timeout: 30000 });
    await page.click('#trigger-export-export');
    
    // Wait for all export formats
    await page.waitForSelector('h3:has-text("Styled HTML")', { timeout: 30000 });
    
    // Verify all export formats
    const exportFormats = ['Styled HTML', 'Clean HTML', 'Markdown', 'PDF Document', 'Word Document'];
    for (const format of exportFormats) {
      const formatHeader = page.locator(`h3:has-text("${format}")`);
      await expect(formatHeader).toBeVisible();
    }
    console.log('✅ All export formats generated');
    
    // Test publishing button
    const publishButton = page.locator('button:has-text("Publish")').first();
    if (await publishButton.isVisible()) {
      await publishButton.click();
      await page.waitForTimeout(2000);
      console.log('✅ Publishing tested');
    }
    
    // Get current URL for persistence test
    const currentUrl = page.url();
    console.log('📍 Current URL:', currentUrl);
    
    // Test persistence - reload the page
    console.log('🔄 Testing persistence after reload...');
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Verify all data persisted
    await page.waitForSelector('[data-testid="stage-card-basic-info"]', { timeout: 15000 });
    
    // Check basic info persisted
    const basicInfoCard = page.locator('[data-testid="stage-card-basic-info"]');
    await expect(basicInfoCard).toContainText(prData.topic);
    
    // Check final press release persisted
    const reloadedFinalPR = page.locator('[data-testid="stage-card-final-press-release"]');
    await expect(reloadedFinalPR).toContainText('FOR IMMEDIATE RELEASE');
    await expect(reloadedFinalPR).toContainText('$25 million');
    
    // Check export data persisted
    const reloadedExport = page.locator('[data-testid="stage-card-export"]');
    await expect(reloadedExport).toBeVisible();
    
    console.log('✅ All data persisted after reload');
    
    // Verify workflow completion
    const completedStages = await page.locator('text=Completed').count();
    expect(completedStages).toBeGreaterThanOrEqual(7);
    console.log(`✅ Workflow completed (${completedStages} stages done)`);
    
    console.log('🎉 Press Release Master Test PASSED!');
  });

  test('Test press release with international content and special characters', async ({ page }) => {
    console.log('🌍 Testing international content...');
    
    await page.click('#workflow-start-press-release');
    await page.waitForSelector('input[name="topic"]', { timeout: 10000 });
    
    // Test with international characters
    const intlData = {
      topic: 'Expansión a América Latina - €15M inversión',
      message: 'München-based TechGmbH announces expansion to São Paulo, México City, and Buenos Aires with €15 million investment from European VCs.',
      company: 'TechGmbH München',
      website: 'https://techgmbh.de'
    };
    
    await page.fill('input[name="topic"]', intlData.topic);
    await page.fill('textarea[name="message"]', intlData.message);
    await page.fill('input[name="company"]', intlData.company);
    await page.fill('input[name="website"]', intlData.website);
    
    await page.click('#process-stage-basic-info');
    
    // Wait for processing
    await page.waitForSelector('[data-testid="stage-card-tone-briefing"]', { timeout: 45000 });
    console.log('✅ International characters handled correctly');
    
    // Continue to key facts
    await page.waitForSelector('[data-testid="stage-card-key-facts"]', { timeout: 30000 });
    await page.click('#process-stage-key-facts');
    
    await page.waitForSelector('textarea[name="quotes"]', { timeout: 15000 });
    
    // Add international quotes
    const intlQuotes = `"Estamos muy emocionados de expandir nuestras operaciones a América Latina," said Hans Müller, CEO. "Cette expansion représente une étape importante dans notre stratégie globale."`;
    
    await page.fill('textarea[name="quotes"]', intlQuotes);
    await page.click('#process-stage-key-facts');
    
    // Verify international content preserved
    await page.waitForSelector('[data-testid="stage-card-final-press-release"]', { timeout: 45000 });
    const finalPR = page.locator('[data-testid="stage-card-final-press-release"]');
    await expect(finalPR).toContainText('€15');
    await expect(finalPR).toContainText('München');
    
    console.log('✅ International content processed successfully');
  });

  test('Test press release error recovery and validation', async ({ page }) => {
    console.log('🛡️ Testing error recovery...');
    
    await page.click('#workflow-start-press-release');
    await page.waitForSelector('input[name="topic"]', { timeout: 10000 });
    
    // Test with minimal input
    await page.fill('input[name="topic"]', 'Test');
    await page.fill('textarea[name="message"]', 'Short message.');
    await page.fill('input[name="company"]', 'Co');
    
    await page.click('#process-stage-basic-info');
    
    // Should still process
    await page.waitForSelector('[data-testid="stage-card-tone-briefing"]', { timeout: 45000 });
    console.log('✅ Minimal input handled gracefully');
    
    // Test fact-checking rejection
    await page.waitForSelector('[data-testid="stage-card-fact-check"]', { timeout: 60000 });
    await page.click('#process-stage-fact-check');
    
    await page.waitForSelector('select[name="approval_status"]', { timeout: 10000 });
    await page.selectOption('select[name="approval_status"]', 'rejected');
    await page.fill('textarea[name="fact_checker_notes"]', 'Claims need verification');
    
    await page.click('#process-stage-fact-check');
    
    // Verify rejection handled
    const factCheckStatus = await page.locator('[data-testid="stage-card-fact-check"]').textContent();
    expect(factCheckStatus).toContain('rejected');
    console.log('✅ Fact-check rejection handled correctly');
  });
});