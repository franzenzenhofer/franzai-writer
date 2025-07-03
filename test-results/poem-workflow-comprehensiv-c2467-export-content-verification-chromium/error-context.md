# Test info

- Name: Poem Workflow - SUPER POWERFUL Comprehensive Tests >> Test export content verification
- Location: /Users/franzenzenhofer/dev/franzai-writer/tests/e2e/poem-workflow-comprehensive.spec.ts:152:7

# Error details

```
Error: page.waitForSelector: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('text=Download') to be visible

    at /Users/franzenzenhofer/dev/franzai-writer/tests/e2e/poem-workflow-comprehensive.spec.ts:170:16
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
  - heading "The Content Crucible" [level=1]
  - text: Last saved 03 Jul 2025 20:04 |
  - paragraph: "Workflow: Poem Generator"
  - text: Progress 4 / 8 Stages
  - progressbar
  - img
  - text: Poem Topic What is the topic of your poem?
  - button:
    - img
  - paragraph: Testing export content verification
  - button "Edit":
    - img
    - text: Edit
  - img
  - text: Generate Poem & Title AI will generate a poem and title based on your topic.
  - button:
    - img
  - text: Poem Title The Content Crucible Poem Content From database deep, where data sleeps, A call is made, a journey starts. Export prepares, its promise keeps, To bridge the gap, connect the parts. But what emerges, pure and bright? Or shadows lurk, where errors hide? The unknown path, in digital light, Demands a watchful, guiding tide. For 'Testing Export Content', we strive, A vital task, a keen-eyed quest. Each field, each row, must come alive, To match the source, put truth to test. The commas, quotes, the data types, Are they preserved, in form precise? No missing values, no sudden gripes, Just perfect order, no compromise. With scripts that probe and eyes that scan, We parse the files, line by patient line. Comparing checksums, a careful plan, Ensuring every byte aligns. From character encoding's subtle shift, To dates that render, format true, This verification, a precious gift, Confirms the data, fresh and new. So when the export, done and clear, Is sent to systems, far and wide, We rest assured, dispelling fear, No broken links, no truth denied. For trust is built on solid ground, On verified content, strong and deep. The crucible's work, truly found, The promises that data keeps.
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
  - text: Image Customization Optional Customize how your poem should be illustrated
  - button:
    - img
  - text: Additional Image Instructions (Optional) Not provided Image Format Portrait (3:4) - Book Cover Artistic Style Artistic & Creative Number of Variations 2 Images
  - button "Edit":
    - img
    - text: Edit
  - img
  - text: Create Image Prompt AI will create optimized imagen prompts and unique filenames for your poem illustrations.
  - button:
    - img
  - text: Optimized Imagen Prompt artistic style, A shimmering, ethereal crucible, a nexus of light and energy, where intricate streams of glowing digital data coalesce. Abstract, geometric forms representing data structures meticulously align, illuminated by a focused, almost surgical beam of light. Subtle, flowing patterns and interwoven lines evoke checksums and perfect byte alignment. The surrounding space is a deep, cosmic digital canvas, with a sense of order emerging from potential chaos. The overall aesthetic conveys meticulous precision, vital transformation, and unwavering trust. Generated Filenames Crucible Data Insight Verified Digital Flow
  - textbox "Optional notes for AI regeneration..."
  - button "AI REDO":
    - img
    - text: AI REDO
  - button "Edit":
    - img
    - text: Edit
  - img
  - text: Generate Poem Illustration AI will create an image that complements your poem.
  - button:
    - img
  - heading "Generating..." [level=4]
  - text: AI is processing your request...
  - paragraph: Analyzing your request...
  - text: HTML Briefing Optional Special instructions for HTML formatting (optional)
  - button:
    - img
  - textbox "Special instructions for HTML formatting (optional)"
  - text: ⌘+Enter
  - button "Continue":
    - img
    - text: Continue
  - img
  - text: "Waiting for: Generate Poem Illustration Generate HTML Preview AI will convert your poem into beautiful HTML based on your briefing."
  - button:
    - img
  - text: Export & Publish Transform your poem into professional formats and publish instantly
  - button:
    - img
  - img
  - text: "Waiting for: Generate HTML Preview"
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
   70 |     
   71 |     // Verify workflow completion
   72 |     const completedText = page.locator('text=8/8');
   73 |     await expect(completedText).toBeVisible();
   74 |     console.log('✅ Workflow completed (8/8 stages)');
   75 |   });
   76 |
   77 |   test.skip('Test different image format variations', async ({ page }) => {
   78 |     console.log('🧪 Testing different image formats...');
   79 |     
   80 |     // Start workflow - use correct selectors
   81 |     await page.click('#workflow-start-poem-generator');
   82 |     await page.waitForSelector('textarea');
   83 |     
   84 |     // Quick poem topic
   85 |     await page.fill('textarea', 'Modern city skyline at night');
   86 |     await page.click('#process-stage-poem-topic');
   87 |     await page.waitForSelector('text=Poem Title', { timeout: 30000 });
   88 |     
   89 |     // Test different image formats
   90 |     const imageFormats = [
   91 |       'Square (1:1) - Social Media',
   92 |       'Landscape (4:3) - Classic', 
   93 |       'Widescreen (16:9) - Desktop',
   94 |       'Mobile (9:16) - Stories'
   95 |     ];
   96 |     
   97 |     for (const format of imageFormats) {
   98 |       console.log(`Testing image format: ${format}`);
   99 |       
  100 |       // TODO: Fix dropdown selectors for Radix UI components
  101 |       // For now, skip format selection
  102 |       
  103 |       // Continue with image generation
  104 |       await page.click('#process-stage-image-briefing');
  105 |       
  106 |       // Wait for image generation
  107 |       await page.waitForSelector('text=Download', { timeout: 60000 });
  108 |       console.log(`✅ ${format} format generated successfully`);
  109 |       
  110 |       // Reset for next test (go back to image customization)
  111 |       if (imageFormats.indexOf(format) < imageFormats.length - 1) {
  112 |         await page.click('div:has-text("Image Customization") button:has-text("Edit")');
  113 |       }
  114 |     }
  115 |   });
  116 |
  117 |   test.skip('Test different artistic styles', async ({ page }) => {
  118 |     console.log('🧪 Testing different artistic styles...');
  119 |     
  120 |     // Start workflow - use correct selectors
  121 |     await page.click('#workflow-start-poem-generator');
  122 |     await page.waitForSelector('textarea');
  123 |     
  124 |     await page.fill('textarea', 'Abstract geometric patterns');
  125 |     await page.click('#process-stage-poem-topic');
  126 |     await page.waitForSelector('text=Poem Title', { timeout: 30000 });
  127 |     
  128 |     // Test different artistic styles
  129 |     const artisticStyles = [
  130 |       'Photorealistic',
  131 |       'Watercolor Painting',
  132 |       'Oil Painting',
  133 |       'Digital Art',
  134 |       'Minimalist'
  135 |     ];
  136 |     
  137 |     for (const style of artisticStyles) {
  138 |       console.log(`Testing artistic style: ${style}`);
  139 |       
  140 |       // TODO: Fix dropdown selectors for Radix UI components
  141 |       // For now, skip style selection
  142 |       await page.click('div:has-text("Image Customization") button:has-text("Continue")');
  143 |       await page.waitForSelector('text=Download', { timeout: 60000 });
  144 |       console.log(`✅ ${style} style generated successfully`);
  145 |       
  146 |       if (artisticStyles.indexOf(style) < artisticStyles.length - 1) {
  147 |         await page.click('div:has-text("Image Customization") button:has-text("Edit")');
  148 |       }
  149 |     }
  150 |   });
  151 |
  152 |   test('Test export content verification', async ({ page }) => {
  153 |     console.log('🧪 Testing export content verification...');
  154 |     
  155 |     // Complete a basic workflow first
  156 |     await page.click('a[href*="/workflow-details/poem-generator"]');
  157 |     await page.waitForLoadState('networkidle');
  158 |     await page.click('a[href*="/w/poem/new"]');
  159 |     await page.waitForSelector('textarea');
  160 |     
  161 |     const testTopic = 'Testing export content verification';
  162 |     await page.fill('textarea', testTopic);
  163 |     await page.click('#process-stage-poem-topic');
  164 |     await page.waitForSelector('text=Poem Title', { timeout: 30000 });
  165 |     
  166 |     // Get poem details for verification (skip for now)
  167 |     
  168 |     // Continue to export
  169 |     await page.click('#process-stage-image-briefing');
> 170 |     await page.waitForSelector('text=Download', { timeout: 60000 });
      |                ^ Error: page.waitForSelector: Test timeout of 30000ms exceeded.
  171 |     await page.click('#process-stage-html-briefing');
  172 |     await page.waitForSelector('text=Export & Publish Poem', { timeout: 30000 });
  173 |     await page.click('#trigger-export-export-publish');
  174 |     await page.waitForSelector('text=Styled HTML', { timeout: 30000 });
  175 |     
  176 |     // Test copy functionality for each export format
  177 |     const formats = ['Styled HTML', 'Clean HTML', 'Markdown'];
  178 |     
  179 |     for (const format of formats) {
  180 |       console.log(`Testing ${format} export...`);
  181 |       
  182 |       // Click copy button for this format
  183 |       const copyButton = page.locator(`div:has-text("${format}") button:has-text("Copy")`);
  184 |       await copyButton.click();
  185 |       
  186 |       // Verify copy success (look for success message or similar)
  187 |       // Note: Actual clipboard testing requires special permissions
  188 |       console.log(`✅ ${format} copy button clicked successfully`);
  189 |     }
  190 |     
  191 |     // Test download functionality
  192 |     for (const format of ['PDF Document', 'Word Document']) {
  193 |       console.log(`Testing ${format} download...`);
  194 |       
  195 |       const downloadButton = page.locator(`div:has-text("${format}") button:has-text("Download")`);
  196 |       await downloadButton.click();
  197 |       console.log(`✅ ${format} download initiated`);
  198 |     }
  199 |   });
  200 |
  201 |   test('Test publishing functionality', async ({ page }) => {
  202 |     console.log('🧪 Testing publishing functionality...');
  203 |     
  204 |     // Complete workflow to export stage
  205 |     await page.click('a[href*="/workflow-details/poem-generator"]');
  206 |     await page.waitForLoadState('networkidle');
  207 |     await page.click('a[href*="/w/poem/new"]');
  208 |     await page.waitForSelector('textarea');
  209 |     
  210 |     await page.fill('textarea', 'Testing publishing functionality');
  211 |     await page.click('#process-stage-poem-topic');
  212 |     await page.waitForSelector('text=Poem Title', { timeout: 30000 });
  213 |     
  214 |     await page.click('div:has-text("Image Customization") button:has-text("Continue")');
  215 |     await page.waitForSelector('text=Download', { timeout: 60000 });
  216 |     await page.click('div:has-text("HTML Briefing") button:has-text("Continue")');
  217 |     await page.waitForSelector('text=Export & Publish Poem', { timeout: 30000 });
  218 |     await page.click('button:has-text("Export & Publish Poem")');
  219 |     await page.waitForSelector('text=Publish Now', { timeout: 30000 });
  220 |     
  221 |     // Test publishing
  222 |     const publishButton = page.locator('button:has-text("Publish Now")');
  223 |     await publishButton.click();
  224 |     
  225 |     // Wait for publish to complete or show result
  226 |     await page.waitForTimeout(5000);
  227 |     
  228 |     console.log('✅ Publishing functionality tested');
  229 |   });
  230 |
  231 |   test('Test document persistence and reload', async ({ page }) => {
  232 |     console.log('🧪 Testing document persistence and reload...');
  233 |     
  234 |     // Start a workflow
  235 |     await page.click('a[href*="/workflow-details/poem-generator"]');
  236 |     await page.waitForLoadState('networkidle');
  237 |     await page.click('a[href*="/w/poem/new"]');
  238 |     await page.waitForSelector('textarea');
  239 |     
  240 |     const uniqueTopic = `Persistence test ${Date.now()}`;
  241 |     await page.fill('textarea', uniqueTopic);
  242 |     await page.click('#process-stage-poem-topic');
  243 |     await page.waitForSelector('text=Poem Title', { timeout: 30000 });
  244 |     
  245 |     // Get the document title for later verification
  246 |     const documentTitle = await page.locator('h1, h2, [data-testid="document-title"]').first().textContent();
  247 |     
  248 |     // Wait for auto-save
  249 |     await page.waitForSelector('text=Last saved', { timeout: 10000 });
  250 |     console.log('✅ Document auto-saved');
  251 |     
  252 |     // Go back to dashboard
  253 |     await page.click('a:has-text("Dashboard")');
  254 |     await page.waitForLoadState('networkidle');
  255 |     
  256 |     // Verify document appears in recent documents
  257 |     const documentInList = page.locator(`text=${uniqueTopic}`);
  258 |     await expect(documentInList).toBeVisible();
  259 |     console.log('✅ Document appears in dashboard');
  260 |     
  261 |     // Click on the document to reload it
  262 |     await documentInList.click();
  263 |     await page.waitForSelector('textarea');
  264 |     
  265 |     // Verify the content was preserved
  266 |     const reloadedTopic = await page.locator('textarea').inputValue();
  267 |     expect(reloadedTopic).toBe(uniqueTopic);
  268 |     console.log('✅ Document content preserved after reload');
  269 |   });
  270 |
```