import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    
    if (!url) {
      return NextResponse.json(
        { error: 'URL parameter is required' },
        { status: 400 }
      );
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    console.log(`[fetch-url] Fetching content from: ${url}`);
    
    // Fetch the URL content with a timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; FranzAI/1.0; +https://franzai.com)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const contentType = response.headers.get('content-type') || '';
      const text = await response.text();
      
      // Extract meaningful content based on content type
      let content = text;
      let title = '';
      
      if (contentType.includes('text/html')) {
        // Basic HTML parsing to extract title and body content
        const titleMatch = text.match(/<title[^>]*>([^<]+)<\/title>/i);
        title = titleMatch ? titleMatch[1].trim() : '';
        
        // Remove script and style tags
        content = text.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
        content = content.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
        
        // Extract body content if available
        const bodyMatch = content.match(/<body[^>]*>([\s\S]*)<\/body>/i);
        if (bodyMatch) {
          content = bodyMatch[1];
        }
        
        // Strip HTML tags but preserve structure
        content = content
          .replace(/<\/p>/gi, '\n\n')
          .replace(/<\/div>/gi, '\n')
          .replace(/<br\s*\/?>/gi, '\n')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
        
        // Limit content length for reasonable processing
        if (content.length > 50000) {
          content = content.substring(0, 50000) + '... [content truncated]';
        }
      }
      
      return NextResponse.json({
        url,
        title,
        content,
        contentType,
        contentLength: text.length,
        fetchedAt: new Date().toISOString(),
      });
      
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return NextResponse.json(
            { error: 'Request timeout: URL took too long to respond' },
            { status: 408 }
          );
        }
        
        return NextResponse.json(
          { error: `Failed to fetch URL: ${error.message}` },
          { status: 500 }
        );
      }
      
      return NextResponse.json(
        { error: 'An unknown error occurred' },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('[fetch-url] Error:', error);
    return NextResponse.json(
      { error: 'Invalid request format' },
      { status: 400 }
    );
  }
}