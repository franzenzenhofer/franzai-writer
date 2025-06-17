import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

console.log('🔧 Firebase Configuration:');
console.log('Project ID:', firebaseConfig.projectId);
console.log('Auth Domain:', firebaseConfig.authDomain);
console.log('Storage Bucket:', firebaseConfig.storageBucket);
console.log('App ID:', firebaseConfig.appId);
console.log('Has API Key:', !!firebaseConfig.apiKey);

try {
  const app = initializeApp(firebaseConfig);
  console.log('\n✅ Firebase app initialized successfully');
  
  // Test Auth
  try {
    const auth = getAuth(app);
    console.log('✅ Auth service initialized');
  } catch (e) {
    console.log('❌ Auth service failed:', e.message);
  }
  
  // Test Firestore
  try {
    const db = getFirestore(app);
    console.log('✅ Firestore service initialized');
  } catch (e) {
    console.log('❌ Firestore service failed:', e.message);
  }
  
  // Test Storage
  try {
    const storage = getStorage(app);
    console.log('✅ Storage service initialized');
    
    // Check if we can access the storage instance
    console.log('\nStorage instance details:');
    console.log('- App name:', storage.app.name);
    console.log('- _bucket:', storage._bucket);
    
  } catch (e) {
    console.log('❌ Storage service failed:', e.message);
  }
  
} catch (error) {
  console.error('\n❌ Failed to initialize Firebase:', error);
}