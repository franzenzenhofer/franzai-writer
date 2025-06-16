/**
 * Centralized AI Content Cleaner
 * 
 * This module provides utility functions to clean AI-generated content,
 * removing code fences and markdown formatting at the source.
 * 
 * Following DRY (Don't Repeat Yourself) and KISS (Keep It Simple, Stupid) principles.
 */

/**
 * Clean AI response content by removing code fences and markdown formatting
 * This is the universal cleaner that should be used for ALL AI responses.
 */
export function cleanAiResponse(content: string, outputType: 'html' | 'text' | 'json' | 'markdown' = 'text'): string {
  if (!content || typeof content !== 'string') {
    return content;
  }

  let cleaned = content;

  // Remove code fences (this is the main issue the user is experiencing)
  cleaned = removeCodeFences(cleaned, outputType);

  // Additional cleaning based on output type
  switch (outputType) {
    case 'html':
      cleaned = cleanHtmlResponse(cleaned);
      break;
    case 'json':
      cleaned = cleanJsonResponse(cleaned);
      break;
    case 'markdown':
      cleaned = cleanMarkdownResponse(cleaned);
      break;
    case 'text':
    default:
      cleaned = cleanTextResponse(cleaned);
      break;
  }

  return cleaned.trim();
}

/**
 * Remove code fences from AI responses (core function addressing the user's issue)
 */
function removeCodeFences(content: string, outputType: string): string {
  // Remove HTML code fences
  content = content.replace(/^```html\s*/gmi, '');
  content = content.replace(/^```htm\s*/gmi, '');
  
  // Remove JSON code fences
  content = content.replace(/^```json\s*/gmi, '');
  
  // Remove markdown code fences
  content = content.replace(/^```markdown\s*/gmi, '');
  content = content.replace(/^```md\s*/gmi, '');
  
  // Remove generic code fences
  content = content.replace(/^```\w*\s*/gm, '');
  content = content.replace(/```\s*$/gm, '');
  content = content.replace(/^```\s*/gm, '');
  
  // Remove standalone language markers
  content = content.replace(/^\s*(html|json|markdown|md)\s*$/gm, '');
  
  return content;
}

/**
 * Clean HTML responses specifically
 */
function cleanHtmlResponse(content: string): string {
  // Clean up DOCTYPE formatting
  content = content.replace(/^[\s]*<!DOCTYPE html>/gm, '<!DOCTYPE html>');
  
  // Remove any remaining markdown artifacts
  content = content.replace(/^\*\*(.*?)\*\*$/gm, '<strong>$1</strong>');
  content = content.replace(/^\*(.*?)\*$/gm, '<em>$1</em>');
  
  return content;
}

/**
 * Clean JSON responses
 */
function cleanJsonResponse(content: string): string {
  // Remove any trailing commas that might break JSON
  content = content.replace(/,(\s*[}\]])/g, '$1');
  
  return content;
}

/**
 * Clean markdown responses
 */
function cleanMarkdownResponse(content: string): string {
  // Ensure proper spacing between elements
  content = content.replace(/\n{3,}/g, '\n\n');
  
  return content;
}

/**
 * Clean text responses
 */
function cleanTextResponse(content: string): string {
  // Remove excessive whitespace
  content = content.replace(/\n{3,}/g, '\n\n');
  content = content.replace(/[ \t]+$/gm, '');
  
  return content;
}

/**
 * Legacy compatibility - alias for cleanAiResponse with HTML type
 * This maintains compatibility with existing code
 */
export function cleanAiHtmlOutput(content: string): string {
  return cleanAiResponse(content, 'html');
} 