# Implement Gemini Grounding with Google Search and URL Context

**Created**: 2025-06-10
**Priority**: High
**Component**: AI Integration

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
    // Enable grounding features
    groundingConfig: {
      googleSearch: {
        dynamicRetrievalConfig: {
          mode: 'MODE_DYNAMIC',
          dynamicThreshold: 0.7
        }
      }
    }
  })],
  model: 'googleai/gemini-2.0-flash',
});
```

### 2. Update AI Stage Execution
```typescript
// src/ai/flows/ai-stage-execution.ts
const response = await model.generate({
  prompt: processedPrompt,
  config: {
    temperature: temperature,
    maxOutputTokens: 8192,
    tools: stage.enableGrounding ? [{
      googleSearch: {
        dynamicRetrievalConfig: {
          mode: 'MODE_DYNAMIC',
          dynamicThreshold: 0.7
        }
      }
    }] : undefined,
    groundingUrls: stage.groundingUrls || []
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

## Acceptance Criteria
- [ ] Google Search grounding works in AI stages
- [ ] URL context grounding implemented
- [ ] UI shows grounding status and sources
- [ ] Citations are displayed in output
- [ ] Error handling works properly
- [ ] Performance remains acceptable
- [ ] Documentation updated