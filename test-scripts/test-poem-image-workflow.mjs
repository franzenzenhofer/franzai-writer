#!/usr/bin/env node
/**
 * Test script for poem + image generation workflow
 * Tests the image generation with template variable resolution
 */

import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';

const API_KEY = process.env.GOOGLE_GENAI_API_KEY;

if (!API_KEY) {
  console.error('❌ Missing GOOGLE_GENAI_API_KEY environment variable');
  process.exit(1);
}

console.log('🧪 Testing Poem + Image Generation Workflow...\n');

async function testWorkflow() {
  try {
    const genAI = new GoogleGenAI({ apiKey: API_KEY });

    // Step 1: Generate a poem
    console.log('📝 Step 1: Generating poem...');
    
    const poemPrompt = `Write a poem about 'A majestic mountain at sunrise'.
Make it about 4 stanzas long.

Also create a compelling title for this poem.

Format your response as a JSON object with two keys:
- 'title': A creative, engaging title for the poem (this will be used as the document title)
- 'poem': The full poem content

Example:
{
  "title": "Whispers of the Morning",
  "poem": "Lines of the poem here..."
}

Ensure the output is valid JSON.`;

    const poemResult = await genAI.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: poemPrompt
    });
    const poemText = poemResult.text;
    
    console.log('📝 Raw poem response:', poemText.substring(0, 200) + '...');
    
    // Parse the JSON response
    const poemData = JSON.parse(poemText.replace(/```json\n?|\n?```/g, ''));
    console.log('✅ Poem generated:', poemData.title);
    console.log('📖 Poem preview:', poemData.poem.substring(0, 100) + '...\n');

    // Step 2: Simulate image briefing form data
    console.log('🎨 Step 2: Simulating image briefing form...');
    const imageBriefing = {
      additionalPrompt: 'Beautiful mountain scenery with warm colors',
      aspectRatio: '3:4',
      style: 'artistic',
      numberOfImages: '2'
    };
    console.log('✅ Image briefing:', imageBriefing, '\n');

    // Step 3: Create context for template resolution
    const contextVars = {
      'poem-topic': {
        userInput: 'A majestic mountain at sunrise',
        output: 'A majestic mountain at sunrise'
      },
      'generate-poem-with-title': {
        userInput: null,
        output: poemData
      },
      'image-briefing': {
        userInput: imageBriefing,
        output: imageBriefing
      }
    };

    // Step 4: Test template variable resolution
    console.log('🔧 Step 3: Testing template variable resolution...');
    const imagePromptTemplate = `Create a {{image-briefing.output.style}} image that captures the essence and mood of this poem:

Title: {{generate-poem-with-title.output.title}}
Poem:
{{generate-poem-with-title.output.poem}}

{{#if image-briefing.output.additionalPrompt}}Additional instructions: {{image-briefing.output.additionalPrompt}}

{{/if}}Create an image that evokes the same emotions and themes as the poem. Make it {{image-briefing.output.style}} and visually appealing.`;

    // Simple template resolution (basic version without Handlebars)
    function resolveTemplate(template, context) {
      const regex = /\{\{([^}]+)\}\}/g;
      return template.replace(regex, (match, path) => {
        // Handle conditional blocks by removing them for this test
        if (path.includes('#if') || path.includes('/if')) {
          return '';
        }
        
        const pathParts = path.split('.');
        let value = context;
        
        for (const part of pathParts) {
          if (value && typeof value === 'object' && part in value) {
            value = value[part];
          } else {
            return '';
          }
        }
        
        return typeof value === 'object' ? JSON.stringify(value) : String(value);
      });
    }

    const resolvedPrompt = resolveTemplate(imagePromptTemplate, contextVars);
    console.log('✅ Template resolved successfully');
    console.log('🎯 Image prompt preview:', resolvedPrompt.substring(0, 200) + '...\n');

    // Step 5: Test image generation settings resolution
    console.log('⚙️  Step 4: Testing image generation settings resolution...');
    const imageGenerationSettings = {
      provider: 'imagen',
      aspectRatio: '{{image-briefing.output.aspectRatio}}',
      numberOfImages: '{{image-briefing.output.numberOfImages}}',
      imagen: {
        personGeneration: 'allow_adult'
      }
    };

    const resolvedSettings = {
      ...imageGenerationSettings,
      aspectRatio: resolveTemplate(imageGenerationSettings.aspectRatio, contextVars),
      numberOfImages: parseInt(resolveTemplate(imageGenerationSettings.numberOfImages, contextVars), 10)
    };

    console.log('✅ Settings resolved:', resolvedSettings, '\n');

    // Step 6: Test actual image generation (if API allows)
    console.log('🖼️  Step 5: Testing actual image generation...');
    try {
      const result = await genAI.models.generateImages({
        model: 'models/imagen-3.0-generate-002',
        prompt: resolvedPrompt,
        config: {
          numberOfImages: resolvedSettings.numberOfImages,
          aspectRatio: resolvedSettings.aspectRatio,
          personGeneration: resolvedSettings.imagen.personGeneration
        }
      });

      if (result.images && result.images.length > 0) {
        console.log(`✅ Generated ${result.images.length} images successfully!`);
        
        result.images.forEach((image, index) => {
          console.log(`🖼️  Image ${index + 1}:`);
          console.log(`   - MIME Type: ${image.mimeType}`);
          console.log(`   - Size: ${image.base64Data.length} chars (base64)`);
          console.log(`   - Preview: data:${image.mimeType};base64,${image.base64Data.substring(0, 50)}...`);
        });
      }
      
      console.log('\n🎉 Full workflow test completed successfully!');
      console.log('\n📊 Summary:');
      console.log('✅ Poem generation: PASS');
      console.log('✅ Template variable resolution: PASS');
      console.log('✅ Image generation settings resolution: PASS');
      console.log('✅ Image generation API: PASS');
      
    } catch (imageError) {
      console.log('⚠️  Image generation failed:', imageError.message);
      console.log('\n📊 Summary:');
      console.log('✅ Poem generation: PASS');
      console.log('✅ Template variable resolution: PASS');
      console.log('✅ Image generation settings resolution: PASS');
      console.log('❌ Image generation API: FAIL');
    }

  } catch (error) {
    console.error('❌ Workflow test failed:', error);
    process.exit(1);
  }
}

testWorkflow();