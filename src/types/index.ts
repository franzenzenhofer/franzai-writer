export type NavItem = {
  title: string;
  href?: string;
  disabled?: boolean;
  external?: boolean;
};

export type FormFieldType = "text" | "textarea" | "checkbox" | "select";

export interface FormFieldOption {
  value: string;
  label: string;
}
export interface FormField {
  name: string;
  label: string;
  type: FormFieldType;
  defaultValue?: string | boolean | number;
  placeholder?: string;
  options?: FormFieldOption[]; // For select type
  validation?: Record<string, any>; // react-hook-form validation rules
}

export type StageInputType = "textarea" | "context" | "form" | "none";

export interface Stage {
  id: string;
  title: string;
  description: string;
  inputType: StageInputType;
  formFields?: FormField[]; // Only if inputType is 'form'
  promptTemplate?: string; // Template for AI prompt
  model?: string; // AI model to use (e.g., 'gemini-2.0-flash')
  temperature?: number; // Temperature for AI model
  outputType: "text" | "json" | "markdown";
  dependencies?: string[]; // IDs of stages that must be completed first
  autoRun?: boolean; // Whether to run automatically when dependencies are met
  groundingRequested?: boolean; // If grounding info should be requested
  outputFormat?: "json" | "text"; // Expected AI output format for processing
  isOptional?: boolean; // If the stage can be skipped
}

export interface WorkflowConfig {
  setTitleFromStageOutput?: string; // Stage ID whose output sets the document title
}
export interface Workflow {
  id: string;
  name: string;
  description: string;
  stages: Stage[];
  config?: WorkflowConfig;
}

export interface StageState {
  stageId: string;
  userInput?: any; // Could be string for textarea/context, or object for form
  output?: any; // string, object (JSON), or string (Markdown)
  status: "idle" | "running" | "completed" | "error" | "skipped";
  error?: string;
  completedAt?: string; // ISO date string
  groundingInfo?: any; // Grounding information from AI
  isStale?: boolean;
  depsAreMet?: boolean;
  shouldAutoRun?: boolean;
  shouldShowUpdateBadge?: boolean;
}

export interface WizardDocument {
  id: string;
  title: string;
  workflowId: string;
  status: "draft" | "in-progress" | "completed";
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  userId: string; // Placeholder for user association
}

export interface WizardInstance {
  document: WizardDocument;
  workflow: Workflow;
  stageStates: Record<string, StageState>; // Keyed by stageId
  currentStageId?: string; // Optional: current active stage
}

export interface AiStageExecutionParams {
  promptTemplate: string;
  model: string;
  temperature: number;
  contextVars?: Record<string, any>; // Variables to interpolate into promptTemplate
}
