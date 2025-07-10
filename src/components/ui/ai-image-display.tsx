'use client';

import { useState, useCallback, useMemo } from 'react';
import { OptimizedImage } from './optimized-image';
import { Button } from './button';
import { Badge } from './badge';
import { Card, CardContent } from './card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { cn } from '@/lib/utils';
import { Download, ExternalLink, Eye, Zap } from 'lucide-react';

interface AIImageData {
  assetId?: string;
  publicUrl?: string;
  storageUrl?: string;
  dataUrl?: string;
  promptUsed: string;
  mimeType: string;
  width?: number;
  height?: number;
  aspectRatio: string;
}

interface AIImageDisplayProps {
  /**
   * Array of AI-generated images
   */
  images: AIImageData[];
  /**
   * Selected image index
   */
  selectedIndex?: number;
  /**
   * Callback when image selection changes
   */
  onSelectionChange?: (index: number) => void;
  /**
   * Show image metadata
   */
  showMetadata?: boolean;
  /**
   * Show download options
   */
  showDownload?: boolean;
  /**
   * Show quality selection
   */
  showQualitySelector?: boolean;
  /**
   * Show format selection
   */
  showFormatSelector?: boolean;
  /**
   * Enable image comparison mode
   */
  enableComparison?: boolean;
  /**
   * Custom className
   */
  className?: string;
  /**
   * Display mode
   */
  displayMode?: 'single' | 'grid' | 'carousel';
  /**
   * Image size preset
   */
  sizePreset?: 'thumbnail' | 'medium' | 'large' | 'fullscreen';
}

const AIImageDisplay: React.FC<AIImageDisplayProps> = ({
  images,
  selectedIndex = 0,
  onSelectionChange,
  showMetadata = true,
  showDownload = true,
  showQualitySelector = true,
  showFormatSelector = true,
  enableComparison = false,
  className,
  displayMode = 'single',
  sizePreset = 'medium',
}) => {
  const [quality, setQuality] = useState<number>(80);
  const [format, setFormat] = useState<'webp' | 'avif' | 'auto'>('auto');
  const [comparisonMode, setComparisonMode] = useState(false);

  // Get primary image URL
  const getPrimaryImageUrl = useCallback((image: AIImageData): string => {
    return image.publicUrl || image.storageUrl || image.dataUrl || '';
  }, []);

  // Get image dimensions
  const getImageDimensions = useCallback((preset: string) => {
    const dimensions = {
      thumbnail: { width: 150, height: 150 },
      medium: { width: 400, height: 400 },
      large: { width: 800, height: 800 },
      fullscreen: { width: 1200, height: 1200 },
    };
    return dimensions[preset as keyof typeof dimensions] || dimensions.medium;
  }, []);

  // Current selected image
  const selectedImage = useMemo(() => {
    return images[selectedIndex] || images[0];
  }, [images, selectedIndex]);

  // Handle image selection
  const handleImageSelection = useCallback((index: number) => {
    onSelectionChange?.(index);
  }, [onSelectionChange]);

  // Handle download
  const handleDownload = useCallback(async (image: AIImageData) => {
    const url = getPrimaryImageUrl(image);
    if (!url) return;

    try {
      const response = await fetch(url);
      const blob = await response.blob();
      
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `ai-image-${image.assetId || Date.now()}.${image.mimeType.split('/')[1]}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Failed to download image:', error);
    }
  }, [getPrimaryImageUrl]);

  // Handle open in new tab
  const handleOpenInNewTab = useCallback((image: AIImageData) => {
    const url = getPrimaryImageUrl(image);
    if (url) {
      window.open(url, '_blank');
    }
  }, [getPrimaryImageUrl]);

  // Get responsive image sizes
  const getImageSizes = useCallback((preset: string) => {
    const sizesMap = {
      thumbnail: '150px',
      medium: '(max-width: 768px) 100vw, 400px',
      large: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px',
      fullscreen: '(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px',
    };
    return sizesMap[preset as keyof typeof sizesMap] || sizesMap.medium;
  }, []);

  if (!images.length) {
    return (
      <div className={cn('text-center py-8', className)}>
        <div className="text-gray-500">No images available</div>
      </div>
    );
  }

  const dimensions = getImageDimensions(sizePreset);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Quality and Format Controls */}
      {(showQualitySelector || showFormatSelector) && (
        <div className="flex flex-wrap gap-4 items-center">
          {showQualitySelector && (
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Quality:</label>
              <Select value={quality.toString()} onValueChange={(value) => setQuality(parseInt(value))}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="60">60%</SelectItem>
                  <SelectItem value="80">80%</SelectItem>
                  <SelectItem value="90">90%</SelectItem>
                  <SelectItem value="100">100%</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          
          {showFormatSelector && (
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Format:</label>
              <Select value={format} onValueChange={(value) => setFormat(value as any)}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto</SelectItem>
                  <SelectItem value="webp">WebP</SelectItem>
                  <SelectItem value="avif">AVIF</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {enableComparison && images.length > 1 && (
            <Button
              variant={comparisonMode ? "default" : "outline"}
              size="sm"
              onClick={() => setComparisonMode(!comparisonMode)}
            >
              <Eye className="w-4 h-4 mr-2" />
              Compare
            </Button>
          )}
        </div>
      )}

      {/* Main Image Display */}
      {displayMode === 'single' && !comparisonMode && (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col items-center">
              <OptimizedImage
                src={getPrimaryImageUrl(selectedImage)}
                alt={`AI generated image: ${selectedImage.promptUsed}`}
                width={dimensions.width}
                height={dimensions.height}
                className="rounded-lg shadow-lg"
                sizes={getImageSizes(sizePreset)}
                quality={quality}
                format={format}
                progressive
                lazy
              />
              
              {/* Action Buttons */}
              <div className="flex gap-2 mt-4">
                {showDownload && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(selectedImage)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenInNewTab(selectedImage)}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Comparison Mode */}
      {comparisonMode && images.length > 1 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {images.slice(0, 2).map((image, index) => (
            <Card key={index} className={cn(
              'cursor-pointer transition-all',
              index === selectedIndex ? 'ring-2 ring-blue-500' : ''
            )}>
              <CardContent className="p-4">
                <OptimizedImage
                  src={getPrimaryImageUrl(image)}
                  alt={`AI generated image ${index + 1}`}
                  width={dimensions.width / 2}
                  height={dimensions.height / 2}
                  className="rounded-lg w-full"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  quality={quality}
                  format={format}
                  progressive
                  lazy
                />
                <div className="mt-2 text-center">
                  <Badge variant={index === selectedIndex ? "default" : "secondary"}>
                    Image {index + 1}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Grid Mode */}
      {displayMode === 'grid' && !comparisonMode && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map((image, index) => (
            <Card 
              key={index} 
              className={cn(
                'cursor-pointer transition-all hover:shadow-lg',
                index === selectedIndex ? 'ring-2 ring-blue-500' : ''
              )}
              onClick={() => handleImageSelection(index)}
            >
              <CardContent className="p-4">
                <OptimizedImage
                  src={getPrimaryImageUrl(image)}
                  alt={`AI generated image ${index + 1}`}
                  width={dimensions.width / 2}
                  height={dimensions.height / 2}
                  className="rounded-lg w-full"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  quality={quality}
                  format={format}
                  progressive
                  lazy
                />
                <div className="mt-2 text-center">
                  <Badge variant={index === selectedIndex ? "default" : "secondary"}>
                    {index === selectedIndex && <Zap className="w-3 h-3 mr-1" />}
                    Image {index + 1}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Thumbnail Strip for Single Mode */}
      {displayMode === 'single' && images.length > 1 && !comparisonMode && (
        <div className="flex gap-2 justify-center overflow-x-auto pb-2">
          {images.map((image, index) => (
            <div
              key={index}
              className={cn(
                'flex-shrink-0 cursor-pointer transition-all hover:scale-105',
                index === selectedIndex ? 'ring-2 ring-blue-500 rounded-lg' : ''
              )}
              onClick={() => handleImageSelection(index)}
            >
              <OptimizedImage
                src={getPrimaryImageUrl(image)}
                alt={`Thumbnail ${index + 1}`}
                width={80}
                height={80}
                className="rounded-lg object-cover"
                sizes="80px"
                quality={60}
                format={format}
                progressive
                lazy
              />
            </div>
          ))}
        </div>
      )}

      {/* Metadata */}
      {showMetadata && selectedImage && (
        <Card>
          <CardContent className="p-4">
            <Tabs defaultValue="prompt" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="prompt">Prompt</TabsTrigger>
                <TabsTrigger value="technical">Technical</TabsTrigger>
                <TabsTrigger value="optimization">Optimization</TabsTrigger>
              </TabsList>
              
              <TabsContent value="prompt" className="mt-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Generation Prompt</h4>
                  <p className="text-sm text-gray-600">{selectedImage.promptUsed}</p>
                </div>
              </TabsContent>
              
              <TabsContent value="technical" className="mt-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Format:</span> {selectedImage.mimeType}
                  </div>
                  <div>
                    <span className="font-medium">Aspect Ratio:</span> {selectedImage.aspectRatio}
                  </div>
                  {selectedImage.width && selectedImage.height && (
                    <div>
                      <span className="font-medium">Dimensions:</span> {selectedImage.width}×{selectedImage.height}
                    </div>
                  )}
                  {selectedImage.assetId && (
                    <div>
                      <span className="font-medium">Asset ID:</span> {selectedImage.assetId}
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="optimization" className="mt-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Quality: {quality}%</Badge>
                    <Badge variant="outline">Format: {format.toUpperCase()}</Badge>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>• Progressive loading enabled</p>
                    <p>• Lazy loading with intersection observer</p>
                    <p>• Responsive image sizes</p>
                    <p>• Modern format support (WebP/AVIF)</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export { AIImageDisplay };
export type { AIImageDisplayProps, AIImageData };