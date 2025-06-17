/**
 * Direct Imagen API Test - Matching the application's exact implementation
 */

import { GoogleGenAI } from '@google/genai';
import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { config } from 'dotenv';
import fs from 'fs/promises';

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
const storage = getStorage(app);

// Initialize Google AI - matching the app's initialization
const apiKey = process.env.GOOGLE_GENAI_API_KEY || 'AIzaSyCEglZ6yyEbtSWdLLZ5JgBW2Jh2A4OTKMk';
const client = new GoogleGenAI({ apiKey });

async function testImageGeneration() {
  console.log('🚀 Testing Imagen API - Direct Implementation\n');
  console.log('='.repeat(80));
  
  const allUrls = [];
  
  try {
    // Test parameters matching the app
    const prompt = 'A serene mountain lake at sunset with golden reflections on the water, photorealistic style';
    const model = 'imagen-3.0-generate-002';
    const numberOfImages = 2;
    const aspectRatio = '16:9';
    
    console.log('📝 Test Configuration:');
    console.log(`  Model: ${model}`);
    console.log(`  Prompt: "${prompt.substring(0, 50)}..."`);
    console.log(`  Aspect Ratio: ${aspectRatio}`);
    console.log(`  Number of Images: ${numberOfImages}\n`);
    
    console.log('🎨 Calling Imagen API...');
    
    // Call the API exactly as the app does
    const startTime = Date.now();
    const result = await client.models.generateImages({
      model: model,
      prompt: prompt,
      numberOfImages: numberOfImages,
      aspectRatio: aspectRatio,
    });
    
    const generationTime = Date.now() - startTime;
    console.log(`✅ API call completed in ${generationTime}ms`);
    
    // Log the raw response structure
    console.log('\n📊 Raw API Response:');
    console.log('  Type:', typeof result);
    console.log('  Keys:', Object.keys(result));
    console.log('  Has generatedImages:', !!result.generatedImages);
    console.log('  Images length:', result.generatedImages?.length || 0);
    
    if (result.generatedImages && result.generatedImages.length > 0) {
      console.log(`\n✅ Successfully generated ${result.generatedImages.length} images!\n`);
      
      // Process each image
      for (let i = 0; i < result.generatedImages.length; i++) {
        const imageData = result.generatedImages[i];
        console.log(`📸 Processing Image ${i + 1}:`);
        
        // Check image structure
        console.log('  Image keys:', Object.keys(imageData));
        console.log('  Has image prop:', !!imageData.image);
        console.log('  Has imageBytes:', !!imageData.image?.imageBytes);
        
        if (imageData.image && imageData.image.imageBytes) {
          // Convert to buffer
          const buffer = Buffer.from(imageData.image.imageBytes, 'base64');
          console.log(`  📏 Image size: ${buffer.length} bytes`);
          
          // Save locally
          const localPath = `test-downloads/imagen-test-${Date.now()}-${i}.png`;
          await fs.writeFile(localPath, buffer);
          console.log(`  💾 Saved locally: ${localPath}`);
          
          // Upload to Firebase Storage
          const timestamp = Date.now();
          const storagePath = `assets/test-${timestamp}-${i}/original.png`;
          const storageRef = ref(storage, storagePath);
          
          console.log(`  📤 Uploading to Firebase Storage...`);
          
          const uploadResult = await uploadBytes(storageRef, buffer, {
            contentType: 'image/png',
            customMetadata: {
              prompt: prompt,
              aspectRatio: aspectRatio,
              model: model
            }
          });
          
          const publicUrl = await getDownloadURL(uploadResult.ref);
          
          console.log(`  ✅ Upload successful!`);
          console.log(`  📍 Storage path: ${storagePath}`);
          console.log(`  🔗 Public URL: ${publicUrl}\n`);
          
          allUrls.push({
            imageNumber: i + 1,
            localPath: localPath,
            storagePath: storagePath,
            publicUrl: publicUrl
          });
        } else {
          console.log('  ❌ No image data found in response\n');
        }
      }
    } else {
      console.log('\n❌ No images returned from API');
      // Check if we got an empty array
      if (result.generatedImages && result.generatedImages.length === 0) {
        console.log('API returned empty generatedImages array');
      }
      console.log('Full result object:', JSON.stringify(result, null, 2));
    }
    
    // Final summary
    console.log('='.repeat(80));
    console.log('📊 FINAL SUMMARY:\n');
    
    if (allUrls.length > 0) {
      console.log(`✅ Successfully generated and uploaded ${allUrls.length} images!\n`);
      
      console.log('🔗 PUBLIC URLs:\n');
      allUrls.forEach(item => {
        console.log(`Image ${item.imageNumber}:`);
        console.log(`  ${item.publicUrl}\n`);
      });
      
      console.log('📁 LOCAL FILES:\n');
      allUrls.forEach(item => {
        console.log(`Image ${item.imageNumber}: ${item.localPath}`);
      });
    } else {
      console.log('❌ No images were successfully processed');
    }
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('\nError details:');
    console.error('  Name:', error.name);
    console.error('  Code:', error.code);
    console.error('  Stack:', error.stack);
  }
}

// Run the test
testImageGeneration();