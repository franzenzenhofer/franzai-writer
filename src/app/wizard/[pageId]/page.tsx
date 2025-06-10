
import { WizardShell } from "@/components/wizard/wizard-shell";
import { getMockWizardInstance, mockWorkflows } from "@/lib/mock-data";
import { notFound } from "next/navigation";
import type { WizardDocument, WizardInstance, StageState, Workflow } from "@/types";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertCircle, Wand2 } from "lucide-react";
import { CreateNewDocumentDialog } from "@/components/wizard/create-new-document-dialog";


// This component will be server-side to fetch initial data.
// WizardShell will be the client component handling interactions.

export default function WizardPage({ params }: { params: { pageId: string } }) {
  
  if (params.pageId === "new") {
    return (
      <div className="flex flex-col items-center justify-center text-center py-12">
        <Wand2 className="w-16 h-16 text-primary mb-6" />
        <h1 className="text-3xl font-bold font-headline mb-4">Create New Document</h1>
        <p className="text-muted-foreground mb-6">Select a workflow to begin your masterpiece.</p>
        <CreateNewDocumentDialog />
         <p className="text-xs text-muted-foreground mt-8">
            Selecting a workflow will start a new document instance.
        </p>
      </div>
    );
  }

  let wizardInstance: WizardInstance | undefined;

  if (params.pageId.startsWith("_new_")) {
    const workflowId = params.pageId.substring("_new_".length);
    const workflow = mockWorkflows.find(w => w.id === workflowId);

    if (!workflow) {
      notFound(); // Or a more specific error page
    }

    const newDoc: WizardDocument = {
      id: `temp-${Date.now()}`, // Temporary ID, not persisted
      title: `New ${workflow.name}`, // Initial title
      workflowId: workflow.id,
      status: "draft",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: "user-123", // Placeholder, replace with actual user ID in a real app
    };

    const initialStageStates: Record<string, StageState> = {};
    workflow.stages.forEach(stage => {
      initialStageStates[stage.id] = {
        stageId: stage.id,
        status: "idle",
        userInput: stage.formFields 
          ? Object.fromEntries(stage.formFields.map(f => [f.name, f.defaultValue ?? (f.type === 'checkbox' ? false : '')])) 
          : stage.inputType === 'context' ? { manual: "", dropped: "" } // Initialize context inputs
          : undefined,
        output: undefined,
        error: undefined,
        completedAt: undefined,
        groundingInfo: undefined,
        isStale: false,
        depsAreMet: stage.dependencies && stage.dependencies.length > 0 ? false : true, // Initial check
        shouldAutoRun: stage.autoRun && (!stage.dependencies || stage.dependencies.length === 0),
        shouldShowUpdateBadge: false,
      };
    });

    wizardInstance = {
      document: newDoc,
      workflow,
      stageStates: initialStageStates,
    };
     if (typeof document !== 'undefined') { // Check for browser environment for dynamic title updates
      document.title = `${newDoc.title} - WizardCraft AI`;
    }

  } else {
    wizardInstance = getMockWizardInstance(params.pageId);
  }


  if (!wizardInstance) {
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
  
  // Set initial document title for SSR from instance if not already set by _new_ flow
  if (typeof document !== 'undefined' && !params.pageId.startsWith("_new_")) {
      document.title = `${wizardInstance.document.title} - WizardCraft AI`;
  }


  return <WizardShell initialInstance={wizardInstance} />;
}

