import { getWorkflowById } from "@/lib/workflow-loader";
import { notFound, redirect } from "next/navigation";
import { generateUniqueId } from "@/lib/utils";
import type { WizardDocument, StageState } from "@/types";
import { createDocument } from "@/lib/documents";

export default async function NewDocumentPage({ 
  params 
}: { 
  params: Promise<{ workflowId: string }> 
}) {
  const { workflowId } = await params;
  
  const workflow = getWorkflowById(workflowId);
  
  if (!workflow) {
    notFound();
  }

  // Generate unique document ID
  const documentId = generateUniqueId();
  
  // Create the initial stage states
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

  // Note: In a real app, you might want to create the document in the database here
  // For now, we'll let the wizard page handle the actual creation when the user interacts
  
  // Redirect to the simplified URL structure
  redirect(`/w/${documentId}?new=${workflowId}`);
} 