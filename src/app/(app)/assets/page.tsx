"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/components/layout/app-providers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/ui/page-header";
import { AssetCard } from "@/components/ui/asset-card";
import { EmptyState } from "@/components/ui/empty-state";
import { StatCard } from "@/components/ui/stat-card";
import { ImagePreviewModal } from "@/components/ui/image-preview-modal";
import { assetManager } from "@/lib/asset-manager";
import type { Asset } from "@/types";
import { 
  Search, 
  AlertCircle,
  Upload,
  Trash2,
  HardDrive,
  Image,
  FileText,
  Download,
  ExternalLink,
  FileCode,
  SortDesc,
  SortAsc,
  Calendar,
  Hash
} from "lucide-react";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Sort options
type SortOption = 'date-desc' | 'date-asc' | 'size-desc' | 'size-asc' | 'name-asc' | 'name-desc';

export default function AssetsPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<"all" | "image" | "video" | "file">("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState<Asset | null>(null);
  const [selectedAssets, setSelectedAssets] = useState<Set<string>>(new Set());
  const [sortOption, setSortOption] = useState<SortOption>('date-desc');
  const [previewAsset, setPreviewAsset] = useState<Asset | null>(null);

  // Load REAL assets from Firebase
  useEffect(() => {
    async function loadAssets() {
      if (!user) return;
      
      setLoading(true);
      try {
        // Get REAL assets from asset manager - NO MOCK DATA!
        const userAssets = await assetManager.getUserAssets(user.uid, {
          includeDeleted: false
        });
        
        setAssets(userAssets);
      } catch (error) {
        console.error("Failed to load assets:", error);
        toast({
          title: "Error",
          description: "Failed to load your assets. Please try again.",
          variant: "destructive",
        });
        // NO FALLBACK DATA - if it fails, it fails!
        setAssets([]);
      } finally {
        setLoading(false);
      }
    }

    loadAssets();
  }, [user, toast]);

  // Filter and sort assets
  const filteredAndSortedAssets = useMemo(() => {
    let filtered = [...assets];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(asset =>
        asset.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.generationPrompt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.documentIds.some(id => id.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Filter by type
    if (selectedType !== "all") {
      filtered = filtered.filter(asset => asset.type === selectedType);
    }

    // Sort assets
    filtered.sort((a, b) => {
      switch (sortOption) {
        case 'date-desc':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'date-asc':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'size-desc':
          return b.fileSize - a.fileSize;
        case 'size-asc':
          return a.fileSize - b.fileSize;
        case 'name-asc':
          return a.fileName.localeCompare(b.fileName);
        case 'name-desc':
          return b.fileName.localeCompare(a.fileName);
        default:
          return 0;
      }
    });

    return filtered;
  }, [assets, searchQuery, selectedType, sortOption]);

  // Calculate REAL stats
  const stats = useMemo(() => {
    const totalStorage = assets.reduce((sum, asset) => sum + asset.fileSize, 0);
    const imageCount = assets.filter(a => a.type === "image").length;
    const videoCount = assets.filter(a => a.type === "video").length;
    const fileCount = assets.filter(a => a.type === "file").length;
    
    return { totalStorage, imageCount, videoCount, fileCount };
  }, [assets]);

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Handle asset deletion
  const handleDeleteAsset = useCallback((asset: Asset) => {
    setAssetToDelete(asset);
    setDeleteDialogOpen(true);
  }, []);

  const confirmDelete = async () => {
    if (!assetToDelete || !user) return;

    try {
      // REAL deletion from Firebase
      await assetManager.softDeleteAsset(assetToDelete.id, user.uid);
      
      toast({
        title: "Asset deleted",
        description: `${assetToDelete.fileName} has been deleted.`,
      });
      
      // Remove from local state
      setAssets(prev => prev.filter(a => a.id !== assetToDelete.id));
      setSelectedAssets(prev => {
        const newSet = new Set(prev);
        newSet.delete(assetToDelete.id);
        return newSet;
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete asset.",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setAssetToDelete(null);
    }
  };

  // Handle bulk deletion
  const handleBulkDelete = async () => {
    if (!user) return;
    
    try {
      // REAL bulk deletion
      await Promise.all(
        Array.from(selectedAssets).map(assetId => 
          assetManager.softDeleteAsset(assetId, user.uid)
        )
      );
      
      toast({
        title: "Assets deleted",
        description: `${selectedAssets.size} assets have been deleted.`,
      });
      
      setAssets(prev => prev.filter(a => !selectedAssets.has(a.id)));
      setSelectedAssets(new Set());
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete assets.",
        variant: "destructive",
      });
    }
  };

  // Toggle asset selection
  const toggleAssetSelection = useCallback((assetId: string, selected: boolean) => {
    setSelectedAssets(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(assetId);
      } else {
        newSet.delete(assetId);
      }
      return newSet;
    });
  }, []);

  // Download asset
  const downloadAsset = useCallback((asset: Asset) => {
    const link = document.createElement('a');
    link.href = asset.publicUrl;
    link.download = asset.fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  if (authLoading || loading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <Skeleton className="h-10 w-48 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please log in to view your assets.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <PageHeader 
        title="Asset Manager"
        description="Manage your generated images, documents, and published content."
      />

      {/* Storage Overview - REAL DATA */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total Storage"
          value={formatFileSize(stats.totalStorage)}
          icon={HardDrive}
          description={`${assets.length} files`}
        />
        <StatCard
          label="Images"
          value={stats.imageCount}
          icon={Image}
        />
        <StatCard
          label="Videos"
          value={stats.videoCount}
          icon={FileCode}
        />
        <StatCard
          label="Files"
          value={stats.fileCount}
          icon={FileText}
        />
      </div>

      {/* Filters and Actions */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              data-testid="asset-search-input"
              placeholder="Search by name, prompt, or document ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Type Filter */}
          <Tabs value={selectedType} onValueChange={(v) => setSelectedType(v as any)}>
            <TabsList data-testid="asset-type-filter">
              <TabsTrigger value="all" data-testid="filter-all">All</TabsTrigger>
              <TabsTrigger value="image" data-testid="filter-images">Images</TabsTrigger>
              <TabsTrigger value="video" data-testid="filter-videos">Videos</TabsTrigger>
              <TabsTrigger value="file" data-testid="filter-files">Files</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Sort Options */}
          <Select value={sortOption} onValueChange={(v) => setSortOption(v as SortOption)}>
            <SelectTrigger className="w-[180px]" data-testid="asset-sort-select">
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date-desc">
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4" />
                  Newest First
                </div>
              </SelectItem>
              <SelectItem value="date-asc">
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4" />
                  Oldest First
                </div>
              </SelectItem>
              <SelectItem value="size-desc">
                <div className="flex items-center">
                  <SortDesc className="mr-2 h-4 w-4" />
                  Largest First
                </div>
              </SelectItem>
              <SelectItem value="size-asc">
                <div className="flex items-center">
                  <SortAsc className="mr-2 h-4 w-4" />
                  Smallest First
                </div>
              </SelectItem>
              <SelectItem value="name-asc">
                <div className="flex items-center">
                  <Hash className="mr-2 h-4 w-4" />
                  Name (A-Z)
                </div>
              </SelectItem>
              <SelectItem value="name-desc">
                <div className="flex items-center">
                  <Hash className="mr-2 h-4 w-4" />
                  Name (Z-A)
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Bulk Actions */}
        {selectedAssets.size > 0 && (
          <div className="flex items-center gap-4 p-4 bg-muted rounded-lg" data-testid="bulk-actions-bar">
            <span className="text-sm font-medium" data-testid="selected-count">
              {selectedAssets.size} selected
            </span>
            <div className="flex gap-2 ml-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedAssets(new Set())}
                data-testid="bulk-cancel-btn"
              >
                Cancel
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkDelete}
                data-testid="bulk-delete-btn"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Assets Grid - REAL DATA ONLY */}
      {filteredAndSortedAssets.length === 0 ? (
        <EmptyState
          icon={Upload}
          title="No assets found"
          description={
            searchQuery || selectedType !== "all"
              ? "Try adjusting your filters."
              : assets.length === 0 
                ? "Generate content to see your assets here."
                : "No matching assets found."
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="assets-grid">
          {filteredAndSortedAssets.map((asset) => (
            <Card key={asset.id} className="overflow-hidden group" data-testid={`asset-card-${asset.id}`}>
              {/* Asset Preview */}
              <div className="relative aspect-video bg-muted">
                {asset.type === "image" && asset.publicUrl ? (
                  <>
                    <img
                      src={asset.publicUrl}
                      alt={asset.fileName}
                      className="absolute inset-0 w-full h-full object-cover cursor-pointer"
                      onClick={() => setPreviewAsset(asset)}
                    />
                    <Button
                      size="sm"
                      variant="secondary"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => setPreviewAsset(asset)}
                    >
                      Preview
                    </Button>
                  </>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    {asset.type === "video" ? (
                      <FileCode className="h-16 w-16 text-muted-foreground" />
                    ) : (
                      <FileText className="h-16 w-16 text-muted-foreground" />
                    )}
                  </div>
                )}
                
                {/* Selection Checkbox */}
                <div className="absolute top-2 left-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={selectedAssets.has(asset.id)}
                    onChange={(e) => toggleAssetSelection(asset.id, e.target.checked)}
                    data-testid={`asset-checkbox-${asset.id}`}
                  />
                </div>
              </div>

              {/* Asset Info */}
              <CardContent className="pt-4">
                <h3 className="font-medium line-clamp-1" title={asset.fileName}>
                  {asset.fileName}
                </h3>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <span>{formatFileSize(asset.fileSize)}</span>
                  <span>•</span>
                  <span>
                    {new Date(asset.createdAt).toLocaleDateString()}
                  </span>
                </div>
                
                {/* Generation Info */}
                {asset.generationPrompt && (
                  <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                    {asset.generationPrompt}
                  </p>
                )}

                {/* Associated Documents */}
                {asset.documentIds.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs text-muted-foreground mb-1">
                      Used in {asset.documentIds.length} document{asset.documentIds.length > 1 ? 's' : ''}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {asset.documentIds.slice(0, 3).map(docId => (
                        <Link
                          key={docId}
                          href={`/w/${asset.stageReferences.find(ref => ref.documentId === docId)?.documentId || docId}`}
                        >
                          <Button variant="outline" size="sm" className="h-6 text-xs">
                            View Doc
                          </Button>
                        </Link>
                      ))}
                      {asset.documentIds.length > 3 && (
                        <span className="text-xs text-muted-foreground">
                          +{asset.documentIds.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => window.open(asset.publicUrl, '_blank')}
                    data-testid={`asset-open-btn-${asset.id}`}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => downloadAsset(asset)}
                    data-testid={`asset-download-btn-${asset.id}`}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteAsset(asset)}
                    data-testid={`asset-delete-btn-${asset.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Image Preview Modal */}
      {previewAsset && previewAsset.type === 'image' && (
        <ImagePreviewModal
          isOpen={!!previewAsset}
          onClose={() => setPreviewAsset(null)}
          imageUrl={previewAsset.publicUrl}
          imageName={previewAsset.fileName}
          imageSize={formatFileSize(previewAsset.fileSize)}
          onDownload={() => downloadAsset(previewAsset)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete asset?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;{assetToDelete?.fileName}&quot;. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}