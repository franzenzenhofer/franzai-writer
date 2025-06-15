'use server';

import { generateWithDirectGemini } from '@/ai/direct-gemini';
import type { Stage, StageState, ExportConfig } from '@/types';
import fs from 'fs/promises';
import path from 'path';

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
    
    // Step 1: Generate styled HTML
    const styledHtml = await generateStyledHtml(stages, stageStates, exportConfig, workflowType);
    
    // Step 2: Generate clean HTML
    const cleanHtml = await generateCleanHtml(stages, stageStates, exportConfig, workflowType);
    
    console.log('[AI HTML Generator] HTML generation completed successfully');
    
    return {
      htmlStyled: styledHtml,
      htmlClean: cleanHtml,
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
  
  return result.content;
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
  
  return result.content;
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

## Requirements
1. Create a complete, self-contained HTML document
2. Include all styles inline in <style> tags
3. Use beautiful typography and spacing
4. Make it fully responsive
5. Include print styles
6. Add subtle animations
7. Ensure high contrast and accessibility
8. Include proper meta tags and SEO

Generate the complete HTML document now.`;
}

/**
 * Default clean HTML prompt template
 */
function getDefaultCleanHtmlPrompt(): string {
  return `You are an expert in semantic HTML. Create perfectly structured HTML optimized for CMS compatibility.

## Content to Structure
{{#each stages}}
{{this}}
{{/each}}

## Requirements
1. Use ONLY semantic HTML5 elements
2. NO inline styles or JavaScript
3. Proper heading hierarchy (h1-h6)
4. Clean, predictable structure
5. Include semantic attributes (id, aria-labels)
6. Start with content directly (no html/head/body tags)

Generate clean, semantic HTML now.`;
}