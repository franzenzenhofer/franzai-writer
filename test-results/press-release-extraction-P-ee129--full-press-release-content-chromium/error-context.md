# Test info

- Name: Press Release Content Extraction >> extract and display full press release content
- Location: /Users/franzenzenhofer/dev/franzai-writer/tests/e2e/press-release-extraction.spec.ts:4:7

# Error details

```
Error: Timed out 30000ms waiting for expect(locator).toHaveClass(expected)

Locator: locator('[data-testid="stage-card-key-facts"]')
Expected pattern: /border-green-500/
Received string:  "rounded-lg border bg-card text-card-foreground mb-6 transition-all duration-300 border-destructive shadow-accent/30 shadow-xl ring-2 ring-accent"
Call log:
  - expect.toHaveClass with timeout 30000ms
  - waiting for locator('[data-testid="stage-card-key-facts"]')
    33 × locator resolved to <div id="stage-key-facts" data-testid="stage-card-key-facts" class="rounded-lg border bg-card text-card-foreground mb-6 transition-all duration-300 border-destructive shadow-accent/30 shadow-xl ring-2 ring-accent">…</div>
       - unexpected value "rounded-lg border bg-card text-card-foreground mb-6 transition-all duration-300 border-destructive shadow-accent/30 shadow-xl ring-2 ring-accent"

    at /Users/franzenzenhofer/dev/franzai-writer/tests/e2e/press-release-extraction.spec.ts:63:72
```

# Page snapshot

```yaml
- banner:
  - link "FranzAI Writer":
    - /url: /
  - navigation:
    - link "Dashboard":
      - /url: /dashboard
    - link "AI Logs":
      - /url: /debug/ai-log-viewer
  - navigation:
    - link "Login":
      - /url: /login
- main:
  - heading "New Press Release Generator" [level=1]
  - paragraph: "Workflow: Press Release Generator"
  - text: Progress 3 / 8 Stages
  - progressbar
  - text: Last saved 10:56:49 AM
  - img
  - text: Provide the topic, key message, and company name for your press release
  - button:
    - img
  - text: Press Release Topic InnovateTech Solutions Launches Revolutionary AI-Powered Analytics Platform Key Message InnovateTech Solutions today announced the launch of DataSense AI, a groundbreaking analytics platform that leverages advanced machine learning to provide real-time business insights. The platform transforms how companies analyze customer behavior, predict market trends, and make data-driven decisions with unprecedented accuracy and speed. Company Name InnovateTech Solutions Company Website (Optional) https://www.innovatetech.com
  - button:
    - img
  - button "Edit":
    - img
    - text: Edit
  - img
  - text: Analyze company's existing press releases to match their tone and style
  - button:
    - img
  - code: "{ \"tone\": \"Innovative and forward-thinking, confident and authoritative, yet accessible to a broad audience.\", \"style_guidelines\": \"Sentences are generally concise and direct, avoiding overly complex jargon. Active voice is preferred to convey a sense of dynamism and progress. Technical language is used where necessary, but is often explained or contextualized for a non-expert audience. Paragraphs are typically short to medium length, enhancing readability. A focus on quantifiable results and benefits is evident.\", \"key_phrases\": \"AI-powered, revolutionary platform, transformative solutions, cutting-edge technology, data-driven insights, optimized performance, enhanced efficiency, scalable solutions, future-proof, empowering businesses, unlocking potential.\", \"formatting_notes\": \"Quotes are typically introduced with the speaker's full name and title. Bullet points are used to highlight key features or benefits. A standard boilerplate about InnovateTech Solutions is expected at the end. Data and statistics are presented clearly, often with visual aids (if included in a longer document) and are attributed to credible sources (if applicable). The press release follows a standard structure: headline, sub-headline, lead paragraph summarizing the news, supporting details, quote from a company leader, company boilerplate, and media contact information.\" }"
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
  - img
  - text: Research company background and industry context
  - button:
    - img
  - code: "{ \"company_background\": { \"company_history_and_mission\": \"InnovateTech Solutions is a technology company dedicated to developing cutting-edge AI-powered solutions that empower businesses to thrive in the digital age. Founded in [Assume: 2010], InnovateTech's mission is to democratize access to advanced analytics and machine learning, enabling organizations of all sizes to unlock the full potential of their data.\", \"key_products_services\": \"InnovateTech Solutions offers a suite of AI-driven products and services, including predictive analytics, natural language processing, and machine learning consulting. Their core offerings focus on helping businesses optimize operations, enhance customer experiences, and drive revenue growth through data-driven insights. They also offer custom AI solution development.\", \"recent_achievements_or_milestones\": \"Recent achievements include [Assume: a 30% increase in year-over-year revenue growth, securing a major contract with a Fortune 500 company in the retail sector, and being recognized as a 'Top AI Innovator' by a leading industry publication].\", \"company_size_and_locations\": \"InnovateTech Solutions employs approximately [Assume: 250] professionals across its offices in [Assume: San Francisco, CA and New York, NY].\" }, \"industry_context\": { \"current_industry_trends_relevant_to_the_announcement\": \"The analytics market is experiencing rapid growth, driven by the increasing volume and complexity of data. Key trends include the adoption of AI and machine learning for advanced analytics, the demand for real-time insights, and the shift towards cloud-based analytics platforms. Businesses are increasingly seeking solutions that can help them personalize customer experiences, optimize supply chains, and improve decision-making.\", \"market_size_and_growth_projections\": \"The global analytics market is projected to reach [Assume: $100 billion] by [Assume: 2025], growing at a CAGR of [Assume: 15%] from [Assume: 2020 to 2025]. This growth is fueled by the increasing adoption of big data analytics, cloud computing, and AI technologies.\", \"key_challenges_or_opportunities_in_the_sector\": \"Key challenges include the shortage of skilled data scientists, the complexity of integrating data from disparate sources, and the need for robust data governance and security. Opportunities lie in developing user-friendly analytics platforms that can be easily adopted by non-technical users, providing industry-specific solutions, and leveraging AI to automate data analysis and generate actionable insights.\" }, \"recent_developments\": { \"recent_company_news_or_announcements\": \"[Assume: InnovateTech Solutions recently announced a partnership with a leading cloud provider to offer its analytics solutions on their platform. They also released a new version of their predictive analytics tool with enhanced features for fraud detection.]\", \"product_launches_or_updates\": \"Prior to DataSense AI, InnovateTech launched [Assume: InsightEdge, a data visualization tool designed for business users]. DataSense AI represents a significant upgrade in their analytics capabilities, incorporating advanced machine learning algorithms for real-time insights.\", \"strategic_initiatives_or_partnerships\": \"InnovateTech has been actively pursuing strategic partnerships to expand its reach and enhance its product offerings. [Assume: They recently partnered with a consulting firm specializing in the healthcare industry to deliver tailored analytics solutions.]\", \"any_relevant_context_for_this_announcement\": \"The launch of DataSense AI aligns with InnovateTech's strategy to become a leader in the AI-powered analytics market. This platform is designed to address the growing demand for real-time, actionable insights that can drive business growth and competitive advantage.\" }, \"competitive_landscape\": { \"main_competitors_in_this_space\": \"Key competitors in the AI-powered analytics market include [Assume: IBM, Microsoft, SAS, Tableau (Salesforce), and smaller, specialized AI analytics companies like DataRobot and H2O.ai].\", \"how_this_announcement_positions_the_company\": \"The launch of DataSense AI positions InnovateTech Solutions as a strong contender in the AI-powered analytics market, demonstrating its commitment to innovation and its ability to deliver cutting-edge solutions that meet the evolving needs of businesses.\", \"unique_value_propositions\": \"DataSense AI offers a unique combination of real-time data processing, advanced machine learning algorithms, and a user-friendly interface. It is designed to be accessible to both technical and non-technical users, enabling organizations to democratize access to data-driven insights. [Assume: A key differentiator is its focus on explainable AI, providing users with clear and understandable explanations of the insights generated by the platform.]\", \"market_differentiation\": \"InnovateTech differentiates itself through its focus on [Assume: industry-specific solutions, its commitment to customer success, and its ability to deliver customized AI solutions that meet the unique needs of each client. DataSense AI's real-time capabilities and explainable AI features further distinguish it from competing platforms.]\" } }"
  - button:
    - img
  - textbox "Optional notes for AI regeneration..."
  - button "AI REDO":
    - img
    - text: AI REDO
  - button "Edit":
    - img
    - text: Edit
  - img
  - text: Review and edit the key facts for your press release
  - button:
    - img
  - text: Headline
  - textbox "Headline": "InnovateTech Solutions Unveils DataSense AI: Revolutionary Analytics Platform That Transforms Business Intelligence"
  - paragraph
  - text: Subheadline
  - textbox "Subheadline": New AI-powered platform delivers real-time insights with 95% prediction accuracy, empowering businesses to make smarter decisions faster
  - paragraph
  - text: Key Points
  - textbox "Key Points": • Launches DataSense AI, an advanced analytics platform using cutting-edge machine learning • Achieves 95% accuracy in predicting customer behavior and market trends • Reduces data analysis time by 80% compared to traditional methods • Features intuitive dashboard with real-time visualization capabilities • Includes automated reporting and custom alert systems • Offers seamless integration with existing business intelligence tools
  - paragraph
  - text: Quotes
  - textbox "Quotes": "\"DataSense AI represents a quantum leap in business analytics,\" said Michael Chen, CEO of InnovateTech Solutions. \"We're not just providing data; we're delivering actionable intelligence that drives real business outcomes. Our platform democratizes AI-powered analytics, making it accessible to businesses of all sizes.\" \"In beta testing, our clients saw an average 40% improvement in decision-making speed and a 25% increase in revenue within the first quarter,\" added Dr. Sarah Martinez, Chief Technology Officer. \"The platform's predictive capabilities are helping businesses stay ahead of market changes and customer needs.\""
  - paragraph
  - text: Statistics & Data
  - textbox "Statistics & Data": • 95% prediction accuracy for customer behavior analysis • 80% reduction in data processing time • 40% faster decision-making reported by beta users • 25% average revenue increase in first quarter of use • Processes over 1 million data points per second • Supports 50+ data source integrations
  - paragraph
  - img
  - paragraph: AI Stage Error
  - paragraph: "Template validation failed: Template validation failed: Required variables not found: {{headline}}, {{subheadline}}, {{key_points}}, {{quotes}}, {{statistics}}. Available context: basic-info, tone-briefing, research, key-facts"
  - button "Copy error details":
    - img
  - button "Run AI":
    - img
    - text: Run AI
  - img
  - text: "Waiting for: key-facts Provide contact details for media inquiries"
  - button:
    - img
  - text: Contact Name
  - textbox "Contact Name"
  - paragraph
  - text: Contact Title
  - textbox "Contact Title"
  - paragraph
  - text: Contact Email
  - textbox "Contact Email"
  - paragraph
  - text: Contact Phone
  - textbox "Contact Phone"
  - paragraph
  - text: Additional Contacts (Optional)
  - textbox "Additional Contacts (Optional)"
  - paragraph
  - img
  - text: "Waiting for: key-facts, contact-info Create the final press release following official standards"
  - button:
    - img
  - img
  - text: "Waiting for: final-press-release Optional Create a professional image to accompany the press release"
  - button:
    - img
  - text: Image Description
  - textbox "Image Description"
  - paragraph
  - text: Image Style
  - combobox: Photorealistic
  - text: Aspect Ratio
  - combobox: 16:9 (Landscape)
  - text: Export your press release in various formats
  - button:
    - img
  - img
  - text: "Waiting for: final-press-release"
- contentinfo:
  - paragraph: © 2025 Franz AI Writer. All rights reserved.
  - paragraph:
    - text: Made with
    - img
    - text: using AI-powered workflows
  - link "Privacy":
    - /url: /privacy
  - link "Terms":
    - /url: /terms
  - link "GitHub":
    - /url: https://github.com/your-repo/franz-ai-writer
    - img
    - text: GitHub
- region "Notifications (F8)":
  - list
- alert
- button "Open Next.js Dev Tools":
  - img
- button "Open issues overlay": 2 Issue
- button "Collapse issues badge":
  - img
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 |
   3 | test.describe('Press Release Content Extraction', () => {
   4 |   test('extract and display full press release content', async ({ page }) => {
   5 |     console.log('Starting press release content extraction');
   6 |     
   7 |     // Navigate to the workflow
   8 |     await page.goto('/w/press-release/new');
   9 |     await page.waitForLoadState('networkidle');
   10 |     
   11 |     // Fill basic information with real data
   12 |     await page.locator('input[placeholder*="New Product Launch"]').fill('InnovateTech Solutions Launches Revolutionary AI-Powered Analytics Platform');
   13 |     await page.locator('textarea[placeholder*="We\'re launching"]').fill(
   14 |       'InnovateTech Solutions today announced the launch of DataSense AI, a groundbreaking analytics platform that leverages advanced machine learning to provide real-time business insights. The platform transforms how companies analyze customer behavior, predict market trends, and make data-driven decisions with unprecedented accuracy and speed.'
   15 |     );
   16 |     await page.locator('input[placeholder*="TechCorp Inc."]').fill('InnovateTech Solutions');
   17 |     await page.locator('input[placeholder*="https://example.com"]').fill('https://www.innovatetech.com');
   18 |     
   19 |     await page.click('#process-stage-basic-info');
   20 |     await expect(page.locator('[data-testid="stage-card-basic-info"]')).toHaveClass(/border-green-500/, { 
   21 |       timeout: 30000 
   22 |     });
   23 |     
   24 |     // Wait for all auto-run stages
   25 |     console.log('Waiting for auto-run stages to complete...');
   26 |     await expect(page.locator('[data-testid="stage-card-tone-briefing"]')).toHaveClass(/border-green-500/, { 
   27 |       timeout: 60000 
   28 |     });
   29 |     await expect(page.locator('[data-testid="stage-card-research"]')).toHaveClass(/border-green-500/, { 
   30 |       timeout: 90000 
   31 |     });
   32 |     
   33 |     // Fill key facts
   34 |     await page.locator('input[placeholder="Main headline for the press release"]').fill(
   35 |       'InnovateTech Solutions Unveils DataSense AI: Revolutionary Analytics Platform That Transforms Business Intelligence'
   36 |     );
   37 |     await page.locator('input[placeholder="Supporting subheadline (optional)"]').fill(
   38 |       'New AI-powered platform delivers real-time insights with 95% prediction accuracy, empowering businesses to make smarter decisions faster'
   39 |     );
   40 |     await page.locator('textarea[placeholder="Main points to include (one per line)"]').fill(
   41 |       `• Launches DataSense AI, an advanced analytics platform using cutting-edge machine learning
   42 | • Achieves 95% accuracy in predicting customer behavior and market trends
   43 | • Reduces data analysis time by 80% compared to traditional methods
   44 | • Features intuitive dashboard with real-time visualization capabilities
   45 | • Includes automated reporting and custom alert systems
   46 | • Offers seamless integration with existing business intelligence tools`
   47 |     );
   48 |     await page.locator('textarea[placeholder*="This launch represents"]').fill(
   49 |       `"DataSense AI represents a quantum leap in business analytics," said Michael Chen, CEO of InnovateTech Solutions. "We're not just providing data; we're delivering actionable intelligence that drives real business outcomes. Our platform democratizes AI-powered analytics, making it accessible to businesses of all sizes."
   50 |
   51 | "In beta testing, our clients saw an average 40% improvement in decision-making speed and a 25% increase in revenue within the first quarter," added Dr. Sarah Martinez, Chief Technology Officer. "The platform's predictive capabilities are helping businesses stay ahead of market changes and customer needs."`
   52 |     );
   53 |     await page.locator('textarea[placeholder="Important numbers, statistics, or data points"]').fill(
   54 |       `• 95% prediction accuracy for customer behavior analysis
   55 | • 80% reduction in data processing time
   56 | • 40% faster decision-making reported by beta users
   57 | • 25% average revenue increase in first quarter of use
   58 | • Processes over 1 million data points per second
   59 | • Supports 50+ data source integrations`
   60 |     );
   61 |     
   62 |     await page.click('#process-stage-key-facts');
>  63 |     await expect(page.locator('[data-testid="stage-card-key-facts"]')).toHaveClass(/border-green-500/, { 
      |                                                                        ^ Error: Timed out 30000ms waiting for expect(locator).toHaveClass(expected)
   64 |       timeout: 30000 
   65 |     });
   66 |     
   67 |     // Fill contact information
   68 |     await page.locator('input[placeholder*="Jane Smith"]').fill('Jennifer Thompson');
   69 |     await page.locator('input[placeholder*="Director of Communications"]').fill('Vice President of Communications');
   70 |     await page.locator('input[placeholder*="press@company.com"]').fill('press@innovatetech.com');
   71 |     await page.locator('input[placeholder*="+1 (555)"]').fill('+1 (555) 123-4567');
   72 |     await page.locator('textarea[placeholder="Secondary contacts or PR agency details"]').fill(
   73 |       `PR Agency Contact:
   74 | TechPR Partners
   75 | Maria Rodriguez
   76 | mrodriguez@techpr.com
   77 | +1 (555) 987-6543`
   78 |     );
   79 |     
   80 |     await page.click('#process-stage-contact-info');
   81 |     await expect(page.locator('[data-testid="stage-card-contact-info"]')).toHaveClass(/border-green-500/, { 
   82 |       timeout: 30000 
   83 |     });
   84 |     
   85 |     // Wait for final press release
   86 |     console.log('Waiting for final press release generation...');
   87 |     await expect(page.locator('[data-testid="stage-card-final-press-release"]')).toHaveClass(/border-green-500/, { 
   88 |       timeout: 120000 
   89 |     });
   90 |     
   91 |     // Wait a bit more to ensure rendering is complete
   92 |     await page.waitForTimeout(2000);
   93 |     
   94 |     // Check for any error messages
   95 |     const errorToast = await page.locator('[role="alert"]').textContent().catch(() => null);
   96 |     if (errorToast) {
   97 |       console.log('ERROR TOAST:', errorToast);
   98 |     }
   99 |     
  100 |     // Extract the press release content
  101 |     console.log('\n=== ATTEMPTING TO EXTRACT PRESS RELEASE CONTENT ===\n');
  102 |     
  103 |     // First, check if there's an error message in the stage
  104 |     const stageError = await page.locator('[data-testid="stage-card-final-press-release"] .text-destructive, [data-testid="stage-card-final-press-release"] .text-red-500').textContent().catch(() => null);
  105 |     if (stageError) {
  106 |       console.log('STAGE ERROR:', stageError);
  107 |     }
  108 |     
  109 |     // Try different selectors to find the content
  110 |     const possibleSelectors = [
  111 |       '[data-testid="stage-card-final-press-release"] .prose',
  112 |       '[data-testid="stage-card-final-press-release"] [data-testid="markdown-content"]',
  113 |       '[data-testid="stage-card-final-press-release"] .markdown',
  114 |       '[data-testid="stage-card-final-press-release"] pre',
  115 |       '[data-testid="stage-card-final-press-release"] .whitespace-pre-wrap',
  116 |       '[data-testid="stage-card-final-press-release"] [class*="output"]',
  117 |       '[data-testid="stage-card-final-press-release"] [class*="content"]',
  118 |       '[data-testid="stage-card-final-press-release"] p'
  119 |     ];
  120 |     
  121 |     let pressReleaseContent = null;
  122 |     for (const selector of possibleSelectors) {
  123 |       try {
  124 |         const element = await page.locator(selector).first();
  125 |         if (await element.isVisible({ timeout: 5000 })) {
  126 |           pressReleaseContent = await element.textContent();
  127 |           if (pressReleaseContent && pressReleaseContent.length > 100) {
  128 |             console.log(`Found content using selector: ${selector}`);
  129 |             break;
  130 |           }
  131 |         }
  132 |       } catch (e) {
  133 |         // Try next selector
  134 |       }
  135 |     }
  136 |     
  137 |     // If still not found, try to get all text from the stage card
  138 |     if (!pressReleaseContent || pressReleaseContent.length < 100) {
  139 |       const stageCard = page.locator('[data-testid="stage-card-final-press-release"]');
  140 |       pressReleaseContent = await stageCard.textContent();
  141 |     }
  142 |     
  143 |     // Print the press release
  144 |     console.log('\n=== FULL PRESS RELEASE CONTENT ===\n');
  145 |     console.log(pressReleaseContent);
  146 |     console.log('\n=== END OF PRESS RELEASE ===\n');
  147 |     
  148 |     // Take a focused screenshot of just the press release stage
  149 |     const finalStage = page.locator('[data-testid="stage-card-final-press-release"]');
  150 |     await finalStage.screenshot({ path: 'final-press-release-stage.png' });
  151 |     
  152 |     // Also take a full page screenshot
  153 |     await page.screenshot({ path: 'full-workflow-completed.png', fullPage: true });
  154 |     
  155 |     console.log('Screenshots saved: final-press-release-stage.png and full-workflow-completed.png');
  156 |   });
  157 | });
```