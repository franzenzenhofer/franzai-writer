#!/usr/bin/env node

/**
 * Visual Regression Test Runner
 * 
 * This script helps run visual regression tests with proper setup and error handling.
 * It ensures the development server is running and provides helpful feedback.
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// ANSI color codes
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkServerStatus() {
  log('🔍 Checking development server status...', 'blue');
  
  try {
    execSync('curl -s http://localhost:9002 > /dev/null', { timeout: 5000 });
    log('✅ Development server is running on port 9002', 'green');
    return true;
  } catch (error) {
    log('❌ Development server is not running on port 9002', 'red');
    return false;
  }
}

function showHelp() {
  log('\n📸 Visual Regression Test Runner', 'bold');
  log('=====================================', 'cyan');
  log('');
  log('Usage:', 'yellow');
  log('  node scripts/run-visual-tests.js [options]', 'cyan');
  log('');
  log('Options:', 'yellow');
  log('  --help, -h        Show this help message', 'cyan');
  log('  --update, -u      Update baseline screenshots', 'cyan');
  log('  --debug, -d       Run in debug mode', 'cyan');
  log('  --headed          Run in headed mode (show browser)', 'cyan');
  log('  --ui              Run with Playwright UI', 'cyan');
  log('');
  log('Examples:', 'yellow');
  log('  npm run test:visual                    # Run all visual tests', 'cyan');
  log('  npm run test:visual:update             # Update baselines', 'cyan');
  log('  node scripts/run-visual-tests.js      # Run with this script', 'cyan');
  log('  node scripts/run-visual-tests.js -u   # Update baselines', 'cyan');
  log('  node scripts/run-visual-tests.js -d   # Debug mode', 'cyan');
  log('');
  log('Prerequisites:', 'yellow');
  log('  • Development server running on port 9002', 'cyan');
  log('  • Playwright dependencies installed', 'cyan');
  log('  • Node.js and npm available', 'cyan');
  log('');
}

function runVisualTests(options = {}) {
  const { update = false, debug = false, headed = false, ui = false } = options;
  
  log('🚀 Starting visual regression tests...', 'magenta');
  
  // Build the command
  let command = 'npx playwright test --project=visual-regression';
  
  if (update) {
    command += ' --update-snapshots';
    log('📸 Updating baseline screenshots...', 'yellow');
  }
  
  if (debug) {
    command += ' --debug';
    log('🐛 Running in debug mode...', 'yellow');
  }
  
  if (headed) {
    command += ' --headed';
    log('👀 Running in headed mode...', 'yellow');
  }
  
  if (ui) {
    command += ' --ui';
    log('🎨 Running with Playwright UI...', 'yellow');
  }
  
  log(`\n🔧 Command: ${command}`, 'blue');
  log('');
  
  try {
    // Run the command with live output
    const child = spawn('npx', command.split(' ').slice(1), {
      stdio: 'inherit',
      shell: true
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        log('\n✅ Visual regression tests completed successfully!', 'green');
        log('');
        log('Next steps:', 'yellow');
        log('  • Review any screenshot differences in the test report', 'cyan');
        log('  • Update baselines if changes are intentional', 'cyan');
        log('  • Check the visual-regression-README.md for more info', 'cyan');
      } else {
        log('\n❌ Visual regression tests failed!', 'red');
        log('');
        log('Troubleshooting:', 'yellow');
        log('  • Check that selectors match the actual UI', 'cyan');
        log('  • Ensure the development server is running', 'cyan');
        log('  • Review the test output for specific errors', 'cyan');
        log('  • Run with --debug flag for more details', 'cyan');
      }
    });
    
    child.on('error', (error) => {
      log(`\n❌ Error running tests: ${error.message}`, 'red');
    });
    
  } catch (error) {
    log(`\n❌ Failed to run visual regression tests: ${error.message}`, 'red');
    process.exit(1);
  }
}

function main() {
  const args = process.argv.slice(2);
  
  // Parse command line arguments
  if (args.includes('--help') || args.includes('-h')) {
    showHelp();
    return;
  }
  
  const options = {
    update: args.includes('--update') || args.includes('-u'),
    debug: args.includes('--debug') || args.includes('-d'),
    headed: args.includes('--headed'),
    ui: args.includes('--ui')
  };
  
  // Show header
  log('📸 Visual Regression Test Runner', 'bold');
  log('=====================================', 'cyan');
  log('');
  
  // Check prerequisites
  if (!checkServerStatus()) {
    log('');
    log('💡 To start the development server:', 'yellow');
    log('  npm run dev', 'cyan');
    log('');
    log('⏰ Then wait for the server to start and try again.', 'yellow');
    process.exit(1);
  }
  
  // Check if Playwright is installed
  try {
    execSync('npx playwright --version', { stdio: 'ignore' });
    log('✅ Playwright is installed', 'green');
  } catch (error) {
    log('❌ Playwright is not installed', 'red');
    log('');
    log('💡 To install Playwright:', 'yellow');
    log('  npx playwright install', 'cyan');
    process.exit(1);
  }
  
  log('');
  
  // Run the tests
  runVisualTests(options);
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { runVisualTests, checkServerStatus };