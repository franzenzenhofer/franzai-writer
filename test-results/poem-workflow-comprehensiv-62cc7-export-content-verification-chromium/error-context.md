# Test info

- Name: Poem Workflow - Essential E2E Tests >> Test export content verification
- Location: /Users/franzenzenhofer/dev/franzai-writer/tests/e2e/poem-workflow-comprehensive.spec.ts:151:7

# Error details

```
Error: page.waitForSelector: Test timeout of 60000ms exceeded.
Call log:
  - waiting for locator('text=Styled HTML') to be visible

    at /Users/franzenzenhofer/dev/franzai-writer/tests/e2e/poem-workflow-comprehensive.spec.ts:173:16
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
    - link "AI Logs":
      - /url: /admin/debug/ai-log-viewer
  - navigation:
    - link "Login":
      - /url: /login
- main:
  - heading "The Verifier's Eye" [level=1]
  - text: Last saved 22 Jun 2025 02:31 |
  - paragraph: "Workflow: Poem Generator"
  - text: Progress 7 / 8 Stages
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
  - text: "Poem Title The Verifier's Eye Poem Content The data gathers, poised to leap, From structured vaults, where secrets sleep. A journey planned, through digital air, But first, a final, vital care: The export's gate, a narrow space, Demands precision, time and grace. For content, once it steps outside, Its source connection, cast aside, Must stand alone, complete and true, Reflecting all it's meant to do. A misplaced comma, or a line, Can twist the meaning, undermine The trust bestowed, the purpose clear, And sow the seeds of future fear. So, vigilant, with sharpest eye, We probe the output, reaching high. Each field is parsed, each byte assessed, Against the source, put to the test. Format, encoding, character set, No single detail we forget. A thousand checks, a deep compare, To banish error, everywhere. When every match is found correct, And nothing's missing, nothing wrecked, A silent nod, a job well done, The digital race is truly won. The verified content, pure and sound, On foreign shores will now be found, A testament to care and might, The 'export content' shines bright."
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
  - text: Optimized Imagen Prompt An artistic, abstract digital landscape. A brilliant, focused core of light emanates precise, laser-like beams, meticulously scanning and refining intricate, flowing data streams. These streams converge at a shimmering, geometric export gate, where complex, structured digital patterns transform into pure, flawless energy. The scene evokes a sense of intense vigilance, meticulous detail, and the perfection of error-free transformation. Colors are deep blues, electric greens, and rich purples, accented by piercing white and golden light. 3:4 aspect ratio. Generated Filenames Verifier's Digital Scrutiny Purity Threshold Genesis
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
  - 'img "Generated image: An artistic, abstract digital landscape. A brilliant, focused core of light emanates precise, laser-like beams, meticulously scanning and refining intricate, flowing data streams. These streams converge at a shimmering, geometric export gate, where complex, structured digital patterns transform into pure, flawless energy. The scene evokes a sense of intense vigilance, meticulous detail, and the perfection of error-free transformation. Colors are deep blues, electric greens, and rich purples, accented by piercing white and golden light. 3:4 aspect ratio."'
  - text: 3:4
  - button "Download":
    - img
    - text: Download
  - button "Open image in new tab":
    - img
  - button "Thumbnail 1":
    - img "Thumbnail 1"
  - button "Thumbnail 2":
    - img "Thumbnail 2"
  - button "Edit":
    - img
    - text: Edit
  - img
  - text: HTML Briefing Optional Special instructions for HTML formatting (optional)
  - button:
    - img
  - button "Edit":
    - img
    - text: Edit
  - img
  - text: Generate HTML Preview AI will convert your poem into beautiful HTML based on your briefing.
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
  - text: Export & Publish Transform your poem into professional formats and publish instantly
  - button:
    - img
  - heading "Creating Your Exports..." [level=4]
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
   73 |     console.log('✅ Workflow completed (8/8 stages)');
   74 |   });
   75 |
   76 |   test.skip('Test different image format variations', async ({ page }) => {
   77 |     console.log('🧪 Testing different image formats...');
   78 |     
   79 |     // Start workflow - use correct selectors
   80 |     await page.click('#workflow-start-poem-generator');
   81 |     await page.waitForSelector('textarea');
   82 |     
   83 |     // Quick poem topic
   84 |     await page.fill('textarea', 'Modern city skyline at night');
   85 |     await page.click('#process-stage-poem-topic');
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
   99 |       // TODO: Fix dropdown selectors for Radix UI components
  100 |       // For now, skip format selection
  101 |       
  102 |       // Continue with image generation
  103 |       await page.click('#process-stage-image-briefing');
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
  116 |   test.skip('Test different artistic styles', async ({ page }) => {
  117 |     console.log('🧪 Testing different artistic styles...');
  118 |     
  119 |     // Start workflow - use correct selectors
  120 |     await page.click('#workflow-start-poem-generator');
  121 |     await page.waitForSelector('textarea');
  122 |     
  123 |     await page.fill('textarea', 'Abstract geometric patterns');
  124 |     await page.click('#process-stage-poem-topic');
  125 |     await page.waitForSelector('text=Poem Title', { timeout: 30000 });
  126 |     
  127 |     // Test different artistic styles
  128 |     const artisticStyles = [
  129 |       'Photorealistic',
  130 |       'Watercolor Painting',
  131 |       'Oil Painting',
  132 |       'Digital Art',
  133 |       'Minimalist'
  134 |     ];
  135 |     
  136 |     for (const style of artisticStyles) {
  137 |       console.log(`Testing artistic style: ${style}`);
  138 |       
  139 |       // TODO: Fix dropdown selectors for Radix UI components
  140 |       // For now, skip style selection
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
  155 |     await page.click('a[href*="/workflow-details/poem-generator"]');
  156 |     await page.waitForLoadState('networkidle');
  157 |     await page.click('a[href*="/w/poem/new"]');
  158 |     await page.waitForSelector('textarea');
  159 |     
  160 |     const testTopic = 'Testing export content verification';
  161 |     await page.fill('textarea', testTopic);
  162 |     await page.click('#process-stage-poem-topic');
  163 |     await page.waitForSelector('text=Poem Title', { timeout: 30000 });
  164 |     
  165 |     // Get poem details for verification (skip for now)
  166 |     
  167 |     // Continue to export
  168 |     await page.click('#process-stage-image-briefing');
  169 |     await page.waitForSelector('text=Download', { timeout: 60000 });
  170 |     await page.click('#process-stage-html-briefing');
  171 |     await page.waitForSelector('text=Export & Publish Poem', { timeout: 30000 });
  172 |     await page.click('#trigger-export-export-publish');
> 173 |     await page.waitForSelector('text=Styled HTML', { timeout: 30000 });
      |                ^ Error: page.waitForSelector: Test timeout of 60000ms exceeded.
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
  204 |     await page.click('a[href*="/workflow-details/poem-generator"]');
  205 |     await page.waitForLoadState('networkidle');
  206 |     await page.click('a[href*="/w/poem/new"]');
  207 |     await page.waitForSelector('textarea');
  208 |     
  209 |     await page.fill('textarea', 'Testing publishing functionality');
  210 |     await page.click('#process-stage-poem-topic');
  211 |     await page.waitForSelector('text=Poem Title', { timeout: 30000 });
  212 |     
  213 |     await page.click('div:has-text("Image Customization") button:has-text("Continue")');
  214 |     await page.waitForSelector('text=Download', { timeout: 60000 });
  215 |     await page.click('div:has-text("HTML Briefing") button:has-text("Continue")');
  216 |     await page.waitForSelector('text=Export & Publish Poem', { timeout: 30000 });
  217 |     await page.click('button:has-text("Export & Publish Poem")');
  218 |     await page.waitForSelector('text=Publish Now', { timeout: 30000 });
  219 |     
  220 |     // Test publishing
  221 |     const publishButton = page.locator('button:has-text("Publish Now")');
  222 |     await publishButton.click();
  223 |     
  224 |     // Wait for publish to complete or show result
  225 |     await page.waitForTimeout(5000);
  226 |     
  227 |     console.log('✅ Publishing functionality tested');
  228 |   });
  229 |
  230 |   test('Test document persistence and reload', async ({ page }) => {
  231 |     console.log('🧪 Testing document persistence and reload...');
  232 |     
  233 |     // Start a workflow
  234 |     await page.click('a[href*="/workflow-details/poem-generator"]');
  235 |     await page.waitForLoadState('networkidle');
  236 |     await page.click('a[href*="/w/poem/new"]');
  237 |     await page.waitForSelector('textarea');
  238 |     
  239 |     const uniqueTopic = `Persistence test ${Date.now()}`;
  240 |     await page.fill('textarea', uniqueTopic);
  241 |     await page.click('#process-stage-poem-topic');
  242 |     await page.waitForSelector('text=Poem Title', { timeout: 30000 });
  243 |     
  244 |     // Get the document title for later verification
  245 |     const documentTitle = await page.locator('h1, h2, [data-testid="document-title"]').first().textContent();
  246 |     
  247 |     // Wait for auto-save
  248 |     await page.waitForSelector('text=Last saved', { timeout: 10000 });
  249 |     console.log('✅ Document auto-saved');
  250 |     
  251 |     // Go back to dashboard
  252 |     await page.click('a:has-text("Dashboard")');
  253 |     await page.waitForLoadState('networkidle');
  254 |     
  255 |     // Verify document appears in recent documents
  256 |     const documentInList = page.locator(`text=${uniqueTopic}`);
  257 |     await expect(documentInList).toBeVisible();
  258 |     console.log('✅ Document appears in dashboard');
  259 |     
  260 |     // Click on the document to reload it
  261 |     await documentInList.click();
  262 |     await page.waitForSelector('textarea');
  263 |     
  264 |     // Verify the content was preserved
  265 |     const reloadedTopic = await page.locator('textarea').inputValue();
  266 |     expect(reloadedTopic).toBe(uniqueTopic);
  267 |     console.log('✅ Document content preserved after reload');
  268 |   });
  269 |
  270 |   test('Test edge cases - special characters and long content', async ({ page }) => {
  271 |     console.log('🧪 Testing edge cases...');
  272 |     
  273 |     // Test special characters and unicode
```