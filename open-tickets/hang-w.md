# Fix: /w/ Route Hanging Issue

**Created**: 2025-01-14
**Priority**: HIGH
**Component**: Wizard Routes, Google GenAI SDK Integration
**Status**: RESOLVED

## Description

The `/w/` route was hanging/not loading due to multiple issues with the Google GenAI SDK migration from `@google/generative-ai` to `@google/genai`.

## Root Causes Identified

1. **Import Order Issue**: In `client-wrapper.tsx`, the `dynamic` function was used before being imported from `next/dynamic`.

2. **SDK API Mismatch**: The new `@google/genai` SDK has a different API structure:
   - Requires calling `getGenerativeModel()` first instead of direct `models.generateContent()`
   - Response structure changed from `result.text` to `response.text()`
   - Different method signatures for streaming and structured output

3. **System Instruction Handling**: Stage configuration used `systemInstructions` (plural) but the code was looking for `systemInstruction` (singular).

4. **Potential Circular Dependencies**: Complex import chains between routes and components.

## Changes Made

### 1. Fixed Import Order (`client-wrapper.tsx`)
```typescript
// Before:
const WizardPageContent = dynamic(...);
import dynamic from 'next/dynamic';

// After:
import dynamic from 'next/dynamic';
const WizardPageContent = dynamic(...);
```

### 2. Updated All Google GenAI API Calls

#### Text Generation (`text-generation.ts`)
```typescript
// Before:
const result = await genAI.models.generateContent({...});
return { text: result.text || '' };

// After:
const model = genAI.getGenerativeModel({ model: modelConfig.model });
const result = await model.generateContent({...});
const response = result.response;
return { text: response.text() || '' };
```

#### Structured Output (`structured-output.ts`)
```typescript
// Updated to use getGenerativeModel() with generationConfig
const model = genAI.getGenerativeModel({ 
  model: modelConfig.model,
  generationConfig: {...}
});
```

#### Tools Module (`tools.ts`)
```typescript
// Updated function calling to use proper model instantiation
const model = genAI.getGenerativeModel({ 
  model: modelConfig.model,
  tools: [{functionDeclarations}],
  generationConfig: {...}
});
```

### 3. Fixed System Instruction Handling
Updated all occurrences to check for both `systemInstructions` and `systemInstruction`:
```typescript
systemInstruction: stage.systemInstructions || stage.systemInstruction
```

## Testing

1. Verify `/w/` routes load without hanging
2. Test AI stage execution works properly
3. Confirm streaming responses function correctly
4. Validate structured output generation
5. Check function calling/tools work as expected

## Next Steps

1. Monitor for any remaining SDK compatibility issues
2. Consider adding integration tests for the Google GenAI SDK
3. Update documentation to reflect the new SDK usage patterns
4. Ensure all workflows are tested with the updated SDK

## Related Files

- `/src/app/a/[shortName]/[documentId]/client-wrapper.tsx`
- `/src/lib/google-genai/modules/text-generation.ts`
- `/src/lib/google-genai/modules/structured-output.ts`
- `/src/lib/google-genai/modules/tools.ts`
- `/src/lib/google-genai/ai-stage-execution.ts`
- `/src/app/api/wizard/execute/route.ts`