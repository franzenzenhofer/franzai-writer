#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Generate build information
function generateBuildInfo() {
  const buildInfo = {
    version: process.env.npm_package_version || '0.1.0',
    buildTime: new Date().toISOString(),
    buildTimestamp: Date.now(),
    buildId: generateBuildId(),
    gitCommit: getGitCommit(),
    gitBranch: getGitBranch(),
    nodeVersion: process.version,
    env: process.env.NODE_ENV || 'development',
  };

  return buildInfo;
}

// Generate a unique build ID
function generateBuildId() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `${timestamp}-${random}`;
}

// Get current git commit hash
function getGitCommit() {
  try {
    return execSync('git rev-parse --short HEAD').toString().trim();
  } catch (error) {
    return 'unknown';
  }
}

// Get current git branch
function getGitBranch() {
  try {
    return execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
  } catch (error) {
    return 'unknown';
  }
}

// Main execution
function main() {
  const buildInfo = generateBuildInfo();
  
  // Ensure directories exist
  const publicDir = path.join(__dirname, '..', 'public');
  const libDir = path.join(__dirname, '..', 'src', 'lib');
  
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  
  if (!fs.existsSync(libDir)) {
    fs.mkdirSync(libDir, { recursive: true });
  }
  
  // Write to public directory for runtime access
  const publicPath = path.join(publicDir, 'build-info.json');
  fs.writeFileSync(publicPath, JSON.stringify(buildInfo, null, 2));
  
  // Write to src for build-time access
  const srcPath = path.join(libDir, 'build-info.json');
  fs.writeFileSync(srcPath, JSON.stringify(buildInfo, null, 2));
  
  // Also create a TypeScript constant file
  const tsContent = `// Auto-generated build information - DO NOT EDIT
export const BUILD_INFO = ${JSON.stringify(buildInfo, null, 2)} as const;

export type BuildInfo = typeof BUILD_INFO;
`;
  
  const tsPath = path.join(__dirname, '..', 'src', 'lib', 'build-info.ts');
  fs.writeFileSync(tsPath, tsContent);
  
  console.log('✅ Build info generated:');
  console.log(`   Version: ${buildInfo.version}`);
  console.log(`   Build ID: ${buildInfo.buildId}`);
  console.log(`   Git Commit: ${buildInfo.gitCommit}`);
  console.log(`   Build Time: ${buildInfo.buildTime}`);
}

// Run the script
main();