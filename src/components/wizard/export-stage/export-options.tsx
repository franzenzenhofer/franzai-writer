"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, Copy, Globe, Check, Loader2, AlertCircle } from "lucide-react";
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
  onPublish: () => void;
}

export function ExportOptions({ formats, exportConfig, onPublish }: ExportOptionsProps) {
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
    
    toast({
      title: "Downloaded!",
      description: `${format} file downloaded successfully`,
    });
  };
  
  const handleCopy = async (format: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedFormat(format);
      setTimeout(() => setCopiedFormat(null), 2000);
      
      toast({
        title: "Copied!",
        description: `${format} content copied to clipboard`,
      });
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
      icon: '🎨',
      title: 'Styled HTML',
      description: 'Beautiful, ready-to-publish HTML with embedded styles',
    },
    'html-clean': {
      icon: '📝',
      title: 'Clean HTML',
      description: 'Plain HTML without CSS - perfect for WordPress, Medium, etc.',
    },
    'markdown': {
      icon: '📄',
      title: 'Markdown',
      description: 'Universal markdown format for GitHub, Notion, Obsidian',
    },
    'pdf': {
      icon: '📕',
      title: 'PDF Document',
      description: 'Professional PDF with custom styling',
    },
    'docx': {
      icon: '📘',
      title: 'Word Document',
      description: 'Microsoft Word format with styles preserved',
    },
  };
  
  const availableFormats = Object.entries(formats).filter(([_, state]) => state.ready);
  
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        {availableFormats.map(([format, state]) => {
          const info = formatInfo[format as keyof typeof formatInfo];
          if (!info) return null;
          
          return (
            <Card key={format} className="relative">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <span className="text-2xl">{info.icon}</span>
                  {info.title}
                </CardTitle>
                <CardDescription className="text-xs">
                  {info.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDownload(format, state.content!)}
                  disabled={!state.content}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
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
              </CardContent>
              
              {state.error && (
                <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
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
      
      {exportConfig?.publishing?.enabled && (
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="text-center">
            <CardTitle className="text-xl flex items-center justify-center gap-2">
              <Globe className="h-5 w-5" />
              Publish to Web
            </CardTitle>
            <CardDescription>
              Share your content with a permanent, shareable link
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button
              size="lg"
              onClick={onPublish}
              className="mx-auto"
              id="publish-button"
            >
              <Globe className="mr-2 h-4 w-4" />
              Publish Now
            </Button>
            
            {exportConfig.publishing.features?.sharing?.qrCode && (
              <p className="text-xs text-muted-foreground mt-2">
                Includes QR code for easy sharing
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}