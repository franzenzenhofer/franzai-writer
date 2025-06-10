#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Create log files
const logFile = path.join(logsDir, `nextjs-${new Date().toISOString().split('T')[0]}.log`);
const errorLogFile = path.join(logsDir, `nextjs-errors-${new Date().toISOString().split('T')[0]}.log`);

const logStream = fs.createWriteStream(logFile, { flags: 'a' });
const errorLogStream = fs.createWriteStream(errorLogFile, { flags: 'a' });

// Start Next.js with debugging
const nextProcess = spawn('npm', ['run', 'next', 'dev', '--', '--turbopack', '-p', '9002'], {
  env: {
    ...process.env,
    NODE_ENV: 'development',
    DEBUG: '*',
    NEXT_TELEMETRY_DEBUG: '1',
  },
  stdio: ['inherit', 'pipe', 'pipe']
});

// Log timestamp
const timestamp = () => new Date().toISOString();

// Handle stdout
nextProcess.stdout.on('data', (data) => {
  const message = data.toString();
  const logEntry = `[${timestamp()}] ${message}`;
  
  // Write to file
  logStream.write(logEntry);
  
  // Also output to console
  process.stdout.write(message);
});

// Handle stderr
nextProcess.stderr.on('data', (data) => {
  const message = data.toString();
  const logEntry = `[${timestamp()}] ERROR: ${message}`;
  
  // Write to both log files
  logStream.write(logEntry);
  errorLogStream.write(logEntry);
  
  // Also output to console with color
  process.stderr.write('\x1b[31m' + message + '\x1b[0m');
});

// Handle process exit
nextProcess.on('exit', (code) => {
  const exitMessage = `[${timestamp()}] Next.js process exited with code ${code}\n`;
  logStream.write(exitMessage);
  if (code !== 0) {
    errorLogStream.write(exitMessage);
  }
  
  logStream.end();
  errorLogStream.end();
  process.exit(code);
});

// Handle errors
nextProcess.on('error', (err) => {
  const errorMessage = `[${timestamp()}] Failed to start Next.js: ${err.message}\n`;
  errorLogStream.write(errorMessage);
  console.error('Failed to start Next.js:', err);
  process.exit(1);
});

console.log(`Next.js debugging server started`);
console.log(`Logs: ${logFile}`);
console.log(`Error logs: ${errorLogFile}`);