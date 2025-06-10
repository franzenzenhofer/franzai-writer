# Cleanup Legacy Documents from Database

**Created**: 2025-01-06
**Priority**: High
**Component**: Database/Firestore
**Type**: Data Migration/Cleanup

## Description

The application has evolved its URL structure and document format. Old saved documents in the database use legacy formats and URL structures that are no longer supported. Since this app is under active development, we should clean up all legacy documents and only support the current format with no backwards compatibility.

## Current URL Structure
- New: `/w/[documentId]` (wizard with unique document IDs)
- Legacy: `/wizard/[pageId]` (old structure without document IDs)

## Tasks

- [ ] Identify all documents in Firestore using old URL structures
- [ ] Create a script to delete all legacy documents
- [ ] Remove any code that handles legacy document formats
- [ ] Update Firestore security rules to enforce new document structure
- [ ] Clear any cached documents in user browsers (if applicable)
- [ ] Document the current supported document schema
- [ ] Add validation to prevent saving documents in old formats

## Acceptance Criteria

- All legacy documents are removed from Firestore
- No backwards compatibility code remains
- New documents follow the current URL structure exclusively
- Database only contains documents with the new format
- Application does not attempt to load or handle legacy documents
- Clear error messages if somehow a legacy document is encountered

## Technical Notes

Document identification:
- Legacy documents may have URLs like `/wizard/1`, `/wizard/2`
- New documents use unique IDs in URLs like `/w/abc123`
- Check document schema for missing required fields from new format
- Consider documents without proper workflow references as legacy

## Warning

This is a destructive operation. Ensure:
- Users are notified if needed
- No critical data will be lost
- This aligns with the "active development" status of the app

## Testing

- Verify no legacy documents remain in database
- Test that new document creation works correctly
- Ensure no 404 or error pages when accessing old URLs
- Confirm all wizard workflows function with new structure only