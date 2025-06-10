
import type { WizardInstance, StageState, Workflow } from "@/types";
import { allWorkflows, getWorkflowById } from "./workflow-loader";

// Re-export allWorkflows for convenience if other parts of the app used mockWorkflows directly by this name
export const mockWorkflows: Workflow[] = allWorkflows;

// This function is now primarily for creating NEW, EMPTY wizard instances.
// It no longer holds pre-filled document states.
export const getMockWizardInstance = (documentId: string): WizardInstance | undefined => {
  // Logic for creating a NEW instance based on a workflow ID
  // This is typically handled by /wizard/[pageId]/page.tsx when pageId starts with _new_
  // This function might be deprecated or simplified further if all new instance creation
  // is centralized in the page component.

  // For now, if a specific documentId is passed that isn't a "_new_" request,
  // it implies fetching an existing document, which is not supported without a database.
  // So, it will return undefined.
  return undefined;
};
