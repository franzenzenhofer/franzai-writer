# Test info

- Name: Poem Workflow - Comprehensive E2E Tests >> Test export content verification
- Location: /Users/franzenzenhofer/dev/franzai-writer/worktree-firestore-nested-fix/tests/e2e/poem-workflow-comprehensive.spec.ts:151:7

# Error details

```
Error: locator.textContent: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('h3:has-text("Poem Title") + *').first()

    at /Users/franzenzenhofer/dev/franzai-writer/worktree-firestore-nested-fix/tests/e2e/poem-workflow-comprehensive.spec.ts:165:83
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
  - 'heading "The Sentinel of Sanity: Export Verification" [level=1]'
  - text: Last saved 20 Jun 2025 23:54 |
  - paragraph: "Workflow: Poem Generator"
  - text: Progress 2 / 8 Stages
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
  - text: "Poem Title The Sentinel of Sanity: Export Verification Poem Content The database hums, a digital hive, Creating data, where values thrive. An export command, a coded plea, To share this knowledge, for all to see. But freedom's path is fraught with risk, Corrupted bytes, a subtle whisk Of chaos lurking, errors untold, A broken promise, data grown cold. So tests are born, the sentinels stand, Verifying content, grain by grain, in hand. Each record checked, each field compared, Integrity assured, a future declared. No silent failures, no data skewed, Just clarity found, in every view. The export verified, the process complete, A trusted transfer, bittersweet."
  - button:
    - img
  - textbox "Optional notes for AI regeneration..."
  - button "AI REDO":
    - img
    - text: AI REDO
  - button "Edit":
    - img
    - text: Edit
  - text: Image Customization Optional Customize how your poem should be illustrated
  - button:
    - img
  - text: Additional Image Instructions (Optional)
  - textbox "Additional Image Instructions (Optional)"
  - paragraph
  - text: Image Format
  - combobox: Portrait (3:4) - Book Cover
  - text: Artistic Style
  - combobox: Artistic & Creative
  - text: Number of Variations
  - combobox: 2 Images
  - button "Continue":
    - img
    - text: Continue
  - img
  - text: "Waiting for: Image Customization Create Image Prompt AI will create optimized imagen prompts and unique filenames for your poem illustrations."
  - button:
    - img
  - img
  - text: "Waiting for: Create Image Prompt Generate Poem Illustration AI will create an image that complements your poem."
  - button:
    - img
  - text: HTML Briefing Optional Special instructions for HTML formatting (optional)
  - button:
    - img
  - textbox "Special instructions for HTML formatting (optional)"
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
   65 |     await expect(markdown).toBeVisible();
   66 |     
   67 |     console.log('✅ All export formats generated successfully');
   68 |     
   69 |     // Verify workflow completion
   70 |     const completedText = page.locator('text=8/8');
   71 |     await expect(completedText).toBeVisible();
   72 |     console.log('✅ Workflow completed (8/8 stages)');
   73 |   });
   74 |
   75 |   test('Test different image format variations', async ({ page }) => {
   76 |     console.log('🧪 Testing different image formats...');
   77 |     
   78 |     // Start workflow
   79 |     await page.click('a[href*="poem-generator"]');
   80 |     await page.click('a:has-text("Start Poem Generator")');
   81 |     await page.waitForSelector('textarea');
   82 |     
   83 |     // Quick poem topic
   84 |     await page.fill('textarea', 'Modern city skyline at night');
   85 |     await page.click('button:has-text("Continue")');
   86 |     await page.waitForSelector('text=Poem Title', { timeout: 30000 });
   87 |     
   88 |     // Test different image formats
   89 |     const imageFormats = [
   90 |       'Square (1:1) - Social Media',
   91 |       'Landscape (4:3) - Classic', 
   92 |       'Widescreen (16:9) - Desktop',
   93 |       'Mobile (9:16) - Stories'
   94 |     ];
   95 |     
   96 |     for (const format of imageFormats) {
   97 |       console.log(`Testing image format: ${format}`);
   98 |       
   99 |       // Select the format
  100 |       await page.selectOption('select:has-option:text("Image Format")', { label: format });
  101 |       
  102 |       // Continue with image generation
  103 |       await page.click('div:has-text("Image Customization") button:has-text("Continue")');
  104 |       
  105 |       // Wait for image generation
  106 |       await page.waitForSelector('text=Download', { timeout: 60000 });
  107 |       console.log(`✅ ${format} format generated successfully`);
  108 |       
  109 |       // Reset for next test (go back to image customization)
  110 |       if (imageFormats.indexOf(format) < imageFormats.length - 1) {
  111 |         await page.click('div:has-text("Image Customization") button:has-text("Edit")');
  112 |       }
  113 |     }
  114 |   });
  115 |
  116 |   test('Test different artistic styles', async ({ page }) => {
  117 |     console.log('🧪 Testing different artistic styles...');
  118 |     
  119 |     // Start workflow
  120 |     await page.click('a[href*="poem-generator"]');
  121 |     await page.click('a:has-text("Start Poem Generator")');
  122 |     await page.waitForSelector('textarea');
  123 |     
  124 |     await page.fill('textarea', 'Abstract geometric patterns');
  125 |     await page.click('button:has-text("Continue")');
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
  140 |       await page.selectOption('select:has-option:text("Artistic Style")', { label: style });
  141 |       await page.click('div:has-text("Image Customization") button:has-text("Continue")');
  142 |       await page.waitForSelector('text=Download', { timeout: 60000 });
  143 |       console.log(`✅ ${style} style generated successfully`);
  144 |       
  145 |       if (artisticStyles.indexOf(style) < artisticStyles.length - 1) {
  146 |         await page.click('div:has-text("Image Customization") button:has-text("Edit")');
  147 |       }
  148 |     }
  149 |   });
  150 |
  151 |   test('Test export content verification', async ({ page }) => {
  152 |     console.log('🧪 Testing export content verification...');
  153 |     
  154 |     // Complete a basic workflow first
  155 |     await page.click('a[href*="poem-generator"]');
  156 |     await page.click('a:has-text("Start Poem Generator")');
  157 |     await page.waitForSelector('textarea');
  158 |     
  159 |     const testTopic = 'Testing export content verification';
  160 |     await page.fill('textarea', testTopic);
  161 |     await page.click('button:has-text("Continue")');
  162 |     await page.waitForSelector('text=Poem Title', { timeout: 30000 });
  163 |     
  164 |     // Get poem details for verification
> 165 |     const poemTitle = await page.locator('h3:has-text("Poem Title") + *').first().textContent();
      |                                                                                   ^ Error: locator.textContent: Test timeout of 30000ms exceeded.
  166 |     
  167 |     // Continue to export
  168 |     await page.click('div:has-text("Image Customization") button:has-text("Continue")');
  169 |     await page.waitForSelector('text=Download', { timeout: 60000 });
  170 |     await page.click('div:has-text("HTML Briefing") button:has-text("Continue")');
  171 |     await page.waitForSelector('text=Export & Publish Poem', { timeout: 30000 });
  172 |     await page.click('button:has-text("Export & Publish Poem")');
  173 |     await page.waitForSelector('text=Styled HTML', { timeout: 30000 });
  174 |     
  175 |     // Test copy functionality for each export format
  176 |     const formats = ['Styled HTML', 'Clean HTML', 'Markdown'];
  177 |     
  178 |     for (const format of formats) {
  179 |       console.log(`Testing ${format} export...`);
  180 |       
  181 |       // Click copy button for this format
  182 |       const copyButton = page.locator(`div:has-text("${format}") button:has-text("Copy")`);
  183 |       await copyButton.click();
  184 |       
  185 |       // Verify copy success (look for success message or similar)
  186 |       // Note: Actual clipboard testing requires special permissions
  187 |       console.log(`✅ ${format} copy button clicked successfully`);
  188 |     }
  189 |     
  190 |     // Test download functionality
  191 |     for (const format of ['PDF Document', 'Word Document']) {
  192 |       console.log(`Testing ${format} download...`);
  193 |       
  194 |       const downloadButton = page.locator(`div:has-text("${format}") button:has-text("Download")`);
  195 |       await downloadButton.click();
  196 |       console.log(`✅ ${format} download initiated`);
  197 |     }
  198 |   });
  199 |
  200 |   test('Test publishing functionality', async ({ page }) => {
  201 |     console.log('🧪 Testing publishing functionality...');
  202 |     
  203 |     // Complete workflow to export stage
  204 |     await page.click('a[href*="poem-generator"]');
  205 |     await page.click('a:has-text("Start Poem Generator")');
  206 |     await page.waitForSelector('textarea');
  207 |     
  208 |     await page.fill('textarea', 'Testing publishing functionality');
  209 |     await page.click('button:has-text("Continue")');
  210 |     await page.waitForSelector('text=Poem Title', { timeout: 30000 });
  211 |     
  212 |     await page.click('div:has-text("Image Customization") button:has-text("Continue")');
  213 |     await page.waitForSelector('text=Download', { timeout: 60000 });
  214 |     await page.click('div:has-text("HTML Briefing") button:has-text("Continue")');
  215 |     await page.waitForSelector('text=Export & Publish Poem', { timeout: 30000 });
  216 |     await page.click('button:has-text("Export & Publish Poem")');
  217 |     await page.waitForSelector('text=Publish Now', { timeout: 30000 });
  218 |     
  219 |     // Test publishing
  220 |     const publishButton = page.locator('button:has-text("Publish Now")');
  221 |     await publishButton.click();
  222 |     
  223 |     // Wait for publish to complete or show result
  224 |     await page.waitForTimeout(5000);
  225 |     
  226 |     console.log('✅ Publishing functionality tested');
  227 |   });
  228 |
  229 |   test('Test document persistence and reload', async ({ page }) => {
  230 |     console.log('🧪 Testing document persistence and reload...');
  231 |     
  232 |     // Start a workflow
  233 |     await page.click('a[href*="poem-generator"]');
  234 |     await page.click('a:has-text("Start Poem Generator")');
  235 |     await page.waitForSelector('textarea');
  236 |     
  237 |     const uniqueTopic = `Persistence test ${Date.now()}`;
  238 |     await page.fill('textarea', uniqueTopic);
  239 |     await page.click('button:has-text("Continue")');
  240 |     await page.waitForSelector('text=Poem Title', { timeout: 30000 });
  241 |     
  242 |     // Get the document title for later verification
  243 |     const documentTitle = await page.locator('h1, h2, [data-testid="document-title"]').first().textContent();
  244 |     
  245 |     // Wait for auto-save
  246 |     await page.waitForSelector('text=Last saved', { timeout: 10000 });
  247 |     console.log('✅ Document auto-saved');
  248 |     
  249 |     // Go back to dashboard
  250 |     await page.click('a:has-text("Dashboard")');
  251 |     await page.waitForLoadState('networkidle');
  252 |     
  253 |     // Verify document appears in recent documents
  254 |     const documentInList = page.locator(`text=${uniqueTopic}`);
  255 |     await expect(documentInList).toBeVisible();
  256 |     console.log('✅ Document appears in dashboard');
  257 |     
  258 |     // Click on the document to reload it
  259 |     await documentInList.click();
  260 |     await page.waitForSelector('textarea');
  261 |     
  262 |     // Verify the content was preserved
  263 |     const reloadedTopic = await page.locator('textarea').inputValue();
  264 |     expect(reloadedTopic).toBe(uniqueTopic);
  265 |     console.log('✅ Document content preserved after reload');
```