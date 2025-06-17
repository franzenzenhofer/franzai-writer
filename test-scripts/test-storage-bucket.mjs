import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadString, getDownloadURL } from 'firebase/storage';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

async function testBucket(bucketUrl) {
  console.log(`\n🧪 Testing bucket: ${bucketUrl}`);
  
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: bucketUrl,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
  };
  
  try {
    const app = initializeApp(firebaseConfig, `test-${Date.now()}`);
    const storage = getStorage(app);
    
    // Try a simple upload
    const testRef = ref(storage, `test/test-${Date.now()}.txt`);
    await uploadString(testRef, 'Hello Firebase Storage!');
    
    const url = await getDownloadURL(testRef);
    console.log('✅ SUCCESS! Download URL:', url);
    return true;
  } catch (error) {
    console.log('❌ Failed:', error.code, error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Testing different Firebase Storage bucket URLs...\n');
  
  const bucketUrls = [
    'franzai-writer.appspot.com',
    'franzai-writer.firebasestorage.app',
    'gs://franzai-writer.appspot.com',
    'gs://franzai-writer.firebasestorage.app'
  ];
  
  for (const url of bucketUrls) {
    await testBucket(url);
  }
  
  console.log('\n📊 Test complete!');
}

runTests();