"use client";

import { useState } from "react";
import { WizardDocument } from "@/types";
import type { Asset } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, ChevronDown, Copy, Trash2, Download, Edit, Image, FileText, ExternalLink } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { buttonVariants } from "@/components/ui/button";
import { copyDocument as copyDocumentAction, deleteDocument as deleteDocumentAction } from "@/lib/document-actions";
import { ImagePreviewModal } from "@/components/ui/image-preview-modal";

interface EnhancedDocumentTableProps {
  documents: WizardDocument[];
  documentAssets: Record<string, Asset[]>;
  showCheckboxes?: boolean;
  onDocumentsChange?: () => void;
  selectedDocs?: Set<string>;
  onSelectedDocsChange?: (docs: Set<string>) => void;
}

export function EnhancedDocumentTable({ 
  documents, 
  documentAssets,
  showCheckboxes = false,
  onDocumentsChange,
  selectedDocs,
  onSelectedDocsChange 
}: EnhancedDocumentTableProps) {
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);
  const [previewAsset, setPreviewAsset] = useState<Asset | null>(null);

  const getWorkflowDisplayName = (workflowId: string): string => {
    const workflowNames: Record<string, string> = {
      "poem-generator": "Poem Generator",
      "poem": "Poem Generator",
      "recipe-seo-optimized": "SEO Recipe",
      "press-release": "Press Release",
      "targeted-page-seo": "SEO Article",
    };
    return workflowNames[workflowId] || workflowId;
  };

  const handleDeleteDocument = (docId: string) => {
    setDocumentToDelete(docId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!documentToDelete) return;
    
    try {
      const result = await deleteDocumentAction(documentToDelete);
      if (result.success) {
        toast({
          title: "Document deleted",
          description: "The document has been deleted.",
        });
        // Notify parent to reload documents
        onDocumentsChange?.();
      } else {
        throw new Error(result.error?.message || "Delete failed");
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to delete document.",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setDocumentToDelete(null);
    }
  };

  const copyDocument = async (doc: WizardDocument) => {
    try {
      const result = await copyDocumentAction(doc.id);
      if (result.success) {
        toast({
          title: "Document copied",
          description: "The document has been successfully copied.",
        });
        // Notify parent to reload documents
        onDocumentsChange?.();
      } else {
        throw new Error(result.error?.message || "Copy failed");
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to copy document.",
        variant: "destructive",
      });
    }
  };

  const toggleDocSelection = (docId: string) => {
    if (!selectedDocs || !onSelectedDocsChange) return;
    
    const newSelection = new Set(selectedDocs);
    if (newSelection.has(docId)) {
      newSelection.delete(docId);
    } else {
      newSelection.add(docId);
    }
    onSelectedDocsChange(newSelection);
  };

  const selectAll = () => {
    if (!selectedDocs || !onSelectedDocsChange) return;
    
    if (selectedDocs.size === documents.length) {
      onSelectedDocsChange(new Set());
    } else {
      onSelectedDocsChange(new Set(documents.map(doc => doc.id)));
    }
  };

  // Get preview image for a document
  const getDocumentPreview = (docId: string): Asset | undefined => {
    const assets = documentAssets[docId] || [];
    // Find the first image asset
    return assets.find(asset => asset.type === "image");
  };

  const getDocumentUrl = (doc: WizardDocument) => {
    // Handle both formats - with and without "-generator" suffix
    const workflowId = doc.workflowId.replace("-generator", "");
    return `/w/${workflowId}/${doc.id}`;
  };

  return (
    <>
      {/* Enhanced List View - Always list per requirements */}
      <div className="space-y-3" data-testid="enhanced-documents-list">
        {/* Select All Header */}
        {showCheckboxes && documents.length > 0 && (
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg" data-testid="select-all-header">
            <Checkbox
              checked={selectedDocs?.size === documents.length}
              onCheckedChange={selectAll}
              data-testid="select-all-checkbox"
            />
            <span className="text-sm font-medium">Select all</span>
          </div>
        )}

        {/* Document Rows */}
        {documents.map((doc, index) => {
          const preview = getDocumentPreview(doc.id);
          const assets = documentAssets[doc.id] || [];
          const imageCount = assets.filter(a => a.type === "image").length;
          const documentUrl = getDocumentUrl(doc);

          return (
            <Card 
              key={`${doc.id}-${index}`}
              className={cn(
                "overflow-hidden transition-all hover:shadow-md",
                selectedDocs?.has(doc.id) && "ring-2 ring-primary"
              )}
              data-testid={`enhanced-document-card-${doc.id}`}
            >
              <CardContent className="p-0">
                <div className="flex items-center gap-4 p-4">
                  {/* Checkbox */}
                  {showCheckboxes && (
                    <Checkbox
                      checked={selectedDocs?.has(doc.id) || false}
                      onCheckedChange={() => toggleDocSelection(doc.id)}
                      data-testid={`document-checkbox-${doc.id}`}
                    />
                  )}

                  {/* Preview Thumbnail */}
                  <div className="flex-shrink-0 w-24 h-24 bg-muted rounded-lg overflow-hidden" data-testid={`document-thumbnail-${doc.id}`}>
                    {preview ? (
                      <img
                        src={preview.publicUrl}
                        alt={preview.fileName}
                        className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => setPreviewAsset(preview)}
                        data-testid={`document-preview-image-${doc.id}`}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FileText className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Document Info */}
                  <div className="flex-grow min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-grow">
                        <h3 className="font-semibold text-lg line-clamp-1">
                          <Link 
                            href={documentUrl} 
                            className="hover:underline"
                          >
                            {doc.title}
                          </Link>
                        </h3>
                        <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-muted-foreground">
                          <span>{getWorkflowDisplayName(doc.workflowId)}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(new Date(doc.updatedAt), { addSuffix: true })}
                          </span>
                          {imageCount > 0 && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Image className="h-3 w-3" />
                                {imageCount} image{imageCount !== 1 ? 's' : ''}
                              </span>
                            </>
                          )}
                        </div>
                        
                        {/* Document ID (for search) */}
                        <div className="mt-1">
                          <code className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                            ID: {doc.id}
                          </code>
                        </div>
                      </div>
                      
                      {/* Status Badge */}
                      <div className="flex-shrink-0">
                        <Badge 
                          variant={doc.status === 'completed' ? 'default' : doc.status === 'in-progress' ? 'secondary' : 'outline'}
                          className="capitalize"
                        >
                          {doc.status}
                        </Badge>
                      </div>
                    </div>

                    {/* Asset Thumbnails Row */}
                    {assets.length > 0 && (
                      <div className="mt-3 flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Assets:</span>
                        <div className="flex gap-1">
                          {assets.slice(0, 5).map((asset) => (
                            <div
                              key={asset.id}
                              className="w-10 h-10 rounded border bg-muted overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => asset.type === 'image' && setPreviewAsset(asset)}
                              title={asset.fileName}
                            >
                              {asset.type === 'image' ? (
                                <img
                                  src={asset.publicUrl}
                                  alt={asset.fileName}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <FileText className="h-4 w-4 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                          ))}
                          {assets.length > 5 && (
                            <div className="w-10 h-10 rounded border bg-muted flex items-center justify-center text-xs text-muted-foreground">
                              +{assets.length - 5}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button variant="default" size="sm" asChild data-testid={`document-open-btn-${doc.id}`}>
                      <Link href={documentUrl}>
                        <Edit className="h-4 w-4 mr-1" />
                        Open
                      </Link>
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" data-testid={`document-actions-btn-${doc.id}`}>
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={documentUrl} target="_blank">
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Open in new tab
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => copyDocument(doc)}>
                          <Copy className="mr-2 h-4 w-4" />
                          Make a copy
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="mr-2 h-4 w-4" />
                          Export
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDeleteDocument(doc.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Image Preview Modal */}
      {previewAsset && previewAsset.type === 'image' && (
        <ImagePreviewModal
          isOpen={!!previewAsset}
          onClose={() => setPreviewAsset(null)}
          imageUrl={previewAsset.publicUrl}
          imageName={previewAsset.fileName}
          imageSize={`${(previewAsset.fileSize / 1024 / 1024).toFixed(2)} MB`}
        />
      )}
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete document?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your document and all associated assets.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete} 
              className={cn(buttonVariants({ variant: "destructive" }))}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}