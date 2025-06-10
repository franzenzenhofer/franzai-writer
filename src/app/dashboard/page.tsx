import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { mockDocuments, mockWorkflows } from "@/lib/mock-data"; // Assuming mock data for now
import type { WizardDocument } from "@/types";
import { PlusCircle, FileText, Edit3, Trash2, Copy } from "lucide-react";
import { Badge } from "@/components/ui/badge";

function getWorkflowName(workflowId: string) {
  const workflow = mockWorkflows.find(w => w.id === workflowId);
  return workflow ? workflow.name : "Unknown Workflow";
}

function DocumentCard({ document }: { document: WizardDocument }) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="font-headline text-lg">{document.title}</CardTitle>
        <CardDescription className="text-xs">
          Type: {getWorkflowName(document.workflowId)} <br />
          Last updated: {new Date(document.updatedAt).toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <Badge variant={document.status === "completed" ? "default" : "secondary"}>
          {document.status.charAt(0).toUpperCase() + document.status.slice(1)}
        </Badge>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/wizard/${document.id}`}>
            <Edit3 className="mr-1 h-4 w-4" /> View/Edit
          </Link>
        </Button>
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
          <Copy className="mr-1 h-4 w-4" /> Duplicate
        </Button>
        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive/80">
          <Trash2 className="mr-1 h-4 w-4" /> Delete
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function DashboardPage() {
  const documents = mockDocuments; // Replace with actual data fetching

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold font-headline">Dashboard</h1>
        {/* This button would ideally open a modal or navigate to a creation page */}
        <Button asChild> 
          <Link href="/wizard/new"> {/* Assuming /wizard/new initiates document creation */}
            <PlusCircle className="mr-2 h-5 w-5" /> Create New Document
          </Link>
        </Button>
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-xl font-semibold font-headline">No Documents Yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Get started by creating a new document.
          </p>
          <div className="mt-6">
            <Button asChild>
              <Link href="/wizard/new">
                <PlusCircle className="mr-2 h-4 w-4" /> Create Document
              </Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((doc) => (
            <DocumentCard key={doc.id} document={doc} />
          ))}
        </div>
      )}
    </div>
  );
}
