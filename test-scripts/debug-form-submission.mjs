#!/usr/bin/env node
/**
 * Debug script to check if form submission triggers onRunStage
 */

import 'dotenv/config';
import { chromium } from 'playwright';

console.log('🔍 Debugging Form Submission Flow...\n');

async function debugFormSubmission() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // Capture console logs and network requests
  const consoleLogs = [];
  const networkRequests = [];
  
  page.on('console', msg => {
    consoleLogs.push(`${msg.type()}: ${msg.text()}`);
  });
  
  page.on('request', request => {
    if (request.url().includes('/api/')) {
      networkRequests.push({
        method: request.method(),
        url: request.url(),
        postData: request.postData()
      });
    }
  });
  
  try {
    console.log('📍 Step 1: Navigate to poem workflow');
    await page.goto('http://localhost:9002/w/poem/new');
    await page.waitForLoadState('networkidle');
    
    console.log('📍 Step 2: Complete poem generation');
    await page.locator('textarea').first().fill('A test mountain');
    await page.locator('button:has-text("Continue")').first().click();
    await page.waitForSelector('text=Poem Title', { timeout: 30000 });
    console.log('✅ Poem completed');
    
    console.log('📍 Step 3: Fill and submit image briefing form');
    await page.waitForSelector('text=Image Customization', { timeout: 10000 });
    
    // Clear console logs before form submission
    consoleLogs.length = 0;
    networkRequests.length = 0;
    
    const imageTextarea = page.locator('textarea').nth(1);
    await imageTextarea.fill('Test image description');
    
    console.log('📍 Step 4: Click Continue button and monitor activity');
    const continueButton = page.locator('button:has-text("Continue")').nth(1);
    await continueButton.click();
    
    // Wait for potential API calls
    await page.waitForTimeout(5000);
    
    console.log('\n📊 Results:');
    console.log(`🔍 Console logs captured: ${consoleLogs.length}`);
    if (consoleLogs.length > 0) {
      console.log('📝 Console messages:');
      consoleLogs.forEach((log, i) => {
        console.log(`  ${i + 1}. ${log}`);
      });
    }
    
    console.log(`\n🌐 Network requests captured: ${networkRequests.length}`);
    if (networkRequests.length > 0) {
      console.log('📡 API calls:');
      networkRequests.forEach((req, i) => {
        console.log(`  ${i + 1}. ${req.method} ${req.url}`);
        if (req.postData) {
          console.log(`     Data: ${req.postData.substring(0, 100)}...`);
        }
      });
    }
    
    // Check page state after form submission
    const pageText = await page.textContent('body');
    const progress = pageText.match(/Progress \d+ \/ \d+ Stages/)?.[0] || 'No progress found';
    console.log(`\n📊 Progress after form submission: ${progress}`);
    
    if (pageText.includes('Generate Poem Illustration')) {
      console.log('✅ Image generation stage visible');
      if (pageText.includes('Waiting for:')) {
        console.log('⏳ Image stage waiting for dependencies');
      } else {
        console.log('🚀 Image stage should be active');
      }
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  } finally {
    await browser.close();
  }
}

debugFormSubmission();