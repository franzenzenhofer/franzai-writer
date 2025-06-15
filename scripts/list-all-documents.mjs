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

async function listAllDocuments() {
  try {
    console.log('Fetching all documents from Firestore...\n');
    
    // Query all documents, ordered by updatedAt descending
    const documentsRef = collection(db, 'documents');
    const q = query(documentsRef, orderBy('updatedAt', 'desc'));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      console.log('No documents found in the database.');
      return;
    }
    
    console.log(`Found ${snapshot.docs.length} documents:\n`);
    console.log('=' .repeat(120));
    
    snapshot.docs.forEach((doc, index) => {
      const data = doc.data();
      const stageStates = data.stageStates || {};
      const completedStages = Object.values(stageStates).filter(s => s.status === 'completed').length;
      const totalStages = Object.keys(stageStates).length;
      const docSize = Math.round(JSON.stringify(data).length / 1024);
      
      console.log(`${index + 1}. Document ID: ${doc.id}`);
      console.log(`   Title: ${data.title || 'Untitled'}`);
      console.log(`   Workflow: ${data.workflowId}`);
      console.log(`   Status: ${data.status}`);
      console.log(`   Progress: ${completedStages}/${totalStages} stages completed`);
      console.log(`   Size: ${docSize} KB`);
      console.log(`   User: ${data.userId}`);
      console.log(`   Created: ${data.createdAt ? new Date(data.createdAt).toLocaleString() : 'Unknown'}`);
      console.log(`   Updated: ${data.updatedAt ? new Date(data.updatedAt).toLocaleString() : 'Unknown'}`);
      
      // Check for special content
      const hasImages = Object.values(stageStates).some(stage => 
        stage.userInput?.dataUrl?.startsWith('data:image')
      );
      const hasFileContent = Object.values(stageStates).some(stage => 
        stage.userInput?.fileContent
      );
      
      if (hasImages || hasFileContent) {
        console.log(`   Special content: ${hasImages ? '📷 Images' : ''} ${hasFileContent ? '📄 Files' : ''}`);
      }
      
      console.log('-'.repeat(120));
    });
    
    // Summary statistics
    console.log('\n=== SUMMARY ===');
    console.log(`Total documents: ${snapshot.docs.length}`);
    
    // Group by workflow
    const workflowCounts = {};
    snapshot.docs.forEach(doc => {
      const workflowId = doc.data().workflowId;
      workflowCounts[workflowId] = (workflowCounts[workflowId] || 0) + 1;
    });
    
    console.log('\nDocuments by workflow:');
    Object.entries(workflowCounts).forEach(([workflow, count]) => {
      console.log(`  - ${workflow}: ${count} document(s)`);
    });
    
    // Calculate total storage used
    let totalSize = 0;
    snapshot.docs.forEach(doc => {
      totalSize += JSON.stringify(doc.data()).length;
    });
    console.log(`\nTotal storage used: ${Math.round(totalSize / 1024)} KB`);
    
  } catch (error) {
    console.error('Error fetching documents:', error);
  }
  
  process.exit(0);
}

listAllDocuments();