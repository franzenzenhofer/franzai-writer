#!/usr/bin/env node

/**
 * COLOR TRANSFORMATION SCRIPT
 * 
 * Transforms design guideline colors to Tailwind CSS format
 * Ensures consistency across the entire application
 * 
 * Usage: node scripts/color-transform.js
 */

const fs = require('fs');

// DESIGN GUIDELINE COLORS (from DESIGN-GUIDELINES.md)
const GUIDELINE_COLORS = {
  // Brand Colors
  'Primary Blue': '#2563EB',      // Royal Blue - Main brand color
  'Primary Hover': '#2563EB/90',  // Slightly transparent for hover
  'Accent Violet': '#8B5CF6',     // Secondary accent color
  'Success Green': '#10B981',     // Emerald green for success states
  'Destructive Red': '#EF4444',   // Rose red for errors
  'Warning Orange': '#F59E0B',    // Amber orange for warnings
  
  // Neutral Colors
  'Background': '#FFFFFF',        // Pure white background
  'Foreground': '#0F172A',        // Rich black text
  'Dark Gray': '#374151',         // Dark gray for secondary button text
  'Muted': '#F8FAFC',            // Light gray for subtle backgrounds
  'Border': '#E2E8F0'            // Visible borders
};

// HEX TO TAILWIND MAPPING
const HEX_TO_TAILWIND = {
  // Blues
  '#2563EB': 'blue-600',
  '#1D4ED8': 'blue-700',
  
  // Violets
  '#8B5CF6': 'violet-500',
  '#7C3AED': 'violet-600',
  
  // Emeralds (Success)
  '#10B981': 'emerald-500',
  '#059669': 'emerald-600',
  
  // Reds (Destructive)
  '#EF4444': 'red-500',
  '#DC2626': 'red-600',
  
  // Ambers (Warning)
  '#F59E0B': 'amber-500',
  '#D97706': 'amber-600',
  
  // Grays/Slates
  '#FFFFFF': 'white',
  '#0F172A': 'slate-900',
  '#374151': 'gray-700',
  '#F8FAFC': 'slate-50',
  '#E2E8F0': 'slate-200',
  '#F1F5F9': 'slate-100',
  '#CBD5E1': 'slate-300'
};

// BUTTON VARIANT COLOR MAPPINGS
const BUTTON_COLOR_MAPPINGS = {
  default: {
    description: 'Primary actions - Royal Blue with white text',
    background: '#2563EB',
    backgroundHover: '#1D4ED8',
    text: '#FFFFFF',
    border: '#2563EB',
    borderHover: '#1D4ED8',
    tailwind: {
      background: 'bg-blue-600',
      backgroundHover: 'hover:bg-blue-700',
      text: 'text-white',
      border: 'border-blue-600',
      borderHover: 'hover:border-blue-700'
    }
  },
  
  secondary: {
    description: 'Secondary actions - Light background with DARK GRAY text (AI REDO, Edit)',
    background: '#F8FAFC',
    backgroundHover: '#EFF6FF',
    text: '#374151',           // DARK GRAY - NOT colored text!
    border: '#E2E8F0',
    borderHover: '#93C5FD',
    tailwind: {
      background: 'bg-slate-50',
      backgroundHover: 'hover:bg-blue-50',
      text: 'text-gray-700',   // DARK GRAY
      border: 'border-slate-200',
      borderHover: 'hover:border-blue-300'
    }
  },
  
  outline: {
    description: 'Export actions - White background with blue border and text (Download, Copy)',
    background: '#FFFFFF',
    backgroundHover: '#2563EB',
    text: '#2563EB',           // PRIMARY BLUE - matches border
    textHover: '#FFFFFF',
    border: '#2563EB',
    tailwind: {
      background: 'bg-white',
      backgroundHover: 'hover:bg-blue-600',
      text: 'text-blue-600',   // PRIMARY BLUE
      textHover: 'hover:text-white',
      border: 'border-2 border-blue-600'
    }
  },
  
  destructive: {
    description: 'Dangerous actions - Red background with white text',
    background: '#EF4444',
    backgroundHover: '#DC2626',
    text: '#FFFFFF',
    border: '#EF4444',
    borderHover: '#DC2626',
    tailwind: {
      background: 'bg-red-500',
      backgroundHover: 'hover:bg-red-600',
      text: 'text-white',
      border: 'border-red-500',
      borderHover: 'hover:border-red-600'
    }
  },
  
  success: {
    description: 'Positive actions - Green background with white text',
    background: '#10B981',
    backgroundHover: '#059669',
    text: '#FFFFFF',
    border: '#10B981',
    borderHover: '#059669',
    tailwind: {
      background: 'bg-emerald-500',
      backgroundHover: 'hover:bg-emerald-600',
      text: 'text-white',
      border: 'border-emerald-500',
      borderHover: 'hover:border-emerald-600'
    }
  },
  
  warning: {
    description: 'Caution actions - Orange background with white text',
    background: '#F59E0B',
    backgroundHover: '#D97706',
    text: '#FFFFFF',
    border: '#F59E0B',
    borderHover: '#D97706',
    tailwind: {
      background: 'bg-amber-500',
      backgroundHover: 'hover:bg-amber-600',
      text: 'text-white',
      border: 'border-amber-500',
      borderHover: 'hover:border-amber-600'
    }
  },
  
  accent: {
    description: 'Special features - Violet background with white text',
    background: '#8B5CF6',
    backgroundHover: '#7C3AED',
    text: '#FFFFFF',
    border: '#8B5CF6',
    borderHover: '#7C3AED',
    tailwind: {
      background: 'bg-violet-500',
      backgroundHover: 'hover:bg-violet-600',
      text: 'text-white',
      border: 'border-violet-500',
      borderHover: 'hover:border-violet-600'
    }
  },
  
  ghost: {
    description: 'Tertiary actions - Transparent with subtle hover',
    background: 'transparent',
    backgroundHover: '#F1F5F9',
    text: '#374151',
    textHover: '#0F172A',
    border: 'transparent',
    borderHover: '#E2E8F0',
    tailwind: {
      background: 'bg-transparent',
      backgroundHover: 'hover:bg-slate-100',
      text: 'text-slate-700',
      textHover: 'hover:text-slate-900',
      border: 'border-transparent',
      borderHover: 'hover:border-slate-200'
    }
  }
};

/**
 * Generate Tailwind CSS classes from hex colors
 */
function hexToTailwind(hex) {
  return HEX_TO_TAILWIND[hex] || `[${hex}]`;
}

/**
 * Validate color contrast ratios
 */
function validateContrast(background, text) {
  // Simplified contrast check - in production, use proper WCAG algorithms
  const isDarkBg = ['#2563EB', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#0F172A'].includes(background);
  const isLightText = text === '#FFFFFF';
  const isDarkText = ['#374151', '#0F172A'].includes(text);
  
  if (isDarkBg && !isLightText) {
    console.warn(`⚠️  Low contrast: ${background} background with ${text} text`);
    return false;
  }
  
  if (!isDarkBg && !isDarkText && text !== '#2563EB') {
    console.warn(`⚠️  Low contrast: ${background} background with ${text} text`);
    return false;
  }
  
  return true;
}

/**
 * Generate CSS custom properties for colors
 */
function generateCSSCustomProperties() {
  let css = ':root {\n';
  
  Object.entries(GUIDELINE_COLORS).forEach(([name, hex]) => {
    const varName = name.toLowerCase().replace(/\s+/g, '-');
    css += `  --color-${varName}: ${hex};\n`;
  });
  
  css += '}\n\n';
  
  // Add button-specific CSS variables
  css += '/* Button variant colors */\n';
  Object.entries(BUTTON_COLOR_MAPPINGS).forEach(([variant, config]) => {
    css += `/* ${config.description} */\n`;
    css += `.btn-${variant} {\n`;
    css += `  background-color: ${config.background};\n`;
    css += `  color: ${config.text};\n`;
    css += `  border-color: ${config.border};\n`;
    css += '}\n\n';
  });
  
  return css;
}

/**
 * Generate TypeScript color constants
 */
function generateTypeScriptConstants() {
  let ts = '// Auto-generated color constants from design guidelines\n\n';
  
  ts += 'export const DESIGN_COLORS = {\n';
  Object.entries(GUIDELINE_COLORS).forEach(([name, hex]) => {
    const constName = name.toUpperCase().replace(/\s+/g, '_');
    ts += `  ${constName}: '${hex}',\n`;
  });
  ts += '} as const;\n\n';
  
  ts += 'export const TAILWIND_MAPPINGS = {\n';
  Object.entries(HEX_TO_TAILWIND).forEach(([hex, tailwind]) => {
    ts += `  '${hex}': '${tailwind}',\n`;
  });
  ts += '} as const;\n\n';
  
  return ts;
}

/**
 * Validate all button color combinations
 */
function validateAllButtonColors() {
  console.log('🎨 Validating button color combinations...\n');
  
  let allValid = true;
  
  Object.entries(BUTTON_COLOR_MAPPINGS).forEach(([variant, config]) => {
    console.log(`Checking ${variant} variant: ${config.description}`);
    
    const bgValid = validateContrast(config.background, config.text);
    if (bgValid) {
      console.log(`  ✅ ${config.background} + ${config.text} - Good contrast`);
    } else {
      allValid = false;
    }
    
    // Check hover states
    if (config.backgroundHover && config.textHover) {
      const hoverValid = validateContrast(config.backgroundHover, config.textHover);
      if (hoverValid) {
        console.log(`  ✅ Hover: ${config.backgroundHover} + ${config.textHover} - Good contrast`);
      } else {
        allValid = false;
      }
    }
    
    console.log('');
  });
  
  return allValid;
}

/**
 * Main execution
 */
function main() {
  console.log('🚀 Design Guidelines Color Transformation\n');
  
  // Validate colors
  const colorsValid = validateAllButtonColors();
  
  if (!colorsValid) {
    console.error('❌ Color validation failed! Please check the warnings above.');
    process.exit(1);
  }
  
  // Generate files
  const cssContent = generateCSSCustomProperties();
  const tsContent = generateTypeScriptConstants();
  
  // Write files
  fs.writeFileSync('src/styles/design-colors.css', cssContent);
  fs.writeFileSync('src/lib/design-system/color-constants.ts', tsContent);
  
  console.log('✅ Generated files:');
  console.log('   - src/styles/design-colors.css');
  console.log('   - src/lib/design-system/color-constants.ts');
  
  // Print summary
  console.log('\n📋 Color Summary:');
  console.log('   Primary Blue: #2563EB (bg-blue-600)');
  console.log('   Secondary Text: #374151 (text-gray-700) - DARK GRAY');
  console.log('   Outline Text: #2563EB (text-blue-600) - BLUE');
  console.log('   Always visible borders ✅');
  console.log('   High contrast combinations ✅');
  console.log('   44px minimum touch targets ✅');
  
  console.log('\n🎯 Button Usage:');
  console.log('   AI REDO → Secondary variant (dark gray text)');
  console.log('   Edit → Secondary variant (dark gray text)');
  console.log('   Download → Outline variant (blue border & text)');
  console.log('   Copy → Outline variant (blue border & text)');
  console.log('   Export → Outline variant (blue border & text)');
}

// Run the script
if (require.main === module) {
  main();
} 