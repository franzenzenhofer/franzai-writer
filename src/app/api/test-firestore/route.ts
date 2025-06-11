import { NextResponse } from 'next/server';
import { firestoreAdapter } from '@/lib/firestore-adapter';

export async function GET() {
  try {
    console.log('Testing Firestore connection via adapter...');
    
    // Test 1: Get all documents using the adapter
    const documents = await firestoreAdapter.getAllDocuments('documents');
    
    // Test 2: Get Firebase project info
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.substring(0, 10) + '...';
    
    return NextResponse.json({
      success: true,
      message: 'Firestore connection successful via adapter',
      tests: {
        adapterWorking: true,
        documentCount: documents.length,
        documents: documents.map(doc => ({
          id: doc.id,
          title: doc.title,
          workflowId: doc.workflowId,
          userId: doc.userId,
          createdAt: doc.createdAt,
          status: doc.status
        })),
        config: {
          projectId,
          apiKeyPrefix: apiKey,
          hasEmulatorConfig: !!process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR
        }
      }
    });
    
  } catch (error: any) {
    console.error('Firestore adapter test failed:', error);
    
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

export async function POST() {
  try {
    console.log('Testing Firestore write operation via adapter...');
    
    // Test write operation
    const testDoc = {
      testField: 'Hello Firestore via Adapter',
      timestamp: new Date().toISOString(),
      testNumber: Math.random()
    };
    
    const docId = await firestoreAdapter.createDocument('test', testDoc);
    console.log('Test document created with ID:', docId);
    
    // Read it back
    const readData = await firestoreAdapter.getDocument('test', docId);
    
    return NextResponse.json({
      success: true,
      message: 'Firestore write/read test successful via adapter',
      testDocId: docId,
      writtenData: testDoc,
      readData: readData
    });
    
  } catch (error: any) {
    console.error('Firestore adapter write test failed:', error);
    
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