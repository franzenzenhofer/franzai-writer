import type { Workflow, Stage } from "@/types";
import { modelCapabilities, getModelCapabilities, ModelAbilities } from './model-capabilities'; // Added import

// Import workflow JSON files directly
// Ensure your tsconfig.json has "resolveJsonModule": true (it should by default with Next.js)
import targetedPageSeoOptimizedV3WorkflowData from "@/workflows/targeted-page-seo-optimized-v3/workflow.json";
import recipeSeoOptimizedWorkflowData from "@/workflows/recipe-seo-optimized/workflow.json";
import poemGeneratorWorkflowData from "@/workflows/poem-generator/workflow.json";
import geminiToolsTestWorkflowData from "@/workflows/gemini-tools-test/workflow.json";

// Cast the imported JSON data to the Workflow type
const targetedPageSeoOptimizedV3Workflow: Workflow = targetedPageSeoOptimizedV3WorkflowData as Workflow;
const recipeSeoOptimizedWorkflow: Workflow = recipeSeoOptimizedWorkflowData as Workflow;
const poemGeneratorWorkflow: Workflow = poemGeneratorWorkflowData as Workflow;
const geminiToolsTestWorkflow: Workflow = geminiToolsTestWorkflowData as Workflow;

export const allWorkflows: Workflow[] = [
  targetedPageSeoOptimizedV3Workflow,
  recipeSeoOptimizedWorkflow,
  poemGeneratorWorkflow,
  geminiToolsTestWorkflow,
  // Add other imported workflows here
];

/**
 * Verifies that the models specified in the workflow stages support the requested abilities.
 * Logs a warning for any discrepancies found.
 * @param workflow The workflow to verify.
 */
export function verifyWorkflowModels(workflow: Workflow): void {
  if (!workflow || !workflow.stages) {
    return;
  }

  workflow.stages.forEach((stage: Stage) => {
    const modelId = stage.model || workflow.defaultModel;
    if (!modelId) {
      console.warn(`Workflow Loader: Stage '${stage.id}' in workflow '${workflow.id}' does not have a model specified and no default workflow model is set.`);
      return;
    }

    const capabilities = getModelCapabilities(modelId);
    if (!capabilities) {
      console.warn(`Workflow Loader: Model '${modelId}' specified in stage '${stage.id}' (workflow '${workflow.id}') not found in modelCapabilities. Skipping verification for this model.`);
      return;
    }

    // Check for tool use
    if (stage.toolNames && stage.toolNames.length > 0 && !capabilities.toolUse) {
      console.warn(`Workflow Loader: Model '${modelId}' in stage '${stage.id}' (workflow '${workflow.id}') does not support tool use, but tools are specified: ${stage.toolNames.join(', ')}.`);
    }

    // Check for thinking
    if (stage.thinkingSettings?.enabled && !capabilities.thinking) {
      console.warn(`Workflow Loader: Model '${modelId}' in stage '${stage.id}' (workflow '${workflow.id}') does not support thinking mode, but it's enabled.`);
    }

    // Check for grounding
    const groundingRequested = stage.groundingSettings?.googleSearch?.enabled || stage.groundingSettings?.urlContext?.enabled;
    if (groundingRequested && !capabilities.grounding) {
      console.warn(`Workflow Loader: Model '${modelId}' in stage '${stage.id}' (workflow '${workflow.id}') does not support grounding, but it's requested.`);
    }

    // Check for code execution
    if (stage.codeExecutionSettings?.enabled && !capabilities.codeExecution) {
      console.warn(`Workflow Loader: Model '${modelId}' in stage '${stage.id}' (workflow '${workflow.id}') does not support code execution, but it's enabled.`);
    }

    // Check for image generation
    // This can be indicated by outputType: "image" or by specific imageGenerationSettings
    const imageGenRequested = stage.outputType === "image" || (stage.imageGenerationSettings && Object.keys(stage.imageGenerationSettings).length > 0);
    if (imageGenRequested && !capabilities.imageGeneration) {
        console.warn(`Workflow Loader: Model '${modelId}' in stage '${stage.id}' (workflow '${workflow.id}') does not support image generation, but it's requested (outputType: ${stage.outputType}, imageGenerationSettings: ${!!stage.imageGenerationSettings}).`);
    }
  });
}


export function getWorkflowById(id: string): Workflow | undefined {
  const workflow = allWorkflows.find(wf => wf.id === id);
  if (workflow) {
    verifyWorkflowModels(workflow); // Call verification function
  }
  return workflow;
}

export function getWorkflowByShortName(shortName: string): Workflow | undefined {
  const workflow = allWorkflows.find(wf => wf.shortName === shortName);
  if (workflow) {
    verifyWorkflowModels(workflow); // Call verification function
  }
  return workflow;
}
