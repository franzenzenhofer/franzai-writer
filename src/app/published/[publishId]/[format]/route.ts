import { NextRequest, NextResponse } from 'next/server';
import { getFirestore, doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { app } from '@/lib/firebase';

const db = getFirestore(app);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ publishId: string; format: string }> }
) {
  try {
    const { publishId, format } = await params;
    
    const docRef = doc(db, 'publications', publishId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return new NextResponse('Content not found', { status: 404 });
    }
    
    const data = docSnap.data();
    
    if (!data.isActive) {
      return new NextResponse('Content not found', { status: 404 });
    }
    
    // Increment view count
    await updateDoc(docRef, {
      views: increment(1),
    });
    
    const content = data.content;
    const formatContent = content[format];
    
    if (!formatContent || !formatContent.content) {
      return new NextResponse('Format not found', { status: 404 });
    }
    
    // For HTML formats, return raw HTML
    if (format === 'html-styled') {
      return new NextResponse(formatContent.content, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
        },
      });
    }
    
    // For clean HTML, add minimal CSS via Link header
    if (format === 'html-clean') {
      // Note: The Link header with data URI is the standard way to include CSS via HTTP headers
      // However, browser support may vary. The CSS rule makes all images responsive.
      return new NextResponse(formatContent.content, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Link': '<data:text/css,img%7Bmax-width%3A100%25%3Bheight%3Aauto%3B%7D>; rel="stylesheet"',
        },
      });
    }
    
    // For markdown, return with basic styling
    if (format === 'markdown') {
      const markdownHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Markdown Content</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
    h1, h2, h3, h4, h5, h6 { margin-top: 24px; margin-bottom: 16px; font-weight: 600; line-height: 1.25; }
    h1 { font-size: 2em; border-bottom: 1px solid #eaecef; padding-bottom: 0.3em; }
    h2 { font-size: 1.5em; border-bottom: 1px solid #eaecef; padding-bottom: 0.3em; }
    p { margin-bottom: 16px; }
    pre { background: #f6f8fa; padding: 16px; border-radius: 6px; overflow: auto; }
    code { background: rgba(175, 184, 193, 0.2); padding: 0.2em 0.4em; border-radius: 3px; font-size: 85%; }
  </style>
</head>
<body>
  <pre style="white-space: pre-wrap; font-family: inherit;">${formatContent.content}</pre>
</body>
</html>`;
      
      return new NextResponse(markdownHtml, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
        },
      });
    }
    
    // For other formats, return as plain text
    return new NextResponse(formatContent.content, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });
    
  } catch (error) {
    console.error('[Published Route] Error:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
} 