# Accessibility Testing Guide

This guide covers the automated accessibility testing implementation for Franz AI Writer using axe-core and Playwright.

## Overview

The accessibility testing suite ensures WCAG 2.1 AA compliance across all major components and workflows. It includes:

- **Automated accessibility audits** using axe-core
- **Keyboard navigation testing**
- **Form accessibility validation**
- **ARIA attribute verification**
- **Color contrast testing**
- **Heading hierarchy validation**
- **Focus management testing**

## Test Structure

### Test Files

- `accessibility-general.spec.ts` - General accessibility tests for core pages
- `accessibility-wizard.spec.ts` - Wizard workflow-specific accessibility tests
- `accessibility-export.spec.ts` - Export and publishing accessibility tests

### Helper Utilities

- `utils/accessibility-helpers.ts` - Reusable accessibility testing functions

## Running Accessibility Tests

### Install Dependencies

First, install the required dependencies:

```bash
npm install --save-dev @axe-core/playwright
```

### Run All Accessibility Tests

```bash
npm run test:a11y
```

### Run Specific Test Files

```bash
# General accessibility tests
npx playwright test accessibility-general.spec.ts

# Wizard workflow tests
npx playwright test accessibility-wizard.spec.ts

# Export functionality tests
npx playwright test accessibility-export.spec.ts
```

### Run in Debug Mode

```bash
npx playwright test accessibility-general.spec.ts --debug
```

## Test Coverage

### General Accessibility Tests

- **Homepage compliance** - WCAG AA audit of main landing page
- **Dashboard accessibility** - User dashboard interface compliance
- **Authentication forms** - Login/signup form accessibility
- **Keyboard navigation** - Tab order and focus management
- **Focus visibility** - Focus indicator testing
- **Skip links** - Navigation skip link functionality
- **Landmark elements** - Proper semantic markup
- **Image accessibility** - Alt text and image labeling

### Wizard Workflow Tests

- **Poem workflow compliance** - End-to-end accessibility testing
- **Stage card accessibility** - Proper heading structure and ARIA labels
- **Form controls** - Textarea and button accessibility
- **Progress indicators** - ARIA attributes for progress feedback
- **Error messages** - Proper alert and live region implementation
- **Responsive accessibility** - Mobile and desktop viewport testing

### Export Functionality Tests

- **Export stage compliance** - WCAG audit of export interface
- **Export buttons** - Button accessibility and keyboard interaction
- **Publish form** - Checkbox and form accessibility
- **Preview content** - Generated content accessibility
- **Published content** - Final published page accessibility

## Accessibility Standards

All tests are configured to check for:

- **WCAG 2.1 AA compliance** (configurable to A or AAA)
- **Keyboard navigation** support
- **Screen reader compatibility**
- **Focus management**
- **Color contrast** requirements
- **Semantic HTML** structure
- **ARIA attributes** where appropriate

## Test Configuration

### Axe-Core Configuration

Tests can be configured with various options:

```typescript
await runAccessibilityAudit(page, {
  wcagLevel: 'AA',           // A, AA, or AAA
  disableRules: ['color-contrast'],  // Rules to skip
  enableRules: ['landmark-one-main'], // Rules to enable
  exclude: ['.skip-a11y'],   // Selectors to exclude
  include: ['#main-content'] // Selectors to include only
});
```

### Playwright Configuration

The tests use the existing Playwright configuration with:

- **Headless mode** for CI/CD compatibility
- **Multiple browsers** (Chrome, Firefox, Safari)
- **Mobile viewport** testing
- **Screenshot capture** on failures

## Common Accessibility Issues

The tests check for these common accessibility problems:

### Critical Issues
- Missing alt text on images
- Form inputs without labels
- Missing heading structure
- Keyboard trap situations
- Color contrast violations

### Moderate Issues
- Improper ARIA usage
- Missing skip links
- Incorrect heading hierarchy
- Poor focus management
- Missing landmark elements

### Best Practices
- Semantic HTML usage
- Proper button labeling
- Progress indicator accessibility
- Error message announcements
- Mobile touch target sizes

## Fixing Accessibility Issues

When tests fail, they provide detailed information about violations:

```bash
Accessibility violations found:
- color-contrast: Elements must have sufficient color contrast
  Element: button.primary
  HTML: <button class="primary">Submit</button>
```

Common fixes:

1. **Add ARIA labels**: `aria-label="Submit form"`
2. **Associate labels**: `<label for="email">Email</label><input id="email">`
3. **Add alt text**: `<img alt="User profile picture" src="...">`
4. **Fix heading order**: Use h1, h2, h3 in proper hierarchy
5. **Add skip links**: `<a href="#main-content">Skip to main content</a>`

## Integration with CI/CD

Add to your CI pipeline:

```yaml
- name: Run accessibility tests
  run: npm run test:a11y
```

## Customization

### Adding New Test Cases

1. Create test files in `tests/e2e/` with `accessibility-` prefix
2. Import helpers from `../utils/accessibility-helpers`
3. Use existing patterns for consistency
4. Add specific test cases for new components

### Custom Accessibility Rules

Create custom axe-core rules:

```typescript
const customRules = {
  'custom-button-text': {
    rule: 'buttons must have meaningful text',
    // rule implementation
  }
};
```

## Reporting

Test results include:

- **Violation count** by severity (critical, serious, moderate, minor)
- **Specific elements** that failed
- **Recommended fixes** for each violation
- **WCAG success criteria** references
- **Screenshots** of failures

## Best Practices

1. **Run tests regularly** during development
2. **Fix critical issues** immediately
3. **Test with real users** including assistive technology users
4. **Keep tests updated** with new features
5. **Document accessibility decisions** in code comments

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [axe-core Documentation](https://github.com/dequelabs/axe-core)
- [Playwright Testing](https://playwright.dev/)
- [Web Accessibility Initiative](https://www.w3.org/WAI/)

## Support

For accessibility testing issues:

1. Check the test output for specific violation details
2. Review the accessibility helpers documentation
3. Run tests with `--debug` flag for detailed information
4. Create issues for accessibility bugs found