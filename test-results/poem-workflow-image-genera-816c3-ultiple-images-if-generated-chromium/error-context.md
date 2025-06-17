# Test info

- Name: Poem Workflow with Image Generation >> should show multiple images if generated
- Location: /Users/franzenzenhofer/dev/franzai-writer/tests/e2e/poem-workflow-image-generation.spec.ts:152:7

# Error details

```
Error: locator.selectOption: Error: strict mode violation: locator('select, [role="combobox"]').filter({ hasText: '2 Images' }) resolved to 2 elements:
    1) <button dir="ltr" type="button" role="combobox" data-state="closed" aria-expanded="false" aria-autocomplete="none" aria-controls="radix-«r6»" class="flex h-10 w-full items-center justify-between rounded-md border border-input px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1 bg-background">…</button> aka getByRole('combobox').filter({ hasText: 'Images' })
    2) <select tabindex="-1" aria-hidden="true">…</select> aka locator('div').filter({ hasText: /^Number of Variations2 Images1 Image2 Images3 Images4 Images$/ }).locator('select')

Call log:
  - waiting for locator('select, [role="combobox"]').filter({ hasText: '2 Images' })

    at /Users/franzenzenhofer/dev/franzai-writer/tests/e2e/poem-workflow-image-generation.spec.ts:169:32
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
  - heading "Sapphire Heart, Emerald Soul" [level=1]
  - paragraph: "Workflow: Poem Generator"
  - text: Progress 2 / 7 Stages
  - progressbar
  - text: Last saved 3:48:05 PM
  - img
  - text: Poem Topic What is the topic of your poem?
  - paragraph: The beauty of the ocean
  - button "Edit":
    - img
    - text: Edit
  - img
  - text: Generate Poem & Title AI will generate a poem and title based on your topic. Poem Title Sapphire Heart, Emerald Soul Poem Content A canvas vast, of deepest blue, Where sunlight dances, shimmering through. A restless spirit, wild and free, The ocean's boundless majesty. From coral castles, brightly hued, To kelp forests, solitude imbued. Life teems within, a vibrant grace, A hidden world, in time and space. White horses gallop, on wind-swept crest, Where seabirds circle, put to the test. The rhythmic roar, a constant song, Echoing ages, righting wrong. So breathe it in, this salty air, And let its beauty, banish care. A timeless wonder, strong and deep, The ocean's secrets, it will keep.
  - button:
    - img
  - textbox "Optional notes for AI regeneration..."
  - button "AI REDO":
    - img
    - text: AI REDO
  - button "Edit":
    - img
    - text: Edit
  - text: Image Customization Customize how your poem should be illustrated Additional Image Instructions (Optional)
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
  - text: "Waiting for: Image Customization Generate Poem Illustration AI will create an image that complements your poem. HTML Briefing Optional Special instructions for HTML formatting (optional)"
  - textbox "Special instructions for HTML formatting (optional)"
  - button "Continue":
    - img
    - text: Continue
  - img
  - text: "Waiting for: Generate Poem Illustration Generate HTML Preview AI will convert your poem into beautiful HTML based on your briefing. Export & Publish Transform your poem into professional formats and publish instantly"
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
  - list:
    - status:
      - text: AI Stage Completed AI processing for "Generate Poem & Title" finished.
      - button:
        - img
- alert
- button "Open Next.js Dev Tools":
  - img
- status: Notification AI Stage CompletedAI processing for "Generate Poem & Title" finished.
```

# Test source

```ts
   69 |         timeout: 90000
   70 |       });
   71 |     });
   72 |     
   73 |     // Verify image was generated and displayed
   74 |     const imageElement = await page.locator('[data-testid="stage-card-generate-poem-image"] img').first();
   75 |     await expect(imageElement).toBeVisible();
   76 |     
   77 |     // Get image URL
   78 |     const imageUrl = await imageElement.getAttribute('src');
   79 |     expect(imageUrl).toBeTruthy();
   80 |     
   81 |     // Check if it's a data URL or a public URL
   82 |     const isValidImageUrl = imageUrl?.startsWith('data:image/') || imageUrl?.includes('storage.googleapis.com');
   83 |     expect(isValidImageUrl).toBe(true);
   84 |     
   85 |     // Verify download button exists
   86 |     const downloadButton = page.locator('[data-testid="stage-card-generate-poem-image"] button:has-text("Download")').first();
   87 |     await expect(downloadButton).toBeVisible();
   88 |     
   89 |     // Step 4: Check HTML generation includes the image
   90 |     // Wait for HTML preview to be generated
   91 |     await page.waitForSelector('[data-testid="stage-card-generate-html-preview"]', {
   92 |       timeout: 30000
   93 |     });
   94 |     
   95 |     // Get HTML preview content
   96 |     const htmlPreviewFrame = page.locator('[data-testid="stage-card-generate-html-preview"] iframe').first();
   97 |     
   98 |     // Check if image is included in the HTML
   99 |     if (await htmlPreviewFrame.count() > 0) {
  100 |       // If HTML is in iframe
  101 |       const frame = page.frame({ url: /^data:/ });
  102 |       if (frame) {
  103 |         const htmlImage = frame.locator('img');
  104 |         await expect(htmlImage).toHaveCount(1);
  105 |         const htmlImageSrc = await htmlImage.getAttribute('src');
  106 |         expect(htmlImageSrc).toBe(imageUrl);
  107 |       }
  108 |     } else {
  109 |       // If HTML is rendered directly
  110 |       const htmlContent = await page.locator('[data-testid="stage-card-generate-html-preview"] .prose').innerHTML();
  111 |       expect(htmlContent).toContain('<img');
  112 |       expect(htmlContent).toContain(imageUrl || '');
  113 |     }
  114 |     
  115 |     console.log('✅ Poem with image generation test passed!');
  116 |   });
  117 |
  118 |   test('should handle multiple aspect ratios', async ({ page }) => {
  119 |     // Enter poem topic
  120 |     await page.locator('textarea').first().fill( 'A peaceful forest');
  121 |     await page.locator('#process-stage-poem-topic').click();
  122 |     
  123 |     // Wait for poem generation
  124 |     await page.waitForSelector('text=Poem Title', {
  125 |       timeout: 30000
  126 |     });
  127 |     await page.waitForSelector('text=Poem Content', {
  128 |       timeout: 5000
  129 |     });
  130 |     
  131 |     // Fill image briefing form with different aspect ratio
  132 |     await page.waitForSelector('text=Image Customization', { timeout: 10000 });
  133 |     
  134 |     // Select a different aspect ratio (16:9)
  135 |     const aspectRatioSelect = page.locator('select, [role="combobox"]').filter({ hasText: 'Portrait' });
  136 |     await aspectRatioSelect.selectOption('16:9');
  137 |     
  138 |     await page.locator('#process-stage-image-briefing').click();
  139 |     
  140 |     // Wait for stages to complete
  141 |     await page.waitForSelector('[data-testid="stage-card-generate-poem-image"] [data-testid*="check"]', {
  142 |       timeout: 60000
  143 |     });
  144 |     
  145 |     // Check aspect ratio badge
  146 |     const aspectRatioBadge = page.locator('[data-testid="stage-card-generate-poem-image"] .badge').first();
  147 |     await expect(aspectRatioBadge).toBeVisible();
  148 |     const aspectRatio = await aspectRatioBadge.textContent();
  149 |     expect(['1:1', '3:4', '4:3', '16:9', '9:16']).toContain(aspectRatio);
  150 |   });
  151 |
  152 |   test('should show multiple images if generated', async ({ page }) => {
  153 |     // Enter poem topic
  154 |     await page.locator('textarea').first().fill( 'The beauty of the ocean');
  155 |     await page.locator('#process-stage-poem-topic').click();
  156 |     
  157 |     // Wait for poem generation
  158 |     await page.waitForSelector('text=Poem Title', {
  159 |       timeout: 30000
  160 |     });
  161 |     await page.waitForSelector('text=Poem Content', {
  162 |       timeout: 5000
  163 |     });
  164 |     
  165 |     // Fill image briefing form with 3 images
  166 |     await page.waitForSelector('text=Image Customization', { timeout: 10000 });
  167 |     
  168 |     const numberOfImagesSelect = page.locator('select, [role="combobox"]').filter({ hasText: '2 Images' });
> 169 |     await numberOfImagesSelect.selectOption('3');
      |                                ^ Error: locator.selectOption: Error: strict mode violation: locator('select, [role="combobox"]').filter({ hasText: '2 Images' }) resolved to 2 elements:
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
  269 |     await page.waitForSelector('[data-testid="stage-card-generate-poem-image"] [data-testid*="check"]', {
```