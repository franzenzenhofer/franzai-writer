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

export interface JsonField {
  key: string;
  label: string;
  type: "text" | "textarea";
  displayOrder?: number;
}

export type StageInputType = "text" | "textarea" | "context" | "form" | "none" | "image" | "document";

export interface Stage {
  id: string;
  title: string;
  description: string;
  inputType: StageInputType;
  formFields?: FormField[]; // Only if inputType is 'form'
  jsonFields?: JsonField[]; // Only if outputType is 'json' - defines how to render JSON fields
  promptTemplate?: string; 
  model?: string; // Optional: Specific AI model for this stage
  temperature?: number; // Optional: Specific temperature for this stage
  outputType: "text" | "json" | "markdown" | "html";
  dependencies?: string[]; 
  autoRun?: boolean; 
  autorunDependsOn?: string[]; // Optional: Separate dependencies for autorun behavior
  groundingRequested?: boolean; 
  isOptional?: boolean;
  tokenEstimate?: number; // Estimated token count for this stage
  autoRunConditions?: {
    requiresAll?: string[];
    requiresAny?: string[];
    customLogic?: string;
  };
  thinkingSettings?: {
    enabled?: boolean;
    thinkingBudget?: number; // Token budget for thinking mode (128-32768)
  };
  toolNames?: string[]; // List of tools available for this stage
  functionCallingMode?: "AUTO" | "ANY" | "NONE"; // How function calling should work
  systemInstructions?: string;
  chatEnabled?: boolean;
  groundingSettings?: {
    googleSearch?: {
      enabled: boolean;
      dynamicThreshold?: number; // 0-1, confidence threshold for grounding
    };
    urlContext?: {
      enabled: boolean;
      urls: string[]; // URLs to ground the response with
    };
  };
  codeExecutionSettings?: {
    enabled: boolean;
    timeout?: number; // Timeout in milliseconds (default 30000)
  };
  streamingSettings?: {
    enabled: boolean;
    chunkSize?: number; // Size of streaming chunks
  };
  chatSettings?: {
    maxHistory?: number; // Maximum number of messages to keep in history
    temperature?: number; // Override temperature for chat mode
  };
  imageSettings?: {
    maxDimension?: number; // Max width/height for images
    supportedFormats?: string[]; // Supported image formats
  };
  documentSettings?: {
    maxSizeMB?: number; // Maximum document size in MB
    supportedFormats?: string[]; // Supported document formats
  };
  filesApiSettings?: {
    useFilesApi?: boolean; // Whether to use Gemini Files API for large files
    autoUpload?: boolean; // Auto-upload files >10MB to Files API
  };
  aiRedoEnabled?: boolean; // Enable AI REDO functionality for this stage
  editEnabled?: boolean; // Enable Edit button for this stage (defaults based on stage type)
  showThinking?: boolean; // Show thinking process for this stage (defaults to false)
  copyable?: boolean; // Enable copy button for text/markdown output (defaults to false)
}

export interface WorkflowConfig {
  setTitleFromStageOutput?: string; 
  finalOutputStageId?: string; // ID of the stage that produces the final document for export
  showThinking?: boolean; // Global setting to show thinking process (defaults to false)
  autoScroll?: {
    enabled: boolean;
    scrollToAutorun: boolean;
    scrollToManual: boolean;
  };
  progressAnimation?: {
    dynamicSpeed: boolean;
    singleCycle: boolean;
  };
}
export interface Workflow {
  id: string;
  shortName?: string;
  name: string;
  description: string;
  stages: Stage[];
  config?: WorkflowConfig;
}

export interface StageState {
  stageId: string;
  userInput?: any; 
  output?: any; 
  status: "idle" | "running" | "completed" | "error";
  error?: string;
  completedAt?: string; 
  groundingInfo?: any; 
  isStale?: boolean;
  staleDismissed?: boolean; // Track if stale warning was dismissed
  depsAreMet?: boolean;
  shouldAutoRun?: boolean;
  isEditingOutput?: boolean;
  thinkingSteps?: import('@/ai/flows/ai-stage-execution').ThinkingStep[];
  chatHistory?: Array<{role: 'user' | 'model' | 'system', parts: any[]}>;
  currentStreamOutput?: string; // For displaying live streaming text
  outputImages?: Array<{
    name?: string;
    base64Data: string;
    mimeType: string;
  }>;
  // Advanced Gemini feature responses
  groundingSources?: Array<{
    type: 'search' | 'url';
    title: string;
    url?: string;
    snippet?: string;
  }>;
  functionCalls?: Array<{
    toolName: string;
    input: any;
    output: any;
    timestamp?: string;
  }>;
  codeExecutionResults?: {
    code: string;
    stdout?: string;
    stderr?: string;
    images?: Array<{
      name: string;
      base64Data: string;
      mimeType: string;
    }>;
  };
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

