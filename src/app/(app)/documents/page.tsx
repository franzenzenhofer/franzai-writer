"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/components/layout/app-providers";
import { WizardDocument } from "@/types";
import type { Asset } from "@/types";
import { listUserDocuments, deleteDocuments as deleteDocumentsAction } from "@/lib/document-actions";
import { assetManager } from "@/lib/asset-manager";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, FileText, ChevronDown, Search, Filter, Trash2, Download, Calendar, Hash, Layout, List, Grid } from "lucide-react";
import Link from "next/link";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { DocumentTable } from "@/components/documents/document-table";
import { EnhancedDocumentTable } from "@/components/documents/enhanced-document-table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow, format } from "date-fns";

type SortOption = "recent" | "oldest" | "title" | "workflow" | "status";
type ViewMode = "list" | "grid";

export default function DocumentsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [documents, setDocuments] = useState<WizardDocument[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<WizardDocument[]>([]);
  const [documentAssets, setDocumentAssets] = useState<Record<string, Asset[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWorkflow, setSelectedWorkflow] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const [selectedDocs, setSelectedDocs] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("list"); // Always list per requirements

  // Load documents and their associated assets
  useEffect(() => {
    async function loadDocumentsAndAssets() {
      if (!user) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Load documents
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
        
        // Load all user assets to find document associations
        try {
          const allAssets = await assetManager.getUserAssets(user.uid, {
            includeDeleted: false
          });
          
          // Group assets by document ID
          const assetsByDoc: Record<string, Asset[]> = {};
          allAssets.forEach(asset => {
            asset.documentIds.forEach(docId => {
              if (!assetsByDoc[docId]) {
                assetsByDoc[docId] = [];
              }
              assetsByDoc[docId].push(asset);
            });
          });
          
          setDocumentAssets(assetsByDoc);
        } catch (assetErr) {
          console.error("Failed to load document assets:", assetErr);
          // Don't fail the whole page if assets fail to load
        }
      } catch (err) {
        console.error("Error loading documents:", err);
        setError("Failed to load documents. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadDocumentsAndAssets();
  }, [user]);

  // Filter and sort documents
  const processedDocuments = useMemo(() => {
    let filtered = [...documents];

    // Filter by search query - search in title, workflow, and document ID
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(doc => 
        doc.title.toLowerCase().includes(query) ||
        doc.workflowId.toLowerCase().includes(query) ||
        doc.id.toLowerCase().includes(query) ||
        getWorkflowDisplayName(doc.workflowId).toLowerCase().includes(query)
      );
    }

    // Filter by workflow
    if (selectedWorkflow !== "all") {
      filtered = filtered.filter(doc => doc.workflowId === selectedWorkflow);
    }
    
    // Filter by status
    if (selectedStatus !== "all") {
      filtered = filtered.filter(doc => doc.status === selectedStatus);
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
        case "status":
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

    return filtered;
  }, [documents, searchQuery, selectedWorkflow, selectedStatus, sortBy]);
  
  // Update filtered documents when processed documents change
  useEffect(() => {
    setFilteredDocuments(processedDocuments);
  }, [processedDocuments]);

  // Update bulk actions visibility
  useEffect(() => {
    setShowBulkActions(selectedDocs.size > 0);
  }, [selectedDocs]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalDocs = documents.length;
    const completedDocs = documents.filter(d => d.status === "completed").length;
    const draftDocs = documents.filter(d => d.status === "draft").length;
    const inProgressDocs = documents.filter(d => d.status === "in-progress").length;
    
    // Count documents with images
    const docsWithImages = documents.filter(doc => 
      documentAssets[doc.id]?.some(asset => asset.type === "image")
    ).length;
    
    return { totalDocs, completedDocs, draftDocs, inProgressDocs, docsWithImages };
  }, [documents, documentAssets]);
  
  // Get unique workflows and statuses
  const workflows = Array.from(new Set(documents.map(doc => doc.workflowId)));
  const statuses = Array.from(new Set(documents.map(doc => doc.status)));


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
      "poem": "Poem Generator",
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
      <PageHeader 
        title="All Documents"
        description="Manage and organize all your AI-generated documents in one place."
      />
      
      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <StatCard
          label="Total Documents"
          value={stats.totalDocs}
          icon={FileText}
        />
        <StatCard
          label="Completed"
          value={stats.completedDocs}
          icon={FileText}
          description={`${Math.round((stats.completedDocs / Math.max(stats.totalDocs, 1)) * 100)}%`}
        />
        <StatCard
          label="In Progress"
          value={stats.inProgressDocs}
          icon={FileText}
        />
        <StatCard
          label="Drafts"
          value={stats.draftDocs}
          icon={FileText}
        />
        <StatCard
          label="With Images"
          value={stats.docsWithImages}
          icon={FileText}
          description={`${Math.round((stats.docsWithImages / Math.max(stats.totalDocs, 1)) * 100)}%`}
        />
      </div>

      {/* Filters and Actions */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              data-testid="documents-search-input"
              placeholder="Search by title, workflow, or document ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Workflow Filter */}
          <Select value={selectedWorkflow} onValueChange={setSelectedWorkflow}>
            <SelectTrigger className="w-full lg:w-[200px]" data-testid="workflow-filter-select">
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
          
          {/* Status Filter */}
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-full lg:w-[150px]" data-testid="status-filter-select">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="completed">
                <div className="flex items-center">
                  <Badge variant="default" className="mr-2">Completed</Badge>
                </div>
              </SelectItem>
              <SelectItem value="in-progress">
                <div className="flex items-center">
                  <Badge variant="secondary" className="mr-2">In Progress</Badge>
                </div>
              </SelectItem>
              <SelectItem value="draft">
                <div className="flex items-center">
                  <Badge variant="outline" className="mr-2">Draft</Badge>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Sort */}
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
            <SelectTrigger className="w-full lg:w-[180px]" data-testid="documents-sort-select">
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4" />
                  Most Recent
                </div>
              </SelectItem>
              <SelectItem value="oldest">
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4" />
                  Oldest First
                </div>
              </SelectItem>
              <SelectItem value="title">
                <div className="flex items-center">
                  <Hash className="mr-2 h-4 w-4" />
                  Title (A-Z)
                </div>
              </SelectItem>
              <SelectItem value="workflow">
                <div className="flex items-center">
                  <Layout className="mr-2 h-4 w-4" />
                  Workflow Type
                </div>
              </SelectItem>
              <SelectItem value="status">
                <div className="flex items-center">
                  <Filter className="mr-2 h-4 w-4" />
                  Status
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Bulk Actions */}
        {showBulkActions && (
          <div className="flex items-center gap-4 p-4 bg-muted rounded-lg" data-testid="documents-bulk-actions">
            <Checkbox
              checked={selectedDocs.size === filteredDocuments.length}
              onCheckedChange={() => {
                if (selectedDocs.size === filteredDocuments.length) {
                  setSelectedDocs(new Set());
                } else {
                  setSelectedDocs(new Set(filteredDocuments.map(doc => doc.id)));
                }
              }}
              data-testid="select-all-documents"
            />
            <span className="text-sm font-medium" data-testid="selected-documents-count">
              {selectedDocs.size} document{selectedDocs.size !== 1 ? "s" : ""} selected
            </span>
            <div className="flex gap-2 ml-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportDocuments(Array.from(selectedDocs))}
                data-testid="bulk-export-documents"
              >
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => deleteDocuments(Array.from(selectedDocs))}
                data-testid="bulk-delete-documents"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedDocs(new Set())}
                data-testid="bulk-cancel-documents"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Results summary */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredDocuments.length} of {documents.length} documents
          {searchQuery && ` matching "${searchQuery}"`}
        </p>
      </div>

      {/* Documents Display */}
      {filteredDocuments.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No documents found"
          description={
            searchQuery || selectedWorkflow !== "all" || selectedStatus !== "all"
              ? "Try adjusting your filters or search query."
              : documents.length === 0 
                ? "Start creating documents to see them here."
                : "No matching documents found."
          }
        >
          {documents.length === 0 && (
            <Button asChild>
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          )}
        </EmptyState>
      ) : (
        <EnhancedDocumentTable 
          documents={filteredDocuments}
          documentAssets={documentAssets}
          showCheckboxes={true}
          onDocumentsChange={reloadDocuments}
          selectedDocs={selectedDocs}
          onSelectedDocsChange={setSelectedDocs}
        />
      )}
    </div>
  );
}