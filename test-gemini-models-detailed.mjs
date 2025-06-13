#!/usr/bin/env node
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { existsSync } from 'fs';
import { join } from 'path';

// Load environment variables
dotenv.config();

// Also try to load from .env.local if it exists
const envLocalPath = join(process.cwd(), '.env.local');
if (existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath });
}

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

// Get API key
const apiKey = process.env.GOOGLE_GENAI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error(`${colors.red}❌ ERROR: No API key found!${colors.reset}`);
  console.error('Please set one of the following environment variables:');
  console.error('- GOOGLE_GENAI_API_KEY');
  console.error('- GOOGLE_GENERATIVE_AI_API_KEY');
  console.error('- GEMINI_API_KEY');
  process.exit(1);
}

console.log(`${colors.bright}${colors.blue}🔍 Gemini Model Detailed Test${colors.reset}`);
console.log(`${colors.cyan}API Key found:${colors.reset} ${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`);
console.log();

// Initialize the API
const genAI = new GoogleGenerativeAI(apiKey);

// Function to list all available models
async function listAllModels() {
  console.log(`${colors.bright}${colors.magenta}📋 AVAILABLE MODELS:${colors.reset}`);
  console.log(`${colors.cyan}${'='.repeat(80)}${colors.reset}\n`);
  
  try {
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models?key=' + apiKey);
    const data = await response.json();
    
    if (data.models) {
      const models = data.models
        .filter(model => model.supportedGenerationMethods?.includes('generateContent'))
        .sort((a, b) => a.name.localeCompare(b.name));
      
      console.log(`Found ${models.length} models that support content generation:\n`);
      
      for (const model of models) {
        const modelId = model.name.replace('models/', '');
        console.log(`${colors.green}•${colors.reset} ${colors.bright}${modelId}${colors.reset}`);
        
        if (model.displayName && model.displayName !== modelId) {
          console.log(`  Display Name: ${model.displayName}`);
        }
        
        if (model.description) {
          console.log(`  Description: ${model.description}`);
        }
        
        // Show input/output token limits
        if (model.inputTokenLimit || model.outputTokenLimit) {
          const limits = [];
          if (model.inputTokenLimit) limits.push(`Input: ${model.inputTokenLimit.toLocaleString()}`);
          if (model.outputTokenLimit) limits.push(`Output: ${model.outputTokenLimit.toLocaleString()}`);
          console.log(`  Token Limits: ${limits.join(', ')}`);
        }
        
        // Show supported generation methods
        if (model.supportedGenerationMethods) {
          console.log(`  Supported Methods: ${model.supportedGenerationMethods.join(', ')}`);
        }
        
        console.log();
      }
    }
  } catch (error) {
    console.error(`${colors.red}Error fetching model list:${colors.reset}`, error.message);
  }
}

// Function to test specific models with detailed info
async function testSpecificModels() {
  console.log(`${colors.bright}${colors.blue}🧪 TESTING SPECIFIC MODELS:${colors.reset}`);
  console.log(`${colors.cyan}${'='.repeat(80)}${colors.reset}\n`);
  
  const modelsToTest = [
    { id: 'gemini-2.0-flash-exp', description: 'Latest experimental 2.0 Flash model' },
    { id: 'gemini-1.5-flash', description: 'Stable 1.5 Flash model' },
    { id: 'gemini-1.5-flash-latest', description: 'Latest 1.5 Flash variant' },
    { id: 'gemini-1.5-pro', description: 'Pro model with higher capabilities' },
  ];
  
  for (const modelInfo of modelsToTest) {
    console.log(`${colors.yellow}Testing ${modelInfo.id}...${colors.reset}`);
    console.log(`Description: ${modelInfo.description}`);
    
    try {
      const model = genAI.getGenerativeModel({ model: modelInfo.id });
      const startTime = Date.now();
      
      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout after 20 seconds')), 20000);
      });
      
      // Test with a simple prompt
      const result = await Promise.race([
        model.generateContent('What is 2+2? Just give the number.'),
        timeoutPromise
      ]);
      
      const responseTime = Date.now() - startTime;
      const response = result.response;
      const text = response.text();
      
      console.log(`${colors.green}✅ SUCCESS${colors.reset} (${responseTime}ms)`);
      console.log(`   Response: ${text.trim()}`);
      
      // Try to get token count if available
      if (result.response.usageMetadata) {
        const usage = result.response.usageMetadata;
        console.log(`   Token Usage: Prompt: ${usage.promptTokenCount}, Response: ${usage.candidatesTokenCount}, Total: ${usage.totalTokenCount}`);
      }
    } catch (error) {
      console.log(`${colors.red}❌ FAILED${colors.reset}`);
      console.log(`   Error: ${error.message}`);
      
      // Check if it's a quota error
      if (error.message.includes('429') || error.message.includes('quota')) {
        console.log(`   ${colors.yellow}Note: This appears to be a quota/rate limit issue, not a model availability issue${colors.reset}`);
      }
    }
    
    console.log();
  }
}

// Function to test quota status
async function checkQuotaStatus() {
  console.log(`${colors.bright}${colors.yellow}📊 QUOTA STATUS:${colors.reset}`);
  console.log(`${colors.cyan}${'='.repeat(80)}${colors.reset}\n`);
  
  try {
    // Try a minimal request to check quota
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent('Hi');
    
    console.log(`${colors.green}✅ API is functioning normally${colors.reset}`);
    
    if (result.response.usageMetadata) {
      const usage = result.response.usageMetadata;
      console.log(`Last request token usage: ${usage.totalTokenCount} tokens`);
    }
  } catch (error) {
    if (error.message.includes('429') || error.message.includes('quota')) {
      console.log(`${colors.red}⚠️  Quota limit reached${colors.reset}`);
      console.log('You may be on the free tier with limited requests per minute/day');
      console.log('Consider upgrading to a paid plan for higher limits');
    } else {
      console.log(`${colors.red}❌ Error checking quota:${colors.reset} ${error.message}`);
    }
  }
  
  console.log();
}

// Main execution
async function main() {
  try {
    // First, list all available models
    await listAllModels();
    
    // Then test specific models
    await testSpecificModels();
    
    // Check quota status
    await checkQuotaStatus();
    
    // Final recommendations
    console.log(`${colors.bright}${colors.blue}💡 RECOMMENDATIONS:${colors.reset}`);
    console.log(`${colors.cyan}${'='.repeat(80)}${colors.reset}\n`);
    
    console.log(`1. ${colors.green}gemini-2.0-flash-exp${colors.reset} - Best for most use cases (fast, capable, experimental features)`);
    console.log(`2. ${colors.green}gemini-1.5-flash${colors.reset} - Stable alternative with good performance`);
    console.log(`3. ${colors.yellow}gemini-1.5-pro${colors.reset} - More capable but may have quota limitations on free tier`);
    console.log(`\n${colors.cyan}Current project configuration:${colors.reset} googleai/gemini-2.0-flash-exp`);
    console.log(`\n${colors.yellow}Note:${colors.reset} If you're hitting quota limits, consider:`);
    console.log(`- Waiting a few minutes between requests`);
    console.log(`- Upgrading to a paid API plan`);
    console.log(`- Using the more efficient flash models instead of pro models`);
  } catch (error) {
    console.error(`${colors.red}Fatal error:${colors.reset}`, error);
    process.exit(1);
  }
}

// Run the test
main();