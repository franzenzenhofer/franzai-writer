# Implement Document Persistence with Firestore

**Created**: 2025-06-10
**Priority**: Critical
**Component**: Data Persistence

## Description
Implement document persistence using Firestore to save and retrieve wizard documents. Stay within the Firebase ecosystem for all data storage needs.

## Tasks
- [ ] Set up Firestore using Firebase CLI
- [ ] Create Firestore data model for documents
- [ ] Implement document CRUD operations
- [ ] Add real-time sync for document updates
- [ ] Implement document listing in dashboard
- [ ] Add document loading in wizard
- [ ] Handle offline persistence
- [ ] Set up security rules

## Firebase CLI Commands
```bash
# Initialize Firestore
firebase init firestore

# Deploy security rules
firebase deploy --only firestore:rules

# Deploy indexes
firebase deploy --only firestore:indexes
```

## Data Model
```typescript
// Collection: documents
interface FirestoreDocument {
  id: string;
  userId: string;
  title: string;
  workflowId: string;
  status: 'draft' | 'completed';
  createdAt: Timestamp;
  updatedAt: Timestamp;
  stageStates: Record<string, StageState>;
  metadata?: {
    wordCount?: number;
    lastEditedStage?: string;
  };
}

// Collection: users/{userId}/documents (alternative structure)
```

## Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /documents/{document} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

## Implementation Areas
1. **Document Service** (`src/lib/documents.ts`)
   - Create document
   - Update document
   - Delete document
   - List user documents
   - Get document by ID

2. **Dashboard Integration**
   - Replace mock data with Firestore queries
   - Add loading states
   - Handle errors

3. **Wizard Integration**
   - Auto-save stage progress
   - Load existing documents
   - Handle concurrent edits

## Acceptance Criteria
- [ ] Documents are saved to Firestore
- [ ] Documents are associated with authenticated users
- [ ] Dashboard shows real user documents
- [ ] Wizard can load and continue existing documents
- [ ] Auto-save works during wizard progression
- [ ] Offline changes sync when online
- [ ] Security rules prevent unauthorized access