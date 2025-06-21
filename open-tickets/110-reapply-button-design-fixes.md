# Reapply Keyboard Hint and Export Stage Enhancements

**Created:** 2025-06-21
**Priority:** Medium
**Component:** UI/UX, Keyboard Shortcuts, Export System
**Type:** Feature Enhancement

## Background

After analyzing recent changes, there are some UI improvements that were added but later modified or removed. This ticket focuses ONLY on changes that are NOT currently in our codebase.

## Changes NOT in Current Code That Should Be Implemented

### 1. Export Stage Card Enhanced (Job-Based System)

**What's NOT in our code:**
- The `ExportStageCardEnhanced` component with job-based export system
- The `useExportJobStatus` hook for tracking export progress
- Background job processing that survives page reloads

**Current situation:**
- We still use the original `ExportStageCard` 
- Export processing happens inline (not job-based)
- Progress is lost on page reload

**Why we might want this:**
- Export jobs can run in background
- Progress survives page reloads
- Better error recovery
- No RSC callback violations

### 2. Smart Keyboard Hint Logic

**What's NOT in our code:**
- The sophisticated `getPrimaryAction()` logic that determines which action gets CMD+Enter
- Context-aware keyboard hints based on current stage state
- The `primaryAction` variable that tracks what CMD+Enter will do

**Current situation:**
- Keyboard hints are shown statically
- No smart detection of which action is primary

**Code that would be added:**
```typescript
// Determine which action is "primary" for CMD+Enter
const getPrimaryAction = () => {
  if (isEditingInput && stage.inputType !== 'none') return 'submit-form';
  if (stageState.isEditingOutput) return 'save-edits';
  if (showPrimaryActionButton) return 'run-stage';
  return null;
};

const primaryAction = getPrimaryAction();
const showKeyboardHint = primaryAction !== null;
```

### 3. Enhanced Form Field Test IDs

**What's NOT in our code:**
- Comprehensive `data-testid` and `id` attributes on all form fields
- Test IDs for select options and content areas

**Example additions:**
```typescript
data-testid={`textarea-${field.name}`}
id={`textarea-${field.name}`}
data-testid={`select-content-${field.name}`}
data-testid={`option-${field.name}-${option.value}`}
```

## Implementation Recommendations

### Priority 1: Export Job System (Optional - Complex)
This is a major architectural change that would require:
- Creating job collection in Firestore
- Background job processor
- New hooks for job status tracking
- Migration of existing export logic

**Recommendation:** Only implement if export timeout/reliability is an issue

### Priority 2: Smart Keyboard Hints (Recommended)
This improves UX without major changes:
- Add `getPrimaryAction()` logic
- Make keyboard hints context-aware
- Show hints only when relevant

### Priority 3: Test IDs (Recommended)
Simple addition that improves testability:
- Add comprehensive test IDs to all form elements
- Follow consistent naming pattern
- No functional changes

## Notes

These changes represent enhancements that were developed but not merged into our current codebase. The export job system is a significant architectural change, while the keyboard hints and test IDs are simple UX improvements.