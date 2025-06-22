"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/layout/app-providers";
import { WizardDocument } from "@/types/wizard-types";
import { listUserDocuments } from "@/lib/document-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, FileText, Clock, ChevronDown, Search, Filter, Grid, List, Copy, Trash2, Download, ExternalLink } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Alert, AlertDescription } from "@/components/ui/alert";
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

type ViewMode = "grid" | "list";
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
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [selectedDocs, setSelectedDocs] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Load documents
  useEffect(() => {
    async function loadDocuments() {
      try {
        setLoading(true);
        setError(null);
        const docs = await listUserDocuments();
        setDocuments(docs);
        setFilteredDocuments(docs);
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

  // Toggle document selection
  const toggleDocSelection = (docId: string) => {
    const newSelection = new Set(selectedDocs);
    if (newSelection.has(docId)) {
      newSelection.delete(docId);
    } else {
      newSelection.add(docId);
    }
    setSelectedDocs(newSelection);
  };

  // Select all documents
  const selectAll = () => {
    if (selectedDocs.size === filteredDocuments.length) {
      setSelectedDocs(new Set());
    } else {
      setSelectedDocs(new Set(filteredDocuments.map(doc => doc.id)));
    }
  };

  // Copy document
  const copyDocument = async (doc: WizardDocument) => {
    try {
      // TODO: Implement document copy functionality
      toast({
        title: "Coming soon",
        description: "Document copy functionality will be available soon.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy document.",
        variant: "destructive",
      });
    }
  };

  // Delete documents
  const deleteDocuments = async (docIds: string[]) => {
    try {
      // TODO: Implement document deletion
      toast({
        title: "Coming soon",
        description: "Document deletion functionality will be available soon.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete documents.",
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

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <Skeleton className="h-10 w-48 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-48" />
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

          {/* View Mode */}
          <div className="flex gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("grid")}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Bulk Actions */}
        {showBulkActions && (
          <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
            <Checkbox
              checked={selectedDocs.size === filteredDocuments.length}
              onCheckedChange={selectAll}
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
        <Card className="p-12 text-center">
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
        </Card>
      ) : (
        /* Document Grid/List */
        <div
          className={cn(
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-4"
          )}
        >
          {filteredDocuments.map((doc) => (
            <Card
              key={doc.id}
              className={cn(
                "group relative transition-shadow hover:shadow-lg",
                viewMode === "list" && "flex"
              )}
            >
              {/* Selection Checkbox */}
              <div className="absolute top-4 left-4 z-10">
                <Checkbox
                  checked={selectedDocs.has(doc.id)}
                  onCheckedChange={() => toggleDocSelection(doc.id)}
                  className="bg-background"
                />
              </div>

              <CardHeader className={cn(viewMode === "list" && "flex-1")}>
                <div className="flex items-start justify-between">
                  <div className="flex-1 pr-8">
                    <CardTitle className="line-clamp-2">{doc.title}</CardTitle>
                    <CardDescription className="mt-1">
                      <Badge variant="secondary" className="mb-2">
                        {getWorkflowDisplayName(doc.workflowId)}
                      </Badge>
                      <div className="flex items-center gap-2 text-xs">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(doc.updatedAt), { addSuffix: true })}
                      </div>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              {viewMode === "grid" && (
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {doc.completedStages?.length || 0} stages completed
                  </p>
                </CardContent>
              )}

              <CardFooter className={cn("pt-4", viewMode === "list" && "ml-auto")}>
                <div className="flex gap-2 w-full">
                  <Button variant="outline" size="sm" asChild className="flex-1">
                    <Link href={`/w/${doc.workflowId.replace("-generator", "")}/${doc.id}`}>
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Open
                    </Link>
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
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
                        onClick={() => deleteDocuments([doc.id])}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}