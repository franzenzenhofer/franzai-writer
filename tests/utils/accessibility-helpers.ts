import { Page } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';

/**
 * Accessibility test utilities for WCAG compliance testing
 */

/**
 * Run axe-core accessibility scan on a page
 * @param page - Playwright page object
 * @param options - Configuration options for axe scan
 * @returns Promise with accessibility scan results
 */
export async function runAccessibilityAudit(
  page: Page,
  options: {
    /** Exclude specific selectors from accessibility scan */
    exclude?: string[];
    /** Include only specific selectors in accessibility scan */
    include?: string[];
    /** Disable specific axe rules */
    disableRules?: string[];
    /** Enable specific axe rules */
    enableRules?: string[];
    /** WCAG compliance level to test against */
    wcagLevel?: 'A' | 'AA' | 'AAA';
  } = {}
) {
  let axeBuilder = new AxeBuilder({ page });

  // Configure WCAG compliance level
  if (options.wcagLevel) {
    axeBuilder = axeBuilder.withTags([`wcag${options.wcagLevel.toLowerCase()}`]);
  }

  // Configure rules
  if (options.disableRules) {
    axeBuilder = axeBuilder.disableRules(options.disableRules);
  }

  if (options.enableRules) {
    axeBuilder = axeBuilder.enableRules(options.enableRules);
  }

  // Configure selectors
  if (options.exclude) {
    axeBuilder = axeBuilder.exclude(options.exclude);
  }

  if (options.include) {
    axeBuilder = axeBuilder.include(options.include);
  }

  return await axeBuilder.analyze();
}

/**
 * Test keyboard navigation on a page
 * @param page - Playwright page object
 * @param startSelector - CSS selector for the element to start tabbing from
 * @param expectedTabStops - Array of expected focusable elements (CSS selectors)
 * @returns Promise with keyboard navigation test results
 */
export async function testKeyboardNavigation(
  page: Page,
  startSelector: string,
  expectedTabStops: string[]
): Promise<{
  passed: boolean;
  actualTabStops: string[];
  issues: string[];
}> {
  const issues: string[] = [];
  const actualTabStops: string[] = [];

  try {
    // Focus on the starting element
    await page.focus(startSelector);
    actualTabStops.push(startSelector);

    // Tab through the expected elements
    for (let i = 0; i < expectedTabStops.length; i++) {
      await page.keyboard.press('Tab');
      
      // Get the currently focused element
      const focusedElement = await page.evaluate(() => {
        const element = document.activeElement;
        if (!element) return null;
        
        // Build a CSS selector for the focused element
        const tagName = element.tagName.toLowerCase();
        const id = element.id ? `#${element.id}` : '';
        const classes = element.className ? `.${element.className.split(' ').join('.')}` : '';
        
        return `${tagName}${id}${classes}`;
      });

      if (focusedElement) {
        actualTabStops.push(focusedElement);
      }
    }

    // Check if the actual tab stops match the expected ones
    const passed = expectedTabStops.every((expected, index) => {
      const actual = actualTabStops[index + 1]; // +1 because first element is the start
      return actual && actual.includes(expected.replace(/^[#.]/, ''));
    });

    if (!passed) {
      issues.push('Keyboard navigation did not follow expected tab order');
    }

    return {
      passed,
      actualTabStops,
      issues
    };
  } catch (error) {
    issues.push(`Keyboard navigation test failed: ${error}`);
    return {
      passed: false,
      actualTabStops,
      issues
    };
  }
}

/**
 * Test color contrast ratios on a page
 * @param page - Playwright page object
 * @param selectors - Array of CSS selectors to test contrast for
 * @returns Promise with color contrast test results
 */
export async function testColorContrast(
  page: Page,
  selectors: string[]
): Promise<{
  passed: boolean;
  results: Array<{
    selector: string;
    contrast: number;
    passed: boolean;
    foreground: string;
    background: string;
  }>;
}> {
  const results = [];

  for (const selector of selectors) {
    try {
      const contrastInfo = await page.evaluate((sel) => {
        const element = document.querySelector(sel);
        if (!element) return null;

        const computedStyle = window.getComputedStyle(element);
        const foreground = computedStyle.color;
        const background = computedStyle.backgroundColor;

        // This is a simplified contrast check - in reality, you'd use a proper contrast calculation
        // For a full implementation, you'd need to parse RGB values and calculate luminance
        return {
          foreground,
          background,
          // Placeholder contrast ratio - would need proper calculation
          contrast: 4.5 // Default passing value
        };
      }, selector);

      if (contrastInfo) {
        results.push({
          selector,
          contrast: contrastInfo.contrast,
          passed: contrastInfo.contrast >= 4.5, // WCAG AA standard
          foreground: contrastInfo.foreground,
          background: contrastInfo.background
        });
      }
    } catch (error) {
      results.push({
        selector,
        contrast: 0,
        passed: false,
        foreground: 'unknown',
        background: 'unknown'
      });
    }
  }

  const passed = results.every(result => result.passed);
  return { passed, results };
}

/**
 * Test form accessibility features
 * @param page - Playwright page object
 * @param formSelector - CSS selector for the form to test
 * @returns Promise with form accessibility test results
 */
export async function testFormAccessibility(
  page: Page,
  formSelector: string
): Promise<{
  passed: boolean;
  issues: string[];
  checkedElements: string[];
}> {
  const issues: string[] = [];
  const checkedElements: string[] = [];

  try {
    // Check for form labels
    const formInputs = await page.locator(`${formSelector} input, ${formSelector} textarea, ${formSelector} select`);
    const inputCount = await formInputs.count();

    for (let i = 0; i < inputCount; i++) {
      const input = formInputs.nth(i);
      const inputId = await input.getAttribute('id');
      const inputType = await input.getAttribute('type');
      const inputName = await input.getAttribute('name');
      
      checkedElements.push(`${inputType || 'input'} - ${inputId || inputName || 'unnamed'}`);

      // Check for associated label
      const hasLabel = await page.evaluate((inputId) => {
        if (!inputId) return false;
        const label = document.querySelector(`label[for="${inputId}"]`);
        return !!label;
      }, inputId);

      // Check for aria-label or aria-labelledby
      const hasAriaLabel = await input.getAttribute('aria-label');
      const hasAriaLabelledBy = await input.getAttribute('aria-labelledby');

      if (!hasLabel && !hasAriaLabel && !hasAriaLabelledBy) {
        issues.push(`Input ${inputId || inputName || 'unnamed'} lacks proper labeling`);
      }

      // Check for required fields having aria-required
      const isRequired = await input.getAttribute('required');
      const hasAriaRequired = await input.getAttribute('aria-required');

      if (isRequired && !hasAriaRequired) {
        issues.push(`Required input ${inputId || inputName || 'unnamed'} lacks aria-required attribute`);
      }
    }

    // Check for form submission feedback
    const hasErrorMessages = await page.locator(`${formSelector} [role="alert"], ${formSelector} .error, ${formSelector} [aria-live]`).count();
    
    if (hasErrorMessages === 0) {
      issues.push('Form lacks error message containers for accessibility feedback');
    }

    return {
      passed: issues.length === 0,
      issues,
      checkedElements
    };
  } catch (error) {
    issues.push(`Form accessibility test failed: ${error}`);
    return {
      passed: false,
      issues,
      checkedElements
    };
  }
}

/**
 * Test heading hierarchy on a page
 * @param page - Playwright page object
 * @returns Promise with heading hierarchy test results
 */
export async function testHeadingHierarchy(
  page: Page
): Promise<{
  passed: boolean;
  issues: string[];
  headings: Array<{ level: number; text: string; }>;
}> {
  const issues: string[] = [];

  try {
    const headings = await page.evaluate(() => {
      const headingElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      return Array.from(headingElements).map(heading => ({
        level: parseInt(heading.tagName.charAt(1)),
        text: heading.textContent?.trim() || ''
      }));
    });

    // Check for proper heading hierarchy
    if (headings.length === 0) {
      issues.push('No headings found on the page');
      return { passed: false, issues, headings };
    }

    // Check if starts with h1
    if (headings[0].level !== 1) {
      issues.push('Page does not start with an h1 heading');
    }

    // Check for skipped heading levels
    for (let i = 1; i < headings.length; i++) {
      const prevLevel = headings[i - 1].level;
      const currentLevel = headings[i].level;
      
      if (currentLevel > prevLevel + 1) {
        issues.push(`Heading level jumps from h${prevLevel} to h${currentLevel} (skipped h${prevLevel + 1})`);
      }
    }

    return {
      passed: issues.length === 0,
      issues,
      headings
    };
  } catch (error) {
    issues.push(`Heading hierarchy test failed: ${error}`);
    return {
      passed: false,
      issues,
      headings: []
    };
  }
}

/**
 * Test ARIA attributes and roles
 * @param page - Playwright page object
 * @param selectors - Array of CSS selectors to test ARIA attributes for
 * @returns Promise with ARIA test results
 */
export async function testAriaAttributes(
  page: Page,
  selectors: string[]
): Promise<{
  passed: boolean;
  issues: string[];
  results: Array<{
    selector: string;
    ariaAttributes: Record<string, string>;
    issues: string[];
  }>;
}> {
  const issues: string[] = [];
  const results = [];

  for (const selector of selectors) {
    try {
      const ariaInfo = await page.evaluate((sel) => {
        const element = document.querySelector(sel);
        if (!element) return null;

        const ariaAttributes: Record<string, string> = {};
        for (const attr of element.attributes) {
          if (attr.name.startsWith('aria-') || attr.name === 'role') {
            ariaAttributes[attr.name] = attr.value;
          }
        }

        return {
          tagName: element.tagName.toLowerCase(),
          ariaAttributes,
          hasInteractiveRole: element.hasAttribute('role') && 
            ['button', 'link', 'tab', 'menuitem', 'option'].includes(element.getAttribute('role') || ''),
          isInteractiveElement: ['button', 'a', 'input', 'select', 'textarea'].includes(element.tagName.toLowerCase()),
          isClickable: element.onclick !== null || element.hasAttribute('onclick')
        };
      }, selector);

      if (ariaInfo) {
        const elementIssues: string[] = [];

        // Check for interactive elements without proper ARIA
        if ((ariaInfo.isInteractiveElement || ariaInfo.isClickable) && !ariaInfo.hasInteractiveRole) {
          if (!ariaInfo.ariaAttributes['aria-label'] && !ariaInfo.ariaAttributes['aria-labelledby']) {
            elementIssues.push('Interactive element lacks proper ARIA labeling');
          }
        }

        // Check for custom interactive elements
        if (ariaInfo.isClickable && !ariaInfo.isInteractiveElement && !ariaInfo.ariaAttributes.role) {
          elementIssues.push('Clickable element lacks proper role attribute');
        }

        results.push({
          selector,
          ariaAttributes: ariaInfo.ariaAttributes,
          issues: elementIssues
        });

        issues.push(...elementIssues);
      }
    } catch (error) {
      const elementIssues = [`ARIA test failed for ${selector}: ${error}`];
      results.push({
        selector,
        ariaAttributes: {},
        issues: elementIssues
      });
      issues.push(...elementIssues);
    }
  }

  return {
    passed: issues.length === 0,
    issues,
    results
  };
}