"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { allWorkflows } from "@/lib/workflow-loader";
import type { WizardDocument, Workflow } from "@/types";
import { FileText, ArrowRight, AlertCircle, PlusCircle, Info, LogIn, User, Loader2, Trash2, Edit, Clock, ChevronRight } from "lucide-react";
import { useAuth } from "@/components/layout/app-providers";
import { documentPersistence } from '@/lib/document-persistence';
import { useToast } from "@/hooks/use-toast";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

function getWorkflowName(workflowId: string) {
  const workflow = allWorkflows.find(w => w.id === workflowId);
  return workflow ? workflow.name : "Unknown Workflow";
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth(); 
  const { toast } = useToast();
  const [documents, setDocuments] = useState<WizardDocument[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);

  const log = (operation: string, data?: any) => {
    console.log(`[Dashboard] ${operation}`, data || '');
  };

  const logError = (operation: string, error: any) => {
    console.error(`[Dashboard] FAILED: ${operation}`, error);
  };

  const loadDocuments = useCallback(async () => {
    setDocumentsLoading(true);
    try {
      log('Loading documents', { hasUser: !!user });
      
      const userDocs = await documentPersistence.listUserDocuments(user?.uid);
      
      if (!Array.isArray(userDocs)) {
        throw new Error('FATAL: Invalid documents data received');
      }
      
      setDocuments(userDocs);
      log('Documents loaded successfully', { count: userDocs.length });
      
    } catch (error: any) {
      logError('loadDocuments', error);
      
      // FAIL HARD - show error to user
      toast({
        title: 'Failed to load documents',
        description: error.message || 'Unable to load your documents. Please try again.',
        variant: 'destructive',
      });
      
      // Set empty array on failure
      setDocuments([]);
    } finally {
      setDocumentsLoading(false);
    }
  }, [user, toast]);

  // Load documents on mount - FAIL HARD if error
  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const handleDeleteDocument = async (documentId: string) => {
    setDocumentToDelete(documentId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!documentToDelete?.trim()) {
      toast({
        title: 'Delete failed',
        description: 'Invalid document ID',
        variant: 'destructive',
      });
      return;
    }

    try {
      log('Deleting document', { documentId: documentToDelete });
      
      const success = await documentPersistence.deleteDocument(documentToDelete);
      
      if (!success) {
        throw new Error('Delete operation returned false');
      }
      
      toast({
        title: 'Document deleted',
        description: 'Your document has been deleted successfully.',
      });
      
      // Reload documents to reflect changes
      await loadDocuments();
      
    } catch (error: any) {
      logError('confirmDelete', error);
      
      toast({
        title: 'Delete failed',
        description: error.message || 'Unable to delete the document. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setDeleteDialogOpen(false);
      setDocumentToDelete(null);
    }
  };

  return (
    <div className="container max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-8">
      {/* Workflow Selection - Compact Table */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold font-headline mb-4">Start a new document</h1>

        {allWorkflows.length === 0 ? (
          <div className="text-center py-8 border rounded-lg bg-muted/50">
            <AlertCircle className="mx-auto h-10 w-10 text-muted-foreground" />
            <h3 className="mt-2 text-lg font-semibold">No Workflows Available</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              It looks like no workflows are set up yet. Contact an administrator.
            </p>
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-medium">Workflow</TableHead>
                  <TableHead className="hidden sm:table-cell font-medium">Description</TableHead>
                  <TableHead className="text-right font-medium">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allWorkflows.map((workflow, index) => (
                  <TableRow 
                    key={workflow.id} 
                    className={cn(
                      "hover:bg-muted/50 transition-colors",
                      index !== allWorkflows.length - 1 && "border-b"
                    )}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-600" />
                        {workflow.name}
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                      {workflow.description}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                          className="hidden sm:inline-flex"
                        >
                          <Link 
                            href={`/workflow-details/${workflow.id}`}
                            id={`workflow-details-${workflow.id}`}
                            data-testid={`workflow-details-${workflow.id}`}
                          >
                            <Info className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button 
                          asChild 
                          size="sm"
                          className="bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                          <Link 
                            href={workflow.shortName ? `/w/${workflow.shortName}/new` : `/w/new/${workflow.id}`}
                            id={`workflow-start-${workflow.id}`}
                            data-testid={`workflow-start-${workflow.id}`}
                          >
                            Start
                            <ChevronRight className="ml-1 h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Recent Documents - Compact Table */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold font-headline mb-4">Recent documents</h2>
        {!authLoading && !user ? (
          <Card className="py-8">
            <CardContent className="text-center space-y-4">
              <User className="mx-auto h-10 w-10 text-muted-foreground" />
              <div>
                <h3 className="text-lg font-semibold">Ready to Save Your Work?</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Log in or sign up to keep track of your documents.
                </p>
              </div>
              <Button asChild size="sm" className="mx-auto">
                <Link 
                  href="/login"
                  id="dashboard-login-button"
                  data-testid="dashboard-login-button"
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  Login / Sign Up
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : documentsLoading ? (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableBody>
                {[1, 2, 3].map((i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-8 border rounded-lg bg-muted/50">
            <FileText className="mx-auto h-10 w-10 text-muted-foreground" />
            <h3 className="mt-2 text-lg font-semibold">No documents yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Start creating documents and they&apos;ll appear here.
            </p>
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-medium">Title</TableHead>
                  <TableHead className="hidden sm:table-cell font-medium">Workflow</TableHead>
                  <TableHead className="hidden md:table-cell font-medium">Status</TableHead>
                  <TableHead className="hidden lg:table-cell font-medium">Updated</TableHead>
                  <TableHead className="text-right font-medium">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((doc, index) => {
                  const workflow = allWorkflows.find(w => w.id === doc.workflowId);
                  const documentUrl = workflow?.shortName 
                    ? `/w/${workflow.shortName}/${doc.id}` 
                    : `/w/${doc.id}`;

                  return (
                    <TableRow 
                      key={doc.id}
                      className={cn(
                        "hover:bg-muted/50 transition-colors",
                        index !== documents.length - 1 && "border-b"
                      )}
                    >
                      <TableCell className="font-medium max-w-[300px]">
                        <div className="truncate">{doc.title}</div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                        {getWorkflowName(doc.workflowId)}
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
                          {new Date(doc.updatedAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={documentUrl}>
                              <Edit className="h-4 w-4" />
                              <span className="hidden sm:inline ml-1">Continue</span>
                            </Link>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteDocument(doc.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
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
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}