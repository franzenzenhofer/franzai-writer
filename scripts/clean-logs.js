#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const logsDir = path.join(__dirname, '..', 'logs');

// Create logs directory if it doesn't exist
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
  console.log('📁 Created logs directory');
}

// List of log files to clean (remove completely)
const logsToDelete = [
  'ai.log',
  'curl-output.log',
  'firebase-emulators.log',
  'nextjs-dev.log',
  'nextjs-full.log',
  'nextjs-server.log',
  'nextjs-verbose.log'
];

// List of patterns for files to keep (reports, etc.)
const patternsToKeep = [
  /.*-report.*\.(json|md)$/,  // Keep report files
  /fix-summary.*\.md$/         // Keep fix summaries
];

console.log('🧹 Cleaning log files...');

fs.readdirSync(logsDir).forEach(file => {
  const filePath = path.join(logsDir, file);
  
  // Check if file should be kept
  const shouldKeep = patternsToKeep.some(pattern => pattern.test(file));
  
  if (shouldKeep) {
    console.log(`✅ Keeping: ${file}`);
  } else if (logsToDelete.includes(file)) {
    try {
      fs.unlinkSync(filePath);
      console.log(`🗑️  Deleted: ${file}`);
    } catch (err) {
      console.error(`❌ Error deleting ${file}:`, err.message);
    }
  } else if (file.endsWith('.log')) {
    // Delete any other .log files not explicitly listed
    try {
      fs.unlinkSync(filePath);
      console.log(`🗑️  Deleted: ${file}`);
    } catch (err) {
      console.error(`❌ Error deleting ${file}:`, err.message);
    }
  }
});

// Create empty log files for the ones we deleted
logsToDelete.forEach(logFile => {
  const filePath = path.join(logsDir, logFile);
  try {
    fs.writeFileSync(filePath, '');
    console.log(`📝 Created empty: ${logFile}`);
  } catch (err) {
    console.error(`❌ Error creating ${logFile}:`, err.message);
  }
});

console.log('✨ Log cleanup complete!');