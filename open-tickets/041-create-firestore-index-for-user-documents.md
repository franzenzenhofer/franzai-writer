# Create Firestore Index for User Documents Query

**Created**: 2025-01-06
**Priority**: HIGH
**Component**: Firestore/Database
**Type**: Configuration

## Description

The application is encountering a FirebaseError when querying user documents. Firestore requires a composite index for the query that filters by userId and orders by updatedAt.

## Error Message

```
FirebaseError: The query requires an index. You can create it here: https://console.firebase.google.com/v1/r/project/franzai-writer/firestore/indexes?create_composite=ClBwcm9qZWN0cy9mcmFuemFpLXdyaXRlci9kYXRhYmFzZXMvKGRlZmF1bHQpL2NvbGxlY3Rpb25Hcm91cHMvZG9jdW1lbnRzL2luZGV4ZXMvXxABGgoKBnVzZXJJZBABGg0KCXVwZGF0ZWRBdBACGgwKCF9fbmFtZV9fEAI
```

## Tasks

- [ ] Click the provided URL to create the index in Firebase Console
- [ ] Verify the index includes:
  - Collection: `documents`
  - Fields: `userId` (Ascending), `updatedAt` (Descending)
- [ ] Wait for index to build (can take a few minutes)
- [ ] Test the document listing functionality works after index creation
- [ ] Add this index to `firestore.indexes.json` for version control
- [ ] Deploy the index configuration using Firebase CLI

## Acceptance Criteria

- The Firestore index is created successfully
- User documents query works without errors
- Dashboard can load and display user documents
- Index configuration is saved in `firestore.indexes.json`
- No performance issues with document queries

## Technical Details

The query requiring this index is likely in `src/lib/documents.ts` in the `listUserDocuments` function, which filters documents by userId and orders them by updatedAt timestamp.

## Quick Fix

1. Open the URL provided in the error message
2. Click "Create Index" in Firebase Console
3. Wait for index to build
4. Test the application

## Long-term Fix

Update `firestore.indexes.json` to include:
```json
{
  "indexes": [
    {
      "collectionGroup": "documents",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "userId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "updatedAt",
          "order": "DESCENDING"
        }
      ]
    }
  ]
}
```