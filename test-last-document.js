const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = require('./firebase-service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'franzai-writer'
});

const db = admin.firestore();

async function getLastDocument() {
  try {
    console.log('Fetching last saved document from Firestore...\n');
    
    // Query documents collection, ordered by updatedAt descending
    const snapshot = await db.collection('documents')
      .orderBy('updatedAt', 'desc')
      .limit(1)
      .get();
    
    if (snapshot.empty) {
      console.log('No documents found in the database.');
      return;
    }
    
    const doc = snapshot.docs[0];
    const data = doc.data();
    
    console.log('=== DOCUMENT METADATA ===');
    console.log('Document ID:', doc.id);
    console.log('Title:', data.title);
    console.log('Workflow ID:', data.workflowId);
    console.log('Status:', data.status);
    console.log('Created:', data.createdAt?.toDate?.() || data.createdAt);
    console.log('Updated:', data.updatedAt?.toDate?.() || data.updatedAt);
    console.log('User ID:', data.userId);
    
    console.log('\n=== STAGE STATES ===');
    const stageStates = data.stageStates || {};
    const stageCount = Object.keys(stageStates).length;
    console.log(`Total stages: ${stageCount}`);
    
    // Show each stage's data
    Object.entries(stageStates).forEach(([stageId, stage], index) => {
      console.log(`\n--- Stage ${index + 1}: ${stageId} ---`);
      console.log('Status:', stage.status);
      console.log('Completed:', stage.completedAt ? new Date(stage.completedAt) : 'Not completed');
      
      // Show user input
      if (stage.userInput) {
        console.log('User Input:');
        if (typeof stage.userInput === 'string') {
          console.log('  Type: string');
          console.log('  Length:', stage.userInput.length, 'characters');
          console.log('  Preview:', stage.userInput.substring(0, 200) + (stage.userInput.length > 200 ? '...' : ''));
        } else if (typeof stage.userInput === 'object') {
          console.log('  Type: object');
          // Check for base64 image
          if (stage.userInput.dataUrl && stage.userInput.dataUrl.startsWith('data:image')) {
            console.log('  Contains: Base64 image');
            console.log('  Image size:', Math.round(stage.userInput.dataUrl.length / 1024), 'KB (base64)');
          } else {
            console.log('  Fields:', Object.keys(stage.userInput).join(', '));
          }
        }
      }
      
      // Show output
      if (stage.output) {
        console.log('Output:');
        if (typeof stage.output === 'string') {
          console.log('  Type: string');
          console.log('  Length:', stage.output.length, 'characters');
          console.log('  Preview:', stage.output.substring(0, 200) + (stage.output.length > 200 ? '...' : ''));
        } else if (typeof stage.output === 'object') {
          console.log('  Type: object');
          console.log('  Fields:', Object.keys(stage.output).join(', '));
        }
      }
    });
    
    // Calculate total document size
    const docSize = JSON.stringify(data).length;
    console.log('\n=== DOCUMENT SIZE ===');
    console.log('Total size:', Math.round(docSize / 1024), 'KB');
    console.log('Firestore limit: 1024 KB (1 MB)');
    console.log('Usage:', Math.round((docSize / (1024 * 1024)) * 100), '%');
    
  } catch (error) {
    console.error('Error fetching document:', error);
  } finally {
    // Clean up
    await admin.app().delete();
  }
}

getLastDocument();