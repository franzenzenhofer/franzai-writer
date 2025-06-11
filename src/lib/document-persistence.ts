import { firestoreAdapter } from './firestore-adapter';
import type { WizardDocument, StageState } from '@/types';

/**
 * CRITICAL: Document Persistence with FAIL-HARD semantics
 * - No fallbacks, no mock data, no graceful degradation
 * - All operations must succeed or fail completely
 * - Stage states are preserved exactly as provided
 * - All errors are logged and re-thrown
 */

export interface SaveDocumentResult {
  success: boolean;
  documentId?: string;
  error?: string;
}

export interface LoadDocumentResult {
  success: boolean;
  document?: WizardDocument;
  stageStates?: Record<string, StageState>;
  error?: string;
}

class DocumentPersistenceManager {
  private static instance: DocumentPersistenceManager;
  private readonly COLLECTION_NAME = 'documents';

  private constructor() {
    // Validate that Firestore adapter is available
    if (!firestoreAdapter) {
      throw new Error('FATAL: Firestore adapter not available');
    }
  }

  static getInstance(): DocumentPersistenceManager {
    if (!DocumentPersistenceManager.instance) {
      DocumentPersistenceManager.instance = new DocumentPersistenceManager();
    }
    return DocumentPersistenceManager.instance;
  }

  private log(operation: string, data?: any) {
    console.log(`[DocumentPersistence] ${operation}`, data || '');
  }

  private logError(operation: string, error: any) {
    console.error(`[DocumentPersistence] FAILED: ${operation}`, error);
  }

  /**
   * Generate user ID for development - FAIL if localStorage not available in browser
   */
  private generateUserId(): string {
    if (typeof window === 'undefined') {
      // Server-side: generate unique ID per request
      return `server_user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    if (typeof localStorage === 'undefined') {
      throw new Error('FATAL: localStorage not available in browser environment');
    }

    let userId = localStorage.getItem('temp_user_id');
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('temp_user_id', userId);
      this.log('Generated new user ID', { userId });
    }
    return userId;
  }

  /**
   * Convert Firestore document to WizardDocument
   */
  private firestoreToWizardDocument(data: any): WizardDocument {
    if (!data) {
      throw new Error('FATAL: Cannot convert null/undefined Firestore data to WizardDocument');
    }

    return {
      id: data.id,
      title: data.title,
      workflowId: data.workflowId,
      status: data.status,
      createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
      updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
      userId: data.userId,
    };
  }

  /**
   * Save or create a document - FAIL HARD on any error
   */
  async saveDocument(
    documentId: string | null,
    title: string,
    workflowId: string,
    stageStates: Record<string, StageState>,
    userId?: string
  ): Promise<SaveDocumentResult> {
    try {
      this.log('Starting document save', {
        documentId,
        title,
        workflowId,
        stageStatesKeys: Object.keys(stageStates),
        hasUserId: !!userId
      });

      // Validate required fields
      if (!title?.trim()) {
        throw new Error('FATAL: Document title is required');
      }
      if (!workflowId?.trim()) {
        throw new Error('FATAL: Workflow ID is required');
      }
      if (!stageStates || typeof stageStates !== 'object') {
        throw new Error('FATAL: Stage states must be a valid object');
      }

      const effectiveUserId = userId || this.generateUserId();
      this.log('Using user ID', { userId: effectiveUserId });

      // Clean stage states to ensure Firestore compatibility
      const cleanedStageStates = this.cleanStageStates(stageStates);
      this.log('Stage states cleaned', {
        originalKeys: Object.keys(stageStates),
        cleanedKeys: Object.keys(cleanedStageStates)
      });

      if (!documentId) {
        // CREATE new document
        const documentData = {
          userId: effectiveUserId,
          title: title.trim(),
          workflowId: workflowId.trim(),
          status: 'draft' as const,
          stageStates: cleanedStageStates,
          metadata: {
            wordCount: this.calculateWordCount(stageStates),
            lastEditedStage: this.findLastEditedStage(stageStates),
            stageCount: Object.keys(stageStates).length
          }
        };

        const createdId = await firestoreAdapter.createDocument(this.COLLECTION_NAME, documentData);
        this.log('Document created successfully', { documentId: createdId });

        return {
          success: true,
          documentId: createdId
        };
      } else {
        // UPDATE existing document
        const updates = {
          title: title.trim(),
          status: 'draft' as const,
          stageStates: cleanedStageStates,
          metadata: {
            wordCount: this.calculateWordCount(stageStates),
            lastEditedStage: this.findLastEditedStage(stageStates),
            stageCount: Object.keys(stageStates).length
          }
        };

        await firestoreAdapter.updateDocument(this.COLLECTION_NAME, documentId, updates);
        this.log('Document updated successfully', { documentId });

        return {
          success: true,
          documentId
        };
      }
    } catch (error: any) {
      this.logError('saveDocument', error);
      return {
        success: false,
        error: error.message || 'Failed to save document'
      };
    }
  }

  /**
   * Load a document by ID - FAIL HARD if not found or invalid
   */
  async loadDocument(documentId: string): Promise<LoadDocumentResult> {
    try {
      this.log('Loading document', { documentId });

      if (!documentId?.trim()) {
        throw new Error('FATAL: Document ID is required');
      }

      const data = await firestoreAdapter.getDocument(this.COLLECTION_NAME, documentId);

      if (!data) {
        this.log('Document not found', { documentId });
        return {
          success: false,
          error: 'Document not found'
        };
      }

      // Validate document structure
      if (!data.stageStates || typeof data.stageStates !== 'object') {
        this.logError('Invalid document structure', { documentId, hasStageStates: !!data.stageStates });
        throw new Error('FATAL: Document has invalid or missing stage states');
      }

      const document = this.firestoreToWizardDocument(data);
      const stageStates = data.stageStates;

      this.log('Document loaded successfully', {
        documentId,
        title: document.title,
        stageStatesCount: Object.keys(stageStates).length,
        stageStatesKeys: Object.keys(stageStates)
      });

      return {
        success: true,
        document,
        stageStates
      };
    } catch (error: any) {
      this.logError('loadDocument', error);
      return {
        success: false,
        error: error.message || 'Failed to load document'
      };
    }
  }

  /**
   * List user documents - FAIL HARD on any error
   */
  async listUserDocuments(userId?: string): Promise<WizardDocument[]> {
    try {
      const effectiveUserId = userId || this.generateUserId();
      this.log('Listing documents for user', { userId: effectiveUserId });

      const documents = await firestoreAdapter.queryDocuments(
        this.COLLECTION_NAME,
        { field: 'userId', operator: '==', value: effectiveUserId },
        { field: 'updatedAt', direction: 'desc' }
      );

      const wizardDocuments = documents.map(data => this.firestoreToWizardDocument(data));

      this.log('Documents listed successfully', {
        userId: effectiveUserId,
        count: wizardDocuments.length
      });

      return wizardDocuments;
    } catch (error: any) {
      this.logError('listUserDocuments', error);
      throw new Error(`FATAL: Failed to list user documents: ${error.message}`);
    }
  }

  /**
   * Delete a document - FAIL HARD on any error
   */
  async deleteDocument(documentId: string): Promise<boolean> {
    try {
      this.log('Deleting document', { documentId });

      if (!documentId?.trim()) {
        throw new Error('FATAL: Document ID is required');
      }

      await firestoreAdapter.deleteDocument(this.COLLECTION_NAME, documentId);
      this.log('Document deleted successfully', { documentId });

      return true;
    } catch (error: any) {
      this.logError('deleteDocument', error);
      throw new Error(`FATAL: Failed to delete document: ${error.message}`);
    }
  }

  /**
   * Clean stage states for Firestore storage
   */
  private cleanStageStates(stageStates: Record<string, StageState>): Record<string, StageState> {
    const cleaned: Record<string, StageState> = {};

    for (const [stageId, state] of Object.entries(stageStates)) {
      if (!state || typeof state !== 'object') {
        this.log('Skipping invalid stage state', { stageId, state });
        continue;
      }

      cleaned[stageId] = this.cleanUndefinedValues(state);
    }

    return cleaned;
  }

  /**
   * Recursively clean undefined values
   */
  private cleanUndefinedValues(obj: any): any {
    if (obj === null || obj === undefined) {
      return null;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.cleanUndefinedValues(item));
    }

    if (typeof obj === 'object') {
      const cleaned: any = {};
      for (const [key, value] of Object.entries(obj)) {
        if (value !== undefined) {
          cleaned[key] = this.cleanUndefinedValues(value);
        }
      }
      return cleaned;
    }

    return obj;
  }

  /**
   * Calculate word count from stage outputs
   */
  private calculateWordCount(stageStates: Record<string, StageState>): number {
    let totalWords = 0;

    Object.values(stageStates).forEach(state => {
      if (state.output && typeof state.output === 'string') {
        totalWords += state.output.split(/\s+/).filter(word => word.length > 0).length;
      }
    });

    return totalWords;
  }

  /**
   * Find the last edited stage
   */
  private findLastEditedStage(stageStates: Record<string, StageState>): string | undefined {
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
}

// Export singleton instance
export const documentPersistence = DocumentPersistenceManager.getInstance(); 