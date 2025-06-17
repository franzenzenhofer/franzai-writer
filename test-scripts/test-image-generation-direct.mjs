import { generateImages } from '../src/lib/ai-image-generator.ts';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

async function testImageGeneration() {
  console.log('🎨 Testing direct image generation with storage...\n');
  
  try {
    const result = await generateImages({
      prompt: 'A peaceful mountain lake at sunset with golden reflections on the water',
      userId: 'test-user-123',
      documentId: 'test-doc-456',
      stageId: 'test-stage-789',
      settings: {
        provider: 'imagen',
        aspectRatio: '16:9',
        numberOfImages: 1,
        style: 'photorealistic'
      }
    });
    
    console.log('✅ Image generation successful!');
    console.log('📦 Result:', JSON.stringify(result, null, 2));
    
    if (result.images && result.images.length > 0) {
      const image = result.images[0];
      if (image.publicUrl) {
        console.log('\n🔗 Public URL:', image.publicUrl);
        console.log('✅ Firebase Storage upload successful!');
      } else {
        console.log('❌ No public URL - storage upload failed');
      }
    }
    
    return result;
  } catch (error) {
    console.error('❌ Image generation failed:', error);
    throw error;
  }
}

testImageGeneration().catch(console.error);