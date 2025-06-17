#!/usr/bin/env node

/**
 * List all available models and their capabilities
 */

import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';

const genAI = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY });

async function listModels() {
  console.log('📋 Listing all available models...\n');
  
  try {
    // List all models
    const models = await genAI.models.list();
    
    console.log('Available models:');
    console.log('=' .repeat(60));
    
    const imageModels = [];
    const textModels = [];
    
    for (const model of models) {
      console.log(`\n📦 ${model.name}`);
      console.log(`   Display Name: ${model.displayName}`);
      console.log(`   Description: ${model.description || 'N/A'}`);
      
      // Check supported generation methods
      if (model.supportedGenerationMethods) {
        console.log(`   Supported Methods: ${model.supportedGenerationMethods.join(', ')}`);
        
        // Check if it supports image generation
        if (model.supportedGenerationMethods.includes('generateImages')) {
          imageModels.push(model.name);
        }
        if (model.supportedGenerationMethods.includes('generateContent')) {
          textModels.push(model.name);
        }
      }
      
      // Check output modalities if available
      if (model.outputModalities) {
        console.log(`   Output Modalities: ${model.outputModalities.join(', ')}`);
      }
    }
    
    console.log('\n' + '=' .repeat(60));
    console.log('📊 SUMMARY:\n');
    
    console.log(`Total models: ${models.length}`);
    console.log(`\n🖼️  Models with image generation (generateImages):`);
    if (imageModels.length > 0) {
      imageModels.forEach(m => console.log(`   - ${m}`));
    } else {
      console.log('   None found');
    }
    
    console.log(`\n📝 Models with text generation (generateContent):`);
    textModels.slice(0, 10).forEach(m => console.log(`   - ${m}`));
    if (textModels.length > 10) {
      console.log(`   ... and ${textModels.length - 10} more`);
    }
    
  } catch (error) {
    console.error('❌ Error listing models:', error.message);
  }
}

listModels();