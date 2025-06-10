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
  Timestamp,
  serverTimestamp,
  updateDoc
} from 'firebase/firestore';
import { db } from './firebase';
import type { WizardDocument, StageState } from '@/types';

export interface FirestoreDocument {
  id: string;
  userId: string;
  title: string;
  workflowId: string;
  status: 'draft' | 'completed';
  createdAt: Timestamp | ReturnType<typeof serverTimestamp>;
  updatedAt: Timestamp | ReturnType<typeof serverTimestamp>;
  stageStates: Record<string, StageState>;
  metadata?: {
    wordCount?: number;
    lastEditedStage?: string;
  };
}

// Convert Firestore document to WizardDocument
function firestoreToWizardDocument(doc: FirestoreDocument): WizardDocument {
  return {
    id: doc.id,
    title: doc.title,
    workflowId: doc.workflowId,
    status: doc.status,
    createdAt: doc.createdAt instanceof Timestamp ? doc.createdAt.toDate().toISOString() : new Date().toISOString(),
    updatedAt: doc.updatedAt instanceof Timestamp ? doc.updatedAt.toDate().toISOString() : new Date().toISOString(),
    userId: doc.userId,
  };
}

// Create a new document
export async function createDocument(
  userId: string,
  title: string,
  workflowId: string,
  initialStageStates: Record<string, StageState>
): Promise<string> {
  const docRef = doc(collection(db, 'documents'));
  const newDocument: FirestoreDocument = {
    id: docRef.id,
    userId,
    title,
    workflowId,
    status: 'draft',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    stageStates: initialStageStates,
    metadata: {
      wordCount: 0,
      lastEditedStage: undefined,
    },
  };

  await setDoc(docRef, newDocument);
  return docRef.id;
}

// Update document
export async function updateDocument(
  documentId: string,
  updates: Partial<{
    title: string;
    status: 'draft' | 'completed';
    stageStates: Record<string, StageState>;
    metadata: {
      wordCount?: number;
      lastEditedStage?: string;
    };
  }>
): Promise<void> {
  const docRef = doc(db, 'documents', documentId);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

// Update a single stage state
export async function updateStageState(
  documentId: string,
  stageId: string,
  stageState: StageState
): Promise<void> {
  const docRef = doc(db, 'documents', documentId);
  await updateDoc(docRef, {
    [`stageStates.${stageId}`]: stageState,
    updatedAt: serverTimestamp(),
    'metadata.lastEditedStage': stageId,
  });
}

// Get document by ID
export async function getDocument(documentId: string): Promise<{ document: WizardDocument; stageStates: Record<string, StageState> } | null> {
  const docRef = doc(db, 'documents', documentId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null;
  }

  const data = docSnap.data() as FirestoreDocument;
  return {
    document: firestoreToWizardDocument(data),
    stageStates: data.stageStates,
  };
}

// List user documents
export async function listUserDocuments(userId: string): Promise<WizardDocument[]> {
  const q = query(
    collection(db, 'documents'),
    where('userId', '==', userId),
    orderBy('updatedAt', 'desc')
  );

  const querySnapshot = await getDocs(q);
  const documents: WizardDocument[] = [];

  querySnapshot.forEach((doc) => {
    const data = doc.data() as FirestoreDocument;
    documents.push(firestoreToWizardDocument(data));
  });

  return documents;
}

// Delete document
export async function deleteDocument(documentId: string): Promise<void> {
  const docRef = doc(db, 'documents', documentId);
  await deleteDoc(docRef);
}

// Check if user owns document
export async function userOwnsDocument(documentId: string, userId: string): Promise<boolean> {
  const docRef = doc(db, 'documents', documentId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return false;
  }

  const data = docSnap.data() as FirestoreDocument;
  return data.userId === userId;
}