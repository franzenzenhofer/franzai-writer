import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, doc, getDoc, setDoc } from 'firebase/firestore';

export async function GET() {
  try {
    console.log('Testing Firestore connection...');
    
    // Test 1: Check Firestore database reference
    const firestoreRef = db;
    console.log('Firestore DB reference:', firestoreRef ? 'exists' : 'null');
    
    // Test 2: Try to list documents from the documents collection
    console.log('Attempting to list documents...');
    const documentsRef = collection(db, 'documents');
    const querySnapshot = await getDocs(documentsRef);
    
    const documents: any[] = [];
    querySnapshot.forEach((doc) => {
      documents.push({
        id: doc.id,
        data: doc.data()
      });
    });
    
    // Test 3: Get Firebase project info
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.substring(0, 10) + '...';
    
    return NextResponse.json({
      success: true,
      message: 'Firestore connection successful',
      tests: {
        firestoreRef: !!firestoreRef,
        documentCount: documents.length,
        documents: documents.slice(0, 3), // Only show first 3 for brevity
        config: {
          projectId,
          apiKeyPrefix: apiKey,
          hasEmulatorConfig: !!process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR
        }
      }
    });
    
  } catch (error: any) {
    console.error('Firestore test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: {
        message: error.message,
        code: error.code,
        details: error.details,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      config: {
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        hasApiKey: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        hasEmulatorConfig: !!process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR
      }
    }, { status: 500 });
  }
}

export async function POST() {
  try {
    console.log('Testing Firestore write operation...');
    
    // Test write operation
    const testDoc = {
      testField: 'Hello Firestore',
      timestamp: new Date(),
      testNumber: Math.random()
    };
    
    const docRef = await addDoc(collection(db, 'test'), testDoc);
    console.log('Test document created with ID:', docRef.id);
    
    // Read it back
    const createdDoc = await getDoc(docRef);
    const readData = createdDoc.exists() ? createdDoc.data() : null;
    
    return NextResponse.json({
      success: true,
      message: 'Firestore write/read test successful',
      testDocId: docRef.id,
      writtenData: testDoc,
      readData: readData
    });
    
  } catch (error: any) {
    console.error('Firestore write test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: {
        message: error.message,
        code: error.code,
        details: error.details
      }
    }, { status: 500 });
  }
} 