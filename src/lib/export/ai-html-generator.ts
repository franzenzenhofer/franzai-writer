'use server';

import { generateWithDirectGemini } from '@/ai/direct-gemini';
import type { Stage, StageState, ExportConfig } from '@/types';
import fs from 'fs/promises';
import path from 'path';
import { cleanAiResponse } from '@/lib/ai-content-cleaner';

export interface HtmlGenerationOptions {
  stages: Stage[];
  stageStates: Record<string, StageState>;
  exportConfig?: ExportConfig;
  workflowType?: string;
  progressCallback?: (progress: { styledHtml?: number; cleanHtml?: number; currentFormat?: string }) => void;
}

export interface HtmlGenerationResult {
  htmlStyled: string;
  htmlClean: string;
  error?: string;
}

/**
 * Generate both styled and clean HTML using dual AI passes
 */
export async function generateExportHtml(options: HtmlGenerationOptions): Promise<HtmlGenerationResult> {
  const { stages, stageStates, exportConfig, workflowType } = options;
  
  try {
    console.log('[AI HTML Generator] Starting HTML generation');
    
    // Extract a title for the document
    const title = extractTitle(stages, stageStates, workflowType);

    // Step 1: Generate styled HTML
    const styledHtmlBody = await generateStyledHtml(stages, stageStates, exportConfig, workflowType);
    const fullStyledHtml = createFullHtmlDocument(title, styledHtmlBody);
    
    // Step 2: Generate clean HTML
    const cleanHtmlBody = await generateCleanHtml(stages, stageStates, exportConfig, workflowType);
    const fullCleanHtml = createFullHtmlDocument(title, cleanHtmlBody);
    
    console.log('[AI HTML Generator] HTML generation completed successfully');
    
    return {
      htmlStyled: fullStyledHtml,
      htmlClean: fullCleanHtml,
    };
  } catch (error) {
    console.error('[AI HTML Generator] Error:', error);
    return {
      htmlStyled: '',
      htmlClean: '',
      error: error instanceof Error ? error.message : 'Failed to generate HTML',
    };
  }
}

/**
 * Generate styled HTML with beautiful formatting
 */
async function generateStyledHtml(
  stages: Stage[],
  stageStates: Record<string, StageState>,
  exportConfig?: ExportConfig,
  workflowType?: string
): Promise<string> {
  
  // Load the styled HTML template
  const templatePath = path.join(process.cwd(), 'src/workflows', workflowType || 'default', 'prompts/html-styled-template.md');
  let promptTemplate: string;
  
  try {
    promptTemplate = await fs.readFile(templatePath, 'utf-8');
  } catch {
    // Use default template if workflow-specific template doesn't exist
    promptTemplate = getDefaultStyledHtmlPrompt();
  }
  
  // Prepare content for AI
  const contentSections = stages
    .filter(stage => stageStates[stage.id]?.status === 'completed' && stageStates[stage.id]?.output)
    .map(stage => ({
      stageName: stage.title,
      stageId: stage.id,
      content: formatStageOutput(stageStates[stage.id].output),
    }));
  
  // Build the AI prompt
  const prompt = promptTemplate
    .replace('{{workflow.type}}', workflowType || 'content')
    .replace('{{workflow.audience}}', 'general readers')
    .replace('{{#each stages}}', contentSections.map(section => 
      `### ${section.stageName}\n${section.content}`
    ).join('\n\n'))
    .replace('{{/each}}', '');
  
  console.log('[AI HTML Generator] Generating styled HTML with AI');
  
  // Generate HTML with AI
  const result = await generateWithDirectGemini({
    model: exportConfig?.aiModel || 'gemini-2.0-flash',
    temperature: exportConfig?.temperature ?? 0.3,
    prompt,
    systemInstruction: 'You are an expert web designer creating beautiful HTML documents.',
  });
  
  if (!result.content) {
    throw new Error('AI failed to generate styled HTML');
  }
  
  // Clean HTML output - remove code fences and markdown formatting
  return cleanAiResponse(result.content, 'html');
}

/**
 * Generate clean semantic HTML for CMS compatibility
 */
async function generateCleanHtml(
  stages: Stage[],
  stageStates: Record<string, StageState>,
  exportConfig?: ExportConfig,
  workflowType?: string
): Promise<string> {
  
  // Load the clean HTML template
  const templatePath = path.join(process.cwd(), 'src/workflows', workflowType || 'default', 'prompts/html-clean-template.md');
  let promptTemplate: string;
  
  try {
    promptTemplate = await fs.readFile(templatePath, 'utf-8');
  } catch {
    // Use default template if workflow-specific template doesn't exist
    promptTemplate = getDefaultCleanHtmlPrompt();
  }
  
  // Prepare content for AI
  const contentSections = stages
    .filter(stage => stageStates[stage.id]?.status === 'completed' && stageStates[stage.id]?.output)
    .map(stage => ({
      stageName: stage.title,
      stageId: stage.id,
      content: formatStageOutput(stageStates[stage.id].output),
    }));
  
  // Build the AI prompt
  const prompt = promptTemplate
    .replace('{{#each stages}}', contentSections.map(section => 
      `### ${section.stageName}\n${section.content}`
    ).join('\n\n'))
    .replace('{{/each}}', '');
  
  console.log('[AI HTML Generator] Generating clean HTML with AI');
  
  // Generate HTML with AI
  const result = await generateWithDirectGemini({
    model: exportConfig?.aiModel || 'gemini-2.0-flash',
    temperature: exportConfig?.temperature ?? 0.3,
    prompt,
    systemInstruction: 'You are an expert in semantic HTML and document structure.',
  });
  
  if (!result.content) {
    throw new Error('AI failed to generate clean HTML');
  }
  
  // Clean HTML output - remove code fences and markdown formatting
  return cleanAiResponse(result.content, 'html');
}

/**
 * Format stage output for AI consumption
 */
function formatStageOutput(output: any): string {
  if (typeof output === 'string') {
    return output;
  }
  
  if (typeof output === 'object' && output !== null) {
    // Handle JSON output with potential structure
    if (output.content) {
      return formatStageOutput(output.content);
    }
    
    // Handle array output
    if (Array.isArray(output)) {
      return output.map(item => formatStageOutput(item)).join('\n\n');
    }
    
    // Convert object to readable format
    return Object.entries(output)
      .map(([key, value]) => `${key}: ${formatStageOutput(value)}`)
      .join('\n');
  }
  
  return String(output);
}

/**
 * Default styled HTML prompt template
 */
function getDefaultStyledHtmlPrompt(): string {
  return `You are a world-class web designer creating a stunning HTML document.

## Content to Format
{{#each stages}}
{{this}}
{{/each}}

## CRITICAL OUTPUT INSTRUCTIONS
- Return ONLY the complete HTML document
- DO NOT wrap in code fences (no \`\`\`html or \`\`\`)
- DO NOT use markdown formatting
- Start directly with <!DOCTYPE html>
- End directly with </html>

## Requirements
1. Create a complete, self-contained HTML document
2. Include all styles inline in <style> tags
3. Use beautiful typography and spacing
4. Make it fully responsive
5. Include print styles
6. Add subtle animations
7. Ensure high contrast and accessibility
8. Include proper meta tags and SEO

Generate the complete HTML document now. Return ONLY HTML, no markdown.`;
}

/**
 * Default clean HTML prompt template
 */
function getDefaultCleanHtmlPrompt(): string {
  return `You are an expert in pure semantic HTML, creating complete documents with perfect structure for CMS import and accessibility.

## Content to Structure
{{#each stages}}
{{this}}
{{/each}}

## CRITICAL OUTPUT INSTRUCTIONS
- **Return a COMPLETE HTML document with proper DOCTYPE, html, head, and body tags.**
- **Include proper meta tags, title, and other head elements.**
- **The body content must use ONLY pure semantic HTML.**
- **DO NOT use ANY CSS classes, id attributes, or style attributes in the body.**
- **DO NOT include any <style> tags or CSS code.**
- **DO NOT include any <script> tags or JavaScript.**
- **DO NOT wrap the output in code fences (e.g., \`\`\`html).**
- **Start the body content with the main content element.**

## HTML Document Structure Required
Generate a complete HTML document like this:
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>[Content Title]</title>
  <meta name="description" content="[Brief description]">
</head>
<body>
  <article>
    [Pure semantic HTML content here]
  </article>
</body>
</html>

## Requirements for Pure Semantic HTML

### Head Section Requirements
- Include proper DOCTYPE declaration
- Set charset to UTF-8
- Include viewport meta tag for responsive design
- Set appropriate title from content
- Include meta description
- Use semantic lang attribute

### Body Content Structure
1. **Structure:** Use only semantic HTML5 tags in the body:
   - <article> for the main content wrapper
   - <header> for introductory content
   - <main> for primary content
   - <section> for logical content divisions
   - <h1>, <h2>, <h3>, etc. for headings (proper hierarchy)
   - <p> for paragraphs
   - <ul>, <ol>, <li> for lists
   - <blockquote> for quotes
   - <figure>, <figcaption> for figures
   - <strong>, <em> for emphasis
   - <time> for dates
   - <address> for contact information

2. **Body Purity Requirements:**
   - NO class attributes in body content
   - NO id attributes in body content (except for accessibility where absolutely necessary)
   - NO style attributes in body content
   - NO custom attributes in body content
   - NO inline CSS in body content
   - NO JavaScript in body content
   - NO external dependencies in body content

3. **Content Structure in Body:**
   - Start with <article> as the main wrapper
   - Use proper heading hierarchy (only one <h1>)
   - Group related content in <section> elements
   - Use semantic markup for all content types

4. **Accessibility:**
   - Proper heading hierarchy in body
   - Meaningful semantic structure in body
   - Standard HTML elements only in body

## Goal
Create a complete HTML document where:
1. The full document works perfectly as a standalone HTML file
2. The body content works perfectly in any CMS without styling conflicts
3. The body converts flawlessly to markdown
4. It's fully accessible to screen readers
5. It requires no cleanup before use
6. It follows web standards perfectly

Generate the complete HTML document now. Return ONLY the HTML document, no markdown, no code fences.`;
}

/**
 * Creates a complete HTML document from body content and a title.
 */
function createFullHtmlDocument(title: string, bodyContent: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body>
  ${bodyContent}
</body>
</html>`;
}

/**
 * Extracts the title from the content, defaulting to the workflow type.
 */
function extractTitle(
  stages: Stage[], 
  stageStates: Record<string, StageState>, 
  workflowType?: string
): string {
  // Attempt to find a title in the stage outputs
  for (const stage of stages) {
    const output = stageStates[stage.id]?.output;
    if (output) {
      if (typeof output === 'object' && output.title) {
        return output.title;
      }
      if (typeof output === 'string') {
        // Look for the first line that looks like a title
        const lines = output.split('\\n');
        const firstLine = lines[0].trim();
        // Simple heuristic: if it's short and doesn't end with a period, it might be a title.
        if (firstLine.length > 0 && firstLine.length < 80 && !firstLine.endsWith('.')) {
          return firstLine;
        }
      }
    }
  }
  return workflowType ? workflowType.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Untitled Document';
}