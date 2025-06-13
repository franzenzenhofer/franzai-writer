import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, orderBy, getDocs } from 'firebase/firestore';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

// Firebase configuration from environment
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function listTitles() {
  try {
    // Query all documents, ordered by updatedAt descending
    const documentsRef = collection(db, 'documents');
    const q = query(documentsRef, orderBy('updatedAt', 'desc'));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      console.log('No documents found.');
      return;
    }
    
    console.log(`Document Titles (${snapshot.docs.length} total):\n`);
    
    snapshot.docs.forEach((doc, index) => {
      const data = doc.data();
      const title = data.title || 'Untitled';
      const workflow = data.workflowId;
      console.log(`${(index + 1).toString().padStart(3)}. ${title} (${workflow})`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  }
  
  process.exit(0);
}

listTitles();