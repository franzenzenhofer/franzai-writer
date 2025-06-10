
import { WizardShell } from "@/components/wizard/wizard-shell";
import { getWorkflowById, allWorkflows } from "@/lib/workflow-loader";
import { notFound } from "next/navigation";
import type { WizardDocument, WizardInstance, StageState, Workflow } from "@/types";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertCircle, FileText, ArrowRight } from "lucide-react";
import { siteConfig } from "@/config/site";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter, CardContent } from "@/components/ui/card";

export default function WizardPage({ params }: { params: { pageId: string } }) {
  
  if (params.pageId === "new") {
    return (
      <div className="space-y-8">
        <div className="text-center">
            <h1 className="text-3xl font-bold font-headline">Create New Document</h1>
            <p className="text-muted-foreground">Select a workflow to get started.</p>
        </div>
        {allWorkflows.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-xl font-semibold font-headline">No Workflows Available</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                    Contact an administrator to add workflows.
                </p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {allWorkflows.map(workflow => (
                    <Card key={workflow.id} className="flex flex-col">
                        <CardHeader>
                            <CardTitle className="font-headline">{workflow.name}</CardTitle>
                            <CardDescription className="h-20 text-ellipsis overflow-hidden">{workflow.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow">
                            {/* Placeholder for potential workflow tags or icons */}
                        </CardContent>
                        <CardFooter>
                            <Button asChild className="w-full">
                                <Link href={`/wizard/_new_${workflow.id}`}>
                                    Select Workflow <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        )}
         <p className="text-xs text-muted-foreground mt-8 text-center">
            Or go back to <Link href="/dashboard" className="underline hover:text-primary">Dashboard</Link>.
        </p>
      </div>
    );
  }

  let wizardInstance: WizardInstance | undefined;
  let dynamicTitle = "New Document"; 

  if (params.pageId.startsWith("_new_")) {
    const workflowId = params.pageId.substring("_new_".length);
    const workflow = getWorkflowById(workflowId); 

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
        isEditingOutput: false,
      };
    });

    wizardInstance = {
      document: newDoc,
      workflow,
      stageStates: initialStageStates,
    };
    
    if (typeof document !== 'undefined') { 
      document.title = `${dynamicTitle} - ${siteConfig.name}`;
    }

  } else {
    // Logic for fetching existing documents would go here if persistence was implemented.
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
      document.title = `${wizardInstance.document.title} - ${siteConfig.name}`;
  }

  return <WizardShell initialInstance={wizardInstance} />;
}

