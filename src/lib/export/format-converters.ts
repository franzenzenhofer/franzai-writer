'use server';

import type { ExportFormat } from '@/types';

/**
 * Convert HTML to Markdown using Turndown library
 */
export async function htmlToMarkdown(html: string, options?: { imageAttribution?: string }): Promise<string> {
  // Dynamic import to avoid bundling in client code
  const TurndownService = (await import('turndown')).default;
  
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
  
  // Create a new Turndown instance with poetry-friendly options
  const turndownService = new TurndownService({
    headingStyle: 'atx',
    hr: '---',
    bulletListMarker: '-',
    codeBlockStyle: 'fenced',
    fence: '```',
    emDelimiter: '*',
    strongDelimiter: '**',
    linkStyle: 'inlined'
  });
  
  // Customize rules for better poetry handling
  turndownService.addRule('poetryParagraphs', {
    filter: 'p',
    replacement: function (content: string) {
      // For poetry lines, preserve line breaks with double spaces
      return content.trim() + '  \n';
    }
  });
  
  // Handle divs (stanzas) with single line break
  turndownService.addRule('stanzas', {
    filter: 'div',
    replacement: function (content: string) {
      return content + '\n';
    }
  });
  
  // Keep figcaptions for attribution (override previous rule)
  turndownService.addRule('keepFigcaption', {
    filter: 'figcaption',
    replacement: function (content: string) {
      return '\n\n*' + content.trim() + '*\n\n';
    }
  });
  
  // Convert the HTML to Markdown
  let markdown = turndownService.turndown(contentHtml);
  
  // Clean up any artifacts
  markdown = markdown
    .replace(/\n{3,}/g, '\n\n') // Collapse triple+ newlines to double
    .replace(/^```html\s*$/gm, '') // Remove any HTML code fence markers
    .replace(/^```\s*$/gm, '')
    .replace(/^\s*html\s*$/gm, '')
    .trim();
  
  // Add image attribution as a footnote if provided and not already present
  if (options?.imageAttribution && !markdown.includes(options.imageAttribution)) {
    markdown += '\n\n---\n\n*' + options.imageAttribution + '*';
  }
  
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
        console.log('[DOCX] Processing image element:', trimmedElement.substring(0, 200) + '...');
        
        // Enhanced regex to capture aspect ratio from data attribute
        const imgMatch = /<img[^>]+src="([^"]+)"[^>]*(?:data-aspect-ratio="([^"]*)"[^>]*)?alt="?([^">]*)"?[^>]*>/i.exec(trimmedElement);
        console.log('[DOCX] Image regex match result:', imgMatch);
        
        if (imgMatch) {
          const [, src, aspectRatio, alt] = imgMatch;
          console.log('[DOCX] Extracted image data:', { src: src.substring(0, 50) + '...', aspectRatio, alt });
          
          try {
            const fetch = (await import('node-fetch')).default as any;
            const response = await fetch(src);
            const arrayBuffer = await response.arrayBuffer();
            const ImageRun = (await import('docx')).ImageRun;
            
            // Calculate dimensions based on aspect ratio
            let transformation: { width: number; height: number };
            
            if (aspectRatio) {
              console.log('[DOCX] Processing aspect ratio:', aspectRatio);
              // Parse aspect ratio (e.g., "16:9", "3:4", "1:1")
              const [widthRatio, heightRatio] = aspectRatio.split(':').map(Number);
              console.log('[DOCX] Parsed ratio components:', { widthRatio, heightRatio });
              
              if (widthRatio && heightRatio) {
                const ratio = widthRatio / heightRatio;
                console.log('[DOCX] Calculated ratio:', ratio);
                
                // Calculate dimensions maintaining aspect ratio
                // Portrait images get height-constrained, landscape get width-constrained
                let width: number;
                let height: number;
                
                if (ratio < 1) {
                  // Portrait image (taller than wide)
                  height = 600;
                  width = Math.round(height * ratio);
                  console.log('[DOCX] Portrait mode calculation');
                } else {
                  // Landscape or square image
                  width = 600;
                  height = Math.round(width / ratio);
                  console.log('[DOCX] Landscape/square mode calculation');
                }
                
                transformation = { width, height };
                console.log(`[DOCX] Final transformation: ${width}x${height} (ratio: ${aspectRatio})`);
              } else {
                // Invalid aspect ratio format, use fallback
                transformation = { width: 600, height: 400 };
                console.warn(`[DOCX] Invalid aspect ratio format: ${aspectRatio} - using fallback 600x400`);
              }
            } else {
              // No aspect ratio available, use default
              transformation = { width: 600, height: 400 };
              console.warn('[DOCX] No aspect ratio data attribute found, using default dimensions 600x400');
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
  
  // Extract image attribution from context if available (detect Imagen usage)
  let imageAttribution: string | undefined;
  if (exportConfig?.contextVars) {
    // Check for any stage with Imagen images
    for (const [stageId, stageOutput] of Object.entries(exportConfig.contextVars)) {
      if (stageOutput && typeof stageOutput === 'object' && 
          'output' in stageOutput && stageOutput.output && 
          typeof stageOutput.output === 'object' && 'images' in stageOutput.output &&
          Array.isArray(stageOutput.output.images) && 
          stageOutput.output.images.length > 0) {
        // Found images - assume they're from Imagen (we could be more specific by checking the stage config)
        imageAttribution = 'Generated with AI using Google Imagen';
        break;
      }
    }
  }
  
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
    const markdown = await htmlToMarkdown(processedHtmlClean, { imageAttribution });
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
    console.log('[Format Converters] DOCX HTML preview (first 500 chars):', processedHtmlStyled.substring(0, 500));
    
    // Check if images have data-aspect-ratio attributes
    const imgTags = processedHtmlStyled.match(/<img[^>]*>/gi);
    if (imgTags) {
      console.log('[Format Converters] Found img tags in DOCX HTML:', imgTags.length);
      imgTags.forEach((tag, index) => {
        console.log(`[Format Converters] Img tag ${index + 1}:`, tag);
      });
    } else {
      console.log('[Format Converters] No img tags found in DOCX HTML');
    }
    
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