import { initializeApp } from 'firebase/app';
import { getStorage, ref, listAll, getDownloadURL } from 'firebase/storage';
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

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

async function listStorageFiles() {
  console.log('📂 Listing files in Firebase Storage...\n');
  
  try {
    // List all files in the root
    const rootRef = ref(storage);
    const rootList = await listAll(rootRef);
    
    // List folders
    if (rootList.prefixes.length > 0) {
      console.log('📁 Folders:');
      for (const folderRef of rootList.prefixes) {
        console.log(`  - ${folderRef.name}/`);
        
        // List files in each folder
        const folderContents = await listAll(folderRef);
        if (folderContents.items.length > 0) {
          for (const item of folderContents.items) {
            const url = await getDownloadURL(item);
            console.log(`    📄 ${item.name}`);
            console.log(`       🔗 ${url}\n`);
          }
        }
      }
    }
    
    // List files in root
    if (rootList.items.length > 0) {
      console.log('\n📄 Files in root:');
      for (const item of rootList.items) {
        const url = await getDownloadURL(item);
        console.log(`  - ${item.name}`);
        console.log(`    🔗 ${url}\n`);
      }
    }
    
    // Check specific folders
    console.log('\n🔍 Checking specific folders:');
    
    // Check test folder
    const testRef = ref(storage, 'test');
    try {
      const testList = await listAll(testRef);
      console.log(`\n📁 test/ (${testList.items.length} files)`);
      for (const item of testList.items) {
        const url = await getDownloadURL(item);
        console.log(`  📄 ${item.name}`);
        console.log(`     🔗 ${url}`);
      }
    } catch (e) {
      console.log('  ❌ test/ folder not found or empty');
    }
    
    // Check assets folder
    const assetsRef = ref(storage, 'assets');
    try {
      const assetsList = await listAll(assetsRef);
      console.log(`\n📁 assets/ (${assetsList.prefixes.length} subfolders)`);
      
      // List first 5 asset folders
      const maxToShow = 5;
      const foldersToShow = assetsList.prefixes.slice(0, maxToShow);
      
      for (const assetFolder of foldersToShow) {
        const assetFiles = await listAll(assetFolder);
        if (assetFiles.items.length > 0) {
          console.log(`  📁 ${assetFolder.name}/`);
          for (const item of assetFiles.items) {
            const url = await getDownloadURL(item);
            console.log(`    📄 ${item.name}`);
            console.log(`       🔗 ${url}`);
          }
        }
      }
      
      if (assetsList.prefixes.length > maxToShow) {
        console.log(`  ... and ${assetsList.prefixes.length - maxToShow} more asset folders`);
      }
    } catch (e) {
      console.log('  ❌ assets/ folder not found or empty');
    }
    
  } catch (error) {
    console.error('❌ Error listing storage files:', error);
  }
}

listStorageFiles();