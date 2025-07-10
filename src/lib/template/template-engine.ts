import Handlebars from 'handlebars';
import type { TemplateContext } from './template-context';
import { sanitizeTemplateVariable } from '@/lib/security/sanitization';

// Register custom helpers for common template operations
Handlebars.registerHelper('json', (value) => {
  return JSON.stringify(value, null, 2);
});

Handlebars.registerHelper('exists', (value) => {
  return value !== undefined && value !== null;
});

Handlebars.registerHelper('trim', (value) => {
  return typeof value === 'string' ? value.trim() : value;
});

Handlebars.registerHelper('default', (value, defaultValue) => {
  return value || defaultValue;
});

// Template compilation cache for performance
const templateCache = new Map<string, HandlebarsTemplateDelegate>();

/**
 * Compiles a handlebars template with caching
 */
function compileTemplate(source: string): HandlebarsTemplateDelegate {
  if (!templateCache.has(source)) {
    const template = Handlebars.compile(source, { 
      noEscape: false, // Enable HTML escaping for security
      strict: false // Allow undefined properties to be null instead of throwing
    });
    templateCache.set(source, template);
  }
  return templateCache.get(source)!;
}

/**
 * Sanitizes template context to prevent injection attacks
 */
function sanitizeTemplateContext(context: TemplateContext): TemplateContext {
  const sanitized: TemplateContext = {};
  
  for (const [key, value] of Object.entries(context)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeTemplateVariable(value);
    } else if (typeof value === 'object' && value !== null) {
      // Recursively sanitize nested objects
      sanitized[key] = sanitizeTemplateContext(value as TemplateContext);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}

/**
 * Renders a handlebars template with the given context
 * This is the main entry point for all template processing
 */
export function renderTemplate(source: string, context: TemplateContext): string {
  try {
    const template = compileTemplate(source);
    const sanitizedContext = sanitizeTemplateContext(context);
    const rendered = template(sanitizedContext);
    
    // Clean up any remaining handlebars expressions that didn't resolve
    // This prevents template syntax from being sent to AI models
    const cleaned = rendered.replace(/\{\{[^{}]*\}\}/g, '').trim();
    
    return cleaned;
  } catch (error) {
    console.error('[Template Engine] Error rendering template:', error);
    console.error('[Template Engine] Template source:', source.substring(0, 200) + '...');
    console.error('[Template Engine] Context keys:', Object.keys(context));
    
    // Return original source with handlebars stripped as fallback
    return source.replace(/\{\{[^{}]*\}\}/g, '').trim();
  }
}

/**
 * Clears the template cache (useful for development/testing)
 */
export function clearTemplateCache(): void {
  templateCache.clear();
} 