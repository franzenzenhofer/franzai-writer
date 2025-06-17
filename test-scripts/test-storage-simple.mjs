#!/usr/bin/env node

/**
 * Simple test for Firebase Storage configuration
 */

import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getStorage, ref, uploadString, getDownloadURL } from 'firebase/storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBvT5eKaJZDh36ZNuO3Vq9IfcUC_GKOP7U",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "franzai-writer.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "franzai-writer",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "franzai-writer.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "1040570617854",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:1040570617854:web:8c1cf4c86b073b37a1848d"
};

console.log('Firebase Config:', {
  projectId: firebaseConfig.projectId,
  storageBucket: firebaseConfig.storageBucket
});

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const storage = getStorage(app);

async function testStorage() {
  try {
    // Skip authentication for now - using public rules for test folder
    console.log('Testing without authentication (using public test folder)...');
    
    // Create a simple test file
    const testContent = 'Hello Firebase Storage!';
    const testPath = `test/test-${Date.now()}.txt`;
    const storageRef = ref(storage, testPath);
    
    console.log('Uploading test file to:', testPath);
    await uploadString(storageRef, testContent);
    console.log('✅ Upload successful');
    
    // Get download URL
    const downloadUrl = await getDownloadURL(storageRef);
    console.log('✅ Download URL:', downloadUrl);
    
    // Try to fetch the file
    const response = await fetch(downloadUrl);
    const content = await response.text();
    console.log('✅ File content:', content);
    
    if (content === testContent) {
      console.log('✨ Storage test passed!');
    } else {
      console.error('❌ Content mismatch');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      serverResponse: error.serverResponse
    });
  }
}

testStorage();