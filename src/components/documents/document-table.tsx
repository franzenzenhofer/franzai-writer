"use client";

import { useState } from "react";
import { WizardDocument } from "@/types";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Clock, ChevronDown, Copy, Trash2, Download, Edit } from "lucide-react";
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

interface DocumentTableProps {
  documents: WizardDocument[];
  showCheckboxes?: boolean;
  onDocumentsChange?: () => void;
  selectedDocs?: Set<string>;
  onSelectedDocsChange?: (docs: Set<string>) => void;
}

export function DocumentTable({ 
  documents, 
  showCheckboxes = false,
  onDocumentsChange,
  selectedDocs,
  onSelectedDocsChange 
}: DocumentTableProps) {
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);

  const getWorkflowDisplayName = (workflowId: string): string => {
    const workflowNames: Record<string, string> = {
      "poem-generator": "Poem Generator",
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

  return (
    <>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              {showCheckboxes && (
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedDocs?.size === documents.length && documents.length > 0}
                    onCheckedChange={selectAll}
                  />
                </TableHead>
              )}
              <TableHead className="font-medium">Title</TableHead>
              <TableHead className="hidden sm:table-cell font-medium">Workflow</TableHead>
              <TableHead className="hidden md:table-cell font-medium">Status</TableHead>
              <TableHead className="hidden lg:table-cell font-medium">Updated</TableHead>
              <TableHead className="text-right font-medium">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.map((doc, index) => {
              const documentUrl = doc.workflowId.includes("-generator") 
                ? `/w/${doc.workflowId.replace("-generator", "")}/${doc.id}`
                : `/w/${doc.workflowId}/${doc.id}`;

              return (
                <TableRow 
                  key={`${doc.id}-${index}`}
                  className={cn(
                    "hover:bg-muted/50 transition-colors",
                    index !== documents.length - 1 && "border-b"
                  )}
                >
                  {showCheckboxes && (
                    <TableCell>
                      <Checkbox
                        checked={selectedDocs?.has(doc.id) || false}
                        onCheckedChange={() => toggleDocSelection(doc.id)}
                      />
                    </TableCell>
                  )}
                  <TableCell className="font-medium max-w-[300px]">
                    <div className="truncate">{doc.title}</div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                    {getWorkflowDisplayName(doc.workflowId)}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge 
                      variant={doc.status === 'completed' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {doc.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(doc.updatedAt), { addSuffix: true })}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={documentUrl}>
                          <Edit className="h-4 w-4" />
                          <span className="hidden sm:inline ml-1">Open</span>
                        </Link>
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
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
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete document?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your document.
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