# Fix Auto-Save Failure After URL Structure Change

**Created**: 2025-01-06
**Priority**: Critical
**Component**: Document Persistence/Auto-save
**Type**: Bug Fix

## Description

After changing the URL structure from `/wizard/[pageId]` to `/w/[documentId]`, the automatic save functionality for wizard documents is failing. This is likely because the auto-save logic is still looking for parameters or routes that no longer exist in the new structure.

## Current Issue

- Auto-save was working with old URL structure `/wizard/[pageId]`
- New URL structure `/w/[documentId]` breaks auto-save
- Documents are not being persisted automatically
- Users may lose work if they don't manually save

## Tasks

- [ ] Debug the auto-save hook (`use-document-persistence.ts`) with new URL structure
- [ ] Update document ID extraction logic for new routes
- [ ] Fix any API calls that use old route parameters
- [ ] Update the persistence logic to work with new document IDs
- [ ] Test auto-save in all wizard stages
- [ ] Add error logging for failed save attempts
- [ ] Verify auto-save indicator shows correct status

## Root Cause Analysis

Likely issues:
- Route parameter name changed from `pageId` to `documentId`
- Path parsing logic expects old URL structure
- Document reference in Firestore may use wrong ID format
- Auto-save may be trying to save to wrong collection path

## Acceptance Criteria

- Auto-save works correctly with new URL structure `/w/[documentId]`
- Changes are persisted to Firestore automatically
- No console errors related to auto-save
- Save indicator shows correct status (saving/saved)
- Document changes persist across page refreshes
- Works for both new and existing documents

## Technical Notes

Check these files:
- `src/hooks/use-document-persistence.ts` - Main auto-save logic
- `src/app/w/[pageId]/wizard-page-content.tsx` - Where hook is used
- `src/lib/documents.ts` - Document save/load functions
- Any API routes that handle document persistence

## Testing

- Create new document and verify auto-save works
- Edit existing document and verify changes persist
- Check browser console for any errors
- Test with different network conditions
- Verify Firestore shows updated timestamps

## Urgency

This is CRITICAL as users are currently losing work without auto-save functionality.