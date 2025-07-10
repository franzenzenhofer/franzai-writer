'use client';

import type { WizardDocument, StageState } from '@/types';

interface OfflineDocument {
  id: string;
  document: WizardDocument;
  stageStates: Record<string, StageState>;
  lastModified: string;
  pendingSync: boolean;
}

interface OfflineStorageResult {
  success: boolean;
  error?: string;
  data?: any;
}

class OfflineStorageManager {
  private static instance: OfflineStorageManager;
  private readonly STORAGE_KEY = 'franzai-offline-documents';
  private readonly MAX_DOCUMENTS = 50; // Limit offline storage

  private constructor() {}

  static getInstance(): OfflineStorageManager {
    if (!OfflineStorageManager.instance) {
      OfflineStorageManager.instance = new OfflineStorageManager();
    }
    return OfflineStorageManager.instance;
  }

  /**
   * Save document to offline storage
   */
  async saveDocument(
    documentId: string,
    document: WizardDocument,
    stageStates: Record<string, StageState>
  ): Promise<OfflineStorageResult> {
    try {
      const offlineDoc: OfflineDocument = {
        id: documentId,
        document,
        stageStates,
        lastModified: new Date().toISOString(),
        pendingSync: !navigator.onLine,
      };

      const existingDocs = this.getStoredDocuments();
      const updatedDocs = {
        ...existingDocs,
        [documentId]: offlineDoc,
      };

      // Clean up old documents if we exceed the limit
      this.cleanupOldDocuments(updatedDocs);

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedDocs));
      
      console.log(`[OfflineStorage] Saved document ${documentId} offline`);
      return { success: true };
    } catch (error) {
      console.error('[OfflineStorage] Save failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Load document from offline storage
   */
  async loadDocument(documentId: string): Promise<OfflineStorageResult> {
    try {
      const storedDocs = this.getStoredDocuments();
      const offlineDoc = storedDocs[documentId];

      if (!offlineDoc) {
        return { success: false, error: 'Document not found in offline storage' };
      }

      console.log(`[OfflineStorage] Loaded document ${documentId} from offline storage`);
      return {
        success: true,
        data: {
          document: offlineDoc.document,
          stageStates: offlineDoc.stageStates,
        },
      };
    } catch (error) {
      console.error('[OfflineStorage] Load failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * List all offline documents
   */
  async listDocuments(): Promise<OfflineStorageResult> {
    try {
      const storedDocs = this.getStoredDocuments();
      const documentList = Object.values(storedDocs).map(doc => ({
        id: doc.id,
        title: doc.document.title,
        workflowId: doc.document.workflowId,
        lastModified: doc.lastModified,
        pendingSync: doc.pendingSync,
      }));

      return {
        success: true,
        data: documentList,
      };
    } catch (error) {
      console.error('[OfflineStorage] List failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Delete document from offline storage
   */
  async deleteDocument(documentId: string): Promise<OfflineStorageResult> {
    try {
      const storedDocs = this.getStoredDocuments();
      delete storedDocs[documentId];
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(storedDocs));
      
      console.log(`[OfflineStorage] Deleted document ${documentId} from offline storage`);
      return { success: true };
    } catch (error) {
      console.error('[OfflineStorage] Delete failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Get documents pending sync
   */
  async getPendingSyncDocuments(): Promise<OfflineStorageResult> {
    try {
      const storedDocs = this.getStoredDocuments();
      const pendingDocs = Object.values(storedDocs).filter(doc => doc.pendingSync);
      
      return {
        success: true,
        data: pendingDocs,
      };
    } catch (error) {
      console.error('[OfflineStorage] Get pending sync failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Mark document as synced
   */
  async markDocumentSynced(documentId: string): Promise<OfflineStorageResult> {
    try {
      const storedDocs = this.getStoredDocuments();
      const doc = storedDocs[documentId];
      
      if (doc) {
        doc.pendingSync = false;
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(storedDocs));
        console.log(`[OfflineStorage] Marked document ${documentId} as synced`);
      }
      
      return { success: true };
    } catch (error) {
      console.error('[OfflineStorage] Mark synced failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Clear all offline storage
   */
  async clearStorage(): Promise<OfflineStorageResult> {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      console.log('[OfflineStorage] Cleared all offline storage');
      return { success: true };
    } catch (error) {
      console.error('[OfflineStorage] Clear failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Get storage usage info
   */
  getStorageInfo(): { count: number; size: number } {
    try {
      const storedDocs = this.getStoredDocuments();
      const serialized = JSON.stringify(storedDocs);
      
      return {
        count: Object.keys(storedDocs).length,
        size: new Blob([serialized]).size,
      };
    } catch (error) {
      console.error('[OfflineStorage] Get storage info failed:', error);
      return { count: 0, size: 0 };
    }
  }

  private getStoredDocuments(): Record<string, OfflineDocument> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('[OfflineStorage] Failed to parse stored documents:', error);
      return {};
    }
  }

  private cleanupOldDocuments(docs: Record<string, OfflineDocument>): void {
    const docArray = Object.values(docs);
    
    if (docArray.length > this.MAX_DOCUMENTS) {
      // Sort by last modified date (oldest first)
      docArray.sort((a, b) => new Date(a.lastModified).getTime() - new Date(b.lastModified).getTime());
      
      // Remove oldest documents
      const toRemove = docArray.slice(0, docArray.length - this.MAX_DOCUMENTS);
      toRemove.forEach(doc => delete docs[doc.id]);
      
      console.log(`[OfflineStorage] Cleaned up ${toRemove.length} old documents`);
    }
  }
}

export const offlineStorage = OfflineStorageManager.getInstance();