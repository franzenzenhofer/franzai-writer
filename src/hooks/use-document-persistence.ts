import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/components/layout/app-providers';
import { useToast } from '@/hooks/use-toast';
import { documentPersistence } from '@/lib/document-persistence';
import type { WizardInstance, StageState } from '@/types';

interface UseDocumentPersistenceProps {
  instance: WizardInstance;
  updateInstance: (updates: Partial<WizardInstance>) => void;
}

interface UseDocumentPersistenceReturn {
  isSaving: boolean;
  lastSaved: Date | null;
  saveError: string | null;
  documentId: string | null;
  saveDocument: () => Promise<void>;
  loadDocument: (documentId: string) => Promise<void>;
}

export function useDocumentPersistence({
  instance,
  updateInstance,
}: UseDocumentPersistenceProps): UseDocumentPersistenceReturn {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [documentId, setDocumentId] = useState<string | null>(
    instance.document.id.startsWith('temp-') ? null : instance.document.id
  );
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasInitialSaveRef = useRef(false);

  // Save the document
  const saveDocument = useCallback(async () => {
    setIsSaving(true);
    setSaveError(null);

    try {
      console.log('[useDocumentPersistence] Starting save...', {
        documentId,
        title: instance.document.title,
        workflowId: instance.workflow.id,
        hasUser: !!user
      });

      const result = await documentPersistence.saveDocument(
        documentId,
        instance.document.title,
        instance.workflow.id,
        instance.stageStates,
        user?.uid
      );

      if (result.success && result.documentId) {
        const newDocumentId = result.documentId;
        
        // Update local state only if document ID changed (new document created)
        if (documentId !== newDocumentId) {
          setDocumentId(newDocumentId);
          
          // Update the instance with the new document ID
          updateInstance({
            document: {
              ...instance.document,
              id: newDocumentId,
              userId: user?.uid || 'temp_user',
            },
          });

          toast({
            title: 'Document created',
            description: 'Your document has been saved to the cloud.',
          });
        } else {
          // Silent update for existing documents
          console.log('[useDocumentPersistence] Document updated successfully');
        }

        setLastSaved(new Date());
        hasInitialSaveRef.current = true;
      } else {
        throw new Error(result.error || 'Failed to save document');
      }
    } catch (error: any) {
      console.error('[useDocumentPersistence] Save failed:', error);
      setSaveError(error.message || 'Failed to save document');
      
      // Only show toast for critical errors, not for silent autosaves
      if (!hasInitialSaveRef.current) {
        toast({
          title: 'Save failed',
          description: 'Unable to save your document. Please try again.',
          variant: 'destructive',
        });
      }
    } finally {
      setIsSaving(false);
    }
  }, [documentId, instance, updateInstance, user, toast]);

  // Load a document
  const loadDocument = useCallback(async (docId: string) => {
    try {
      console.log('[useDocumentPersistence] Loading document...', { docId });
      
      const result = await documentPersistence.loadDocument(docId);
      
      if (result.success && result.document && result.stageStates) {
        const { document, stageStates } = result;
        
        // Verify ownership for authenticated users
        if (user && document.userId !== user.uid) {
          toast({
            title: 'Access denied',
            description: 'You do not have permission to view this document.',
            variant: 'destructive',
          });
          return;
        }

        // Update the instance with loaded data
        updateInstance({
          document,
          stageStates,
        });
        
        setDocumentId(docId);
        hasInitialSaveRef.current = true;
        
        toast({
          title: 'Document loaded',
          description: 'Your document has been loaded successfully.',
        });
      } else {
        throw new Error(result.error || 'Document not found');
      }
    } catch (error: any) {
      console.error('[useDocumentPersistence] Load failed:', error);
      toast({
        title: 'Load failed',
        description: 'Unable to load the document. Please try again.',
        variant: 'destructive',
      });
    }
  }, [user, updateInstance, toast]);

  // Auto-save on stage state changes - FIXED: Now works for new documents too
  useEffect(() => {
    // Skip if we haven't made any changes yet
    if (!hasInitialSaveRef.current && (!documentId && Object.keys(instance.stageStates).length === 0)) {
      return;
    }

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout for auto-save (debounced)
    saveTimeoutRef.current = setTimeout(() => {
      console.log('[useDocumentPersistence] Auto-save triggered');
      saveDocument();
    }, 2000); // 2 second debounce

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [instance.stageStates, instance.document.title, saveDocument]);

  // Initial save for new documents when user starts working
  useEffect(() => {
    if (!hasInitialSaveRef.current && !documentId) {
      // Check if user has actually made changes (any stage has input)
      const hasUserInput = Object.values(instance.stageStates).some(state => 
        state.userInput && 
        (typeof state.userInput === 'string' ? state.userInput.trim() : 
         typeof state.userInput === 'object' ? Object.values(state.userInput).some(val => 
           typeof val === 'string' ? val.trim() : val) : false)
      );

      if (hasUserInput) {
        console.log('[useDocumentPersistence] Triggering initial save due to user input');
        saveDocument();
      }
    }
  }, [instance.stageStates, documentId, saveDocument]);

  return {
    isSaving,
    lastSaved,
    saveError,
    documentId,
    saveDocument,
    loadDocument,
  };
}