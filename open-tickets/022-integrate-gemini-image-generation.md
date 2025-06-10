# Integrate Gemini Image Generation into Workflow System

**Created**: 2025-01-06
**Priority**: Medium
**Component**: AI Integration, Workflow System

## Description
Extend the workflow system to support image generation capabilities using Gemini's Imagen API. This will allow workflows to generate images at various stages, enhancing content creation workflows with visual elements.

## Research & Integration Opportunities

### 1. Recipe Workflows
- Generate hero images for recipes
- Create step-by-step instruction images
- Visualize plated dishes
- Generate ingredient layout photos

### 2. SEO Content Workflows
- Generate featured images for articles
- Create infographics from data
- Produce social media preview images
- Generate visual content for better engagement

### 3. Press Release Workflows
- Generate product mockups
- Create announcement graphics
- Produce social media visuals
- Generate event imagery

## Implementation Tasks

### Core Integration
- [ ] Research Gemini Imagen API capabilities and limitations
- [ ] Update Genkit configuration to support image generation
- [ ] Add image generation flow to AI system
- [ ] Create new output type: 'image' for stages
- [ ] Implement image storage in Firebase Storage
- [ ] Add image preview components to wizard UI

### Workflow System Updates
- [ ] Extend Stage interface to support image generation config
- [ ] Add image prompt templates to workflows
- [ ] Create image-specific input types
- [ ] Implement image output handling
- [ ] Add image metadata support

### UI/UX Enhancements
- [ ] Create image preview component
- [ ] Add image download functionality
- [ ] Implement image regeneration option
- [ ] Show generation progress indicator
- [ ] Add image editing prompt refinement

## Technical Implementation

### 1. Update Types
```typescript
// types/index.ts
interface Stage {
  // ... existing fields
  outputType: 'text' | 'json' | 'markdown' | 'image';
  imageConfig?: {
    aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3';
    style?: 'photorealistic' | 'artistic' | 'sketch' | 'digital-art';
    numberOfImages?: number;
  };
}
```

### 2. Create Image Generation Flow
```typescript
// src/ai/flows/generate-image-flow.ts
import { defineFlow } from '@genkit-ai/flow';
import { z } from 'zod';

export const generateImageFlow = defineFlow({
  name: 'generateImage',
  inputSchema: z.object({
    prompt: z.string(),
    aspectRatio: z.string().optional(),
    style: z.string().optional(),
    numberOfImages: z.number().optional(),
  }),
  outputSchema: z.object({
    images: z.array(z.object({
      url: z.string(),
      metadata: z.object({
        width: z.number(),
        height: z.number(),
        format: z.string(),
      }),
    })),
  }),
  // Implementation
});
```

### 3. Update Stage Execution
```typescript
// src/ai/flows/ai-stage-execution.ts
if (stage.outputType === 'image') {
  const imageResult = await generateImageFlow({
    prompt: processedPrompt,
    ...stage.imageConfig,
  });
  
  // Store images in Firebase Storage
  const storedImages = await storeImages(imageResult.images);
  
  return {
    type: 'image',
    images: storedImages,
    prompt: processedPrompt,
  };
}
```

### 4. Image Output Component
```typescript
// src/components/wizard/image-output.tsx
interface ImageOutputProps {
  images: GeneratedImage[];
  onRegenerate: () => void;
  onDownload: (image: GeneratedImage) => void;
}
```

## Example Workflow Stage
```json
{
  "id": "hero-image-generation",
  "title": "Generate Hero Image",
  "model": "googleai/imagen-3",
  "outputType": "image",
  "imageConfig": {
    "aspectRatio": "16:9",
    "style": "photorealistic",
    "numberOfImages": 3
  },
  "promptTemplate": "Generate a stunning hero image for: {{title}}. Style: modern, professional, engaging. Include: {{key_elements}}",
  "dependsOn": ["title-generation", "key-elements"]
}
```

## Workflow-Specific Integrations

### Recipe Workflow
- Add "recipe-hero-image" stage after ingredients
- Generate step images for complex instructions
- Create ingredient arrangement photos

### SEO Content Workflow
- Add "featured-image" stage after outline
- Generate infographics from key data points
- Create social media preview images

### Press Release Workflow
- Add "announcement-graphic" stage
- Generate product visualization
- Create shareable social media assets

## Firebase Storage Structure
```
/images/
  /workflows/{workflowId}/
    /stages/{stageId}/
      /generated/{timestamp}/
        - image1.png
        - image2.png
        - metadata.json
```

## Error Handling
- [ ] Handle image generation failures gracefully
- [ ] Implement retry logic for API errors
- [ ] Provide fallback options
- [ ] Clear error messages for users
- [ ] Handle quota/rate limiting

## Performance Considerations
- [ ] Implement lazy loading for images
- [ ] Use appropriate image compression
- [ ] Cache generated images
- [ ] Optimize Firebase Storage rules
- [ ] Implement CDN integration

## Acceptance Criteria
- [ ] Image generation works in supported workflows
- [ ] Images are stored securely in Firebase Storage
- [ ] UI displays generated images properly
- [ ] Users can download generated images
- [ ] Regeneration functionality works
- [ ] Error handling is robust
- [ ] Performance is acceptable
- [ ] Documentation is updated