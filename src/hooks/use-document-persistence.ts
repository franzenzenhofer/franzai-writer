import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/components/layout/app-providers';
import { useToast } from '@/hooks/use-toast';
import { clientDocumentPersistence } from '@/lib/document-persistence-client';
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
  const [documentId, setDocumentId] = useState<string | null>(() => {
    // Only treat as existing document if it starts with a valid Firestore ID pattern
    // and this instance was successfully loaded from Firestore
    const isValidFirestoreId = !instance.document.id.startsWith('temp-') && 
                              instance.document.id !== 'new' &&
                              instance.document.userId !== 'temp_user'; // temp_user indicates fallback creation
    return isValidFirestoreId ? instance.document.id : null;
  });
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasInitialSaveRef = useRef(false);
  const prevIsSavingRef = useRef(false);

  const log = (operation: string, data?: any) => {
    console.log(`[useDocumentPersistence] ${operation}`, data || '');
  };

  const logError = (operation: string, error: any) => {
    console.error(`[useDocumentPersistence] FAILED: ${operation}`, error);
  };

  // Save the document - FAIL HARD on critical errors
  const saveDocument = useCallback(async () => {
    log('Starting save operation', {
      documentId,
      title: instance.document.title,
      workflowId: instance.workflow.id,
      stageStatesCount: Object.keys(instance.stageStates).length,
      hasUser: !!user
    });

    setIsSaving(true);
    setSaveError(null);

    try {
      // Validate instance data before saving
      if (!instance.document.title?.trim()) {
        throw new Error('FATAL: Document title is required');
      }
      if (!instance.workflow.id?.trim()) {
        throw new Error('FATAL: Workflow ID is required');
      }
      if (!instance.stageStates || typeof instance.stageStates !== 'object') {
        throw new Error('FATAL: Stage states are invalid');
      }

      const result = await clientDocumentPersistence.saveDocument(
        documentId,
        instance.document.title,
        instance.workflow.id,
        instance.stageStates,
        user?.uid
      );

      if (!result.success) {
        throw new Error(result.error || 'Save operation failed');
      }

      if (result.documentId && documentId !== result.documentId) {
        // New document created - update local state
        log('Document created, updating local state', { 
          oldId: documentId, 
          newId: result.documentId 
        });
        
        setDocumentId(result.documentId);
        
        updateInstance({
          document: {
            ...instance.document,
            id: result.documentId,
            userId: user?.uid || 'temp_user',
          },
        });

        toast({
          title: 'Document created',
          description: 'Your document has been saved to the cloud.',
        });
      } else {
        // Existing document updated
        log('Document updated successfully', { documentId });
      }

      setLastSaved(new Date());
      hasInitialSaveRef.current = true;

    } catch (error: any) {
      logError('Save operation', error);
      setSaveError(error.message || 'Failed to save document');
      
      // Only show error toast for critical failures, not silent autosaves
      if (!hasInitialSaveRef.current || error.message.includes('FATAL:')) {
        toast({
          title: 'Save failed',
          description: error.message || 'Unable to save your document. Please try again.',
          variant: 'destructive',
        });
      }
    } finally {
      setIsSaving(false);
    }
  }, [documentId, instance, updateInstance, user, toast]);

  // Load a document - FAIL HARD on critical errors
  const loadDocument = useCallback(async (docId: string) => {
    log('Starting load operation', { docId });

    try {
      if (!docId?.trim()) {
        throw new Error('FATAL: Document ID is required');
      }
      
      const result = await clientDocumentPersistence.loadDocument(docId);
      
      if (!result.success) {
        throw new Error(result.error || 'Load operation failed');
      }

      if (!result.document || !result.stageStates) {
        throw new Error('FATAL: Loaded document data is invalid');
      }

      const { document, stageStates } = result;
      
      // Verify ownership for authenticated users
      if (user && document.userId !== user.uid) {
        throw new Error('FATAL: Access denied - document belongs to another user');
      }

      log('Document loaded successfully', {
        documentId: document.id,
        title: document.title,
        stageStatesCount: Object.keys(stageStates).length
      });

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

    } catch (error: any) {
      logError('Load operation', error);
      toast({
        title: 'Load failed',
        description: error.message || 'Unable to load the document. Please try again.',
        variant: 'destructive',
      });
    }
  }, [user, updateInstance, toast]);

  // Auto-save on stage state changes - NOW WORKS FOR NEW DOCUMENTS
  useEffect(() => {
    // Skip if no meaningful changes yet
    if (!hasInitialSaveRef.current && (!documentId && Object.keys(instance.stageStates).length === 0)) {
      return;
    }

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout for auto-save (debounced)
    saveTimeoutRef.current = setTimeout(() => {
      log('Auto-save triggered', {
        documentId,
        stageStatesCount: Object.keys(instance.stageStates).length
      });
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
      // Check if user has actually made changes (any stage has meaningful input)
      const hasUserInput = Object.values(instance.stageStates).some(state => {
        if (!state.userInput) return false;
        
        if (typeof state.userInput === 'string') {
          return state.userInput.trim().length > 0;
        }
        
        if (typeof state.userInput === 'object') {
          return Object.values(state.userInput).some(val => 
            typeof val === 'string' ? val.trim().length > 0 : !!val
          );
        }
        
        return false;
      });

      if (hasUserInput) {
        log('Triggering initial save due to user input');
        saveDocument();
      }
    }
  }, [instance.stageStates, documentId, saveDocument]);

  useEffect(() => {
    const wasSaving = prevIsSavingRef.current;
    if (wasSaving && !isSaving && !saveError) {
      toast({
        title: "Saved",
        description: `Document "${instance.document.title}" saved successfully.`,
      });
    }
    prevIsSavingRef.current = isSaving;
  }, [isSaving, saveError, instance.document.title, toast, documentId]);

  return {
    isSaving,
    lastSaved,
    saveError,
    documentId,
    saveDocument,
    loadDocument,
  };
}