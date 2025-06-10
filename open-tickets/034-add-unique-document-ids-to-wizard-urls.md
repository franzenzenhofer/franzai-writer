# Add Unique Document IDs to Wizard URLs

**Created**: 2025-01-07
**Priority**: HIGH
**Component**: Routing/Wizard

## Description
Currently, wizard URLs use a generic pattern like `/wizard/_new_targeted-page-seo-optimized-v3` which doesn't uniquely identify individual documents. Each document should have a unique URL that includes the document ID for proper identification, bookmarking, and sharing.

## Current Issue
- All new documents of the same workflow type share the same URL
- Cannot bookmark or share specific documents
- Browser history doesn't distinguish between different documents
- Difficult to track specific document sessions
- Poor user experience for document management

## Current URL Pattern
```
http://localhost:9002/wizard/_new_targeted-page-seo-optimized-v3
```

## Proposed URL Pattern
```
http://localhost:9002/wizard/_new_targeted-page-seo-optimized-v3/353534w63456
```
Where `353534w63456` is the unique document ID.

## Benefits
- **Unique identification**: Each document has its own URL
- **Bookmarking**: Users can bookmark specific documents
- **Sharing**: Direct links to specific documents
- **Browser history**: Clear navigation between documents
- **Analytics**: Track individual document usage
- **Deep linking**: Direct access to specific workflow states

## Tasks
- [ ] Update wizard routing to include document ID parameter
- [ ] Modify wizard page components to handle document ID
- [ ] Generate unique document IDs on workflow creation
- [ ] Update URL generation throughout the application
- [ ] Handle existing documents without IDs (migration)
- [ ] Update navigation and breadcrumbs
- [ ] Test URL sharing and bookmarking
- [ ] Update any hardcoded wizard URLs

## Technical Implementation

### 1. Update Route Structure
```typescript
// Current: /wizard/[workflowType]
// New: /wizard/[workflowType]/[documentId]
```

### 2. Document ID Generation
```typescript
// Generate unique ID on document creation
const documentId = generateUniqueId(); // e.g., "353534w63456"
```

### 3. URL Updates
- [ ] Update `useRouter` calls
- [ ] Update `Link` components
- [ ] Update form actions
- [ ] Update navigation functions

## Files to Update
- [ ] `src/app/wizard/[pageId]/page.tsx`
- [ ] Wizard routing components
- [ ] Document creation logic
- [ ] Navigation components
- [ ] Breadcrumb components

## Migration Considerations
- [ ] Handle existing documents without IDs
- [ ] Backward compatibility for old URLs
- [ ] Database schema updates if needed
- [ ] Redirect old URLs to new format

## Acceptance Criteria
- [ ] Each new document gets a unique URL with document ID
- [ ] URLs are bookmarkable and shareable
- [ ] Navigation works correctly with new URL structure
- [ ] Existing functionality remains intact
- [ ] Browser history shows distinct entries for different documents
- [ ] Deep linking to specific documents works
- [ ] No broken links or navigation issues 