# Test info

- Name: Poem Workflow with Image Generation >> should export poem with image to multiple formats
- Location: /Users/franzenzenhofer/dev/franzai-writer/tests/e2e/poem-workflow-image-generation.spec.ts:250:7

# Error details

```
Error: page.waitForSelector: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('[data-testid="stage-card-generate-poem-image"] [data-testid*="check"]') to be visible

    at /Users/franzenzenhofer/dev/franzai-writer/tests/e2e/poem-workflow-image-generation.spec.ts:269:16
```

# Page snapshot

```yaml
- banner:
  - link "FranzAI Writer":
    - /url: /
  - navigation:
    - link "Dashboard":
      - /url: /dashboard
  - navigation:
    - link "Login":
      - /url: /login
- main:
  - heading "Celestial Tapestry" [level=1]
  - paragraph: "Workflow: Poem Generator"
  - text: Progress 4 / 7 Stages
  - progressbar
  - text: Last saved 3:48:12 PM
  - img
  - text: Save failed
  - img
  - text: Poem Topic What is the topic of your poem?
  - paragraph: The stars above
  - button "Edit":
    - img
    - text: Edit
  - img
  - text: Generate Poem & Title AI will generate a poem and title based on your topic. Poem Title Celestial Tapestry Poem Content A velvet curtain, midnight deep, Embroidered with a diamond keep. The stars above, a silent fire, Igniting dreams, fueling desire. Each tiny spark, a distant sun, A cosmic story, just begun. Across the void, their light descends, A timeless comfort, that transcends. They watch us wander, lost and small, Responding to the universe's call. A million whispers on the breeze, Of ancient secrets, through the trees. So lift your gaze, and let it soar, To realms unseen, forevermore. In stellar dance, a cosmic grace, A timeless wonder, in this place.
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
  - text: "Image Customization Customize how your poem should be illustrated Additional Image Instructions (Optional) ❌ ERROR: AI failed to provide value Image Format Portrait (3:4) - Book Cover Artistic Style Artistic & Creative Number of Variations 2 Images"
  - button "Edit":
    - img
    - text: Edit
  - img
  - text: Generate Poem Illustration AI will create an image that complements your poem.
  - 'img "Generated image: Create a artistic image that captures the essence and mood of this poem: Title: Celestial Tapestry Poem: {{generate-poem-with-title.output.poem}} Create an image that evokes the same emotions and themes as the poem. Make it artistic and visually appealing."'
  - text: 3:4
  - button "Download":
    - img
    - text: Download
  - paragraph: "Prompt: Create a artistic image that captures the essence and mood of this poem: Title: Celestial Tapestry Poem: {{generate-poem-with-title.output.poem}} Create an image that evokes the same emotions and themes as the poem. Make it artistic and visually appealing."
  - paragraph: "Provider: imagen"
  - button "Thumbnail 1":
    - img "Thumbnail 1"
  - button "Thumbnail 2":
    - img "Thumbnail 2"
  - textbox "Optional notes for AI regeneration..."
  - button "AI REDO":
    - img
    - text: AI REDO
  - button "Edit":
    - img
    - text: Edit
  - text: HTML Briefing Optional Special instructions for HTML formatting (optional)
  - textbox "Special instructions for HTML formatting (optional)"
  - button "Continue":
    - img
    - text: Continue
  - text: Generate HTML Preview AI will convert your poem into beautiful HTML based on your briefing.
  - paragraph: This stage runs automatically when dependencies are complete.
  - button "Run AI":
    - img
    - text: Run AI
  - text: Export & Publish Transform your poem into professional formats and publish instantly
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
- button "Open issues overlay": 1 Issue
- button "Collapse issues badge":
  - img
```

# Test source

```ts
  169 |     await numberOfImagesSelect.selectOption('3');
  170 |     
  171 |     await page.locator('#process-stage-image-briefing').click();
  172 |     
  173 |     // Wait for image generation
  174 |     await page.waitForSelector('[data-testid="stage-card-generate-poem-image"] [data-testid*="check"]', {
  175 |       timeout: 60000
  176 |     });
  177 |     
  178 |     // Check if multiple images were generated (Imagen typically returns 2 images)
  179 |     const thumbnails = page.locator('[data-testid="stage-card-generate-poem-image"] button[class*="rounded-lg"][class*="overflow-hidden"]');
  180 |     const thumbnailCount = await thumbnails.count();
  181 |     
  182 |     if (thumbnailCount > 1) {
  183 |       console.log(`Found ${thumbnailCount} images generated`);
  184 |       
  185 |       // Click on second thumbnail
  186 |       await thumbnails.nth(1).click();
  187 |       
  188 |       // Verify main image changed
  189 |       await page.waitForTimeout(500); // Small wait for UI update
  190 |       
  191 |       // Check that clicking thumbnail changes the main image
  192 |       const mainImage = page.locator('[data-testid="stage-card-generate-poem-image"] img[alt*="Generated"]').first();
  193 |       await expect(mainImage).toBeVisible();
  194 |     }
  195 |   });
  196 |
  197 |   test('should handle AI redo for images', async ({ page }) => {
  198 |     // Generate initial poem and image
  199 |     await page.locator('textarea').first().fill( 'A stormy night');
  200 |     await page.locator('#process-stage-poem-topic').click();
  201 |     
  202 |     // Wait for poem generation
  203 |     await page.waitForSelector('text=Poem Title', {
  204 |       timeout: 30000
  205 |     });
  206 |     await page.waitForSelector('text=Poem Content', {
  207 |       timeout: 5000
  208 |     });
  209 |     
  210 |     // Fill image briefing form
  211 |     await page.waitForSelector('text=Image Customization', { timeout: 10000 });
  212 |     
  213 |     await page.locator('#process-stage-image-briefing').click();
  214 |     
  215 |     // Wait for image generation
  216 |     await page.waitForSelector('[data-testid="stage-card-generate-poem-image"] [data-testid*="check"]', {
  217 |       timeout: 60000
  218 |     });
  219 |     
  220 |     // Get initial image URL
  221 |     const initialImage = page.locator('[data-testid="stage-card-generate-poem-image"] img[alt*="Generated"]').first();
  222 |     const initialImageUrl = await initialImage.getAttribute('src');
  223 |     
  224 |     // Click AI Redo button if available
  225 |     const aiRedoButton = page.locator('[data-testid="stage-card-generate-poem-image"] button:has-text("AI Redo")');
  226 |     
  227 |     if (await aiRedoButton.count() > 0) {
  228 |       await aiRedoButton.click();
  229 |       
  230 |       // Add refinement notes
  231 |       const redoTextarea = page.locator('textarea[placeholder*="What would you like to change"]');
  232 |       if (await redoTextarea.count() > 0) {
  233 |         await redoTextarea.fill('Make the image more dramatic with lightning');
  234 |       }
  235 |       
  236 |       // Submit redo
  237 |       await page.locator('button:has-text("Regenerate")').click();
  238 |       
  239 |       // Wait for new image
  240 |       await page.waitForSelector('[data-testid="stage-card-generate-poem-image"] [data-testid*="check"]', {
  241 |         timeout: 60000
  242 |       });
  243 |       
  244 |       // Verify image changed
  245 |       const newImageUrl = await initialImage.getAttribute('src');
  246 |       expect(newImageUrl).not.toBe(initialImageUrl);
  247 |     }
  248 |   });
  249 |
  250 |   test('should export poem with image to multiple formats', async ({ page }) => {
  251 |     // Quick poem generation
  252 |     await page.locator('textarea').first().fill( 'The stars above');
  253 |     await page.locator('#process-stage-poem-topic').click();
  254 |     
  255 |     // Wait for poem generation
  256 |     await page.waitForSelector('text=Poem Title', {
  257 |       timeout: 30000
  258 |     });
  259 |     await page.waitForSelector('text=Poem Content', {
  260 |       timeout: 5000
  261 |     });
  262 |     
  263 |     // Fill image briefing form
  264 |     await page.waitForSelector('text=Image Customization', { timeout: 10000 });
  265 |     
  266 |     await page.locator('#process-stage-image-briefing').click();
  267 |     
  268 |     // Wait for all stages including export
> 269 |     await page.waitForSelector('[data-testid="stage-card-generate-poem-image"] [data-testid*="check"]', {
      |                ^ Error: page.waitForSelector: Test timeout of 30000ms exceeded.
  270 |       timeout: 60000
  271 |     });
  272 |     
  273 |     await page.waitForSelector('[data-testid="stage-card-generate-html-preview"] [data-testid*="check"]', {
  274 |       timeout: 30000
  275 |     });
  276 |     
  277 |     // Check if export stage exists
  278 |     const exportButton = page.locator('button:has-text("Export & Publish Poem")');
  279 |     if (await exportButton.count() > 0) {
  280 |       await exportButton.click();
  281 |       
  282 |       // Wait for export options to appear
  283 |       await page.waitForSelector('text=Beautiful Poem', { timeout: 10000 });
  284 |       
  285 |       // Verify export formats are available
  286 |       await expect(page.locator('text=Beautiful Poem')).toBeVisible();
  287 |       await expect(page.locator('text=Clean HTML')).toBeVisible();
  288 |       await expect(page.locator('text=Markdown')).toBeVisible();
  289 |       
  290 |       // Click on Beautiful Poem to generate
  291 |       await page.locator('label:has-text("Beautiful Poem")').click();
  292 |       
  293 |       // Wait for generation
  294 |       await page.waitForSelector('text=Ready', { timeout: 30000 });
  295 |       
  296 |       // Could also test download functionality here
  297 |     }
  298 |   });
  299 | });
```