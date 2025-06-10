
import { WizardShell } from "@/components/wizard/wizard-shell";
import { getWorkflowById } from "@/lib/workflow-loader"; // Updated import
import { notFound } from "next/navigation";
import type { WizardDocument, WizardInstance, StageState, Workflow } from "@/types";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { CreateNewDocumentDialog } from "@/components/wizard/create-new-document-dialog";


export default function WizardPage({ params }: { params: { pageId: string } }) {
  
  if (params.pageId === "new") {
    return (
      <div className="flex flex-col items-center justify-center text-center py-12">
        <CreateNewDocumentDialog />
         <p className="text-xs text-muted-foreground mt-8">
            Or go back to <Link href="/dashboard" className="underline hover:text-primary">Dashboard</Link>.
        </p>
      </div>
    );
  }

  let wizardInstance: WizardInstance | undefined;
  let dynamicTitle = "New Document"; 

  if (params.pageId.startsWith("_new_")) {
    const workflowId = params.pageId.substring("_new_".length);
    const workflow = getWorkflowById(workflowId); // Use new loader function

    if (!workflow) {
      notFound();
    }

    dynamicTitle = `New ${workflow.name}`;
    const newDoc: WizardDocument = {
      id: `temp-${Date.now()}`, 
      title: dynamicTitle,
      workflowId: workflow.id,
      status: "draft",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: "user-123", 
    };

    const initialStageStates: Record<string, StageState> = {};
    workflow.stages.forEach(stage => {
      initialStageStates[stage.id] = {
        stageId: stage.id,
        status: "idle",
        userInput: stage.formFields 
          ? Object.fromEntries(stage.formFields.map(f => [f.name, f.defaultValue ?? (f.type === 'checkbox' ? false : '')])) 
          : stage.inputType === 'context' ? { manual: "", dropped: "" } 
          : undefined,
        output: undefined,
        error: undefined,
        completedAt: undefined,
        groundingInfo: undefined,
        isStale: false,
        depsAreMet: stage.dependencies && stage.dependencies.length > 0 ? false : true,
        shouldAutoRun: stage.autoRun && (!stage.dependencies || stage.dependencies.length === 0),
        shouldShowUpdateBadge: false,
      };
    });

    wizardInstance = {
      document: newDoc,
      workflow,
      stageStates: initialStageStates,
    };
    
    if (typeof document !== 'undefined') { 
      document.title = `${dynamicTitle} - WizardCraft AI`;
    }

  } else {
    // Logic for fetching existing documents would go here if persistence was implemented.
    // For now, any other pageId will result in "not found".
    wizardInstance = undefined; 
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
          <Button asChild variant="link" className="mt-2">
            <Link href="/wizard/new">Or create a new document</Link>
          </Button>
      </div>
    );
  }
  
  if (typeof document !== 'undefined' && !params.pageId.startsWith("_new_")) {
      document.title = `${wizardInstance.document.title} - WizardCraft AI`;
  }

  return <WizardShell initialInstance={wizardInstance} />;
}
