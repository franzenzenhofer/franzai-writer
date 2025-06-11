"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { allWorkflows } from "@/lib/workflow-loader";
import type { WizardDocument, Workflow } from "@/types";
import { FileText, ArrowRight, AlertCircle, PlusCircle, Info, LogIn, User, Loader2, Trash2, Edit } from "lucide-react";
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

function getWorkflowName(workflowId: string) {
  const workflow = allWorkflows.find(w => w.id === workflowId);
  return workflow ? workflow.name : "Unknown Workflow";
}

function DocumentCard({ 
  document, 
  onDelete 
}: { 
  document: WizardDocument; 
  onDelete: (documentId: string) => void;
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const workflow = allWorkflows.find(w => w.id === document.workflowId);

  const handleDelete = async () => {
    setIsDeleting(true);
    await onDelete(document.id);
    setIsDeleting(false);
  };

  const documentUrl = workflow?.shortName 
    ? `/w/${workflow.shortName}/${document.id}` 
    : `/w/${document.id}`;

  return (
    <Card className="flex flex-col hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <CardTitle className="font-headline text-xl line-clamp-2">{document.title}</CardTitle>
        <CardDescription className="text-sm">
          <span className="block">{getWorkflowName(document.workflowId)}</span>
          <span className="block text-xs text-muted-foreground mt-1">
            Updated {new Date(document.updatedAt).toLocaleDateString()}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex items-center gap-2">
          <Badge 
            variant={document.status === 'completed' ? 'default' : 'secondary'}
            className="text-xs"
          >
            {document.status}
          </Badge>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <Button variant="outline" size="sm" asChild>
          <Link href={documentUrl}>
            <Edit className="mr-2 h-4 w-4" />
            Continue
          </Link>
        </Button>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={handleDelete}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4 text-destructive" />
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

function WorkflowSelectionCard({ workflow }: { workflow: Workflow }) {
  return (
    <Card className="flex flex-col hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <CardTitle className="font-headline text-xl">{workflow.name}</CardTitle>
        <CardDescription className="h-16 text-ellipsis overflow-hidden text-sm"> {/* Reduced height */}
          {workflow.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        {/* Placeholder for potential workflow tags or icons */}
      </CardContent>
      <CardFooter className="flex justify-between items-center"> {/* Changed to flex justify-between */}
        <Button variant="outline" size="sm" asChild>
          <Link 
            href={`/workflow-details/${workflow.id}`}
            id={`workflow-details-${workflow.id}`}
            data-testid={`workflow-details-${workflow.id}`}
          >
            <Info className="mr-2 h-4 w-4" />
            Details
          </Link>
        </Button>
        <Button asChild size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Link 
            href={workflow.shortName ? `/w/${workflow.shortName}/new` : `/w/new/${workflow.id}`}
            id={`workflow-start-${workflow.id}`}
            data-testid={`workflow-start-${workflow.id}`}
          >
            Start <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
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
    <div className="space-y-12">
      <div>
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-4xl font-bold font-headline text-foreground">Start a new document</h1>
        </div>

        {allWorkflows.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-lg border-border bg-card">
            <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-xl font-semibold font-headline">No Workflows Available</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              It looks like no workflows are set up yet. Contact an administrator.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {allWorkflows.map(workflow => (
              <WorkflowSelectionCard key={workflow.id} workflow={workflow} />
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-3xl font-bold font-headline mb-6 text-foreground">Recent documents</h2>
        {!authLoading && !user ? (
          <Card className="text-center py-10 bg-card shadow-md rounded-lg">
            <CardHeader className="items-center">
              <User className="text-primary h-12 w-12 mb-2" />
              <CardTitle className="mt-2 text-2xl font-semibold font-headline">
                Ready to Save Your Work?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground px-4">
                Log in or sign up to keep track of your documents and access them anytime, anywhere.
              </p>
              <Button asChild size="lg" className="w-full max-w-xs mx-auto">
                <Link 
                  href="/login"
                  id="dashboard-login-button"
                  data-testid="dashboard-login-button"
                >
                  <LogIn className="mr-2 h-5 w-5" />
                  Login / Sign Up
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : documentsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="space-y-3 p-6">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-8 w-full" />
              </Card>
            ))}
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed rounded-lg border-border bg-card">
            <FileText className="mx-auto h-16 w-16 text-muted-foreground" />
            <h3 className="mt-4 text-2xl font-semibold font-headline">No documents yet</h3>
            <p className="mt-2 text-base text-muted-foreground">
              Start creating documents and they&apos;ll appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {documents.map((doc) => (
              <DocumentCard
                key={doc.id}
                document={doc}
                onDelete={handleDeleteDocument}
              />
            ))}
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
