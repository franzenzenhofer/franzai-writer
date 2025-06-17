#!/usr/bin/env node

/**
 * End-to-End Test: Poem Generator with Image Integration
 * 
 * This script tests the complete workflow:
 * 1. Create poem topic
 * 2. Generate poem with title
 * 3. Configure image settings
 * 4. Generate image (upload to Firebase Storage)
 * 5. Generate HTML that includes the image
 * 6. Verify HTML contains image URL
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:9002';

// Test data
const testData = {
  poemTopic: 'a peaceful mountain lake at sunset',
  imageSettings: {
    aspectRatio: '16:9',
    style: 'watercolor',
    numberOfImages: '1',
    additionalPrompt: 'serene, peaceful, golden hour lighting'
  }
};

async function makeRequest(endpoint, data) {
  console.log(`\n🔄 Making request to ${endpoint}`);
  console.log('📤 Request data:', JSON.stringify(data, null, 2));
  
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Request failed (${response.status}): ${errorText}`);
  }

  const result = await response.json();
  console.log('📥 Response received');
  return result;
}

async function testCompleteWorkflow() {
  console.log('🚀 Starting End-to-End Poem + Image + HTML Workflow Test');
  console.log('=' .repeat(60));

  try {
    // Step 1: Generate poem topic (simulate user input)
    console.log('\n📝 STEP 1: Setting poem topic');
    const poemTopicResult = {
      content: testData.poemTopic,
      error: null
    };
    console.log('✅ Poem topic set:', poemTopicResult.content);

    // Step 2: Generate poem with title
    console.log('\n🎭 STEP 2: Generating poem with title');
    const poemGenerationParams = {
      promptTemplate: `Write a poem about '${testData.poemTopic}'.\nMake it about 4 stanzas long.\n\nAlso create a compelling title for this poem.\n\nFormat your response as a JSON object with two keys:\n- 'title': A creative, engaging title for the poem (this will be used as the document title)\n- 'poem': The full poem content\n\nExample:\n{\n  "title": "Whispers of the Morning",\n  "poem": "Lines of the poem here..."\n}\n\nEnsure the output is valid JSON.`,
      model: 'gemini-2.0-flash',
      temperature: 0.8,
      stageOutputType: 'json',
      contextVars: {
        'poem-topic': { output: testData.poemTopic }
      },
      currentStageInput: null
    };

    const poemResult = await makeRequest('/api/wizard/execute', poemGenerationParams);
    
    if (poemResult.error) {
      throw new Error(`Poem generation failed: ${poemResult.error}`);
    }

    console.log('✅ Poem generated successfully');
    console.log('📖 Title:', poemResult.content.title);
    console.log('📜 Poem preview:', poemResult.content.poem.substring(0, 100) + '...');

    // Step 3: Process image briefing (simulate form data)
    console.log('\n🎨 STEP 3: Setting image configuration');
    const imageBriefingResult = {
      content: testData.imageSettings,
      error: null
    };
    console.log('✅ Image settings configured:', imageBriefingResult.content);

    // Step 4: Generate image with asset storage
    console.log('\n🖼️ STEP 4: Generating image with asset storage');
    const imageGenerationParams = {
      promptTemplate: `Create a ${testData.imageSettings.style} image that captures the essence and mood of this poem:\n\nTitle: ${poemResult.content.title}\nPoem:\n${poemResult.content.poem}\n\nAdditional instructions: ${testData.imageSettings.additionalPrompt}\n\nCreate an image that evokes the same emotions and themes as the poem. Make it ${testData.imageSettings.style} and visually appealing.`,
      model: 'imagen-3.0-generate-002',
      stageOutputType: 'image',
      imageGenerationSettings: {
        provider: 'imagen',
        aspectRatio: testData.imageSettings.aspectRatio,
        numberOfImages: parseInt(testData.imageSettings.numberOfImages),
        imagen: {
          personGeneration: 'allow_adult'
        }
      },
      contextVars: {
        'poem-topic': { output: testData.poemTopic },
        'generate-poem-with-title': { output: poemResult.content },
        'image-briefing': { output: testData.imageSettings }
      },
      currentStageInput: null,
      // CRITICAL: Add asset management parameters
      userId: 'test-user-123',
      documentId: 'test-doc-456',
      stageId: 'generate-poem-image'
    };

    const imageResult = await makeRequest('/api/wizard/execute', imageGenerationParams);
    
    if (imageResult.error) {
      throw new Error(`Image generation failed: ${imageResult.error}`);
    }

    console.log('✅ Image generated successfully');
    console.log('🔗 Image details:', {
      provider: imageResult.content.provider,
      imageCount: imageResult.content.images?.length || 0,
      firstImageUrl: imageResult.content.images?.[0]?.publicUrl?.substring(0, 60) + '...' || 'No URL',
      hasAssetId: !!imageResult.content.images?.[0]?.assetId
    });

    // Verify image URLs are not base64
    if (imageResult.content.images && imageResult.content.images.length > 0) {
      const firstImage = imageResult.content.images[0];
      if (firstImage.publicUrl && firstImage.publicUrl.includes('data:image')) {
        throw new Error('FATAL: Image still contains base64 data URL instead of Firebase Storage URL');
      }
      console.log('✅ Confirmed: Image uses Firebase Storage URL, not base64');
    }

    // Step 5: Generate HTML that includes the image
    console.log('\n📄 STEP 5: Generating HTML with image integration');
    const htmlGenerationParams = {
      promptTemplate: `Convert this poem into beautiful HTML with proper formatting and styling, including the generated image:\n\nTitle: ${poemResult.content.title}\nPoem:\n${poemResult.content.poem}\n\nImage URL: ${imageResult.content.images[0].publicUrl}\n\nSpecial instructions: Create a beautiful, responsive design\n\nIMPORTANT: Output ONLY the clean HTML content without any markdown code blocks, backticks, or explanatory text. Do not include \`\`\`html or \`\`\` markers. Just return the pure HTML that can be directly rendered.\n\nCreate clean, semantic HTML with inline CSS for styling. Include the image prominently in the design - consider placing it at the top, as a background element, or alongside the poem. Make it visually appealing and ensure the image and poem work together harmoniously. Use proper HTML structure with headings, paragraphs, and styling for a poem presentation. Include the title as an H1 heading.`,
      model: 'gemini-2.0-flash',
      temperature: 0.3,
      stageOutputType: 'html',
      contextVars: {
        'poem-topic': { output: testData.poemTopic },
        'generate-poem-with-title': { output: poemResult.content },
        'image-briefing': { output: testData.imageSettings },
        'generate-poem-image': { output: imageResult.content }
      },
      currentStageInput: null
    };

    const htmlResult = await makeRequest('/api/wizard/execute', htmlGenerationParams);
    
    if (htmlResult.error) {
      throw new Error(`HTML generation failed: ${htmlResult.error}`);
    }

    console.log('✅ HTML generated successfully');
    
    // Step 6: Verify HTML contains image URL
    console.log('\n🔍 STEP 6: Verifying HTML contains image');
    const htmlContent = htmlResult.content;
    const imageUrl = imageResult.content.images[0].publicUrl;
    
    if (!htmlContent.includes(imageUrl)) {
      throw new Error('FATAL: Generated HTML does not contain the image URL');
    }
    
    if (!htmlContent.includes('<img')) {
      throw new Error('FATAL: Generated HTML does not contain an img tag');
    }
    
    console.log('✅ Verified: HTML contains image URL and img tag');
    console.log('📏 HTML length:', htmlContent.length, 'characters');
    console.log('🔗 Image URL found in HTML:', htmlContent.includes(imageUrl));
    
    // Success summary
    console.log('\n' + '🎉'.repeat(20));
    console.log('✅ END-TO-END WORKFLOW SUCCESS!');
    console.log('🎉'.repeat(20));
    console.log('\n📊 WORKFLOW SUMMARY:');
    console.log('• Poem topic set:', testData.poemTopic);
    console.log('• Poem generated with title:', poemResult.content.title);
    console.log('• Image generated and stored in Firebase Storage');
    console.log('• HTML generated with integrated image');
    console.log('• Image URL properly referenced in HTML');
    console.log('\n🔗 Final image URL:', imageUrl);
    console.log('📄 HTML preview (first 200 chars):', htmlContent.substring(0, 200) + '...');

    return {
      success: true,
      poemTitle: poemResult.content.title,
      imageUrl: imageUrl,
      htmlLength: htmlContent.length,
      htmlContent: htmlContent
    };

  } catch (error) {
    console.error('\n❌ WORKFLOW FAILED');
    console.error('🚨 Error:', error.message);
    console.error('📚 Stack:', error.stack);
    return {
      success: false,
      error: error.message
    };
  }
}

// Run the test
if (import.meta.url === `file://${process.argv[1]}`) {
  testCompleteWorkflow()
    .then(result => {
      if (result.success) {
        console.log('\n✅ Test completed successfully!');
        process.exit(0);
      } else {
        console.log('\n❌ Test failed!');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('\n💥 Test crashed:', error);
      process.exit(1);
    });
}

export { testCompleteWorkflow };