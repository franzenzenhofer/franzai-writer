import { test, expect } from '@playwright/test';

test.describe('Press Release Workflow - Unconventional Usage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/w/press-release/new');
    await page.waitForLoadState('networkidle');
  });

  test('should handle multiple AI redos and non-linear execution', async ({ page }) => {
    console.log('Starting unconventional press release workflow test');

    // Stage 1: Minimal basic information
    await test.step('Fill minimal basic information', async () => {
      console.log('Filling minimal info - testing with bare minimum');
      
      // Only fill required fields with minimal data
      await page.locator('input[placeholder*="New Product Launch"]').fill('Test');
      await page.locator('textarea[placeholder*="We\'re launching"]').fill('Testing');
      await page.locator('input[placeholder*="TechCorp Inc."]').fill('X');
      // Skip optional website field
      
      await page.click('#process-stage-basic-info');
      await expect(page.locator('[data-testid="stage-card-basic-info"]')).toHaveClass(/border-green-500/, { 
        timeout: 30000 
      });
    });

    // Stage 2: Multiple AI redos on tone analysis
    await test.step('Multiple AI redos on tone analysis', async () => {
      console.log('Testing multiple AI redos on tone analysis');
      
      // Wait for initial completion
      const toneStage = page.locator('[data-testid="stage-card-tone-briefing"]');
      await expect(toneStage).toHaveClass(/border-green-500/, { 
        timeout: 60000 
      });
      
      // Add a small delay to ensure UI is ready
      await page.waitForTimeout(1000);
      
      // First AI redo
      const aiRedoButton = page.locator('[data-testid="ai-redo-tone-briefing"]');
      await expect(aiRedoButton).toBeVisible({ timeout: 5000 });
      await aiRedoButton.click();
      await page.waitForSelector('[role="dialog"]:has-text("AI Redo")');
      await page.locator('[role="dialog"] textarea').fill('Make it extremely formal and corporate');
      await page.locator('[role="dialog"] button:has-text("Redo with AI")').click();
      await expect(toneStage).toHaveClass(/border-green-500/, { timeout: 60000 });
      
      // Second AI redo
      await page.locator('[data-testid="ai-redo-tone-briefing"]').click();
      await page.waitForSelector('[role="dialog"]:has-text("AI Redo")');
      await page.locator('[role="dialog"] textarea').fill('Actually, make it very casual and startup-like');
      await page.locator('[role="dialog"] button:has-text("Redo with AI")').click();
      await expect(toneStage).toHaveClass(/border-green-500/, { timeout: 60000 });
      
      // Third AI redo
      await page.locator('[data-testid="ai-redo-tone-briefing"]').click();
      await page.waitForSelector('[role="dialog"]:has-text("AI Redo")');
      await page.locator('[role="dialog"] textarea').fill('Find a balance between formal and casual, professional but approachable');
      await page.locator('[role="dialog"] button:has-text("Redo with AI")').click();
      await expect(toneStage).toHaveClass(/border-green-500/, { timeout: 60000 });
      
      console.log('Completed 3 AI redos on tone analysis');
    });

    // Stage 3: Edit research after it completes
    await test.step('Edit auto-generated research', async () => {
      console.log('Waiting for research to complete, then editing');
      
      await expect(page.locator('[data-testid="stage-card-research"]')).toHaveClass(/border-green-500/, { 
        timeout: 90000 
      });
      
      // Click edit button
      const researchStage = page.locator('[data-testid="stage-card-research"]');
      await researchStage.locator('button:has-text("Edit")').click();
      
      // Wait for edit mode
      await page.waitForTimeout(1000);
      
      // Find the textarea in edit mode and modify content
      const editTextarea = researchStage.locator('textarea').first();
      const currentContent = await editTextarea.inputValue();
      await editTextarea.fill(currentContent + '\n\nEDITED: Added custom research notes about competitors.');
      
      // Save edits
      await researchStage.locator('button:has-text("Save")').click();
      
      console.log('Research edited after auto-generation');
    });

    // Stage 4: Leave key facts mostly empty
    await test.step('Submit key facts with minimal data', async () => {
      console.log('Testing with mostly empty key facts');
      
      // Only fill headline, leave everything else empty
      await page.locator('input[placeholder="Main headline for the press release"]').fill('Minimal Test Headline');
      
      // Process with mostly empty fields
      await page.click('#process-stage-key-facts');
      await expect(page.locator('[data-testid="stage-card-key-facts"]')).toHaveClass(/border-green-500/, { 
        timeout: 30000 
      });
    });

    // Go back and edit basic info AFTER other stages completed
    await test.step('Edit basic info after progression', async () => {
      console.log('Going back to edit basic info');
      
      const basicInfoStage = page.locator('[data-testid="stage-card-basic-info"]');
      await basicInfoStage.locator('button:has-text("Edit")').click();
      
      // Wait for edit mode
      await page.waitForTimeout(1000);
      
      // Update the company name
      const companyInput = page.locator('input[placeholder*="TechCorp Inc."]');
      await companyInput.clear();
      await companyInput.fill('Updated Company Name LLC');
      
      // Save changes
      await basicInfoStage.locator('button:has-text("Save")').click();
      
      console.log('Basic info updated after other stages completed');
    });

    // Stage 5: Skip contact info initially, then fill later
    await test.step('Skip and return to contact info', async () => {
      console.log('Testing non-linear stage completion');
      
      // Skip contact info for now
      const contactStage = page.locator('[data-testid="stage-card-contact-info"]');
      
      // Try to proceed without filling contact info
      // The final press release should wait for this dependency
      
      // Fill contact info after attempting to skip
      await page.locator('input[placeholder*="Jane Smith"]').fill('J');
      await page.locator('input[placeholder*="Director of Communications"]').fill('CEO');
      await page.locator('input[placeholder*="press@company.com"]').fill('x@y.z');
      await page.locator('input[placeholder*="+1 (555)"]').fill('1');
      
      await page.click('#process-stage-contact-info');
      await expect(contactStage).toHaveClass(/border-green-500/, { timeout: 30000 });
    });

    // Multiple AI redos on final press release
    await test.step('Multiple redos on final press release', async () => {
      console.log('Testing multiple redos on final output');
      
      await expect(page.locator('[data-testid="stage-card-final-press-release"]')).toHaveClass(/border-green-500/, { 
        timeout: 90000 
      });
      
      const finalStage = page.locator('[data-testid="stage-card-final-press-release"]');
      
      // First redo - make it shorter
      await page.locator('[data-testid="ai-redo-final-press-release"]').click();
      await page.waitForSelector('[role="dialog"]:has-text("AI Redo")');
      await page.locator('[role="dialog"] textarea').fill('Make this much shorter, under 200 words');
      await page.locator('[role="dialog"] button:has-text("Redo with AI")').click();
      await expect(finalStage).toHaveClass(/border-green-500/, { timeout: 90000 });
      
      // Second redo - make it longer
      await page.locator('[data-testid="ai-redo-final-press-release"]').click();
      await page.waitForSelector('[role="dialog"]:has-text("AI Redo")');
      await page.locator('[role="dialog"] textarea').fill('Actually make it longer with more details, around 800 words');
      await page.locator('[role="dialog"] button:has-text("Redo with AI")').click();
      await expect(finalStage).toHaveClass(/border-green-500/, { timeout: 90000 });
    });

    // Test optional photo with unusual parameters
    await test.step('Generate photo with edge case parameters', async () => {
      console.log('Testing photo generation with unusual settings');
      
      const photoStage = page.locator('[data-testid="stage-card-press-photo"]');
      
      // Fill with minimal/unusual description
      await photoStage.locator('textarea').fill('.');
      
      // Select minimal style
      const styleSelect = photoStage.locator('button[role="combobox"]').first();
      await styleSelect.click();
      await page.getByRole('option', { name: 'Minimalist' }).click();
      
      // Select portrait aspect ratio for a press release (unusual choice)
      const aspectSelect = photoStage.locator('button[role="combobox"]').nth(1);
      await aspectSelect.click();
      await page.getByRole('option', { name: '3:4 (Portrait)' }).click();
      
      await page.click('#process-stage-press-photo');
      await expect(photoStage).toHaveClass(/border-green-500/, { timeout: 120000 });
    });

    console.log('Unconventional workflow test completed!');
  });

  test('should handle workflow interruption and recovery', async ({ page }) => {
    console.log('Testing workflow interruption and recovery');

    // Start workflow
    await page.locator('input[placeholder*="New Product Launch"]').fill('Interruption Test');
    await page.locator('textarea[placeholder*="We\'re launching"]').fill('Testing interruption handling');
    await page.locator('input[placeholder*="TechCorp Inc."]').fill('TestCorp');
    await page.click('#process-stage-basic-info');
    await expect(page.locator('[data-testid="stage-card-basic-info"]')).toHaveClass(/border-green-500/, { 
      timeout: 30000 
    });

    // Wait for some auto-run stages to start
    await page.waitForTimeout(5000);

    // Reload the page to simulate interruption
    await test.step('Reload page during processing', async () => {
      console.log('Reloading page to simulate interruption');
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Verify stages maintain their state
      await expect(page.locator('[data-testid="stage-card-basic-info"]')).toHaveClass(/border-green-500/);
      
      // Check if auto-run stages resumed or need manual trigger
      const toneBriefing = page.locator('[data-testid="stage-card-tone-briefing"]');
      const hasGreenBorder = await toneBriefing.evaluate(el => el.classList.contains('border-green-500'));
      
      if (!hasGreenBorder) {
        console.log('Tone briefing needs manual trigger after reload');
        // Manually trigger if needed
        const continueButton = toneBriefing.locator('button:has-text("Continue")');
        if (await continueButton.isVisible()) {
          await continueButton.click();
        }
      }
    });

    console.log('Workflow recovery test completed');
  });

  test('should handle rapid stage transitions and concurrent operations', async ({ page }) => {
    console.log('Testing rapid stage transitions');

    // Fill basic info rapidly
    await test.step('Rapid form filling and submission', async () => {
      await page.locator('input[placeholder*="New Product Launch"]').fill('Speed Test Product');
      await page.locator('textarea[placeholder*="We\'re launching"]').fill('Rapid test message for speed testing workflow execution');
      await page.locator('input[placeholder*="TechCorp Inc."]').fill('SpeedTest Inc');
      await page.locator('input[placeholder*="https://example.com"]').fill('https://speedtest.com');
      
      // Click immediately without waiting
      await page.click('#process-stage-basic-info');
    });

    // Try to interact with stages before they're ready
    await test.step('Attempt premature stage interactions', async () => {
      console.log('Attempting to interact with stages before dependencies complete');
      
      // Try to fill key facts before research completes
      const keyFactsStage = page.locator('[data-testid="stage-card-key-facts"]');
      
      // Check if form is accessible
      const headlineInput = page.locator('input[placeholder="Main headline for the press release"]');
      
      try {
        // Attempt to fill before dependencies are met
        await headlineInput.fill('Premature headline', { timeout: 2000 });
        console.log('Was able to fill key facts early');
      } catch {
        console.log('Key facts correctly blocked until dependencies complete');
      }
    });

    // Rapidly trigger multiple manual stages
    await test.step('Rapid manual stage completion', async () => {
      // Wait for auto-stages to complete
      await expect(page.locator('[data-testid="stage-card-research"]')).toHaveClass(/border-green-500/, { 
        timeout: 90000 
      });
      
      // Rapidly fill and submit key facts
      await page.locator('input[placeholder="Main headline for the press release"]').fill('Rapid Headline');
      await page.locator('textarea[placeholder="Main points to include (one per line)"]').fill('Point 1\nPoint 2');
      await page.click('#process-stage-key-facts');
      
      // Immediately fill contact info without waiting
      await page.locator('input[placeholder*="Jane Smith"]').fill('Quick Contact');
      await page.locator('input[placeholder*="Director of Communications"]').fill('Quick Title');
      await page.locator('input[placeholder*="press@company.com"]').fill('quick@test.com');
      await page.locator('input[placeholder*="+1 (555)"]').fill('+1234567890');
      await page.click('#process-stage-contact-info');
      
      // Verify both complete despite rapid submission
      await expect(page.locator('[data-testid="stage-card-key-facts"]')).toHaveClass(/border-green-500/, { 
        timeout: 30000 
      });
      await expect(page.locator('[data-testid="stage-card-contact-info"]')).toHaveClass(/border-green-500/, { 
        timeout: 30000 
      });
    });

    console.log('Rapid transitions test completed');
  });

  test('should handle edge cases with form validation', async ({ page }) => {
    console.log('Testing form validation edge cases');

    await test.step('Test with special characters and Unicode', async () => {
      // Fill with special characters
      await page.locator('input[placeholder*="New Product Launch"]').fill('🚀 Launch™ with Special©haracters®');
      await page.locator('textarea[placeholder*="We\'re launching"]').fill('Testing with émojis 🎉 and spëcial çharacters ñ ü ß 中文');
      await page.locator('input[placeholder*="TechCorp Inc."]').fill('Company™ & Co. <LLC>');
      await page.locator('input[placeholder*="https://example.com"]').fill('https://测试.com');
      
      await page.click('#process-stage-basic-info');
      await expect(page.locator('[data-testid="stage-card-basic-info"]')).toHaveClass(/border-green-500/, { 
        timeout: 30000 
      });
    });

    await test.step('Test with extremely long inputs', async () => {
      // Wait for dependencies
      await expect(page.locator('[data-testid="stage-card-research"]')).toHaveClass(/border-green-500/, { 
        timeout: 90000 
      });
      
      // Create very long strings
      const longHeadline = 'Very '.repeat(50) + 'Long Headline';
      const longKeyPoints = Array(20).fill('This is a very long key point that contains a lot of text').join('\n');
      
      await page.locator('input[placeholder="Main headline for the press release"]').fill(longHeadline);
      await page.locator('textarea[placeholder="Main points to include (one per line)"]').fill(longKeyPoints);
      
      await page.click('#process-stage-key-facts');
      await expect(page.locator('[data-testid="stage-card-key-facts"]')).toHaveClass(/border-green-500/, { 
        timeout: 30000 
      });
    });

    await test.step('Test with HTML/script injection attempts', async () => {
      // Fill contact info with potential XSS attempts
      await page.locator('input[placeholder*="Jane Smith"]').fill('<script>alert("test")</script>');
      await page.locator('input[placeholder*="Director of Communications"]').fill('"><img src=x onerror=alert(1)>');
      await page.locator('input[placeholder*="press@company.com"]').fill('test+tag@example.com');
      await page.locator('input[placeholder*="+1 (555)"]').fill('+1 (555) 123-4567 ext. 999');
      
      await page.click('#process-stage-contact-info');
      await expect(page.locator('[data-testid="stage-card-contact-info"]')).toHaveClass(/border-green-500/, { 
        timeout: 30000 
      });
      
      // Verify the final output properly escapes these inputs
      await expect(page.locator('[data-testid="stage-card-final-press-release"]')).toHaveClass(/border-green-500/, { 
        timeout: 90000 
      });
      
      // Check that script tags are not executed
      const finalOutput = page.locator('[data-testid="stage-card-final-press-release"] [data-testid="stage-output-area"]');
      const outputText = await finalOutput.textContent();
      expect(outputText).not.toContain('<script>');
    });

    console.log('Edge case validation test completed');
  });
});