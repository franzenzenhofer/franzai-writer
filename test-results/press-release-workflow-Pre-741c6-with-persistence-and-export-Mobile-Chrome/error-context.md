# Test info

- Name: Press Release Workflow - Master Test (Chrome Only) >> Complete press release workflow with persistence and export
- Location: /Users/franzenzenhofer/dev/franzai-writer/tests/e2e/press-release-workflow.spec.ts:21:7

# Error details

```
Error: page.waitForSelector: Test timeout of 60000ms exceeded.
Call log:
  - waiting for locator('[data-testid="stage-card-research"] code') to be visible

    at /Users/franzenzenhofer/dev/franzai-writer/tests/e2e/press-release-workflow.spec.ts:83:12
```

# Page snapshot

```yaml
- banner:
  - button "Toggle menu":
    - img
    - text: Toggle menu
  - text: FranzAI Writer
  - navigation
- main:
  - heading "New Press Release Generator" [level=1]
  - text: Last saved 03 Jul 2025 18:29 |
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
  - code: "{ \"tone\": { \"primary_voice_characteristics\": \"Innovative, Approachable, Confident\", \"secondary_emotional_undertones\": \"Excited, Optimistic, Strategic\", \"industry_appropriate_professionalism_level\": \"High (reflecting seriousness of investment but maintaining startup energy)\", \"target_audience_considerations\": \"Blend of technical (investors, engineers) and general public (potential customers, media); balance technical accuracy with accessible language.\" }, \"style_guidelines\": { \"sentence_structure\": \"Mix of sentence lengths to maintain reader engagement. Avoid overly complex sentences. Rhythm should be dynamic and forward-moving.\", \"voice_preference\": \"Primarily active voice to convey directness and confidence. Passive voice acceptable when emphasizing the action rather than the actor (e.g., 'The investment was secured...').\", \"technical_depth\": \"Use technical jargon judiciously. Define key technical terms clearly and concisely, assuming a baseline understanding but avoiding overly specialized language. Prioritize clarity and impact over exhaustive technical detail.\", \"paragraph_structure\": \"Short, focused paragraphs (3-5 sentences) to improve readability. Each paragraph should address a single, clear idea. Logical flow and transitions between paragraphs are crucial.\", \"clarity_standards\": \"Aim for a readability score accessible to a broad audience (e.g., Flesch-Kincaid Grade Level 10-12). Avoid ambiguity and ensure all claims are supported by evidence or data. Accessibility considerations include alt text for images and captions for videos.\" }, \"key_phrases\": { \"core_value_propositions_and_differentiators\": \"Focus on [Specific TechStartup Inc.'s core value propositions and differentiators based on website analysis - e.g., 'disruptive technology,' 'innovative solution,' 'market leader,' 'customer-centric approach']. Emphasize the impact of the technology on the target market.\", \"technical_terminology_and_preferred_definitions\": \"Define key technical terms like '[Specific relevant technical terms - e.g., 'AI-powered,' 'machine learning,' 'cloud-based,' 'SaaS']' in accessible language. Avoid overly technical jargon without explanation.\", \"brand_specific_language_and_positioning_statements\": \"Use consistent brand messaging and positioning statements as defined on the company website and in existing marketing materials. Reinforce the company's mission and vision.\", \"action_oriented_language_patterns\": \"Use strong verbs and action-oriented language to convey momentum and progress. Examples: 'accelerate growth,' 'expand market reach,' 'drive innovation,' 'transform the industry.'\", \"compliance_or_regulatory_language_if_applicable\": \"Include any necessary compliance or regulatory language relevant to the company's industry and operations. Ensure accuracy and adherence to legal requirements.\" }, \"formatting_notes\": { \"quote_attribution_format_and_executive_title_usage\": \"Attribute quotes to named individuals with their full title (e.g., 'John Smith, CEO of TechStartup Inc.'). Use title case for job titles.\", \"data_presentation_percentages_metrics_financial_figures\": \"Present data clearly and concisely using appropriate units (e.g., '$25 million,' '15% growth'). Round figures where appropriate for readability. Provide context for all data points.\", \"list_formatting_bullets_vs_numbers_hierarchy\": \"Use bullet points for unordered lists and numbered lists for sequential steps or ranked items. Maintain consistent indentation and formatting throughout.\", \"legal_and_disclaimer_language_positioning\": \"Include all necessary legal disclaimers and boilerplate language at the end of the press release or relevant document. Ensure compliance with legal requirements.\", \"contact_information_and_boilerplate_placement\": \"Include contact information for media inquiries (name, title, email, phone number) at the end of the press release. Place the company boilerplate after the contact information, providing a brief overview of TechStartup Inc.\" } }"
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
   48 |     // Stage 2: Tone Briefing (manual - context stage)
   49 |     console.log('🎯 Stage 2: Tone Analysis');
   50 |     await page.waitForSelector('[data-testid="stage-card-tone-briefing"]', { timeout: 10000 });
   51 |     
   52 |     // Context stages need manual processing
   53 |     await page.click('#process-stage-tone-briefing');
   54 |     
   55 |     // Wait for the tone analysis to complete - look for code output or accept button
   56 |     const toneCompleted = await Promise.race([
   57 |       page.waitForSelector('[data-testid="stage-card-tone-briefing"] code', { timeout: 45000 })
   58 |         .then(() => 'code'),
   59 |       page.waitForSelector('[data-testid="stage-card-tone-briefing"] button:has-text("Accept & Continue")', { timeout: 45000 })
   60 |         .then(() => 'accept')
   61 |     ]);
   62 |     
   63 |     if (toneCompleted === 'accept') {
   64 |       // Click accept if the button appears
   65 |       await page.click('[data-testid="stage-card-tone-briefing"] button:has-text("Accept & Continue")');
   66 |     }
   67 |     
   68 |     console.log('✅ Tone analysis completed');
   69 |     
   70 |     // Stage 3: Research (requires manual processing)
   71 |     console.log('🔍 Stage 3: Research');
   72 |     await page.waitForSelector('[data-testid="stage-card-research"]', { timeout: 10000 });
   73 |     
   74 |     // Wait for the research stage to be ready and click Run AI
   75 |     const runAIButton = page.locator('[data-testid="stage-card-research"] button:has-text("Run AI")');
   76 |     await runAIButton.waitFor({ state: 'visible', timeout: 10000 });
   77 |     await runAIButton.click();
   78 |     
   79 |     console.log('🔄 Research processing started...');
   80 |     
   81 |     // Wait for research to complete - could show code or other output
   82 |     const researchCompleted = await Promise.race([
>  83 |       page.waitForSelector('[data-testid="stage-card-research"] code', { timeout: 60000 })
      |            ^ Error: page.waitForSelector: Test timeout of 60000ms exceeded.
   84 |         .then(() => 'code'),
   85 |       page.waitForSelector('[data-testid="stage-card-research"] button:has-text("Accept & Continue")', { timeout: 60000 })
   86 |         .then(() => 'accept'),
   87 |       page.waitForSelector('[data-testid="stage-card-research"] button:has-text("AI REDO")', { timeout: 60000 })
   88 |         .then(() => 'redo')
   89 |     ]);
   90 |     
   91 |     console.log(`✅ Research completed with: ${researchCompleted}`);
   92 |     
   93 |     // If there's an accept button, click it
   94 |     if (researchCompleted === 'accept') {
   95 |       await page.click('[data-testid="stage-card-research"] button:has-text("Accept & Continue")');
   96 |     }
   97 |     
   98 |     // Wait for dependencies to update
   99 |     await page.waitForTimeout(2000);
  100 |     
  101 |     // Stage 4: Key Facts (requires manual processing)
  102 |     console.log('📊 Stage 4: Key Facts');
  103 |     await page.waitForSelector('[data-testid="stage-card-key-facts"]', { timeout: 30000 });
  104 |     
  105 |     // Wait for the stage to be active (not waiting)
  106 |     await page.waitForSelector('[data-testid="stage-card-key-facts"]:not(:has-text("Waiting for"))', { timeout: 15000 });
  107 |     
  108 |     // Click the process button
  109 |     const keyFactsButton = page.locator('#process-stage-key-facts');
  110 |     await keyFactsButton.waitFor({ state: 'visible', timeout: 10000 });
  111 |     await keyFactsButton.click();
  112 |     
  113 |     await page.waitForSelector('input[name="headline"]', { timeout: 15000 });
  114 |     
  115 |     // Verify auto-generated headline
  116 |     const headline = await page.locator('input[name="headline"]').inputValue();
  117 |     expect(headline).toBeTruthy();
  118 |     
  119 |     // Add custom key points
  120 |     const keyPoints = `• Raised $25 million in Series A funding
  121 | • Led by Sequoia Capital with top-tier investor participation
  122 | • Funding will accelerate product development and market expansion
  123 | • Company has grown 400% year-over-year
  124 | • Plans to double team size to 100 employees by year-end`;
  125 |     
  126 |     await page.fill('textarea[name="key_points"]', keyPoints);
  127 |     
  128 |     // Add quotes
  129 |     const quotes = `"This funding validates our vision of democratizing data analytics through AI," said John Smith, CEO of TechStartup Inc. "We're excited to accelerate our growth and expand our platform capabilities."
  130 |
  131 | "TechStartup's innovative approach to AI analytics represents a significant market opportunity," said Partner Name, Sequoia Capital. "We're thrilled to support their mission."`;
  132 |     
  133 |     await page.fill('textarea[name="quotes"]', quotes);
  134 |     
  135 |     // Add statistics
  136 |     const statistics = `• $25 million Series A funding
  137 | • 400% year-over-year growth
  138 | • 50+ enterprise customers
  139 | • 99.9% platform uptime
  140 | • 5 billion data points processed monthly`;
  141 |     
  142 |     await page.fill('textarea[name="statistics"]', statistics);
  143 |     
  144 |     await page.click('#process-stage-key-facts');
  145 |     console.log('✅ Key facts processed');
  146 |     
  147 |     // Stage 5: Contact Information
  148 |     console.log('📞 Stage 5: Contact Information');
  149 |     await page.waitForSelector('[data-testid="stage-card-contact-info"]', { timeout: 15000 });
  150 |     
  151 |     // Wait for the stage to be active
  152 |     await page.waitForSelector('[data-testid="stage-card-contact-info"]:not(:has-text("Waiting for"))', { timeout: 10000 });
  153 |     await page.click('#process-stage-contact-info');
  154 |     
  155 |     await page.waitForSelector('input[name="contact_name"]', { timeout: 10000 });
  156 |     
  157 |     await page.fill('input[name="contact_name"]', 'Sarah Johnson');
  158 |     await page.fill('input[name="contact_title"]', 'VP of Communications');
  159 |     await page.fill('input[name="contact_email"]', 'press@techstartup.com');
  160 |     await page.fill('input[name="contact_phone"]', '+1 (555) 123-4567');
  161 |     
  162 |     await page.click('#process-stage-contact-info');
  163 |     console.log('✅ Contact information saved');
  164 |     
  165 |     // Stage 6: Fact-Checking (manual - form stage)
  166 |     console.log('✔️ Stage 6: Fact-Checking');
  167 |     await page.waitForSelector('[data-testid="stage-card-fact-check"]', { timeout: 10000 });
  168 |     
  169 |     // Wait for the stage to be active
  170 |     await page.waitForSelector('[data-testid="stage-card-fact-check"]:not(:has-text("Waiting for"))', { timeout: 10000 });
  171 |     
  172 |     // Process fact-checking stage
  173 |     await page.click('#process-stage-fact-check');
  174 |     await page.waitForSelector('select[name="approval_status"]', { timeout: 15000 });
  175 |     
  176 |     // Approve the press release
  177 |     await page.selectOption('select[name="approval_status"]', 'approved');
  178 |     await page.fill('textarea[name="fact_checker_notes"]', 'All financial figures and claims verified. Ready for publication.');
  179 |     
  180 |     await page.click('#process-stage-fact-check');
  181 |     console.log('✅ Fact-checking approved');
  182 |     
  183 |     // Stage 7: Final Press Release (auto-run after fact-check)
```