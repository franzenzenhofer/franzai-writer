import { runAiStage } from '@/app/actions/aiActions-new';
import { NextResponse } from 'next/server';

/**
 * Import the same path resolution logic used in template substitution
 * This ensures consistency between validation and resolution
 */
function resolveVariablePath(varPath: string, context: Record<string, any>): { found: boolean; value: any } {
  console.log(`[Template Validation] Resolving: ${varPath}`);
  const pathParts = varPath.split('.');
  let value = context;
  let found = true;
  
  // CRITICAL: Handle special image selector paths FIRST
  // Check for paths like 'stage-id.output.image.selected'
  if (pathParts.length >= 4 && pathParts[pathParts.length - 2] === 'image') {
    const imageSelector = pathParts[pathParts.length - 1]; // 'selected', 'first', 'second', etc.
    const basePathParts = pathParts.slice(0, -2); // Remove 'image.selector' from the end
    
    console.log(`[Template Validation] Detected image selector: ${imageSelector}, base path: ${basePathParts.join('.')}`);
    
    // Try to resolve the base path (e.g., 'stage-id.output')
    let baseValue = context;
    let baseFound = true;
    for (const part of basePathParts) {
      if (baseValue && typeof baseValue === 'object' && part in baseValue) {
        baseValue = baseValue[part];
      } else {
        baseFound = false;
        break;
      }
    }
    
    if (baseFound && baseValue && typeof baseValue === 'object') {
      console.log(`[Template Validation] Base path resolved to:`, typeof baseValue, Object.keys(baseValue));
      
      // Check if this is an image output
      if (baseValue.provider && baseValue.images && Array.isArray(baseValue.images) && baseValue.images.length > 0) {
        const selectedImage = getSelectedImage(baseValue, imageSelector);
        if (selectedImage) {
          console.log(`[Template Validation] ✅ Image selector resolved:`, selectedImage);
          return { found: true, value: selectedImage };
        } else {
          console.log(`[Template Validation] ❌ Image selector failed: no image found for selector '${imageSelector}'`);
        }
      } else {
        console.log(`[Template Validation] ❌ Base path is not an image output:`, baseValue);
      }
    } else {
      console.log(`[Template Validation] ❌ Base path could not be resolved`);
    }
    
    return { found: false, value: undefined };
  }
  
  // Standard path resolution for non-image paths
  for (let i = 0; i < pathParts.length; i++) {
    const part = pathParts[i];
    console.log(`[Template Validation] Checking part '${part}' in:`, typeof value, Array.isArray(value) ? 'array' : (value && typeof value === 'object' ? Object.keys(value) : value));
    
    if (value && typeof value === 'object' && part in value) {
      value = value[part];
      console.log(`[Template Validation] Found '${part}', new value type:`, typeof value);
    } else {
      console.log(`[Template Validation] ❌ Part '${part}' not found`);
      found = false;
      break;
    }
  }
  
  console.log(`[Template Validation] Final result for ${varPath}:`, { found, value: typeof value });
  return { found, value };
}

/**
 * Get a specific image based on selector
 */
function getSelectedImage(imageOutput: any, selector: string): any {
  if (!imageOutput.images || !Array.isArray(imageOutput.images) || imageOutput.images.length === 0) {
    return null;
  }
  
  switch (selector) {
    case 'selected':
      const selectedIndex = imageOutput.selectedImageIndex || 0;
      return imageOutput.images[selectedIndex] || imageOutput.images[0];
    case 'first':
      return imageOutput.images[0] || null;
    case 'second':
      return imageOutput.images[1] || null;
    case 'third':
      return imageOutput.images[2] || null;
    case 'fourth':
      return imageOutput.images[3] || null;
    default:
      // Try to parse as a number (0-indexed)
      const index = parseInt(selector, 10);
      if (!isNaN(index) && index >= 0 && index < imageOutput.images.length) {
        return imageOutput.images[index];
      }
      return null;
  }
}

/**
 * Validate that a prompt template can be resolved with the given context
 * Uses the same logic as template substitution to ensure consistency
 */
function validateTemplateResolution(promptTemplate: string, contextVars: Record<string, any>): void {
  console.log('[Template Validation] Checking template resolution before AI execution');
  
  // Extract all template variables
  const templateVars = promptTemplate.match(/\{\{[\w.-]+\}\}/g) || [];
  if (templateVars.length === 0) {
    console.log('[Template Validation] No template variables found - skipping validation');
    return;
  }
  
  console.log('[Template Validation] Found template variables:', templateVars);
  console.log('[Template Validation] Available context keys:', Object.keys(contextVars));
  
  const missingVars: string[] = [];
  
  for (const varWithBraces of templateVars) {
    const varPath = varWithBraces.replace(/[{}]/g, '');
    console.log(`[Template Validation] Validating: ${varWithBraces}`);
    
    // Use the same resolution logic as template substitution
    const result = resolveVariablePath(varPath, contextVars);
    
    if (!result.found) {
      // Check if this is an optional variable (ending with .output)
      const pathParts = varPath.split('.');
      if (pathParts.length >= 2 && pathParts[pathParts.length - 1] === 'output') {
        console.log(`[Template Validation] ⚠️ Optional variable not found: ${varWithBraces}`);
      } else {
        console.error(`[Template Validation] ❌ Required variable missing: ${varWithBraces}`);
        missingVars.push(varPath);
      }
    } else {
      console.log(`[Template Validation] ✅ Variable can be resolved: ${varWithBraces}`);
    }
  }
  
  if (missingVars.length > 0) {
    throw new Error(`Template validation failed: Required variables not found: ${missingVars.map(v => `{{${v}}}`).join(', ')}. Available context: ${Object.keys(contextVars).join(', ')}`);
  }
  
  console.log('[Template Validation] ✅ All template variables can be resolved');
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // CRITICAL: Validate template resolution before executing
    if (body.promptTemplate && body.contextVars) {
      try {
        validateTemplateResolution(body.promptTemplate, body.contextVars);
      } catch (validationError: any) {
        console.error('🚨 TEMPLATE VALIDATION FAILED:', validationError.message);
        return NextResponse.json(
          { 
            error: `Template validation failed: ${validationError.message}`,
            details: 'This is a fail-fast mechanism to prevent sending unresolved template variables to the AI.'
          }, 
          { status: 400 }
        );
      }
    }
    
    const result = await runAiStage(body);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('AI execution error:', error);
    return NextResponse.json(
      { error: error.message || 'AI execution failed' }, 
      { status: 500 }
    );
  }
}