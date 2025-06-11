"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface HtmlPreviewProps {
  content: string;
  className?: string;
  removeBorder?: boolean; // Option to remove border when wrapped in another container
}

export function HtmlPreview({ content, className, removeBorder = false }: HtmlPreviewProps) {
  const sanitizeHtml = (html: string) => {
    // Basic HTML sanitization - in production, consider using DOMPurify
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  };

  const sanitizedContent = sanitizeHtml(content);

  if (!content?.trim()) {
    return (
      <div className={cn("p-4 text-center text-muted-foreground bg-muted/50 rounded-md", className)}>
        No HTML content to preview
      </div>
    );
  }

  return (
    <div 
      className={cn(
        "prose prose-sm max-w-none p-4 min-h-[100px]",
        !removeBorder && "border rounded-md bg-background shadow-sm",
        className
      )}
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
} 