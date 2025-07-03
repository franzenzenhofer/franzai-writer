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
  - code: "{ \"tone\": \"The tone should be **authoritative** yet **approachable**, reflecting TechStartup Inc.'s position as an innovative player securing significant funding. The primary voice should be confident and forward-thinking, showcasing expertise and vision. Secondary emotional undertones should be **confident** and **measured**, avoiding hype while conveying excitement about future growth. Maintain a high level of industry-appropriate professionalism, balancing technical accuracy with accessibility for a broad audience, including investors, potential partners, and tech enthusiasts. Avoid overly technical jargon without explanation. The overall tone should inspire trust and demonstrate a clear understanding of the market landscape.\", \"style_guidelines\": \"Employ clear and concise sentence structure, favoring **active voice** to convey dynamism and ownership. Sentence length should vary, with a mix of shorter, impactful sentences and longer sentences providing context and detail. Paragraphs should be concise and focused, typically 3-5 sentences, ensuring logical flow and readability. Technical depth should be carefully managed, providing sufficient explanation of technical terms for a general audience while maintaining credibility with industry experts. Jargon should be used sparingly and always defined upon first use. Aim for a readability level suitable for a well-informed general audience (e.g., Flesch-Kincaid Grade Level 10-12). Use bullet points or numbered lists to break up large blocks of text and highlight key information. Ensure accessibility by using descriptive language and avoiding overly complex sentence structures.\", \"key_phrases\": \"Focus on core value propositions such as 'disruptive innovation,' 'scalable solutions,' 'market leadership,' and 'customer-centric approach.' Highlight differentiators like 'proprietary technology,' 'unique market position,' and 'experienced leadership team.' Use technical terminology accurately and consistently, providing clear definitions where necessary. Brand-specific language should align with TechStartup Inc.'s established voice and mission. Action-oriented language should emphasize growth, expansion, and future opportunities (e.g., 'accelerating growth,' 'expanding market reach,' 'driving innovation'). Emphasize the strategic use of the $25M Series A funding to 'fuel expansion,' 'enhance product development,' and 'scale operations.' Include phrases that demonstrate investor confidence, such as 'validated business model' and 'strong market traction.' If applicable, include compliance or regulatory language relevant to the industry, ensuring accuracy and adherence to legal requirements.\", \"formatting_notes\": \"Quote attributions should follow AP style, including the speaker's full name and title (e.g., 'John Smith, CEO of TechStartup Inc.'). Data presentation should be clear and concise, using percentages, metrics, and financial figures accurately and consistently. Round financial figures appropriately (e.g., '$25 million' instead of '$25,000,000'). List formatting should use bullets for unordered lists and numbers for ordered lists, ensuring clear hierarchy and logical progression. Legal and disclaimer language should be placed at the end of the release in a smaller font size. Contact information should include a dedicated media contact with name, title, email address, and phone number. The boilerplate should provide a concise overview of TechStartup Inc., including its mission, key products/services, and website URL (https://techstartup.com). Ensure all links are active and accurate.\" }"
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