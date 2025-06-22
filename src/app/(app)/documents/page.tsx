"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/layout/app-providers";
import { WizardDocument } from "@/types";
import { listUserDocuments, deleteDocuments as deleteDocumentsAction } from "@/lib/document-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, FileText, ChevronDown, Search, Filter, Trash2, Download } from "lucide-react";
import Link from "next/link";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { DocumentTable } from "@/components/documents/document-table";

type SortOption = "recent" | "oldest" | "title" | "workflow";

export default function DocumentsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [documents, setDocuments] = useState<WizardDocument[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<WizardDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWorkflow, setSelectedWorkflow] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const [selectedDocs, setSelectedDocs] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Load documents
  useEffect(() => {
    async function loadDocuments() {
      try {
        setLoading(true);
        setError(null);
        const docs = await listUserDocuments();
        
        // Remove duplicates based on document ID
        const uniqueDocs = Array.from(
          new Map(docs.map(doc => [doc.id, doc])).values()
        );
        
        if (uniqueDocs.length !== docs.length) {
          console.warn(`[Documents] Found duplicate documents: ${docs.length - uniqueDocs.length} duplicates removed`);
        }
        
        setDocuments(uniqueDocs);
        setFilteredDocuments(uniqueDocs);
      } catch (err) {
        console.error("Error loading documents:", err);
        setError("Failed to load documents. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadDocuments();
  }, [user]);

  // Filter and sort documents
  useEffect(() => {
    let filtered = [...documents];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(doc => 
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.workflowId.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by workflow
    if (selectedWorkflow !== "all") {
      filtered = filtered.filter(doc => doc.workflowId === selectedWorkflow);
    }

    // Sort documents
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "recent":
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case "oldest":
          return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
        case "title":
          return a.title.localeCompare(b.title);
        case "workflow":
          return a.workflowId.localeCompare(b.workflowId);
        default:
          return 0;
      }
    });

    setFilteredDocuments(filtered);
  }, [documents, searchQuery, selectedWorkflow, sortBy]);

  // Update bulk actions visibility
  useEffect(() => {
    setShowBulkActions(selectedDocs.size > 0);
  }, [selectedDocs]);

  // Get unique workflows
  const workflows = Array.from(new Set(documents.map(doc => doc.workflowId)));


  // Delete documents
  const deleteDocuments = async (docIds: string[]) => {
    try {
      const result = await deleteDocumentsAction(docIds);
      if (result.success || result.deleted.length > 0) {
        toast({
          title: "Documents deleted",
          description: `${result.deleted.length} document(s) deleted successfully.`,
        });
        // Clear selection
        setSelectedDocs(new Set());
        // Reload documents
        const docs = await listUserDocuments();
        const uniqueDocs = Array.from(
          new Map(docs.map(doc => [doc.id, doc])).values()
        );
        setDocuments(uniqueDocs);
        setFilteredDocuments(uniqueDocs);
      } else {
        throw new Error("Delete failed");
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to delete documents.",
        variant: "destructive",
      });
    }
  };

  // Export documents
  const exportDocuments = async (docIds: string[]) => {
    try {
      // TODO: Implement bulk export
      toast({
        title: "Coming soon",
        description: "Bulk export functionality will be available soon.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to export documents.",
        variant: "destructive",
      });
    }
  };

  const getWorkflowDisplayName = (workflowId: string): string => {
    const workflowNames: Record<string, string> = {
      "poem-generator": "Poem Generator",
      "recipe-seo-optimized": "SEO Recipe",
      "press-release": "Press Release",
      "targeted-page-seo": "SEO Article",
    };
    return workflowNames[workflowId] || workflowId;
  };

  const reloadDocuments = async () => {
    const docs = await listUserDocuments();
    // Deduplicate documents
    const uniqueDocs = Array.from(new Map(docs.map(doc => [doc.id, doc])).values());
    setDocuments(uniqueDocs);
    setFilteredDocuments(uniqueDocs);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <Skeleton className="h-10 w-48 mb-8" />
        <div className="space-y-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">All Documents</h1>
        <p className="text-muted-foreground">
          Manage and organize all your AI-generated documents in one place.
        </p>
      </div>

      {/* Filters and Actions */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Workflow Filter */}
          <Select value={selectedWorkflow} onValueChange={setSelectedWorkflow}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="All workflows" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All workflows</SelectItem>
              {workflows.map((workflow) => (
                <SelectItem key={workflow} value={workflow}>
                  {getWorkflowDisplayName(workflow)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sort */}
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
            <SelectTrigger className="w-full sm:w-48">
              <ChevronDown className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="title">Title (A-Z)</SelectItem>
              <SelectItem value="workflow">Workflow Type</SelectItem>
            </SelectContent>
          </Select>

        </div>

        {/* Bulk Actions */}
        {showBulkActions && (
          <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
            <Checkbox
              checked={selectedDocs.size === filteredDocuments.length}
              onCheckedChange={() => {
                if (selectedDocs.size === filteredDocuments.length) {
                  setSelectedDocs(new Set());
                } else {
                  setSelectedDocs(new Set(filteredDocuments.map(doc => doc.id)));
                }
              }}
            />
            <span className="text-sm font-medium">
              {selectedDocs.size} document{selectedDocs.size !== 1 ? "s" : ""} selected
            </span>
            <div className="flex gap-2 ml-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportDocuments(Array.from(selectedDocs))}
              >
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => deleteDocuments(Array.from(selectedDocs))}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedDocs(new Set())}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Document count */}
      <div className="mb-4 text-sm text-muted-foreground">
        Showing {filteredDocuments.length} of {documents.length} documents
      </div>

      {/* Empty State */}
      {filteredDocuments.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No documents found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery || selectedWorkflow !== "all"
              ? "Try adjusting your filters or search query."
              : "Start creating documents to see them here."}
          </p>
          <Button asChild>
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </div>
      ) : (
        <DocumentTable 
          documents={filteredDocuments}
          showCheckboxes={true}
          onDocumentsChange={reloadDocuments}
          selectedDocs={selectedDocs}
          onSelectedDocsChange={setSelectedDocs}
        />
      )}
    </div>
  );
}