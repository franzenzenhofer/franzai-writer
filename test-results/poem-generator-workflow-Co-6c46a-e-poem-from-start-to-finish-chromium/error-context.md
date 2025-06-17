# Test info

- Name: Complete Poem Generator Workflow >> should create poem from start to finish
- Location: /Users/franzenzenhofer/dev/franzai-writer/tests/e2e/poem-generator-workflow.spec.ts:9:7

# Error details

```
Error: expect.toBeVisible: Error: strict mode violation: locator('[data-testid="stage-card-generate-poem-image"] img') resolved to 3 elements:
    1) <img data-aspect-ratio="3:4" class="w-full h-auto rounded-lg" src="https://firebasestorage.googleapis.com/v0/b/franzai-writer.firebasestorage.app/o/assets%2FuBKDZ6KJcUBK9uIYY1orD%2Foriginal.png?alt=media&token=0c272e98-7148-41e4-b3ae-be0902c1fffc" alt="Generated image: Create a artistic image that captures the essence and mood of this poem:↵↵Title: Golden Embrace↵Poem:↵{{generate-poem-with-title.output.poem}}↵↵Additional instructions: warm golden colors↵↵Create an image that evokes the same emotion…/> aka getByRole('img', { name: 'Generated image: Create a' })
    2) <img alt="Thumbnail 1" class="w-full h-auto" src="https://firebasestorage.googleapis.com/v0/b/franzai-writer.firebasestorage.app/o/assets%2FuBKDZ6KJcUBK9uIYY1orD%2Foriginal.png?alt=media&token=0c272e98-7148-41e4-b3ae-be0902c1fffc"/> aka getByRole('button', { name: 'Thumbnail 1' })
    3) <img alt="Thumbnail 2" class="w-full h-auto" src="https://firebasestorage.googleapis.com/v0/b/franzai-writer.firebasestorage.app/o/assets%2FpoP3LVvYiVL14ZpbQNPdt%2Foriginal.png?alt=media&token=f83faca3-bb2b-47bc-b282-32816a458813"/> aka getByRole('button', { name: 'Thumbnail 2' })

Call log:
  - expect.toBeVisible with timeout 5000ms
  - waiting for locator('[data-testid="stage-card-generate-poem-image"] img')

    at /Users/franzenzenhofer/dev/franzai-writer/tests/e2e/poem-generator-workflow.spec.ts:60:34
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
  - heading "Golden Embrace" [level=1]
  - paragraph: "Workflow: Poem Generator"
  - text: Progress 4 / 7 Stages
  - progressbar
  - text: Last saved 8:09:50 PM
  - img
  - text: Poem Topic What is the topic of your poem?
  - paragraph: a beautiful sunny day
  - button "Edit":
    - img
    - text: Edit
  - img
  - text: Generate Poem & Title AI will generate a poem and title based on your topic. Poem Title Golden Embrace Poem Content The sun ascends, a painter bold, With strokes of gold on fields untold. A canvas bright, a sky so blue, A perfect day, fresh and new. The gentle breeze, a playful sigh, Kisses the leaves as clouds drift by. The world awakens, bathed in light, Chasing away the fading night. A symphony of birdsong sweet, Echoes softly, a joyful greet. The flowers bloom, in vibrant dress, Nature's beauty, I confess. Soak in the warmth, the radiant gleam, A sunlit reverie, a waking dream. This golden embrace, a gift so rare, A beautiful day beyond compare.
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
  - text: Image Customization Optional Customize how your poem should be illustrated Additional Image Instructions (Optional) warm golden colors Image Format Portrait (3:4) - Book Cover Artistic Style Artistic & Creative Number of Variations 2 Images
  - button "Edit":
    - img
    - text: Edit
  - img
  - text: Generate Poem Illustration AI will create an image that complements your poem.
  - 'img "Generated image: Create a artistic image that captures the essence and mood of this poem: Title: Golden Embrace Poem: {{generate-poem-with-title.output.poem}} Additional instructions: warm golden colors Create an image that evokes the same emotions and themes as the poem. Make it artistic and visually appealing. IMPORTANT: Do NOT include any text, words, letters, or writing in the image. The image should be purely visual without any textual elements."'
  - text: 3:4
  - button "Download":
    - img
    - text: Download
  - paragraph: "Prompt: Create a artistic image that captures the essence and mood of this poem: Title: Golden Embrace Poem: {{generate-poem-with-title.output.poem}} Additional instructions: warm golden colors Create an image that evokes the same emotions and themes as the poem. Make it artistic and visually appealing. IMPORTANT: Do NOT include any text, words, letters, or writing in the image. The image should be purely visual without any textual elements."
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
  - list:
    - status:
      - text: AI Stage Completed AI processing for "Generate Poem Illustration" finished.
      - button:
        - img
- alert
- button "Open Next.js Dev Tools":
  - img
- status: Notification AI Stage CompletedAI processing for "Generate Poem Illustration" finished.
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 |
   3 | test.describe('Complete Poem Generator Workflow', () => {
   4 |   test.beforeEach(async ({ page }) => {
   5 |     // Set demo mode for testing
   6 |     await page.goto('/dashboard');
   7 |   });
   8 |
   9 |   test('should create poem from start to finish', async ({ page }) => {
   10 |     // Navigate to poem generator workflow
   11 |     await page.click('#workflow-start-poem-generator');
   12 |
   13 |     // Wait for wizard to load
   14 |     await page.waitForURL('**/w/poem/**');
   15 |     await expect(page.getByTestId('wizard-page-title')).toBeVisible();
   16 |
   17 |     // Stage 1: Poem Topic
   18 |     const poemTopic = 'a beautiful sunny day';
   19 |     await page.locator('textarea').first().fill(poemTopic);
   20 |     await page.locator('#process-stage-poem-topic').click();
   21 |     await page.waitForTimeout(2000); // Wait for processing
   22 |
   23 |     // Stage 2: Generate Poem - should auto-run
   24 |     // Wait for the poem to be generated (adjust timeout as needed)
   25 |     await page.waitForTimeout(8000);
   26 |
   27 |     // Wait for stage 2 (generate-poem-with-title) to complete
   28 |     await expect(page.getByTestId('stage-card-generate-poem-with-title')).toBeVisible();
   29 |     
   30 |     // Process Stage 3: Image Briefing - fill out form and continue
   31 |     // Fill out the image briefing form with valid values
   32 |     // Handle shadcn/ui Select components
   33 |     // Click on aspect ratio select trigger
   34 |     await page.click('[data-testid="stage-card-image-briefing"] button:has-text("Portrait (3:4) - Book Cover")');
   35 |     await page.click('[role="option"]:has-text("Portrait (3:4) - Book Cover")');
   36 |     
   37 |     // Click on style select trigger
   38 |     await page.click('[data-testid="stage-card-image-briefing"] button:has-text("Artistic & Creative")');
   39 |     await page.click('[role="option"]:has-text("Artistic & Creative")');
   40 |     
   41 |     // Click on number of images select trigger
   42 |     await page.click('[data-testid="stage-card-image-briefing"] button:has-text("2 Images")');
   43 |     await page.click('[role="option"]:has-text("2 Images")');
   44 |     
   45 |     // Fill additional prompt textarea
   46 |     await page.fill('textarea[name="additionalPrompt"]', 'warm golden colors');
   47 |     
   48 |     // Click continue button
   49 |     await page.locator('#process-stage-image-briefing').click();
   50 |     await page.waitForTimeout(2000);
   51 |     
   52 |     // Stage 4: Generate Poem Image - should auto-run
   53 |     // Wait for image generation to complete (this tests our image generation fix)
   54 |     await page.waitForSelector('[data-testid="stage-card-generate-poem-image"] img', {
   55 |       timeout: 90000 // Imagen generation can take a while
   56 |     });
   57 |     
   58 |     // Verify image was generated and is displayed
   59 |     const generatedImage = page.locator('[data-testid="stage-card-generate-poem-image"] img');
>  60 |     await expect(generatedImage).toBeVisible();
      |                                  ^ Error: expect.toBeVisible: Error: strict mode violation: locator('[data-testid="stage-card-generate-poem-image"] img') resolved to 3 elements:
   61 |     
   62 |     // Check that the image has a proper URL (not base64)
   63 |     const imageSrc = await generatedImage.getAttribute('src');
   64 |     expect(imageSrc).not.toContain('data:image'); // Should be Firebase Storage URL, not base64
   65 |     console.log('Generated image URL:', imageSrc); // Log for verification
   66 |
   67 |     // Stage 5: HTML Generation - should auto-run after image generation
   68 |     // Wait for HTML stage to complete
   69 |     await page.waitForTimeout(15000); // HTML generation can take time
   70 |     
   71 |     // Verify HTML output includes the image
   72 |     const htmlOutput = page.getByTestId('stage-card-generate-html-preview');
   73 |     await expect(htmlOutput).toBeVisible();
   74 |     
   75 |     // Check that the HTML content includes the generated image URL
   76 |     const htmlContent = await page.textContent('[data-testid="stage-card-generate-html-preview"]');
   77 |     expect(htmlContent).toContain('img'); // HTML should contain image tag
   78 |     
   79 |     // Verify poem output is visible
   80 |     const poemOutput = page.getByTestId('stage-card-generate-poem-with-title');
   81 |     await expect(poemOutput).toBeVisible();
   82 |     await expect(poemOutput).toContainText('Poem Content'); // Check that poem is displayed
   83 |
   84 |     // Verify the title was updated
   85 |     const wizardTitle = await page.getByTestId('wizard-page-title').textContent();
   86 |     console.log('Wizard title:', wizardTitle);
   87 |     // The title should be from the poem generation, not the topic
   88 |     await expect(page.getByTestId('wizard-page-title')).not.toContainText('New Document');
   89 |   });
   90 |
   91 |   test('should show validation if topic is empty', async ({ page }) => {
   92 |     await page.goto('/dashboard');
   93 |
   94 |     // Navigate to poem generator workflow
   95 |     await page.click('#workflow-start-poem-generator');
   96 |
   97 |     // Wait for wizard to load
   98 |     await page.waitForURL('**/w/poem/**');
   99 |     await expect(page.getByTestId('wizard-page-title')).toBeVisible();
  100 |
  101 |     // Try to process empty stage
  102 |     await page.locator('#process-stage-poem-topic').click();
  103 |     await page.waitForTimeout(1000); // Wait for potential validation message or lack of progression
  104 |
  105 |     // Progress should still be 0 since no valid input was provided
  106 |     // Check that we're still on the first stage (poem-topic stage should still be pending)
  107 |     const firstStageCard = page.getByTestId('stage-card-poem-topic');
  108 |     await expect(firstStageCard).toBeVisible();
  109 |
  110 |     // Ensure no error toast appeared for this specific action (optional, depends on app behavior)
  111 |     // await expect(page.locator('[data-testid="toast-error"]')).not.toBeVisible();
  112 |   });
  113 | });
  114 |
```