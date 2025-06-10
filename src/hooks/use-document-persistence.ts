import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/components/layout/app-providers';
import { useToast } from '@/hooks/use-toast';
import { createDocument, updateDocument, updateStageState, getDocument } from '@/lib/documents';
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

  // Save the document
  const saveDocument = useCallback(async () => {
    if (!user) {
      setSaveError('User not authenticated');
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      let currentDocId = documentId;

      // Create new document if it doesn't exist
      if (!currentDocId) {
        currentDocId = await createDocument(
          user.uid,
          instance.document.title,
          instance.workflow.id,
          instance.stageStates
        );
        setDocumentId(currentDocId);
        
        // Update the instance with the new document ID
        updateInstance({
          document: {
            ...instance.document,
            id: currentDocId,
            userId: user.uid,
          },
        });

        toast({
          title: 'Document created',
          description: 'Your document has been saved to the cloud.',
        });
      } else {
        // Update existing document
        await updateDocument(currentDocId, {
          title: instance.document.title,
          status: instance.document.status,
          stageStates: instance.stageStates,
          metadata: {
            wordCount: calculateWordCount(instance.stageStates),
            lastEditedStage: findLastEditedStage(instance.stageStates),
          },
        });
      }

      setLastSaved(new Date());
    } catch (error) {
      console.error('Error saving document:', error);
      setSaveError('Failed to save document');
      toast({
        title: 'Save failed',
        description: 'Unable to save your document. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  }, [user, documentId, instance, updateInstance, toast]);

  // Load a document
  const loadDocument = useCallback(async (docId: string) => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to load documents.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const result = await getDocument(docId);
      
      if (!result) {
        toast({
          title: 'Document not found',
          description: 'The requested document could not be found.',
          variant: 'destructive',
        });
        return;
      }

      const { document, stageStates } = result;
      
      // Verify ownership
      if (document.userId !== user.uid) {
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
      toast({
        title: 'Document loaded',
        description: 'Your document has been loaded successfully.',
      });
    } catch (error) {
      console.error('Error loading document:', error);
      toast({
        title: 'Load failed',
        description: 'Unable to load the document. Please try again.',
        variant: 'destructive',
      });
    }
  }, [user, updateInstance, toast]);

  // Auto-save on stage state changes
  useEffect(() => {
    if (!user || !documentId) return;

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout for auto-save (debounced)
    saveTimeoutRef.current = setTimeout(() => {
      saveDocument();
    }, 2000); // 2 second debounce

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [instance.stageStates, saveDocument, user, documentId]);

  return {
    isSaving,
    lastSaved,
    saveError,
    documentId,
    saveDocument,
    loadDocument,
  };
}

// Helper function to calculate word count from stage outputs
function calculateWordCount(stageStates: Record<string, StageState>): number {
  let totalWords = 0;
  
  Object.values(stageStates).forEach(state => {
    if (state.output && typeof state.output === 'string') {
      totalWords += state.output.split(/\s+/).filter(word => word.length > 0).length;
    }
  });
  
  return totalWords;
}

// Helper function to find the last edited stage
function findLastEditedStage(stageStates: Record<string, StageState>): string | undefined {
  let lastStage: string | undefined;
  let lastTime = 0;
  
  Object.entries(stageStates).forEach(([stageId, state]) => {
    if (state.completedAt) {
      const completedTime = new Date(state.completedAt).getTime();
      if (completedTime > lastTime) {
        lastTime = completedTime;
        lastStage = stageId;
      }
    }
  });
  
  return lastStage;
}