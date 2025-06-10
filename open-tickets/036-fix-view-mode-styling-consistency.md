# Fix View Mode Styling Consistency

**Created**: 2025-01-07
**Priority**: MEDIUM
**Component**: UI/Wizard

## Description
When users click "Continue" and come to view mode, the content appears in a different card (gray one) instead of maintaining the same visual appearance as edit mode. The view mode should look exactly like edit mode but with disabled/readonly textareas instead of switching to a different visual presentation.

## Current Issue
- View mode uses a different card styling (gray card)
- Inconsistent visual experience between edit and view modes
- Users expect the same layout but with disabled inputs
- Current implementation changes the entire card appearance

## Expected Behavior
- View mode should use the same card styling as edit mode
- Textareas should appear identical but be disabled/readonly
- No visual layout changes between edit and view modes
- Consistent user experience throughout the workflow

## Tasks
- [ ] Identify where view mode styling differs from edit mode
- [ ] Update view mode to use same card components as edit mode
- [ ] Ensure textareas are properly disabled but visually consistent
- [ ] Test transition between edit and view modes
- [ ] Verify all form field types maintain consistent styling

## Files to Investigate
- [ ] `src/components/wizard/stage-card.tsx`
- [ ] `src/components/wizard/stage-output-area.tsx`
- [ ] `src/components/wizard/stage-input-area.tsx`
- [ ] Related wizard component styling

## Acceptance Criteria
- [ ] View mode uses identical card styling to edit mode
- [ ] Textareas appear the same but are disabled/readonly
- [ ] No visual jarring when switching between modes
- [ ] Consistent spacing, colors, and layout
- [ ] All form field types maintain visual consistency 