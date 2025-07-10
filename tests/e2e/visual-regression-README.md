# Visual Regression Testing

This directory contains comprehensive visual regression tests for the wizard components using Playwright screenshot comparison.

## Overview

Visual regression tests capture screenshots of UI components in different states and compare them against baseline images to detect visual changes. This helps ensure that UI changes don't introduce unintended visual regressions.

## Test Coverage

The visual regression tests cover the following wizard components and states:

### 1. Wizard Shell States
- **Initial state**: Empty wizard with no stages completed
- **Workflow progression**: Multiple stages with completed and pending states
- **Mobile responsive**: Mobile viewport rendering
- **Full workflow completed**: All stages completed

### 2. Stage Card States
- **Empty state**: Stage card with no user input
- **With input**: Stage card with user input filled
- **Processing state**: Stage card during AI processing
- **Completed state**: Stage card with AI output
- **Error state**: Stage card with error conditions

### 3. Component-Specific Tests
- **Input areas**: Different input types (textarea, form fields, file upload)
- **Output areas**: Different output formats (text, JSON, HTML, images)
- **Export stage**: Export functionality and options

## Running Visual Regression Tests

### Prerequisites
- Next.js development server running on port 9002
- Playwright dependencies installed

### Commands

```bash
# Run all visual regression tests
npm run test:visual

# Update baseline screenshots (run this when UI changes are intentional)
npm run test:visual:update

# Run specific visual regression test
npx playwright test wizard-visual-regression.spec.ts --project=visual-regression

# Run with UI mode for debugging
npx playwright test wizard-visual-regression.spec.ts --project=visual-regression --ui
```

## Test Configuration

Visual regression tests use a dedicated Playwright project configuration:

- **Browser**: Chrome only (for consistency)
- **Viewport**: 1280x720 (consistent across tests)
- **Headless**: Always true
- **Animations**: Disabled for consistent screenshots
- **Font rendering**: Optimized for consistent text rendering

## Screenshot Comparison Settings

- **Threshold**: 0.3 (30% difference tolerance)
- **Mode**: 'actual' (compares actual vs expected pixels)
- **Animations**: Disabled for consistency

## Baseline Images

Baseline screenshots are stored in the `tests/e2e/wizard-visual-regression.spec.ts-snapshots/` directory. These images serve as the "expected" state for comparison.

## Test Structure

Each test follows this pattern:

1. **Setup**: Navigate to the wizard page
2. **State preparation**: Fill forms, trigger actions to reach desired state
3. **Stabilization**: Wait for animations and async operations
4. **Screenshot capture**: Take screenshot of specific UI elements
5. **Comparison**: Compare against baseline image

## Best Practices

### Writing Visual Tests

1. **Use specific selectors**: Always use data-testid attributes or specific IDs
2. **Wait for stability**: Allow sufficient time for UI to settle
3. **Disable animations**: Ensure consistent rendering
4. **Test specific components**: Focus on individual components rather than full pages

### Maintaining Visual Tests

1. **Update baselines carefully**: Only update when changes are intentional
2. **Review changes**: Always manually review screenshot diffs
3. **Test across environments**: Ensure consistency across different machines
4. **Document changes**: Note reasons for baseline updates

### Troubleshooting

#### Common Issues

1. **Font rendering differences**: Ensure consistent font loading
2. **Timing issues**: Add appropriate waits for dynamic content
3. **Animation interference**: Disable animations in test setup
4. **Viewport inconsistencies**: Use fixed viewport sizes

#### Debugging Failed Tests

1. **Check screenshot diff**: Review the diff images in test results
2. **Run in headed mode**: Use `--headed` flag to see what's happening
3. **Add debug screenshots**: Use `page.screenshot()` to capture intermediate states
4. **Check console logs**: Look for JavaScript errors that might affect rendering

## Integration with CI/CD

Visual regression tests are designed to run in CI environments:

- Tests run in headless mode
- Consistent viewport and browser settings
- Deterministic font rendering
- Reasonable timeout values

## Contributing

When adding new visual regression tests:

1. **Follow naming conventions**: Use descriptive test names
2. **Add documentation**: Document what the test covers
3. **Test locally**: Ensure tests pass consistently
4. **Update this README**: Add new test coverage information

## Selectors Reference

Common selectors used in visual regression tests:

```javascript
// Stage cards
'[data-testid="stage-card-poem-topic"]'
'[data-testid="stage-card-image-briefing"]'
'[data-testid="stage-card-export"]'

// Action buttons
'#process-stage-poem-topic'
'#process-stage-image-briefing'
'#trigger-export-export'

// Form fields
'#textarea-poem-topic'
'#select-chosenTitle'
'#checkbox-includeImages'

// Page elements
'[data-testid="wizard-page-title"]'
'[data-testid="wizard-progress-bar"]'
'body' // For full page screenshots
```

## Related Documentation

- [Playwright Visual Comparisons](https://playwright.dev/docs/test-screenshots)
- [CLAUDE.md Testing Guidelines](../../CLAUDE.md#testing-guidelines)
- [Wizard Components Documentation](../../src/components/wizard/README.md)