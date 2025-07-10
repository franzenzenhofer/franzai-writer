/**
 * TypeScript interfaces for AI execution flows
 * Replaces 'any' types with proper interfaces
 */

// Chat history and message parts
export interface MessagePart {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string;
  };
  fileData?: {
    uri: string;
    mimeType: string;
  };
}

export interface ChatHistoryMessage {
  role: 'user' | 'model' | 'system';
  parts: MessagePart[];
}

// Tool definitions and responses
export interface ToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, any>; // JSON Schema object
  fn?: (input: any) => Promise<any>;
}

export interface ToolCallRequest {
  type: 'toolRequest';
  toolName: string;
  input: Record<string, any>;
}

export interface ToolCallResponse {
  type: 'toolResponse';
  toolName: string;
  output: Record<string, any>;
}

export interface TextLog {
  type: 'textLog';
  message: string;
}

export type ThinkingStep = ToolCallRequest | ToolCallResponse | TextLog;

// Function call metadata
export interface FunctionCallMetadata {
  toolName: string;
  input: Record<string, any>;
  output: Record<string, any>;
  timestamp?: string;
}

// Grounding metadata structures
export interface GroundingChunk {
  web: {
    uri: string;
    title: string;
  };
}

export interface GroundingSupport {
  segment: {
    startIndex?: number;
    endIndex: number;
    text: string;
  };
  groundingChunkIndices: number[];
  confidenceScores: number[];
}

export interface GroundingMetadata {
  searchEntryPoint?: {
    renderedContent: string;
  };
  groundingChunks?: GroundingChunk[];
  groundingSupports?: GroundingSupport[];
  webSearchQueries?: string[];
}

export interface GroundingSource {
  type: 'search' | 'url';
  title: string;
  url?: string;
  snippet?: string;
}

// URL context metadata
export interface UrlMetadata {
  retrievedUrl: string;
  urlRetrievalStatus: string;
}

export interface UrlContextMetadata {
  urlMetadata?: UrlMetadata[];
}

// Code execution results
export interface CodeExecutionResult {
  code: string;
  stdout?: string;
  stderr?: string;
  images?: Array<{
    name: string;
    base64Data: string;
    mimeType: string;
  }>;
}

// Usage metadata
export interface UsageMetadata {
  thoughtsTokenCount?: number;
  candidatesTokenCount?: number;
  totalTokenCount?: number;
  promptTokenCount?: number;
}

// Context variables for template resolution
export interface ContextVariables extends Record<string, any> {
  [key: string]: string | number | boolean | object | null | undefined;
}

// JSON Schema types
export interface JsonSchemaProperty {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'integer';
  description?: string;
  items?: JsonSchemaProperty;
  properties?: Record<string, JsonSchemaProperty>;
  required?: string[];
  enum?: any[];
}

export interface JsonSchema {
  type: 'object' | 'array' | 'string' | 'number' | 'boolean';
  properties?: Record<string, JsonSchemaProperty>;
  required?: string[];
  items?: JsonSchemaProperty;
  description?: string;
}

// Tool function parameter types
export interface ToolFunctionInput extends Record<string, any> {
  [key: string]: string | number | boolean | object | null | undefined;
}

export interface ToolFunctionOutput extends Record<string, any> {
  [key: string]: string | number | boolean | object | null | undefined;
  result?: any;
  error?: string;
}

// Generation config types
export interface GenerationConfig {
  temperature?: number;
  maxOutputTokens?: number;
  topP?: number;
  topK?: number;
  stopSequences?: string[];
  candidateCount?: number;
  responseMimeType?: string;
  responseSchema?: JsonSchema;
}

// Safety settings
export interface SafetySetting {
  category: string;
  threshold: string;
}

// Complete AI response structure
export interface AIResponse {
  content: string;
  thinkingSteps?: ThinkingStep[];
  outputImages?: Array<{
    name?: string;
    base64Data: string;
    mimeType: string;
  }>;
  groundingSources?: GroundingSource[];
  groundingMetadata?: GroundingMetadata;
  urlContextMetadata?: UrlContextMetadata;
  functionCalls?: FunctionCallMetadata[];
  codeExecutionResults?: CodeExecutionResult;
  usageMetadata?: UsageMetadata;
}

// Form data and validation
export interface FormData extends Record<string, any> {
  [key: string]: string | number | boolean | string[] | File | File[] | null | undefined;
}

// Component props
export interface ComponentProps extends Record<string, any> {
  [key: string]: any; // Keep as any for React component props flexibility
}

// Generic object types for specific use cases
export interface GenericObject extends Record<string, any> {
  [key: string]: any;
}

// Export utility type for strict typing
export type StrictRecord<T = any> = Record<string, T>;