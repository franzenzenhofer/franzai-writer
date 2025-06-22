import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { 
  Image, 
  FileText, 
  Download, 
  Trash2, 
  ExternalLink, 
  Copy,
  Eye,
  Calendar,
  Link as LinkIcon,
  MoreVertical
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface AssetCardProps {
  asset: {
    id: string;
    name: string;
    type: "image" | "document" | "export";
    size: number;
    url: string;
    createdAt: Date;
    mimeType?: string;
    publicUrl?: string;
    thumbnailUrl?: string;
  };
  selected: boolean;
  onSelectChange: (selected: boolean) => void;
  onDelete: () => void;
  onCopyUrl?: (url: string) => void;
  formatFileSize: (bytes: number) => string;
}

export function AssetCard({ 
  asset, 
  selected, 
  onSelectChange, 
  onDelete, 
  onCopyUrl,
  formatFileSize 
}: AssetCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handlePreview = () => {
    if (asset.type === "image" && (asset.url || asset.thumbnailUrl)) {
      window.open(asset.url || asset.thumbnailUrl, "_blank");
    } else if (asset.publicUrl) {
      window.open(asset.publicUrl, "_blank");
    }
  };

  return (
    <Card className="overflow-hidden group hover:shadow-lg transition-shadow">
      {/* Asset Preview */}
      <div className="relative aspect-video bg-muted">
        {asset.type === "image" && (asset.thumbnailUrl || asset.url) ? (
          <>
            {!imageLoaded && !imageError && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted-foreground border-t-transparent" />
              </div>
            )}
            {imageError ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <Image className="h-16 w-16 text-muted-foreground" aria-hidden="true" />
              </div>
            ) : (
              <img
                src={asset.thumbnailUrl || asset.url}
                alt={asset.name}
                className={cn(
                  "absolute inset-0 w-full h-full object-cover",
                  imageLoaded ? "opacity-100" : "opacity-0"
                )}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
              />
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            {asset.type === "image" ? (
              <Image className="h-16 w-16 text-muted-foreground" aria-hidden="true" />
            ) : (
              <FileText className="h-16 w-16 text-muted-foreground" aria-hidden="true" />
            )}
          </div>
        )}
        
        {/* Selection Checkbox */}
        <div className="absolute top-2 left-2">
          <Checkbox
            checked={selected}
            onCheckedChange={onSelectChange}
            className="bg-background/80 backdrop-blur"
          />
        </div>

        {/* Quick Actions */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handlePreview}>
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Download className="mr-2 h-4 w-4" />
                Download
              </DropdownMenuItem>
              {asset.publicUrl && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onCopyUrl?.(asset.publicUrl!)}>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Public URL
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <a href={asset.publicUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Open Public Link
                    </a>
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={onDelete}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Asset Info */}
      <CardContent className="pt-4">
        <h3 className="font-medium line-clamp-1" title={asset.name}>{asset.name}</h3>
        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
          <span>{formatFileSize(asset.size)}</span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatDistanceToNow(asset.createdAt, { addSuffix: true })}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <Badge variant="secondary" className="text-xs">
            {asset.type}
          </Badge>
          {asset.publicUrl && (
            <Badge variant="outline" className="text-xs">
              <LinkIcon className="mr-1 h-3 w-3" />
              Published
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}