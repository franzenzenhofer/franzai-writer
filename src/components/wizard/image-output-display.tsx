"use client";

import { useState } from "react";
import { Download, Loader2, AlertCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { AIImageDisplay } from "@/components/ui/ai-image-display";
import { cn } from "@/lib/utils";
import type { ImageOutputData } from "@/types";

interface ImageOutputDisplayProps {
  output: ImageOutputData;
  isLoading?: boolean;
  error?: string;
  onImageSelection?: (selectedIndex: number) => void;
  hideMetadata?: boolean;
}

export function ImageOutputDisplay({ 
  output, 
  isLoading = false, 
  error,
  onImageSelection,
  hideMetadata = false
}: ImageOutputDisplayProps) {
  const [selectedIndex, setSelectedIndex] = useState(
    output.selectedImageIndex || 0
  );

  const handleDownload = async (image: ImageOutputData["images"][0], index: number) => {
    try {
      let url = image.publicUrl || image.storageUrl || image.dataUrl;
      if (!url) {
        console.error("No URL available for download");
        return;
      }

      // If it's a data URL, convert to blob and download
      if (url.startsWith("data:")) {
        const response = await fetch(url);
        const blob = await response.blob();
        url = URL.createObjectURL(blob);
      }

      const link = document.createElement("a");
      link.href = url;
      link.download = `generated-image-${index + 1}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up object URL if we created one
      if (url.startsWith("blob:")) {
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error("Error downloading image:", err);
    }
  };

  const handleOpenInNewTab = (imageUrl: string) => {
    if (!imageUrl) {
      console.error("No URL available to open");
      return;
    }
    
    // For data URLs, we need to create a blob URL for the new tab
    if (imageUrl.startsWith("data:")) {
      fetch(imageUrl)
        .then(response => response.blob())
        .then(blob => {
          const blobUrl = URL.createObjectURL(blob);
          window.open(blobUrl, '_blank');
          // Clean up after a delay
          setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
        })
        .catch(err => {
          console.error("Error opening image in new tab:", err);
        });
    } else {
      // Direct HTTP URLs can be opened directly
      window.open(imageUrl, '_blank');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Generating images...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center p-4 bg-destructive/10 rounded-lg">
        <AlertCircle className="h-5 w-5 text-destructive mr-2" />
        <span className="text-sm text-destructive">{error}</span>
      </div>
    );
  }

  if (!output?.images || output.images.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        No images generated
      </div>
    );
  }

  const selectedImage = output.images[selectedIndex];
  
  // Safely extract image URL with validation
  let imageUrl = '';
  try {
    if (selectedImage && typeof selectedImage === 'object') {
      imageUrl = selectedImage.publicUrl || selectedImage.storageUrl || selectedImage.dataUrl || '';
    }
    
    // Validate URL format
    if (imageUrl && typeof imageUrl === 'string' && (imageUrl.startsWith('http') || imageUrl.startsWith('data:'))) {
      // Valid URL
    } else {
      console.warn('[ImageOutputDisplay] Invalid image URL detected:', imageUrl);
      imageUrl = '';
    }
  } catch (error) {
    console.error('[ImageOutputDisplay] Error extracting image URL:', error);
    imageUrl = '';
  }

  // Convert ImageOutputData to AIImageData format for the new component
  const aiImageData = output.images.map(image => ({
    assetId: image.assetId,
    publicUrl: image.publicUrl,
    storageUrl: image.storageUrl,
    dataUrl: image.dataUrl,
    promptUsed: image.promptUsed,
    mimeType: image.mimeType,
    width: image.width,
    height: image.height,
    aspectRatio: image.aspectRatio,
  }));

  return (
    <div className="space-y-4">
      {/* Use new AI Image Display component */}
      <AIImageDisplay
        images={aiImageData}
        selectedIndex={selectedIndex}
        onSelectionChange={(index) => {
          setSelectedIndex(index);
          onImageSelection?.(index);
        }}
        showMetadata={!hideMetadata}
        showDownload={true}
        showQualitySelector={true}
        showFormatSelector={true}
        enableComparison={output.images.length > 1}
        displayMode={output.images.length > 1 ? 'single' : 'single'}
        sizePreset="large"
        className="space-y-4"
      />

      {/* Accompanying text from Gemini if present */}
      {output.accompanyingText && (
        <Card>
          <CardContent className="p-4">
            <p className="text-sm">{output.accompanyingText}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}