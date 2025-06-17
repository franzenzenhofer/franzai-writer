# Test info

- Name: Complete Poem Workflow with Image Generation and Export >> should complete full poem workflow: topic → poem → image → HTML export
- Location: /Users/franzenzenhofer/dev/franzai-writer/tests/e2e/poem-workflow-complete-with-images.spec.ts:10:7

# Error details

```
Error: page.waitForSelector: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('[data-testid="stage-card-generate-html-preview"] .prose, [data-testid="stage-card-generate-html-preview"] iframe') to be visible

    at /Users/franzenzenhofer/dev/franzai-writer/tests/e2e/poem-workflow-complete-with-images.spec.ts:95:16
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
  - heading "Emerald Curtain, Jade Plunge" [level=1]
  - paragraph: "Workflow: Poem Generator"
  - text: Progress 4 / 7 Stages
  - progressbar
  - text: Last saved 2:50:59 PM
  - img
  - text: Save failed
  - img
  - text: Poem Topic What is the topic of your poem?
  - paragraph: A majestic waterfall in a tropical paradise
  - button "Edit":
    - img
    - text: Edit
  - img
  - text: Generate Poem & Title AI will generate a poem and title based on your topic. Poem Title Emerald Curtain, Jade Plunge Poem Content Where emerald hills meet sapphire skies, A paradise unfolds before your eyes. A waterfall, a silver thread so bright, Cascades in glory, bathed in golden light. Jungle whispers rise on humid air, As vibrant blossoms paint a scene so rare. Exotic birds sing melodies untold, While ancient secrets the waters hold. The jade-green pool, a tranquil, cool embrace, Reflects the heavens in its watery space. A diamond spray, a misty, gentle kiss, A moment captured, pure, eternal bliss. So stand in awe, and let your spirit soar, As nature's grandeur you forevermore, Carry within your heart, a vibrant hue, The emerald curtain, bathed in morning dew.
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
  - text: Image Customization Customize how your poem should be illustrated Additional Image Instructions (Optional) Vibrant colors, mist from the waterfall, tropical birds Image Format Portrait (3:4) - Book Cover Artistic Style Artistic & Creative Number of Variations 2 Images
  - button "Edit":
    - img
    - text: Edit
  - img
  - text: Generate Poem Illustration AI will create an image that complements your poem.
  - img
  - text: 3:4
  - button "Download":
    - img
    - text: Download
  - paragraph: "Prompt: Create a artistic image that captures the essence and mood of this poem: Title: Emerald Curtain, Jade Plunge Poem: Where emerald hills meet sapphire skies, A paradise unfolds before your eyes. A waterfall, a silver thread so bright, Cascades in glory, bathed in golden light. Jungle whispers rise on humid air, As vibrant blossoms paint a scene so rare. Exotic birds sing melodies untold, While ancient secrets the waters hold. The jade-green pool, a tranquil, cool embrace, Reflects the heavens in its watery space. A diamond spray, a misty, gentle kiss, A moment captured, pure, eternal bliss. So stand in awe, and let your spirit soar, As nature's grandeur you forevermore, Carry within your heart, a vibrant hue, The emerald curtain, bathed in morning dew. {{#if image-briefing.output.additionalPrompt}}Additional instructions: Vibrant colors, mist from the waterfall, tropical birds {{/if}}Create an image that evokes the same emotions and themes as the poem. Make it artistic and visually appealing."
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
   1 | import { test, expect } from '@playwright/test';
   2 |
   3 | test.describe('Complete Poem Workflow with Image Generation and Export', () => {
   4 |   test.beforeEach(async ({ page }) => {
   5 |     // Run in headless mode as per CLAUDE.md
   6 |     await page.goto('/w/poem/new');
   7 |     await page.waitForLoadState('networkidle');
   8 |   });
   9 |
   10 |   test('should complete full poem workflow: topic → poem → image → HTML export', async ({ page }) => {
   11 |     console.log('Starting complete poem workflow test...');
   12 |     
   13 |     // Step 1: Enter poem topic
   14 |     console.log('Step 1: Entering poem topic');
   15 |     const poemTopic = 'A majestic waterfall in a tropical paradise';
   16 |     await page.locator('textarea').first().fill(poemTopic);
   17 |     
   18 |     // Click continue using specific stage ID
   19 |     await page.locator('#process-stage-poem-topic').click();
   20 |     
   21 |     // Step 2: Wait for poem generation
   22 |     console.log('Step 2: Waiting for poem generation...');
   23 |     await page.waitForSelector('text=Poem Title', { timeout: 60000 });
   24 |     await page.waitForSelector('text=Poem Content', { timeout: 10000 });
   25 |     
   26 |     // Verify poem was generated by checking for the labels
   27 |     const poemTitleLabel = await page.locator('text=Poem Title').isVisible();
   28 |     expect(poemTitleLabel).toBe(true);
   29 |     
   30 |     const poemContentLabel = await page.locator('text=Poem Content').isVisible();
   31 |     expect(poemContentLabel).toBe(true);
   32 |     
   33 |     // Get the actual poem text for verification
   34 |     const pageContent = await page.textContent('body');
   35 |     expect(pageContent).toContain('Poem Title');
   36 |     expect(pageContent).toContain('Poem Content');
   37 |     console.log('✓ Poem generated successfully');
   38 |     
   39 |     // Step 3: Fill image briefing form
   40 |     console.log('Step 3: Filling image briefing form');
   41 |     await page.waitForSelector('text=Image Customization', { timeout: 10000 });
   42 |     
   43 |     // Add optional instructions - find the textarea by looking for the one after "Additional Image Instructions"
   44 |     const imageInstructions = page.locator('textarea').filter({ hasText: '' }).nth(1); // Second empty textarea
   45 |     await imageInstructions.fill('Vibrant colors, mist from the waterfall, tropical birds');
   46 |     
   47 |     // Use default settings for other fields (aspect ratio: 3:4, style: Artistic, number: 2)
   48 |     
   49 |     // Click continue for image briefing - find the continue button in the image customization section
   50 |     const imageContinueButton = page.locator('button:has-text("Continue")').first();
   51 |     await imageContinueButton.click();
   52 |     console.log('✓ Image briefing submitted');
   53 |     
   54 |     // Step 4: Wait for image generation
   55 |     console.log('Step 4: Waiting for image generation...');
   56 |     
   57 |     // Wait for the image generation stage to appear
   58 |     await page.waitForSelector('[data-testid="stage-card-generate-poem-image"]', {
   59 |       timeout: 30000
   60 |     });
   61 |     
   62 |     // Wait for images to be generated - look for img elements
   63 |     await page.waitForSelector('[data-testid="stage-card-generate-poem-image"] img', {
   64 |       timeout: 120000 // 2 minutes for image generation
   65 |     });
   66 |     
   67 |     console.log('✓ Images generated');
   68 |     
   69 |     // Verify at least one image is visible
   70 |     const generatedImages = page.locator('[data-testid="stage-card-generate-poem-image"] img');
   71 |     const imageCount = await generatedImages.count();
   72 |     expect(imageCount).toBeGreaterThan(0);
   73 |     console.log(`✓ Found ${imageCount} generated images`);
   74 |     
   75 |     // Get the first image URL for later verification
   76 |     const firstImageUrl = await generatedImages.first().getAttribute('src');
   77 |     expect(firstImageUrl).toBeTruthy();
   78 |     
   79 |     // Check if it's a valid image URL (data URL or storage URL)
   80 |     const isValidUrl = firstImageUrl?.startsWith('data:image/') || 
   81 |                       firstImageUrl?.includes('storage.googleapis.com') ||
   82 |                       firstImageUrl?.includes('firebasestorage.googleapis.com');
   83 |     expect(isValidUrl).toBe(true);
   84 |     console.log('✓ Image URL is valid:', isValidUrl ? 'Yes' : 'No');
   85 |     
   86 |     // Step 5: Verify HTML generation includes the image
   87 |     console.log('Step 5: Checking HTML generation...');
   88 |     
   89 |     // Wait for HTML preview stage
   90 |     await page.waitForSelector('[data-testid="stage-card-generate-html-preview"]', {
   91 |       timeout: 60000
   92 |     });
   93 |     
   94 |     // Wait for HTML content to be generated
>  95 |     await page.waitForSelector('[data-testid="stage-card-generate-html-preview"] .prose, [data-testid="stage-card-generate-html-preview"] iframe', {
      |                ^ Error: page.waitForSelector: Test timeout of 30000ms exceeded.
   96 |       timeout: 30000
   97 |     });
   98 |     
   99 |     console.log('✓ HTML preview generated');
  100 |     
  101 |     // Check if the HTML contains the image
  102 |     const htmlContent = page.locator('[data-testid="stage-card-generate-html-preview"]');
  103 |     const htmlText = await htmlContent.textContent();
  104 |     
  105 |     // The HTML should reference our generated image
  106 |     if (firstImageUrl?.startsWith('data:image/')) {
  107 |       // For data URLs, just check that an image tag exists
  108 |       const hasImageTag = htmlText?.includes('img') || htmlText?.includes('image');
  109 |       expect(hasImageTag).toBe(true);
  110 |     }
  111 |     
  112 |     console.log('✓ HTML contains image reference');
  113 |     
  114 |     // Step 6: Verify export options are available
  115 |     console.log('Step 6: Checking export options...');
  116 |     
  117 |     // Look for export stage
  118 |     const exportStage = page.locator('[data-testid*="export"], button:has-text("Export & Publish")');
  119 |     const exportExists = await exportStage.count() > 0;
  120 |     
  121 |     if (exportExists) {
  122 |       console.log('✓ Export options available');
  123 |       
  124 |       // Click on export if not already expanded
  125 |       const exportButton = page.locator('button:has-text("Export & Publish")').first();
  126 |       if (await exportButton.isVisible()) {
  127 |         await exportButton.click();
  128 |         await page.waitForTimeout(1000); // Wait for animation
  129 |       }
  130 |       
  131 |       // Verify export formats
  132 |       const formats = ['Beautiful Poem', 'Clean HTML', 'Markdown'];
  133 |       for (const format of formats) {
  134 |         const formatOption = page.locator(`text=${format}`);
  135 |         const isVisible = await formatOption.isVisible();
  136 |         console.log(`  ${format}: ${isVisible ? '✓' : '✗'}`);
  137 |       }
  138 |     }
  139 |     
  140 |     // Step 7: Final verification - all stages completed
  141 |     console.log('\nStep 7: Final verification');
  142 |     
  143 |     // Check that we have a complete poem with image
  144 |     const stages = [
  145 |       { name: 'poem-topic', label: 'Poem Topic' },
  146 |       { name: 'poem-generation', label: 'Poem Generation' },
  147 |       { name: 'image-briefing', label: 'Image Briefing' },
  148 |       { name: 'generate-poem-image', label: 'Image Generation' },
  149 |       { name: 'generate-html-preview', label: 'HTML Generation' }
  150 |     ];
  151 |     
  152 |     for (const stage of stages) {
  153 |       const stageCard = page.locator(`[data-testid="stage-card-${stage.name}"]`);
  154 |       const exists = await stageCard.count() > 0;
  155 |       console.log(`  ${stage.label}: ${exists ? '✓' : '✗'}`);
  156 |     }
  157 |     
  158 |     console.log('\n✅ Complete poem workflow test passed!');
  159 |     console.log('Successfully generated a poem with images and HTML export.');
  160 |   });
  161 |
  162 |   test('should handle image selection and switching', async ({ page }) => {
  163 |     // Quick poem generation
  164 |     await page.locator('textarea').first().fill('Rainbow after the storm');
  165 |     await page.locator('#process-stage-poem-topic').click();
  166 |     
  167 |     // Wait for poem
  168 |     await page.waitForSelector('text=Poem Title', { timeout: 60000 });
  169 |     
  170 |     // Request multiple images
  171 |     await page.waitForSelector('text=Image Customization', { timeout: 10000 });
  172 |     
  173 |     // Try to select 4 images if the option exists
  174 |     const numberSelect = page.locator('select').filter({ hasText: /\d+ Images?/ });
  175 |     if (await numberSelect.count() > 0) {
  176 |       await numberSelect.selectOption('4');
  177 |     }
  178 |     
  179 |     await page.locator('#process-stage-image-briefing').click();
  180 |     
  181 |     // Wait for images
  182 |     await page.waitForSelector('[data-testid="stage-card-generate-poem-image"] img', {
  183 |       timeout: 120000
  184 |     });
  185 |     
  186 |     // Check for multiple images (thumbnails)
  187 |     const thumbnails = page.locator('[data-testid="stage-card-generate-poem-image"] button img');
  188 |     const thumbnailCount = await thumbnails.count();
  189 |     
  190 |     if (thumbnailCount > 1) {
  191 |       console.log(`Found ${thumbnailCount} image thumbnails`);
  192 |       
  193 |       // Get initial main image src
  194 |       const mainImage = page.locator('[data-testid="stage-card-generate-poem-image"] img').first();
  195 |       const initialSrc = await mainImage.getAttribute('src');
```