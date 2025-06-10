import { getWorkflowById, getWorkflowByShortName } from "@/lib/workflow-loader";
import { notFound, redirect } from "next/navigation";
import type { WizardDocument, WizardInstance, StageState } from "@/types";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { siteConfig } from "@/config/site";
import { WizardPageContent } from "./wizard-page-content";
import { getDocument } from "@/lib/documents";

export default async function WizardPage({ 
  params,
  searchParams 
}: { 
  params: Promise<{ shortName: string; documentId: string }>;
  searchParams: Promise<{ new?: string }>;
}) {
  const { shortName, documentId } = await params;
  const { new: newWorkflowId } = await searchParams;
  
  let wizardInstance: WizardInstance | undefined;
  let dynamicTitle = "New Document"; 

  // Handle new document creation via query parameter
  if (newWorkflowId) {
    const workflow = getWorkflowById(newWorkflowId);
    
    if (!workflow) {
      notFound();
    }

    // Verify the shortName matches the workflow
    if (workflow.shortName !== shortName) {
      notFound();
    }

    dynamicTitle = `New ${workflow.name}`;
    const newDoc: WizardDocument = {
      id: documentId, // Use the documentId as document ID
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
        staleDismissed: false,
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
    
    if (typeof globalThis.document !== 'undefined') { 
      globalThis.document.title = `${dynamicTitle} - ${siteConfig.name}`;
    }
  } else {
    // Get workflow by short name
    const workflow = getWorkflowByShortName(shortName);
    
    if (!workflow) {
      notFound();
    }

    // Try to load existing document by documentId
    try {
      const result = await getDocument(documentId);
      
      if (result) {
        const { document, stageStates } = result;
        
        // Verify this document belongs to the correct workflow
        if (document.workflowId !== workflow.id) {
          notFound();
        }
        
        wizardInstance = {
          document,
          workflow,
          stageStates,
        };
        dynamicTitle = document.title;
        
        if (typeof globalThis.document !== 'undefined') {
          globalThis.document.title = `${dynamicTitle} - ${siteConfig.name}`;
        }
      } else {
        // Document not found
        wizardInstance = undefined;
      }
    } catch (error) {
      console.error('Error loading document:', error);
      wizardInstance = undefined;
    }
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

  return <WizardPageContent initialInstance={wizardInstance} />;
} 