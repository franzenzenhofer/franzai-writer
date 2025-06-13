# EPIC: Complete Migration from Genkit to Native Google Generative AI SDK

**Created:** 2025-01-13
**Priority:** CRITICAL
**Status:** In Progress
**Estimated Time:** 8-10 hours

## Overview

Complete migration from Google Genkit to the native `@google/generative-ai` SDK. This migration will:
- Remove all Genkit dependencies
- Use native Google Generative AI SDK directly
- Improve performance and reduce complexity
- Enable direct access to all Gemini features
- Simplify the codebase

## Motivation

1. **Direct Control**: Native SDK provides direct access to all Gemini features
2. **Performance**: Eliminate Genkit's abstraction overhead
3. **Simplicity**: Reduce complexity by removing unnecessary middleware
4. **Features**: Access latest Gemini capabilities immediately
5. **Maintenance**: Single dependency to maintain instead of Genkit ecosystem

## Sub-tickets

### 1. Core Infrastructure (sub-001)
- [ ] Create `src/lib/google-genai.ts` service wrapper
- [ ] Define TypeScript interfaces for all Gemini features
- [ ] Implement singleton pattern for GoogleGenAI instance
- [ ] Add configuration management

### 2. Streaming Implementation (sub-002)
- [ ] Create new API routes for streaming responses
- [ ] Replace Server Actions with streaming-capable endpoints
- [ ] Implement proper error handling for streams
- [ ] Add client-side streaming consumption

### 3. Tool Migration (sub-003)
- [ ] Convert Genkit tool definitions to native format
- [ ] Migrate sample tools to new structure
- [ ] Update tool execution logic
- [ ] Maintain backward compatibility during transition

### 4. Structured Output (sub-004)
- [ ] Implement JSON schema support using native SDK
- [ ] Replace Genkit's output parsing with native implementation
- [ ] Add type safety for structured responses
- [ ] Update all JSON output stages

### 5. Advanced Features (sub-005)
- [ ] Implement Google Search grounding
- [ ] Add code execution support
- [ ] Implement thinking mode for 2.5 models
- [ ] Add URL context tool
- [ ] Implement Files API for large documents
- [ ] Add image generation support

### 6. Workflow Updates (sub-006)
- [ ] Update `ai-stage-execution.ts` to use new SDK
- [ ] Migrate all workflow prompts
- [ ] Update workflow configurations
- [ ] Test each workflow thoroughly

### 7. Cleanup (sub-007)
- [ ] Remove all Genkit imports
- [ ] Remove Genkit from package.json
- [ ] Clean up unused Genkit-related files
- [ ] Update documentation

### 8. Testing (sub-008)
- [ ] Write unit tests for new implementation
- [ ] Add integration tests for all features
- [ ] Test error scenarios
- [ ] Verify streaming functionality

### 9. E2E Validation (sub-009)
- [ ] Run all existing Playwright tests
- [ ] Add new tests for advanced features
- [ ] Verify all workflows function correctly
- [ ] Performance testing

## Technical Specifications

Based on `gemini-ts-docs.md`:

### SDK Setup
```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY!);
```

### Model Selection
- Primary: `gemini-2.0-flash` (production, low latency)
- Advanced: `gemini-2.5-flash-preview` (thinking mode)
- Long context: `gemini-1.5-pro` (2M tokens)

### Feature Implementation Priority
1. Text generation with streaming
2. Structured output (JSON schemas)
3. Tool/function calling
4. Multimodal (images, documents)
5. Advanced features (grounding, code execution)

## Success Criteria

- [ ] All existing functionality works without Genkit
- [ ] No Genkit dependencies in package.json
- [ ] All tests pass
- [ ] Streaming works properly
- [ ] All workflows execute successfully
- [ ] Performance improvement documented
- [ ] Zero runtime errors

## Implementation Order

1. Create core infrastructure
2. Implement basic text generation
3. Add streaming support
4. Migrate tools and structured output
5. Add advanced features
6. Update all workflows
7. Remove Genkit completely
8. Comprehensive testing

## Notes

- Maintain backward compatibility during migration
- Use feature flags if needed for gradual rollout
- Document all API changes
- Keep error messages user-friendly