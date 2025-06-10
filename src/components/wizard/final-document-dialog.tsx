
"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { Copy, Download, ExternalLink, FileText, Code } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FinalDocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  markdownContent: string;
  documentTitle: string;
}

export function FinalDocumentDialog({
  open,
  onOpenChange,
  markdownContent,
  documentTitle,
}: FinalDocumentDialogProps) {
  const { toast } = useToast();
  const [rawHtml, setRawHtml] = useState('');
  const htmlPreviewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && htmlPreviewRef.current) {
      // Timeout to ensure MarkdownRenderer has rendered
      setTimeout(() => {
        if (htmlPreviewRef.current) {
          setRawHtml(htmlPreviewRef.current.innerHTML);
        }
      }, 100);
    }
  }, [open, markdownContent]);

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: `${type} Copied!`, description: `${type} has been copied to your clipboard.` });
    } catch (err) {
      toast({ title: "Copy Failed", description: `Could not copy ${type.toLowerCase()} to clipboard.`, variant: "destructive" });
      console.error("Failed to copy:", err);
    }
  };

  const downloadFile = (content: string, fileName: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
    toast({ title: "Download Started", description: `${fileName} should be downloading.` });
  };

  const handleDownloadMarkdown = () => {
    downloadFile(markdownContent, `${documentTitle.replace(/\s+/g, '_') || 'document'}.md`, "text/markdown;charset=utf-8");
  };

  const handleDownloadHtml = () => {
    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${documentTitle || 'Generated Document'}</title>
  <style>
    body { font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; line-height: 1.6; padding: 20px; max-width: 800px; margin: auto; color: #333; }
    h1, h2, h3, h4, h5, h6 { margin-top: 1.5em; margin-bottom: 0.5em; color: #111; }
    p { margin-bottom: 1em; }
    a { color: #007bff; }
    code { background-color: #f0f0f0; padding: 0.2em 0.4em; margin: 0; font-size: 85%; border-radius: 3px; }
    pre { background-color: #f0f0f0; padding: 1em; border-radius: 3px; overflow-x: auto; }
    pre code { background-color: transparent; padding: 0; margin: 0; font-size: inherit; border-radius: 0; }
    ul, ol { padding-left: 2em; margin-bottom: 1em; }
    blockquote { border-left: 4px solid #ccc; padding-left: 1em; margin-left: 0; font-style: italic; color: #555; }
    table { border-collapse: collapse; width: 100%; margin-bottom: 1em; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f9f9f9; }
    img { max-width: 100%; height: auto; border-radius: 3px; }
  </style>
</head>
<body>
  ${rawHtml}
</body>
</html>`;
    downloadFile(fullHtml, `${documentTitle.replace(/\s+/g, '_') || 'document'}.html`, "text/html;charset=utf-8");
  };

  const openHtmlInNewTab = () => {
    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${documentTitle || 'Generated Document'}</title>
  <style>
    body { font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; line-height: 1.6; padding: 20px; max-width: 800px; margin: auto; color: #333; }
    h1, h2, h3, h4, h5, h6 { margin-top: 1.5em; margin-bottom: 0.5em; color: #111; }
    p { margin-bottom: 1em; }
    a { color: #007bff; }
    code { background-color: #f0f0f0; padding: 0.2em 0.4em; margin: 0; font-size: 85%; border-radius: 3px; }
    pre { background-color: #f0f0f0; padding: 1em; border-radius: 3px; overflow-x: auto; }
    pre code { background-color: transparent; padding: 0; margin: 0; font-size: inherit; border-radius: 0; }
    ul, ol { padding-left: 2em; margin-bottom: 1em; }
    blockquote { border-left: 4px solid #ccc; padding-left: 1em; margin-left: 0; font-style: italic; color: #555; }
    table { border-collapse: collapse; width: 100%; margin-bottom: 1em; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f9f9f9; }
    img { max-width: 100%; height: auto; border-radius: 3px; }
  </style>
</head>
<body>
  ${rawHtml}
</body>
</html>`;
    const newTab = window.open();
    if (newTab) {
      newTab.document.write(fullHtml);
      newTab.document.close();
    } else {
      toast({ title: "Popup Blocked?", description: "Could not open new tab. Please check your popup blocker.", variant: "destructive" });
    }
  };
  

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-headline">
            Final Document: {documentTitle}
          </DialogTitle>
          <DialogDescription>
            Preview your generated document and export it in various formats.
          </DialogDescription>
        </DialogHeader>

        {/* Hidden div to render markdown for HTML extraction */}
        <div ref={htmlPreviewRef} style={{ display: 'none' }}>
          <MarkdownRenderer content={markdownContent} />
        </div>

        <Tabs defaultValue="preview" className="flex-grow flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="preview">
              <FileText className="mr-2 h-4 w-4" /> Styled Preview
            </TabsTrigger>
            <TabsTrigger value="markdown">
              <FileText className="mr-2 h-4 w-4" /> Markdown
            </TabsTrigger>
            <TabsTrigger value="html">
              <Code className="mr-2 h-4 w-4" /> HTML
            </TabsTrigger>
          </TabsList>

          <TabsContent value="preview" className="flex-grow overflow-y-auto p-4 border rounded-md mt-2 bg-background">
            <MarkdownRenderer content={markdownContent} />
          </TabsContent>

          <TabsContent value="markdown" className="flex-grow flex flex-col overflow-hidden mt-2 space-y-2">
            <Textarea
              value={markdownContent}
              readOnly
              className="flex-grow resize-none font-code text-sm bg-muted"
              aria-label="Markdown Content"
            />
            <div className="flex justify-end space-x-2">
              <Button variant="outline" size="sm" onClick={() => copyToClipboard(markdownContent, "Markdown")}>
                <Copy className="mr-2 h-4 w-4" /> Copy Markdown
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownloadMarkdown}>
                <Download className="mr-2 h-4 w-4" /> Download .md
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="html" className="flex-grow flex flex-col overflow-hidden mt-2 space-y-2">
            <Textarea
              value={rawHtml}
              readOnly
              className="flex-grow resize-none font-code text-sm bg-muted"
              aria-label="HTML Content"
            />
            <div className="flex justify-end space-x-2">
              <Button variant="outline" size="sm" onClick={() => copyToClipboard(rawHtml, "HTML")}>
                <Copy className="mr-2 h-4 w-4" /> Copy HTML
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownloadHtml}>
                <Download className="mr-2 h-4 w-4" /> Download .html
              </Button>
              <Button variant="outline" size="sm" onClick={openHtmlInNewTab}>
                <ExternalLink className="mr-2 h-4 w-4" /> Open HTML in New Tab
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-4">
          <p className="text-xs text-muted-foreground mr-auto">PDF export is not yet available.</p>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
