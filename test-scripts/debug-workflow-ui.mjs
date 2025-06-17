#!/usr/bin/env node
/**
 * Debug script to manually test the workflow UI using Playwright
 */

import 'dotenv/config';
import { chromium } from 'playwright';

console.log('🔍 Debugging Workflow UI...\n');

async function debugWorkflow() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    console.log('📍 Step 1: Navigate to poem workflow');
    await page.goto('http://localhost:9002/w/poem/new');
    await page.waitForLoadState('networkidle');
    
    console.log('📍 Step 2: Fill poem topic');
    await page.locator('textarea').first().fill('A majestic mountain at sunrise');
    await page.locator('button:has-text("Continue")').first().click();
    
    console.log('📍 Step 3: Wait for poem generation');
    await page.waitForSelector('text=Poem Title', { timeout: 30000 });
    console.log('✅ Poem generated successfully');
    
    console.log('📍 Step 4: Fill image briefing form');
    await page.waitForSelector('text=Image Customization', { timeout: 10000 });
    
    // Fill the textarea
    const textarea = page.locator('textarea').nth(1);
    await textarea.fill('Beautiful mountain scenery');
    
    // Click continue
    const continueButton = page.locator('button:has-text("Continue")').nth(1);
    await continueButton.click();
    
    console.log('✅ Image briefing form submitted');
    
    console.log('📍 Step 5: Wait for image generation to start');
    await page.waitForTimeout(2000);
    
    // Check the page state
    const pageText = await page.textContent('body');
    console.log('📄 Current page status:');
    if (pageText.includes('Generate Poem Illustration')) {
      console.log('✅ Image generation stage is visible');
    }
    if (pageText.includes('Waiting for:')) {
      console.log('⏳ Some stages are waiting');
    }
    
    // Wait longer for image generation
    console.log('📍 Step 6: Waiting up to 2 minutes for image generation...');
    try {
      await page.waitForSelector('text=Generated image', { timeout: 120000 });
      console.log('✅ Image generation completed!');
    } catch (e) {
      console.log('⚠️  Image generation did not complete within 2 minutes');
      
      // Check for error messages
      const currentPageText = await page.textContent('body');
      if (currentPageText.includes('error')) {
        console.log('❌ Found error text on page');
      }
      
      // Take a screenshot for debugging
      await page.screenshot({ path: 'debug-workflow.png', fullPage: true });
      console.log('📸 Screenshot saved as debug-workflow.png');
    }
    
    console.log('📍 Debug session completed');
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
    await page.screenshot({ path: 'debug-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

debugWorkflow();