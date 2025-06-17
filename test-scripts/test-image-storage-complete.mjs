#!/usr/bin/env node

/**
 * Test script for complete image generation, storage, and retrieval flow
 * This tests:
 * 1. Image generation with Google Imagen 3
 * 2. Storage in Firebase Storage (production)
 * 3. Asset management and retrieval
 */

import { GoogleGenAI } from '@google/genai';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirestore, doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { nanoid } from 'nanoid';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Firebase configuration (production)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBvT5eKaJZDh36ZNuO3Vq9IfcUC_GKOP7U",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "franzai-writer.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "franzai-writer",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "franzai-writer.appspot.com", // Fixed storage bucket
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "1040570617854",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:1040570617854:web:8c1cf4c86b073b37a1848d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const storage = getStorage(app);
const db = getFirestore(app);

// Initialize Gemini
const genAI = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY || process.env.GOOGLE_AI_API_KEY || '' });

/**
 * Helper function to convert base64 to blob
 */
function base64ToBlob(base64) {
  const base64Data = base64.split(',')[1];
  const byteCharacters = atob(base64Data);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: 'image/png' });
}

/**
 * Step 1: Generate image using Imagen 3
 */
async function generateImage(prompt, aspectRatio = '1:1') {
  console.log('\n🎨 Step 1: Generating image with Imagen 3...');
  console.log(`Prompt: "${prompt}"`);
  console.log(`Aspect ratio: ${aspectRatio}`);
  
  try {
    const result = await genAI.models.generateImages({
      model: 'models/imagen-3.0-generate-002',
      prompt: prompt,
      config: {
        numberOfImages: 1,
        aspectRatio: aspectRatio
      }
    });
    
    // Check if we got images
    if (!result.generatedImages || result.generatedImages.length === 0) {
      throw new Error('No images generated');
    }
    
    const base64Data = result.generatedImages[0].image.imageBytes;
    const dataUrl = `data:image/png;base64,${base64Data}`;
    
    console.log('✅ Image generated successfully');
    console.log(`Data URL length: ${dataUrl.length}`);
    
    // Save locally for verification
    const localPath = path.join(__dirname, '..', 'test-downloads', `test-image-storage-${Date.now()}.png`);
    await fs.writeFile(localPath, Buffer.from(base64Data, 'base64'));
    console.log(`✅ Saved locally: ${localPath}`);
    
    return { dataUrl, base64Data };
  } catch (error) {
    console.error('❌ Image generation failed:', error);
    throw error;
  }
}

/**
 * Step 2: Upload to Firebase Storage and create asset record
 */
async function uploadToStorage(dataUrl, userId) {
  console.log('\n📤 Step 2: Uploading to Firebase Storage...');
  
  try {
    // Generate asset ID
    const assetId = nanoid();
    
    // Convert data URL to blob
    const blob = base64ToBlob(dataUrl);
    
    // Upload to Firebase Storage
    const storagePath = `assets/${assetId}/original.png`;
    const storageRef = ref(storage, storagePath);
    
    console.log(`Uploading to: ${storagePath}`);
    const uploadResult = await uploadBytes(storageRef, blob, {
      contentType: 'image/png'
    });
    
    console.log('✅ Upload successful:', uploadResult.metadata.fullPath);
    
    // Get public URL
    const publicUrl = await getDownloadURL(storageRef);
    console.log('✅ Public URL:', publicUrl);
    
    // Create asset record in Firestore
    const asset = {
      id: assetId,
      userId,
      type: 'image',
      mimeType: 'image/png',
      storageUrl: storagePath,
      publicUrl,
      fileName: `test-generated-${Date.now()}.png`,
      fileSize: blob.size,
      createdAt: serverTimestamp(),
      source: 'generated',
      generationPrompt: 'Test prompt for storage verification',
      generationModel: 'imagen-3.0-generate-002',
      documentIds: ['test-document'],
      stageReferences: [{
        documentId: 'test-document',
        stageId: 'test-stage',
        addedAt: serverTimestamp()
      }],
      lastAccessedAt: serverTimestamp(),
      isDeleted: false
    };
    
    await setDoc(doc(db, 'assets', assetId), asset);
    console.log('✅ Asset record created in Firestore');
    
    return { assetId, publicUrl, storagePath };
  } catch (error) {
    console.error('❌ Upload failed:', error);
    throw error;
  }
}

/**
 * Step 3: Retrieve and verify asset
 */
async function retrieveAsset(assetId) {
  console.log('\n🔍 Step 3: Retrieving asset from Firebase...');
  
  try {
    // Get asset record from Firestore
    const assetDoc = await getDoc(doc(db, 'assets', assetId));
    
    if (!assetDoc.exists()) {
      throw new Error('Asset not found in Firestore');
    }
    
    const assetData = assetDoc.data();
    console.log('✅ Asset record retrieved:', {
      id: assetData.id,
      publicUrl: assetData.publicUrl,
      storageUrl: assetData.storageUrl,
      fileName: assetData.fileName,
      fileSize: assetData.fileSize
    });
    
    // Try to fetch the image from the public URL
    const response = await fetch(assetData.publicUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }
    
    const contentType = response.headers.get('content-type');
    const contentLength = response.headers.get('content-length');
    
    console.log('✅ Image accessible via public URL');
    console.log(`Content-Type: ${contentType}`);
    console.log(`Content-Length: ${contentLength} bytes`);
    
    return assetData;
  } catch (error) {
    console.error('❌ Retrieval failed:', error);
    throw error;
  }
}

/**
 * Main test flow
 */
async function runTest() {
  console.log('🚀 Starting complete image storage test...');
  console.log('Using production Firebase configuration');
  
  try {
    // Authenticate (you'll need to set these environment variables)
    const email = process.env.TEST_USER_EMAIL || 'test@example.com';
    const password = process.env.TEST_USER_PASSWORD || 'testpassword';
    
    console.log('\n🔐 Authenticating...');
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('✅ Authenticated as:', userCredential.user.email);
      const userId = userCredential.user.uid;
      
      // Step 1: Generate image
      const { dataUrl } = await generateImage(
        'A beautiful sunset over mountains with golden clouds',
        '16:9'
      );
      
      // Step 2: Upload to storage
      const { assetId, publicUrl } = await uploadToStorage(dataUrl, userId);
      
      // Step 3: Retrieve and verify
      const retrievedAsset = await retrieveAsset(assetId);
      
      console.log('\n✨ Test completed successfully!');
      console.log('Asset ID:', assetId);
      console.log('Public URL:', publicUrl);
      console.log('\nYou can view the image at:', publicUrl);
      
    } catch (authError) {
      console.error('❌ Authentication failed:', authError.message);
      console.log('\n⚠️  Running test without authentication (anonymous mode)...');
      
      // Continue without auth - using anonymous user ID
      const userId = 'anonymous-test-user';
      
      // Step 1: Generate image
      const { dataUrl } = await generateImage(
        'A beautiful sunset over mountains with golden clouds',
        '16:9'
      );
      
      // Step 2: Upload to storage
      const { assetId, publicUrl } = await uploadToStorage(dataUrl, userId);
      
      // Step 3: Retrieve and verify
      const retrievedAsset = await retrieveAsset(assetId);
      
      console.log('\n✨ Test completed successfully!');
      console.log('Asset ID:', assetId);
      console.log('Public URL:', publicUrl);
      console.log('\nYou can view the image at:', publicUrl);
    }
    
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test
runTest();