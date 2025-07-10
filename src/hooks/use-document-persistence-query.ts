import { useCallback, useRef, useEffect } from 'react';
import { useAuth } from '@/components/layout/app-providers';
import { useToast } from '@/hooks/use-toast';
import { useSaveDocument, useDocument, useAutoSaveDocument } from '@/hooks/use-document-queries';
import type { WizardInstance, StageState } from '@/types';

interface UseDocumentPersistenceQueryProps {
  instance: WizardInstance;
  updateInstance: (updates: Partial<WizardInstance>) => void;
}

interface UseDocumentPersistenceQueryReturn {
  isSaving: boolean;
  lastSaved: Date | null;
  saveError: string | null;
  documentId: string | null;
  saveDocument: () => Promise<void>;
  loadDocument: (documentId: string) => Promise<void>;
}

export function useDocumentPersistenceQuery({
  instance,
  updateInstance,
}: UseDocumentPersistenceQueryProps): UseDocumentPersistenceQueryReturn {
  const { user, effectiveUser } = useAuth();
  const { toast } = useToast();
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasInitialSaveRef = useRef(false);

  // Determine if this is an existing document
  const isExistingDocument = !instance.document.id.startsWith('temp-') && 
                           instance.document.id !== 'new' &&
                           instance.document.userId !== 'temp_user';
  
  const documentId = isExistingDocument ? instance.document.id : null;

  // Use React Query hooks
  const saveMutation = useSaveDocument();
  const autoSaveHook = useAutoSaveDocument(documentId || '', !!documentId);
  const { data: documentData, isLoading: isLoadingDocument } = useDocument(documentId || '');

  const log = (operation: string, data?: any) => {
    console.log(`[useDocumentPersistenceQuery] ${operation}`, data || '');
  };

  const logError = (operation: string, error: any) => {
    console.error(`[useDocumentPersistenceQuery] FAILED: ${operation}`, error);
  };

  // Save the document using React Query
  const saveDocument = useCallback(async () => {
    log('Starting save operation', {
      documentId,
      title: instance.document.title,
      workflowId: instance.workflow.id,
      stageStatesCount: Object.keys(instance.stageStates).length,
      hasUser: !!effectiveUser,
      isTemp: effectiveUser?.isTemporary
    });

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

      const documentToSave = {
        id: documentId || '',
        title: instance.document.title,
        workflowId: instance.workflow.id,
        stageStates: instance.stageStates,
        userId: effectiveUser?.uid || '',
        status: instance.document.status,
        createdAt: instance.document.createdAt,
        updatedAt: new Date().toISOString(),
      };

      let result;
      if (documentId) {
        // Update existing document
        result = await saveMutation.mutateAsync({
          documentId,
          updates: documentToSave,
        });
      } else {
        // This would require a separate create mutation - for now, use the existing logic
        // We could extend this to use the create mutation from our React Query hooks
        const { clientDocumentPersistence } = await import('@/lib/document-persistence-client');
        const saveResult = await clientDocumentPersistence.saveDocument(
          documentId,
          instance.document.title,
          instance.workflow.id,
          instance.stageStates,
          effectiveUser?.uid
        );
        
        if (!saveResult.success) {
          throw new Error(saveResult.error || 'Save operation failed');
        }
        
        if (saveResult.documentId && documentId !== saveResult.documentId) {
          // New document created - update local state
          log('Document created, updating local state', { 
            oldId: documentId, 
            newId: saveResult.documentId 
          });
          
          updateInstance({
            document: {
              ...instance.document,
              id: saveResult.documentId,
              userId: effectiveUser?.uid || '',
              updatedAt: new Date().toISOString(),
            },
          });
        }
      }

      log('Document saved successfully', { documentId });
      
      if (!hasInitialSaveRef.current) {
        hasInitialSaveRef.current = true;
      }

    } catch (error: any) {
      logError('saveDocument', error);
      
      toast({
        title: 'Save failed',
        description: error.message || 'Unable to save the document. Please try again.',
        variant: 'destructive',
      });
      
      throw error;
    }
  }, [
    documentId,
    instance,
    effectiveUser,
    saveMutation,
    updateInstance,
    toast,
  ]);

  // Load document using React Query
  const loadDocument = useCallback(async (targetDocumentId: string) => {
    log('Loading document', { documentId: targetDocumentId });
    
    try {
      // The document data will be loaded automatically by React Query
      // We just need to wait for it and update the instance
      if (documentData) {
        updateInstance({
          document: {
            id: documentData.id,
            title: documentData.title,
            workflowId: documentData.workflowId,
            status: documentData.status,
            userId: documentData.userId,
            createdAt: documentData.createdAt,
            updatedAt: documentData.updatedAt,
          },
          stageStates: documentData.stageStates,
        });
        
        log('Document loaded successfully', { 
          documentId: targetDocumentId,
          title: documentData.title,
          stageStatesCount: Object.keys(documentData.stageStates).length,
        });
      }
    } catch (error: any) {
      logError('loadDocument', error);
      
      toast({
        title: 'Load failed',
        description: error.message || 'Unable to load the document. Please try again.',
        variant: 'destructive',
      });
      
      throw error;
    }
  }, [documentData, updateInstance, toast]);

  // Auto-save logic using React Query
  useEffect(() => {
    if (!hasInitialSaveRef.current || !documentId) return;

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set up auto-save with debouncing
    saveTimeoutRef.current = setTimeout(() => {
      autoSaveHook.triggerAutoSave({
        title: instance.document.title,
        workflowId: instance.workflow.id,
        stageStates: instance.stageStates,
        status: instance.document.status,
        updatedAt: new Date().toISOString(),
      });
    }, 2000); // 2 second debounce

    // Cleanup timeout on unmount
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [instance.stageStates, instance.document.title, documentId, autoSaveHook, hasInitialSaveRef.current]);

  return {
    isSaving: saveMutation.isPending || autoSaveHook.isSaving,
    lastSaved: autoSaveHook.lastSaved,
    saveError: saveMutation.error?.message || autoSaveHook.saveError?.message || null,
    documentId,
    saveDocument,
    loadDocument,
  };
}