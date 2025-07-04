"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, Code } from "lucide-react";

interface ExportPreviewProps {
  htmlStyled?: string;
  htmlClean?: string;
  htmlStyledUrl?: string;
  htmlCleanUrl?: string;
  className?: string;
  defaultView?: 'styled' | 'clean';
}

/**
 * Clean HTML content by removing code fences but preserving full HTML structure for iframe rendering
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
  
  // Clean up DOCTYPE formatting for iframe rendering
  cleaned = cleaned.replace(/^[\s]*<!DOCTYPE html>/gm, '<!DOCTYPE html>');
  
  // Trim leading/trailing whitespace once more
  return cleaned.trim();
}

export function ExportPreview({ htmlStyled, htmlClean, htmlStyledUrl, htmlCleanUrl, className = "", defaultView = "clean" }: ExportPreviewProps) {
  const [loadedHtmlStyled, setLoadedHtmlStyled] = useState<string | undefined>(htmlStyled);
  const [loadedHtmlClean, setLoadedHtmlClean] = useState<string | undefined>(htmlClean);
  const [isLoading, setIsLoading] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  // Smart defaultView logic: use the requested default only if content is available
  const getInitialViewMode = (): "styled" | "clean" => {
    if (defaultView === "styled" && (htmlStyled || htmlStyledUrl)) {
      return "styled";
    }
    if (defaultView === "clean" && (htmlClean || htmlCleanUrl)) {
      return "clean";
    }
    // Fallback: use whichever content is available
    if (htmlStyled || htmlStyledUrl) return "styled";
    if (htmlClean || htmlCleanUrl) return "clean";
    return defaultView; // Last resort
  };
  
  const [viewMode, setViewMode] = useState<"styled" | "clean">(getInitialViewMode());
  
  /**
   * Fetch remote HTML (if URLs are provided) *once* on mount.
   *
   *  – Runs both fetches in parallel.
   *  – Always clears the `isLoading` flag – even on errors or when no fetch is needed.
   *  – Uses `Promise.allSettled` so one failed fetch does not block the other.
   */
  useEffect(() => {
    // Nothing to load if inline HTML is already present
    const needsStyled = !htmlStyled && !!htmlStyledUrl;
    const needsClean  = !htmlClean  && !!htmlCleanUrl;

    if (!needsStyled && !needsClean) {
      return; // All data already available – no network activity required
    }

    setIsLoading(true);

    const tasks: Promise<void>[] = [];

    const proxyFetch = async (remoteUrl: string): Promise<string> => {
      console.log('[ExportPreview] Proxy fetching:', remoteUrl);
      const resp = await fetch('/api/fetch-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: remoteUrl, raw: true }),
      });
      if (!resp.ok) throw new Error(`Proxy HTTP ${resp.status}`);
      const json = await resp.json();
      return json.content ?? '';
    };

    if (needsStyled) {
      tasks.push(
        proxyFetch(htmlStyledUrl!)
          .then(setLoadedHtmlStyled)
          .catch(err => console.error('[ExportPreview] Styled HTML fetch error:', err))
      );
    }

    if (needsClean) {
      tasks.push(
        proxyFetch(htmlCleanUrl!)
          .then(setLoadedHtmlClean)
          .catch(err => console.error('[ExportPreview] Clean HTML fetch error:', err))
      );
    }

      // Whatever happens – stop the spinner once every attempt finished
  Promise.allSettled(tasks).finally(() => setIsLoading(false));
}, [htmlStyled, htmlClean, htmlStyledUrl, htmlCleanUrl]);

// Update viewMode when props change (e.g., after reload when data becomes available)
useEffect(() => {
  const newViewMode = getInitialViewMode();
  if (newViewMode !== viewMode) {
    setViewMode(newViewMode);
  }
}, [htmlStyled, htmlClean, htmlStyledUrl, htmlCleanUrl, defaultView]);
  
  // Whenever currentHtml changes (inline) -> push to iframe using srcDoc
  useEffect(() => {
    if (!iframeRef.current) return;

    if (viewMode === 'styled') {
      if (htmlStyledUrl) {
        iframeRef.current.src = htmlStyledUrl;
      } else if (loadedHtmlStyled) {
        iframeRef.current.srcdoc = cleanHtmlContent(loadedHtmlStyled);
      }
    } else {
      if (htmlCleanUrl) {
        iframeRef.current.src = htmlCleanUrl;
      } else if (loadedHtmlClean) {
        iframeRef.current.srcdoc = cleanHtmlContent(loadedHtmlClean);
      }
    }
  }, [viewMode, loadedHtmlStyled, loadedHtmlClean, htmlStyledUrl, htmlCleanUrl]);
  
  if (!loadedHtmlStyled && !loadedHtmlClean && !htmlStyledUrl && !htmlCleanUrl && !isLoading) {
    return null;
  }
  
  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="text-center text-muted-foreground">Loading preview...</div>
      </div>
    );
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
            disabled={!loadedHtmlStyled}
          >
            <Eye className="mr-2 h-4 w-4" />
            Styled
          </Button>
          <Button
            variant={viewMode === "clean" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("clean")}
            disabled={!loadedHtmlClean}
          >
            <Code className="mr-2 h-4 w-4" />
            Clean
          </Button>
        </div>
      </div>
      
      <Card className="overflow-hidden">
        <div className="relative">
          {viewMode === "styled" && (
            <Badge variant="secondary" className="absolute top-2 right-2 z-10">Styled Preview</Badge>
          )}
          <iframe
            ref={iframeRef}
            title={`${viewMode} HTML preview`}
            sandbox="allow-same-origin"
            className="w-full h-[400px] border-0 bg-white"
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