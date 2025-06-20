# Test info

- Name: Press Release Content Extraction >> extract and display full press release content
- Location: /Users/franzenzenhofer/dev/franzai-writer/tests/e2e/press-release-extraction.spec.ts:4:7

# Error details

```
Error: locator.fill: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('input[placeholder="Main headline for the press release"]')

    at /Users/franzenzenhofer/dev/franzai-writer/tests/e2e/press-release-extraction.spec.ts:34:84
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
  - text: Progress 6 / 8 Stages
  - progressbar
  - text: Last saved 10:44:55 AM
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
  - button "Edit":
    - img
    - text: Edit
  - img
  - text: Research company background and industry context
  - button:
    - img
  - img
  - text: Review and edit the key facts for your press release
  - button:
    - img
  - code: "\"Okay, I understand. You want me to process a file named \\\"prompts/key-facts.md\\\" and likely extract or summarize key facts from it.\\n\\nSince I don't have access to your local file system, I need you to provide the content of the \\\"prompts/key-facts.md\\\" file.\\n\\n**Please paste the content of the \\\"prompts/key-facts.md\\\" file here, and I will do my best to extract the key facts from it.**\\n\\nOnce you provide the content, I can help you with:\\n\\n* **Identifying the most important information.**\\n* **Summarizing the key facts in a concise manner.**\\n* **Organizing the facts into a list or other structured format.**\\n* **Answering questions based on the content.**\\n\\nI'm ready when you are!\""
  - button:
    - img
  - button "Edit":
    - img
    - text: Edit
  - button "Accept & Continue":
    - img
    - text: Accept & Continue
  - img
  - text: Provide contact details for media inquiries
  - button:
    - img
  - code: "\"Okay, I understand. This file, `prompts/contact-info.md`, likely contains prompts related to gathering or displaying contact information. It's probably used to guide a language model or AI assistant in tasks like:\\n\\n* **Extracting contact details from text:** \\\"Extract the name, phone number, and email address from the following text: [text]\\\"\\n* **Generating contact information based on a persona:** \\\"Create a fictional contact card for a software engineer named Alice Smith.\\\"\\n* **Updating contact information:** \\\"Update John Doe's phone number to 555-123-4567.\\\"\\n* **Displaying contact information in a specific format:** \\\"Display the following contact information in a vCard format.\\\"\\n* **Asking for contact information:** \\\"Politely ask the user for their name and email address.\\\"\\n* **Confirming contact information:** \\\"Is this contact information correct: [contact info]?\\\"\\n* **Searching for contact information:** \\\"Search the web for the contact information of [person/company].\\\"\\n\\nThe specific content of the file would determine the exact nature of the prompts. If you have the content of the file, I can give you a more precise analysis.\""
  - button:
    - img
  - button "Edit":
    - img
    - text: Edit
  - button "Accept & Continue":
    - img
    - text: Accept & Continue
  - img
  - text: Create the final press release following official standards
  - button:
    - img
  - text: Optional Create a professional image to accompany the press release
  - button:
    - img
  - text: Image Description
  - textbox "Image Description"
  - paragraph
  - text: Image Style
  - combobox: Photorealistic
  - text: Aspect Ratio
  - combobox: 16:9 (Landscape)
  - button "Continue":
    - img
    - text: Continue
  - text: Export your press release in various formats
  - button:
    - img
  - paragraph: Ready to transform your content into professional formats and share it with the world?
  - button "Export & Publish"
  - paragraph: "What you'll get:"
  - list:
    - listitem: Professional HTML (styled & clean)
    - listitem: Markdown for GitHub/Notion
    - listitem: PDF & Word documents (based on clean HTML)
    - listitem: Instant web publishing (HTML & Markdown only)
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
>  34 |     await page.locator('input[placeholder="Main headline for the press release"]').fill(
      |                                                                                    ^ Error: locator.fill: Test timeout of 30000ms exceeded.
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
   63 |     await expect(page.locator('[data-testid="stage-card-key-facts"]')).toHaveClass(/border-green-500/, { 
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
```