# Add Unique Document IDs to Wizard URLs

**Created**: 2025-01-07
**Completed**: 2025-01-07
**Priority**: HIGH
**Component**: Routing/Wizard
**Status**: ✅ COMPLETED

## Description
Currently, wizard URLs use a generic pattern like `/wizard/_new_targeted-page-seo-optimized-v3` which doesn't uniquely identify individual documents. Each document should have a unique URL that includes the document ID for proper identification, bookmarking, and sharing.

## Current Issue
- All new documents of the same workflow type share the same URL
- Cannot bookmark or share specific documents
- Browser history doesn't distinguish between different documents
- Difficult to track specific document sessions
- Poor user experience for document management

## Final URL Structure (UPDATED)
After implementation and feedback, the final URL structure was simplified to:

**For all documents:**
```
/w/[pageId]
```
Where `pageId` is the unique document ID.

**For creating new documents:**
```
/w/new/[workflowId] → redirects to → /w/[documentId]?new=[workflowId]
```

## Benefits Achieved
- **Unique identification**: Each document has its own URL with just the document ID
- **Simplified URLs**: Much shorter and cleaner URLs (`/w/abc123` vs `/wizard/workflow-name/abc123`)
- **Bookmarking**: Users can bookmark specific documents
- **Sharing**: Direct links to specific documents work
- **Browser history**: Clear navigation between documents
- **Deep linking**: Direct access to specific workflow states
- **Analytics**: Track individual document usage

## Implementation Summary

Successfully implemented unique document IDs in wizard URLs with a simplified structure.

### Key Changes Made:

1. **Created simplified route structure:** `/w/[pageId]/page.tsx`
2. **Added unique ID generation:** `generateUniqueId()` function in `src/lib/utils.ts`
3. **Updated all URL references** across the application:
   - Dashboard document links now use `/w/[documentId]`
   - All workflow start buttons use `/w/new/[workflowId]`
   - Create document dialog uses simplified URLs
   - Workflow details page uses simplified URLs
4. **Implemented new document creation flow:**
   - `/w/new/[workflowId]` creates document and redirects to `/w/[documentId]?new=[workflowId]`
   - Main wizard page handles both new and existing documents via query parameter
5. **Removed old complex route structure** to avoid conflicts

### Files Modified:
- `src/lib/utils.ts` - Added `generateUniqueId()` function
- `src/app/w/[pageId]/page.tsx` - New simplified route handler
- `src/app/w/new/[workflowId]/page.tsx` - New document creation handler
- `src/app/wizard/new/page.tsx` - Updated workflow selection page
- `src/app/dashboard/page.tsx` - Updated document links to `/w/[documentId]`
- `src/components/wizard/create-new-document-dialog.tsx` - Updated URL generation
- `src/app/workflow-details/[workflowId]/page.tsx` - Updated workflow start links
- Removed: `src/app/wizard/[workflowType]/[documentId]/` - Old complex route structure

### Testing Results:
- ✅ `/wizard/new` - Workflow selection page loads correctly
- ✅ `/w/new/[workflowId]` - New document creation works with redirect
- ✅ `/w/[documentId]` - Document URLs work for both new and existing documents
- ✅ Dashboard links updated to simplified format
- ✅ All workflow selection buttons generate simplified URLs
- ✅ No TypeScript compilation errors
- ✅ No Next.js routing conflicts
- ✅ Clean, simple URLs that are easy to share and bookmark

## Acceptance Criteria
- [x] Each new document gets a unique URL with document ID
- [x] URLs are bookmarkable and shareable (now with simplified `/w/[id]` format)
- [x] Navigation works correctly with new URL structure
- [x] Existing functionality remains intact
- [x] Browser history shows distinct entries for different documents
- [x] Deep linking to specific documents works
- [x] No broken links or navigation issues
- [x] **BONUS**: URLs are now significantly shorter and cleaner