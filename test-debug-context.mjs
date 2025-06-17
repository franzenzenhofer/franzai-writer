import { config } from 'dotenv';
config();

// Test the context building logic
const testContext = {
  'poem-topic': {
    userInput: 'a beautiful sunny day',
    output: 'a beautiful sunny day'
  },
  'generate-poem-with-title': {}
};

console.log('Test context:', JSON.stringify(testContext, null, 2));

// Test what happens when we try to access poem-topic.output
const poemTopicOutput = testContext['poem-topic']?.output;
console.log('poem-topic.output:', poemTopicOutput);

// Simulate the template substitution
const template = "Write a poem about '{{poem-topic.output}}'.";
console.log('Template:', template);

// Simple regex test
const regex = /\{\{([\w.-]+)\}\}/g;
let match;
while ((match = regex.exec(template)) !== null) {
  const fullPath = match[1];
  console.log('Found template variable:', fullPath);
  
  const pathParts = fullPath.split('.');
  console.log('Path parts:', pathParts);
  
  let value = testContext;
  let found = true;
  for (const part of pathParts) {
    console.log(`Checking part '${part}' in:`, value);
    if (value && typeof value === 'object' && part in value) {
      value = value[part];
      console.log(`Found '${part}', value is now:`, value);
    } else {
      found = false;
      console.log(`NOT FOUND: '${part}'`);
      break;
    }
  }
  
  console.log('Final result:', { found, value });
}