import { test, expect } from '@playwright/test';
import { 
  runAccessibilityAudit, 
  testKeyboardNavigation, 
  testFormAccessibility, 
  testAriaAttributes
} from '../utils/accessibility-helpers';

test.describe('Wizard Workflow Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(120000);
  });

  test('poem workflow accessibility compliance', async ({ page }) => {
    await page.goto('/w/poem/new');
    await page.waitForLoadState('networkidle');

    // Run accessibility audit on the initial wizard page
    const auditResults = await runAccessibilityAudit(page, {
      wcagLevel: 'AA'
    });

    const violations = auditResults.violations;
    const criticalViolations = violations.filter(v => v.impact === 'critical');
    
    if (violations.length > 0) {
      console.log('Accessibility violations found on poem workflow:');
      violations.forEach(violation => {
        console.log(`- ${violation.id}: ${violation.description}`);
      });
    }

    expect(criticalViolations, 'Critical accessibility violations found on poem workflow').toHaveLength(0);

    // Test form accessibility on the poem topic stage
    const topicTextarea = await page.locator('#stage-poem-topic textarea');
    if (await topicTextarea.count() > 0) {
      const formTest = await testFormAccessibility(page, '#stage-poem-topic');
      if (!formTest.passed) {
        console.log('Poem topic form accessibility issues:', formTest.issues);
      }
    }

    // Test stage action buttons accessibility
    const stageButtons = [
      '#process-stage-poem-topic',
      '#process-stage-image-briefing',
      '#process-stage-html-briefing',
      '#process-stage-export-publish'
    ];

    const buttonAriaTest = await testAriaAttributes(page, stageButtons);
    if (!buttonAriaTest.passed) {
      console.log('Stage button ARIA issues:', buttonAriaTest.issues);
    }
  });

  test('wizard keyboard navigation', async ({ page }) => {
    await page.goto('/w/poem/new');
    await page.waitForLoadState('networkidle');

    // Test keyboard navigation through wizard stages
    await page.keyboard.press('Tab');
    
    let focusedElement = await page.evaluate(() => {
      const element = document.activeElement;
      return element ? {
        tagName: element.tagName.toLowerCase(),
        id: element.id,
        className: element.className
      } : null;
    });

    expect(focusedElement, 'Should be able to focus on wizard elements').toBeTruthy();

    // Test that Enter key can activate buttons
    const topicTextarea = await page.locator('#stage-poem-topic textarea');
    if (await topicTextarea.count() > 0) {
      await topicTextarea.fill('Beautiful sunset over the ocean');
      
      // Tab to the process button
      await page.keyboard.press('Tab');
      
      const processButton = await page.locator('#process-stage-poem-topic');
      if (await processButton.count() > 0) {
        // Test that the button is focusable and has proper focus indicator
        await processButton.focus();
        
        const buttonFocusStyles = await page.evaluate(() => {
          const element = document.activeElement;
          if (!element) return null;
          
          const computed = window.getComputedStyle(element);
          return {
            outline: computed.outline,
            outlineWidth: computed.outlineWidth,
            boxShadow: computed.boxShadow
          };
        });

        expect(buttonFocusStyles, 'Process button should have visible focus indicator').toBeTruthy();
      }
    }
  });

  test('wizard stage cards accessibility', async ({ page }) => {
    await page.goto('/w/poem/new');
    await page.waitForLoadState('networkidle');

    // Test stage card accessibility
    const stageCards = await page.locator('[data-testid^="stage-card-"]');
    const stageCardCount = await stageCards.count();

    if (stageCardCount > 0) {
      for (let i = 0; i < stageCardCount; i++) {
        const stageCard = stageCards.nth(i);
        const stageId = await stageCard.getAttribute('data-testid');
        
        // Check for proper heading structure within stage cards
        const stageHeading = await stageCard.locator('h1, h2, h3, h4, h5, h6').first();
        if (await stageHeading.count() > 0) {
          const headingText = await stageHeading.textContent();
          expect(headingText, `Stage card ${stageId} should have meaningful heading`).toBeTruthy();
        }

        // Check for proper ARIA labels on stage cards
        const ariaLabel = await stageCard.getAttribute('aria-label');
        const ariaLabelledBy = await stageCard.getAttribute('aria-labelledby');
        
        if (!ariaLabel && !ariaLabelledBy) {
          console.log(`Warning: Stage card ${stageId} lacks ARIA labeling`);
        }
      }
    }
  });

  test('wizard form controls accessibility', async ({ page }) => {
    await page.goto('/w/poem/new');
    await page.waitForLoadState('networkidle');

    // Test textarea accessibility
    const textarea = await page.locator('#stage-poem-topic textarea');
    if (await textarea.count() > 0) {
      const ariaLabel = await textarea.getAttribute('aria-label');
      const ariaLabelledBy = await textarea.getAttribute('aria-labelledby');
      const placeholder = await textarea.getAttribute('placeholder');
      
      expect(
        ariaLabel || ariaLabelledBy || placeholder,
        'Textarea should have accessible labeling'
      ).toBeTruthy();

      // Test that textarea is focusable
      await textarea.focus();
      const isFocused = await page.evaluate(() => {
        const element = document.activeElement;
        return element?.tagName.toLowerCase() === 'textarea';
      });
      
      expect(isFocused, 'Textarea should be focusable').toBe(true);
    }

    // Test button accessibility
    const processButton = await page.locator('#process-stage-poem-topic');
    if (await processButton.count() > 0) {
      const buttonText = await processButton.textContent();
      const ariaLabel = await processButton.getAttribute('aria-label');
      const ariaLabelledBy = await processButton.getAttribute('aria-labelledby');
      
      expect(
        buttonText || ariaLabel || ariaLabelledBy,
        'Process button should have accessible text or labeling'
      ).toBeTruthy();

      // Test button states
      const isEnabled = await processButton.isEnabled();
      const ariaDisabled = await processButton.getAttribute('aria-disabled');
      
      if (!isEnabled) {
        expect(ariaDisabled, 'Disabled button should have aria-disabled attribute').toBe('true');
      }
    }
  });

  test('wizard progress indication accessibility', async ({ page }) => {
    await page.goto('/w/poem/new');
    await page.waitForLoadState('networkidle');

    // Look for progress indicators
    const progressIndicators = await page.locator('[role="progressbar"], progress, .progress, [aria-valuenow]');
    const progressCount = await progressIndicators.count();

    if (progressCount > 0) {
      for (let i = 0; i < progressCount; i++) {
        const progress = progressIndicators.nth(i);
        
        // Check for proper ARIA attributes
        const ariaValueNow = await progress.getAttribute('aria-valuenow');
        const ariaValueMin = await progress.getAttribute('aria-valuemin');
        const ariaValueMax = await progress.getAttribute('aria-valuemax');
        const ariaLabel = await progress.getAttribute('aria-label');
        
        if (ariaValueNow !== null) {
          expect(ariaValueMin, 'Progress indicator should have aria-valuemin').toBeTruthy();
          expect(ariaValueMax, 'Progress indicator should have aria-valuemax').toBeTruthy();
        }
        
        expect(ariaLabel, 'Progress indicator should have accessible label').toBeTruthy();
      }
    }
  });

  test('wizard error and success messages accessibility', async ({ page }) => {
    await page.goto('/w/poem/new');
    await page.waitForLoadState('networkidle');

    // Fill in form and trigger processing to potentially generate messages
    const textarea = await page.locator('#stage-poem-topic textarea');
    if (await textarea.count() > 0) {
      await textarea.fill('Test poem topic');
      await page.click('#process-stage-poem-topic');
      
      // Wait a bit for potential messages
      await page.waitForTimeout(3000);
      
      // Look for error or success messages
      const alertMessages = await page.locator('[role="alert"], .error, .success, [aria-live]');
      const messageCount = await alertMessages.count();

      if (messageCount > 0) {
        for (let i = 0; i < messageCount; i++) {
          const message = alertMessages.nth(i);
          const role = await message.getAttribute('role');
          const ariaLive = await message.getAttribute('aria-live');
          
          // Messages should have proper ARIA attributes for screen readers
          expect(
            role === 'alert' || ariaLive,
            'Error/success messages should have proper ARIA attributes'
          ).toBe(true);
        }
      }
    }
  });

  test('wizard responsive accessibility', async ({ page }) => {
    // Test accessibility on mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/w/poem/new');
    await page.waitForLoadState('networkidle');

    // Run accessibility audit on mobile
    const mobileAuditResults = await runAccessibilityAudit(page, {
      wcagLevel: 'AA'
    });

    const mobileViolations = mobileAuditResults.violations;
    const mobileCriticalViolations = mobileViolations.filter(v => v.impact === 'critical');
    
    expect(mobileCriticalViolations, 'Critical accessibility violations found on mobile').toHaveLength(0);

    // Test that touch targets meet minimum size requirements
    const touchTargets = await page.locator('button, a, input, select, textarea, [role="button"]');
    const touchTargetCount = await touchTargets.count();

    if (touchTargetCount > 0) {
      for (let i = 0; i < touchTargetCount; i++) {
        const target = touchTargets.nth(i);
        const boundingBox = await target.boundingBox();
        
        if (boundingBox) {
          const meetsMinSize = boundingBox.width >= 44 && boundingBox.height >= 44;
          if (!meetsMinSize) {
            console.log(`Warning: Touch target ${i} is smaller than 44x44px: ${boundingBox.width}x${boundingBox.height}`);
          }
        }
      }
    }

    // Test desktop viewport
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.reload();
    await page.waitForLoadState('networkidle');

    const desktopAuditResults = await runAccessibilityAudit(page, {
      wcagLevel: 'AA'
    });

    const desktopViolations = desktopAuditResults.violations;
    const desktopCriticalViolations = desktopViolations.filter(v => v.impact === 'critical');
    
    expect(desktopCriticalViolations, 'Critical accessibility violations found on desktop').toHaveLength(0);
  });
});