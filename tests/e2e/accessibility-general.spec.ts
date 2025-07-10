import { test, expect } from '@playwright/test';
import { 
  runAccessibilityAudit, 
  testKeyboardNavigation, 
  testHeadingHierarchy, 
  testAriaAttributes,
  testFormAccessibility
} from '../utils/accessibility-helpers';

test.describe('General Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set a longer timeout for accessibility tests
    test.setTimeout(60000);
  });

  test('homepage accessibility compliance', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Run comprehensive accessibility audit
    const auditResults = await runAccessibilityAudit(page, {
      wcagLevel: 'AA',
      disableRules: ['color-contrast'] // We'll test this separately with better precision
    });

    // Check for violations
    const violations = auditResults.violations;
    if (violations.length > 0) {
      console.log('Accessibility violations found:');
      violations.forEach(violation => {
        console.log(`- ${violation.id}: ${violation.description}`);
        violation.nodes.forEach(node => {
          console.log(`  Element: ${node.target.join(', ')}`);
          console.log(`  HTML: ${node.html}`);
        });
      });
    }

    // Assert no critical violations
    const criticalViolations = violations.filter(v => v.impact === 'critical');
    expect(criticalViolations, 'Critical accessibility violations found').toHaveLength(0);

    // Test heading hierarchy
    const headingTest = await testHeadingHierarchy(page);
    if (!headingTest.passed) {
      console.log('Heading hierarchy issues:', headingTest.issues);
    }
    expect(headingTest.passed, `Heading hierarchy issues: ${headingTest.issues.join(', ')}`).toBe(true);

    // Test main navigation keyboard accessibility
    const navLinks = await page.locator('nav a').count();
    if (navLinks > 0) {
      await page.keyboard.press('Tab');
      const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
      expect(focusedElement, 'Should be able to focus navigation elements').toBeTruthy();
    }
  });

  test('dashboard accessibility compliance', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Run accessibility audit
    const auditResults = await runAccessibilityAudit(page, {
      wcagLevel: 'AA'
    });

    // Check for violations
    const violations = auditResults.violations;
    const criticalViolations = violations.filter(v => v.impact === 'critical');
    expect(criticalViolations, 'Critical accessibility violations found on dashboard').toHaveLength(0);

    // Test ARIA attributes on interactive elements
    const interactiveSelectors = [
      'button',
      'a[href]',
      '[role="button"]',
      'input',
      'select',
      'textarea'
    ];

    const ariaTest = await testAriaAttributes(page, interactiveSelectors);
    if (!ariaTest.passed) {
      console.log('ARIA attribute issues:', ariaTest.issues);
    }
    expect(ariaTest.passed, `ARIA attribute issues: ${ariaTest.issues.join(', ')}`).toBe(true);

    // Test heading hierarchy
    const headingTest = await testHeadingHierarchy(page);
    expect(headingTest.passed, `Heading hierarchy issues: ${headingTest.issues.join(', ')}`).toBe(true);
  });

  test('authentication forms accessibility', async ({ page }) => {
    // Test login form
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Run accessibility audit
    const auditResults = await runAccessibilityAudit(page, {
      wcagLevel: 'AA'
    });

    const violations = auditResults.violations;
    const criticalViolations = violations.filter(v => v.impact === 'critical');
    expect(criticalViolations, 'Critical accessibility violations found on login form').toHaveLength(0);

    // Test form accessibility
    const formTest = await testFormAccessibility(page, 'form');
    if (!formTest.passed) {
      console.log('Form accessibility issues:', formTest.issues);
    }
    expect(formTest.passed, `Form accessibility issues: ${formTest.issues.join(', ')}`).toBe(true);

    // Test signup form
    await page.goto('/signup');
    await page.waitForLoadState('networkidle');

    const signupAuditResults = await runAccessibilityAudit(page, {
      wcagLevel: 'AA'
    });

    const signupViolations = signupAuditResults.violations;
    const signupCriticalViolations = signupViolations.filter(v => v.impact === 'critical');
    expect(signupCriticalViolations, 'Critical accessibility violations found on signup form').toHaveLength(0);
  });

  test('keyboard navigation on main interface', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Test basic keyboard navigation
    await page.keyboard.press('Tab');
    let focusedElement = await page.evaluate(() => {
      const element = document.activeElement;
      return element ? {
        tagName: element.tagName.toLowerCase(),
        id: element.id,
        className: element.className,
        text: element.textContent?.trim() || ''
      } : null;
    });

    expect(focusedElement, 'Should be able to focus on the first tabbable element').toBeTruthy();

    // Test that Tab key moves focus forward
    await page.keyboard.press('Tab');
    const secondFocusedElement = await page.evaluate(() => {
      const element = document.activeElement;
      return element ? {
        tagName: element.tagName.toLowerCase(),
        id: element.id,
        className: element.className,
        text: element.textContent?.trim() || ''
      } : null;
    });

    expect(secondFocusedElement, 'Tab should move focus to next element').toBeTruthy();
    expect(secondFocusedElement).not.toEqual(focusedElement);

    // Test that Shift+Tab moves focus backward
    await page.keyboard.press('Shift+Tab');
    const backwardFocusedElement = await page.evaluate(() => {
      const element = document.activeElement;
      return element ? {
        tagName: element.tagName.toLowerCase(),
        id: element.id,
        className: element.className,
        text: element.textContent?.trim() || ''
      } : null;
    });

    expect(backwardFocusedElement, 'Shift+Tab should move focus to previous element').toEqual(focusedElement);
  });

  test('focus management and visibility', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Test focus visibility
    await page.keyboard.press('Tab');
    
    // Check that focused element has visible focus indicator
    const focusStyles = await page.evaluate(() => {
      const element = document.activeElement;
      if (!element) return null;
      
      const computed = window.getComputedStyle(element);
      return {
        outline: computed.outline,
        outlineWidth: computed.outlineWidth,
        outlineStyle: computed.outlineStyle,
        outlineColor: computed.outlineColor,
        boxShadow: computed.boxShadow,
        borderColor: computed.borderColor,
        borderWidth: computed.borderWidth
      };
    });

    expect(focusStyles, 'Focused element should have visible focus indicator').toBeTruthy();

    // Check that focus indicator is visible (not 'none' or '0px')
    const hasFocusIndicator = focusStyles && (
      (focusStyles.outline !== 'none' && focusStyles.outlineWidth !== '0px') ||
      focusStyles.boxShadow !== 'none' ||
      focusStyles.borderWidth !== '0px'
    );

    expect(hasFocusIndicator, 'Focused element should have visible focus indicator (outline, box-shadow, or border)').toBe(true);
  });

  test('skip links and landmark navigation', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Test for skip links
    const skipLinks = await page.locator('a[href^="#"]').filter({ hasText: /skip to|skip navigation|skip to content/i });
    const skipLinksCount = await skipLinks.count();
    
    if (skipLinksCount > 0) {
      console.log(`Found ${skipLinksCount} skip links`);
      
      // Test that skip links are functional
      const firstSkipLink = skipLinks.first();
      const skipTarget = await firstSkipLink.getAttribute('href');
      
      if (skipTarget) {
        await firstSkipLink.click();
        const targetElement = await page.locator(skipTarget);
        expect(await targetElement.count(), `Skip link target ${skipTarget} should exist`).toBeGreaterThan(0);
      }
    }

    // Test for landmark elements
    const landmarks = await page.locator('main, nav, header, footer, aside, [role="main"], [role="navigation"], [role="banner"], [role="contentinfo"], [role="complementary"]');
    const landmarksCount = await landmarks.count();
    
    expect(landmarksCount, 'Page should have proper landmark elements for screen readers').toBeGreaterThan(0);
  });

  test('image accessibility', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Test all images for alt text
    const images = await page.locator('img');
    const imageCount = await images.count();

    if (imageCount > 0) {
      for (let i = 0; i < imageCount; i++) {
        const img = images.nth(i);
        const alt = await img.getAttribute('alt');
        const src = await img.getAttribute('src');
        const role = await img.getAttribute('role');
        
        // Images should have alt text unless they're decorative
        if (role !== 'presentation' && role !== 'none') {
          expect(alt, `Image ${src} should have alt text for accessibility`).toBeDefined();
          expect(alt, `Image ${src} should have meaningful alt text`).not.toBe('');
        }
      }
    }
  });
});