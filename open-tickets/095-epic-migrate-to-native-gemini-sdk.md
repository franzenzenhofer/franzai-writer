# EPIC: Migrate from Genkit to Native Gemini SDK

**Created**: 2025-06-13  
**Priority**: High  
**Type**: Epic  
**Component**: AI Integration  
**Estimated Effort**: Large (3-4 weeks)

## Overview

Migrate the entire AI integration layer from Genkit to the native Google Gemini SDK (@google/generative-ai). This migration will provide direct access to all Gemini features, better performance, and more control over the AI integration.

## Business Value

1. **Direct Feature Access**: Immediate availability of new Gemini features without waiting for Genkit updates
2. **Performance**: Reduced overhead from abstraction layer
3. **Debugging**: Direct API responses for better troubleshooting
4. **Flexibility**: Full control over API interactions and custom implementations
5. **Cost Optimization**: Better control over API calls and token usage

## Current State

- Using Genkit for most AI operations
- Native SDK already implemented for Google Search grounding in `direct-gemini.ts`
- Hybrid approach demonstrates feasibility
- Some features (like tool calling) not working properly in Genkit

## Target State

- Complete migration to native Gemini SDK
- All features working with direct API calls
- Improved performance and reliability
- Better error handling and debugging capabilities

## Technical Scope

### Phase 1: Foundation (Week 1)

#### 1.1 Create Core Infrastructure
- [ ] Extend `direct-gemini.ts` with comprehensive type definitions
- [ ] Create response parser utilities for all Gemini response types
- [ ] Implement error handling and retry logic
- [ ] Add comprehensive logging and debugging utilities
- [ ] Create feature flags for gradual migration

#### 1.2 Implement Basic Features
- [ ] Text generation (non-streaming)
- [ ] System instructions
- [ ] Temperature and parameter control
- [ ] Token counting utilities
- [ ] Multimodal input (images, files)

### Phase 2: Advanced Features (Week 2)

#### 2.1 Tool Integration
- [ ] Migrate tool definitions from Genkit format to native format
- [ ] Implement function calling with native SDK
- [ ] Create tool execution framework
- [ ] Add support for parallel tool calls
- [ ] Implement code execution integration

#### 2.2 Grounding and Context
- [ ] Enhance existing Google Search grounding
- [ ] Implement URL context fetching
- [ ] Add dynamic retrieval configuration
- [ ] Create grounding metadata extractors

#### 2.3 Thinking Mode
- [ ] Implement thinking mode with model switching
- [ ] Add thinking budget configuration
- [ ] Create thought extraction utilities
- [ ] Handle thinking-specific response formats

### Phase 3: Streaming and Chat (Week 3)

#### 3.1 Streaming Implementation
- [ ] Create streaming API routes (replace Server Actions where needed)
- [ ] Implement client-side streaming handlers
- [ ] Add progress indicators and cancellation
- [ ] Handle streaming with tool calls

#### 3.2 Chat Mode
- [ ] Implement chat history management
- [ ] Create conversation context handling
- [ ] Add message role management
- [ ] Implement conversation persistence

### Phase 4: Migration and Testing (Week 4)

#### 4.1 Workflow Migration
- [ ] Update `ai-stage-execution.ts` to use native SDK
- [ ] Migrate all workflow stages
- [ ] Update workflow schema if needed
- [ ] Ensure backward compatibility

#### 4.2 Testing and Documentation
- [ ] Create comprehensive test suite
- [ ] Update all E2E tests
- [ ] Write migration documentation
- [ ] Create developer guide for native SDK usage
- [ ] Performance benchmarking

## Sub-tasks

### High Priority
1. [ ] Create type-safe wrapper for native SDK
2. [ ] Implement all current Genkit features in native SDK
3. [ ] Fix tool calling implementation
4. [ ] Ensure Google Search grounding works consistently

### Medium Priority
1. [ ] Optimize token usage and API calls
2. [ ] Implement request batching where applicable
3. [ ] Add caching layer for repeated requests
4. [ ] Create migration utilities for existing data

### Low Priority
1. [ ] Add advanced error recovery
2. [ ] Implement request queuing
3. [ ] Add usage analytics
4. [ ] Create debugging dashboard

## Success Criteria

1. **Feature Parity**: All current features work with native SDK
2. **Performance**: 20%+ improvement in response times
3. **Reliability**: 99%+ success rate for API calls
4. **Testing**: 100% test coverage for critical paths
5. **Documentation**: Complete migration guide and API reference

## Risks and Mitigation

### Risk 1: Breaking Changes
- **Mitigation**: Feature flags for gradual rollout
- **Mitigation**: Comprehensive testing before switching

### Risk 2: API Differences
- **Mitigation**: Create compatibility layer during transition
- **Mitigation**: Extensive logging for debugging

### Risk 3: Performance Regression
- **Mitigation**: Benchmark before and after
- **Mitigation**: Optimize critical paths first

## Dependencies

1. **Internal**:
   - Current Gemini integration must be documented
   - All workflows must be tested
   - Feature requirements must be clear

2. **External**:
   - Google Gemini API stability
   - @google/generative-ai SDK updates
   - API quota and rate limits

## Rollout Strategy

1. **Week 1**: Foundation and basic features
2. **Week 2**: Advanced features behind feature flags
3. **Week 3**: Streaming and chat implementation
4. **Week 4**: Testing and gradual production rollout
5. **Week 5**: Complete migration and Genkit removal

## Monitoring and Metrics

1. **Performance Metrics**:
   - API response times
   - Token usage
   - Error rates
   - Feature adoption

2. **Quality Metrics**:
   - Test coverage
   - Bug reports
   - User feedback
   - System stability

## Related Documents

- [Gemini SDK Migration Analysis](/docs/reports/gemini-sdk-migration-analysis.md)
- [Current Genkit Implementation](/src/ai/genkit.ts)
- [Native SDK Implementation](/src/ai/direct-gemini.ts)
- [Gemini Models Guide](/docs/gemini-models-guide-2025.md)

## Notes

- Start with extending existing `direct-gemini.ts` implementation
- Prioritize fixing current tool calling issues
- Consider keeping Genkit for development/testing tools
- Plan for future Gemini API updates