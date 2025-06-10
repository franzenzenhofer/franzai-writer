import { WizardShell } from "@/components/wizard/wizard-shell";
import { getMockWizardInstance, mockWorkflows, mockDocuments } from "@/lib/mock-data";
import { notFound } from "next/navigation";
import type { WizardDocument } from "@/types";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertCircle, Wand2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


// This component will be server-side to fetch initial data.
// WizardShell will be the client component handling interactions.

export default function WizardPage({ params }: { params: { pageId: string } }) {
  
  if (params.pageId === "new") {
    // This is a simplified "Create New Document" flow.
    // In a real app, this would likely be a form POST or a separate page.
    // For now, we'll show a dialog to select a workflow and then redirect.
    // This is not ideal for SSR but demonstrates the concept for now.
    // Proper way: A form that POSTs to a server action, creates the doc, then redirects.

    return (
      <div className="flex flex-col items-center justify-center text-center py-12">
        <Wand2 className="w-16 h-16 text-primary mb-6" />
        <h1 className="text-3xl font-bold font-headline mb-4">Create New Document</h1>
        <p className="text-muted-foreground mb-6">Select a workflow to begin your masterpiece.</p>
        <Dialog defaultOpen>
          <DialogTrigger asChild>
             {/* This button is hidden because defaultOpen is true, dialog appears automatically */}
            <Button className="hidden">Select Workflow</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="font-headline">Choose a Workflow</DialogTitle>
              <DialogDescription>
                Select the type of document you want to create.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="workflow-select" className="text-right col-span-1">
                  Workflow
                </Label>
                {/* 
                  This select ideally would be part of a form that, upon submission,
                  creates a new document and redirects. For now, we'll use a link.
                  A real implementation would use a server action.
                */}
                <Select defaultValue={mockWorkflows[0].id}>
                  <SelectTrigger id="workflow-select" className="col-span-3">
                    <SelectValue placeholder="Select a workflow" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockWorkflows.map(wf => (
                      <SelectItem key={wf.id} value={wf.id}>{wf.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              {/* This button should dynamically link to a newly created document based on selection */}
              <Button type="submit" asChild>
                {/* Simulating document creation and redirect. In real app, this would be more complex */}
                <Link href={`/wizard/${mockDocuments[0].id}`}>Start with Selected Workflow</Link>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
         <p className="text-xs text-muted-foreground mt-8">
            Note: The 'Create New' flow is simplified. In a full app, selecting a workflow would create a new document instance.
            <br /> For now, selecting a workflow above will take you to a pre-existing document {'('}"{mockDocuments[0].title}"{')'} using that workflow type for demonstration.
        </p>
      </div>
    );
  }


  const wizardInstance = getMockWizardInstance(params.pageId);

  if (!wizardInstance) {
    // If not "new" and not found, show a more specific message or redirect
    return (
      <div className="flex flex-col items-center justify-center text-center py-12">
          <AlertCircle className="w-16 h-16 text-destructive mb-6" />
          <h1 className="text-3xl font-bold font-headline mb-4">Document Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The document you are looking for does not exist or you may not have permission to view it.
          </p>
          <Button asChild variant="outline">
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
      </div>
    );
  }
  
  // Set initial document title for SSR
  // Client component WizardShell will handle dynamic updates
  if (typeof document !== 'undefined') { // Check for browser environment
      document.title = `${wizardInstance.document.title} - WizardCraft AI`;
  }


  return <WizardShell initialInstance={wizardInstance} />;
}
