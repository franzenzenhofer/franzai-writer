#!/usr/bin/env node
/**
 * Debug script to check if image briefing form submission works
 */

import 'dotenv/config';
import { chromium } from 'playwright';

console.log('🔍 Debugging Image Briefing Form Submission...\n');

async function debugImageBriefing() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    console.log('📍 Step 1: Navigate to poem workflow');
    await page.goto('http://localhost:9002/w/poem/new');
    await page.waitForLoadState('networkidle');
    
    console.log('📍 Step 2: Fill poem topic and generate poem');
    await page.locator('textarea').first().fill('A majestic mountain at sunrise');
    await page.locator('#process-stage-poem-topic').click();
    
    console.log('📍 Step 3: Wait for poem generation');
    await page.waitForSelector('text=Poem Title', { timeout: 30000 });
    console.log('✅ Poem generated successfully');
    
    console.log('📍 Step 4: Check current page state');
    let pageText = await page.textContent('body');
    console.log('🔍 Progress before form:', pageText.match(/Progress \d+ \/ \d+ Stages/)?.[0] || 'No progress found');
    
    console.log('📍 Step 5: Fill image briefing form');
    await page.waitForSelector('text=Image Customization', { timeout: 10000 });
    
    // Check if form fields are present
    const textareaCount = await page.locator('textarea').count();
    console.log(`🔍 Found ${textareaCount} textareas on page`);
    
    const continueButtonCount = await page.locator('button:has-text("Continue")').count();
    console.log(`🔍 Found ${continueButtonCount} Continue buttons on page`);
    
    // Fill the textarea (should be second one)
    if (textareaCount >= 2) {
      const imageTextarea = page.locator('textarea').nth(1);
      await imageTextarea.fill('Beautiful mountain scenery');
      console.log('✅ Filled image instructions textarea');
    } else {
      console.log('⚠️  Could not find second textarea for image instructions');
    }
    
    // Click the specific image briefing continue button
    try {
      await page.locator('#process-stage-image-briefing').click();
      console.log('✅ Clicked image briefing continue button');
    } catch (error) {
      console.log('⚠️  Could not find #process-stage-image-briefing button:', error.message);
    }
    
    console.log('📍 Step 6: Wait and check progress after form submission');
    await page.waitForTimeout(3000); // Wait for form processing
    
    pageText = await page.textContent('body');
    console.log('🔍 Progress after form:', pageText.match(/Progress \d+ \/ \d+ Stages/)?.[0] || 'No progress found');
    
    // Check if image stage is triggered
    if (pageText.includes('Generate Poem Illustration')) {
      console.log('✅ Image generation stage is visible');
      
      if (pageText.includes('Waiting for:')) {
        console.log('⏳ Image stage is waiting (dependencies not met)');
      } else {
        console.log('🚀 Image stage should be running');
      }
    } else {
      console.log('❌ Image generation stage not found');
    }
    
    // Check for any console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('🔴 Browser Error:', msg.text());
      }
    });
    
    console.log('📍 Debug completed');
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  } finally {
    await browser.close();
  }
}

debugImageBriefing();