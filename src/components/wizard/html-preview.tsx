"use client";

import React, { useRef, useEffect } from 'react';
import { cleanAiResponse } from '@/lib/ai-content-cleaner';
import { cn } from "@/lib/utils";

interface HtmlPreviewProps {
  content: string;
  removeBorder?: boolean;
  className?: string;
}

/**
 * Universal HTML Preview Component with Shadow DOM Isolation
 * 
 * This component ensures ALL HTML content from external sources 
 * (AI, user input, etc.) is rendered in a Shadow DOM to prevent 
 * CSS spillover and security issues.
 * 
 * Follows DRY and KISS principles by being the single source 
 * for HTML rendering across the application.
 */
export function HtmlPreview({ content, removeBorder = false, className = "" }: HtmlPreviewProps) {
  const shadowRef = useRef<HTMLDivElement>(null);
  const shadowRootRef = useRef<ShadowRoot | null>(null);

  useEffect(() => {
    if (!shadowRef.current) return;

    // Clean the content to remove any code fences
    const cleanedContent = cleanAiResponse(content, 'html');
    
    if (!cleanedContent) return;

    // Create shadow root if not exists
    if (!shadowRootRef.current) {
      shadowRootRef.current = shadowRef.current.attachShadow({ mode: 'closed' });
    }

    // Set the cleaned HTML content in the shadow DOM
    shadowRootRef.current.innerHTML = cleanedContent;

    // Clean up function
    return () => {
      if (shadowRootRef.current) {
        shadowRootRef.current.innerHTML = '';
      }
    };
  }, [content]);

  return (
    <div
      ref={shadowRef}
      className={`html-preview ${removeBorder ? '' : 'border rounded-lg'} ${className}`}
      style={{
        minHeight: '200px',
        width: '100%',
        backgroundColor: 'white',
      }}
      title="HTML Preview (isolated in Shadow DOM)"
    />
  );
} 