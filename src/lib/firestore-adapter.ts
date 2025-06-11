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
  serverTimestamp,
  updateDoc,
  DocumentReference,
  CollectionReference,
  QuerySnapshot,
  DocumentSnapshot
} from 'firebase/firestore';

/**
 * CRITICAL: This adapter implements FAIL-HARD semantics
 * - No fallbacks, no mock data, no graceful degradation
 * - All errors are thrown immediately
 * - All operations must succeed or fail completely
 * - Comprehensive logging for debugging
 */

export class FirestoreAdapter {
  private static instance: FirestoreAdapter;
  
  private constructor() {
    if (!db) {
      throw new Error('FATAL: Firestore database not initialized');
    }
  }

  static getInstance(): FirestoreAdapter {
    if (!FirestoreAdapter.instance) {
      FirestoreAdapter.instance = new FirestoreAdapter();
    }
    return FirestoreAdapter.instance;
  }

  private log(operation: string, data?: any) {
    console.log(`[FirestoreAdapter] ${operation}`, data || '');
  }

  private logError(operation: string, error: any) {
    console.error(`[FirestoreAdapter] FAILED: ${operation}`, error);
  }

  /**
   * Create a new document with auto-generated ID
   */
  async createDocument(collectionName: string, data: any): Promise<string> {
    this.log('Creating document', { collection: collectionName });
    
    try {
      const docRef = doc(collection(db, collectionName));
      const documentData = {
        ...data,
        id: docRef.id,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      await setDoc(docRef, documentData);
      this.log('Document created', { collection: collectionName, id: docRef.id });
      return docRef.id;
    } catch (error) {
      this.logError(`createDocument in ${collectionName}`, error);
      throw new Error(`FATAL: Failed to create document in ${collectionName}: ${error}`);
    }
  }

  /**
   * Update an existing document by ID
   */
  async updateDocument(collectionName: string, documentId: string, updates: any): Promise<void> {
    this.log('Updating document', { collection: collectionName, id: documentId });
    
    try {
      const docRef = doc(db, collectionName, documentId);
      const updateData = {
        ...updates,
        updatedAt: serverTimestamp()
      };
      
      await updateDoc(docRef, updateData);
      this.log('Document updated', { collection: collectionName, id: documentId });
    } catch (error) {
      this.logError(`updateDocument ${documentId} in ${collectionName}`, error);
      throw new Error(`FATAL: Failed to update document ${documentId} in ${collectionName}: ${error}`);
    }
  }

  /**
   * Get a document by ID - FAILS if document doesn't exist
   */
  async getDocument(collectionName: string, documentId: string): Promise<any> {
    this.log('Getting document', { collection: collectionName, id: documentId });
    
    try {
      const docRef = doc(db, collectionName, documentId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        this.log('Document not found', { collection: collectionName, id: documentId });
        return null;
      }
      
      const data = docSnap.data();
      this.log('Document retrieved', { collection: collectionName, id: documentId });
      return data;
    } catch (error) {
      this.logError(`getDocument ${documentId} in ${collectionName}`, error);
      throw new Error(`FATAL: Failed to get document ${documentId} in ${collectionName}: ${error}`);
    }
  }

  /**
   * Query documents with conditions
   */
  async queryDocuments(
    collectionName: string, 
    whereClause?: { field: string; operator: any; value: any },
    orderByClause?: { field: string; direction: 'asc' | 'desc' },
    limitCount?: number
  ): Promise<any[]> {
    this.log('Querying documents', { 
      collection: collectionName, 
      where: whereClause, 
      orderBy: orderByClause,
      limit: limitCount 
    });
    
    try {
      let q = collection(db, collectionName);
      
      if (whereClause) {
        q = query(q as any, where(whereClause.field, whereClause.operator, whereClause.value)) as any;
      }
      
      if (orderByClause) {
        q = query(q as any, orderBy(orderByClause.field, orderByClause.direction)) as any;
      }
      
      const querySnapshot = await getDocs(q as any);
      const documents: any[] = [];
      
      querySnapshot.forEach((doc) => {
        documents.push(doc.data());
      });
      
      this.log('Query completed', { 
        collection: collectionName, 
        count: documents.length 
      });
      
      return documents;
    } catch (error) {
      this.logError(`queryDocuments in ${collectionName}`, error);
      throw new Error(`FATAL: Failed to query documents in ${collectionName}: ${error}`);
    }
  }

  /**
   * Delete a document by ID
   */
  async deleteDocument(collectionName: string, documentId: string): Promise<void> {
    this.log('Deleting document', { collection: collectionName, id: documentId });
    
    try {
      const docRef = doc(db, collectionName, documentId);
      await deleteDoc(docRef);
      this.log('Document deleted', { collection: collectionName, id: documentId });
    } catch (error) {
      this.logError(`deleteDocument ${documentId} in ${collectionName}`, error);
      throw new Error(`FATAL: Failed to delete document ${documentId} in ${collectionName}: ${error}`);
    }
  }

  /**
   * Get all documents in a collection
   */
  async getAllDocuments(collectionName: string): Promise<any[]> {
    this.log('Getting all documents', { collection: collectionName });
    
    try {
      const collectionRef = collection(db, collectionName);
      const querySnapshot = await getDocs(collectionRef);
      const documents: any[] = [];
      
      querySnapshot.forEach((doc) => {
        documents.push(doc.data());
      });
      
      this.log('All documents retrieved', { 
        collection: collectionName, 
        count: documents.length 
      });
      
      return documents;
    } catch (error) {
      this.logError(`getAllDocuments in ${collectionName}`, error);
      throw new Error(`FATAL: Failed to get all documents in ${collectionName}: ${error}`);
    }
  }

  /**
   * Check if a document exists
   */
  async documentExists(collectionName: string, documentId: string): Promise<boolean> {
    this.log('Checking document existence', { collection: collectionName, id: documentId });
    
    try {
      const docRef = doc(db, collectionName, documentId);
      const docSnap = await getDoc(docRef);
      const exists = docSnap.exists();
      
      this.log('Document existence checked', { 
        collection: collectionName, 
        id: documentId, 
        exists 
      });
      
      return exists;
    } catch (error) {
      this.logError(`documentExists ${documentId} in ${collectionName}`, error);
      throw new Error(`FATAL: Failed to check document existence ${documentId} in ${collectionName}: ${error}`);
    }
  }

  /**
   * Clean undefined values from objects (Firestore requirement)
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
}

// Export singleton instance
export const firestoreAdapter = FirestoreAdapter.getInstance(); 