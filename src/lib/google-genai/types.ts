/**
 * TypeScript interfaces for Google Generative AI SDK
 * Complete type definitions for all Gemini 2.0+ features
 */

import type { 
  Content,
  Part,
  GenerateContentRequest,
  GenerateContentResult,
  FunctionDeclaration,
  Tool,
  GenerationConfig,
  SafetySetting,
  RequestOptions
} from '@google/genai';

// Re-export core types
export type {
  Content,
  Part,
  GenerateContentRequest,
  GenerateContentResult,
  FunctionDeclaration,
  Tool,
  GenerationConfig,
  SafetySetting,
  RequestOptions
};

// Model configurations
export interface ModelConfig {
  model: string;
  temperature?: number;
  maxOutputTokens?: number;
  topP?: number;
  topK?: number;
  stopSequences?: string[];
  candidateCount?: number;
  systemInstruction?: string;
}

// Streaming types
export interface StreamOptions {
  onChunk?: (text: string) => void;
  onComplete?: (fullText: string) => void;
  onError?: (error: Error) => void;
}

// Structured output types
export interface JsonSchemaConfig {
  responseMimeType: 'application/json';
  responseSchema: any; // JSON Schema object
}

// Tool calling types
export interface ToolConfig {
  functionDeclarations?: FunctionDeclaration[];
  codeExecution?: boolean;
  googleSearch?: boolean;
  urlContext?: boolean;
}

// Advanced feature configs
export interface ThinkingConfig {
  includeThoughts?: boolean;
  thinkingBudget?: number;
}

export interface GroundingConfig {
  googleSearch?: {
    dynamicRetrieval?: {
      threshold: number;
    };
  };
}

// Image generation config
export interface ImageGenerationConfig {
  responseModalities: string[];
  imageOptions?: {
    aspectRatio?: string;
    negativePrompt?: string;
    numberOfImages?: number;
    includeSafetyAttributes?: boolean;
  };
}

// Files API types
export interface FileUploadConfig {
  file: Buffer | Uint8Array;
  mimeType: string;
  displayName?: string;
}

export interface FileMetadata {
  uri: string;
  mimeType: string;
  displayName?: string;
  sizeBytes?: number;
  createTime?: string;
  updateTime?: string;
  expirationTime?: string;
  state?: string;
}

// Context caching types
export interface CacheConfig {
  cachedContent?: string;
  cacheKey?: string;
  ttlSeconds?: number;
}

// Complete generation request
export interface GenerationRequest {
  prompt: string | Content[];
  config?: ModelConfig;
  tools?: ToolConfig;
  structuredOutput?: JsonSchemaConfig;
  thinking?: ThinkingConfig;
  grounding?: GroundingConfig;
  streaming?: StreamOptions;
  cache?: CacheConfig;
}

// Response types
export interface GenerationResponse {
  text: string;
  functionCalls?: any[];
  groundingMetadata?: any;
  usageMetadata?: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
    thoughtsTokenCount?: number;
  };
  finishReason?: string;
  safetyRatings?: any[];
}

// Error types
export interface GenAIError extends Error {
  code?: string;
  status?: number;
  details?: any;
}

// Feature flags for 2.0+ models
export interface ModelFeatures {
  supportsImageGeneration: boolean;
  supportsThinking: boolean;
  supportsCodeExecution: boolean;
  supportsUrlContext: boolean;
  supportsGrounding: boolean;
  maxContextTokens: number;
  supportsFunctionCalling: boolean;
}

// Model registry
export const MODEL_FEATURES: Record<string, ModelFeatures> = {
  'gemini-2.0-flash': {
    supportsImageGeneration: true,
    supportsThinking: false,
    supportsCodeExecution: true,
    supportsUrlContext: false,
    supportsGrounding: true,
    maxContextTokens: 1000000,
    supportsFunctionCalling: true
  },
  'gemini-2.0-flash-exp': {
    supportsImageGeneration: true,
    supportsThinking: false,
    supportsCodeExecution: true,
    supportsUrlContext: false,
    supportsGrounding: true,
    maxContextTokens: 1000000,
    supportsFunctionCalling: true
  },
  'gemini-2.5-flash-preview': {
    supportsImageGeneration: false,
    supportsThinking: true,
    supportsCodeExecution: true,
    supportsUrlContext: true,
    supportsGrounding: true,
    maxContextTokens: 1000000,
    supportsFunctionCalling: true
  },
  'gemini-2.5-pro-preview': {
    supportsImageGeneration: false,
    supportsThinking: true,
    supportsCodeExecution: true,
    supportsUrlContext: true,
    supportsGrounding: true,
    maxContextTokens: 1000000,
    supportsFunctionCalling: true
  }
};