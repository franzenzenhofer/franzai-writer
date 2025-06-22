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
import { 
  Search, 
  AlertCircle,
  Upload,
  Trash2,
  HardDrive,
  Image,
  FileText,
  Download
} from "lucide-react";

// Asset type definition
interface Asset {
  id: string;
  name: string;
  type: "image" | "document" | "export";
  size: number;
  url: string;
  createdAt: Date;
  documentId?: string;
  workflowId?: string;
  mimeType?: string;
  publicUrl?: string;
  thumbnailUrl?: string;
}

// Format file size helper
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export default function AssetsPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<"all" | "image" | "document" | "export">("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState<Asset | null>(null);
  const [selectedAssets, setSelectedAssets] = useState<Set<string>>(new Set());

  // Load assets
  useEffect(() => {
    async function loadAssets() {
      if (!user) return;
      
      setLoading(true);
      try {
        // TODO: Implement actual asset loading from Firebase Storage
        // Mock data for demonstration
        const mockAssets: Asset[] = [
          {
            id: "1",
            name: "poem-illustration-sunset.png",
            type: "image",
            size: 1024 * 1024 * 2.5,
            url: "#",
            thumbnailUrl: "https://placehold.co/400x300/EEE/31343C",
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
            mimeType: "image/png"
          },
          {
            id: "2",
            name: "recipe-carbonara-export.html",
            type: "export",
            size: 1024 * 45,
            url: "#",
            publicUrl: "https://example.com/published/abc123",
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
            mimeType: "text/html"
          },
          {
            id: "3",
            name: "press-release-draft.pdf",
            type: "document",
            size: 1024 * 256,
            url: "#",
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72),
            mimeType: "application/pdf"
          }
        ];
        
        setAssets(mockAssets);
      } catch (error) {
        console.error("Failed to load assets:", error);
        toast({
          title: "Error",
          description: "Failed to load your assets.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    loadAssets();
  }, [user, toast]);

  // Filter assets with memoization
  const filteredAssets = useMemo(() => {
    let filtered = [...assets];

    if (searchQuery) {
      filtered = filtered.filter(asset =>
        asset.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedType !== "all") {
      filtered = filtered.filter(asset => asset.type === selectedType);
    }

    return filtered;
  }, [assets, searchQuery, selectedType]);

  // Calculate stats with memoization
  const stats = useMemo(() => {
    const totalStorage = assets.reduce((sum, asset) => sum + asset.size, 0);
    const imageCount = assets.filter(a => a.type === "image").length;
    const documentCount = assets.filter(a => a.type === "document").length;
    const exportCount = assets.filter(a => a.type === "export").length;
    
    return { totalStorage, imageCount, documentCount, exportCount };
  }, [assets]);

  // Handle asset deletion
  const handleDeleteAsset = useCallback((asset: Asset) => {
    setAssetToDelete(asset);
    setDeleteDialogOpen(true);
  }, []);

  const confirmDelete = async () => {
    if (!assetToDelete) return;

    try {
      // TODO: Implement actual deletion from Firebase Storage
      toast({
        title: "Asset deleted",
        description: `${assetToDelete.name} has been deleted.`,
      });
      
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
    try {
      // TODO: Implement bulk deletion
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

  // Copy public URL
  const copyPublicUrl = useCallback((url: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: "URL copied",
      description: "Public URL has been copied to clipboard.",
    });
  }, [toast]);

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
        description="Manage your uploaded files, generated images, and published documents."
      />

      {/* Storage Overview */}
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
          label="Documents"
          value={stats.documentCount}
          icon={FileText}
        />
        <StatCard
          label="Exports"
          value={stats.exportCount}
          icon={Download}
        />
      </div>

      {/* Filters and Actions */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Type Filter */}
          <Tabs value={selectedType} onValueChange={(v) => setSelectedType(v as any)}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="image">Images</TabsTrigger>
              <TabsTrigger value="document">Documents</TabsTrigger>
              <TabsTrigger value="export">Exports</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Bulk Actions */}
        {selectedAssets.size > 0 && (
          <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
            <span className="text-sm font-medium">
              {selectedAssets.size} selected
            </span>
            <div className="flex gap-2 ml-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedAssets(new Set())}
              >
                Cancel
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkDelete}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Assets Grid */}
      {filteredAssets.length === 0 ? (
        <EmptyState
          icon={Upload}
          title="No assets found"
          description={
            searchQuery || selectedType !== "all"
              ? "Try adjusting your filters."
              : "Your uploaded files and generated assets will appear here."
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssets.map((asset) => (
            <AssetCard
              key={asset.id}
              asset={asset}
              selected={selectedAssets.has(asset.id)}
              onSelectChange={(selected) => toggleAssetSelection(asset.id, selected)}
              onDelete={() => handleDeleteAsset(asset)}
              onCopyUrl={copyPublicUrl}
              formatFileSize={formatFileSize}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete asset?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;{assetToDelete?.name}&quot;. This action cannot be undone.
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