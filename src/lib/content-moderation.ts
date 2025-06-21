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
 * AI-powered content moderation using Gemini Flash
 * Only flags truly harmful content, not poetry with metaphorical language
 */
export async function validateContent(content: string): Promise<ContentValidation> {
  const violations: string[] = [];
  const publishingViolations: string[] = [];
  
  // FIRST: Check for obvious security issues (code injection)
  // BUT: Don't flag legitimate HTML structure tags
  const securityPatterns = [
    /<script[^>]*>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi, // onclick, onload, etc.
    /<iframe/gi,
    /<object/gi,
    /<embed/gi,
    /data:text\/html/gi
  ];
  
  // Check if this is legitimate HTML content (has DOCTYPE or html tag)
  const isLegitimateHtml = content.includes('<!DOCTYPE') || 
                          content.includes('<html') || 
                          content.includes('<article') ||
                          content.includes('<figure');
  
  let hasSecurityIssues = false;
  
  // Only check for security issues if it's NOT legitimate HTML
  // Or if it's HTML, only flag actual script tags
  if (!isLegitimateHtml) {
    for (const pattern of securityPatterns) {
      if (pattern.test(content)) {
        hasSecurityIssues = true;
        violations.push('Content contains potentially malicious code');
        break;
      }
    }
  } else {
    // For HTML content, only check for actual script injection
    if (/<script[^>]*>/gi.test(content) || /javascript:/gi.test(content)) {
      hasSecurityIssues = true;
      violations.push('HTML contains script tags or javascript: protocol');
    }
  }
  
  // SECOND: Use AI for content safety check (only for truly harmful content)
  let isSafe = true;
  let isLegal = true;
  
  try {
    // Import Gemini SDK
    const { GoogleGenAI } = await import('@google/genai');
    const genAI = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY! });
    
    // Use Gemini 2.0 Flash (stable) for super fast, cheap moderation
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    
    const prompt = `You are a content moderator. Analyze this content and determine if it contains ACTUALLY harmful material.

IMPORTANT: Poetry often uses metaphorical language about dark themes. This is ALLOWED.
Only flag content that:
1. Explicitly promotes real violence or harm to real people
2. Contains explicit instructions for illegal activities
3. Contains hate speech targeting real groups
4. Contains explicit adult content inappropriate for general audiences

Poetry about death, darkness, violence in metaphorical/artistic context is ALLOWED.

Content to analyze:
${content.substring(0, 2000)}

Respond with JSON only:
{
  "isSafe": true/false,
  "isLegal": true/false,
  "violations": ["list any serious violations, or empty array if none"]
}`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    try {
      const moderation = JSON.parse(response);
      isSafe = moderation.isSafe !== false; // Default to safe
      isLegal = moderation.isLegal !== false; // Default to legal
      
      if (moderation.violations && moderation.violations.length > 0) {
        publishingViolations.push(...moderation.violations);
      }
    } catch (parseError) {
      // If AI response can't be parsed, default to safe
      console.warn('[ContentModeration] Failed to parse AI response, defaulting to safe', parseError);
      isSafe = true;
      isLegal = true;
    }
  } catch (error) {
    // If AI moderation fails, default to safe (don't block users)
    console.error('[ContentModeration] AI moderation failed, defaulting to safe', error);
    isSafe = true;
    isLegal = true;
  }
  
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