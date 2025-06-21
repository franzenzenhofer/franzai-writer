# Essential UI/UX Improvements and Button Design Cleanup

**Created:** 2025-06-21
**Priority:** High
**Component:** UI/UX, Button Design, Keyboard Shortcuts
**Type:** Design Consistency Fix

## Background

After analyzing recent changes and branches, there are essential UI/UX improvements that we absolutely need to implement to maintain design consistency and user experience.

## Essential Changes We Need

### 1. Smart Keyboard Hint Display (NEEDED)

**Current Problem:**
- Keyboard hints are shown statically without context
- Users don't know when CMD+Enter will work or what it will do

**Solution to Implement:**
```typescript
// Add smart detection of primary action
const getPrimaryAction = () => {
  if (isEditingInput && stage.inputType !== 'none') return 'submit-form';
  if (stageState.isEditingOutput) return 'save-edits';
  if (showPrimaryActionButton) return 'run-stage';
  return null;
};

const primaryAction = getPrimaryAction();
const showKeyboardHint = primaryAction !== null;

// Show hint only when relevant
{showKeyboardHint && (
  <KeyboardHint className="text-xs text-muted-foreground" />
)}
```

**Why we need this:**
- Clear UX - users know when shortcuts are available
- Reduces confusion about what CMD+Enter does
- Consistent with modern app design

### 2. Button Design Consistency (NEEDED)

**Current Issues:**
- Some buttons may have custom className overrides
- Inconsistent button sizes and variants across the app
- Missing design system documentation

**Required Actions:**
1. Audit all button usage in wizard components
2. Remove ANY custom className overrides on buttons
3. Use only approved variants: `default`, `outline`, `ghost`, `destructive`
4. Use only approved sizes: `sm`, `default`, `lg`

**Example of what NOT to do:**
```typescript
// BAD - custom styles
<Button className="bg-background hover:bg-accent h-8">

// GOOD - use variants and sizes
<Button variant="outline" size="sm">
```

### 3. Form Field Test IDs (NEEDED)

**Why we need this:**
- E2E tests are brittle without proper IDs
- Makes debugging easier
- Required for automated testing

**Implementation:**
```typescript
// Add to all form fields
data-testid={`textarea-${field.name}`}
id={`textarea-${field.name}`}
data-testid={`select-${field.name}`}
data-testid={`checkbox-${field.name}`}
```

## What We DON'T Need

### Export Job System ❌
- Current export system works fine with 30-second timeout
- Job system is overly complex for our needs
- Would require significant backend changes
- Not worth the engineering effort

## Implementation Priority

1. **Button Consistency Audit** (1 day)
   - Find and fix all custom button styles
   - Document approved patterns

2. **Smart Keyboard Hints** (1 day)
   - Implement context-aware hint display
   - Test all interaction modes

3. **Test IDs** (Half day)
   - Add to all form components
   - Update E2E tests to use them

## Success Criteria

- [ ] Zero custom className overrides on Button components
- [ ] Keyboard hints appear only when CMD+Enter is active
- [ ] All form fields have proper test IDs
- [ ] Design system documentation created
- [ ] E2E tests updated to use new IDs

## Notes

Focus on essential improvements only. The export system works fine as-is. These changes improve consistency and testability without major architectural changes.