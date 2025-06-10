
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
    if (open && markdownContent) {
      // Create a temporary div to render markdown and extract HTML
      // This avoids issues with refs if MarkdownRenderer is complex
      const tempDiv = document.createElement('div');
      // Temporarily append to body to ensure styles are applied if MarkdownRenderer relies on context
      // Or, if MarkdownRenderer is simple, this might not be needed.
      // document.body.appendChild(tempDiv); // Optional, depending on MarkdownRenderer behavior

      // This is a bit of a trick: we need to render Markdown to HTML.
      // We can use a library or a simple simulation if MarkdownRenderer is complex.
      // For now, we'll assume MarkdownRenderer creates direct HTML children we can grab.
      
      // If MarkdownRenderer directly outputs HTML as children, this is simpler.
      // ReactDOM.render(<MarkdownRenderer content={markdownContent} />, tempDiv, () => {
      //   setRawHtml(tempDiv.innerHTML);
      //   document.body.removeChild(tempDiv); // Clean up
      // });
      // The above ReactDOM.render is old. Let's simplify.
      // The `htmlPreviewRef` method used before is generally sound if `MarkdownRenderer`
      // populates it synchronously or with a slight delay.

      if (htmlPreviewRef.current) {
         // Ensure the ref's content is updated if markdownContent changes while dialog is open
        htmlPreviewRef.current.innerHTML = ''; // Clear previous
        // We need to get the output of MarkdownRenderer
        // A simple way for this component:
        const rendererOutputDiv = document.createElement('div');
        // Manually append a rendered Markdown (this is a placeholder for actual rendering logic)
        // In a real scenario, you'd use a Markdown-to-HTML library here or ensure MarkdownRenderer provides access.
        // For the purpose of this prototype, we'll assume `MarkdownRenderer` populates `htmlPreviewRef`.
        
        // The timeout helps ensure MarkdownRenderer has completed its internal rendering.
        setTimeout(() => {
            if (htmlPreviewRef.current) {
                setRawHtml(htmlPreviewRef.current.innerHTML);
            }
        }, 100); // Small delay for rendering
      }
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

  const getStyledHtml = () => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${documentTitle || 'Generated Document'}</title>
  <style>
    body { font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; line-height: 1.6; padding: 20px; max-width: 800px; margin: auto; color: #333; background-color: #f9fafb; }
    h1, h2, h3, h4, h5, h6 { margin-top: 1.5em; margin-bottom: 0.5em; color: #111; font-family: 'Space Grotesk', sans-serif; }
    h1 { font-size: 2.25em; border-bottom: 1px solid #eee; padding-bottom: 0.3em;}
    h2 { font-size: 1.75em; }
    h3 { font-size: 1.25em; }
    p { margin-bottom: 1em; }
    a { color: #2563eb; text-decoration: none; }
    a:hover { text-decoration: underline; }
    code { background-color: #f3f4f6; padding: 0.2em 0.4em; margin: 0; font-size: 85%; border-radius: 3px; font-family: 'Source Code Pro', monospace; }
    pre { background-color: #f3f4f6; border: 1px solid #e5e7eb; padding: 1em; border-radius: 6px; overflow-x: auto; }
    pre code { background-color: transparent; padding: 0; margin: 0; font-size: inherit; border-radius: 0; border: 0; }
    ul, ol { padding-left: 2em; margin-bottom: 1em; }
    li { margin-bottom: 0.25em; }
    blockquote { border-left: 4px solid #d1d5db; padding-left: 1em; margin-left: 0; font-style: italic; color: #4b5563; }
    table { border-collapse: collapse; width: 100%; margin-bottom: 1em; border: 1px solid #d1d5db;}
    th, td { border: 1px solid #d1d5db; padding: 8px 12px; text-align: left; }
    th { background-color: #f9fafb; font-weight: 600; }
    img { max-width: 100%; height: auto; border-radius: 6px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    hr { border: none; border-top: 1px solid #e5e7eb; margin: 2em 0; }
    /* Basic prose styling for markdown */
    .prose { font-size: 1rem; line-height: 1.75; }
    .prose :where(h1):not(:where([class~="not-prose"] *)) { font-size: 2.25em; margin-top:0; margin-bottom: 0.8888889em; font-weight: 800; }
    .prose :where(h2):not(:where([class~="not-prose"] *)) { font-size: 1.5em; margin-top: 2em; margin-bottom: 1em; font-weight: 700; }
    .prose :where(h3):not(:where([class~="not-prose"] *)) { font-size: 1.25em; margin-top: 1.6em; margin-bottom: 0.6em; font-weight: 600; }
    /* Add more prose styles as needed from a library like Tailwind Typography if desired */
  </style>
</head>
<body class="prose">
  ${rawHtml}
</body>
</html>`;
  };

  const handleDownloadHtml = () => {
    downloadFile(getStyledHtml(), `${documentTitle.replace(/\s+/g, '_') || 'document'}.html`, "text/html;charset=utf-8");
  };

  const openHtmlInNewTab = () => {
    const newTab = window.open();
    if (newTab) {
      newTab.document.write(getStyledHtml());
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

        {/* Hidden div to render markdown for HTML extraction for the rawHtml state */}
        <div ref={htmlPreviewRef} style={{ display: 'none' }}>
          {open && <MarkdownRenderer content={markdownContent} />}
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
            {/* This MarkdownRenderer is for visual preview inside the dialog tab */}
            <MarkdownRenderer content={markdownContent} className="prose dark:prose-invert max-w-full"/>
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
              value={rawHtml} // This is the unstyled HTML structure
              readOnly
              className="flex-grow resize-none font-code text-sm bg-muted"
              aria-label="Raw HTML Content"
            />
            <div className="flex justify-end space-x-2">
              <Button variant="outline" size="sm" onClick={() => copyToClipboard(rawHtml, "Raw HTML")}>
                <Copy className="mr-2 h-4 w-4" /> Copy Raw HTML
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownloadHtml}>
                <Download className="mr-2 h-4 w-4" /> Download Styled .html
              </Button>
              <Button variant="outline" size="sm" onClick={openHtmlInNewTab}>
                <ExternalLink className="mr-2 h-4 w-4" /> Open Styled HTML in New Tab
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-4 pt-4 border-t">
          <p className="text-xs text-muted-foreground mr-auto">Note: PDF export is not yet available.</p>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
