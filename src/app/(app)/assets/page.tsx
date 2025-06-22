"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/layout/app-providers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { 
  Image, 
  FileText, 
  Download, 
  Trash2, 
  ExternalLink, 
  Search, 
  Filter,
  AlertCircle,
  Upload,
  Link as LinkIcon,
  Copy,
  Eye,
  Calendar,
  HardDrive
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

// Mock data structure for assets
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
}

export default function AssetsPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [assets, setAssets] = useState<Asset[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<"all" | "image" | "document" | "export">("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState<Asset | null>(null);
  const [selectedAssets, setSelectedAssets] = useState<Set<string>>(new Set());

  // Mock load assets - in real implementation, this would fetch from Firebase Storage
  useEffect(() => {
    async function loadAssets() {
      if (!user) return;
      
      setLoading(true);
      try {
        // TODO: Implement actual asset loading from Firebase Storage
        // This would query:
        // 1. Images generated for documents
        // 2. Exported files (HTML, PDF, etc.)
        // 3. Published documents
        
        // Mock data for demonstration
        const mockAssets: Asset[] = [
          {
            id: "1",
            name: "poem-illustration-sunset.png",
            type: "image",
            size: 1024 * 1024 * 2.5, // 2.5MB
            url: "#",
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
            mimeType: "image/png"
          },
          {
            id: "2",
            name: "recipe-carbonara-export.html",
            type: "export",
            size: 1024 * 45, // 45KB
            url: "#",
            publicUrl: "https://example.com/published/abc123",
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
            mimeType: "text/html"
          },
          {
            id: "3",
            name: "press-release-draft.pdf",
            type: "document",
            size: 1024 * 256, // 256KB
            url: "#",
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72),
            mimeType: "application/pdf"
          }
        ];
        
        setAssets(mockAssets);
        setFilteredAssets(mockAssets);
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

  // Filter assets
  useEffect(() => {
    let filtered = [...assets];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(asset =>
        asset.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by type
    if (selectedType !== "all") {
      filtered = filtered.filter(asset => asset.type === selectedType);
    }

    setFilteredAssets(filtered);
  }, [assets, searchQuery, selectedType]);

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Handle asset deletion
  const handleDeleteAsset = (asset: Asset) => {
    setAssetToDelete(asset);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!assetToDelete) return;

    try {
      // TODO: Implement actual deletion from Firebase Storage
      toast({
        title: "Asset deleted",
        description: `${assetToDelete.name} has been deleted.`,
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
  const copyPublicUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: "URL copied",
      description: "Public URL has been copied to clipboard.",
    });
  };

  // Calculate total storage used
  const totalStorage = assets.reduce((sum, asset) => sum + asset.size, 0);

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
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Asset Manager</h1>
        <p className="text-muted-foreground">
          Manage your uploaded files, generated images, and published documents.
        </p>
      </div>

      {/* Storage Overview */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Storage Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HardDrive className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">{formatFileSize(totalStorage)} used</p>
                <p className="text-sm text-muted-foreground">{assets.length} files</p>
              </div>
            </div>
            <div className="flex gap-4 text-sm">
              <div className="text-center">
                <p className="font-medium">{assets.filter(a => a.type === "image").length}</p>
                <p className="text-muted-foreground">Images</p>
              </div>
              <div className="text-center">
                <p className="font-medium">{assets.filter(a => a.type === "document").length}</p>
                <p className="text-muted-foreground">Documents</p>
              </div>
              <div className="text-center">
                <p className="font-medium">{assets.filter(a => a.type === "export").length}</p>
                <p className="text-muted-foreground">Exports</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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
        <Card className="p-12 text-center">
          <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No assets found</h3>
          <p className="text-muted-foreground">
            {searchQuery || selectedType !== "all"
              ? "Try adjusting your filters."
              : "Your uploaded files and generated assets will appear here."}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssets.map((asset) => (
            <Card key={asset.id} className="overflow-hidden group">
              {/* Asset Preview */}
              <div className="relative aspect-video bg-muted">
                {asset.type === "image" ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Image className="h-16 w-16 text-muted-foreground" />
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <FileText className="h-16 w-16 text-muted-foreground" />
                  </div>
                )}
                
                {/* Selection Checkbox */}
                <div className="absolute top-2 left-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={selectedAssets.has(asset.id)}
                    onChange={() => {
                      const newSelection = new Set(selectedAssets);
                      if (newSelection.has(asset.id)) {
                        newSelection.delete(asset.id);
                      } else {
                        newSelection.add(asset.id);
                      }
                      setSelectedAssets(newSelection);
                    }}
                  />
                </div>

                {/* Quick Actions */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="secondary">
                        Actions
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
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
                          <DropdownMenuItem onClick={() => copyPublicUrl(asset.publicUrl!)}>
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
                        onClick={() => handleDeleteAsset(asset)}
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
                <h3 className="font-medium line-clamp-1">{asset.name}</h3>
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
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete asset?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{assetToDelete?.name}". This action cannot be undone.
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