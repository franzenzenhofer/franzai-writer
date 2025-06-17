# Test info

- Name: Poem Workflow with Image Generation >> should handle multiple aspect ratios
- Location: /Users/franzenzenhofer/dev/franzai-writer/tests/e2e/poem-workflow-image-generation.spec.ts:118:7

# Error details

```
Error: locator.selectOption: Error: strict mode violation: locator('select, [role="combobox"]').filter({ hasText: 'Portrait' }) resolved to 2 elements:
    1) <button dir="ltr" type="button" role="combobox" data-state="closed" aria-expanded="false" aria-autocomplete="none" aria-controls="radix-«r2»" class="flex h-10 w-full items-center justify-between rounded-md border border-input px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1 bg-background">…</button> aka getByRole('combobox').filter({ hasText: 'Portrait (3:4) - Book Cover' })
    2) <select tabindex="-1" aria-hidden="true">…</select> aka locator('form div').filter({ hasText: 'Image FormatPortrait (3:4) -' }).locator('select')

Call log:
  - waiting for locator('select, [role="combobox"]').filter({ hasText: 'Portrait' })

    at /Users/franzenzenhofer/dev/franzai-writer/tests/e2e/poem-workflow-image-generation.spec.ts:136:29
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
  - heading "Emerald Sanctuary" [level=1]
  - paragraph: "Workflow: Poem Generator"
  - text: Progress 2 / 7 Stages
  - progressbar
  - text: Last saved 3:48:05 PM
  - img
  - text: Poem Topic What is the topic of your poem?
  - paragraph: A peaceful forest
  - button "Edit":
    - img
    - text: Edit
  - img
  - text: Generate Poem & Title AI will generate a poem and title based on your topic. Poem Title Emerald Sanctuary Poem Content Sun-dappled leaves in gentle sway, A tapestry of emerald hue, Where worries fade and drift away, Beneath the sky of endless blue. A symphony of rustling sound, The whispering wind through branches high, Where peace and quiet can be found, As nature sings a lullaby. The mossy stones, a velvet touch, A silent stream that softly flows, Inviting solace, oh so much, Where weary soul finds sweet repose. And in this haven, calm and deep, A sanctuary for heart and mind, The forest's secrets it will keep, A tranquil treasure to mankind.
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
   36 |     expect(pageText).toContain('Poem Title');
   37 |     expect(pageText).toContain('Poem Content');
   38 |     expect(pageText?.length || 0).toBeGreaterThan(200); // Ensure substantial content
   39 |     
   40 |     // Step 2a: Fill out the image briefing form
   41 |     // Wait for the image customization form to appear
   42 |     await page.waitForSelector('text=Image Customization', { timeout: 10000 });
   43 |     await page.waitForSelector('text=Additional Image Instructions', { timeout: 5000 });
   44 |     
   45 |     // Fill optional text field (find the textarea after "Additional Image Instructions")
   46 |     const additionalInstructionsTextarea = page.locator('textarea').nth(1); // Should be the second textarea after poem topic
   47 |     await additionalInstructionsTextarea.fill('Beautiful mountain scenery');
   48 |     
   49 |     // The form fields should have default values already selected
   50 |     // Aspect ratio: 3:4, Style: Artistic, Number: 2
   51 |     
   52 |     // Click the continue button for the image briefing form using the specific stage ID
   53 |     await page.locator('#process-stage-image-briefing').click();
   54 |     
   55 |     // Step 3: Wait for image generation to complete
   56 |     console.log('Waiting for image generation...');
   57 |     
   58 |     // Wait for the image stage to become visible and show completion
   59 |     await page.waitForSelector('[data-testid="stage-card-generate-poem-image"]', {
   60 |       timeout: 10000
   61 |     });
   62 |     
   63 |     // Wait for the stage to show completed status by looking for a checkmark or success indicator
   64 |     await page.waitForSelector('[data-testid="stage-card-generate-poem-image"] svg[data-testid*="check"]', {
   65 |       timeout: 90000 // Image generation can take longer
   66 |     }).catch(async () => {
   67 |       // Alternative: wait for image output to appear
   68 |       await page.waitForSelector('[data-testid="stage-card-generate-poem-image"] img', {
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
> 136 |     await aspectRatioSelect.selectOption('16:9');
      |                             ^ Error: locator.selectOption: Error: strict mode violation: locator('select, [role="combobox"]').filter({ hasText: 'Portrait' }) resolved to 2 elements:
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
```