"use client";

import type { WizardDocument, StageState } from '@/types';

/**
 * Client-side document persistence that calls server APIs
 * This avoids importing server-only Firebase modules in client components
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

class ClientDocumentPersistenceManager {
  private static instance: ClientDocumentPersistenceManager;

  private constructor() {}

  static getInstance(): ClientDocumentPersistenceManager {
    if (!ClientDocumentPersistenceManager.instance) {
      ClientDocumentPersistenceManager.instance = new ClientDocumentPersistenceManager();
    }
    return ClientDocumentPersistenceManager.instance;
  }

  private log(operation: string, data?: any) {
    console.log(`[ClientDocumentPersistence] ${operation}`, data || '');
  }

  private logError(operation: string, error: any) {
    console.error(`[ClientDocumentPersistence] FAILED: ${operation}`, error);
  }

  /**
   * Save or create a document via API route
   */
  async saveDocument(
    documentId: string | null,
    title: string,
    workflowId: string,
    stageStates: Record<string, StageState>,
    userId?: string
  ): Promise<SaveDocumentResult> {
    try {
      this.log('Starting save operation via API', {
        documentId,
        title,
        workflowId,
        stageStatesCount: Object.keys(stageStates).length,
        hasUserId: !!userId
      });

      const response = await fetch('/api/documents/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentId,
          title,
          workflowId,
          stageStates,
          userId
        }),
      });

      if (!response.ok) {
        let message: string;
        try {
          const json = await response.json();
          message = json.error ?? response.statusText;
        } catch {
          message = response.statusText;
        }
        throw new Error(message || "Save operation failed");
      }

      const result = await response.json();
      this.log('Save operation completed', result);
      return result;

    } catch (error: any) {
      this.logError('Save operation', error);
      return {
        success: false,
        error: error.message || 'Failed to save document'
      };
    }
  }

  /**
   * Load a document via API route
   */
  async loadDocument(documentId: string): Promise<LoadDocumentResult> {
    try {
      this.log('Starting load operation via API', { documentId });

      const response = await fetch(`/api/documents/load?documentId=${encodeURIComponent(documentId)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        let message: string;
        try {
          const json = await response.json();
          message = json.error ?? response.statusText;
        } catch {
          message = response.statusText;
        }
        throw new Error(message || "Load operation failed");
      }

      const result = await response.json();
      this.log('Load operation completed', result);
      return result;

    } catch (error: any) {
      this.logError('Load operation', error);
      return {
        success: false,
        error: error.message || 'Failed to load document'
      };
    }
  }

  /**
   * List user documents via API route
   */
  async listUserDocuments(userId?: string): Promise<WizardDocument[]> {
    try {
      this.log('Starting list operation via API', { userId });

      const url = userId 
        ? `/api/documents/list?userId=${encodeURIComponent(userId)}`
        : '/api/documents/list';

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        let message: string;
        try {
          const json = await response.json();
          message = json.error ?? response.statusText;
        } catch {
          message = response.statusText;
        }
        throw new Error(message || "List operation failed");
      }

      const result = await response.json();
      this.log('List operation completed', { count: result.length });
      return result;

    } catch (error: any) {
      this.logError('List operation', error);
      return [];
    }
  }

  /**
   * Delete a document via API route
   */
  async deleteDocument(documentId: string): Promise<boolean> {
    try {
      this.log('Starting delete operation via API', { documentId });

      const response = await fetch('/api/documents/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ documentId }),
      });

      if (!response.ok) {
        let message: string;
        try {
          const json = await response.json();
          message = json.error ?? response.statusText;
        } catch {
          message = response.statusText;
        }
        throw new Error(message || "Delete operation failed");
      }

      const result = await response.json();
      this.log('Delete operation completed', result);
      return result.success || false;

    } catch (error: any) {
      this.logError('Delete operation', error);
      return false;
    }
  }
}

// Export singleton instance
export const clientDocumentPersistence = ClientDocumentPersistenceManager.getInstance(); 