"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Eye, Code, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { createSafeWysiwygHtml } from "@/lib/security/sanitization";

interface WysiwygEditorProps {
  content: string;
  onChange: (content: string) => void;
  readOnly?: boolean;
  className?: string;
}

export function WysiwygEditor({ 
  content, 
  onChange, 
  readOnly = false, 
  className 
}: WysiwygEditorProps) {
  const [isSourceMode, setIsSourceMode] = useState(false);
  const [localContent, setLocalContent] = useState(content);

  useEffect(() => {
    setLocalContent(content);
  }, [content]);

  const handleContentChange = (newContent: string) => {
    setLocalContent(newContent);
    onChange(newContent);
  };

  const renderPreview = () => {
    return (
      <div 
        className="prose prose-sm max-w-none p-4 border rounded-md bg-background min-h-[200px]"
        dangerouslySetInnerHTML={createSafeWysiwygHtml(localContent)}
      />
    );
  };

  const renderSourceEditor = () => {
    return (
      <Textarea
        value={localContent}
        onChange={(e) => handleContentChange(e.target.value)}
        className="font-mono text-sm min-h-[200px] bg-background"
        placeholder="Enter HTML content..."
        disabled={readOnly}
      />
    );
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Editor controls */}
      <div className="flex items-center gap-2 justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant={isSourceMode ? "outline" : "default"}
            size="sm"
            onClick={() => setIsSourceMode(false)}
            disabled={readOnly}
          >
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Button>
          <Button
            variant={isSourceMode ? "default" : "outline"}
            size="sm"
            onClick={() => setIsSourceMode(true)}
            disabled={readOnly}
          >
            <Code className="mr-2 h-4 w-4" />
            Source
          </Button>
        </div>
        
        <div className="text-xs text-muted-foreground">
          {isSourceMode ? "HTML Source" : "Visual Preview"}
        </div>
      </div>

      {/* Editor content */}
      <div className="border rounded-md">
        {isSourceMode ? renderSourceEditor() : renderPreview()}
      </div>

      {/* Help text */}
      {isSourceMode && !readOnly && (
        <p className="text-xs text-muted-foreground">
          Edit the HTML source code directly. Basic sanitization is applied for security.
        </p>
      )}
    </div>
  );
} 