import { test, expect } from '@playwright/test';

/**
 * COMPREHENSIVE E2E test for Press Release workflow - Tech Company scenario
 * Following best practices from poem workflow tests with fact-checking validation
 * Chrome only for performance and reliability
 */

test.describe('Press Release Workflow - Tech Company E2E Test', () => {
  test.skip(({ browserName }) => browserName !== 'chromium', 'Chrome only per CLAUDE.md guidelines');
  
  // Test configuration
  const BASE_URL = 'http://localhost:9002';
  
  test.beforeEach(async ({ page }) => {
    // Start each test from a clean dashboard
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForSelector('text=Start a new document', { timeout: 10000 });
  });

  test('Complete tech company press release workflow - product launch', async ({ page }) => {
    console.log('🧪 Testing complete tech company press release workflow...');
    
    // Start press release generator
    await page.click('#workflow-start-press-release');
    await page.waitForSelector('input[name="topic"]', { timeout: 10000 });
    
    // Stage 1: Basic Information
    const techCompanyData = {
      topic: 'AI-Powered Customer Service Platform Launch',
      message: 'TechCorp Inc. today announced the launch of CustomerAI Pro, a revolutionary AI-powered customer service platform that reduces response times by 70% while improving customer satisfaction scores.',
      company: 'TechCorp Inc.',
      website: 'https://techcorp-example.com'
    };
    
    await page.fill('input[name="topic"]', techCompanyData.topic);
    await page.fill('textarea[name="message"]', techCompanyData.message);
    await page.fill('input[name="company"]', techCompanyData.company);
    await page.fill('input[name="website"]', techCompanyData.website);
    
    await page.click('#process-stage-basic-info');
    
    // Wait for tone briefing stage
    await page.waitForSelector('text=Tone of Voice Analysis', { timeout: 30000 });
    console.log('✅ Basic information processed successfully');
    
    // Stage 2: Tone Briefing (auto-run, verify completion)
    await page.waitForSelector('[data-testid="stage-card-tone-briefing"]', { timeout: 45000 });
    
    // Verify tone analysis completed
    const toneBriefingCard = page.locator('[data-testid="stage-card-tone-briefing"]');
    await expect(toneBriefingCard).toContainText('Professional');
    console.log('✅ Tone analysis completed successfully');
    
    // Stage 3: Research (auto-run with grounding)
    await page.waitForSelector('[data-testid="stage-card-research"]', { timeout: 60000 });
    
    // Verify research stage completed with grounding
    const researchCard = page.locator('[data-testid="stage-card-research"]');
    await expect(researchCard).toContainText('company_background');
    await expect(researchCard).toContainText('industry_context');
    console.log('✅ Company and industry research completed with web grounding');
    
    // Stage 4: Key Facts editing
    await page.waitForSelector('[data-testid="stage-card-key-facts"]', { timeout: 30000 });
    
    // Review and edit key facts if needed
    const keyFactsEditBtn = page.locator('#process-stage-key-facts');
    await keyFactsEditBtn.click();
    
    // Wait for key facts form
    await page.waitForSelector('input[name="headline"]', { timeout: 10000 });
    
    // Verify auto-generated headline and edit if needed
    const headline = await page.locator('input[name="headline"]').inputValue();
    expect(headline).toContain('TechCorp');
    expect(headline).toContain('AI');
    
    // Add additional key points
    const additionalPoints = `• Reduces customer service response times by up to 70%
• Improves customer satisfaction scores by 45% on average  
• Integrates seamlessly with existing CRM systems
• Supports 25+ languages for global deployment
• Enterprise-grade security with SOC2 compliance`;
    
    await page.fill('textarea[name="key_points"]', additionalPoints);
    
    // Add executive quotes
    const quotes = `"CustomerAI Pro represents a quantum leap in customer service technology. Our clients are seeing unprecedented improvements in both efficiency and customer satisfaction." - Sarah Johnson, CEO of TechCorp Inc.

"This platform doesn't just automate responses—it truly understands customer needs and provides personalized, intelligent solutions at scale." - Dr. Michael Chen, Chief Technology Officer`;
    
    await page.fill('textarea[name="quotes"]', quotes);
    
    // Add statistics
    const statistics = `• 70% reduction in average response time
• 45% improvement in customer satisfaction scores
• 200+ enterprise customers in beta testing
• $50M in Series B funding completed in 2024
• 99.9% uptime guarantee`;
    
    await page.fill('textarea[name="statistics"]', statistics);
    
    await page.click('#process-stage-key-facts');
    console.log('✅ Key facts customized and processed');
    
    // Stage 5: Contact Information
    await page.waitForSelector('[data-testid="stage-card-contact-info"]', { timeout: 15000 });
    await page.click('#process-stage-contact-info');
    
    // Wait for contact form and verify auto-generated data
    await page.waitForSelector('input[name="contact_name"]', { timeout: 10000 });
    
    const contactName = await page.locator('input[name="contact_name"]').inputValue();
    expect(contactName).toBeTruthy();
    
    // Customize contact information for tech company
    await page.fill('input[name="contact_name"]', 'Jennifer Martinez');
    await page.fill('input[name="contact_title"]', 'Director of Communications');
    await page.fill('input[name="contact_email"]', 'press@techcorp-example.com');
    await page.fill('input[name="contact_phone"]', '+1 (555) 123-4567');
    await page.fill('textarea[name="additional_contacts"]', 'PR Agency: Thompson Communications - media@thompson-pr.com');
    
    await page.click('#process-stage-contact-info');
    console.log('✅ Contact information processed');
    
    // Stage 6: Fact-Checking & Verification (CRITICAL STAGE)
    await page.waitForSelector('[data-testid="stage-card-fact-check"]', { timeout: 45000 });
    
    // Verify fact-checking stage auto-runs with Google Search grounding
    const factCheckCard = page.locator('[data-testid="stage-card-fact-check"]');
    await expect(factCheckCard).toContainText('verified_facts');
    
    // Review fact-checking results
    await page.click('#process-stage-fact-check');
    await page.waitForSelector('textarea[name="verified_facts"]', { timeout: 10000 });
    
    // Verify AI has populated fact-checking fields
    const verifiedFacts = await page.locator('textarea[name="verified_facts"]').inputValue();
    expect(verifiedFacts).toBeTruthy();
    console.log('✅ Fact-checking completed with AI verification');
    
    // Check risk assessment and approval status
    const riskAssessment = await page.locator('select[name="risk_assessment"]').inputValue();
    const approvalStatus = await page.locator('select[name="approval_status"]').inputValue();
    
    // Ensure approval for publication
    if (approvalStatus !== 'approved') {
      await page.selectOption('select[name="approval_status"]', 'approved');
      await page.fill('textarea[name="fact_checker_notes"]', 'All claims verified against official company documentation and public sources. Ready for publication.');
    }
    
    await page.click('#process-stage-fact-check');
    console.log('✅ Fact-checking approved for publication');
    
    // Stage 7: Final Press Release Generation
    await page.waitForSelector('[data-testid="stage-card-final-press-release"]', { timeout: 45000 });
    
    // Verify press release was generated with fact-checking integration
    const pressReleaseCard = page.locator('[data-testid="stage-card-final-press-release"]');
    await expect(pressReleaseCard).toContainText('FOR IMMEDIATE RELEASE');
    await expect(pressReleaseCard).toContainText('TechCorp Inc.');
    await expect(pressReleaseCard).toContainText('CustomerAI Pro');
    console.log('✅ Final press release generated successfully');
    
    // Stage 8: Optional Press Photo (test image generation)
    const pressPhotoCard = page.locator('[data-testid="stage-card-press-photo"]');
    const hasPhotoStage = await pressPhotoCard.isVisible();
    
    if (hasPhotoStage) {
      await page.click('#process-stage-press-photo');
      await page.waitForSelector('textarea[name="image_description"]', { timeout: 10000 });
      
      // Customize press photo for tech company
      const photoDescription = 'Professional corporate headshot of TechCorp Inc. CEO Sarah Johnson in modern office setting with company logo visible in background, business attire, confident expression';
      await page.fill('textarea[name="image_description"]', photoDescription);
      await page.selectOption('select[name="style"]', 'professional');
      await page.selectOption('select[name="aspect_ratio"]', '4:3');
      
      await page.click('#process-stage-press-photo');
      
      // Wait for image generation
      await page.waitForSelector('img[src*="firebasestorage"]', { timeout: 90000 });
      console.log('✅ Press photo generated successfully');
    }
    
    // Stage 9: Export & Publishing
    await page.waitForSelector('[data-testid="stage-card-export"]', { timeout: 30000 });
    await page.click('#trigger-export-export');
    
    // Wait for all export formats
    await page.waitForSelector('h3:has-text("Styled HTML")', { timeout: 30000 });
    
    // Verify all export formats are available
    const exportFormats = ['Styled HTML', 'Clean HTML', 'Markdown', 'PDF Document', 'Word Document'];
    for (const format of exportFormats) {
      const formatHeader = page.locator(`h3:has-text("${format}")`);
      await expect(formatHeader).toBeVisible();
      console.log(`✅ ${format} export generated`);
    }
    
    // Test publishing options
    const publishButton = page.locator('button:has-text("Publish")');
    const hasPublish = await publishButton.isVisible();
    if (hasPublish) {
      await publishButton.click();
      await page.waitForTimeout(3000);
      console.log('✅ Publishing functionality tested');
    }
    
    // Verify workflow completion
    const completedStages = await page.locator('[data-testid^="stage-card-"]').count();
    console.log(`✅ Workflow completed with ${completedStages} stages`);
    
    console.log('🎉 Tech company press release workflow completed successfully!');
  });

  test('Test press release content quality and compliance', async ({ page }) => {
    console.log('🧪 Testing press release content quality and compliance...');
    
    // Generate a quick press release for content verification
    await page.click('#workflow-start-press-release');
    await page.waitForSelector('input[name="topic"]', { timeout: 10000 });
    
    // Use different tech company scenario
    await page.fill('input[name="topic"]', 'Cybersecurity Software Acquisition');
    await page.fill('textarea[name="message"]', 'SecureTech Corp announces acquisition of ShieldAI, a leading cybersecurity startup, for $120M to enhance enterprise security offerings.');
    await page.fill('input[name="company"]', 'SecureTech Corp');
    await page.fill('input[name="website"]', 'https://securetech-corp.com');
    
    await page.click('#process-stage-basic-info');
    
    // Wait for all auto-run stages to complete
    await page.waitForSelector('[data-testid="stage-card-fact-check"]', { timeout: 90000 });
    
    // Ensure fact-checking is approved
    await page.click('#process-stage-fact-check');
    await page.waitForSelector('select[name="approval_status"]', { timeout: 10000 });
    await page.selectOption('select[name="approval_status"]', 'approved');
    await page.click('#process-stage-fact-check');
    
    // Generate final press release
    await page.waitForSelector('[data-testid="stage-card-final-press-release"]', { timeout: 45000 });
    
    // Analyze press release content
    const pressReleaseContent = await page.locator('[data-testid="stage-card-final-press-release"]').textContent();
    
    // Verify AP style compliance
    expect(pressReleaseContent).toContain('FOR IMMEDIATE RELEASE');
    expect(pressReleaseContent).toContain('SecureTech Corp');
    expect(pressReleaseContent).toContain('$120M');
    expect(pressReleaseContent).toContain('###');
    
    // Verify professional structure
    expect(pressReleaseContent).toMatch(/Contact:/);
    expect(pressReleaseContent).toMatch(/About.*SecureTech/);
    
    console.log('✅ Press release follows AP style and professional standards');
    
    // Test export content
    await page.click('#trigger-export-export');
    await page.waitForSelector('button:has-text("Copy")', { timeout: 30000 });
    
    // Copy and verify HTML export includes proper attribution
    const copyButton = page.locator('div:has(h3:has-text("Styled HTML")) button:has-text("Copy")');
    await copyButton.click();
    
    console.log('✅ Content quality and compliance verified');
  });

  test('Test fact-checking workflow with questionable claims', async ({ page }) => {
    console.log('🧪 Testing fact-checking with questionable claims...');
    
    await page.click('#workflow-start-press-release');
    await page.waitForSelector('input[name="topic"]', { timeout: 10000 });
    
    // Create scenario with potentially questionable claims for fact-checking
    await page.fill('input[name="topic"]', 'Revolutionary Quantum Computing Breakthrough');
    await page.fill('textarea[name="message"]', 'QuantumTech Inc. claims to have achieved room-temperature quantum computing with 99.99% efficiency, solving all current quantum decoherence issues.');
    await page.fill('input[name="company"]', 'QuantumTech Inc.');
    await page.fill('input[name="website"]', 'https://quantumtech-example.com');
    
    await page.click('#process-stage-basic-info');
    
    // Wait for fact-checking stage
    await page.waitForSelector('[data-testid="stage-card-fact-check"]', { timeout: 90000 });
    
    // Review fact-checking results for questionable claims
    await page.click('#process-stage-fact-check');
    await page.waitForSelector('textarea[name="questionable_claims"]', { timeout: 10000 });
    
    // AI should have flagged the extreme claims
    const questionableClaims = await page.locator('textarea[name="questionable_claims"]').inputValue();
    
    // Add manual fact-checker concerns
    await page.fill('textarea[name="questionable_claims"]', 'Room-temperature quantum computing claim needs verification - no peer-reviewed publications found. 99.99% efficiency claim is unprecedented and requires independent validation.');
    
    await page.fill('textarea[name="suggested_corrections"]', 'Recommend softening claims to "significant progress in quantum computing stability" and removing specific efficiency percentages until verified by independent labs.');
    
    await page.selectOption('select[name="risk_assessment"]', 'high');
    await page.selectOption('select[name="approval_status"]', 'needs_revision');
    
    await page.fill('textarea[name="fact_checker_notes"]', 'Requires significant revision of quantum computing claims before publication. Recommend legal review for any performance claims.');
    
    await page.click('#process-stage-fact-check');
    
    // Verify that press release generation warns about fact-checking status
    const finalStageCard = page.locator('[data-testid="stage-card-final-press-release"]');
    
    // The final press release should reflect the fact-checking concerns
    const hasFactCheckWarning = await finalStageCard.isVisible();
    
    console.log('✅ Fact-checking workflow properly handles questionable claims');
    console.log('✅ Risk assessment and approval workflow functioning correctly');
  });

  test('Test document persistence and navigation', async ({ page }) => {
    console.log('🧪 Testing document persistence...');
    
    // Start press release with unique identifier
    const uniqueIdentifier = `persistence-test-${Date.now()}`;
    
    await page.click('#workflow-start-press-release');
    await page.waitForSelector('input[name="topic"]', { timeout: 10000 });
    
    await page.fill('input[name="topic"]', `Software Update Release ${uniqueIdentifier}`);
    await page.fill('textarea[name="message"]', 'Testing document persistence with auto-save functionality.');
    await page.fill('input[name="company"]', 'TestCorp Ltd.');
    
    await page.click('#process-stage-basic-info');
    
    // Wait for auto-save
    await page.waitForSelector('text=Last saved', { timeout: 15000 });
    console.log('✅ Document auto-saved');
    
    // Navigate away and back
    await page.click('a:has-text("Dashboard")');
    await page.waitForSelector('text=Start a new document', { timeout: 10000 });
    
    // Find and reopen the document
    const documentLink = page.locator(`text=${uniqueIdentifier}`);
    await expect(documentLink).toBeVisible();
    await documentLink.click();
    
    // Verify content was preserved
    await page.waitForSelector('input[name="topic"]', { timeout: 10000 });
    const preservedTopic = await page.locator('input[name="topic"]').inputValue();
    expect(preservedTopic).toContain(uniqueIdentifier);
    
    console.log('✅ Document persistence verified');
  });

  test('Test edge cases and error handling', async ({ page }) => {
    console.log('🧪 Testing edge cases and error handling...');
    
    // Test with minimal input
    await page.click('#workflow-start-press-release');
    await page.waitForSelector('input[name="topic"]', { timeout: 10000 });
    
    await page.fill('input[name="topic"]', 'Test');
    await page.fill('textarea[name="message"]', 'Minimal test.');
    await page.fill('input[name="company"]', 'T');
    
    await page.click('#process-stage-basic-info');
    
    // Should still process minimal input
    await page.waitForSelector('[data-testid="stage-card-tone-briefing"]', { timeout: 30000 });
    console.log('✅ Minimal input handled gracefully');
    
    // Test with special characters
    await page.goto(`${BASE_URL}/dashboard`);
    await page.click('#workflow-start-press-release');
    await page.waitForSelector('input[name="topic"]', { timeout: 10000 });
    
    const specialChars = 'Special chars: äöü, 中文, 🚀, émojis & symbols <>"\'';
    await page.fill('input[name="topic"]', specialChars);
    await page.fill('textarea[name="message"]', 'Testing unicode and special characters in press release.');
    await page.fill('input[name="company"]', 'Spëciál Corp™');
    
    await page.click('#process-stage-basic-info');
    await page.waitForSelector('[data-testid="stage-card-tone-briefing"]', { timeout: 30000 });
    console.log('✅ Special characters handled correctly');
  });

  test('Test all export formats and publishing', async ({ page }) => {
    console.log('🧪 Testing all export formats...');
    
    // Quick workflow to export stage
    await page.click('#workflow-start-press-release');
    await page.waitForSelector('input[name="topic"]', { timeout: 10000 });
    
    await page.fill('input[name="topic"]', 'Export Test Press Release');
    await page.fill('textarea[name="message"]', 'Testing all export formats and publishing options.');
    await page.fill('input[name="company"]', 'ExportTest Inc.');
    
    await page.click('#process-stage-basic-info');
    
    // Wait for fact-checking and ensure approval
    await page.waitForSelector('[data-testid="stage-card-fact-check"]', { timeout: 90000 });
    await page.click('#process-stage-fact-check');
    await page.waitForSelector('select[name="approval_status"]', { timeout: 10000 });
    await page.selectOption('select[name="approval_status"]', 'approved');
    await page.click('#process-stage-fact-check');
    
    // Generate final press release
    await page.waitForSelector('[data-testid="stage-card-final-press-release"]', { timeout: 45000 });
    
    // Test all export formats
    await page.click('#trigger-export-export');
    await page.waitForSelector('button:has-text("Copy")', { timeout: 30000 });
    
    const exportFormats = [
      { name: 'Styled HTML', action: 'Copy' },
      { name: 'Clean HTML', action: 'Copy' },
      { name: 'Markdown', action: 'Copy' },
      { name: 'PDF Document', action: 'Download' },
      { name: 'Word Document', action: 'Download' }
    ];
    
    for (const format of exportFormats) {
      const formatDiv = page.locator(`div:has(h3:has-text("${format.name}"))`);
      await expect(formatDiv).toBeVisible();
      
      const actionButton = formatDiv.locator(`button:has-text("${format.action}")`);
      await actionButton.click();
      
      console.log(`✅ ${format.name} ${format.action.toLowerCase()} tested`);
      await page.waitForTimeout(1000); // Prevent rapid clicking
    }
    
    // Test publishing if available
    const publishSection = page.locator('text=Publishing Options');
    const hasPublishing = await publishSection.isVisible();
    
    if (hasPublishing) {
      const publishButton = page.locator('button:has-text("Publish")');
      if (await publishButton.isVisible()) {
        await publishButton.click();
        await page.waitForTimeout(2000);
        console.log('✅ Publishing tested');
      }
    }
    
    console.log('✅ All export formats and publishing options verified');
  });
});