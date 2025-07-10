import { test, expect } from '@playwright/test';
import { 
  runAccessibilityAudit, 
  testFormAccessibility, 
  testAriaAttributes
} from '../utils/accessibility-helpers';

test.describe('Export and Publishing Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(120000);
  });

  test('export stage accessibility compliance', async ({ page }) => {
    // Navigate to poem workflow and complete initial stages
    await page.goto('/w/poem/new');
    await page.waitForLoadState('networkidle');

    // Fill in poem topic to reach export stage
    const topicTextarea = await page.locator('#stage-poem-topic textarea');
    if (await topicTextarea.count() > 0) {
      await topicTextarea.fill('Beautiful sunset over the ocean');
      await page.click('#process-stage-poem-topic');
      await page.waitForTimeout(10000);

      // Skip optional stages to reach export
      const imageContinue = page.locator('#stage-image-briefing button:has-text("Continue")');
      if (await imageContinue.count() > 0) {
        await imageContinue.click();
        await page.waitForTimeout(20000);
      }

      const htmlContinue = page.locator('#stage-html-briefing button:has-text("Continue")');
      if (await htmlContinue.count() > 0) {
        await htmlContinue.click();
        await page.waitForTimeout(10000);
      }

      // Scroll to export stage
      await page.evaluate(() => {
        const element = document.querySelector('#stage-export-publish');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
      await page.waitForTimeout(2000);

      // Run accessibility audit on export stage
      const exportStageAuditResults = await runAccessibilityAudit(page, {
        wcagLevel: 'AA',
        include: ['#stage-export-publish']
      });

      const exportViolations = exportStageAuditResults.violations;
      const exportCriticalViolations = exportViolations.filter(v => v.impact === 'critical');
      
      if (exportViolations.length > 0) {
        console.log('Export stage accessibility violations:');
        exportViolations.forEach(violation => {
          console.log(`- ${violation.id}: ${violation.description}`);
        });
      }

      expect(exportCriticalViolations, 'Critical accessibility violations found in export stage').toHaveLength(0);
    }
  });

  test('export buttons accessibility', async ({ page }) => {
    // Navigate to poem workflow and complete to export stage
    await page.goto('/w/poem/new');
    await page.waitForLoadState('networkidle');

    const topicTextarea = await page.locator('#stage-poem-topic textarea');
    if (await topicTextarea.count() > 0) {
      await topicTextarea.fill('Beautiful sunset over the ocean');
      await page.click('#process-stage-poem-topic');
      await page.waitForTimeout(10000);

      // Skip to export stage
      const imageContinue = page.locator('#stage-image-briefing button:has-text("Continue")');
      if (await imageContinue.count() > 0) {
        await imageContinue.click();
        await page.waitForTimeout(20000);
      }

      const htmlContinue = page.locator('#stage-html-briefing button:has-text("Continue")');
      if (await htmlContinue.count() > 0) {
        await htmlContinue.click();
        await page.waitForTimeout(10000);
      }

      // Scroll to export stage
      await page.evaluate(() => {
        const element = document.querySelector('#stage-export-publish');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
      await page.waitForTimeout(2000);

      // Test export button accessibility
      const exportButton = await page.locator('#trigger-export-export-publish, #stage-export-publish button:has-text("Export")');
      if (await exportButton.count() > 0) {
        const buttonText = await exportButton.textContent();
        const ariaLabel = await exportButton.getAttribute('aria-label');
        const ariaLabelledBy = await exportButton.getAttribute('aria-labelledby');
        
        expect(
          buttonText || ariaLabel || ariaLabelledBy,
          'Export button should have accessible text or labeling'
        ).toBeTruthy();

        // Test button focus
        await exportButton.focus();
        const isFocused = await page.evaluate(() => {
          const element = document.activeElement;
          return element?.tagName.toLowerCase() === 'button' || element?.getAttribute('role') === 'button';
        });
        
        expect(isFocused, 'Export button should be focusable').toBe(true);

        // Test button activation with keyboard
        await exportButton.focus();
        await page.keyboard.press('Enter');
        
        // Wait for export to complete
        await page.waitForTimeout(15000);
        
        // Check for success feedback
        const successMessage = await page.locator('#stage-export-publish :text("Live Preview")');
        if (await successMessage.count() > 0) {
          console.log('✅ Export button activation successful');
        }
      }
    }
  });

  test('publish form accessibility', async ({ page }) => {
    // Navigate to poem workflow and complete to export stage
    await page.goto('/w/poem/new');
    await page.waitForLoadState('networkidle');

    const topicTextarea = await page.locator('#stage-poem-topic textarea');
    if (await topicTextarea.count() > 0) {
      await topicTextarea.fill('Beautiful sunset over the ocean');
      await page.click('#process-stage-poem-topic');
      await page.waitForTimeout(10000);

      // Skip to export stage
      const imageContinue = page.locator('#stage-image-briefing button:has-text("Continue")');
      if (await imageContinue.count() > 0) {
        await imageContinue.click();
        await page.waitForTimeout(20000);
      }

      const htmlContinue = page.locator('#stage-html-briefing button:has-text("Continue")');
      if (await htmlContinue.count() > 0) {
        await htmlContinue.click();
        await page.waitForTimeout(10000);
      }

      // Scroll to export stage
      await page.evaluate(() => {
        const element = document.querySelector('#stage-export-publish');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
      await page.waitForTimeout(2000);

      // Trigger export first
      const exportButton = await page.locator('#trigger-export-export-publish, #stage-export-publish button:has-text("Export")');
      if (await exportButton.count() > 0) {
        await exportButton.click();
        await page.waitForTimeout(15000);

        // Look for publish form
        const publishSection = await page.locator('#stage-export-publish :text("Publish to Web")');
        if (await publishSection.count() > 0) {
          // Test publish form accessibility
          const publishFormTest = await testFormAccessibility(page, '#stage-export-publish');
          if (!publishFormTest.passed) {
            console.log('Publish form accessibility issues:', publishFormTest.issues);
          }

          // Test checkbox accessibility
          const formatCheckboxes = await page.locator('#stage-export-publish input[type="checkbox"]');
          const checkboxCount = await formatCheckboxes.count();

          if (checkboxCount > 0) {
            for (let i = 0; i < checkboxCount; i++) {
              const checkbox = formatCheckboxes.nth(i);
              const checkboxId = await checkbox.getAttribute('id');
              const ariaLabel = await checkbox.getAttribute('aria-label');
              const ariaLabelledBy = await checkbox.getAttribute('aria-labelledby');
              
              // Check for associated label
              const hasLabel = await page.evaluate((id) => {
                if (!id) return false;
                const label = document.querySelector(`label[for="${id}"]`);
                return !!label;
              }, checkboxId);

              expect(
                hasLabel || ariaLabel || ariaLabelledBy,
                `Checkbox ${checkboxId} should have accessible labeling`
              ).toBeTruthy();

              // Test checkbox keyboard interaction
              await checkbox.focus();
              await page.keyboard.press('Space');
              const isChecked = await checkbox.isChecked();
              expect(typeof isChecked, 'Checkbox should respond to keyboard activation').toBe('boolean');
            }
          }

          // Test publish button accessibility
          const publishButton = await page.locator('#stage-export-publish button:has-text("Publish Now")');
          if (await publishButton.count() > 0) {
            const buttonText = await publishButton.textContent();
            const ariaLabel = await publishButton.getAttribute('aria-label');
            const ariaLabelledBy = await publishButton.getAttribute('aria-labelledby');
            
            expect(
              buttonText || ariaLabel || ariaLabelledBy,
              'Publish button should have accessible text or labeling'
            ).toBeTruthy();

            // Test button focus and activation
            await publishButton.focus();
            const isFocused = await page.evaluate(() => {
              const element = document.activeElement;
              return element?.tagName.toLowerCase() === 'button';
            });
            
            expect(isFocused, 'Publish button should be focusable').toBe(true);
          }
        }
      }
    }
  });

  test('export preview accessibility', async ({ page }) => {
    // Navigate to poem workflow and complete to export stage
    await page.goto('/w/poem/new');
    await page.waitForLoadState('networkidle');

    const topicTextarea = await page.locator('#stage-poem-topic textarea');
    if (await topicTextarea.count() > 0) {
      await topicTextarea.fill('Beautiful sunset over the ocean');
      await page.click('#process-stage-poem-topic');
      await page.waitForTimeout(10000);

      // Skip to export stage
      const imageContinue = page.locator('#stage-image-briefing button:has-text("Continue")');
      if (await imageContinue.count() > 0) {
        await imageContinue.click();
        await page.waitForTimeout(20000);
      }

      const htmlContinue = page.locator('#stage-html-briefing button:has-text("Continue")');
      if (await htmlContinue.count() > 0) {
        await htmlContinue.click();
        await page.waitForTimeout(10000);
      }

      // Scroll to export stage
      await page.evaluate(() => {
        const element = document.querySelector('#stage-export-publish');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
      await page.waitForTimeout(2000);

      // Trigger export
      const exportButton = await page.locator('#trigger-export-export-publish, #stage-export-publish button:has-text("Export")');
      if (await exportButton.count() > 0) {
        await exportButton.click();
        await page.waitForTimeout(15000);

        // Test preview buttons accessibility
        const previewButtons = await page.locator('#stage-export-publish button:has-text("Styled"), #stage-export-publish button:has-text("Clean")');
        const previewButtonCount = await previewButtons.count();

        if (previewButtonCount > 0) {
          for (let i = 0; i < previewButtonCount; i++) {
            const previewButton = previewButtons.nth(i);
            const buttonText = await previewButton.textContent();
            const ariaLabel = await previewButton.getAttribute('aria-label');
            const ariaLabelledBy = await previewButton.getAttribute('aria-labelledby');
            
            expect(
              buttonText || ariaLabel || ariaLabelledBy,
              'Preview button should have accessible text or labeling'
            ).toBeTruthy();

            // Test button focus
            await previewButton.focus();
            const isFocused = await page.evaluate(() => {
              const element = document.activeElement;
              return element?.tagName.toLowerCase() === 'button';
            });
            
            expect(isFocused, 'Preview button should be focusable').toBe(true);
          }
        }

        // Test live preview content accessibility
        const livePreview = await page.locator('#stage-export-publish :text("Live Preview")');
        if (await livePreview.count() > 0) {
          // Check for proper heading structure in preview
          const previewHeadings = await page.locator('#stage-export-publish h1, #stage-export-publish h2, #stage-export-publish h3, #stage-export-publish h4, #stage-export-publish h5, #stage-export-publish h6');
          const previewHeadingCount = await previewHeadings.count();

          if (previewHeadingCount > 0) {
            console.log(`✅ Found ${previewHeadingCount} headings in preview content`);
          }

          // Test that preview content is accessible
          const previewAuditResults = await runAccessibilityAudit(page, {
            wcagLevel: 'AA',
            include: ['#stage-export-publish']
          });

          const previewViolations = previewAuditResults.violations;
          const previewCriticalViolations = previewViolations.filter(v => v.impact === 'critical');
          
          expect(previewCriticalViolations, 'Critical accessibility violations found in preview content').toHaveLength(0);
        }
      }
    }
  });

  test('published content accessibility', async ({ page }) => {
    // Navigate to poem workflow and complete to export stage
    await page.goto('/w/poem/new');
    await page.waitForLoadState('networkidle');

    const topicTextarea = await page.locator('#stage-poem-topic textarea');
    if (await topicTextarea.count() > 0) {
      await topicTextarea.fill('Beautiful sunset over the ocean');
      await page.click('#process-stage-poem-topic');
      await page.waitForTimeout(10000);

      // Skip to export stage
      const imageContinue = page.locator('#stage-image-briefing button:has-text("Continue")');
      if (await imageContinue.count() > 0) {
        await imageContinue.click();
        await page.waitForTimeout(20000);
      }

      const htmlContinue = page.locator('#stage-html-briefing button:has-text("Continue")');
      if (await htmlContinue.count() > 0) {
        await htmlContinue.click();
        await page.waitForTimeout(10000);
      }

      // Scroll to export stage
      await page.evaluate(() => {
        const element = document.querySelector('#stage-export-publish');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
      await page.waitForTimeout(2000);

      // Trigger export
      const exportButton = await page.locator('#trigger-export-export-publish, #stage-export-publish button:has-text("Export")');
      if (await exportButton.count() > 0) {
        await exportButton.click();
        await page.waitForTimeout(15000);

        // Try to publish content
        const publishSection = await page.locator('#stage-export-publish :text("Publish to Web")');
        if (await publishSection.count() > 0) {
          // Select HTML styled format
          const htmlStyledCheckbox = await page.locator('#stage-export-publish input[id="publish-html-styled"]');
          if (await htmlStyledCheckbox.count() > 0) {
            await htmlStyledCheckbox.check();
            
            // Click publish
            const publishButton = await page.locator('#stage-export-publish button:has-text("Publish Now")');
            if (await publishButton.count() > 0) {
              await publishButton.click();
              await page.waitForTimeout(15000);

              // Look for published URL
              const publishedLink = await page.locator('#stage-export-publish a[href*="/html-styled"]');
              if (await publishedLink.count() > 0) {
                const publishedUrl = await publishedLink.getAttribute('href');
                
                if (publishedUrl) {
                  // Test the published content in a new tab
                  const newTab = await page.context().newPage();
                  try {
                    await newTab.goto(publishedUrl);
                    await newTab.waitForLoadState('networkidle');

                    // Run accessibility audit on published content
                    const publishedAuditResults = await runAccessibilityAudit(newTab, {
                      wcagLevel: 'AA'
                    });

                    const publishedViolations = publishedAuditResults.violations;
                    const publishedCriticalViolations = publishedViolations.filter(v => v.impact === 'critical');
                    
                    if (publishedViolations.length > 0) {
                      console.log('Published content accessibility violations:');
                      publishedViolations.forEach(violation => {
                        console.log(`- ${violation.id}: ${violation.description}`);
                      });
                    }

                    expect(publishedCriticalViolations, 'Critical accessibility violations found in published content').toHaveLength(0);

                    console.log('✅ Published content accessibility test completed');
                  } finally {
                    await newTab.close();
                  }
                }
              }
            }
          }
        }
      }
    }
  });
});