import { db } from './firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  updateDoc
} from 'firebase/firestore';
import type { WizardDocument, StageState } from '@/types';

export interface DocumentPersistenceConfig {
  enableOfflineSupport?: boolean;
  autoSaveDebounceMs?: number;
  enableLogging?: boolean;
}

export interface SaveResult {
  success: boolean;
  documentId?: string;
  error?: string;
}

export interface LoadResult {
  success: boolean;
  document?: WizardDocument;
  stageStates?: Record<string, StageState>;
  error?: string;
}

class DocumentPersistenceManager {
  private config: DocumentPersistenceConfig;
  private saveTimeouts = new Map<string, NodeJS.Timeout>();

  constructor(config: DocumentPersistenceConfig = {}) {
    this.config = {
      enableOfflineSupport: true,
      autoSaveDebounceMs: 2000,
      enableLogging: true,
      ...config
    };
  }

  private log(message: string, data?: any) {
    if (this.config.enableLogging) {
      console.log(`[DocumentPersistence] ${message}`, data || '');
    }
  }

  private logError(message: string, error?: any) {
    console.error(`[DocumentPersistence] ${message}`, error || '');
  }

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

  private generateTempUserId(): string {
    // For development - generate a consistent temp user ID
    let tempUserId = localStorage.getItem('temp_user_id');
    if (!tempUserId) {
      tempUserId = `temp_user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('temp_user_id', tempUserId);
    }
    return tempUserId;
  }

  private firestoreToWizardDocument(data: any): WizardDocument {
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

  async saveDocument(
    documentId: string | null,
    title: string,
    workflowId: string,
    stageStates: Record<string, StageState>,
    userId?: string
  ): Promise<SaveResult> {
    try {
      this.log('Starting document save', { documentId, title, workflowId });
      
      const effectiveUserId = userId || this.generateTempUserId();
      const cleanedStageStates = this.cleanUndefinedValues(stageStates);
      
      if (!documentId) {
        // Create new document
        const docRef = doc(collection(db, 'documents'));
        const newDocument = {
          id: docRef.id,
          userId: effectiveUserId,
          title,
          workflowId,
          status: 'draft' as const,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          stageStates: cleanedStageStates,
          metadata: {
            wordCount: this.calculateWordCount(stageStates),
            lastEditedStage: this.findLastEditedStage(stageStates),
          },
        };

        await setDoc(docRef, this.cleanUndefinedValues(newDocument));
        this.log('Document created successfully', { documentId: docRef.id });
        
        return {
          success: true,
          documentId: docRef.id
        };
      } else {
        // Update existing document
        const docRef = doc(db, 'documents', documentId);
        const updates = {
          title,
          status: 'draft' as const,
          stageStates: cleanedStageStates,
          updatedAt: serverTimestamp(),
          metadata: {
            wordCount: this.calculateWordCount(stageStates),
            lastEditedStage: this.findLastEditedStage(stageStates),
          },
        };

        await updateDoc(docRef, this.cleanUndefinedValues(updates));
        this.log('Document updated successfully', { documentId });
        
        return {
          success: true,
          documentId
        };
      }
    } catch (error: any) {
      this.logError('Failed to save document', error);
      return {
        success: false,
        error: error.message || 'Failed to save document'
      };
    }
  }

  async loadDocument(documentId: string): Promise<LoadResult> {
    try {
      this.log('Loading document', { documentId });
      
      const docRef = doc(db, 'documents', documentId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        this.log('Document not found', { documentId });
        return {
          success: false,
          error: 'Document not found'
        };
      }

      const data = docSnap.data();
      const document = this.firestoreToWizardDocument(data);
      
      this.log('Document loaded successfully', { documentId });
      
      return {
        success: true,
        document,
        stageStates: data.stageStates || {}
      };
    } catch (error: any) {
      this.logError('Failed to load document', error);
      return {
        success: false,
        error: error.message || 'Failed to load document'
      };
    }
  }

  async listUserDocuments(userId?: string): Promise<WizardDocument[]> {
    try {
      const effectiveUserId = userId || this.generateTempUserId();
      this.log('Listing documents for user', { userId: effectiveUserId });
      
      const q = query(
        collection(db, 'documents'),
        where('userId', '==', effectiveUserId),
        orderBy('updatedAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const documents: WizardDocument[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        documents.push(this.firestoreToWizardDocument(data));
      });

      this.log('Documents loaded successfully', { count: documents.length });
      return documents;
    } catch (error: any) {
      this.logError('Failed to list documents', error);
      return [];
    }
  }

  async deleteDocument(documentId: string): Promise<boolean> {
    try {
      this.log('Deleting document', { documentId });
      
      const docRef = doc(db, 'documents', documentId);
      await deleteDoc(docRef);
      
      this.log('Document deleted successfully', { documentId });
      return true;
    } catch (error: any) {
      this.logError('Failed to delete document', error);
      return false;
    }
  }

  private calculateWordCount(stageStates: Record<string, StageState>): number {
    let totalWords = 0;

    Object.values(stageStates).forEach(state => {
      if (state.output && typeof state.output === 'string') {
        totalWords += state.output.split(/\s+/).filter(word => word.length > 0).length;
      }
    });

    return totalWords;
  }

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
export const documentPersistence = new DocumentPersistenceManager();

// Export the class for custom instances if needed
export { DocumentPersistenceManager }; 