"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Globe, Share2, QrCode, Loader2, Check, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PublishDialogProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string;
  formats: Record<string, { ready: boolean; content?: string }>;
  publishingConfig?: any;
  onPublishComplete: (result: { publishedUrl: string; shortUrl?: string; qrCodeUrl?: string }) => void;
}

export function PublishDialog({
  isOpen,
  onClose,
  documentId,
  formats,
  publishingConfig,
  onPublishComplete,
}: PublishDialogProps) {
  const { toast } = useToast();
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  const [shortUrl, setShortUrl] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  // Publishing options
  const [includeSocialButtons, setIncludeSocialButtons] = useState(true);
  const [generateQrCode, setGenerateQrCode] = useState(publishingConfig?.features?.sharing?.qrCode ?? true);
  const [selectedFormats, setSelectedFormats] = useState<string[]>(['html-styled']);
  
  const handlePublish = async () => {
    setIsPublishing(true);
    
    try {
      // TODO: Implement actual publishing API call
      const response = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId,
          formats: selectedFormats,
          content: formats,
          options: {
            includeSocialButtons,
            generateQrCode,
          },
        }),
      });
      
      if (!response.ok) throw new Error('Publishing failed');
      
      const result = await response.json();
      
      setPublishedUrl(result.publishedUrl);
      setShortUrl(result.shortUrl);
      setQrCodeUrl(result.qrCodeUrl);
      
      onPublishComplete(result);
      
      toast({
        title: "Published!",
        description: "Your content is now available online",
      });
    } catch (error) {
      toast({
        title: "Publishing failed",
        description: "Unable to publish your content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPublishing(false);
    }
  };
  
  const handleCopy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      
      toast({
        title: "Copied!",
        description: "URL copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Unable to copy to clipboard",
        variant: "destructive",
      });
    }
  };
  
  const availableFormats = Object.entries(formats)
    .filter(([_, state]) => state.ready)
    .map(([format]) => format);
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Publish to Web
          </DialogTitle>
          <DialogDescription>
            Your content will be available at a permanent, shareable link
          </DialogDescription>
        </DialogHeader>
        
        {!publishedUrl ? (
          <div className="space-y-4">
            <div className="space-y-3">
              <Label>Select formats to publish:</Label>
              {availableFormats.map((format) => (
                <div key={format} className="flex items-center space-x-2">
                  <Checkbox
                    id={format}
                    checked={selectedFormats.includes(format)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedFormats([...selectedFormats, format]);
                      } else {
                        setSelectedFormats(selectedFormats.filter(f => f !== format));
                      }
                    }}
                  />
                  <Label htmlFor={format} className="cursor-pointer">
                    {format === 'html-styled' && '🎨 Styled HTML'}
                    {format === 'html-clean' && '📝 Clean HTML'}
                    {format === 'markdown' && '📄 Markdown'}
                  </Label>
                </div>
              ))}
            </div>
            
            <div className="space-y-3">
              <Label>Publishing options:</Label>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="social-buttons"
                  checked={includeSocialButtons}
                  onCheckedChange={setIncludeSocialButtons}
                />
                <Label htmlFor="social-buttons" className="cursor-pointer">
                  Include social sharing buttons
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="qr-code"
                  checked={generateQrCode}
                  onCheckedChange={setGenerateQrCode}
                />
                <Label htmlFor="qr-code" className="cursor-pointer">
                  Generate QR code
                </Label>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <Check className="h-12 w-12 text-green-500 mx-auto" />
              <p className="font-semibold">Published successfully!</p>
            </div>
            
            <div className="space-y-3">
              <div>
                <Label>Your content is available at:</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    value={shortUrl || publishedUrl}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCopy(shortUrl || publishedUrl)}
                  >
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              
              {qrCodeUrl && (
                <div className="text-center">
                  <Label>QR Code for easy sharing:</Label>
                  <img
                    src={qrCodeUrl}
                    alt="QR Code"
                    className="mx-auto mt-2 border rounded"
                    width={200}
                    height={200}
                  />
                </div>
              )}
            </div>
          </div>
        )}
        
        <DialogFooter>
          {!publishedUrl ? (
            <>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={handlePublish}
                disabled={isPublishing || selectedFormats.length === 0}
              >
                {isPublishing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <Globe className="mr-2 h-4 w-4" />
                    Publish Now
                  </>
                )}
              </Button>
            </>
          ) : (
            <Button onClick={onClose}>
              Done
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}