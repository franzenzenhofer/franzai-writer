import { FirestoreAdapter } from '@/lib/firestore-adapter';
import { db } from '@/lib/firebase';

// Mock Firebase Firestore
jest.mock('@/lib/firebase', () => ({
  db: {}
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  setDoc: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  deleteDoc: jest.fn(),
  updateDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  serverTimestamp: jest.fn(() => ({ seconds: 1641024000, nanoseconds: 0 }))
}));

// Import mocked functions
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';

const mockCollection = collection as jest.MockedFunction<typeof collection>;
const mockDoc = doc as jest.MockedFunction<typeof doc>;
const mockSetDoc = setDoc as jest.MockedFunction<typeof setDoc>;
const mockGetDoc = getDoc as jest.MockedFunction<typeof getDoc>;
const mockGetDocs = getDocs as jest.MockedFunction<typeof getDocs>;
const mockDeleteDoc = deleteDoc as jest.MockedFunction<typeof deleteDoc>;
const mockUpdateDoc = updateDoc as jest.MockedFunction<typeof updateDoc>;
const mockQuery = query as jest.MockedFunction<typeof query>;
const mockWhere = where as jest.MockedFunction<typeof where>;
const mockOrderBy = orderBy as jest.MockedFunction<typeof orderBy>;
const mockServerTimestamp = serverTimestamp as jest.MockedFunction<typeof serverTimestamp>;

describe('FirestoreAdapter Integration Tests', () => {
  let adapter: FirestoreAdapter;
  
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Mock console methods to avoid noise in tests
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Get singleton instance
    adapter = FirestoreAdapter.getInstance();
  });

  afterEach(() => {
    // Restore console methods
    jest.restoreAllMocks();
  });

  describe('Singleton Pattern', () => {
    test('getInstance returns the same instance', () => {
      const instance1 = FirestoreAdapter.getInstance();
      const instance2 = FirestoreAdapter.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('Document Creation', () => {
    test('createDocument should create a document with auto-generated ID', async () => {
      // Mock Firestore operations
      const mockDocRef = { id: 'test-doc-id', path: 'test-collection/test-doc-id' };
      mockCollection.mockReturnValue({} as any);
      mockDoc.mockReturnValue(mockDocRef as any);
      mockSetDoc.mockResolvedValue(undefined);
      
      const testData = {
        name: 'Test Document',
        content: 'Test content',
        nested: {
          value: 42,
          array: [1, 2, 3]
        }
      };

      const result = await adapter.createDocument('test-collection', testData);

      expect(result).toBe('test-doc-id');
      expect(mockCollection).toHaveBeenCalledWith(db, 'test-collection');
      expect(mockDoc).toHaveBeenCalledWith({});
      expect(mockSetDoc).toHaveBeenCalledWith(mockDocRef, {
        ...testData,
        id: 'test-doc-id',
        createdAt: expect.any(Object),
        updatedAt: expect.any(Object)
      });
    });

    test('createDocument should throw error on Firestore failure', async () => {
      const mockDocRef = { id: 'test-doc-id', path: 'test-collection/test-doc-id' };
      mockCollection.mockReturnValue({} as any);
      mockDoc.mockReturnValue(mockDocRef as any);
      mockSetDoc.mockRejectedValue(new Error('Firestore error'));

      const testData = { name: 'Test Document' };

      await expect(adapter.createDocument('test-collection', testData))
        .rejects
        .toThrow('FATAL: Failed to create document in test-collection: Error: Firestore error');
    });
  });

  describe('Document Retrieval', () => {
    test('getDocument should return document data when document exists', async () => {
      const mockDocRef = { id: 'test-doc-id' };
      const mockDocSnap = {
        exists: () => true,
        data: () => ({
          id: 'test-doc-id',
          name: 'Test Document',
          content: 'Test content'
        })
      };

      mockDoc.mockReturnValue(mockDocRef as any);
      mockGetDoc.mockResolvedValue(mockDocSnap as any);

      const result = await adapter.getDocument('test-collection', 'test-doc-id');

      expect(result).toEqual({
        id: 'test-doc-id',
        name: 'Test Document',
        content: 'Test content'
      });
      expect(mockDoc).toHaveBeenCalledWith(db, 'test-collection', 'test-doc-id');
      expect(mockGetDoc).toHaveBeenCalledWith(mockDocRef);
    });

    test('getDocument should return null when document does not exist', async () => {
      const mockDocRef = { id: 'test-doc-id' };
      const mockDocSnap = {
        exists: () => false
      };

      mockDoc.mockReturnValue(mockDocRef as any);
      mockGetDoc.mockResolvedValue(mockDocSnap as any);

      const result = await adapter.getDocument('test-collection', 'test-doc-id');

      expect(result).toBeNull();
    });

    test('getDocument should throw error on Firestore failure', async () => {
      const mockDocRef = { id: 'test-doc-id' };
      mockDoc.mockReturnValue(mockDocRef as any);
      mockGetDoc.mockRejectedValue(new Error('Firestore error'));

      await expect(adapter.getDocument('test-collection', 'test-doc-id'))
        .rejects
        .toThrow('FATAL: Failed to get document test-doc-id in test-collection: Error: Firestore error');
    });
  });

  describe('Document Updates', () => {
    test('updateDocument should update document with timestamp', async () => {
      const mockDocRef = { id: 'test-doc-id' };
      mockDoc.mockReturnValue(mockDocRef as any);
      mockUpdateDoc.mockResolvedValue(undefined);

      const updates = {
        name: 'Updated Document',
        content: 'Updated content'
      };

      await adapter.updateDocument('test-collection', 'test-doc-id', updates);

      expect(mockDoc).toHaveBeenCalledWith(db, 'test-collection', 'test-doc-id');
      expect(mockUpdateDoc).toHaveBeenCalledWith(mockDocRef, {
        ...updates,
        updatedAt: expect.any(Object)
      });
    });

    test('updateDocument should throw error on Firestore failure', async () => {
      const mockDocRef = { id: 'test-doc-id' };
      mockDoc.mockReturnValue(mockDocRef as any);
      mockUpdateDoc.mockRejectedValue(new Error('Firestore error'));

      const updates = { name: 'Updated Document' };

      await expect(adapter.updateDocument('test-collection', 'test-doc-id', updates))
        .rejects
        .toThrow('FATAL: Failed to update document test-doc-id in test-collection: Error: Firestore error');
    });
  });

  describe('Document Deletion', () => {
    test('deleteDocument should delete document', async () => {
      const mockDocRef = { id: 'test-doc-id' };
      mockDoc.mockReturnValue(mockDocRef as any);
      mockDeleteDoc.mockResolvedValue(undefined);

      await adapter.deleteDocument('test-collection', 'test-doc-id');

      expect(mockDoc).toHaveBeenCalledWith(db, 'test-collection', 'test-doc-id');
      expect(mockDeleteDoc).toHaveBeenCalledWith(mockDocRef);
    });

    test('deleteDocument should throw error on Firestore failure', async () => {
      const mockDocRef = { id: 'test-doc-id' };
      mockDoc.mockReturnValue(mockDocRef as any);
      mockDeleteDoc.mockRejectedValue(new Error('Firestore error'));

      await expect(adapter.deleteDocument('test-collection', 'test-doc-id'))
        .rejects
        .toThrow('FATAL: Failed to delete document test-doc-id in test-collection: Error: Firestore error');
    });
  });

  describe('Document Existence Check', () => {
    test('documentExists should return true when document exists', async () => {
      const mockDocRef = { id: 'test-doc-id' };
      const mockDocSnap = {
        exists: () => true
      };

      mockDoc.mockReturnValue(mockDocRef as any);
      mockGetDoc.mockResolvedValue(mockDocSnap as any);

      const result = await adapter.documentExists('test-collection', 'test-doc-id');

      expect(result).toBe(true);
      expect(mockDoc).toHaveBeenCalledWith(db, 'test-collection', 'test-doc-id');
      expect(mockGetDoc).toHaveBeenCalledWith(mockDocRef);
    });

    test('documentExists should return false when document does not exist', async () => {
      const mockDocRef = { id: 'test-doc-id' };
      const mockDocSnap = {
        exists: () => false
      };

      mockDoc.mockReturnValue(mockDocRef as any);
      mockGetDoc.mockResolvedValue(mockDocSnap as any);

      const result = await adapter.documentExists('test-collection', 'test-doc-id');

      expect(result).toBe(false);
    });

    test('documentExists should throw error on Firestore failure', async () => {
      const mockDocRef = { id: 'test-doc-id' };
      mockDoc.mockReturnValue(mockDocRef as any);
      mockGetDoc.mockRejectedValue(new Error('Firestore error'));

      await expect(adapter.documentExists('test-collection', 'test-doc-id'))
        .rejects
        .toThrow('FATAL: Failed to check document existence test-doc-id in test-collection: Error: Firestore error');
    });
  });

  describe('Collection Operations', () => {
    test('getAllDocuments should return all documents from collection', async () => {
      const mockCollectionRef = {};
      const mockQuerySnapshot = {
        forEach: jest.fn((callback) => {
          callback({ data: () => ({ id: 'doc1', name: 'Document 1' }) });
          callback({ data: () => ({ id: 'doc2', name: 'Document 2' }) });
        })
      };

      mockCollection.mockReturnValue(mockCollectionRef as any);
      mockGetDocs.mockResolvedValue(mockQuerySnapshot as any);

      const result = await adapter.getAllDocuments('test-collection');

      expect(result).toEqual([
        { id: 'doc1', name: 'Document 1' },
        { id: 'doc2', name: 'Document 2' }
      ]);
      expect(mockCollection).toHaveBeenCalledWith(db, 'test-collection');
      expect(mockGetDocs).toHaveBeenCalledWith(mockCollectionRef);
    });

    test('getAllDocuments should throw error on Firestore failure', async () => {
      const mockCollectionRef = {};
      mockCollection.mockReturnValue(mockCollectionRef as any);
      mockGetDocs.mockRejectedValue(new Error('Firestore error'));

      await expect(adapter.getAllDocuments('test-collection'))
        .rejects
        .toThrow('FATAL: Failed to get all documents in test-collection: Error: Firestore error');
    });
  });

  describe('Query Operations', () => {
    test('queryDocuments should execute query with where clause', async () => {
      const mockCollectionRef = {};
      const mockQueryRef = {};
      const mockQuerySnapshot = {
        forEach: jest.fn((callback) => {
          callback({ data: () => ({ id: 'doc1', name: 'Document 1', status: 'active' }) });
        })
      };

      mockCollection.mockReturnValue(mockCollectionRef as any);
      mockQuery.mockReturnValue(mockQueryRef as any);
      mockWhere.mockReturnValue({} as any);
      mockGetDocs.mockResolvedValue(mockQuerySnapshot as any);

      const result = await adapter.queryDocuments(
        'test-collection',
        { field: 'status', operator: '==', value: 'active' }
      );

      expect(result).toEqual([
        { id: 'doc1', name: 'Document 1', status: 'active' }
      ]);
      expect(mockCollection).toHaveBeenCalledWith(db, 'test-collection');
      expect(mockWhere).toHaveBeenCalledWith('status', '==', 'active');
      expect(mockQuery).toHaveBeenCalledWith(mockCollectionRef, {});
    });

    test('queryDocuments should execute query with orderBy and limit', async () => {
      const mockCollectionRef = {};
      const mockQueryRef = {};
      const mockQuerySnapshot = {
        forEach: jest.fn((callback) => {
          callback({ data: () => ({ id: 'doc1', name: 'Document 1', createdAt: '2023-01-01' }) });
          callback({ data: () => ({ id: 'doc2', name: 'Document 2', createdAt: '2023-01-02' }) });
        })
      };

      mockCollection.mockReturnValue(mockCollectionRef as any);
      mockQuery.mockReturnValue(mockQueryRef as any);
      mockOrderBy.mockReturnValue({} as any);
      mockGetDocs.mockResolvedValue(mockQuerySnapshot as any);

      const result = await adapter.queryDocuments(
        'test-collection',
        undefined,
        { field: 'createdAt', direction: 'desc' },
        10
      );

      expect(result).toEqual([
        { id: 'doc1', name: 'Document 1', createdAt: '2023-01-01' },
        { id: 'doc2', name: 'Document 2', createdAt: '2023-01-02' }
      ]);
      expect(mockOrderBy).toHaveBeenCalledWith('createdAt', 'desc');
    });

    test('queryDocuments should throw error on Firestore failure', async () => {
      const mockCollectionRef = {};
      mockCollection.mockReturnValue(mockCollectionRef as any);
      mockGetDocs.mockRejectedValue(new Error('Firestore error'));

      await expect(adapter.queryDocuments('test-collection'))
        .rejects
        .toThrow('FATAL: Failed to query documents in test-collection: Error: Firestore error');
    });
  });

  describe('Complex Data Scenarios', () => {
    test('createDocument should handle complex nested data structures', async () => {
      const mockDocRef = { id: 'complex-doc-id', path: 'test-collection/complex-doc-id' };
      mockCollection.mockReturnValue({} as any);
      mockDoc.mockReturnValue(mockDocRef as any);
      mockSetDoc.mockResolvedValue(undefined);

      const complexData = {
        name: 'Complex Document',
        metadata: {
          tags: ['tag1', 'tag2'],
          categories: {
            primary: 'documents',
            secondary: ['test', 'complex']
          }
        },
        stageStates: {
          stage1: {
            stageId: 'stage1',
            status: 'completed',
            output: {
              content: 'Stage 1 output',
              formats: {
                html: '<p>Content</p>',
                markdown: '# Content'
              }
            }
          },
          stage2: {
            stageId: 'stage2',
            status: 'idle',
            output: null
          }
        },
        timestamps: {
          created: new Date('2023-01-01'),
          modified: new Date('2023-01-02')
        }
      };

      const result = await adapter.createDocument('test-collection', complexData);

      expect(result).toBe('complex-doc-id');
      expect(mockSetDoc).toHaveBeenCalledWith(mockDocRef, {
        ...complexData,
        id: 'complex-doc-id',
        createdAt: expect.any(Object),
        updatedAt: expect.any(Object)
      });
    });

    test('updateDocument should handle stageStates updates with logging', async () => {
      const mockDocRef = { id: 'test-doc-id' };
      mockDoc.mockReturnValue(mockDocRef as any);
      mockUpdateDoc.mockResolvedValue(undefined);

      const updates = {
        stageStates: {
          'export-publish': {
            stageId: 'export-publish',
            status: 'completed',
            output: {
              formats: {
                html: '<html>content</html>',
                pdf: 'binary-pdf-data'
              }
            },
            isExportStage: true
          }
        }
      };

      await adapter.updateDocument('test-collection', 'test-doc-id', updates);

      expect(mockUpdateDoc).toHaveBeenCalledWith(mockDocRef, {
        ...updates,
        updatedAt: expect.any(Object)
      });
    });
  });

  describe('Error Handling Scenarios', () => {
    test('should handle Firebase auth errors gracefully', async () => {
      const mockDocRef = { id: 'test-doc-id' };
      mockDoc.mockReturnValue(mockDocRef as any);
      mockGetDoc.mockRejectedValue(new Error('PERMISSION_DENIED: Missing or insufficient permissions'));

      await expect(adapter.getDocument('test-collection', 'test-doc-id'))
        .rejects
        .toThrow('FATAL: Failed to get document test-doc-id in test-collection: Error: PERMISSION_DENIED: Missing or insufficient permissions');
    });

    test('should handle network errors gracefully', async () => {
      const mockDocRef = { id: 'test-doc-id' };
      mockDoc.mockReturnValue(mockDocRef as any);
      mockGetDoc.mockRejectedValue(new Error('NETWORK_ERROR: Request failed'));

      await expect(adapter.getDocument('test-collection', 'test-doc-id'))
        .rejects
        .toThrow('FATAL: Failed to get document test-doc-id in test-collection: Error: NETWORK_ERROR: Request failed');
    });

    test('should handle quota exceeded errors gracefully', async () => {
      const mockDocRef = { id: 'test-doc-id', path: 'test-collection/test-doc-id' };
      mockCollection.mockReturnValue({} as any);
      mockDoc.mockReturnValue(mockDocRef as any);
      mockSetDoc.mockRejectedValue(new Error('QUOTA_EXCEEDED: Quota exceeded'));

      const testData = { name: 'Test Document' };

      await expect(adapter.createDocument('test-collection', testData))
        .rejects
        .toThrow('FATAL: Failed to create document in test-collection: Error: QUOTA_EXCEEDED: Quota exceeded');
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty collection queries', async () => {
      const mockCollectionRef = {};
      const mockQuerySnapshot = {
        forEach: jest.fn() // No documents
      };

      mockCollection.mockReturnValue(mockCollectionRef as any);
      mockGetDocs.mockResolvedValue(mockQuerySnapshot as any);

      const result = await adapter.getAllDocuments('empty-collection');

      expect(result).toEqual([]);
    });

    test('should handle null and undefined values in data', async () => {
      const mockDocRef = { id: 'test-doc-id', path: 'test-collection/test-doc-id' };
      mockCollection.mockReturnValue({} as any);
      mockDoc.mockReturnValue(mockDocRef as any);
      mockSetDoc.mockResolvedValue(undefined);

      const testData = {
        name: 'Test Document',
        nullValue: null,
        undefinedValue: undefined,
        emptyString: '',
        zeroValue: 0,
        falseValue: false
      };

      await adapter.createDocument('test-collection', testData);

      expect(mockSetDoc).toHaveBeenCalledWith(mockDocRef, {
        ...testData,
        id: 'test-doc-id',
        createdAt: expect.any(Object),
        updatedAt: expect.any(Object)
      });
    });

    test('should handle large documents (stress test)', async () => {
      const mockDocRef = { id: 'large-doc-id', path: 'test-collection/large-doc-id' };
      mockCollection.mockReturnValue({} as any);
      mockDoc.mockReturnValue(mockDocRef as any);
      mockSetDoc.mockResolvedValue(undefined);

      // Create a large document with many fields
      const largeData: any = {
        name: 'Large Document',
        content: 'A'.repeat(10000), // 10KB of content
        metadata: {}
      };

      // Add 100 metadata fields
      for (let i = 0; i < 100; i++) {
        largeData.metadata[`field${i}`] = `value${i}`.repeat(100);
      }

      const result = await adapter.createDocument('test-collection', largeData);

      expect(result).toBe('large-doc-id');
      expect(mockSetDoc).toHaveBeenCalledWith(mockDocRef, {
        ...largeData,
        id: 'large-doc-id',
        createdAt: expect.any(Object),
        updatedAt: expect.any(Object)
      });
    });
  });
});