/**
 * Comprehensive HTML sanitization utilities using DOMPurify
 * Prevents XSS attacks in user-generated content and AI outputs
 */

import DOMPurify from 'dompurify';

// Configuration for different sanitization levels
const DEFAULT_CONFIG: DOMPurify.Config = {
  // Allow only safe HTML elements and attributes
  ALLOWED_TAGS: [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'p', 'div', 'span', 'br', 'hr',
    'strong', 'b', 'em', 'i', 'u', 's',
    'ul', 'ol', 'li',
    'blockquote', 'pre', 'code',
    'a', 'img',
    'table', 'thead', 'tbody', 'tr', 'td', 'th',
    'sup', 'sub',
    'mark', 'small'
  ],
  ALLOWED_ATTR: [
    'href', 'src', 'alt', 'title', 'class', 'id',
    'target', 'rel', 'width', 'height',
    'style', 'data-*'
  ],
  // Remove all scripts and event handlers
  FORBID_TAGS: ['script', 'object', 'embed', 'applet', 'meta', 'link'],
  FORBID_ATTR: ['onclick', 'onload', 'onerror', 'onmouseover', 'onmouseout'],
  // Allow data URIs for images but not javascript
  ALLOW_DATA_ATTR: true,
  // Sanitize CSS
  SANITIZE_CSS: true,
  // Remove empty elements
  REMOVE_EMPTY_ELEMENTS: true,
  // Keep relative URLs
  KEEP_CONTENT: true,
  // Return a clean DOM
  RETURN_DOM: false,
  RETURN_DOM_FRAGMENT: false,
  RETURN_TRUSTED_TYPE: false
};

const STRICT_CONFIG: DOMPurify.Config = {
  // Very restrictive for untrusted content
  ALLOWED_TAGS: [
    'p', 'br', 'strong', 'em', 'u', 's',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li',
    'blockquote', 'code'
  ],
  ALLOWED_ATTR: ['class'],
  FORBID_TAGS: ['script', 'style', 'link', 'meta', 'img', 'iframe', 'object', 'embed'],
  FORBID_ATTR: ['style', 'onclick', 'onload', 'onerror', 'href', 'src'],
  ALLOW_DATA_ATTR: false,
  SANITIZE_CSS: true,
  REMOVE_EMPTY_ELEMENTS: true,
  KEEP_CONTENT: true
};

const WYSIWYG_CONFIG: DOMPurify.Config = {
  // Configuration for WYSIWYG editors
  ALLOWED_TAGS: [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'p', 'div', 'span', 'br', 'hr',
    'strong', 'b', 'em', 'i', 'u', 's',
    'ul', 'ol', 'li',
    'blockquote', 'pre', 'code',
    'a', 'img',
    'table', 'thead', 'tbody', 'tr', 'td', 'th'
  ],
  ALLOWED_ATTR: [
    'href', 'src', 'alt', 'title', 'class', 'id',
    'target', 'rel', 'width', 'height'
  ],
  FORBID_TAGS: ['script', 'style', 'link', 'meta', 'iframe', 'object', 'embed'],
  FORBID_ATTR: ['onclick', 'onload', 'onerror', 'onmouseover', 'onmouseout', 'style'],
  ALLOW_DATA_ATTR: false,
  SANITIZE_CSS: true,
  REMOVE_EMPTY_ELEMENTS: true,
  KEEP_CONTENT: true
};

/**
 * Sanitize HTML content with default security settings
 * Use this for most user-generated content
 */
export function sanitizeHtml(html: string): string {
  if (!html || typeof html !== 'string') {
    return '';
  }

  try {
    return DOMPurify.sanitize(html, DEFAULT_CONFIG);
  } catch (error) {
    console.error('HTML sanitization failed:', error);
    return '';
  }
}

/**
 * Sanitize HTML content with strict security settings
 * Use this for completely untrusted content
 */
export function sanitizeHtmlStrict(html: string): string {
  if (!html || typeof html !== 'string') {
    return '';
  }

  try {
    return DOMPurify.sanitize(html, STRICT_CONFIG);
  } catch (error) {
    console.error('Strict HTML sanitization failed:', error);
    return '';
  }
}

/**
 * Sanitize HTML content for WYSIWYG editors
 * Allows more formatting but removes dangerous elements
 */
export function sanitizeHtmlWysiwyg(html: string): string {
  if (!html || typeof html !== 'string') {
    return '';
  }

  try {
    return DOMPurify.sanitize(html, WYSIWYG_CONFIG);
  } catch (error) {
    console.error('WYSIWYG HTML sanitization failed:', error);
    return '';
  }
}

/**
 * Sanitize text input to prevent injection attacks
 * Removes HTML tags and dangerous characters
 */
export function sanitizeTextInput(text: string): string {
  if (!text || typeof text !== 'string') {
    return '';
  }

  try {
    // Remove all HTML tags and dangerous characters
    const sanitized = DOMPurify.sanitize(text, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
      KEEP_CONTENT: true,
      REMOVE_EMPTY_ELEMENTS: false
    });

    // Additional cleanup for template injection
    return sanitized
      .replace(/\{\{.*?\}\}/g, '') // Remove Handlebars syntax
      .replace(/\$\{.*?\}/g, '') // Remove template literals
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove any remaining scripts
      .trim();
  } catch (error) {
    console.error('Text sanitization failed:', error);
    return '';
  }
}

/**
 * Sanitize AI-generated content
 * Specifically designed for content coming from AI models
 */
export function sanitizeAiContent(content: string): string {
  if (!content || typeof content !== 'string') {
    return '';
  }

  try {
    // First pass: basic sanitization
    let sanitized = DOMPurify.sanitize(content, DEFAULT_CONFIG);
    
    // Remove common AI artifacts that could be exploited
    sanitized = sanitized
      .replace(/```[\s\S]*?```/g, '') // Remove code blocks
      .replace(/`[^`]*`/g, '') // Remove inline code
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/vbscript:/gi, '') // Remove vbscript: protocol
      .replace(/data:text\/html/gi, '') // Remove data:text/html
      .replace(/data:application\/javascript/gi, '') // Remove data:application/javascript
      .replace(/\bon\w+\s*=/gi, '') // Remove event handlers
      .trim();

    return sanitized;
  } catch (error) {
    console.error('AI content sanitization failed:', error);
    return '';
  }
}

/**
 * Sanitize URLs to prevent XSS in href attributes
 */
export function sanitizeUrl(url: string): string {
  if (!url || typeof url !== 'string') {
    return '';
  }

  try {
    // Allow only safe protocols
    const safeProtocols = ['http:', 'https:', 'mailto:', 'tel:'];
    
    // Remove javascript: and other dangerous protocols
    const cleanUrl = url.replace(/javascript:/gi, '').replace(/vbscript:/gi, '');
    
    // Check if URL has a safe protocol
    const hasProtocol = cleanUrl.includes('://');
    if (hasProtocol) {
      const protocol = cleanUrl.split('://')[0].toLowerCase() + ':';
      if (!safeProtocols.includes(protocol)) {
        return '';
      }
    }
    
    return cleanUrl;
  } catch (error) {
    console.error('URL sanitization failed:', error);
    return '';
  }
}

/**
 * Sanitize file content from uploads
 * Removes potentially dangerous content from uploaded files
 */
export function sanitizeFileContent(content: string, fileType: string): string {
  if (!content || typeof content !== 'string') {
    return '';
  }

  try {
    switch (fileType.toLowerCase()) {
      case 'html':
      case 'htm':
        return sanitizeHtmlStrict(content);
      
      case 'txt':
      case 'text':
        return sanitizeTextInput(content);
      
      case 'md':
      case 'markdown':
        // For markdown, we need to be careful with HTML blocks
        return sanitizeHtml(content);
      
      default:
        // For unknown file types, use strict text sanitization
        return sanitizeTextInput(content);
    }
  } catch (error) {
    console.error('File content sanitization failed:', error);
    return '';
  }
}

/**
 * Validate and sanitize template variables
 * Prevents template injection attacks
 */
export function sanitizeTemplateVariable(value: string): string {
  if (!value || typeof value !== 'string') {
    return '';
  }

  try {
    // Remove template syntax and dangerous patterns
    return value
      .replace(/\{\{.*?\}\}/g, '') // Handlebars
      .replace(/\$\{.*?\}/g, '') // Template literals
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Scripts
      .replace(/javascript:/gi, '') // JavaScript protocol
      .replace(/vbscript:/gi, '') // VBScript protocol
      .replace(/\bon\w+\s*=/gi, '') // Event handlers
      .trim();
  } catch (error) {
    console.error('Template variable sanitization failed:', error);
    return '';
  }
}

/**
 * Security audit function to check for potential XSS vulnerabilities
 * Returns warnings for content that might be dangerous
 */
export function auditContent(content: string): string[] {
  const warnings: string[] = [];
  
  if (!content || typeof content !== 'string') {
    return warnings;
  }

  // Check for script tags
  if (/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi.test(content)) {
    warnings.push('Contains script tags');
  }

  // Check for event handlers
  if (/\bon\w+\s*=/gi.test(content)) {
    warnings.push('Contains event handlers');
  }

  // Check for dangerous protocols
  if (/javascript:/gi.test(content) || /vbscript:/gi.test(content)) {
    warnings.push('Contains dangerous protocols');
  }

  // Check for template injection patterns
  if (/\{\{.*?\}\}/g.test(content) || /\$\{.*?\}/g.test(content)) {
    warnings.push('Contains template injection patterns');
  }

  // Check for HTML injection
  if (/<[^>]+>/g.test(content)) {
    warnings.push('Contains HTML elements');
  }

  return warnings;
}

/**
 * Helper function to determine if content is safe
 */
export function isContentSafe(content: string): boolean {
  const warnings = auditContent(content);
  return warnings.length === 0;
}

/**
 * Create a secure HTML element from sanitized content
 * Returns an object that can be used with dangerouslySetInnerHTML safely
 */
export function createSafeHtml(content: string, strict: boolean = false): { __html: string } {
  const sanitized = strict ? sanitizeHtmlStrict(content) : sanitizeHtml(content);
  return { __html: sanitized };
}

/**
 * Create safe HTML for WYSIWYG editors
 */
export function createSafeWysiwygHtml(content: string): { __html: string } {
  const sanitized = sanitizeHtmlWysiwyg(content);
  return { __html: sanitized };
}