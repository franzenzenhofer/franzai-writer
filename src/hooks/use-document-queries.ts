import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/components/layout/app-providers';
import { clientDocumentPersistence } from '@/lib/document-persistence-client';
import { WizardDocument } from '@/lib/types';

export const DOCUMENT_QUERY_KEYS = {
  all: ['documents'] as const,
  lists: () => [...DOCUMENT_QUERY_KEYS.all, 'list'] as const,
  list: (userId: string) => [...DOCUMENT_QUERY_KEYS.lists(), userId] as const,
  details: () => [...DOCUMENT_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...DOCUMENT_QUERY_KEYS.details(), id] as const,
};

export function useDocuments() {
  const { effectiveUser } = useAuth();
  
  return useQuery({
    queryKey: DOCUMENT_QUERY_KEYS.list(effectiveUser?.uid || ''),
    queryFn: async () => {
      if (!effectiveUser?.uid) {
        return [];
      }
      return clientDocumentPersistence.listUserDocuments(effectiveUser.uid);
    },
    enabled: !!effectiveUser?.uid,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export function useDocument(documentId: string) {
  return useQuery({
    queryKey: DOCUMENT_QUERY_KEYS.detail(documentId),
    queryFn: async () => {
      if (!documentId) return null;
      return clientDocumentPersistence.getDocument(documentId);
    },
    enabled: !!documentId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useCreateDocument() {
  const queryClient = useQueryClient();
  const { effectiveUser } = useAuth();

  return useMutation({
    mutationFn: async (document: Partial<WizardDocument>) => {
      if (!effectiveUser?.uid) {
        throw new Error('User not authenticated');
      }
      return clientDocumentPersistence.createDocument(document, effectiveUser.uid);
    },
    onSuccess: (newDocument) => {
      // Invalidate and refetch documents list
      queryClient.invalidateQueries({ queryKey: DOCUMENT_QUERY_KEYS.lists() });
      
      // Add the new document to the cache
      queryClient.setQueryData(
        DOCUMENT_QUERY_KEYS.detail(newDocument.id),
        newDocument
      );
    },
  });
}

export function useSaveDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ documentId, updates }: { documentId: string; updates: Partial<WizardDocument> }) => {
      return clientDocumentPersistence.saveDocument(documentId, updates);
    },
    onMutate: async ({ documentId, updates }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: DOCUMENT_QUERY_KEYS.detail(documentId) });

      // Snapshot the previous value
      const previousDocument = queryClient.getQueryData(DOCUMENT_QUERY_KEYS.detail(documentId));

      // Optimistically update to the new value
      queryClient.setQueryData(DOCUMENT_QUERY_KEYS.detail(documentId), (old: WizardDocument | undefined) => {
        if (!old) return old;
        return { ...old, ...updates, updatedAt: new Date().toISOString() };
      });

      // Return a context object with the snapshotted value
      return { previousDocument };
    },
    onError: (err, { documentId }, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      queryClient.setQueryData(DOCUMENT_QUERY_KEYS.detail(documentId), context?.previousDocument);
    },
    onSettled: (data, error, { documentId }) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: DOCUMENT_QUERY_KEYS.detail(documentId) });
    },
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();
  const { effectiveUser } = useAuth();

  return useMutation({
    mutationFn: async (documentId: string) => {
      return clientDocumentPersistence.deleteDocument(documentId);
    },
    onSuccess: (_, documentId) => {
      // Remove the document from the cache
      queryClient.removeQueries({ queryKey: DOCUMENT_QUERY_KEYS.detail(documentId) });
      
      // Invalidate and refetch documents list
      queryClient.invalidateQueries({ queryKey: DOCUMENT_QUERY_KEYS.lists() });
    },
  });
}

export function useAutoSaveDocument(documentId: string, enabled: boolean = true) {
  const saveMutation = useSaveDocument();
  const queryClient = useQueryClient();

  const triggerAutoSave = async (updates: Partial<WizardDocument>) => {
    if (!enabled || !documentId) return;
    
    return saveMutation.mutate({ documentId, updates });
  };

  return {
    triggerAutoSave,
    isSaving: saveMutation.isPending,
    saveError: saveMutation.error,
    lastSaved: saveMutation.data ? new Date() : null,
  };
}