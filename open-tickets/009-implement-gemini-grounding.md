# Implement Gemini Grounding with Google Search and URL Context

**Created**: 2025-06-10
**Priority**: High
**Component**: AI Integration
**Status**: IN PROGRESS - 40% COMPLETE (Updated: 2025-06-20)

## UPDATE 2025-06-13
Comprehensive documentation on Gemini grounding capabilities has been created:
- See `/docs/gemini-grounding-capabilities.md` for full model support matrix
- Google Search grounding is supported on all Gemini models except 2.0 Flash-Lite
- URL context is supported on all models except 2.0 Flash-Lite
- Gemini 2.0+ uses "Search as Tool" approach
- Gemini 1.5 uses legacy "Dynamic Retrieval" approach

## UPDATE 2025-06-11
Type definitions for grounding have been added to the codebase:
- `groundingRequested` and `groundingInfo` fields exist in Stage interface (types/index.ts)
- Basic structure is in place for grounding configuration

However, the actual implementation is NOT complete:
- Genkit configuration does not include grounding setup
- AI stage execution does not use grounding features
- No UI components for grounding URL inputs
- No grounding indicators or citation display

## Description
Integrate Gemini's new grounding features to enhance AI responses with real-time Google Search results and URL context. This will make the content more accurate, current, and fact-based.

## Features to Implement

### 1. Google Search Grounding
- Enable Gemini to search Google for current information
- Use for fact-checking and latest data
- Particularly useful for SEO workflows needing current trends

### 2. URL Context Grounding
- Allow users to provide URLs as context
- Extract and use content from provided URLs
- Perfect for competitor analysis and research stages

## Implementation Tasks
- [ ] Update Genkit configuration for grounding
- [ ] Modify AI stage execution to support grounding
- [ ] Add URL input fields to relevant stages
- [ ] Create grounding configuration UI
- [ ] Handle grounding citations in output
- [ ] Add grounding indicators to UI
- [ ] Implement error handling for failed groundings

## Code Updates

### 1. Update Genkit Configuration
```typescript
// src/ai/genkit.ts
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [googleAI({
    // Note: Grounding is configured per-request in Gemini 2.0+
    // No global configuration needed here
  })],
  model: 'googleai/gemini-2.0-flash',
});
```

### 2. Update AI Stage Execution
```typescript
// src/ai/flows/ai-stage-execution.ts
// For Gemini 2.0+ models (Search as Tool)
const response = await model.generate({
  prompt: processedPrompt,
  config: {
    temperature: temperature || 0.0, // 0.0 recommended for grounding
    maxOutputTokens: 8192,
    tools: stage.enableGrounding ? [
      { googleSearch: {} }  // Simple tool declaration for Gemini 2.0+
    ] : undefined,
  }
});

// For Gemini 1.5 models (Dynamic Retrieval - legacy)
const response = await model.generate({
  prompt: processedPrompt,
  config: {
    temperature: temperature || 0.0,
    maxOutputTokens: 8192,
    dynamicRetrieval: stage.enableGrounding ? {
      threshold: 0.3  // Default, or 0.0 to force search
    } : undefined
  }
});
```

### 3. Update Stage Configuration
```typescript
// types/index.ts
interface Stage {
  // ... existing fields
  enableGrounding?: boolean;
  groundingUrls?: string[];
  groundingUrlsField?: string; // Field name for user-provided URLs
}
```

### 4. Add URL Input Component
```typescript
// New component for URL inputs
interface GroundingUrlsInputProps {
  urls: string[];
  onChange: (urls: string[]) => void;
  maxUrls?: number;
}
```

## Workflow Updates

### SEO Workflows
- Enable Google Search grounding for:
  - Competitor research stages
  - Keyword analysis stages
  - Current trends stages

### Content Workflows
- URL grounding for:
  - Source material stages
  - Fact-checking stages
  - Research stages

## UI/UX Considerations

### Grounding Indicators
- Show icon when grounding is active
- Display "Searching Google..." during grounding
- Show grounding sources in output
- Citation tooltips for grounded facts

### User Controls
- Toggle to enable/disable grounding per stage
- URL input with validation
- Grounding threshold slider (advanced)
- View grounding sources panel

## Example Stage Configuration
```json
{
  "id": "competitor-research",
  "title": "Competitor Research",
  "enableGrounding": true,
  "inputType": "form",
  "formFields": [
    {
      "name": "competitors",
      "label": "Competitor Websites",
      "type": "textarea",
      "placeholder": "Enter competitor URLs (one per line)"
    }
  ],
  "groundingUrlsField": "competitors",
  "promptTemplate": "Analyze these competitors with current Google data..."
}
```

## Error Handling
- Graceful fallback if grounding fails
- Clear error messages for invalid URLs
- Timeout handling for slow searches
- Retry logic for transient failures

## Implementation Notes

### Rate Limits
- Google Search grounding: 1 million queries per day limit
- Contact Google Cloud support for higher limits
- Implement usage tracking to monitor limits

### Model Compatibility
- All models support grounding EXCEPT Gemini 2.0 Flash-Lite
- Check model version before enabling grounding features
- See `/docs/gemini-grounding-capabilities.md` for full compatibility matrix

### Best Practices
- Always use temperature 0.0 when grounding is enabled
- Model decides when to use search (cannot force in 2.0+)
- Grounded URIs accessible for 30 days
- Web pages that disallow Google-Extended won't be used

## Acceptance Criteria
- [ ] Google Search grounding works in AI stages
- [ ] URL context grounding implemented
- [ ] UI shows grounding status and sources
- [ ] Citations are displayed in output
- [ ] Error handling works properly
- [ ] Performance remains acceptable
- [ ] Documentation updated
- [ ] Model compatibility checks implemented
- [ ] Rate limit monitoring in place