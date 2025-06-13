# Gemini SDK Migration Analysis: From Genkit to Native SDK

**Date**: 2025-06-13  
**Author**: Claude Code  
**Purpose**: Comprehensive analysis to inform migration from Genkit to native @google/generative-ai SDK

## Executive Summary

This analysis evaluates the feasibility and implications of migrating from the current Genkit-based implementation to the native Google Gemini SDK (@google/generative-ai). The codebase already contains a hybrid approach with both Genkit and native SDK implementations, providing a clear migration path.

## Current Implementation Overview

### 1. Dependencies
- **Genkit**: `@genkit-ai/googleai@^1.8.0` and `genkit@^1.8.0`
- **Native SDK**: `@google/genai@^1.5.0` (already installed)
- **Primary Model**: `googleai/gemini-2.0-flash-exp` (should update to stable `gemini-2.0-flash`)

### 2. Current Architecture
- **Genkit Integration**: Main AI orchestration through `src/ai/genkit.ts` and `src/ai/flows/ai-stage-execution.ts`
- **Native SDK Usage**: Already implemented in `src/ai/direct-gemini.ts` for Google Search grounding
- **Hybrid Approach**: System falls back to native SDK when Genkit doesn't support specific features

## Feature Availability Comparison

### Features Available in Native SDK (@google/generative-ai)

#### ✅ Fully Supported
1. **Text Generation**
   - Basic text generation
   - System instructions
   - Temperature control
   - Max tokens configuration
   - Token counting

2. **Multimodal Input**
   - Text input
   - Image input (inline base64)
   - Multiple images
   - File uploads via Files API

3. **Streaming**
   - Text streaming (`generateContentStream`)
   - Chunk-by-chunk responses
   - Real-time output

4. **Chat/Conversations**
   - Multi-turn conversations
   - Chat history management
   - Context retention

5. **Google Search Grounding**
   - Already implemented in `direct-gemini.ts`
   - Search as a tool approach
   - Dynamic retrieval threshold
   - Grounding metadata extraction

6. **URL Context**
   - URL content as context
   - Combined with search grounding

7. **Function Calling**
   - Tool declarations
   - AUTO/ANY/NONE modes
   - Tool execution handling
   - Multiple tool calls

8. **Code Execution**
   - Python code interpreter
   - Built-in as `codeExecution` tool
   - Results and visualizations

9. **Thinking Mode**
   - Model switching to thinking variants
   - Thinking budget configuration
   - Thought process extraction

10. **Files API**
    - File upload/download
    - Large file handling
    - Document processing

### Features with Different Implementation Patterns

#### Genkit vs Native SDK Differences

1. **Tool Registration**
   - **Genkit**: Uses `defineTool` with Zod schemas
   - **Native SDK**: Direct tool declarations in request

2. **Error Handling**
   - **Genkit**: Wrapped error responses
   - **Native SDK**: Direct API errors

3. **Response Format**
   - **Genkit**: Normalized response objects
   - **Native SDK**: Raw API responses requiring parsing

4. **Configuration**
   - **Genkit**: Plugin-based configuration
   - **Native SDK**: Direct API configuration

## Migration Considerations

### 1. Key Challenges

#### a. Tool Definition Migration
Current Genkit tool definitions need conversion:
```typescript
// Genkit approach
defineTool({
  name: 'calculator',
  inputSchema: z.object({...}),
  outputSchema: z.object({...})
}, async (input) => {...})

// Native SDK approach
tools: [{
  functionDeclarations: [{
    name: 'calculator',
    description: '...',
    parameters: {
      type: 'object',
      properties: {...}
    }
  }]
}]
```

#### b. Response Processing
- Genkit provides normalized responses
- Native SDK requires manual extraction of grounding metadata, tool calls, etc.

#### c. Streaming Implementation
- Current Server Actions don't support streaming to client
- Would need API routes for true streaming

### 2. Migration Benefits

1. **Direct API Access**: No abstraction layer limitations
2. **Latest Features**: Immediate access to new Gemini features
3. **Better Debugging**: Direct API responses for troubleshooting
4. **Performance**: Reduced overhead from abstraction layer
5. **Flexibility**: Full control over API interactions

### 3. Migration Risks

1. **Breaking Changes**: Need to update all workflow execution logic
2. **Testing Burden**: Extensive testing required for all features
3. **Maintenance**: Direct responsibility for API changes
4. **Type Safety**: Loss of some Genkit type safety features

## Implementation Patterns in Current Codebase

### 1. Successful Native SDK Pattern (direct-gemini.ts)
```typescript
// Already working for Google Search grounding
const tools = [];
if (request.enableGoogleSearch) {
  tools.push({ googleSearch: {} });
}

const response = await client.models.generateContent({
  model: request.model,
  contents,
  config: { tools, temperature, ... }
});
```

### 2. Hybrid Approach in ai-stage-execution.ts
- Falls back to native SDK for Google Search grounding
- Maintains Genkit for other features
- Shows clear migration path

## Recommended Migration Strategy

### Phase 1: Stabilization (Immediate)
1. Update model references from `gemini-2.0-flash-exp` to stable `gemini-2.0-flash`
2. Fix current tool registration issues in Genkit
3. Complete testing of all Gemini features

### Phase 2: Gradual Migration (Short-term)
1. Extend `direct-gemini.ts` to handle all features
2. Create native SDK implementations alongside Genkit
3. Add feature flags to switch between implementations
4. Migrate one feature at a time:
   - Start with already-working Google Search
   - Add function calling
   - Add code execution
   - Add thinking mode
   - Complete with streaming/chat

### Phase 3: Complete Migration (Medium-term)
1. Remove Genkit dependencies
2. Update all workflows to use native SDK
3. Implement proper streaming with API routes
4. Update documentation and tests

## Critical Success Factors

1. **Maintain Feature Parity**: Ensure all current features work
2. **Preserve Type Safety**: Create TypeScript interfaces for all API interactions
3. **Comprehensive Testing**: Test each feature thoroughly
4. **Backward Compatibility**: Support existing workflows during migration
5. **Documentation**: Update all documentation with native SDK patterns

## Conclusion

The migration from Genkit to native Gemini SDK is both feasible and beneficial. The codebase already demonstrates successful native SDK usage for Google Search grounding, providing a proven pattern for migration. The recommended phased approach minimizes risk while maximizing the benefits of direct API access.

### Next Steps
1. Create detailed migration epic with subtasks
2. Set up feature flags for gradual rollout
3. Extend direct-gemini.ts with all required features
4. Create migration guide for developers
5. Plan comprehensive testing strategy