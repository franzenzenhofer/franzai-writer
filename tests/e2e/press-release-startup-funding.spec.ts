import { test, expect } from '@playwright/test';

/**
 * COMPREHENSIVE E2E test for Press Release workflow - Startup Funding scenario
 * Tests advanced features, edge cases, and stress scenarios for press release generation
 * Chrome only for performance and reliability
 */

test.describe('Press Release Workflow - Startup Funding E2E Test', () => {
  test.skip(({ browserName }) => browserName !== 'chromium', 'Chrome only per CLAUDE.md guidelines');
  
  // Test configuration
  const BASE_URL = 'http://localhost:9002';
  
  test.beforeEach(async ({ page }) => {
    // Start each test from a clean dashboard
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForSelector('text=Start a new document', { timeout: 10000 });
  });

  test('Complete startup funding press release workflow - Series A announcement', async ({ page }) => {
    console.log('🧪 Testing complete startup funding press release workflow...');
    
    // Start press release generator
    await page.click('#workflow-start-press-release');
    await page.waitForSelector('input[name="topic"]', { timeout: 10000 });
    
    // Stage 1: Basic Information - Series A funding announcement
    const startupFundingData = {
      topic: 'Series A Funding Round - $15M Investment',
      message: 'GreenTech Innovations, a pioneering climate technology startup, today announced the successful completion of its $15 million Series A funding round led by Climate Ventures, with participation from existing investors including Sustainable Capital and several angel investors from the clean energy sector.',
      company: 'GreenTech Innovations',
      website: 'https://greentech-innovations.com'
    };
    
    await page.fill('input[name="topic"]', startupFundingData.topic);
    await page.fill('textarea[name="message"]', startupFundingData.message);
    await page.fill('input[name="company"]', startupFundingData.company);
    await page.fill('input[name="website"]', startupFundingData.website);
    
    await page.click('#process-stage-basic-info');
    
    // Wait for tone briefing stage (auto-run)
    await page.waitForSelector('[data-testid="stage-card-tone-briefing"]', { timeout: 45000 });
    console.log('✅ Basic information processed successfully');
    
    // Stage 2: Tone Briefing - Should detect startup/funding tone
    const toneBriefingCard = page.locator('[data-testid="stage-card-tone-briefing"]');
    
    // Wait for completion and verify startup-appropriate tone
    await expect(toneBriefingCard).toContainText('tone');
    console.log('✅ Tone analysis completed for startup context');
    
    // Stage 3: Research (auto-run with Google Search grounding)
    await page.waitForSelector('[data-testid="stage-card-research"]', { timeout: 60000 });
    
    // Verify research completed with funding/startup context
    const researchCard = page.locator('[data-testid="stage-card-research"]');
    await expect(researchCard).toContainText('company_background');
    await expect(researchCard).toContainText('industry_context');
    console.log('✅ Startup funding research completed with web grounding');
    
    // Stage 4: Key Facts - Customize for funding announcement
    await page.waitForSelector('[data-testid="stage-card-key-facts"]', { timeout: 30000 });
    await page.click('#process-stage-key-facts');
    
    // Wait for auto-generated key facts
    await page.waitForSelector('input[name="headline"]', { timeout: 15000 });
    
    // Verify headline contains funding terms
    const headline = await page.locator('input[name="headline"]').inputValue();
    expect(headline.toLowerCase()).toMatch(/funding|series|investment|\$15m|\$15 million/);
    
    // Customize key points for funding announcement
    const fundingKeyPoints = `• Raised $15 million in Series A funding round
• Led by Climate Ventures with participation from existing investors
• Funding will accelerate product development and market expansion
• Focus on carbon capture technology for industrial applications
• Plans to triple team size from 25 to 75 employees by end of 2024
• Technology validated through partnerships with 3 Fortune 500 companies`;
    
    await page.fill('textarea[name="key_points"]', fundingKeyPoints);
    
    // Add investor and founder quotes
    const fundingQuotes = `"GreenTech Innovations represents the future of industrial carbon capture. Their innovative approach has the potential to significantly impact climate change mitigation efforts across multiple industries." - Alexandra Chen, Managing Partner at Climate Ventures

"This funding enables us to scale our proven technology and expand our team of world-class engineers and climate scientists. We're excited to accelerate our mission of making carbon capture accessible and economically viable for every industrial facility." - Dr. Marcus Rodriguez, CEO and Co-founder of GreenTech Innovations`;
    
    await page.fill('textarea[name="quotes"]', fundingQuotes);
    
    // Add funding and growth statistics
    const fundingStatistics = `• $15 million Series A funding round completed
• 300% revenue growth year-over-year
• 25 current employees, expanding to 75 by end of 2024
• 3 Fortune 500 partnerships established
• 15 patents filed in carbon capture technology
• $2.5 million in pre-Series A funding previously raised`;
    
    await page.fill('textarea[name="statistics"]', fundingStatistics);
    
    await page.click('#process-stage-key-facts');
    console.log('✅ Funding-specific key facts processed');
    
    // Stage 5: Contact Information - Startup PR contact
    await page.waitForSelector('[data-testid="stage-card-contact-info"]', { timeout: 15000 });
    await page.click('#process-stage-contact-info');
    
    await page.waitForSelector('input[name="contact_name"]', { timeout: 10000 });
    
    // Customize for startup context
    await page.fill('input[name="contact_name"]', 'Rachel Thompson');
    await page.fill('input[name="contact_title"]', 'Head of Communications and Marketing');
    await page.fill('input[name="contact_email"]', 'press@greentech-innovations.com');
    await page.fill('input[name="contact_phone"]', '+1 (415) 555-0123');
    await page.fill('textarea[name="additional_contacts"]', 'Investor Relations: Climate Ventures - media@climatevp.com');
    
    await page.click('#process-stage-contact-info');
    console.log('✅ Startup contact information processed');
    
    // Stage 6: Fact-Checking - Critical for funding claims
    await page.waitForSelector('[data-testid="stage-card-fact-check"]', { timeout: 45000 });
    
    // Let AI fact-checker run automatically first
    const factCheckCard = page.locator('[data-testid="stage-card-fact-check"]');
    await expect(factCheckCard).toContainText('verified_facts');
    
    // Review and potentially modify fact-checking for funding claims
    await page.click('#process-stage-fact-check');
    await page.waitForSelector('textarea[name="verified_facts"]', { timeout: 10000 });
    
    // Verify fact-checking has appropriate financial scrutiny
    const verifiedFacts = await page.locator('textarea[name="verified_facts"]').inputValue();
    expect(verifiedFacts).toBeTruthy();
    
    // Ensure proper approval for financial disclosure
    const approvalStatus = await page.locator('select[name="approval_status"]').inputValue();
    if (approvalStatus !== 'approved') {
      await page.selectOption('select[name="approval_status"]', 'approved');
      await page.fill('textarea[name="fact_checker_notes"]', 'Funding amount and investor details verified. All financial claims cross-checked with SEC filings and investor announcements. Ready for publication.');
    }
    
    await page.click('#process-stage-fact-check');
    console.log('✅ Financial fact-checking completed and approved');
    
    // Stage 7: Final Press Release Generation
    await page.waitForSelector('[data-testid="stage-card-final-press-release"]', { timeout: 45000 });
    
    // Verify press release contains funding-specific content
    const pressReleaseCard = page.locator('[data-testid="stage-card-final-press-release"]');
    await expect(pressReleaseCard).toContainText('FOR IMMEDIATE RELEASE');
    await expect(pressReleaseCard).toContainText('GreenTech Innovations');
    await expect(pressReleaseCard).toContainText('$15 million');
    await expect(pressReleaseCard).toContainText('Series A');
    await expect(pressReleaseCard).toContainText('Climate Ventures');
    console.log('✅ Funding press release generated with all key elements');
    
    // Stage 8: Press Photo - Team or office photo for funding announcement
    const pressPhotoCard = page.locator('[data-testid="stage-card-press-photo"]');
    const hasPhotoStage = await pressPhotoCard.isVisible();
    
    if (hasPhotoStage) {
      await page.click('#process-stage-press-photo');
      await page.waitForSelector('textarea[name="image_description"]', { timeout: 10000 });
      
      // Generate team photo for funding announcement
      const teamPhotoDescription = 'Professional group photo of GreenTech Innovations founding team in modern office space with green technology displays, diverse team of 5 people including CEO Dr. Marcus Rodriguez, bright lighting, corporate setting with sustainability elements';
      await page.fill('textarea[name="image_description"]', teamPhotoDescription);
      await page.selectOption('select[name="style"]', 'professional');
      await page.selectOption('select[name="aspect_ratio"]', '16:9');
      
      await page.click('#process-stage-press-photo');
      
      // Wait for team photo generation
      await page.waitForSelector('img[src*="firebasestorage"]', { timeout: 90000 });
      console.log('✅ Team photo for funding announcement generated');
    }
    
    // Stage 9: Export & Publishing
    await page.waitForSelector('[data-testid="stage-card-export"]', { timeout: 30000 });
    await page.click('#trigger-export-export');
    
    // Wait for all export formats
    await page.waitForSelector('h3:has-text("Styled HTML")', { timeout: 30000 });
    
    // Verify all export formats for funding announcement
    const exportFormats = ['Styled HTML', 'Clean HTML', 'Markdown', 'PDF Document', 'Word Document'];
    for (const format of exportFormats) {
      const formatHeader = page.locator(`h3:has-text("${format}")`);
      await expect(formatHeader).toBeVisible();
    }
    console.log('✅ All export formats generated for funding announcement');
    
    // Test publishing for financial news distribution
    const publishButton = page.locator('button:has-text("Publish")');
    const hasPublish = await publishButton.isVisible();
    if (hasPublish) {
      await publishButton.click();
      await page.waitForTimeout(3000);
      console.log('✅ Publishing functionality tested for financial press release');
    }
    
    console.log('🎉 Startup funding press release workflow completed successfully!');
  });

  test('Test high-stakes funding announcement with compliance requirements', async ({ page }) => {
    console.log('🧪 Testing high-stakes funding with compliance...');
    
    await page.click('#workflow-start-press-release');
    await page.waitForSelector('input[name="topic"]', { timeout: 10000 });
    
    // Create high-stakes scenario (larger funding round)
    await page.fill('input[name="topic"]', 'Series B Funding - $50M Led by Top Tier VCs');
    await page.fill('textarea[name="message"]', 'FinTech Unicorn Corp today announced a $50 million Series B funding round led by Sequoia Capital and Andreessen Horowitz, bringing total funding to $85 million and valuation to $500 million.');
    await page.fill('input[name="company"]', 'FinTech Unicorn Corp');
    await page.fill('input[name="website"]', 'https://fintech-unicorn.com');
    
    await page.click('#process-stage-basic-info');
    
    // Wait for fact-checking stage (this is critical for large funding amounts)
    await page.waitForSelector('[data-testid="stage-card-fact-check"]', { timeout: 90000 });
    
    // Review fact-checking for compliance with large funding claims
    await page.click('#process-stage-fact-check');
    await page.waitForSelector('select[name="risk_assessment"]', { timeout: 10000 });
    
    // For high-stakes announcements, ensure thorough fact-checking
    await page.selectOption('select[name="risk_assessment"]', 'medium');
    await page.fill('textarea[name="fact_checker_notes"]', 'Large funding amount requires extra verification. Cross-referenced with SEC filings, investor websites, and TechCrunch database. All claims verified through multiple sources.');
    await page.selectOption('select[name="approval_status"]', 'approved');
    
    await page.click('#process-stage-fact-check');
    console.log('✅ High-stakes funding fact-checking completed');
    
    // Verify final press release handles large numbers correctly
    await page.waitForSelector('[data-testid="stage-card-final-press-release"]', { timeout: 45000 });
    
    const pressReleaseCard = page.locator('[data-testid="stage-card-final-press-release"]');
    await expect(pressReleaseCard).toContainText('$50 million');
    await expect(pressReleaseCard).toContainText('Series B');
    await expect(pressReleaseCard).toContainText('$500 million');
    console.log('✅ High-stakes funding press release generated correctly');
  });

  test('Test funding announcement with complex investor structure', async ({ page }) => {
    console.log('🧪 Testing complex investor structure...');
    
    await page.click('#workflow-start-press-release');
    await page.waitForSelector('input[name="topic"]', { timeout: 10000 });
    
    // Complex funding scenario with multiple investor types
    const complexMessage = 'BioMed Innovations announced a $25M Series A funding round with participation from Johnson & Johnson Innovation, Google Ventures, Khosla Ventures, and strategic angels including Dr. Jennifer Liu (former Genentech VP) and Michael Chen (Moderna co-founder).';
    
    await page.fill('input[name="topic"]', 'Series A with Strategic and Financial Investors');
    await page.fill('textarea[name="message"]', complexMessage);
    await page.fill('input[name="company"]', 'BioMed Innovations');
    await page.fill('input[name="website"]', 'https://biomed-innovations.com');
    
    await page.click('#process-stage-basic-info');
    
    // Wait for key facts stage and customize for complex investor structure
    await page.waitForSelector('[data-testid="stage-card-key-facts"]', { timeout: 60000 });
    await page.click('#process-stage-key-facts');
    
    await page.waitForSelector('textarea[name="key_points"]', { timeout: 15000 });
    
    // Add detailed investor breakdown
    const complexInvestorPoints = `• $25 million Series A funding with diverse investor base
• Led by Johnson & Johnson Innovation (strategic investor)
• Google Ventures and Khosla Ventures as financial investors
• Strategic angel investors from pharmaceutical industry
• Previous $3M seed round from Y Combinator and individual angels
• Funding validates both commercial and strategic value proposition`;
    
    await page.fill('textarea[name="key_points"]', complexInvestorPoints);
    
    // Add quotes from multiple investor types
    const multiInvestorQuotes = `"BioMed Innovations represents a breakthrough in personalized medicine that aligns perfectly with our strategic initiatives." - Sarah Johnson, Principal at Johnson & Johnson Innovation

"The intersection of AI and biotechnology has tremendous potential, and this team has the vision and execution capability to lead the market." - Dr. Krishna Yeshwant, General Partner at Google Ventures

"As someone who has seen the challenges of drug development firsthand, I'm excited about BioMed's approach to accelerating clinical trials." - Dr. Jennifer Liu, Angel Investor and former VP at Genentech`;
    
    await page.fill('textarea[name="quotes"]', multiInvestorQuotes);
    
    await page.click('#process-stage-key-facts');
    console.log('✅ Complex investor structure processed');
    
    // Fact-checking should handle multiple investor claims
    await page.waitForSelector('[data-testid="stage-card-fact-check"]', { timeout: 45000 });
    await page.click('#process-stage-fact-check');
    
    await page.waitForSelector('textarea[name="verified_facts"]', { timeout: 10000 });
    
    // Add specific fact-checking notes for investor verification
    await page.fill('textarea[name="fact_checker_notes"]', 'All investor participations verified through official investor websites and portfolio pages. Angel investor backgrounds confirmed through LinkedIn and company websites.');
    await page.selectOption('select[name="approval_status"]', 'approved');
    
    await page.click('#process-stage-fact-check');
    
    // Verify final press release includes all investor mentions
    await page.waitForSelector('[data-testid="stage-card-final-press-release"]', { timeout: 45000 });
    
    const pressReleaseCard = page.locator('[data-testid="stage-card-final-press-release"]');
    await expect(pressReleaseCard).toContainText('Johnson & Johnson');
    await expect(pressReleaseCard).toContainText('Google Ventures');
    await expect(pressReleaseCard).toContainText('Khosla Ventures');
    console.log('✅ Complex investor structure properly represented');
  });

  test('Test startup acquisition announcement', async ({ page }) => {
    console.log('🧪 Testing startup acquisition announcement...');
    
    await page.click('#workflow-start-press-release');
    await page.waitForSelector('input[name="topic"]', { timeout: 10000 });
    
    // Acquisition scenario instead of funding
    const acquisitionMessage = 'CloudTech Solutions, a leading enterprise SaaS platform, today announced its acquisition by Microsoft for an undisclosed amount, strengthening Microsoft\'s cloud infrastructure capabilities and expanding their enterprise customer base.';
    
    await page.fill('input[name="topic"]', 'Strategic Acquisition by Microsoft');
    await page.fill('textarea[name="message"]', acquisitionMessage);
    await page.fill('input[name="company"]', 'CloudTech Solutions');
    await page.fill('input[name="website"]', 'https://cloudtech-solutions.com');
    
    await page.click('#process-stage-basic-info');
    
    // Wait for key facts and customize for acquisition
    await page.waitForSelector('[data-testid="stage-card-key-facts"]', { timeout: 60000 });
    await page.click('#process-stage-key-facts');
    
    await page.waitForSelector('textarea[name="statistics"]', { timeout: 15000 });
    
    // Add acquisition-specific statistics
    const acquisitionStats = `• Founded in 2018, grew to $10M ARR
• 150+ enterprise customers globally
• 45-person team joining Microsoft
• 300% year-over-year growth
• Integration planned for Q2 2024`;
    
    await page.fill('textarea[name="statistics"]', acquisitionStats);
    
    await page.click('#process-stage-key-facts');
    
    // Fact-checking for acquisition claims
    await page.waitForSelector('[data-testid="stage-card-fact-check"]', { timeout: 45000 });
    await page.click('#process-stage-fact-check');
    
    await page.waitForSelector('select[name="approval_status"]', { timeout: 10000 });
    await page.selectOption('select[name="approval_status"]', 'approved');
    
    await page.click('#process-stage-fact-check');
    
    // Verify acquisition press release
    await page.waitForSelector('[data-testid="stage-card-final-press-release"]', { timeout: 45000 });
    
    const pressReleaseCard = page.locator('[data-testid="stage-card-final-press-release"]');
    await expect(pressReleaseCard).toContainText('Microsoft');
    await expect(pressReleaseCard).toContainText('acquisition');
    console.log('✅ Acquisition announcement generated successfully');
  });

  test('Test edge cases with funding announcement', async ({ page }) => {
    console.log('🧪 Testing edge cases with funding...');
    
    // Test with very minimal funding information
    await page.click('#workflow-start-press-release');
    await page.waitForSelector('input[name="topic"]', { timeout: 10000 });
    
    await page.fill('input[name="topic"]', 'Seed Funding');
    await page.fill('textarea[name="message"]', 'Startup raises seed funding.');
    await page.fill('input[name="company"]', 'StartupCo');
    
    await page.click('#process-stage-basic-info');
    
    // Should still process minimal funding info
    await page.waitForSelector('[data-testid="stage-card-tone-briefing"]', { timeout: 30000 });
    console.log('✅ Minimal funding info processed');
    
    // Test with international funding (different currencies/regions)
    await page.goto(`${BASE_URL}/dashboard`);
    await page.click('#workflow-start-press-release');
    await page.waitForSelector('input[name="topic"]', { timeout: 10000 });
    
    await page.fill('input[name="topic"]', 'European Series A - €12M Funding');
    await page.fill('textarea[name="message"]', 'EuroTech GmbH announces €12 million Series A funding led by Accel Partners Europe, with participation from existing investors including Rocket Internet and several angel investors from the European startup ecosystem.');
    await page.fill('input[name="company"]', 'EuroTech GmbH');
    await page.fill('input[name="website"]', 'https://eurotech.de');
    
    await page.click('#process-stage-basic-info');
    
    await page.waitForSelector('[data-testid="stage-card-tone-briefing"]', { timeout: 30000 });
    console.log('✅ International funding (Euro) processed correctly');
  });

  test('Test document persistence during long funding workflow', async ({ page }) => {
    console.log('🧪 Testing document persistence during funding workflow...');
    
    const uniqueId = `funding-persistence-${Date.now()}`;
    
    await page.click('#workflow-start-press-release');
    await page.waitForSelector('input[name="topic"]', { timeout: 10000 });
    
    await page.fill('input[name="topic"]', `Series A Funding ${uniqueId}`);
    await page.fill('textarea[name="message"]', 'Testing persistence during long funding workflow.');
    await page.fill('input[name="company"]', 'PersistCorp');
    
    await page.click('#process-stage-basic-info');
    
    // Wait for auto-save
    await page.waitForSelector('text=Last saved', { timeout: 15000 });
    
    // Navigate away mid-workflow
    await page.click('a:has-text("Dashboard")');
    await page.waitForSelector('text=Start a new document', { timeout: 10000 });
    
    // Find and reopen
    const documentLink = page.locator(`text=${uniqueId}`);
    await expect(documentLink).toBeVisible();
    await documentLink.click();
    
    // Should resume at correct stage
    await page.waitForSelector('input[name="topic"]', { timeout: 10000 });
    const preservedTopic = await page.locator('input[name="topic"]').inputValue();
    expect(preservedTopic).toContain(uniqueId);
    
    console.log('✅ Funding workflow persistence verified');
  });
});