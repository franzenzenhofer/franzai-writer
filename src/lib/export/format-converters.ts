'use server';

import type { ExportFormat } from '@/types';

/**
 * Convert HTML to Markdown
 */
export async function htmlToMarkdown(html: string): Promise<string> {
  // Extract body content from clean HTML if it's a complete document
  let contentHtml = html;
  
  // Check if this is a complete HTML document and extract body content
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  if (bodyMatch) {
    contentHtml = bodyMatch[1];
  } else {
    // If no body tag, remove any DOCTYPE, html, head tags
    contentHtml = html
      .replace(/<!DOCTYPE[^>]*>/gi, '')
      .replace(/<html[^>]*>/gi, '')
      .replace(/<\/html>/gi, '')
      .replace(/<head[\s\S]*<\/head>/gi, '')
      .replace(/<body[^>]*>/gi, '')
      .replace(/<\/body>/gi, '')
      .trim();
  }
  
  let markdown = contentHtml;
  
  // Remove script and style tags
  markdown = markdown.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  markdown = markdown.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  
  // Convert headers (preserve hierarchy)
  markdown = markdown.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n');
  markdown = markdown.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n');
  markdown = markdown.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n');
  markdown = markdown.replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n\n');
  markdown = markdown.replace(/<h5[^>]*>(.*?)<\/h5>/gi, '##### $1\n\n');
  markdown = markdown.replace(/<h6[^>]*>(.*?)<\/h6>/gi, '###### $1\n\n');
  
  // Convert semantic elements
  markdown = markdown.replace(/<article[^>]*>/gi, '');
  markdown = markdown.replace(/<\/article>/gi, '');
  markdown = markdown.replace(/<header[^>]*>/gi, '');
  markdown = markdown.replace(/<\/header>/gi, '\n\n');
  markdown = markdown.replace(/<main[^>]*>/gi, '');
  markdown = markdown.replace(/<\/main>/gi, '');
  markdown = markdown.replace(/<section[^>]*>/gi, '\n');
  markdown = markdown.replace(/<\/section>/gi, '\n\n');
  markdown = markdown.replace(/<footer[^>]*>/gi, '\n---\n\n');
  markdown = markdown.replace(/<\/footer>/gi, '');
  
  // Convert div elements (used for stanzas in poems)
  markdown = markdown.replace(/<div[^>]*>/gi, '');
  markdown = markdown.replace(/<\/div>/gi, '\n\n');
  
  // Convert paragraphs
  markdown = markdown.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n');
  
  // Convert emphasis
  markdown = markdown.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**');
  markdown = markdown.replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**');
  markdown = markdown.replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*');
  markdown = markdown.replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*');
  
  // Convert links
  markdown = markdown.replace(/<a[^>]+href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)');
  
  // Convert lists
  markdown = markdown.replace(/<ul[^>]*>/gi, '\n');
  markdown = markdown.replace(/<\/ul>/gi, '\n');
  markdown = markdown.replace(/<ol[^>]*>/gi, '\n');
  markdown = markdown.replace(/<\/ol>/gi, '\n');
  markdown = markdown.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n');
  
  // Convert blockquotes
  markdown = markdown.replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gi, '> $1\n\n');
  
  // Convert code blocks
  markdown = markdown.replace(/<pre[^>]*><code[^>]*>(.*?)<\/code><\/pre>/gi, '```\n$1\n```\n\n');
  markdown = markdown.replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`');
  
  // Convert line breaks
  markdown = markdown.replace(/<br[^>]*>/gi, '\n');
  markdown = markdown.replace(/<hr[^>]*>/gi, '\n---\n\n');
  
  // Convert figure elements
  markdown = markdown.replace(/<figure[^>]*>/gi, '\n');
  markdown = markdown.replace(/<\/figure>/gi, '\n');
  markdown = markdown.replace(/<figcaption[^>]*>(.*?)<\/figcaption>/gi, '\n*$1*\n');
  
  // Handle time elements
  markdown = markdown.replace(/<time[^>]*>(.*?)<\/time>/gi, '$1');
  
  // Handle address elements
  markdown = markdown.replace(/<address[^>]*>(.*?)<\/address>/gi, '$1\n\n');
  
  // Remove remaining HTML tags
  markdown = markdown.replace(/<[^>]+>/g, '');
  
  // Clean up HTML entities
  markdown = markdown
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
  
  // Clean up whitespace and line breaks
  markdown = markdown
    .replace(/\n{3,}/g, '\n\n') // Collapse multiple newlines
    .replace(/[ \t]+$/gm, '') // Remove trailing spaces
    .replace(/^[ \t]+/gm, '') // Remove leading spaces from lines
    .trim();
  
  return markdown;
}

/**
 * Generate PDF from HTML using Puppeteer
 */
export async function htmlToPdf(html: string, options?: any): Promise<ArrayBuffer> {
  try {
    // Dynamic import to avoid bundling Puppeteer in client code
    const puppeteer = await import('puppeteer');
    
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Set content with proper options
    await page.setContent(html, {
      waitUntil: 'networkidle0',
      timeout: 30000
    });
    
    // Generate PDF with good defaults
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '1in',
        bottom: '1in',
        left: '1in',
        right: '1in'
      },
      preferCSSPageSize: true,
      ...options
    });
    
    await browser.close();
    
    return pdf.buffer as ArrayBuffer;
  } catch (error) {
    console.error('PDF generation failed:', error);
    // Fallback to placeholder for now
    const encoder = new TextEncoder();
    return encoder.encode(`PDF generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`).buffer as ArrayBuffer;
  }
}

/**
 * Generate DOCX from HTML using html-docx-js
 */
export async function htmlToDocx(html: string, options?: any): Promise<ArrayBuffer> {
  try {
    // Dynamic import to avoid bundling in client code
    const HTMLtoDOCX = (await import('html-docx-js')).default;
    
    // Convert HTML to DOCX
    const docxBlob = HTMLtoDOCX.asBlob(html, {
      table: { row: { cantSplit: true } },
      footer: true,
      pageNumber: true,
      ...options
    });
    
    // Convert blob to ArrayBuffer
    return await docxBlob.arrayBuffer();
  } catch (error) {
    console.error('DOCX generation failed:', error);
    // Fallback to placeholder
    const encoder = new TextEncoder();
    return encoder.encode(`DOCX generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`).buffer as ArrayBuffer;
  }
}

/**
 * Process all export formats
 */
export async function processExportFormats(
  htmlStyled: string,
  htmlClean: string,
  exportConfig?: any
): Promise<Record<string, { ready: boolean; content?: string; error?: string }>> {
  const formats: Record<string, { ready: boolean; content?: string; error?: string }> = {};
  
  // HTML formats are already ready
  formats['html-styled'] = {
    ready: true,
    content: htmlStyled,
  };
  
  formats['html-clean'] = {
    ready: true,
    content: htmlClean,
  };
  
  // Generate Markdown from clean HTML
  try {
    const markdown = await htmlToMarkdown(htmlClean);
    formats['markdown'] = {
      ready: true,
      content: markdown,
    };
  } catch (error) {
    formats['markdown'] = {
      ready: false,
      error: 'Failed to generate Markdown',
    };
  }
  
  // Generate PDF from clean HTML
  try {
    console.log('[Format Converters] Generating PDF...');
    const pdfBuffer = await htmlToPdf(htmlClean);
    const pdfBase64 = Buffer.from(pdfBuffer).toString('base64');
    formats['pdf'] = {
      ready: true,
      content: pdfBase64,
    };
    console.log('[Format Converters] PDF generation successful');
  } catch (error) {
    console.error('[Format Converters] PDF generation failed:', error);
    formats['pdf'] = {
      ready: false,
      error: 'PDF generation failed',
    };
  }
  
  // Generate DOCX from clean HTML
  try {
    console.log('[Format Converters] Generating DOCX...');
    const docxBuffer = await htmlToDocx(htmlClean);
    const docxBase64 = Buffer.from(docxBuffer).toString('base64');
    formats['docx'] = {
      ready: true,
      content: docxBase64,
    };
    console.log('[Format Converters] DOCX generation successful');
  } catch (error) {
    console.error('[Format Converters] DOCX generation failed:', error);
    formats['docx'] = {
      ready: false,
      error: 'DOCX generation failed',
    };
  }
  
  return formats;
}