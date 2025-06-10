# Implement Collaboration Features

**Created**: 2025-06-10
**Priority**: Low
**Component**: Collaboration

## Description
Add collaboration features allowing multiple users to work on documents together, with real-time updates, comments, and sharing capabilities.

## Tasks
- [ ] Implement document sharing
- [ ] Add real-time collaboration
- [ ] Create commenting system
- [ ] Add user presence indicators
- [ ] Implement permission levels
- [ ] Add activity history
- [ ] Create share dialog
- [ ] Handle conflict resolution

## Collaboration Features

### 1. Document Sharing
```typescript
// Share dialog with permission levels
interface ShareSettings {
  documentId: string;
  sharedWith: Array<{
    email: string;
    role: 'viewer' | 'editor' | 'owner';
    invitedAt: Date;
  }>;
  linkSharing: {
    enabled: boolean;
    role: 'viewer' | 'editor';
    expiresAt?: Date;
  };
}

// Firestore security rules
match /documents/{document} {
  allow read: if isOwner() || isSharedWith();
  allow write: if isOwner() || (isSharedWith() && hasEditPermission());
}
```

### 2. Real-time Collaboration
```typescript
// Using Firestore real-time listeners
const collaborateOnDocument = (documentId: string) => {
  const unsubscribe = firestore
    .collection('documents')
    .doc(documentId)
    .onSnapshot((doc) => {
      // Update local state with changes
      updateDocument(doc.data());
      
      // Show who made changes
      showCollaboratorActivity(doc.metadata);
    });
    
  return unsubscribe;
};
```

### 3. Presence System
```typescript
// Show active collaborators
interface Presence {
  userId: string;
  userName: string;
  userPhoto: string;
  currentStage?: string;
  lastActive: Date;
  isTyping: boolean;
}

// Presence indicator component
<div className="flex -space-x-2">
  {activeUsers.map(user => (
    <Avatar
      key={user.userId}
      src={user.userPhoto}
      alt={user.userName}
      className="ring-2 ring-background"
    />
  ))}
</div>
```

### 4. Comments System
```typescript
// Comments on stages
interface Comment {
  id: string;
  stageId: string;
  userId: string;
  text: string;
  createdAt: Date;
  resolved: boolean;
  replies: Comment[];
}

// Comment component
<CommentThread
  stageId={stage.id}
  comments={comments}
  onAddComment={handleAddComment}
  onResolve={handleResolveComment}
/>
```

### 5. Activity History
```typescript
// Track all document activities
interface Activity {
  id: string;
  type: 'edit' | 'comment' | 'share' | 'complete';
  userId: string;
  timestamp: Date;
  details: {
    stageName?: string;
    changeType?: string;
    previousValue?: any;
    newValue?: any;
  };
}
```

## Conflict Resolution
- Operational Transform for text
- Last-write-wins for metadata
- Three-way merge for conflicts
- Automatic conflict detection

## UI Components
- Share button in header
- Collaborator avatars
- Activity sidebar
- Comment indicators
- Presence cursors
- Share dialog

## Acceptance Criteria
- [ ] Documents can be shared
- [ ] Real-time updates work
- [ ] Comments functional
- [ ] Presence indicators show
- [ ] Permissions enforced
- [ ] Activity tracked
- [ ] Conflicts handled gracefully