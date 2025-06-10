import type { Workflow } from "@/types";

// Import workflow JSON files directly
// Ensure your tsconfig.json has "resolveJsonModule": true (it should by default with Next.js)
import targetedPageSeoOptimizedV3WorkflowData from "@/workflows/targeted-page-seo-optimized-v3/workflow.json";
import recipeSeoOptimizedWorkflowData from "@/workflows/recipe-seo-optimized/workflow.json";

// Cast the imported JSON data to the Workflow type
const targetedPageSeoOptimizedV3Workflow: Workflow = targetedPageSeoOptimizedV3WorkflowData as Workflow;
const recipeSeoOptimizedWorkflow: Workflow = recipeSeoOptimizedWorkflowData as Workflow;

export const allWorkflows: Workflow[] = [
  targetedPageSeoOptimizedV3Workflow,
  recipeSeoOptimizedWorkflow,
  // Add other imported workflows here
];

export function getWorkflowById(id: string): Workflow | undefined {
  return allWorkflows.find(wf => wf.id === id);
}

export function getWorkflowByShortName(shortName: string): Workflow | undefined {
  return allWorkflows.find(wf => wf.shortName === shortName);
}
