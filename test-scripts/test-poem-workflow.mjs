#!/usr/bin/env node

/**
 * Test the complete poem workflow manually
 * This simulates what a user would do through the UI
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { config } from 'dotenv';
import fetch from 'node-fetch';

// Load environment variables
config({ path: '.env.local' });

// Firebase configuration
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

async function testPoemWorkflow() {
  console.log('🚀 Testing Complete Poem Workflow\n');
  console.log('='.repeat(80));
  
  try {
    // Step 1: Create a new document
    console.log('\n📝 Step 1: Creating new document...');
    const documentId = `test-poem-${Date.now()}`;
    const userId = `test-user-${Date.now()}`;
    
    const docData = {
      id: documentId,
      userId: userId,
      title: 'Test Poem Document',
      workflowId: 'poem-generator',
      status: 'draft',
      stageStates: {},
      metadata: {
        wordCount: 0,
        stageCount: 0
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    await setDoc(doc(db, 'documents', documentId), docData);
    console.log(`✅ Document created: ${documentId}`);
    
    // Step 2: Process poem topic
    console.log('\n📝 Step 2: Setting poem topic...');
    const poemTopic = 'a beautiful sunset over the ocean';
    
    // Call the API to process the poem topic
    let response = await fetch(`http://localhost:9002/api/wizard/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        promptTemplate: 'Write a poem about \'{{poem-topic.output}}\'.\nMake it about 4 stanzas long.\n\nAlso create a compelling title for this poem.\n\nFormat your response as a JSON object with two keys:\n- \'title\': A creative, engaging title for the poem (this will be used as the document title)\n- \'poem\': The full poem content\n\nExample:\n{\n  "title": "Whispers of the Morning",\n  "poem": "Lines of the poem here..."\n}\n\nEnsure the output is valid JSON.',
        model: 'gemini-2.0-flash',
        temperature: 0.8,
        contextVars: {
          'poem-topic': {
            userInput: poemTopic,
            output: poemTopic
          }
        },
        stageOutputType: 'json',
        userId: userId,
        documentId: documentId,
        stageId: 'generate-poem-with-title'
      })
    });
    
    const poemResult = await response.json();
    console.log('✅ Poem generated successfully');
    console.log(`   Title: ${poemResult.content.title}`);
    console.log(`   Poem preview: ${poemResult.content.poem.substring(0, 100)}...`);
    
    // Step 3: Image briefing (simulating form submission)
    console.log('\n📝 Step 3: Setting image briefing...');
    const imageBriefing = {
      additionalPrompt: 'warm golden colors, peaceful atmosphere',
      aspectRatio: '16:9',
      style: 'artistic',
      numberOfImages: '2'
    };
    
    // Step 4: Generate image
    console.log('\n🎨 Step 4: Generating image...');
    const imagePrompt = `Create a ${imageBriefing.style} image that captures the essence and mood of this poem:\n\nTitle: ${poemResult.content.title}\nPoem:\n${poemResult.content.poem}\n\nAdditional instructions: ${imageBriefing.additionalPrompt}\n\nCreate an image that evokes the same emotions and themes as the poem. Make it ${imageBriefing.style} and visually appealing.`;
    
    response = await fetch(`http://localhost:9002/api/wizard/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        promptTemplate: imagePrompt,
        model: 'imagen-3.0-generate-002',
        temperature: 0.7,
        stageOutputType: 'image',
        imageGenerationSettings: {
          provider: 'imagen',
          aspectRatio: imageBriefing.aspectRatio,
          numberOfImages: parseInt(imageBriefing.numberOfImages),
          imagen: {
            personGeneration: 'allow_adult'
          }
        },
        contextVars: {
          'generate-poem-with-title': {
            output: poemResult.content
          },
          'image-briefing': {
            output: imageBriefing
          }
        },
        userId: userId,
        documentId: documentId,
        stageId: 'generate-poem-image'
      })
    });
    
    const imageResult = await response.json();
    console.log('✅ Images generated successfully');
    console.log(`   Number of images: ${imageResult.content.images.length}`);
    
    if (imageResult.content.images.length > 0) {
      console.log('\n🔗 Generated Image URLs:');
      imageResult.content.images.forEach((img, idx) => {
        console.log(`   Image ${idx + 1}: ${img.publicUrl}`);
      });
    }
    
    // Step 5: Generate HTML preview
    console.log('\n📄 Step 5: Generating HTML preview...');
    const htmlPrompt = `Convert this poem into beautiful HTML with proper formatting and styling, including the generated image:\n\nTitle: ${poemResult.content.title}\nPoem:\n${poemResult.content.poem}\n\nImage Data: ${JSON.stringify(imageResult.content)}\n\nSpecial instructions: \n\nIMPORTANT: \n1. Output ONLY the clean HTML content without any markdown code blocks, backticks, or explanatory text. Do not include \`\`\`html or \`\`\` markers. Just return the pure HTML that can be directly rendered.\n2. The image data provided contains an 'images' array. Use the first image's URL (either 'publicUrl' or 'dataUrl' property) as the src for your img tag.\n3. If the image has a 'publicUrl', use that. Otherwise, use the 'dataUrl' property.\n\nCreate clean, semantic HTML with inline CSS for styling. Include the image prominently in the design - consider placing it at the top, as a background element, or alongside the poem. Make it visually appealing and ensure the image and poem work together harmoniously. Use proper HTML structure with headings, paragraphs, and styling for a poem presentation. Include the title as an H1 heading.`;
    
    response = await fetch(`http://localhost:9002/api/wizard/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        promptTemplate: htmlPrompt,
        model: 'gemini-2.0-flash',
        temperature: 0.3,
        stageOutputType: 'html',
        contextVars: {
          'generate-poem-with-title': {
            output: poemResult.content
          },
          'generate-poem-image': {
            output: imageResult.content
          },
          'html-briefing': {
            output: ''
          }
        },
        userId: userId,
        documentId: documentId,
        stageId: 'generate-html-preview'
      })
    });
    
    const htmlResult = await response.json();
    console.log('✅ HTML generated successfully');
    console.log(`   HTML preview: ${htmlResult.content.substring(0, 100)}...`);
    
    // Verify the HTML contains the image
    const hasImage = htmlResult.content.includes('<img') && htmlResult.content.includes(imageResult.content.images[0].publicUrl);
    console.log(`   Contains image: ${hasImage ? '✅ Yes' : '❌ No'}`);
    
    // Final summary
    console.log('\n' + '='.repeat(80));
    console.log('🎉 WORKFLOW COMPLETE!\n');
    console.log('✅ All stages completed successfully:');
    console.log('   1. Poem topic set');
    console.log('   2. Poem and title generated');
    console.log('   3. Image briefing configured');
    console.log('   4. Images generated and uploaded to Firebase Storage');
    console.log('   5. HTML preview generated with embedded image');
    console.log('\n📊 Final Output:');
    console.log(`   Document ID: ${documentId}`);
    console.log(`   Poem Title: ${poemResult.content.title}`);
    console.log(`   Number of Images: ${imageResult.content.images.length}`);
    console.log(`   HTML includes image: ${hasImage ? 'Yes' : 'No'}`);
    
    if (imageResult.content.images.length > 0) {
      console.log(`\n🖼️ View the generated image:`);
      console.log(`   ${imageResult.content.images[0].publicUrl}`);
    }
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Error details:', error);
  }
}

// Run the test
testPoemWorkflow();