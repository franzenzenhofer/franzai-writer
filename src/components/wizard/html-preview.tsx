"use client";

import React, { useRef, useEffect } from 'react';
import { cn } from "@/lib/utils";

interface HtmlPreviewProps {
  content: string;
  removeBorder?: boolean;
  className?: string;
}

/**
 * Clean HTML content by removing code fences but preserving full HTML structure
 */
function cleanHtmlContent(content: string): string {
  if (!content || typeof content !== 'string') {
    return content;
  }

  let cleaned = content;

  // Remove HTML code fences
  cleaned = cleaned.replace(/^```html\s*/gmi, '');
  cleaned = cleaned.replace(/^```htm\s*/gmi, '');
  
  // Remove generic code fences
  cleaned = cleaned.replace(/^```\w*\s*/gm, '');
  cleaned = cleaned.replace(/```\s*$/gm, '');
  cleaned = cleaned.replace(/^```\s*/gm, '');
  
  // Remove standalone language markers
  cleaned = cleaned.replace(/^\s*(html|json|markdown|md)\s*$/gm, '');
  
  // Clean up DOCTYPE formatting
  cleaned = cleaned.replace(/^[\s]*<!DOCTYPE html>/gm, '<!DOCTYPE html>');
  
  return cleaned.trim();
}

/**
 * Simple HTML Preview Component using Iframe
 * 
 * KISS approach: Use iframe with srcdoc for perfect HTML isolation
 * - No Shadow DOM complications
 * - No CSS variable conversion needed
 * - All CSS works exactly as written
 * - Full HTML document support including DOCTYPE
 */
export function HtmlPreview({ content, removeBorder = false, className = "" }: HtmlPreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!iframeRef.current) return;

    // Clean the content to remove any code fences
    const cleanedContent = cleanHtmlContent(content);
    
    if (!cleanedContent) {
      iframeRef.current.srcdoc = '';
      return;
    }

    // Set the HTML content directly in iframe using srcdoc
    iframeRef.current.srcdoc = cleanedContent;

    console.log('[HtmlPreview] Iframe content updated:', {
      contentLength: cleanedContent.length,
      hasDoctype: cleanedContent.includes('<!DOCTYPE'),
      hasStyle: cleanedContent.includes('<style'),
      hasCssVariables: cleanedContent.includes('--'),
      preview: cleanedContent.substring(0, 200) + '...'
    });

  }, [content]);

  return (
    <iframe
      ref={iframeRef}
      title="HTML Preview"
      sandbox="allow-same-origin"
      className={cn(
        "w-full h-[400px] bg-white",
        !removeBorder && "border rounded-lg",
        className
      )}
      style={{
        minHeight: '200px',
      }}
    />
  );
} 