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
  - text: Last saved 11:00:54 AM
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
  - code: "{ \"tone\": \"Innovative and forward-thinking, confident and authoritative, yet accessible.\", \"style_guidelines\": \"Sentences are generally concise and direct. Active voice is preferred. Technical language is used, but explained when necessary for a broader audience. Paragraphs are kept relatively short (3-5 sentences) for readability. Emphasis is placed on quantifiable results and future impact.\", \"key_phrases\": \"AI-powered, revolutionary, transformative, cutting-edge, next-generation, data-driven insights, empowers businesses, scalable solutions, future-proof, optimize performance, gain a competitive edge.\", \"formatting_notes\": \"Quotes are typically introduced with the person's title and last name (e.g., 'said John Smith, CEO of InnovateTech Solutions.'). Bullet points are used sparingly, primarily for listing features or benefits. The press release follows a standard structure: headline, sub-headline, introduction, body paragraphs detailing the platform and its benefits, quote from a company executive, concluding paragraph with a call to action (e.g., visit the website), and a boilerplate about InnovateTech Solutions. Data and statistics are presented clearly, often with percentage increases or specific numbers to highlight the platform's impact.\" }"
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
  - code: "\"{\\n \\\"company_background\\\": {\\n \\\"brief_company_history_and_mission\\\": \\\"InnovateTech Solutions is a technology company dedicated to providing cutting-edge AI and data analytics solutions to businesses across various industries. Founded [**Insert Founding Year - Search InnovateTech website or LinkedIn**], InnovateTech's mission is to empower organizations with actionable insights that drive growth, efficiency, and innovation.\\\",\\n \\\"key_products_services\\\": \\\"InnovateTech Solutions offers a suite of AI-powered products and services, including data analytics platforms, machine learning models, predictive analytics tools, and custom AI solutions tailored to specific business needs. They specialize in helping companies unlock the value of their data through advanced analytics and AI.\\\",\\n \\\"recent_achievements_or_milestones\\\": \\\"[**Search InnovateTech website news/press releases, LinkedIn, or Crunchbase for recent achievements. Examples:**] Recent achievements include securing Series B funding of $XX million, expanding its customer base by X% in the last year, and winning the 'Best AI Solution' award at the [Industry Conference Name] conference.\\\",\\n \\\"company_size_and_locations\\\": \\\"[**Search InnovateTech website (About Us or Contact) or LinkedIn for company size and locations. Examples:**] InnovateTech Solutions employs over 200 professionals across offices in [City, State] and [City, State]. They also have a growing presence in [Region/Country].\\\"\\n },\\n \\\"industry_context\\\": {\\n \\\"current_industry_trends_relevant_to_the_announcement\\\": \\\"The data analytics market is experiencing rapid growth driven by the increasing volume and complexity of data, coupled with the need for businesses to gain a competitive edge through data-driven decision-making. Key trends include the adoption of AI and machine learning in analytics, the rise of real-time analytics, the increasing demand for cloud-based analytics solutions, and the growing importance of data privacy and security.\\\",\\n \\\"market_size_and_growth_projections\\\": \\\"The global data analytics market is projected to reach $[**Insert Market Size - Search for recent market research reports from Gartner, IDC, Forrester, etc.**] by [**Insert Year - Same source as market size**], growing at a CAGR of [**Insert CAGR - Same source as market size**] from [**Insert Start Year - Same source as market size**] to [**Insert End Year - Same source as market size**]. The AI in analytics segment is expected to be a major driver of this growth.\\\",\\n \\\"key_challenges_or_opportunities_in_the_sector\\\": \\\"Key challenges in the sector include the shortage of skilled data scientists and AI engineers, the complexity of integrating AI into existing business processes, and the need to address ethical concerns related to AI. Opportunities include the potential to automate decision-making, improve customer experience, optimize operations, and develop new products and services.\\\"\\n },\\n \\\"recent_developments\\\": {\\n \\\"recent_company_news_or_announcements\\\": \\\"[**Search InnovateTech website news/press releases, Google News, or Crunchbase for recent news. Examples:**] InnovateTech Solutions recently announced a partnership with [Partner Company Name] to integrate its AI solutions into their platform. They also launched a new training program to help businesses upskill their workforce in data analytics.\\\",\\n \\\"product_launches_or_updates\\\": \\\"[**Search InnovateTech website news/press releases. Examples:**] Prior to DataSense AI, InnovateTech launched [Previous Product Name], a [description of previous product] aimed at [target audience]. They also released an update to their existing analytics platform, enhancing its data visualization capabilities.\\\",\\n \\\"strategic_initiatives_or_partnerships\\\": \\\"[**Search InnovateTech website news/press releases, Google News, or Crunchbase. Examples:**] InnovateTech has been actively pursuing strategic partnerships with leading cloud providers and data management companies to expand its reach and enhance its offerings. They are also investing in research and development to stay at the forefront of AI innovation.\\\",\\n \\\"any_relevant_context_for_this_announcement\\\": \\\"The launch of DataSense AI builds upon InnovateTech's commitment to providing businesses with the most advanced and accessible AI-powered analytics solutions. This platform represents a significant step forward in their mission to democratize AI and empower organizations of all sizes to leverage the power of data.\\\"\\n },\\n \\\"competitive_landscape\\\": {\\n \\\"main_competitors_in_this_space\\\": \\\"Key competitors in the AI-powered analytics space include [**Search for competitors using keywords like \\\"AI analytics platform,\\\" \\\"data analytics companies,\\\" etc. Examples:**] IBM, Microsoft (Azure Machine Learning), Google (Cloud AI Platform), SAS, Tableau (Salesforce), and smaller, specialized AI analytics vendors.\\\",\\n \\\"how_this_announcement_positions_the_company\\\": \\\"The launch of DataSense AI positions InnovateTech Solutions as a leader in the next generation of AI-powered analytics. By offering a platform that combines advanced machine learning with real-time insights, InnovateTech aims to disrupt the market and provide businesses with a more powerful and accessible alternative to traditional analytics solutions.\\\",\\n \\\"unique_value_propositions\\\": \\\"DataSense AI offers several unique value propositions, including [**Based on the press release message and further research on the platform's features:**] real-time insights, unparalleled accuracy in predictions, ease of use for non-technical users, and a comprehensive suite of tools for analyzing customer behavior and market trends. [**Add specific features mentioned on the InnovateTech website about DataSense AI**]\\\",\\n \\\"market_differentiation\\\": \\\"InnovateTech differentiates itself through its focus on [**Based on the press release message and further research on the platform's features:**] providing actionable insights, its commitment to customer success, and its ability to tailor AI solutions to specific business needs. DataSense AI's [**Mention a specific differentiating feature, e.g., proprietary machine learning algorithm or unique data visualization capabilities**] further sets it apart from the competition.\\\"\\n }\\n}\""
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
  - paragraph: "Template validation failed: Template validation failed: Required variables not found: {{research.output.company_background}}, {{research.output.recent_developments}}, {{research.output.competitive_landscape}}. Available context: basic-info, tone-briefing, research, key-facts"
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