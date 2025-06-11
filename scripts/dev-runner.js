#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const readline = require('readline');
const http = require('http');
const https = require('https');
const net = require('net');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

// Configuration
const CONFIG = {
  services: {
    'next': {
      name: 'Next.js Dev Server',
      command: 'next',
      args: ['dev', '--turbopack', '-p', '9002'],
      port: 9002,
      healthCheck: 'http://localhost:9002/',
      startupTime: 5000,
      color: '\x1b[36m', // Cyan
      envVars: {}
    },
    'genkit': {
      name: 'Genkit Dev Server',
      command: 'genkit',
      args: ['start', '--config', 'src/ai/genkit.ts'],
      port: 4000,
      healthCheck: 'http://localhost:4000/',
      startupTime: 8000,
      color: '\x1b[35m', // Magenta
      envVars: {}
    },
    'firebase': {
      name: 'Firebase Emulators',
      command: 'firebase',
      args: ['emulators:start'],
      port: 4000,
      healthCheck: 'http://localhost:4000/',
      startupTime: 10000,
      color: '\x1b[33m', // Yellow
      envVars: {}
    }
  },
  logs: {
    baseDir: path.join(__dirname, '..', 'logs'),
    maxSize: 10 * 1024 * 1024, // 10MB
    archiveAfterDays: 7,
    persistentServices: ['next', 'genkit', 'firebase']
  }
};

// State management
const state = {
  processes: {},
  logs: {},
  startTime: Date.now(),
  isShuttingDown: false
};

// Utility functions
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m'
};

function log(message, color = colors.reset) {
  console.log(`${color}[${new Date().toISOString()}] ${message}${colors.reset}`);
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatUptime(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

// Port management
async function checkPort(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', () => resolve(false));
    server.once('listening', () => {
      server.close();
      resolve(true);
    });
    server.listen(port);
  });
}

async function findAvailablePort(startPort, maxTries = 10) {
  for (let i = 0; i < maxTries; i++) {
    const port = startPort + i;
    if (await checkPort(port)) {
      return port;
    }
  }
  throw new Error(`No available ports found starting from ${startPort}`);
}

async function killProcessOnPort(port) {
  try {
    const { stdout } = await execPromise(`lsof -ti:${port}`);
    const pids = stdout.trim().split('\n').filter(Boolean);
    
    for (const pid of pids) {
      try {
        await execPromise(`kill -9 ${pid}`);
        log(`Killed process ${pid} on port ${port}`, colors.yellow);
      } catch (e) {
        // Process might have already exited
      }
    }
    
    // Wait a bit for port to be released
    await new Promise(resolve => setTimeout(resolve, 1000));
  } catch (e) {
    // No process found on port
  }
}

// More functions to come in next part...