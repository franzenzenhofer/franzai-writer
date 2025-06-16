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
}

export function ExportPreview({ htmlStyled, htmlClean, className = "" }: ExportPreviewProps) {
  const [viewMode, setViewMode] = useState<"styled" | "clean">("clean");
  const shadowRef = useRef<HTMLDivElement>(null);
  const shadowRootRef = useRef<ShadowRoot | null>(null);
  
  const currentHtml = viewMode === "styled" ? htmlStyled : htmlClean;
  
  useEffect(() => {
    if (!shadowRef.current || !currentHtml) return;
    
    if (!shadowRootRef.current) {
      shadowRootRef.current = shadowRef.current.attachShadow({ mode: 'closed' });
    }
    
    shadowRootRef.current.innerHTML = currentHtml;
    
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
            className="w-full h-[400px] border-0 bg-white"
            title={`${viewMode} HTML preview`}
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