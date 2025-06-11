import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDocumentPersistence } from './use-document-persistence'
import type { WizardInstance, StageState, Document } from '@/types'

// Define mockUser at the very top as it's used in a mock factory
const mockUser = { uid: 'test-user-id', email: 'test@example.com' };

// Mock factories are self-contained or use variables defined *before* them.
vi.mock('@/lib/documents', () => ({
  createDocument: vi.fn(),
  updateDocument: vi.fn(),
  getDocument: vi.fn(),
}));

vi.mock('@/hooks/use-toast', () => ({
  // useToast itself is a vi.fn(). Its implementation will be provided by mockReturnValue in beforeEach.
  useToast: vi.fn(),
}));

vi.mock('@/components/layout/app-providers', () => ({
  // useAuth itself is a vi.fn(). Its implementation will be provided by mockReturnValue in beforeEach.
  useAuth: vi.fn(),
}));

// Import after mocks - these will be the mocked versions
import { createDocument, updateDocument, getDocument } from '@/lib/documents';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/layout/app-providers';

// Helper to create a default instance
const createDefaultInstance = (docId: string = 'temp-doc-id', title: string = 'Test Doc'): WizardInstance => ({
  workflow: { id: 'test-workflow-id', name: 'Test Workflow', stages: [] },
  document: {
    id: docId,
    title: title,
    userId: mockUser.uid,
    workflowId: 'test-workflow-id',
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    metadata: {},
  },
  stageStates: {
    stage1: { status: 'completed', output: 'Hello world', completedAt: new Date().toISOString() },
    stage2: { status: 'pending', output: null },
  },
  currentStage: 'stage1',
});

describe('useDocumentPersistence', () => {
  let currentInstance: WizardInstance;
  let mockUpdateInstance: ReturnType<typeof vi.fn>;
  let mockToastFnForHook: ReturnType<typeof vi.fn>; // To hold the specific toast function for the hook

  beforeEach(() => {
    currentInstance = createDefaultInstance();
    mockUpdateInstance = vi.fn((updates: Partial<WizardInstance>) => {
      if (updates.document) {
        currentInstance.document = { ...currentInstance.document, ...updates.document } as Document;
      }
      if (updates.stageStates) {
        currentInstance.stageStates = { ...currentInstance.stageStates, ...updates.stageStates };
      }
    });

    // Reset imported mock functions (which are vi.fn instances themselves)
    (createDocument as ReturnType<typeof vi.fn>).mockReset();
    (updateDocument as ReturnType<typeof vi.fn>).mockReset();
    (getDocument as ReturnType<typeof vi.fn>).mockReset();

    // Prepare a fresh vi.fn() for the toast function that useToast's mock will return
    mockToastFnForHook = vi.fn();
    // Configure the useToast mock (which is a vi.fn()) to return an object containing our mockToastFnForHook
    (useToast as ReturnType<typeof vi.fn>).mockReturnValue({ toast: mockToastFnForHook });

    // Configure the useAuth mock
    (useAuth as ReturnType<typeof vi.fn>).mockClear().mockReturnValue({ user: mockUser, loading: false });

    vi.useFakeTimers();
  })

  afterEach(() => {
    vi.useRealTimers();
  })

  describe('Initialization', () => {
    it('should initialize documentId to null if instance.document.id starts with "temp-"', () => {
      currentInstance.document.id = 'temp-123';
      const { result } = renderHook(() => useDocumentPersistence({ instance: currentInstance, updateInstance: mockUpdateInstance }))
      expect(result.current.documentId).toBeNull()
    })

    it('should initialize documentId from instance.document.id if not "temp-"', () => {
      currentInstance.document.id = 'existing-doc-id';
      const { result } = renderHook(() => useDocumentPersistence({ instance: currentInstance, updateInstance: mockUpdateInstance }))
      expect(result.current.documentId).toBe('existing-doc-id')
    })
  })

  describe('saveDocument', () => {
    it('should create a new document if documentId is null', async () => {
      currentInstance.document.id = 'temp-new-id'
      const { result } = renderHook(
        (props) => useDocumentPersistence(props),
        { initialProps: { instance: currentInstance, updateInstance: mockUpdateInstance } }
      )
      expect(result.current.documentId).toBeNull()

      const newDocId = 'new-firestore-id'
      ;(createDocument as ReturnType<typeof vi.fn>).mockResolvedValue(newDocId)

      await act(async () => {
        await result.current.saveDocument()
      })

      expect(createDocument).toHaveBeenCalledWith(
        mockUser.uid,
        currentInstance.document.title,
        currentInstance.workflow.id,
        currentInstance.stageStates
      )
      expect(result.current.documentId).toBe(newDocId)
      expect(mockUpdateInstance).toHaveBeenCalledWith(expect.objectContaining({
        document: expect.objectContaining({ id: newDocId, userId: mockUser.uid })
      }))
      expect(mockToastFnForHook).toHaveBeenCalledWith(expect.objectContaining({ title: 'Document created' }))
      expect(result.current.isSaving).toBe(false)
      expect(result.current.lastSaved).toBeInstanceOf(Date)
    })

    it('should update an existing document if documentId is set', async () => {
      const existingDocId = 'existing-doc-id'
      currentInstance.document.id = existingDocId
      const { result } = renderHook(() => useDocumentPersistence({ instance: currentInstance, updateInstance: mockUpdateInstance }))
      expect(result.current.documentId).toBe(existingDocId)

      ;(updateDocument as ReturnType<typeof vi.fn>).mockResolvedValue(undefined)

      await act(async () => {
        await result.current.saveDocument()
      })

      expect(updateDocument).toHaveBeenCalledWith(
        existingDocId,
        expect.objectContaining({
          title: currentInstance.document.title,
          stageStates: currentInstance.stageStates,
        })
      )
      expect(mockToastFnForHook).not.toHaveBeenCalledWith(expect.objectContaining({ title: 'Document created' }))
      expect(result.current.isSaving).toBe(false)
      expect(result.current.lastSaved).toBeInstanceOf(Date)
    })

    it('should handle save error for createDocument', async () => {
      currentInstance.document.id = 'temp-err-id'
      const { result } = renderHook(() => useDocumentPersistence({ instance: currentInstance, updateInstance: mockUpdateInstance }))
      ;(createDocument as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Firestore create error'));

      await act(async () => {
        await result.current.saveDocument()
      })

      expect(result.current.saveError).toBe('Failed to save document')
      expect(mockToastFnForHook).toHaveBeenCalledWith(expect.objectContaining({ title: 'Save failed', variant: 'destructive' }))
      expect(result.current.isSaving).toBe(false)
    })

    it('should handle save error for updateDocument', async () => {
      currentInstance.document.id = 'existing-doc-id-err'
      const { result } = renderHook(() => useDocumentPersistence({ instance: currentInstance, updateInstance: mockUpdateInstance }))
      ;(updateDocument as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Firestore update error'));

      await act(async () => {
        await result.current.saveDocument()
      })

      expect(result.current.saveError).toBe('Failed to save document')
      expect(mockToastFnForHook).toHaveBeenCalledWith(expect.objectContaining({ title: 'Save failed', variant: 'destructive' }))
      expect(result.current.isSaving).toBe(false)
    })

    it('should not save if user is not authenticated', async () => {
      (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({ user: null, loading: false });
      const { result } = renderHook(() => useDocumentPersistence({ instance: currentInstance, updateInstance: mockUpdateInstance }))

      await act(async () => {
        await result.current.saveDocument()
      })

      expect(createDocument).not.toHaveBeenCalled()
      expect(updateDocument).not.toHaveBeenCalled()
      expect(result.current.saveError).toBe('User not authenticated')
    })
  })

  describe('loadDocument', () => {
    const docToLoadId = 'doc-to-load-id'
    const loadedDocData = {
      document: { ...createDefaultInstance(docToLoadId).document, userId: mockUser.uid },
      stageStates: { s1: { status: 'done', output: 'loaded' } }
    }

    it('should load a document and update instance', async () => {
      ;(getDocument as ReturnType<typeof vi.fn>).mockResolvedValue(loadedDocData)
      const { result } = renderHook(() => useDocumentPersistence({ instance: currentInstance, updateInstance: mockUpdateInstance }))

      await act(async () => {
        await result.current.loadDocument(docToLoadId)
      })

      expect(getDocument).toHaveBeenCalledWith(docToLoadId)
      expect(mockUpdateInstance).toHaveBeenCalledWith(loadedDocData)
      expect(result.current.documentId).toBe(docToLoadId)
      expect(mockToastFnForHook).toHaveBeenCalledWith(expect.objectContaining({ title: 'Document loaded' }))
    })

    it('should show toast if document not found', async () => {
      ;(getDocument as ReturnType<typeof vi.fn>).mockResolvedValue(null)
      const { result } = renderHook(() => useDocumentPersistence({ instance: currentInstance, updateInstance: mockUpdateInstance }))

      await act(async () => {
        await result.current.loadDocument(docToLoadId)
      })
      expect(mockToastFnForHook).toHaveBeenCalledWith(expect.objectContaining({ title: 'Document not found', variant: 'destructive' }))
    })

    it('should show toast if user is not authenticated for load', async () => {
      (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({ user: null, loading: false });
      const { result } = renderHook(() => useDocumentPersistence({ instance: currentInstance, updateInstance: mockUpdateInstance }))

      await act(async () => {
        await result.current.loadDocument(docToLoadId)
      })
      expect(getDocument).not.toHaveBeenCalled()
      expect(mockToastFnForHook).toHaveBeenCalledWith(expect.objectContaining({ title: 'Authentication required' }))
    })

    it('should show toast if user is not owner of the document', async () => {
      ;(getDocument as ReturnType<typeof vi.fn>).mockResolvedValue({ ...loadedDocData, document: { ...loadedDocData.document, userId: 'another-user-id' } })
      const { result } = renderHook(() => useDocumentPersistence({ instance: currentInstance, updateInstance: mockUpdateInstance }))

      await act(async () => {
        await result.current.loadDocument(docToLoadId)
      })
      expect(mockToastFnForHook).toHaveBeenCalledWith(expect.objectContaining({ title: 'Access denied' }))
      expect(mockUpdateInstance).not.toHaveBeenCalled()
    })

    it('should handle load error', async () => {
      ;(getDocument as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Firestore get error'))
      const { result } = renderHook(() => useDocumentPersistence({ instance: currentInstance, updateInstance: mockUpdateInstance }))

      await act(async () => {
        await result.current.loadDocument(docToLoadId)
      })
      expect(mockToastFnForHook).toHaveBeenCalledWith(expect.objectContaining({ title: 'Load failed', variant: 'destructive' }))
    })
  })

  describe('Auto-save (useEffect)', () => {
    it('should trigger saveDocument after a delay when instance.stageStates changes and documentId exists', async () => {
      const existingDocId = 'auto-save-doc-id'
      currentInstance.document.id = existingDocId
      const { rerender, result } = renderHook(
        (props) => useDocumentPersistence(props),
        { initialProps: { instance: currentInstance, updateInstance: mockUpdateInstance } }
      )
      expect(result.current.documentId).toBe(existingDocId);

      expect(updateDocument).not.toHaveBeenCalled();

      const newStageStates = { ...currentInstance.stageStates, stage2: { ...currentInstance.stageStates.stage2, output: "new output" } };
      currentInstance.stageStates = newStageStates

      rerender({ instance: currentInstance, updateInstance: mockUpdateInstance })

      expect(updateDocument).not.toHaveBeenCalled();

      await act(async () => {
        vi.advanceTimersByTime(2000);
      });

      expect(updateDocument).toHaveBeenCalledTimes(1);
    })

    it('should not trigger auto-save if documentId is null', async () => {
      currentInstance.document.id = 'temp-auto-save-id'
      const { rerender } = renderHook(
        (props) => useDocumentPersistence(props),
        { initialProps: { instance: currentInstance, updateInstance: mockUpdateInstance } }
      )

      const newStageStates = { ...currentInstance.stageStates, stage2: { ...currentInstance.stageStates.stage2, output: "new output for no docId" } };
      currentInstance.stageStates = newStageStates;
      rerender({ instance: currentInstance, updateInstance: mockUpdateInstance })

      await act(async () => { vi.advanceTimersByTime(2000) })
      expect(createDocument).not.toHaveBeenCalled()
      expect(updateDocument).not.toHaveBeenCalled()
    })

    it('should not trigger auto-save if user is not present', async () => {
      (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({ user: null, loading: false });
      currentInstance.document.id = 'auto-save-no-user'
      const { rerender } = renderHook(
        (props) => useDocumentPersistence(props),
        { initialProps: { instance: currentInstance, updateInstance: mockUpdateInstance } }
      )

      const newStageStates = { ...currentInstance.stageStates, stage2: { ...currentInstance.stageStates.stage2, output: "new output no user" } };
      currentInstance.stageStates = newStageStates;
      rerender({ instance: currentInstance, updateInstance: mockUpdateInstance })

      await act(async () => { vi.advanceTimersByTime(2000) })
      expect(createDocument).not.toHaveBeenCalled()
      expect(updateDocument).not.toHaveBeenCalled()
    })

    it('should clear previous timeout if stageStates change again within debounce period', async () => {
      currentInstance.document.id = 'auto-save-debounce-id'
      const { rerender, result } = renderHook(
        (props) => useDocumentPersistence(props),
        { initialProps: { instance: currentInstance, updateInstance: mockUpdateInstance } }
      )
      expect(result.current.documentId).toBe('auto-save-debounce-id');

      let newStageStates = { ...currentInstance.stageStates, stage1: { ...currentInstance.stageStates.stage1, output: "change 1" } };
      currentInstance.stageStates = newStageStates;
      rerender({ instance: currentInstance, updateInstance: mockUpdateInstance })

      await act(async () => { vi.advanceTimersByTime(1000) });
      expect(updateDocument).not.toHaveBeenCalled();

      newStageStates = { ...currentInstance.stageStates, stage1: { ...currentInstance.stageStates.stage1, output: "change 2" } };
      currentInstance.stageStates = newStageStates;
      rerender({ instance: currentInstance, updateInstance: mockUpdateInstance })

      await act(async () => { vi.advanceTimersByTime(1000) });
      expect(updateDocument).not.toHaveBeenCalled();

      await act(async () => { vi.advanceTimersByTime(1000) });
      expect(updateDocument).toHaveBeenCalledTimes(1);
    });
  })

  // Helper functions (calculateWordCount, findLastEditedStage) are not exported,
  // so they cannot be unit tested directly here.
  // They are tested indirectly via the saveDocument functionality if metadata is asserted.
})
