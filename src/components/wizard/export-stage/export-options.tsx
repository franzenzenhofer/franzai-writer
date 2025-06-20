"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, Copy, Globe, Check, Loader2, AlertCircle, FileText, Code, FileDown, FileImage, FileSpreadsheet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { ExportConfig } from "@/types";

interface FormatState {
  ready: boolean;
  content?: string;
  url?: string;
  error?: string;
}

interface ExportOptionsProps {
  formats: Record<string, FormatState>;
  exportConfig?: ExportConfig;
}

export function ExportOptions({ formats, exportConfig }: ExportOptionsProps) {
  const { toast } = useToast();
  const [copiedFormat, setCopiedFormat] = React.useState<string | null>(null);
  
  const handleDownload = (format: string, content: string) => {
    let blob: Blob;
    
    // Handle binary formats (PDF, DOCX) that are base64 encoded
    if (format === 'pdf' || format === 'docx') {
      const binaryString = atob(content);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      blob = new Blob([bytes], { type: getContentType(format) });
    } else {
      // Handle text formats (HTML, Markdown)
      blob = new Blob([content], { type: getContentType(format) });
    }
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `export.${getFileExtension(format)}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Silent download - file save dialog is feedback enough
  };
  
  const handleCopy = async (format: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedFormat(format);
      setTimeout(() => setCopiedFormat(null), 2000);
      
      // Silent copy - visual feedback in UI is enough
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Unable to copy to clipboard",
        variant: "destructive",
      });
    }
  };
  
  const getContentType = (format: string): string => {
    const types: Record<string, string> = {
      'html-styled': 'text/html',
      'html-clean': 'text/html',
      'markdown': 'text/markdown',
      'pdf': 'application/pdf',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    };
    return types[format] || 'text/plain';
  };
  
  const getFileExtension = (format: string): string => {
    const extensions: Record<string, string> = {
      'html-styled': 'html',
      'html-clean': 'html',
      'markdown': 'md',
      'pdf': 'pdf',
      'docx': 'docx',
    };
    return extensions[format] || 'txt';
  };
  
  const formatInfo = {
    'html-styled': {
      icon: FileText,
      title: 'Styled HTML',
      description: 'Beautiful, ready-to-publish HTML with embedded styles',
      supportsCopy: true,
    },
    'html-clean': {
      icon: Code,
      title: 'Clean HTML',
      description: 'Plain HTML without CSS - perfect for WordPress, Medium, etc.',
      supportsCopy: true,
    },
    'markdown': {
      icon: FileDown,
      title: 'Markdown',
      description: 'Universal markdown format for GitHub, Notion, Obsidian',
      supportsCopy: true,
    },
    'pdf': {
      icon: FileImage,
      title: 'PDF Document',
      description: 'Professional PDF based on clean HTML structure',
      supportsCopy: false,
    },
    'docx': {
      icon: FileSpreadsheet,
      title: 'Word Document',
      description: 'Microsoft Word format based on clean HTML structure',
      supportsCopy: false,
    },
  };
  
  const availableFormats = Object.entries(formats).filter(([_, state]) => state.ready);
  
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {availableFormats.map(([format, state]) => {
          const info = formatInfo[format as keyof typeof formatInfo];
          if (!info) return null;
          
          return (
            <Card key={format} className="transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex-shrink-0">
                      <info.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm">
                        {info.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {info.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownload(format, state.content!)}
                      disabled={!state.content}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                    {info.supportsCopy && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCopy(format, state.content!)}
                        disabled={!state.content}
                      >
                        {copiedFormat === format ? (
                          <Check className="mr-2 h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="mr-2 h-4 w-4" />
                        )}
                        Copy
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
              
              {state.error && (
                <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-lg">
                  <div className="text-center p-4">
                    <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
                    <p className="text-sm text-destructive">{state.error}</p>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}