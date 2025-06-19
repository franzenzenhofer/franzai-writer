# Test info

- Name: Export Stage - Comprehensive Testing >> should test error handling and retry functionality
- Location: /Users/franzenzenhofer/dev/franzai-writer/tests/e2e/export-stage-comprehensive.spec.ts:244:7

# Error details

```
Error: expect(locator).toContainText(expected)

Locator: locator('[data-testid="stage-card-generate-poem-with-title"]')
- Expected string  -  1
+ Received string  + 19

- ✅
+ Generate Poem & TitleAI will generate a poem and title based on your topic.Poem TitleThe Silent Crash: A Ballad of Error HandlingPoem ContentThe server hummed, a digital heart,
+ Beating with data, a vital art.
+ Then came the input, a rogue command,
+ A whisper of chaos, across the land.
+
+ No guard was posted, no check in place,
+ To catch the anomaly, erase its trace.
+ The code, unsuspecting, took the bait,
+ And plunged headfirst into error's gate.
+
+ The screen went blank, the logs grew cold,
+ A story untold, a future unsold.
+ No graceful message, no gentle plea,
+ Just silent failure for all to see.
+
+ Oh, heed this warning, programmers all,
+ Before your system begins to fall.
+ Embrace exception, anticipate the worst,
+ Or watch your creation crumble and burst.AI REDOEdit
Call log:
  - expect.toContainText with timeout 60000ms
  - waiting for locator('[data-testid="stage-card-generate-poem-with-title"]')
    6 × locator resolved to <div id="stage-generate-poem-with-title" data-testid="stage-card-generate-poem-with-title" class="rounded-lg border bg-card text-card-foreground mb-6 transition-all duration-300 border-primary shadow-accent/30 shadow-xl ring-2 ring-accent">…</div>
      - unexpected value "Generate Poem & TitleAI will generate a poem and title based on your topic.Generating...AI is processing your request...Analyzing your request..."
    26 × locator resolved to <div id="stage-generate-poem-with-title" data-testid="stage-card-generate-poem-with-title" class="rounded-lg border bg-card text-card-foreground shadow-sm mb-6 transition-all duration-300 border-green-500">…</div>
       - unexpected value "Generate Poem & TitleAI will generate a poem and title based on your topic.Poem TitleThe Silent Crash: A Ballad of Error HandlingPoem ContentThe server hummed, a digital heart,
Beating with data, a vital art.
Then came the input, a rogue command,
A whisper of chaos, across the land.

No guard was posted, no check in place,
To catch the anomaly, erase its trace.
The code, unsuspecting, took the bait,
And plunged headfirst into error's gate.

The screen went blank, the logs grew cold,
A story untold, a future unsold.
No graceful message, no gentle plea,
Just silent failure for all to see.

Oh, heed this warning, programmers all,
Before your system begins to fall.
Embrace exception, anticipate the worst,
Or watch your creation crumble and burst.AI REDOEdit"

    at /Users/franzenzenhofer/dev/franzai-writer/tests/e2e/export-stage-comprehensive.spec.ts:254:87
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
  - 'heading "The Silent Crash: A Ballad of Error Handling" [level=1]'
  - paragraph: "Workflow: Poem Generator"
  - text: Progress 2 / 8 Stages
  - progressbar
  - text: Last saved 9:34:27 PM
  - img
  - text: Poem Topic What is the topic of your poem?
  - button:
    - img
  - paragraph: Test error handling scenario
  - button "Edit":
    - img
    - text: Edit
  - img
  - text: Generate Poem & Title AI will generate a poem and title based on your topic.
  - button:
    - img
  - text: "Poem Title The Silent Crash: A Ballad of Error Handling Poem Content The server hummed, a digital heart, Beating with data, a vital art. Then came the input, a rogue command, A whisper of chaos, across the land. No guard was posted, no check in place, To catch the anomaly, erase its trace. The code, unsuspecting, took the bait, And plunged headfirst into error's gate. The screen went blank, the logs grew cold, A story untold, a future unsold. No graceful message, no gentle plea, Just silent failure for all to see. Oh, heed this warning, programmers all, Before your system begins to fall. Embrace exception, anticipate the worst, Or watch your creation crumble and burst."
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
  154 |     const downloadMarkdown = await downloadPromiseMarkdown;
  155 |     
  156 |     expect(downloadMarkdown.suggestedFilename()).toMatch(/\.md$/);
  157 |     const markdownPath = path.join('./downloads', `content-${Date.now()}.md`);
  158 |     await downloadMarkdown.saveAs(markdownPath);
  159 |     
  160 |     // Verify markdown file
  161 |     const markdownContent = fs.readFileSync(markdownPath, 'utf-8');
  162 |     expect(markdownContent).toContain('#');
  163 |     expect(markdownContent).toContain('magical forest');
  164 |     console.log('✅ Markdown download successful and valid!');
  165 |     
  166 |     // Test PDF download (should show coming soon or work)
  167 |     console.log('Testing PDF download...');
  168 |     const pdfButtons = exportStage.locator('text=PDF');
  169 |     if (await pdfButtons.count() > 0) {
  170 |       const pdfButton = pdfButtons.first();
  171 |       const pdfStatus = await pdfButton.textContent();
  172 |       console.log('PDF status:', pdfStatus);
  173 |       
  174 |       if (pdfStatus?.includes('Ready')) {
  175 |         const downloadPromisePdf = page.waitForEvent('download');
  176 |         await exportStage.locator('button', { hasText: 'Download' }).nth(3).click();
  177 |         const downloadPdf = await downloadPromisePdf;
  178 |         
  179 |         expect(downloadPdf.suggestedFilename()).toMatch(/\.pdf$/);
  180 |         const pdfPath = path.join('./downloads', `content-${Date.now()}.pdf`);
  181 |         await downloadPdf.saveAs(pdfPath);
  182 |         console.log('✅ PDF download successful!');
  183 |       } else {
  184 |         console.log('📋 PDF marked as "Coming soon" - placeholder working correctly');
  185 |       }
  186 |     }
  187 |     
  188 |     // Test DOCX download (should show coming soon or work)
  189 |     console.log('Testing DOCX download...');
  190 |     const docxButtons = exportStage.locator('text=DOCX');
  191 |     if (await docxButtons.count() > 0) {
  192 |       const docxButton = docxButtons.first();
  193 |       const docxStatus = await docxButton.textContent();
  194 |       console.log('DOCX status:', docxStatus);
  195 |       
  196 |       if (docxStatus?.includes('Ready')) {
  197 |         const downloadPromiseDocx = page.waitForEvent('download');
  198 |         await exportStage.locator('button', { hasText: 'Download' }).nth(4).click();
  199 |         const downloadDocx = await downloadPromiseDocx;
  200 |         
  201 |         expect(downloadDocx.suggestedFilename()).toMatch(/\.docx$/);
  202 |         const docxPath = path.join('./downloads', `content-${Date.now()}.docx`);
  203 |         await downloadDocx.saveAs(docxPath);
  204 |         console.log('✅ DOCX download successful!');
  205 |       } else {
  206 |         console.log('📋 DOCX marked as "Coming soon" - placeholder working correctly');
  207 |       }
  208 |     }
  209 |     
  210 |     console.log('✅ All export format downloads tested successfully!');
  211 |   });
  212 |
  213 |   test('should validate export content quality', async () => {
  214 |     // Navigate to the document with completed export
  215 |     await page.goto(`http://localhost:9002/w/poem/${documentId}`);
  216 |     await page.waitForLoadState('networkidle');
  217 |     
  218 |     const exportStage = page.locator('[data-testid="stage-card-export-publish"]');
  219 |     await exportStage.scrollIntoView();
  220 |     
  221 |     // Verify styled iframe content is properly formatted
  222 |     console.log('Validating styled HTML content...');
  223 |     const styledIframe = exportStage.locator('iframe[title*="styled HTML preview"]');
  224 |     await expect(styledIframe).toBeVisible();
  225 |     
  226 |     // Switch to clean view and validate
  227 |     console.log('Validating clean HTML content...');
  228 |     const cleanButton = exportStage.locator('button', { hasText: 'Clean' });
  229 |     await cleanButton.click();
  230 |     
  231 |     const cleanIframe = exportStage.locator('iframe[title*="clean HTML preview"]');
  232 |     await expect(cleanIframe).toBeVisible();
  233 |     
  234 |     // Verify export status indicators
  235 |     const exportDownloads = exportStage.locator('[class*="space-y"]').last();
  236 |     await expect(exportDownloads).toContainText('HTML (Styled)');
  237 |     await expect(exportDownloads).toContainText('HTML (Clean)');
  238 |     await expect(exportDownloads).toContainText('Markdown');
  239 |     await expect(exportDownloads).toContainText('Ready ✓');
  240 |     
  241 |     console.log('✅ Export content quality validation passed!');
  242 |   });
  243 |
  244 |   test('should test error handling and retry functionality', async () => {
  245 |     // Create a new document to test error scenarios
  246 |     await page.goto('http://localhost:9002/w/poem/new');
  247 |     await page.waitForLoadState('networkidle');
  248 |     
  249 |     // Complete poem topic with something that might cause issues
  250 |     await page.fill('textarea', 'Test error handling scenario');
  251 |     await page.click('button:has-text("Continue")');
  252 |     
  253 |     // Wait for completion and try export
> 254 |     await expect(page.locator('[data-testid="stage-card-generate-poem-with-title"]')).toContainText('✅', { timeout: 60000 });
      |                                                                                       ^ Error: expect(locator).toContainText(expected)
  255 |     
  256 |     // Skip HTML briefing
  257 |     await page.click('button:has-text("Continue")');
  258 |     await expect(page.locator('[data-testid="stage-card-generate-html-preview"]')).toContainText('✅', { timeout: 60000 });
  259 |     
  260 |     // Test export stage error handling
  261 |     const exportStage = page.locator('[data-testid="stage-card-export-publish"]');
  262 |     await exportStage.scrollIntoView();
  263 |     
  264 |     const exportButton = exportStage.locator('button', { hasText: 'Generate Export Formats' }).or(
  265 |       exportStage.locator('button', { hasText: 'Retry Export' })
  266 |     );
  267 |     await exportButton.click();
  268 |     
  269 |     // If error occurs, test retry functionality
  270 |     const retryButton = exportStage.locator('button', { hasText: 'Retry Export' });
  271 |     if (await retryButton.isVisible({ timeout: 5000 })) {
  272 |       console.log('Testing retry functionality...');
  273 |       await retryButton.click();
  274 |       
  275 |       // Wait for retry to complete
  276 |       await expect(exportStage).toContainText('✅', { timeout: 120000 });
  277 |       console.log('✅ Retry functionality working!');
  278 |     } else {
  279 |       console.log('✅ Export completed without errors!');
  280 |     }
  281 |   });
  282 | });
```