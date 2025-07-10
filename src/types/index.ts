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
  type: "text" | "textarea" | "number" | "boolean" | "array" | "object";
  displayOrder?: number;
  description?: string;
  required?: boolean; // Defaults to true if not specified
}

export type StageInputType = "text" | "textarea" | "context" | "form" | "none" | "image" | "document";

export interface ExportTriggerButton {
  label: string;
  variant?: 'hero' | 'default' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  description?: string;
}

export interface ExportFormat {
  enabled: boolean;
  label: string;
  description: string;
  icon?: string;
  aiTemplate?: string;
  deriveFrom?: string;
  features?: string[];
  options?: Record<string, any>;
  stripElements?: string[];
  preserveStructure?: boolean;
}

export interface ExportConfig {
  aiModel?: string;
  temperature?: number;
  formats: {
    'html-styled'?: ExportFormat;
    'html-clean'?: ExportFormat;
    'markdown'?: ExportFormat;
    'pdf'?: ExportFormat;
    'docx'?: ExportFormat;
    'epub'?: ExportFormat;
    [key: string]: ExportFormat | undefined;
  };
  publishing?: {
    enabled: boolean;
    instant?: boolean;
    baseUrl?: string;
    customDomains?: boolean;
    formats?: string[];
    features?: {
      seo?: {
        noindex?: boolean;
        openGraph?: boolean;
        twitterCard?: boolean;
        structuredData?: boolean;
      };
      sharing?: {
        shortUrls?: boolean;
        qrCode?: boolean;
        socialButtons?: boolean;
      };
      protection?: {
        public?: boolean;
        passwordOption?: boolean;
        expiration?: {
          default?: string;
          options?: string[];
        };
      };
      branding?: {
        showLogo?: boolean;
        poweredBy?: string;
        customizable?: boolean;
      };
    };
  };
  styling?: {
    defaultView?: 'styled' | 'clean'; // Default view in export preview
    themes?: {
      default?: string;
      options?: string[];
    };
    customization?: {
      fonts?: {
        heading?: string;
        body?: string;
      };
      colors?: {
        primary?: string;
        background?: string;
        text?: string;
      };
    };
    cssTemplate?: string;
  };
}

export interface Stage {
  id: string;
  title: string;
  description: string;
  /**
   * Optional UX enhancement: custom placeholder text for the primary input
   * of the stage (applies to `text` and `textarea` input types). If omitted,
   * the UI will fall back to `description` or a generic placeholder.
   */
  placeholder?: string;
  stageType?: 'default' | 'export'; // New stage type for export functionality
  inputType: StageInputType;
  formFields?: FormField[]; // Only if inputType is 'form'
  jsonFields?: JsonField[]; // Only if outputType is 'json' - defines how to render JSON fields
  promptTemplate?: string; 
  prompt?: string; // Resolved prompt after template substitution
  model?: string; // Optional: Specific AI model for this stage
  temperature?: number; // Optional: Specific temperature for this stage
  outputType: "text" | "json" | "markdown" | "html" | "export-interface" | "image"; // Added export-interface and image
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
  tools?: any[]; // Tool definitions for this stage
  functionCallingMode?: "AUTO" | "ANY" | "NONE"; // How function calling should work
  systemInstructions?: string;
  groundingSettings?: {
    googleSearch?: {
      enabled: boolean;
      dynamicThreshold?: number; // 0-1, confidence threshold for grounding
    };
    urlContext?: {
      enabled: boolean;
      urls?: string[]; // URLs to ground the response with
      extractUrlsFromInput?: boolean; // Extract URLs from user input automatically
    };
  };
  codeExecutionSettings?: {
    enabled: boolean;
    timeout?: number; // Timeout in milliseconds (default 30000)
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
  hideImageMetadata?: boolean; // Hide prompt and provider metadata for image outputs (defaults to false)
  jsonSchema?: any; // JSON schema for structured output
  maxTokens?: number; // Maximum tokens for output
  systemInstruction?: string; // Alias for systemInstructions
  showAsHero?: boolean; // Show stage with hero UI treatment
  triggerButton?: ExportTriggerButton; // Custom trigger button for export stage
  exportConfig?: ExportConfig; // Export stage configuration
  imageGenerationSettings?: ImageGenerationSettings; // Settings for image generation stages
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
  defaultModel?: string; // Default model for workflow
  temperature?: number; // Default temperature for workflow
}

export interface StageState {
  stageId?: string; // Stage ID for compatibility
  status: "idle" | "running" | "completed" | "error";
  userInput?: any;
  output?: any;
  error?: string;
  depsAreMet?: boolean;
  completedAt?: string;
  isEditingInput?: boolean;
  isEditingOutput?: boolean;
  isStale?: boolean; // Marks content as potentially outdated
  staleDismissed?: boolean; // User dismissed the stale warning
  shouldAutoRun?: boolean;
  groundingInfo?: any; // Legacy grounding information
  // Proper grounding metadata structure as per Google documentation
  groundingMetadata?: {
    searchEntryPoint?: {
      renderedContent: string;
    };
    groundingChunks?: Array<{
      web: {
        uri: string;
        title: string;
      };
    }>;
    groundingSupports?: Array<{
      segment: {
        startIndex?: number;
        endIndex: number;
        text: string;
      };
      groundingChunkIndices: number[];
      confidenceScores: number[];
    }>;
    webSearchQueries?: string[];
  };
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
  thinkingSteps?: import('@/ai/flows/ai-stage-execution').ThinkingStep[];
  outputImages?: Array<{
    name?: string;
    base64Data: string;
    mimeType: string;
  }>;
  usageMetadata?: {
    thoughtsTokenCount?: number;
    candidatesTokenCount?: number;
    totalTokenCount?: number;
    promptTokenCount?: number;
  };
  currentStreamOutput?: string; // Streaming output for real-time display
  generationProgress?: {
    styledHtml?: number;
    cleanHtml?: number;
    currentFormat?: string;
  };
}

export interface ExportStageState extends StageState {
  output: {
    htmlStyled?: string;
    htmlClean?: string;
    markdown?: string;
    htmlStyledUrl?: string;
    htmlCleanUrl?: string;
    markdownUrl?: string;
    formats: {
      [format: string]: {
        ready: boolean;
        content?: string;
        url?: string;
        storageUrl?: string;
        assetId?: string;
        sizeBytes?: number;
        error?: string;
      };
    };
    publishing?: {
      publishedUrl?: string;
      publishedAt?: Date;
      publishedFormats?: string[];
      shortUrl?: string;
      qrCodeUrl?: string;
    };
  };
  generationProgress?: {
    styledHtml?: number;
    cleanHtml?: number;
    currentFormat?: string;
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
  documentId?: string; // Document ID for storage operations
  workflow: Workflow;
  stageStates: Record<string, StageState>; 
  currentStageId?: string; 
}

export interface StageInput {
  inputType: StageInputType;
  userInput?: any;
  formFields?: FormField[];
  text?: string; // Text input for the stage
  files?: any[]; // File inputs if any
}

export interface StageContext {
  contextVars: Record<string, any>;
  stageStates: Record<string, StageState>;
}

export type StageOutput = any; // Can be text, JSON, markdown, HTML etc based on outputType

export interface ImageGenerationSettings {
  provider?: "gemini" | "imagen";
  aspectRatio?: string; // "1:1", "16:9", "9:16", "4:3", "3:4"
  numberOfImages?: number; // For Imagen, 1-4
  style?: string; // Style modifier
  negativePrompt?: string; // What to avoid
  filenames?: string[]; // AI-generated SEO-optimized filenames
  gemini?: {
    responseModalities?: string[];
  };
  imagen?: {
    personGeneration?: "dont_allow" | "allow_adult" | "allow_all";
  };
}

export interface ImageOutputData {
  provider: "gemini" | "imagen";
  images: Array<{
    // Asset management - Primary storage method
    assetId?: string;        // Asset management ID (when stored in Firebase)
    publicUrl?: string;      // Public HTTPS URL for the image (when stored in Firebase)
    storageUrl?: string;     // Firebase Storage URL (when stored in Firebase)
    
    // Fallback storage method - Used when Firebase Storage fails
    dataUrl?: string;        // Base64 data URL (fallback when storage fails)
    
    // Generation metadata
    promptUsed: string;     // Actual prompt sent to API
    mimeType: string;       // e.g., "image/png"
    width?: number;         // Image dimensions
    height?: number;
    aspectRatio: string;    // e.g., "16:9"
  }>;
  selectedImageIndex?: number; // For multi-image generation
  accompanyingText?: string;   // Gemini's text response
}

export interface AiStageExecutionParams {
  promptTemplate: string;
  model: string; // model will be resolved before passing to AiStageExecutionInput
  temperature: number; // temperature will be resolved before passing
  contextVars?: Record<string, any>; 
}

// Asset Management System
export interface Asset {
  id: string;                     // Auto-generated asset ID
  userId: string;                 // Owner of the asset
  type: 'image' | 'video' | 'file';
  mimeType: string;               // e.g., "image/png"
  
  // Storage information
  storageUrl: string;             // Firebase Storage path: "assets/{assetId}/original.{ext}"
  publicUrl: string;              // Public HTTPS URL
  thumbnailUrl?: string;          // Optional thumbnail for images
  
  // Metadata
  fileName: string;               // Original or generated filename
  fileSize: number;               // Size in bytes
  dimensions?: {                  // For images/videos
    width: number;
    height: number;
  };
  
  // Creation details
  createdAt: any;                 // Firestore Timestamp
  source: 'generated' | 'uploaded';
  generationPrompt?: string;      // If AI-generated
  generationModel?: string;       // e.g., "imagen-3.0-generate-002"
  
  // Document associations
  documentIds: string[];          // Array of document IDs using this asset
  stageReferences: Array<{        // Detailed usage tracking
    documentId: string;
    stageId: string;
    addedAt: any;                 // Firestore Timestamp
  }>;
  
  // Lifecycle
  lastAccessedAt: any;            // Firestore Timestamp
  isDeleted: boolean;             // Soft delete flag
  deletedAt?: any;                // Firestore Timestamp
  
  // Optional metadata
  tags?: string[];                // User-defined tags
  description?: string;           // User-provided description
}

// Export type guard functions for runtime validation
export {
  isStageState,
  isWorkflow,
  isWizardInstance,
  isStage,
  isFormField,
  isJsonField,
  isExportFormat,
  isExportConfig,
  isImageGenerationSettings,
  isImageOutputData,
  isAsset,
  validateStageStateRuntime,
  validateWorkflowRuntime,
  validateWizardInstanceRuntime,
  castToStageState,
  castToWorkflow,
  castToWizardInstance,
  validateStageStatesCollection,
  validateWorkflowsArray
} from '@/lib/type-guards';

// Export runtime validation utilities
export {
  validateStageStateComprehensive,
  validateWorkflowComprehensive,
  validateWizardInstanceComprehensive,
  validateExternalData,
  validateApiResponse,
  validateLocalStorageData,
  validateFirestoreData,
  validateWorkflowsBatch,
  DynamicContentValidator,
  createValidator,
  quickValidators,
  handleValidationFailure,
  createValidationMiddleware,
  type ValidationResult,
  type ValidationContext
} from '@/lib/runtime-validation';

