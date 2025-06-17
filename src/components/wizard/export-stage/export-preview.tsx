"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, Code } from "lucide-react";

interface ExportPreviewProps {
  htmlStyled?: string;
  htmlClean?: string;
  className?: string;
  defaultView?: 'styled' | 'clean';
}

/**
 * Client-side content cleaner to avoid server/client boundary issues
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

export function ExportPreview({ htmlStyled, htmlClean, className = "", defaultView = "clean" }: ExportPreviewProps) {
  const [viewMode, setViewMode] = useState<"styled" | "clean">(defaultView);
  const shadowRef = useRef<HTMLDivElement>(null);
  const shadowRootRef = useRef<ShadowRoot | null>(null);
  
  const currentHtml = viewMode === "styled" ? htmlStyled : htmlClean;
  
  useEffect(() => {
    if (!shadowRef.current || !currentHtml) return;
    
    // Clean the HTML content to remove code fences and formatting
    const cleanedHtml = cleanHtmlContent(currentHtml);
    
    if (!shadowRootRef.current) {
      shadowRootRef.current = shadowRef.current.attachShadow({ mode: 'closed' });
    }
    
    // Add scrollable styles to the shadow DOM content
    const wrappedHtml = `
      <style>
        :host {
          display: block;
          width: 100%;
          height: 100%;
          overflow: auto;
          scroll-behavior: smooth;
        }
        body {
          margin: 0;
          padding: 16px;
          width: calc(100% - 32px);
          box-sizing: border-box;
        }
      </style>
      ${cleanedHtml}`;
    
    shadowRootRef.current.innerHTML = wrappedHtml;
    
    return () => {
      if (shadowRootRef.current) {
        shadowRootRef.current.innerHTML = '';
      }
    };
  }, [currentHtml]);
  
  if (!htmlStyled && !htmlClean) {
    return null;
  }
  
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Live Preview</h3>
        <div className="flex gap-2">
          <Button
            variant={viewMode === "styled" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("styled")}
            disabled={!htmlStyled}
          >
            <Eye className="mr-2 h-4 w-4" />
            Styled
          </Button>
          <Button
            variant={viewMode === "clean" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("clean")}
            disabled={!htmlClean}
          >
            <Code className="mr-2 h-4 w-4" />
            Clean
          </Button>
        </div>
      </div>
      
      <Card className="overflow-hidden">
        <div className="relative">
          {viewMode === "styled" && (
            <Badge 
              variant="secondary" 
              className="absolute top-2 right-2 z-10"
            >
              Styled Preview
            </Badge>
          )}
          
          <div
            ref={shadowRef}
            className="w-full h-[400px] border-0 bg-white overflow-auto"
            title={`${viewMode} HTML preview`}
            style={{ scrollBehavior: 'smooth' }}
          />
        </div>
      </Card>
      
      {viewMode === "clean" && (
        <p className="text-sm text-muted-foreground text-center">
          Clean HTML preview - Perfect for pasting into any CMS
        </p>
      )}
    </div>
  );
}