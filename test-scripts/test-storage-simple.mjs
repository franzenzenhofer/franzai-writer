import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET, // Use env variable
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

console.log('🔧 Firebase Config:', {
  projectId: firebaseConfig.projectId,
  storageBucket: firebaseConfig.storageBucket,
  hasApiKey: !!firebaseConfig.apiKey
});

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

async function testStorageUpload() {
  try {
    console.log('\n🚀 Testing Firebase Storage upload...\n');
    
    // Create a simple test file
    const testContent = 'Hello Firebase Storage!';
    const blob = new Blob([testContent], { type: 'text/plain' });
    
    // Create storage reference
    const timestamp = Date.now();
    const storagePath = `test/test-file-${timestamp}.txt`;
    const storageRef = ref(storage, storagePath);
    
    console.log('📤 Uploading to:', storagePath);
    console.log('📦 File size:', blob.size, 'bytes');
    
    // Upload file
    const uploadResult = await uploadBytes(storageRef, blob, {
      contentType: 'text/plain'
    });
    
    console.log('✅ Upload successful!');
    console.log('📍 Full path:', uploadResult.ref.fullPath);
    
    // Get download URL
    const downloadUrl = await getDownloadURL(uploadResult.ref);
    console.log('🔗 Download URL:', downloadUrl);
    
    return { success: true, url: downloadUrl, path: storagePath };
  } catch (error) {
    console.error('\n❌ Storage test failed:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    if (error.serverResponse) {
      console.error('Server response:', error.serverResponse);
    }
    
    return { success: false, error };
  }
}

// Run the test
testStorageUpload().then(result => {
  if (result.success) {
    console.log('\n✅ Firebase Storage is working correctly!');
  } else {
    console.log('\n❌ Firebase Storage test failed');
    process.exit(1);
  }
});