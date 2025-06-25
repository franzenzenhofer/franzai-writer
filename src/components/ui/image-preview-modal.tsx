import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink, X, ZoomIn, ZoomOut } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface ImagePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  imageName: string;
  imageSize?: string;
  onDownload?: () => void;
}

export function ImagePreviewModal({
  isOpen,
  onClose,
  imageUrl,
  imageName,
  imageSize,
  onDownload
}: ImagePreviewModalProps) {
  const [zoom, setZoom] = useState(1);
  const [imageError, setImageError] = useState(false);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5));
  const resetZoom = () => setZoom(1);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] max-h-[90vh] p-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex-1 min-w-0">
              <h3 className="font-medium truncate">{imageName}</h3>
              {imageSize && (
                <p className="text-sm text-muted-foreground">{imageSize}</p>
              )}
            </div>
            <div className="flex items-center gap-2 ml-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleZoomOut}
                disabled={zoom <= 0.5}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={resetZoom}
              >
                {Math.round(zoom * 100)}%
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleZoomIn}
                disabled={zoom >= 3}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              {onDownload && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onDownload}
                >
                  <Download className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => window.open(imageUrl, '_blank')}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Image Container */}
          <div className="flex-1 overflow-auto bg-muted/50 flex items-center justify-center p-4">
            {imageError ? (
              <div className="text-center">
                <p className="text-muted-foreground">Failed to load image</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => window.open(imageUrl, '_blank')}
                >
                  Open in new tab
                </Button>
              </div>
            ) : (
              <img
                src={imageUrl}
                alt={imageName}
                className={cn(
                  "max-w-full max-h-full object-contain transition-transform duration-200",
                  zoom !== 1 && "cursor-move"
                )}
                style={{ transform: `scale(${zoom})` }}
                onError={() => setImageError(true)}
                draggable={false}
              />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}