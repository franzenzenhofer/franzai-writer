'use client';

import type { WizardDocument, StageState } from '@/types';
import { offlineStorage } from './offline-storage';

export interface SaveDocumentResult {
  success: boolean;
  documentId?: string;
  error?: string;
  savedOffline?: boolean;
}

export interface LoadDocumentResult {
  success: boolean;
  document?: WizardDocument;
  stageStates?: Record<string, StageState>;
  error?: string;
  loadedOffline?: boolean;
}

class OfflineDocumentPersistenceManager {
  private static instance: OfflineDocumentPersistenceManager;

  private constructor() {}

  static getInstance(): OfflineDocumentPersistenceManager {
    if (!OfflineDocumentPersistenceManager.instance) {
      OfflineDocumentPersistenceManager.instance = new OfflineDocumentPersistenceManager();
    }
    return OfflineDocumentPersistenceManager.instance;
  }

  private log(operation: string, data?: any) {
    console.log(`[OfflineDocumentPersistence] ${operation}`, data || '');
  }

  private logError(operation: string, error: any) {
    console.error(`[OfflineDocumentPersistence] FAILED: ${operation}`, error);
  }

  /**
   * Save document - tries online first, falls back to offline storage
   */
  async saveDocument(
    documentId: string | null,
    title: string,
    workflowId: string,
    stageStates: Record<string, StageState>,
    userId?: string
  ): Promise<SaveDocumentResult> {
    const document: WizardDocument = {
      id: documentId || crypto.randomUUID(),
      title,
      workflowId,
      userId: userId || 'anonymous',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Try online save first
    if (navigator.onLine) {
      try {
        const result = await this.saveDocumentOnline(documentId, title, workflowId, stageStates, userId);
        
        if (result.success) {
          // Save to offline storage as cache
          await offlineStorage.saveDocument(result.documentId!, document, stageStates);
          return result;
        }
      } catch (error) {
        this.logError('Online save failed, falling back to offline', error);
      }
    }

    // Fall back to offline storage
    this.log('Saving document offline');
    const offlineResult = await offlineStorage.saveDocument(document.id, document, stageStates);
    
    if (offlineResult.success) {
      return {
        success: true,
        documentId: document.id,
        savedOffline: true,
      };
    } else {
      return {
        success: false,
        error: offlineResult.error || 'Failed to save document offline',
      };
    }
  }

  /**
   * Load document - tries online first, falls back to offline storage
   */
  async loadDocument(documentId: string): Promise<LoadDocumentResult> {
    // Try online load first
    if (navigator.onLine) {
      try {
        const result = await this.loadDocumentOnline(documentId);
        
        if (result.success) {
          // Cache in offline storage
          if (result.document && result.stageStates) {
            await offlineStorage.saveDocument(documentId, result.document, result.stageStates);
          }
          return result;
        }
      } catch (error) {
        this.logError('Online load failed, falling back to offline', error);
      }
    }

    // Fall back to offline storage
    this.log('Loading document from offline storage');
    const offlineResult = await offlineStorage.loadDocument(documentId);
    
    if (offlineResult.success) {
      return {
        success: true,
        document: offlineResult.data.document,
        stageStates: offlineResult.data.stageStates,
        loadedOffline: true,
      };
    } else {
      return {
        success: false,
        error: offlineResult.error || 'Document not found',
      };
    }
  }

  /**
   * List documents - combines online and offline sources
   */
  async listDocuments(userId?: string): Promise<{
    success: boolean;
    documents?: any[];
    error?: string;
  }> {
    const results = {
      online: [] as any[],
      offline: [] as any[],
    };

    // Try to get online documents
    if (navigator.onLine) {
      try {
        const onlineResult = await this.listDocumentsOnline(userId);
        if (onlineResult.success) {
          results.online = onlineResult.documents || [];
        }
      } catch (error) {
        this.logError('Online list failed', error);
      }
    }

    // Get offline documents
    const offlineResult = await offlineStorage.listDocuments();
    if (offlineResult.success) {
      results.offline = offlineResult.data || [];
    }

    // Combine and deduplicate
    const allDocuments = [...results.online, ...results.offline];
    const uniqueDocuments = allDocuments.filter(
      (doc, index, self) => index === self.findIndex(d => d.id === doc.id)
    );

    return {
      success: true,
      documents: uniqueDocuments,
    };
  }

  /**
   * Delete document - tries online first, then offline
   */
  async deleteDocument(documentId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    let onlineSuccess = false;
    let offlineSuccess = false;

    // Try online delete
    if (navigator.onLine) {
      try {
        const result = await this.deleteDocumentOnline(documentId);
        onlineSuccess = result.success;
      } catch (error) {
        this.logError('Online delete failed', error);
      }
    }

    // Try offline delete
    const offlineResult = await offlineStorage.deleteDocument(documentId);
    offlineSuccess = offlineResult.success;

    return {
      success: onlineSuccess || offlineSuccess,
      error: onlineSuccess || offlineSuccess ? undefined : 'Failed to delete document',
    };
  }

  /**
   * Sync pending offline documents when back online
   */
  async syncPendingDocuments(): Promise<{
    success: boolean;
    syncedCount?: number;
    failedCount?: number;
    error?: string;
  }> {
    if (!navigator.onLine) {
      return {
        success: false,
        error: 'Cannot sync while offline',
      };
    }

    const pendingResult = await offlineStorage.getPendingSyncDocuments();
    if (!pendingResult.success) {
      return {
        success: false,
        error: pendingResult.error,
      };
    }

    const pendingDocs = pendingResult.data || [];
    let syncedCount = 0;
    let failedCount = 0;

    for (const offlineDoc of pendingDocs) {
      try {
        const result = await this.saveDocumentOnline(
          offlineDoc.id,
          offlineDoc.document.title,
          offlineDoc.document.workflowId,
          offlineDoc.stageStates,
          offlineDoc.document.userId
        );

        if (result.success) {
          await offlineStorage.markDocumentSynced(offlineDoc.id);
          syncedCount++;
        } else {
          failedCount++;
        }
      } catch (error) {
        this.logError(`Sync failed for document ${offlineDoc.id}`, error);
        failedCount++;
      }
    }

    return {
      success: true,
      syncedCount,
      failedCount,
    };
  }

  // Private methods for online operations
  private async saveDocumentOnline(
    documentId: string | null,
    title: string,
    workflowId: string,
    stageStates: Record<string, StageState>,
    userId?: string
  ): Promise<SaveDocumentResult> {
    const response = await fetch('/api/documents/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        documentId,
        title,
        workflowId,
        stageStates,
        userId,
      }),
    });

    const result = await response.json();
    return result;
  }

  private async loadDocumentOnline(documentId: string): Promise<LoadDocumentResult> {
    const response = await fetch(`/api/documents/load?documentId=${documentId}`);
    const result = await response.json();
    return result;
  }

  private async listDocumentsOnline(userId?: string): Promise<{
    success: boolean;
    documents?: any[];
    error?: string;
  }> {
    const url = userId ? `/api/documents/list?userId=${userId}` : '/api/documents/list';
    const response = await fetch(url);
    const result = await response.json();
    return result;
  }

  private async deleteDocumentOnline(documentId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    const response = await fetch('/api/documents/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documentId }),
    });

    const result = await response.json();
    return result;
  }
}

export const offlineDocumentPersistence = OfflineDocumentPersistenceManager.getInstance();