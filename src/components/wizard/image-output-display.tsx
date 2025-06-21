"use client";

import { useState } from "react";
import Image from "next/image";
import { Download, Loader2, AlertCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

  return (
    <div className="space-y-4">
      {/* Main image display */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={`Generated image: ${selectedImage?.promptUsed || 'Generated image'}`}
                width={selectedImage?.width || 800}
                height={selectedImage?.height || 600}
                className="w-full h-auto rounded-lg"
                data-aspect-ratio={selectedImage?.aspectRatio}
              />
            ) : (
              <div className="w-full h-48 bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm">Image URL not available</p>
                </div>
              </div>
            )}
            
            {/* Aspect ratio badge */}
            {selectedImage?.aspectRatio && (
              <Badge 
                variant="secondary" 
                className="absolute top-2 left-2"
              >
                {selectedImage.aspectRatio}
              </Badge>
            )}
            
            {/* Action buttons */}
            {imageUrl && selectedImage && (
              <div className="absolute top-2 right-2 flex gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDownload(selectedImage, selectedIndex)}
                  id="image-download-btn"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="px-2"
                  onClick={() => handleOpenInNewTab(imageUrl)}
                  title="Open image in new tab"
                  id="image-open-new-tab-btn"
                  aria-label="Open image in new tab"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Image metadata */}
          {!hideMetadata && selectedImage && (
            <div className="mt-4 space-y-2">
              {selectedImage.promptUsed && (
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Prompt:</span> {selectedImage.promptUsed}
                </p>
              )}
              {selectedImage.width && selectedImage.height && (
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Dimensions:</span> {selectedImage.width} × {selectedImage.height}
                </p>
              )}
              {output?.provider && (
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Provider:</span> {output.provider}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Thumbnail gallery for multiple images */}
      {output.images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {output.images.map((image, index) => {
            const thumbUrl = image.publicUrl || image.storageUrl || image.dataUrl;
            return (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedIndex(index);
                  onImageSelection?.(index);
                }}
                className={cn(
                  "relative rounded-lg overflow-hidden p-0 h-auto",
                  selectedIndex === index
                    ? "ring-2 ring-primary ring-offset-2"
                    : ""
                )}
              >
                <Image
                  src={thumbUrl || '/placeholder-image.png'}
                  alt={`Thumbnail ${index + 1}`}
                  width={200}
                  height={150}
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors" />
              </Button>
            );
          })}
        </div>
      )}

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