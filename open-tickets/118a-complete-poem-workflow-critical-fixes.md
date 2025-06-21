# Ticket #118: Complete Poem Workflow - Critical Fixes for Production

**Created:** 2025-06-21  
**Priority:** CRITICAL (P0)  
**Type:** Bug Fixes & Feature Completion  
**Components:** Export Stage, Document Persistence, UI/UX, Button Design  
**Status:** Open

## Executive Summary

The poem workflow example needs several critical fixes to work properly end-to-end. While basic functionality exists, there are showstopper bugs that prevent users from completing the workflow successfully, especially after page reloads.

## Critical Issues That MUST Be Fixed

### 1. Export Stage Data Loss (Ticket #111) - CRITICAL P0
**Problem**: After page reload, ALL export artifacts disappear:
- Styled & Clean HTML previews vanish
- Copy & Download buttons become disabled
- Published URLs are lost forever
- Users cannot recover their exports without re-running the entire stage

**Impact**: This is a DATA LOSS bug - users lose their work and cannot share/export their poems.

**Required Fix**: 
- Implement durable export artifact storage (Cloud Storage)
- Fix `cleanStageStates()` to preserve export data
- Add reconstruction logic for export preview/buttons

### 2. Export Stage Stuck After Reload (Ticket #101) - CRITICAL P0
**Problem**: Export stage gets permanently stuck in "running" status after page reload
- No way to reset or retry
- Document becomes unusable for export
- Blocks users from completing their workflow

**Required Fix**:
- Add export stage recovery logic
- Reset stuck "running" states to "idle" on load
- Implement proper state validation

### 3. Phantom "Update Recommended" Bug (Ticket #114) - HIGH
**Problem**: Never-executed export stages incorrectly show "Update recommended" after reload
- Shows stale warning for content that was never generated
- Invalid state combination (completed but no output)
- Confuses users about what needs to be done

**Required Fix**:
- Add state validation to prevent invalid combinations
- Fix staleness logic to only apply to truly completed stages
- Ensure idle stages remain idle after reload

### 4. Recent Documents Not Showing (Ticket #116) - HIGH
**Problem**: Created poems don't appear in dashboard "Recent documents"
- User ID mismatch between temp sessions and auth
- FATAL error handling prevents graceful fallback
- Users can't find their created documents

**Required Fix**:
- Fix `listUserDocuments()` to handle temp/auth user scenarios
- Add proper fallback logic for document queries
- Ensure documents are findable after creation

### 5. Missing UI Enhancements - MEDIUM

#### A. "Open in New Tab" Button (Ticket #112)
**Need**: Add button next to download in `ImageOutputDisplay` to open images in new tab
- Better viewing experience for generated images
- Consistent with modern web UX expectations

#### B. Footer Links & Legal Pages (Ticket #117)
**Need**: Update footer and create missing pages:
- Remove placeholder GitHub link
- Create Privacy Policy page
- Create Terms of Service page
- Add proper navigation links

## Workflow Functionality Status

### ✅ WORKING
1. **Poem Topic Input** - Working with temp sessions
2. **Poem Generation** - AI generates poem with title successfully
3. **Image Briefing** - Form captures user preferences
4. **Image Prompt Creation** - AI creates optimized prompts
5. **Image Generation** - Google Imagen 3 creates images
6. **HTML Preview Generation** - AI creates HTML with poem and image
7. **Basic Export** - Works on first run (before reload)

### ❌ BROKEN
1. **Export Persistence** - All exports lost on reload
2. **Export Recovery** - Gets stuck in running state
3. **Document Discovery** - Can't find created poems
4. **State Consistency** - Invalid states after reload

## Implementation Plan

### Phase 1: Critical Export Fixes (MUST DO FIRST)
1. **Fix Export Stage Persistence** (Ticket #111)
   - Implement Cloud Storage for export artifacts
   - Fix cleanStageStates() to preserve URLs
   - Add reconstruction logic

2. **Fix Export Stage Recovery** (Ticket #101)
   - Add recovery logic in wizard-shell
   - Reset stuck states on load
   - Add manual recovery UI

3. **Fix Phantom Stale States** (Ticket #114)
   - Add state validation
   - Fix staleness detection logic
   - Prevent invalid state combinations

### Phase 2: Document Management (HIGH PRIORITY)
1. **Fix Recent Documents** (Ticket #116)
   - Update listUserDocuments() logic
   - Handle temp/auth user scenarios
   - Add graceful fallbacks

### Phase 3: UI Polish (MEDIUM PRIORITY)
1. **Add Image "Open in New Tab"** (Ticket #112)
   - Add ExternalLink button
   - Handle data URLs properly

2. **Update Footer & Legal** (Ticket #117)
   - Remove GitHub placeholder
   - Create Privacy/Terms pages
   - Update navigation

## Testing Requirements

### Critical E2E Tests Needed
```typescript
// Test 1: Export persistence across reload
test('export artifacts persist after page reload', async ({ page }) => {
  // Complete poem workflow through export
  // Reload page
  // Verify all export artifacts still available
  // Verify publish URLs still work
});

// Test 2: Export recovery from stuck state
test('recovers stuck export stage after reload', async ({ page }) => {
  // Start export stage
  // Reload immediately
  // Verify stage is not stuck
  // Can complete export normally
});

// Test 3: Document appears in recent list
test('created poem appears in dashboard', async ({ page }) => {
  // Create poem with temp session
  // Navigate to dashboard
  // Verify poem appears in recent documents
});
```

## Acceptance Criteria

### MUST HAVE (Blocking Production)
- [ ] Export artifacts persist after page reload
- [ ] Export stage never gets stuck in "running" 
- [ ] No phantom "Update recommended" warnings
- [ ] Created documents appear in dashboard
- [ ] All existing poem workflow tests pass

### SHOULD HAVE
- [ ] "Open in new tab" for images
- [ ] Updated footer with real links
- [ ] Privacy and Terms pages exist

### Definition of Done
1. User can complete entire poem workflow
2. Reload at any stage doesn't break functionality
3. All generated content persists properly
4. Documents are discoverable after creation
5. No console errors or warnings
6. E2E tests cover all scenarios

## Risk Assessment

**Critical Risk**: Export stage bugs are DATA LOSS issues that will cause users to lose their work. This MUST be fixed before any production release.

**High Risk**: Document discovery issues mean users create content they can't find later, leading to frustration and abandonment.

**Medium Risk**: UI polish issues affect professional appearance but don't block core functionality.

## Priority Justification

This ticket represents the MINIMUM required fixes to have a working poem workflow example. Without these fixes:
- Users lose their exported poems (unacceptable)
- Users can't find their created poems (unacceptable)  
- The workflow appears broken and unreliable (damages trust)

These fixes are MANDATORY before:
- Any marketing or promotion of the poem workflow
- Adding any new features to the workflow
- Creating additional workflow examples

## Estimated Effort

- Export Persistence Fix: 8-10 hours
- Export Recovery Fix: 4-6 hours
- State Validation Fix: 3-4 hours
- Document Discovery Fix: 4-5 hours
- UI Enhancements: 3-4 hours

**Total: 22-29 hours (3-4 days)**

## Next Steps

1. Prioritize fixing export stage persistence (Ticket #111)
2. Then fix export recovery (Ticket #101)
3. Fix state validation (Ticket #114)
4. Fix document discovery (Ticket #116)
5. Add UI enhancements if time permits

**CRITICAL**: Do NOT add any new features until these core issues are resolved!