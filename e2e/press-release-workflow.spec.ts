import { test, expect } from '@playwright/test';

test.describe('Press Release Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/w/press-release/new');
    await page.waitForLoadState('networkidle');
  });

  test('should complete full press release workflow with all stages', async ({ page }) => {
    console.log('Starting press release workflow test');

    // Stage 1: Basic Information
    await test.step('Fill basic information', async () => {
      console.log('Filling basic information form');
      
      // Fill topic
      await page.locator('input[placeholder*="New Product Launch"]').fill('Revolutionary AI Platform Launch');
      
      // Fill message
      await page.locator('textarea[placeholder*="We\'re launching"]').fill(
        'We are excited to announce the launch of our groundbreaking AI platform that revolutionizes how businesses analyze and predict customer behavior using advanced machine learning algorithms.'
      );
      
      // Fill company name
      await page.locator('input[placeholder*="TechCorp Inc."]').fill('InnovateTech Solutions');
      
      // Fill website (optional)
      await page.locator('input[placeholder*="https://example.com"]').fill('https://innovatetech.com');
      
      // Process stage
      await page.click('#process-stage-basic-info');
      
      // Wait for completion
      await expect(page.locator('[data-testid="stage-card-basic-info"]')).toHaveClass(/border-green-500/, { 
        timeout: 30000 
      });
      console.log('Basic information stage completed');
    });

    // Stage 2: Tone of Voice Analysis (auto-runs)
    await test.step('Wait for tone analysis to complete', async () => {
      console.log('Waiting for tone analysis to auto-run');
      
      // Since this stage auto-runs, just wait for completion
      await expect(page.locator('[data-testid="stage-card-tone-briefing"]')).toHaveClass(/border-green-500/, { 
        timeout: 60000 
      });
      
      // Optionally upload example press releases
      const dropzone = page.locator('[data-stage-id="tone-briefing"] [data-testid="dropzone"]');
      if (await dropzone.isVisible()) {
        console.log('Dropzone available for tone examples, but skipping for basic test');
      }
      
      console.log('Tone analysis completed');
    });

    // Stage 3: Research (auto-runs)
    await test.step('Wait for research to complete', async () => {
      console.log('Waiting for research stage to auto-run');
      
      await expect(page.locator('[data-testid="stage-card-research"]')).toHaveClass(/border-green-500/, { 
        timeout: 90000 // Longer timeout for web search
      });
      
      console.log('Research stage completed');
    });

    // Stage 4: Edit Key Facts
    await test.step('Edit key facts', async () => {
      console.log('Editing key facts');
      
      // The form should be pre-populated from research, but we can edit
      // Fill headline if empty
      const headlineInput = page.locator('input[id*="headline"]').first();
      const headlineValue = await headlineInput.inputValue();
      if (!headlineValue) {
        await headlineInput.fill('InnovateTech Solutions Unveils Game-Changing AI Platform for Predictive Customer Analytics');
      }
      
      // Add quotes if empty
      const quotesTextarea = page.locator('textarea[placeholder*="This launch represents"]');
      const quotesValue = await quotesTextarea.inputValue();
      if (!quotesValue) {
        await quotesTextarea.fill(
          '"This platform represents a significant leap forward in AI-powered business intelligence," said John Smith, CEO of InnovateTech Solutions. "We\'re empowering businesses to make data-driven decisions with unprecedented accuracy."'
        );
      }
      
      // Process stage
      await page.click('#process-stage-key-facts');
      
      // Wait for completion
      await expect(page.locator('[data-testid="stage-card-key-facts"]')).toHaveClass(/border-green-500/, { 
        timeout: 30000 
      });
      console.log('Key facts editing completed');
    });

    // Stage 5: Edit Contact Information
    await test.step('Fill contact information', async () => {
      console.log('Filling contact information');
      
      // Fill contact details
      await page.locator('input[placeholder*="Jane Smith"]').fill('Sarah Johnson');
      await page.locator('input[placeholder*="Director of Communications"]').fill('VP of Marketing Communications');
      await page.locator('input[placeholder*="press@company.com"]').fill('press@innovatetech.com');
      await page.locator('input[placeholder*="+1 (555)"]').fill('+1 (555) 987-6543');
      
      // Process stage
      await page.click('#process-stage-contact-info');
      
      // Wait for completion
      await expect(page.locator('[data-testid="stage-card-contact-info"]')).toHaveClass(/border-green-500/, { 
        timeout: 30000 
      });
      console.log('Contact information completed');
    });

    // Stage 6: Final Press Release (auto-runs)
    await test.step('Wait for final press release generation', async () => {
      console.log('Waiting for final press release to generate');
      
      await expect(page.locator('[data-testid="stage-card-final-press-release"]')).toHaveClass(/border-green-500/, { 
        timeout: 90000 
      });
      
      // Verify press release content
      const pressReleaseOutput = page.locator('[data-testid="stage-card-final-press-release"] [data-testid="stage-output-area"]');
      await expect(pressReleaseOutput).toContainText('FOR IMMEDIATE RELEASE');
      await expect(pressReleaseOutput).toContainText('InnovateTech Solutions');
      await expect(pressReleaseOutput).toContainText('###');
      
      console.log('Final press release generated successfully');
    });

    // Stage 7: Optional Photo Generation (skip in basic test)
    await test.step('Check optional photo stage', async () => {
      console.log('Checking optional photo generation stage');
      
      const photoStage = page.locator('[data-testid="stage-card-press-photo"]');
      await expect(photoStage).toBeVisible();
      
      // Verify it's marked as optional
      await expect(photoStage).toContainText('Optional');
      
      console.log('Optional photo stage available but skipping');
    });

    // Stage 8: Export
    await test.step('Test export functionality', async () => {
      console.log('Testing export stage');
      
      // Click export button
      const exportButton = page.locator('button', { hasText: 'Export Press Release' });
      await exportButton.click();
      
      // Wait for export interface
      await expect(page.locator('text=Live Preview')).toBeVisible({ timeout: 30000 });
      
      // Verify export formats
      await expect(page.locator('text=HTML (Styled)')).toBeVisible();
      await expect(page.locator('text=HTML (Clean)')).toBeVisible();
      await expect(page.locator('text=Markdown')).toBeVisible();
      await expect(page.locator('text=PDF')).toBeVisible();
      await expect(page.locator('text=DOCX')).toBeVisible();
      
      console.log('Export functionality verified');
    });

    console.log('Press release workflow completed successfully!');
  });

  test('should handle editing and AI redo functionality', async ({ page }) => {
    console.log('Testing editing and AI redo features');

    // Complete basic info first
    await page.locator('input[placeholder*="New Product Launch"]').fill('Test Announcement');
    await page.locator('textarea[placeholder*="We\'re launching"]').fill('Test message');
    await page.locator('input[placeholder*="TechCorp Inc."]').fill('Test Company');
    await page.click('#process-stage-basic-info');
    await expect(page.locator('[data-testid="stage-card-basic-info"]')).toHaveClass(/border-green-500/, { 
      timeout: 30000 
    });

    // Wait for tone briefing to complete
    await expect(page.locator('[data-testid="stage-card-tone-briefing"]')).toHaveClass(/border-green-500/, { 
      timeout: 60000 
    });

    // Test AI Redo on tone briefing
    await test.step('Test AI Redo functionality', async () => {
      console.log('Testing AI Redo on tone briefing stage');
      
      // Find and click AI Redo button
      const toneStage = page.locator('[data-testid="stage-card-tone-briefing"]');
      const aiRedoButton = toneStage.locator('button[title="AI Redo"]');
      await aiRedoButton.click();
      
      // Fill redo instructions
      await page.waitForSelector('[role="dialog"]:has-text("AI Redo")');
      await page.locator('[role="dialog"] textarea').fill('Make the tone more casual and startup-friendly');
      await page.locator('[role="dialog"] button:has-text("Redo with AI")').click();
      
      // Wait for redo to complete
      await expect(toneStage).toHaveClass(/border-green-500/, { timeout: 60000 });
      console.log('AI Redo completed successfully');
    });

    // Test manual editing
    await test.step('Test manual editing', async () => {
      console.log('Testing manual edit functionality');
      
      // Wait for research to complete first
      await expect(page.locator('[data-testid="stage-card-research"]')).toHaveClass(/border-green-500/, { 
        timeout: 90000 
      });
      
      // Find and click Edit button on research stage
      const researchStage = page.locator('[data-testid="stage-card-research"]');
      const editButton = researchStage.locator('button[title="Edit"]');
      await editButton.click();
      
      // Wait for edit mode
      await page.waitForTimeout(1000);
      
      // The edit interface should be visible
      const saveButton = researchStage.locator('button:has-text("Save")');
      await expect(saveButton).toBeVisible();
      
      // Save without changes
      await saveButton.click();
      
      console.log('Manual editing tested successfully');
    });
  });

  test('should generate optional press photo', async ({ page }) => {
    console.log('Testing optional photo generation');

    // Complete required stages quickly
    await page.locator('input[placeholder*="New Product Launch"]').fill('Photo Test');
    await page.locator('textarea[placeholder*="We\'re launching"]').fill('Testing photo generation');
    await page.locator('input[placeholder*="TechCorp Inc."]').fill('PhotoTest Inc');
    await page.click('#process-stage-basic-info');
    
    // Wait for auto-run stages
    await expect(page.locator('[data-testid="stage-card-final-press-release"]')).toHaveClass(/border-green-500/, { 
      timeout: 120000 
    });

    // Now test photo generation
    await test.step('Generate press photo', async () => {
      console.log('Filling photo generation form');
      
      const photoStage = page.locator('[data-testid="stage-card-press-photo"]');
      
      // Fill image description
      await photoStage.locator('textarea').fill('Modern office building with glass facade showing technology company headquarters');
      
      // Select style
      const styleSelect = photoStage.locator('button[role="combobox"]').first();
      await styleSelect.click();
      await page.getByRole('option', { name: 'Photorealistic' }).click();
      
      // Select aspect ratio
      const aspectSelect = photoStage.locator('button[role="combobox"]').nth(1);
      await aspectSelect.click();
      await page.getByRole('option', { name: '16:9 (Landscape)' }).click();
      
      // Generate image
      await page.click('#process-stage-press-photo');
      
      // Wait for image generation (this can take a while)
      await expect(photoStage).toHaveClass(/border-green-500/, { timeout: 120000 });
      
      // Verify images were generated
      const images = photoStage.locator('img');
      const imageCount = await images.count();
      expect(imageCount).toBeGreaterThan(0);
      
      console.log(`Photo generation completed with ${imageCount} images`);
    });
  });
});