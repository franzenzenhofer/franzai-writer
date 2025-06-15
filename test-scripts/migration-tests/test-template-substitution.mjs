#!/usr/bin/env node

/**
 * Test script for template variable substitution
 */

function substitutePromptVars(template, context) {
  let finalPrompt = template;
  const regex = /\{\{([\w.-]+)\}\}/g;

  let match;
  while ((match = regex.exec(template)) !== null) {
    const fullPath = match[1];
    const pathParts = fullPath.split('.');
    
    let value = context;
    let found = true;
    for (const part of pathParts) {
      if (value && typeof value === 'object' && part in value) {
        value = value[part];
      } else {
        found = false;
        break;
      }
    }
    
    if (found) {
      const replacement = (typeof value === 'object' && value !== null) ? JSON.stringify(value, null, 2) : String(value);
      finalPrompt = finalPrompt.replace(match[0], replacement);
    } else {
      console.warn(`Prompt variable '{{${fullPath}}}' not found in context. Replacing with empty string.`);
      finalPrompt = finalPrompt.replace(match[0], "");
    }
  }
  return finalPrompt;
}

console.log('🧪 Testing Template Variable Substitution\n');

// Test 1: Simple case that should work
console.log('📋 TEST 1: Simple userInput substitution');
const template1 = "Analyze the content from {{userInput.url}} and answer: {{userInput.question}}";
const context1 = {
  userInput: {
    url: "https://news.ycombinator.com/",
    question: "Tell me the latest headlines"
  }
};

console.log('Template:', template1);
console.log('Context:', JSON.stringify(context1, null, 2));
const result1 = substitutePromptVars(template1, context1);
console.log('Result:', result1);
console.log('✅ Success:', result1.includes('https://news.ycombinator.com/'));

// Test 2: Complex context like in the actual test
console.log('\n📋 TEST 2: Complex context like in actual test');
const template2 = "Analyze the content from {{userInput.url}} and answer: {{userInput.question}}";
const context2 = {
  "test-title": {
    userInput: "Test",
    output: "Test"
  },
  "grounding-url-context": {
    userInput: {
      url: "https://news.ycombinator.com/",
      question: "Tell me the latest headlines"
    }
  },
  userInput: {
    url: "https://news.ycombinator.com/",
    question: "Tell me the latest headlines"
  }
};

console.log('Template:', template2);
console.log('Context keys:', Object.keys(context2));
console.log('Context.userInput:', JSON.stringify(context2.userInput, null, 2));
const result2 = substitutePromptVars(template2, context2);
console.log('Result:', result2);
console.log('✅ Success:', result2.includes('https://news.ycombinator.com/'));

// Test 3: Debug step by step
console.log('\n📋 TEST 3: Debug step by step');
const template3 = "{{userInput.url}}";
const context3 = {
  userInput: {
    url: "https://example.com"
  }
};

console.log('Template:', template3);
console.log('Context:', JSON.stringify(context3, null, 2));
console.log('Context has userInput:', 'userInput' in context3);
console.log('Context.userInput has url:', context3.userInput && 'url' in context3.userInput);
console.log('Context.userInput.url value:', context3.userInput?.url);

const result3 = substitutePromptVars(template3, context3);
console.log('Result:', result3);
console.log('✅ Success:', result3 === 'https://example.com');

console.log('\n🎯 Template substitution test completed!'); 