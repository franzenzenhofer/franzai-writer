import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { config } from 'dotenv';

config();

// Initialize Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testContextBuilding() {
  try {
    // Test the context building with a simple workflow execution
    const response = await fetch('http://localhost:9002/api/test-documents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'create',
        workflowId: 'poem-generator',
        initialData: {
          'poem-topic': {
            userInput: 'test topic',
            output: 'test topic',
            status: 'completed'
          }
        }
      })
    });

    const result = await response.json();
    console.log('Test document created:', result);

    // Now try to run the poem generation stage
    const executeResponse = await fetch('http://localhost:9002/api/wizard/execute', {
      method: 'POST', 
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        promptTemplate: "Write a poem about '{{poem-topic.output}}'.",
        model: 'gemini-2.0-flash',
        temperature: 0.8,
        contextVars: {
          'poem-topic': {
            userInput: 'a beautiful sunny day',
            output: 'a beautiful sunny day'
          },
          'generate-poem-with-title': {}
        },
        stageOutputType: 'json',
        stage: {
          id: 'generate-poem-with-title',
          outputType: 'json'
        }
      })
    });

    console.log('Execute response status:', executeResponse.status);
    const executeResult = await executeResponse.text();
    console.log('Execute result:', executeResult);

  } catch (error) {
    console.error('Test failed:', error);
  }
}

testContextBuilding();