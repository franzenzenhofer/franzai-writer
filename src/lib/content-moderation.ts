/**
 * Content Moderation Service
 * Validates content for security, legality, and publishing standards
 */

export interface ContentValidation {
  isLegal: boolean;           // No illegal content
  isSafe: boolean;            // No harmful content  
  hasSecurityIssues: boolean; // No XSS, malicious code
  publishingViolations: string[]; // List any violations
  passed: boolean;            // Overall validation result
  violations: string[];       // All violations found
}

/**
 * Basic content moderation to prevent publishing harmful material
 * This is a simple implementation - in production, consider using
 * a proper content moderation API service
 */
export async function validateContent(content: string): Promise<ContentValidation> {
  const violations: string[] = [];
  const publishingViolations: string[] = [];
  
  // Check for obvious security issues
  const securityPatterns = [
    /<script[^>]*>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi, // onclick, onload, etc.
    /<iframe/gi,
    /<object/gi,
    /<embed/gi,
    /data:text\/html/gi
  ];
  
  let hasSecurityIssues = false;
  for (const pattern of securityPatterns) {
    if (pattern.test(content)) {
      hasSecurityIssues = true;
      violations.push('Content contains potentially malicious code');
      break;
    }
  }
  
  // Check for harmful content patterns (basic check)
  const harmfulPatterns = [
    /\b(violence|harm|illegal|criminal)\b/gi,
    /\b(dangerous|weapon|explosive)\b/gi,
    /\b(hate|discrimination|harassment)\b/gi
  ];
  
  let isSafe = true;
  for (const pattern of harmfulPatterns) {
    const matches = content.match(pattern);
    if (matches && matches.length > 2) { // Allow some words in poetry context
      isSafe = false;
      publishingViolations.push(`Content may contain harmful material: ${matches[0]}`);
    }
  }
  
  // For now, assume content is legal unless it has security issues
  const isLegal = !hasSecurityIssues;
  
  // Compile all violations
  if (!isLegal) violations.push('Content may contain illegal elements');
  if (!isSafe) violations.push(...publishingViolations);
  if (hasSecurityIssues) violations.push('Security vulnerabilities detected');
  
  return {
    isLegal,
    isSafe,
    hasSecurityIssues,
    publishingViolations,
    passed: isLegal && isSafe && !hasSecurityIssues,
    violations
  };
}

/**
 * Sanitize HTML content to remove dangerous elements
 * while preserving safe formatting
 */
export function sanitizeHtml(html: string): string {
  // Remove script tags and their content
  html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove event handlers
  html = html.replace(/\son\w+\s*=\s*["'][^"']*["']/gi, '');
  html = html.replace(/\son\w+\s*=\s*[^\s>]+/gi, '');
  
  // Remove javascript: protocol
  html = html.replace(/javascript:/gi, '');
  
  // Remove dangerous tags
  const dangerousTags = ['script', 'iframe', 'object', 'embed', 'form', 'input', 'textarea', 'button'];
  dangerousTags.forEach(tag => {
    const regex = new RegExp(`<${tag}[^>]*>.*?</${tag}>`, 'gi');
    html = html.replace(regex, '');
    html = html.replace(new RegExp(`<${tag}[^>]*>`, 'gi'), '');
  });
  
  return html;
}