
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
  promptTemplate?: string; 
  model?: string; // Optional: Specific AI model for this stage
  temperature?: number; // Optional: Specific temperature for this stage
  outputType: "text" | "json" | "markdown";
  dependencies?: string[]; 
  autoRun?: boolean; 
  groundingRequested?: boolean; 
  isOptional?: boolean; 
}

export interface WorkflowConfig {
  setTitleFromStageOutput?: string; 
  finalOutputStageId?: string; // ID of the stage that produces the final document for export
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
  userInput?: any; 
  output?: any; 
  status: "idle" | "running" | "completed" | "error" | "skipped";
  error?: string;
  completedAt?: string; 
  groundingInfo?: any; 
  isStale?: boolean;
  staleDismissed?: boolean; // Track if stale warning was dismissed
  depsAreMet?: boolean;
  shouldAutoRun?: boolean;
  isEditingOutput?: boolean; 
}

export interface WizardDocument {
  id: string;
  title: string;
  workflowId: string;
  status: "draft" | "in-progress" | "completed";
  createdAt: string; 
  updatedAt: string; 
  userId: string; 
}

export interface WizardInstance {
  document: WizardDocument;
  workflow: Workflow;
  stageStates: Record<string, StageState>; 
  currentStageId?: string; 
}

export interface AiStageExecutionParams {
  promptTemplate: string;
  model: string; // model will be resolved before passing to AiStageExecutionInput
  temperature: number; // temperature will be resolved before passing
  contextVars?: Record<string, any>; 
}

