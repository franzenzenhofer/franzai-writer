# Implement Auto-Save Functionality

**Created**: 2025-06-10
**Priority**: High
**Component**: Data Persistence

## Description
Implement automatic saving of wizard progress to prevent data loss and improve user experience. Auto-save should work seamlessly in the background.

## Tasks
- [ ] Create auto-save hook with debouncing
- [ ] Save to localStorage for offline support
- [ ] Sync to Firestore when online
- [ ] Show save status indicator
- [ ] Handle conflicts between local and remote
- [ ] Add manual save button option
- [ ] Implement save history/versions

## Implementation
```typescript
// hooks/use-auto-save.ts
export function useAutoSave(data: any, documentId: string) {
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  
  // Debounced save function
  const debouncedSave = useDebouncedCallback(
    async (data) => {
      setSaveStatus('saving');
      try {
        // Save to localStorage first
        localStorage.setItem(`draft-${documentId}`, JSON.stringify(data));
        
        // Then sync to Firestore if online
        if (navigator.onLine && user) {
          await updateDocument(documentId, data);
        }
        setSaveStatus('saved');
      } catch (error) {
        setSaveStatus('error');
      }
    },
    2000 // 2 second debounce
  );
  
  useEffect(() => {
    debouncedSave(data);
  }, [data]);
  
  return { saveStatus };
}
```

## UI Indicators
- Subtle "Saving..." indicator
- "All changes saved" confirmation
- "Offline - will sync when online" message
- Error state with retry option

## Acceptance Criteria
- [ ] Changes save automatically after 2 seconds
- [ ] No data loss on browser refresh
- [ ] Offline changes sync when online
- [ ] Save indicator is non-intrusive
- [ ] Manual save option available
- [ ] Conflict resolution implemented