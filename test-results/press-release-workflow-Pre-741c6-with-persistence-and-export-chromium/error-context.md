# Test info

- Name: Press Release Workflow - Master Test (Chrome Only) >> Complete press release workflow with persistence and export
- Location: /Users/franzenzenhofer/dev/franzai-writer/tests/e2e/press-release-workflow.spec.ts:21:7

# Error details

```
Error: page.click: Test timeout of 60000ms exceeded.
Call log:
  - waiting for locator('#process-stage-key-facts')

    at /Users/franzenzenhofer/dev/franzai-writer/tests/e2e/press-release-workflow.spec.ts:72:16
```

# Page snapshot

```yaml
- banner:
  - link "FranzAI Writer":
    - /url: /
  - navigation:
    - link "Home":
      - /url: /
    - link "Dashboard":
      - /url: /dashboard
    - link "Documents":
      - /url: /documents
    - link "Assets":
      - /url: /assets
    - link "AI Logs":
      - /url: /admin/debug/ai-log-viewer
  - navigation:
    - link "Login":
      - /url: /login
- main:
  - heading "New Press Release Generator" [level=1]
  - text: Last saved 23 Jun 2025 12:42 |
  - paragraph: "Workflow: Press Release Generator"
  - text: Progress 2 / 9 Stages
  - progressbar
  - img
  - text: Basic Information Provide the topic, key message, and company name for your press release
  - button:
    - img
  - text: Press Release Topic Series A Funding Round - $25M Investment Key Message TechStartup Inc., a leading AI-powered analytics platform, today announced the successful completion of its $25 million Series A funding round led by Sequoia Capital, with participation from Andreessen Horowitz and existing investors. Company Name TechStartup Inc. Company Website (Optional) https://techstartup.com
  - button:
    - img
  - button "Edit":
    - img
    - text: Edit
  - img
  - text: Tone of Voice Analysis Analyze company's existing press releases to match their tone and style
  - button:
    - img
  - code: "{ \"tone\": { \"primary_voice_characteristics\": \"Innovative, Approachable, Confident, Authoritative (in that order of emphasis)\", \"secondary_emotional_undertones\": \"Excited, Optimistic, Humble (acknowledging future challenges)\", \"industry_appropriate_professionalism_level\": \"High, but avoiding excessive formality. Aim for a balance between technical expertise and relatable communication.\", \"target_audience_considerations\": \"Mix of technical investors and general public. Tailor language to be accessible to a broad audience while maintaining credibility with industry experts.\" }, \"style_guidelines\": { \"sentence_structure\": \"Primarily short to medium length sentences (15-25 words). Vary sentence structure to maintain reader engagement. Avoid overly complex sentences that require rereading. Use active voice predominantly.\", \"voice_preference\": \"Active voice is strongly preferred to convey dynamism and directness. Passive voice should be used sparingly and only when the actor is unknown or unimportant.\", \"technical_depth\": \"Use technical jargon judiciously. Define key technical terms clearly and concisely, either inline or in a glossary if necessary. Assume a baseline understanding of the industry but avoid assuming expert knowledge from all readers.\", \"paragraph_structure\": \"Keep paragraphs concise (3-5 sentences). Each paragraph should focus on a single, clear idea. Use transitions to ensure smooth flow between paragraphs and sections. Employ headings and subheadings to break up text and improve readability.\", \"clarity_standards\": \"Aim for a readability score of 60-70 (Flesch Reading Ease). Prioritize clarity and conciseness. Use plain language whenever possible. Ensure accessibility for readers with disabilities by adhering to WCAG guidelines (e.g., alt text for images).\" }, \"key_phrases\": { \"core_value_propositions_and_differentiators\": \"\\\"Revolutionizing [Industry] through [Specific Technology]\\\", \\\"Empowering [Target Audience] with [Benefit]\\\", \\\"Next-generation [Product/Service]\\\", \\\"Scalable and sustainable solutions\\\", \\\"Data-driven insights\\\"\", \"technical_terminology_and_preferred_definitions\": \"Define key terms like \\\"AI-powered,\\\" \\\"machine learning,\\\" \\\"blockchain,\\\" or \\\"cloud-native\\\" (depending on the company's technology) in a clear and accessible manner. Provide context for acronyms.\", \"brand_specific_language_and_positioning_statements\": \"Refer to the company's mission statement and brand guidelines for specific language preferences. Examples: \\\"TechStartup Inc. is committed to...\\\", \\\"Our vision is to...\\\", \\\"We are pioneers in...\\\"\", \"action_oriented_language_patterns\": \"\\\"Driving innovation\\\", \\\"Transforming the industry\\\", \\\"Accelerating growth\\\", \\\"Expanding our reach\\\", \\\"Building the future\\\"\", \"compliance_or_regulatory_language_if_applicable\": \"Include standard legal disclaimers regarding forward-looking statements and investment risks. Consult legal counsel for specific language requirements.\" }, \"formatting_notes\": { \"quote_attribution_format_and_executive_title_usage\": \"Use full name and title on first mention (e.g., \\\"John Smith, CEO of TechStartup Inc.\\\"). Subsequent mentions can use last name and title (e.g., \\\"Smith said...\\\"). Use direct quotes sparingly and only when they add significant value.\", \"data_presentation_percentages_metrics_financial_figures\": \"Use numerals for all numbers greater than nine. Spell out numbers one through nine. Use percentages with the percent sign (%). Clearly label all metrics and financial figures. Use appropriate units (e.g., $25 million, not $25M).\", \"list_formatting_bullets_vs_numbers_hierarchy\": \"Use bulleted lists for unordered items. Use numbered lists for sequential steps or ranked items. Maintain consistent indentation and formatting throughout the document.\", \"legal_and_disclaimer_language_positioning\": \"Include standard legal disclaimers at the end of the press release or in a separate section. Consult legal counsel for specific requirements.\", \"contact_information_and_boilerplate_placement\": \"Include contact information for media inquiries at the end of the press release. Include a brief boilerplate about TechStartup Inc. at the end of the press release. The boilerplate should include the company's mission statement and website address.\" } }"
  - button:
    - img
  - textbox "Optional notes for AI regeneration..."
  - button "AI REDO":
    - img
    - text: AI REDO
  - button "Edit":
    - img
    - text: Edit
  - button "Accept & Continue":
    - img
    - text: Accept & Continue
  - text: Company & Industry Research Research company background and industry context with optional URL analysis
  - button:
    - img
  - text: Additional Research URLs (Optional)
  - 'textbox "Enter URLs for deeper research (one per line): - Company investor pages - Recent press releases - Industry reports - Competitor analysis - News articles"'
  - paragraph
  - text: Research Focus Areas
  - combobox: Comprehensive Analysis (All Areas)
  - text: ⌘+Enter
  - button "Run AI":
    - img
    - text: Run AI
  - img
  - text: "Waiting for: Company & Industry Research Edit Key Facts Review and edit the key facts for your press release"
  - button:
    - img
  - text: Headline
  - textbox "Main headline for the press release"
  - paragraph
  - text: Subheadline
  - textbox "Supporting subheadline (optional)"
  - paragraph
  - text: Key Points
  - textbox "Main points to include (one per line)"
  - paragraph
  - text: Quotes
  - textbox "e.g., \"This launch represents...\" - CEO John Doe"
  - paragraph
  - text: Statistics & Data
  - textbox "Important numbers, statistics, or data points"
  - paragraph
  - img
  - text: "Waiting for: Edit Key Facts Edit Contact Information Provide contact details for media inquiries"
  - button:
    - img
  - text: Contact Name
  - textbox "e.g., Jane Smith"
  - paragraph
  - text: Contact Title
  - textbox "e.g., Director of Communications"
  - paragraph
  - text: Contact Email
  - textbox "e.g., press@company.com"
  - paragraph
  - text: Contact Phone
  - textbox "e.g., +1 (555) 123-4567"
  - paragraph
  - text: Additional Contacts (Optional)
  - textbox "Secondary contacts or PR agency details"
  - paragraph
  - img
  - text: "Waiting for: Edit Key Facts, Edit Contact Information, Company & Industry Research Fact-Checking & Verification Verify all claims, statistics, and statements for accuracy before publication"
  - button:
    - img
  - text: Verified Facts
  - textbox "List all statements that have been verified as accurate"
  - paragraph
  - text: Questionable Claims
  - textbox "Claims that need revision or cannot be verified"
  - paragraph
  - text: Suggested Corrections
  - textbox "Recommended changes to improve accuracy"
  - paragraph
  - text: Risk Assessment
  - combobox: Medium Risk - Minor concerns
  - text: Approval Status
  - combobox: APPROVED - Ready for publication
  - text: Fact-Checker Notes
  - textbox "Additional notes and recommendations for the editorial team"
  - paragraph
  - img
  - text: "Waiting for: Edit Key Facts, Edit Contact Information, Fact-Checking & Verification Generate Press Release Create the final press release following official standards"
  - button:
    - img
  - img
  - text: "Waiting for: Generate Press Release Generate Press Photo (Optional) Optional Create a professional image to accompany the press release"
  - button:
    - img
  - text: Image Description
  - textbox "e.g., Professional photo of a modern office building with company logo"
  - paragraph
  - text: Image Style
  - combobox: Photorealistic
  - text: Aspect Ratio
  - combobox: 16:9 (Landscape)
  - text: Export Press Release Export your press release in various formats
  - button:
    - img
  - img
  - text: "Waiting for: Generate Press Release"
- contentinfo:
  - paragraph: © 2025 Franz AI Writer. All rights reserved.
  - paragraph:
    - text: Made with
    - img
    - text: using AI-powered workflows
  - link "Home":
    - /url: /
  - link "FranzAI.com":
    - /url: https://www.franzai.com
  - link "Privacy":
    - /url: /privacy
  - link "Terms":
    - /url: /terms
- region "Notifications (F8)":
  - list
- alert
- button "Open Next.js Dev Tools":
  - img
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 |
   3 | /**
   4 |  * Master E2E test for Press Release workflow
   5 |  * Complete workflow: basic info → tone → research → key facts → contact → final → photo → export
   6 |  * Chrome only for performance per CLAUDE.md guidelines
   7 |  */
   8 |
   9 | test.describe('Press Release Workflow - Master Test (Chrome Only)', () => {
   10 |   test.skip(({ browserName }) => browserName !== 'chromium', 'Chrome only per CLAUDE.md guidelines');
   11 |   
   12 |   // Test configuration
   13 |   const BASE_URL = 'http://localhost:9002';
   14 |   
   15 |   test.beforeEach(async ({ page }) => {
   16 |     // Start each test from a clean dashboard
   17 |     await page.goto(`${BASE_URL}/dashboard`);
   18 |     await page.waitForSelector('text=Start a new document', { timeout: 10000 });
   19 |   });
   20 |
   21 |   test('Complete press release workflow with persistence and export', async ({ page }) => {
   22 |     console.log('🚀 Starting Press Release Master Test...');
   23 |     
   24 |     // Start press release generator
   25 |     await page.click('#workflow-start-press-release');
   26 |     await page.waitForSelector('input[name="topic"]', { timeout: 10000 });
   27 |     
   28 |     // Stage 1: Basic Information
   29 |     console.log('📝 Stage 1: Basic Information');
   30 |     const prData = {
   31 |       topic: 'Series A Funding Round - $25M Investment',
   32 |       message: 'TechStartup Inc., a leading AI-powered analytics platform, today announced the successful completion of its $25 million Series A funding round led by Sequoia Capital, with participation from Andreessen Horowitz and existing investors.',
   33 |       company: 'TechStartup Inc.',
   34 |       website: 'https://techstartup.com'
   35 |     };
   36 |     
   37 |     await page.fill('input[name="topic"]', prData.topic);
   38 |     await page.fill('textarea[name="message"]', prData.message);
   39 |     await page.fill('input[name="company"]', prData.company);
   40 |     await page.fill('input[name="website"]', prData.website);
   41 |     
   42 |     await page.click('#process-stage-basic-info');
   43 |     
   44 |     // Wait for auto-save indicator
   45 |     await page.waitForSelector('text=Last saved', { timeout: 15000 });
   46 |     console.log('✅ Basic information saved');
   47 |     
   48 |     // Stage 2: Tone Briefing (auto-run)
   49 |     console.log('🎯 Stage 2: Tone Analysis (auto-run)');
   50 |     await page.waitForSelector('[data-testid="stage-card-tone-briefing"]', { timeout: 45000 });
   51 |     const toneBriefingCard = page.locator('[data-testid="stage-card-tone-briefing"]');
   52 |     await expect(toneBriefingCard).toContainText('tone');
   53 |     console.log('✅ Tone analysis completed');
   54 |     
   55 |     // Stage 3: Research (may need manual processing)
   56 |     console.log('🔍 Stage 3: Research');
   57 |     await page.waitForSelector('[data-testid="stage-card-research"]', { timeout: 60000 });
   58 |     
   59 |     // Check if research needs manual processing
   60 |     const researchButton = page.locator('#process-stage-research');
   61 |     if (await researchButton.isVisible()) {
   62 |       // Process with default settings
   63 |       await researchButton.click();
   64 |       await page.waitForSelector('[data-testid="stage-card-research"]:has-text("company_background")', { timeout: 60000 });
   65 |     }
   66 |     
   67 |     console.log('✅ Research completed with web grounding');
   68 |     
   69 |     // Stage 4: Key Facts
   70 |     console.log('📊 Stage 4: Key Facts');
   71 |     await page.waitForSelector('[data-testid="stage-card-key-facts"]', { timeout: 30000 });
>  72 |     await page.click('#process-stage-key-facts');
      |                ^ Error: page.click: Test timeout of 60000ms exceeded.
   73 |     
   74 |     await page.waitForSelector('input[name="headline"]', { timeout: 15000 });
   75 |     
   76 |     // Verify auto-generated headline
   77 |     const headline = await page.locator('input[name="headline"]').inputValue();
   78 |     expect(headline).toBeTruthy();
   79 |     
   80 |     // Add custom key points
   81 |     const keyPoints = `• Raised $25 million in Series A funding
   82 | • Led by Sequoia Capital with top-tier investor participation
   83 | • Funding will accelerate product development and market expansion
   84 | • Company has grown 400% year-over-year
   85 | • Plans to double team size to 100 employees by year-end`;
   86 |     
   87 |     await page.fill('textarea[name="key_points"]', keyPoints);
   88 |     
   89 |     // Add quotes
   90 |     const quotes = `"This funding validates our vision of democratizing data analytics through AI," said John Smith, CEO of TechStartup Inc. "We're excited to accelerate our growth and expand our platform capabilities."
   91 |
   92 | "TechStartup's innovative approach to AI analytics represents a significant market opportunity," said Partner Name, Sequoia Capital. "We're thrilled to support their mission."`;
   93 |     
   94 |     await page.fill('textarea[name="quotes"]', quotes);
   95 |     
   96 |     // Add statistics
   97 |     const statistics = `• $25 million Series A funding
   98 | • 400% year-over-year growth
   99 | • 50+ enterprise customers
  100 | • 99.9% platform uptime
  101 | • 5 billion data points processed monthly`;
  102 |     
  103 |     await page.fill('textarea[name="statistics"]', statistics);
  104 |     
  105 |     await page.click('#process-stage-key-facts');
  106 |     console.log('✅ Key facts processed');
  107 |     
  108 |     // Stage 5: Contact Information
  109 |     console.log('📞 Stage 5: Contact Information');
  110 |     await page.waitForSelector('[data-testid="stage-card-contact-info"]', { timeout: 15000 });
  111 |     await page.click('#process-stage-contact-info');
  112 |     
  113 |     await page.waitForSelector('input[name="contact_name"]', { timeout: 10000 });
  114 |     
  115 |     await page.fill('input[name="contact_name"]', 'Sarah Johnson');
  116 |     await page.fill('input[name="contact_title"]', 'VP of Communications');
  117 |     await page.fill('input[name="contact_email"]', 'press@techstartup.com');
  118 |     await page.fill('input[name="contact_phone"]', '+1 (555) 123-4567');
  119 |     
  120 |     await page.click('#process-stage-contact-info');
  121 |     console.log('✅ Contact information saved');
  122 |     
  123 |     // Stage 6: Fact-Checking (auto-run)
  124 |     console.log('✔️ Stage 6: Fact-Checking (auto-run)');
  125 |     await page.waitForSelector('[data-testid="stage-card-fact-check"]', { timeout: 45000 });
  126 |     const factCheckCard = page.locator('[data-testid="stage-card-fact-check"]');
  127 |     await expect(factCheckCard).toContainText('verified_facts');
  128 |     
  129 |     // Review fact-checking
  130 |     await page.click('#process-stage-fact-check');
  131 |     await page.waitForSelector('select[name="approval_status"]', { timeout: 10000 });
  132 |     
  133 |     // Approve the press release
  134 |     await page.selectOption('select[name="approval_status"]', 'approved');
  135 |     await page.fill('textarea[name="fact_checker_notes"]', 'All financial figures and claims verified. Ready for publication.');
  136 |     
  137 |     await page.click('#process-stage-fact-check');
  138 |     console.log('✅ Fact-checking approved');
  139 |     
  140 |     // Stage 7: Final Press Release (auto-run)
  141 |     console.log('📄 Stage 7: Final Press Release (auto-run)');
  142 |     await page.waitForSelector('[data-testid="stage-card-final-press-release"]', { timeout: 45000 });
  143 |     
  144 |     const finalPRCard = page.locator('[data-testid="stage-card-final-press-release"]');
  145 |     await expect(finalPRCard).toContainText('FOR IMMEDIATE RELEASE');
  146 |     await expect(finalPRCard).toContainText('TechStartup Inc.');
  147 |     await expect(finalPRCard).toContainText('$25 million');
  148 |     console.log('✅ Final press release generated');
  149 |     
  150 |     // Stage 8: Press Photo (optional - skip for speed)
  151 |     console.log('📸 Stage 8: Press Photo (skipping for test speed)');
  152 |     const hasPhotoStage = await page.locator('[data-testid="stage-card-press-photo"]').isVisible();
  153 |     if (hasPhotoStage) {
  154 |       await page.click('#process-stage-press-photo');
  155 |       await page.waitForSelector('textarea[name="image_description"]', { timeout: 10000 });
  156 |       await page.fill('textarea[name="image_description"]', 'Modern office space with diverse team collaborating');
  157 |       await page.selectOption('select[name="style"]', 'professional');
  158 |       await page.click('#process-stage-press-photo');
  159 |       console.log('✅ Press photo stage processed');
  160 |     }
  161 |     
  162 |     // Stage 9: Export & Publishing
  163 |     console.log('📤 Stage 9: Export & Publishing');
  164 |     await page.waitForSelector('[data-testid="stage-card-export"]', { timeout: 30000 });
  165 |     await page.click('#trigger-export-export');
  166 |     
  167 |     // Wait for all export formats
  168 |     await page.waitForSelector('h3:has-text("Styled HTML")', { timeout: 30000 });
  169 |     
  170 |     // Verify all export formats
  171 |     const exportFormats = ['Styled HTML', 'Clean HTML', 'Markdown', 'PDF Document', 'Word Document'];
  172 |     for (const format of exportFormats) {
```