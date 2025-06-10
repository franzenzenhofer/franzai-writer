
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { allWorkflows } from "@/lib/workflow-loader";
import type { WizardDocument, Workflow } from "@/types";
import { FileText, ArrowRight, AlertCircle, PlusCircle, Info } from "lucide-react";
import { useAuth } from "@/components/layout/app-providers"; // Keep useAuth if other parts of dashboard might use it later

// This function remains as documents are not persisted yet.
function getWorkflowName(workflowId: string) {
  const workflow = allWorkflows.find(w => w.id === workflowId);
  return workflow ? workflow.name : "Unknown Workflow";
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
          <Link href={`/workflow-details/${workflow.id}`}>
            <Info className="mr-2 h-4 w-4" />
            Details
          </Link>
        </Button>
        <Button asChild size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Link href={`/wizard/_new_${workflow.id}`}>
            Start <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function DashboardPage() {
  const { user, loading } = useAuth(); // user and loading can still be used for UI cues if needed

  // Removed client-side redirect:
  // if (!loading && !user) {
  //   window.location.replace('/login');
  // }

  const documents: WizardDocument[] = []; // Initialize with an empty array as documents are not persisted

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allWorkflows.map(workflow => (
              <WorkflowSelectionCard key={workflow.id} workflow={workflow} />
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-3xl font-bold font-headline mb-6 text-foreground">Recent documents</h2>
        {documents.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed rounded-lg border-border bg-card">
            <FileText className="mx-auto h-16 w-16 text-muted-foreground" />
            <h3 className="mt-4 text-2xl font-semibold font-headline">No documents yet</h3>
            <p className="mt-2 text-base text-muted-foreground">
              Once you create documents, they'll appear here.
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              (Note: Document persistence is not yet implemented in this prototype.)
            </p>
            {/* Removed the "Create a new document" button from here */}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* This part will be populated when document persistence is added */}
          </div>
        )}
      </div>
    </div>
  );
}
