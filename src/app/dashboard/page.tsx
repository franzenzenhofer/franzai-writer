"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { allWorkflows } from "@/lib/workflow-loader";
import type { WizardDocument, Workflow } from "@/types";
import { FileText, ArrowRight, AlertCircle, PlusCircle, Info, LogIn, User, Loader2, ChevronRight } from "lucide-react";
import { useAuth } from "@/components/layout/app-providers";
import { clientDocumentPersistence } from '@/lib/document-persistence-client';
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { DocumentTable } from "@/components/documents/document-table";
import { cn } from "@/lib/utils";

function getWorkflowName(workflowId: string) {
  const workflow = allWorkflows.find(w => w.id === workflowId);
  return workflow ? workflow.name : "Unknown Workflow";
}

export default function DashboardPage() {
  const { user, effectiveUser, loading: authLoading } = useAuth(); 
  const { toast } = useToast();
  const [documents, setDocuments] = useState<WizardDocument[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);

  const log = (operation: string, data?: any) => {
    console.log(`[Dashboard] ${operation}`, data || '');
  };

  const logError = (operation: string, error: any) => {
    console.error(`[Dashboard] FAILED: ${operation}`, error);
  };

  const loadDocuments = useCallback(async () => {
    setDocumentsLoading(true);
    try {
      log('Loading documents', { hasUser: !!effectiveUser, isTemp: effectiveUser?.isTemporary });
      
      const userDocs = await clientDocumentPersistence.listUserDocuments(effectiveUser?.uid);
      
      if (!Array.isArray(userDocs)) {
        throw new Error('FATAL: Invalid documents data received');
      }
      
      // Remove duplicates based on document ID
      const uniqueDocs = Array.from(
        new Map(userDocs.map(doc => [doc.id, doc])).values()
      );
      
      if (uniqueDocs.length !== userDocs.length) {
        console.warn(`[Dashboard] Found duplicate documents: ${userDocs.length - uniqueDocs.length} duplicates removed`);
      }
      
      setDocuments(uniqueDocs);
      log('Documents loaded successfully', { count: uniqueDocs.length });
      
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
  }, [effectiveUser, toast]);

  // Load documents on mount - FAIL HARD if error
  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);


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
        {!authLoading && !effectiveUser ? (
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
          <DocumentTable 
            documents={documents} 
            onDocumentsChange={loadDocuments}
          />
        )}
      </div>
    </div>
  );
}