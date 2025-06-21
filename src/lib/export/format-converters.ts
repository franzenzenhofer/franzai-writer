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
 * Generate DOCX from HTML using modern docx library
 * This creates a proper DOCX document from clean HTML content on the server-side only
 */
export async function htmlToDocx(html: string, options?: any): Promise<ArrayBuffer> {
  try {
    // Dynamic import to avoid bundling in client code
    const { Document, Packer, Paragraph, TextRun, HeadingLevel } = await import('docx');
    
    console.log('[DOCX Generator] Starting HTML to DOCX conversion');
    
    // Extract ONLY the body content - ignore title tag to avoid duplication
    let content = html;
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
    if (bodyMatch) {
      content = bodyMatch[1];
    }
    
    // Remove unwanted elements and clean content
    content = content
      // Remove script and style tags
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      // Remove HTML comments
      .replace(/<!--[\s\S]*?-->/g, '')
      // Remove article and header wrapper tags but keep content
      .replace(/<\/?article[^>]*>/gi, '')
      .replace(/<\/?header[^>]*>/gi, '')
      .replace(/<\/?main[^>]*>/gi, '')
      .replace(/<\/?section[^>]*>/gi, '')
      .replace(/<\/?footer[^>]*>/gi, '')
      .trim();
    
    // Collect paragraphs for DOCX
    const paragraphs: any[] = [];
    
    // Regex utilities
    const headingRegex = /<(h[1-6])[^>]*>([\s\S]*?)<\/h[1-6]>/i;
    const imgRegexGlobal = /<img[^>]+src="([^"]+)"[^>]*alt="?([^">]*)"?[^>]*>/gi;
    
    // Split content into blocks on headings, paragraphs and images
    const htmlBlocks = content.split(/(?=<(?:h[1-6]|p|div|img)\b)/i).filter(b => b.trim());
    
    for (const block of htmlBlocks) {
      const trimmedElement = block.trim();
      
      // --- Handle images ---------------------------------------------------
      if (trimmedElement.startsWith('<img')) {
        // Enhanced regex to capture aspect ratio from data attribute
        const imgMatch = /<img[^>]+src="([^"]+)"[^>]*(?:data-aspect-ratio="([^"]*)"[^>]*)?alt="?([^">]*)"?[^>]*>/i.exec(trimmedElement);
        if (imgMatch) {
          const [, src, aspectRatio, alt] = imgMatch;
          try {
            const fetch = (await import('node-fetch')).default as any;
            const response = await fetch(src);
            const arrayBuffer = await response.arrayBuffer();
            const ImageRun = (await import('docx')).ImageRun;
            
            // Calculate dimensions based on aspect ratio
            let transformation: { width: number; height: number };
            
            if (aspectRatio) {
              // Parse aspect ratio (e.g., "16:9", "3:4", "1:1")
              const [widthRatio, heightRatio] = aspectRatio.split(':').map(Number);
              if (widthRatio && heightRatio) {
                const ratio = widthRatio / heightRatio;
                
                // Calculate dimensions maintaining aspect ratio
                // Portrait images get height-constrained, landscape get width-constrained
                let width: number;
                let height: number;
                
                if (ratio < 1) {
                  // Portrait image (taller than wide)
                  height = 600;
                  width = Math.round(height * ratio);
                } else {
                  // Landscape or square image
                  width = 600;
                  height = Math.round(width / ratio);
                }
                
                transformation = { width, height };
                console.log(`[DOCX] Using aspect ratio ${aspectRatio} → ${width}x${height}`);
              } else {
                // Invalid aspect ratio format, use fallback
                transformation = { width: 600, height: 400 };
                console.warn(`[DOCX] Invalid aspect ratio format: ${aspectRatio}`);
              }
            } else {
              // No aspect ratio available, use default
              transformation = { width: 600, height: 400 };
              console.warn('[DOCX] No aspect ratio data attribute found, using default dimensions');
            }
            
            paragraphs.push(
              new Paragraph({
                children: [
                  new ImageRun({
                    type: 'png',
                    data: Buffer.from(arrayBuffer),
                    transformation
                  } as any),
                ],
                spacing: { after: 200 },
              })
            );
            continue;
          } catch (err) {
            console.warn('[DOCX Generator] Failed to embed image, skipping', src, err);
            // fall through to treat as text alt
          }
        }
      }
      
      // --- Handle textual blocks ------------------------------------------
      
      // Extract text content and strip HTML tags
      const textContent = trimmedElement.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      
      if (!textContent) continue;
      
      // Determine heading level and styling
      let headingLevel;
      const headingMatch = headingRegex.exec(trimmedElement);
      if (headingMatch) {
        const tag = headingMatch[1].toLowerCase();
        const { HeadingLevel } = await import('docx');
        const levelNum = tag.substring(1); // Extract number from h1, h2, etc.
        const levelKey = `HEADING_${levelNum}` as keyof typeof HeadingLevel;
        headingLevel = HeadingLevel[levelKey];
      }
      
      paragraphs.push(
        new Paragraph({
          children: [new TextRun({ text: textContent, bold: !!headingLevel })],
          heading: headingLevel,
          spacing: { after: 200 },
        })
      );
    }
    
    // End for blocks loop
    
    // If no content captured, fallback to plain text paragraph
    if (paragraphs.length === 0 && content) {
      paragraphs.push(
        new Paragraph({
          children: [new TextRun({ text: content })],
        })
      );
    }
    
    // Create the document with proper margins and formatting
    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 1440,    // 1 inch
                right: 1440,  // 1 inch
                bottom: 1440, // 1 inch
                left: 1440,   // 1 inch
              },
            },
          },
          children: paragraphs,
        },
      ],
    });
    
    console.log('[DOCX Generator] Converting document to buffer');
    
    // Generate the DOCX buffer
    const buffer = await Packer.toBuffer(doc);
    
    console.log('[DOCX Generator] DOCX generation successful');
    
    return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer;
  } catch (error) {
    console.error('[DOCX Generator] DOCX generation failed:', error);
    // Return a proper error message as a simple text buffer
    const encoder = new TextEncoder();
    const errorMessage = `DOCX generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
    return encoder.encode(errorMessage).buffer as ArrayBuffer;
  }
}

/**
 * Post-process HTML to add data-aspect-ratio attribute to images
 */
function postProcessHtml(html: string, aspectRatio?: string): string {
  if (!aspectRatio) return html;
  
  // Add data-aspect-ratio to all img tags that don't already have it
  return html.replace(
    /<img([^>]+)src="([^"]+)"([^>]*)>/gi,
    (match, before, src, after) => {
      // Check if data-aspect-ratio already exists
      if (match.includes('data-aspect-ratio')) {
        return match;
      }
      // Add data-aspect-ratio attribute
      return `<img${before}src="${src}"${after} data-aspect-ratio="${aspectRatio}">`;
    }
  );
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
  
  // Extract aspect ratio from context if available
  const aspectRatio = exportConfig?.contextVars?.['image-briefing']?.output?.aspectRatio;
  
  // Post-process HTML to include aspect ratio data attributes
  const processedHtmlStyled = postProcessHtml(htmlStyled, aspectRatio);
  const processedHtmlClean = postProcessHtml(htmlClean, aspectRatio);
  
  // HTML formats are already ready
  formats['html-styled'] = {
    ready: true,
    content: processedHtmlStyled,
  };
  
  formats['html-clean'] = {
    ready: true,
    content: processedHtmlClean,
  };
  
  // Generate Markdown from clean HTML
  try {
    const markdown = await htmlToMarkdown(processedHtmlClean);
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
  
  // Generate PDF from styled HTML (with aspect ratio data)
  try {
    console.log('[Format Converters] Generating PDF...');
    const pdfBuffer = await htmlToPdf(processedHtmlStyled);
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
  
  // Generate DOCX from styled HTML (with aspect ratio data) using modern docx library (server-side only)
  try {
    console.log('[Format Converters] Generating DOCX with aspect ratio:', aspectRatio);
    const docxBuffer = await htmlToDocx(processedHtmlStyled);
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