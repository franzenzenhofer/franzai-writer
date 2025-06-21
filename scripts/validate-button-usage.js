#!/usr/bin/env node

/**
 * BUTTON USAGE VALIDATION SCRIPT
 * 
 * Validates that all buttons throughout the application follow 
 * the design guidelines and use correct variants.
 * 
 * Usage: node scripts/validate-button-usage.js
 */

const fs = require('fs');
const path = require('path');

// BUTTON USAGE RULES FROM DESIGN GUIDELINES
const BUTTON_RULES = {
  // SECONDARY VARIANT: AI actions, editing
  secondary: {
    expectedUsage: ['AI REDO', 'Edit', 'Refresh', 'Preview', 'Settings', 'Filter'],
    searchPatterns: [
      'AI REDO',
      'AI Redo', 
      'Edit',
      'Refresh',
      'Preview',
      'Settings',
      'ai-redo',
      'edit-'
    ],
    textColor: 'DARK GRAY (#374151) - NOT colored text!'
  },
  
  // OUTLINE VARIANT: Export, external actions, downloads
  outline: {
    expectedUsage: ['Download', 'Copy', 'Share', 'Export', 'Import', 'Upload'],
    searchPatterns: [
      'Download',
      'Copy',
      'Share',
      'Export',
      'Import',
      'Upload',
      'Retry Export',
      'Regenerate Exports'
    ],
    textColor: 'PRIMARY BLUE (#2563EB) - matches border'
  },
  
  // PRIMARY VARIANT: Main actions
  default: {
    expectedUsage: ['Save Changes', 'Continue', 'Submit', 'Create', 'Publish', 'Start Process'],
    searchPatterns: [
      'Save',
      'Continue',
      'Submit',
      'Create',
      'Publish',
      'Process Stage',
      'Accept',
      'Confirm'
    ],
    textColor: 'WHITE (#FFFFFF)'
  },
  
  // GHOST VARIANT: Tertiary actions, navigation
  ghost: {
    expectedUsage: ['Back', 'Cancel', 'Skip', 'More Options', 'View Details'],
    searchPatterns: [
      'Back',
      'Cancel',
      'Skip',
      'More Options',
      'View Details',
      'Close'
    ],
    textColor: 'DARK GRAY (#374151)'
  },
  
  // SUCCESS VARIANT: Positive confirmations
  success: {
    expectedUsage: ['Approve', 'Complete', 'Accept', 'Verify', 'Confirm'],
    searchPatterns: [
      'Approve',
      'Complete',
      'Accept',
      'Verify',
      'Confirm',
      'Success'
    ],
    textColor: 'WHITE (#FFFFFF)'
  },
  
  // DESTRUCTIVE VARIANT: Dangerous actions
  destructive: {
    expectedUsage: ['Delete', 'Remove', 'Cancel Order', 'Reject'],
    searchPatterns: [
      'Delete',
      'Remove',
      'Cancel Order',
      'Reject',
      'Destroy'
    ],
    textColor: 'WHITE (#FFFFFF)'
  },
  
  // WARNING VARIANT: Caution actions
  warning: {
    expectedUsage: ['Override', 'Force Update', 'Modify', 'Suspend'],
    searchPatterns: [
      'Override',
      'Force Update',
      'Modify',
      'Suspend',
      'Warning'
    ],
    textColor: 'WHITE (#FFFFFF)'
  },
  
  // ACCENT VARIANT: Special features, premium actions
  accent: {
    expectedUsage: ['Premium', 'Favorite', 'Bookmark', 'Add to Cart'],
    searchPatterns: [
      'Premium',
      'Favorite',
      'Bookmark',
      'Add to Cart',
      'Special'
    ],
    textColor: 'WHITE (#FFFFFF)'
  }
};

// FILES TO SCAN
const SCAN_DIRECTORIES = [
  'src/components',
  'src/app',
  'src/workflows'
];

const SCAN_EXTENSIONS = ['.tsx', '.ts', '.jsx', '.js'];

// Valid predefined variants - NO CUSTOM VARIATIONS ALLOWED
const validVariants = [
  'default',     // PRIMARY
  'secondary',   // SECONDARY (AI REDO, Edit)
  'outline',     // OUTLINE (Download, Copy, Export)
  'ghost',       // GHOST (Back, Cancel)
  'destructive', // DESTRUCTIVE (Delete, Remove)
  'success',     // SUCCESS (Approve, Complete)
  'warning',     // WARNING (Override, Force Update)
  'accent'       // ACCENT (Premium, Special)
];

/**
 * Get all files to scan
 */
function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Skip node_modules and other irrelevant directories
      if (!['node_modules', '.git', '.next', 'dist', 'build'].includes(file)) {
        getAllFiles(filePath, fileList);
      }
    } else if (SCAN_EXTENSIONS.some(ext => file.endsWith(ext))) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

/**
 * Extract button usage from file content
 */
function extractButtonUsage(filePath, content) {
  const buttons = [];
  const lines = content.split('\n');
  
  // Look for Button components
  const buttonRegex = /<Button\s+([^>]*?)>(.*?)<\/Button>/gs;
  const matches = [...content.matchAll(buttonRegex)];
  
  matches.forEach(match => {
    const props = match[1];
    const children = match[2];
    
    // Extract variant
    const variantMatch = props.match(/variant=["']([^"']+)["']/);
    const variant = variantMatch ? variantMatch[1] : 'default';
    
    // Extract text content (remove JSX)
    const textContent = children
      .replace(/<[^>]*>/g, '') // Remove JSX tags
      .replace(/\{[^}]*\}/g, '') // Remove JSX expressions
      .trim();
    
    // Find line number
    const beforeMatch = content.substring(0, match.index);
    const lineNumber = beforeMatch.split('\n').length;
    
    buttons.push({
      filePath,
      lineNumber,
      variant,
      text: textContent,
      props,
      children
    });
  });
  
  return buttons;
}

/**
 * Validate button against rules
 */
function validateButton(button) {
  const issues = [];
  
  // Check if button text matches expected usage for variant
  const rule = BUTTON_RULES[button.variant];
  if (!rule) {
    issues.push(`Unknown variant: ${button.variant}`);
    return issues;
  }
  
  // Check if button text matches expected patterns for this variant
  const textMatches = rule.searchPatterns.some(pattern => 
    button.text.toLowerCase().includes(pattern.toLowerCase()) ||
    button.children.toLowerCase().includes(pattern.toLowerCase())
  );
  
  // Special validation for specific cases
  if (button.variant === 'secondary') {
    // AI REDO and Edit buttons should be secondary
    if (button.text.includes('AI REDO') || button.text.includes('Edit')) {
      // This is correct
    } else if (button.text.includes('Download') || button.text.includes('Copy') || button.text.includes('Export')) {
      issues.push(`Export action "${button.text}" should use outline variant, not secondary`);
    }
  }
  
  if (button.variant === 'outline') {
    // Export actions should be outline
    if (button.text.includes('Download') || button.text.includes('Copy') || button.text.includes('Export')) {
      // This is correct
    } else if (button.text.includes('AI REDO') || button.text.includes('Edit')) {
      issues.push(`AI/Edit action "${button.text}" should use secondary variant, not outline`);
    }
  }
  
  if (button.variant === 'default') {
    // Primary actions should be default
    if (button.text.includes('Save') || button.text.includes('Continue') || button.text.includes('Submit')) {
      // This is correct
    } else if (button.text.includes('Download') || button.text.includes('Copy')) {
      issues.push(`Export action "${button.text}" should use outline variant, not primary`);
    }
  }
  
  return issues;
}

/**
 * Generate usage report
 */
function generateReport(allButtons) {
  const report = {
    total: allButtons.length,
    byVariant: {},
    issues: [],
    correctUsage: 0
  };
  
  // Count by variant
  allButtons.forEach(button => {
    if (!report.byVariant[button.variant]) {
      report.byVariant[button.variant] = 0;
    }
    report.byVariant[button.variant]++;
    
    // Validate button
    const issues = validateButton(button);
    if (issues.length > 0) {
      report.issues.push({
        ...button,
        issues
      });
    } else {
      report.correctUsage++;
    }
  });
  
  return report;
}

/**
 * Print colored console output
 */
function logColored(message, color = 'white') {
  const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    reset: '\x1b[0m'
  };
  
  console.log(colors[color] + message + colors.reset);
}

/**
 * Main execution
 */
function main() {
  console.log('🔍 Button Usage Validation\n');
  
  // Get all files to scan
  const allFiles = [];
  SCAN_DIRECTORIES.forEach(dir => {
    if (fs.existsSync(dir)) {
      getAllFiles(dir, allFiles);
    }
  });
  
  console.log(`📁 Scanning ${allFiles.length} files...\n`);
  
  // Extract all button usage
  const allButtons = [];
  allFiles.forEach(filePath => {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const buttons = extractButtonUsage(filePath, content);
      allButtons.push(...buttons);
    } catch (error) {
      console.warn(`⚠️  Could not read ${filePath}: ${error.message}`);
    }
  });
  
  // Generate report
  const report = generateReport(allButtons);
  
  // Print summary
  logColored(`📊 BUTTON USAGE SUMMARY`, 'cyan');
  console.log(`Total buttons found: ${report.total}`);
  console.log(`Correct usage: ${report.correctUsage}`);
  console.log(`Issues found: ${report.issues.length}\n`);
  
  // Print usage by variant
  logColored(`📈 USAGE BY VARIANT`, 'blue');
  Object.entries(report.byVariant).forEach(([variant, count]) => {
    const rule = BUTTON_RULES[variant];
    console.log(`${variant}: ${count} buttons`);
    if (rule) {
      console.log(`  Expected: ${rule.expectedUsage.join(', ')}`);
      console.log(`  Text Color: ${rule.textColor}`);
    }
    console.log('');
  });
  
  // Print issues
  if (report.issues.length > 0) {
    logColored(`❌ ISSUES FOUND`, 'red');
    report.issues.forEach((button, index) => {
      console.log(`${index + 1}. ${button.filePath}:${button.lineNumber}`);
      console.log(`   Text: "${button.text}"`);
      console.log(`   Variant: ${button.variant}`);
      button.issues.forEach(issue => {
        logColored(`   ❌ ${issue}`, 'red');
      });
      console.log('');
    });
  } else {
    logColored(`✅ NO ISSUES FOUND!`, 'green');
  }
  
  // Print recommendations
  logColored(`💡 DESIGN GUIDELINES REMINDER`, 'yellow');
  console.log('AI REDO & Edit buttons → Secondary variant (dark gray text)');
  console.log('Download, Copy, Export buttons → Outline variant (blue border & text)');
  console.log('Save, Continue, Submit buttons → Primary variant (blue background)');
  console.log('Back, Cancel, tertiary actions → Ghost variant (subtle hover)');
  
  // Exit with error code if issues found
  if (report.issues.length > 0) {
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
} 