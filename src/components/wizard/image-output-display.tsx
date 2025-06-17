"use client";

import { useState } from "react";
import Image from "next/image";
import { Download, Loader2, AlertCircle } from "lucide-react";
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
  const imageUrl = selectedImage.publicUrl || selectedImage.storageUrl || selectedImage.dataUrl;

  return (
    <div className="space-y-4">
      {/* Main image display */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Image
              src={imageUrl || '/placeholder-image.png'}
              alt={`Generated image: ${selectedImage.promptUsed}`}
              width={selectedImage.width || 800}
              height={selectedImage.height || 600}
              className="w-full h-auto rounded-lg"
              data-aspect-ratio={selectedImage.aspectRatio}
            />
            
            {/* Aspect ratio badge */}
            <Badge 
              variant="secondary" 
              className="absolute top-2 left-2"
            >
              {selectedImage.aspectRatio}
            </Badge>
            
            {/* Download button */}
            <Button
              size="sm"
              variant="secondary"
              className="absolute top-2 right-2"
              onClick={() => handleDownload(selectedImage, selectedIndex)}
            >
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
          </div>

          {/* Image metadata */}
          {!hideMetadata && (
            <div className="mt-4 space-y-2">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Prompt:</span> {selectedImage.promptUsed}
              </p>
              {selectedImage.width && selectedImage.height && (
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Dimensions:</span> {selectedImage.width} × {selectedImage.height}
                </p>
              )}
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Provider:</span> {output.provider}
              </p>
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
              <button
                key={index}
                onClick={() => {
                  setSelectedIndex(index);
                  onImageSelection?.(index);
                }}
                className={cn(
                  "relative rounded-lg overflow-hidden border-2 transition-all",
                  selectedIndex === index
                    ? "border-primary ring-2 ring-primary ring-offset-2"
                    : "border-transparent hover:border-muted-foreground/50"
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
              </button>
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