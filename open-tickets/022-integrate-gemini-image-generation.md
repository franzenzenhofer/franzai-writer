# 022: Integrate Gemini Image Generation

**Created**: 2025-01-17  
**Priority**: High  
**Component**: AI Integration, Workflow System  
**Epic**: Gemini Tools Integration

## Description

Implement image generation capabilities in the Franz AI Writer workflow system using Gemini 2.0 Flash Preview Image Generation and Imagen 3. The feature should seamlessly integrate with existing workflow patterns while maintaining KISS (Keep It Simple, Stupid) and DRY (Don't Repeat Yourself) principles.

## Milestone Plan

### 🎯 Milestone 1: API Verification (Day 0 - 2 hours) ✅ COMPLETED
**Goal**: Verify Gemini image generation API works before any implementation

- [x] Create and run test script (`test-scripts/test-image-generation.mjs`)
- [x] Test various prompts and aspect ratios
- [x] Verify image data structure and response format
- [x] Test error scenarios and rate limits
- [x] Document API response structure

**Deliverable**: Working test script with sample generated images

**Learnings from M1**:
1. ✅ **Imagen 3 works perfectly** - Generates high-quality images with all aspect ratios
   - Average generation time: ~8-9 seconds per request
   - Returns 2-4 images per request as configured
   - Proper aspect ratio support (1:1, 16:9, 9:16, 4:3, 3:4)
   - Images are PNG format, proper dimensions

2. ⚠️ **Gemini image generation not available - Regional restriction**
   - Tested 10+ Gemini models - ALL return: **"Image generation is not available in your country"**
   - Models tested:
     - `gemini-2.0-flash-preview-image-generation` - 404 Not Found
     - `gemini-2.0-flash` - "Model does not support responseModalities: image,text"
     - `gemini-2.0-flash-exp` - "not available in your country"
     - `gemini-1.5-flash/pro` - "not available in your country"
   - This is a **regional/country restriction**, not a technical issue

3. 📋 **API Structure Insights**:
   - Imagen uses `genAI.models.generateImages()` method
   - Response structure: `{ generatedImages: [{ image: { imageBytes: base64 } }] }`
   - Gemini would use `genAI.models.generateContent()` with responseModalities
   - Region check happens before image generation attempt

4. 💡 **Recommendation**: **Use Imagen 3 exclusively** for image generation
   - It's the only working option in the current region
   - High quality output with all required features
   - Requires paid tier but delivers excellent results

### 🎯 Milestone 2: Basic Image Generation (Day 1-2)
**Goal**: Minimal viable image generation in a workflow

- [ ] Add `"image"` to StageOutputType
- [ ] Create basic ImageOutputDisplay component
- [ ] Extend runAiStage to handle image generation
- [ ] Update StageOutputArea for image display
- [ ] Create test workflow with simple image generation

**Deliverable**: Working image generation stage that displays images (data URLs only)

### 🎯 Milestone 3: Storage & Persistence (Day 3)
**Goal**: Images persist across sessions via Firebase Storage

- [ ] Implement Firebase Storage upload after generation
- [ ] Store public URLs instead of data URLs
- [ ] Update document persistence to include image URLs
- [ ] Test image persistence across page reloads
- [ ] Add download functionality

**Deliverable**: Generated images persist and remain accessible

### 🎯 Milestone 4: Asset Management Foundation (Day 4-5)
**Goal**: Centralized asset tracking system

- [ ] Create assets Firestore collection and schema
- [ ] Implement AssetManager service class
- [ ] Integrate asset creation with image generation
- [ ] Set up Firestore rules for assets
- [ ] Add asset ID to stage outputs
- [ ] Implement basic CRUD operations

**Deliverable**: All generated images tracked in assets collection

### 🎯 Milestone 5: Enhanced UI & Workflows (Day 6-7)
**Goal**: Polish user experience and workflow integration

- [ ] Add all aspect ratio options (5 total)
- [ ] Implement AI Redo for image refinement
- [ ] Add multiple workflow examples
- [ ] Create comprehensive form validations
- [ ] Add loading states and animations
- [ ] Support style selection in forms

**Deliverable**: Polished image generation experience

### 🎯 Milestone 6: Asset Gallery & Reuse (Day 8-9)
**Goal**: Users can manage and reuse their assets

- [ ] Create Asset Gallery page (`/dashboard/assets`)
- [ ] Implement AssetCard component
- [ ] Add asset picker form field type
- [ ] Enable asset reuse across documents
- [ ] Add filtering and search
- [ ] Implement soft delete

**Deliverable**: Full asset management UI

### 🎯 Milestone 7: Advanced Features (Day 10-11)
**Goal**: Production-ready features

- [ ] Orphaned asset cleanup system
- [ ] Bulk operations support
- [ ] Asset tagging system
- [ ] Usage analytics
- [ ] Thumbnail generation
- [ ] Multi-image support (Imagen)

**Deliverable**: Complete asset lifecycle management

### 🎯 Milestone 8: Testing & Documentation (Day 12)
**Goal**: Comprehensive testing and documentation

- [ ] Complete E2E test suite
- [ ] API integration tests
- [ ] Asset management tests
- [ ] Performance testing
- [ ] Update documentation
- [ ] Create video tutorials

**Deliverable**: Fully tested and documented feature

## Success Metrics

### Per Milestone Success Criteria:

1. **M1 - API Verification**: ✅ when test script generates 3+ different images
2. **M2 - Basic Generation**: ✅ when user can generate and see an image in workflow
3. **M3 - Storage**: ✅ when images survive page refresh
4. **M4 - Asset Management**: ✅ when every image has an asset record
5. **M5 - Enhanced UI**: ✅ when all 5 aspect ratios work + AI Redo functions
6. **M6 - Asset Gallery**: ✅ when user can reuse image from previous document
7. **M7 - Advanced**: ✅ when orphaned assets auto-delete after test
8. **M8 - Testing**: ✅ when all E2E tests pass

### Implementation Progress Tracker:

```
Week 1: Foundation
[M1: API Test    ] ████████████ Day 0 (2hr)
[M2: Basic Gen   ] ████████████████████████ Day 1-2
[M3: Storage     ] ████████████ Day 3

Week 2: Core Features  
[M4: Asset Mgmt  ] ████████████████████████ Day 4-5
[M5: Enhanced UI ] ████████████████████████ Day 6-7

Week 3: Advanced
[M6: Gallery     ] ████████████████████████ Day 8-9
[M7: Advanced    ] ████████████████████████ Day 10-11
[M8: Testing     ] ████████████ Day 12
```

### Risk Mitigation:

1. **API Availability**: Test in Milestone 1 before any UI work
2. **Storage Costs**: Implement cleanup in Milestone 4
3. **Performance**: Add pagination in Milestone 6
4. **Complexity**: Each milestone is independently valuable

### Value Delivery Timeline:

- **After M1**: Development confidence, API understanding
- **After M2**: Users can generate images (MVP) 🎉
- **After M3**: Images persist, shareable URLs
- **After M4**: Proper tracking, no lost assets
- **After M5**: Professional UI, multiple styles
- **After M6**: Asset reuse, cost savings 💰
- **After M7**: Self-maintaining system
- **After M8**: Production-ready, fully tested

### Go/No-Go Decision Points:

1. **After M1**: If API doesn't work → investigate alternatives
2. **After M2**: If performance poor → optimize before storage
3. **After M4**: If asset tracking complex → simplify schema
4. **After M6**: If reuse low → deprioritize M7 features

## Pre-Implementation Testing

Before starting Milestone 1, ensure environment is ready:

```bash
# 1. Install test dependencies
npm install @google/generative-ai

# 2. Set up environment
export GOOGLE_GENAI_API_KEY="your-api-key-here"

# 3. Create test directory
mkdir -p test-scripts test-downloads

# 4. Run the test script (after creating it)
node test-scripts/test-image-generation.mjs
```

## Implementation Todo List

### Phase 0: Asset Management Foundation (Day 0.5)

- [ ] **Create Asset Management System**
  - [ ] Create `assets` Firestore collection with indexes
  - [ ] Implement `AssetManager` class (`src/lib/asset-manager.ts`)
  - [ ] Create Asset interface in types
  - [ ] Set up Firestore rules for assets collection
  - [ ] Create asset ID generation using nanoid
  - [ ] Implement asset CRUD operations

- [ ] **Asset Storage Structure**
  - [ ] Standardize storage paths: `assets/{assetId}/original.{ext}`
  - [ ] Implement thumbnail generation for images (optional)
  - [ ] Set up public read access for asset URLs

### Phase 1: Core Infrastructure (Day 1)

- [ ] **Type System Updates** (`src/types/index.ts`)
  - [ ] Add `"image"` to `StageOutputType` union type
  - [ ] Create `ImageGenerationSettings` interface with provider configuration
  - [ ] Create `ImageOutputData` interface for structured image output
  - [ ] Add `imageGenerationSettings?: ImageGenerationSettings` to Stage interface

- [ ] **Create Image Output Display Component** (`src/components/wizard/image-output-display.tsx`)
  - [ ] Create component that accepts `ImageOutputData` as props
  - [ ] Implement image rendering with proper aspect ratio handling
  - [ ] Add download button for each image
  - [ ] Support gallery view for multiple images (Imagen)
  - [ ] Include loading skeleton while images are being generated
  - [ ] Handle error states gracefully

- [ ] **Update Stage Output Area** (`src/components/wizard/stage-output-area.tsx`)
  - [ ] Add case for `outputType === "image"` in render switch
  - [ ] Import and integrate `ImageOutputDisplay` component
  - [ ] Pass appropriate props including stageState output data

### Phase 2: AI Integration (Day 2)

- [ ] **Extend AI Stage Runner** (`src/app/actions/aiActions-new.ts`)
  - [ ] Add detection for `stage.outputType === "image"`
  - [ ] Implement image generation logic in `runAiStage`
  - [ ] Support both Gemini and Imagen providers based on config
  - [ ] Handle prompt template substitution with context vars
  - [ ] Add proper AI logging for image generation events
  - [ ] Implement error handling with user-friendly messages
  - [ ] **Critical: Add automatic Firebase Storage upload after generation**
  - [ ] Return both dataUrl (for immediate display) and publicUrl (for persistence)

- [ ] **Update Direct Gemini Integration** (`src/ai/direct-gemini.ts`)
  - [ ] Add support for `responseModalities: ["TEXT", "IMAGE"]`
  - [ ] Update request configuration for image generation models
  - [ ] Parse image data from response candidates
  - [ ] Convert inline data to base64 data URLs
  - [ ] Handle both text and image parts in responses

- [ ] **Create Image Generation Helper** (`src/lib/ai-image-generator.ts`)
  - [ ] Extract image generation logic for reusability
  - [ ] Support Gemini native image generation
  - [ ] Support Imagen 3 API calls
  - [ ] Handle aspect ratio configurations
  - [ ] Implement retry logic for failed generations

### Phase 3: Workflow Integration (Day 3)

- [ ] **Create Test Workflow** (`src/workflows/test-image-generation/`)
  - [ ] Create `workflow.json` with image generation stages
  - [ ] Add prompt templates for different use cases
  - [ ] Include both simple and complex image generation examples
  - [ ] Test different aspect ratios and styles

- [ ] **Form Field Support** 
  - [ ] Verify select field works for aspect ratio selection
  - [ ] Ensure textarea properly captures multi-line prompts
  - [ ] Add proper validation for required fields

- [ ] **Context Variable Integration**
  - [ ] Ensure image prompt stage output is available to generation stage
  - [ ] Support referencing previous text stages in image prompts
  - [ ] Allow configuration access in prompt templates

### Phase 4: AI Redo Support (Day 4)

- [ ] **Extend AI Redo for Images** (`src/components/wizard/ai-redo-section.tsx`)
  - [ ] Add image-specific refinement prompts
  - [ ] Support "Regenerate with changes" option
  - [ ] Support "Try again with same prompt" option
  - [ ] Add style variation dropdown (optional)

- [ ] **Image Editing Support** (Gemini only)
  - [ ] Pass original image data in AI redo requests
  - [ ] Construct multimodal prompts for image editing
  - [ ] Handle text-and-image-to-image requests
  - [ ] Preserve original image for comparison

### Phase 5: Advanced Features (Day 5)

- [ ] **Asset Management UI**
  - [ ] Create Asset Gallery page (`/dashboard/assets`)
  - [ ] Implement AssetCard component with preview
  - [ ] Add filtering by type, date, tags
  - [ ] Add search by filename or description
  - [ ] Implement bulk actions (delete, tag)
  - [ ] Show usage count and document links
  - [ ] Add "Copy URL" button for each asset

- [ ] **Asset Picker Form Field**
  - [ ] Create custom form field type "asset-picker"
  - [ ] Show inline asset gallery in forms
  - [ ] Support filtering by asset type
  - [ ] Allow direct upload in picker
  - [ ] Show asset metadata on hover

- [ ] **Multiple Image Support** (Imagen)
  - [ ] Handle `numberOfImages` parameter (1-4, default: 4)
  - [ ] Display images in responsive grid
  - [ ] Allow user to select preferred image
  - [ ] Pass selected image to next stage

- [ ] **Style and Quality Controls**
  - [ ] Add negative prompt support
  - [ ] Implement style guidance options
  - [ ] Support quality modifiers in prompts
  - [ ] Add photography-specific parameters
  - [ ] Support text in images (25 chars max for best results)

- [ ] **Advanced Image Generation Modes** (Gemini)
  - [ ] Text to image(s) and text (interleaved output)
  - [ ] Image(s) and text to image(s) and text (image editing)
  - [ ] Multi-turn image editing (conversational refinement)
  - [ ] Handle cases where model outputs text only

- [ ] **Image Persistence & Storage** (CRITICAL for workflow continuity)
  - [ ] Implement automatic Firebase Storage upload for all generated images
  - [ ] Generate unique storage paths: `images/{userId}/{documentId}/{stageId}/{timestamp}-{index}.png`
  - [ ] Store both data URL (temporary) and storage URL (permanent) in stage output
  - [ ] Update stage output to include accessible URLs for subsequent stages
  - [ ] Implement storage cleanup for deleted documents
  - [ ] Add image URL validation before passing to next stages
  - [ ] Handle storage permissions and quotas
  - [ ] Add retry logic for failed uploads

### Phase 6: Testing & Documentation (Day 6)

- [ ] **API Test Script** (`test-scripts/test-image-generation.mjs`)
  - [ ] Create standalone script to test Gemini image generation API
  - [ ] Test with various prompts and aspect ratios
  - [ ] Verify response structure and image data
  - [ ] Test error handling (invalid prompts, rate limits)
  - [ ] Save generated images locally for verification
  - [ ] Test both Gemini and Imagen APIs (when available)

- [ ] **E2E Tests** (`tests/e2e/image-generation-workflow.spec.ts`)
  - [ ] Test complete image generation workflow
  - [ ] Verify different aspect ratios work
  - [ ] Test AI redo functionality
  - [ ] Check error handling scenarios
  - [ ] Verify Firebase Storage upload
  - [ ] Test cross-stage image access
  - [ ] Verify image persistence after page reload
  - [ ] Test multiple image selection (Imagen)

- [ ] **Playwright Visual Tests**
  - [ ] Screenshot image generation stage in various states
  - [ ] Capture loading animations
  - [ ] Verify responsive grid for multiple images
  - [ ] Test image download functionality
  - [ ] Verify error state displays

- [ ] **Unit Tests**
  - [ ] Test image output display component
  - [ ] Test AI action image generation logic
  - [ ] Test Firebase Storage upload functions
  - [ ] Test data URL to blob conversion
  - [ ] Test helper functions

- [ ] **Documentation**
  - [ ] Update workflow schema documentation
  - [ ] Create image generation guide
  - [ ] Document provider differences
  - [ ] Add troubleshooting section

## Architecture Alignment

### KISS Principles Applied:
1. **Reuse existing patterns**: Follow the same two-stage pattern (input → generation) used in other workflows
2. **Leverage existing components**: Use StageCard, StageInputArea, StageOutputArea without modification
3. **Simple configuration**: All settings via workflow.json, no hardcoded logic
4. **Clear separation**: Input gathering separate from generation logic

### DRY Principles Applied:
1. **Shared AI infrastructure**: Extend existing `runAiStage` instead of creating new endpoints
2. **Reusable components**: Create one `ImageOutputDisplay` component for all image stages  
3. **Common type definitions**: Single source of truth for image-related types
4. **Unified error handling**: Use existing error display patterns

## Technical Specifications

### Supported Models:
- **Gemini 2.0 Flash Preview Image Generation** (`gemini-2.0-flash-preview-image-generation`)
  - Best for: Conversational image generation, editing existing images
  - Features: Text output alongside images, multi-turn editing
  - Requirements: Must include `responseModalities: ["TEXT", "IMAGE"]` in configuration
  - Limitations: Best performance with EN, es-MX, ja-JP, zh-CN, hi-IN languages
  
- **Imagen 3** (`imagen-3.0-generate-002`)
  - Best for: High-quality standalone images, artistic styles, photorealism
  - Features: Multiple images per request (1-4), aspect ratio control
  - Parameters:
    - `numberOfImages`: 1-4 (default: 4)
    - `aspectRatio`: "1:1", "3:4", "4:3", "9:16", "16:9" (default: "1:1")
    - `personGeneration`: "dont_allow", "allow_adult", "allow_all" (default: "allow_adult")
  - Note: Only available on Paid tier, English prompts only
  - Maximum prompt length: 480 tokens

### Image Output Structure:
```typescript
interface ImageOutputData {
  provider: "gemini" | "imagen";
  images: Array<{
    dataUrl?: string;       // Base64 data URL (temporary, for immediate display)
    storageUrl: string;     // Firebase Storage URL (permanent, for cross-stage use)
    publicUrl: string;      // Public HTTPS URL for the image
    promptUsed: string;     // Actual prompt sent to API
    mimeType: string;       // e.g., "image/png"
    width?: number;         // Image dimensions
    height?: number;
    aspectRatio: string;    // e.g., "16:9"
  }>;
  selectedImageIndex?: number; // For multi-image generation
  accompanyingText?: string;   // Gemini's text response
}
```

### Image Storage Implementation:
```typescript
// In runAiStage after image generation
const uploadedImages = await Promise.all(
  resultOutput.images.map(async (img, index) => {
    const storagePath = `images/${userId}/${documentId}/${stageId}/${Date.now()}-${index}.png`;
    const storageRef = ref(storage, storagePath);
    
    // Convert data URL to blob
    const blob = await dataURLtoBlob(img.dataUrl);
    
    // Upload to Firebase Storage
    await uploadBytes(storageRef, blob, { contentType: img.mimeType });
    
    // Get public URL
    const publicUrl = await getDownloadURL(storageRef);
    
    return {
      ...img,
      storageUrl: storagePath,
      publicUrl: publicUrl
    };
  })
);
```

### Workflow Configuration Example:
```json
{
  "stages": [
    {
      "id": "image-prompt",
      "title": "Describe Your Image",
      "inputType": "form",
      "outputType": "json",
      "formFields": [
        {
          "name": "description",
          "label": "What would you like to see?",
          "type": "textarea",
          "placeholder": "A serene mountain landscape at sunset...",
          "validation": { "required": true, "minLength": 10 }
        },
        {
          "name": "aspectRatio",
          "label": "Image Format",
          "type": "select",
          "defaultValue": "1:1",
          "options": [
            { "value": "1:1", "label": "Square (Social Media)" },
            { "value": "16:9", "label": "Widescreen (Landscape)" },
            { "value": "9:16", "label": "Portrait (Mobile)" },
            { "value": "4:3", "label": "Fullscreen (Classic)" },
            { "value": "3:4", "label": "Portrait Fullscreen" }
          ]
        },
        {
          "name": "style",
          "label": "Image Style (Optional)",
          "type": "select",
          "defaultValue": "",
          "options": [
            { "value": "", "label": "Auto (Model decides)" },
            { "value": "photorealistic", "label": "Photorealistic" },
            { "value": "digital art", "label": "Digital Art" },
            { "value": "pencil sketch", "label": "Pencil Sketch" },
            { "value": "oil painting", "label": "Oil Painting" },
            { "value": "anime", "label": "Anime Style" }
          ]
        }
      ]
    },
    {
      "id": "generate-image",
      "title": "Generate Image",
      "inputType": "none",
      "outputType": "image",
      "dependencies": ["image-prompt"],
      "model": "gemini-2.0-flash-preview-image-generation",
      "promptTemplate": "Create an image: {{image-prompt.output.description}}{{#if image-prompt.output.style}} in {{image-prompt.output.style}} style{{/if}}",
      "aiRedoEnabled": true,
      "imageGenerationSettings": {
        "provider": "gemini",
        "gemini": {
          "responseModalities": ["TEXT", "IMAGE"]
        },
        "qualityModifiers": ["high-quality", "detailed"],
        "negativePrompt": "blurry, low quality, distorted, watermark"
      }
    }
  ]
}
```

## Acceptance Criteria

1. **Basic Functionality**
   - [ ] Users can describe an image and see it generated
   - [ ] Aspect ratio selection works correctly
   - [ ] Images display properly with download option
   - [ ] Loading states show during generation

2. **AI Integration**  
   - [ ] Gemini 2.0 Flash Preview generates images successfully
   - [ ] Imagen 3 integration works (when implemented)
   - [ ] Error messages are clear and actionable
   - [ ] AI logging captures all generation events

3. **Asset Management**
   - [ ] All generated images create asset records
   - [ ] Assets track document associations correctly
   - [ ] Users can view all their assets in gallery
   - [ ] Assets can be reused across documents
   - [ ] Soft delete works properly
   - [ ] Orphaned assets clean up automatically

4. **Workflow Integration**
   - [ ] Image stages work in any workflow position
   - [ ] Context from previous stages is accessible
   - [ ] Output can be referenced by subsequent stages
   - [ ] Dependencies and autoRun work correctly
   - [ ] Asset IDs persist with document

5. **Storage & Persistence**
   - [ ] Images upload to Firebase Storage automatically
   - [ ] Public URLs remain accessible permanently
   - [ ] Images persist across page reloads
   - [ ] Storage paths follow naming convention
   - [ ] Firestore rules enforce proper access control

6. **UI/UX Quality**
   - [ ] Responsive design for all screen sizes
   - [ ] Smooth loading animations
   - [ ] Clear error states
   - [ ] Intuitive refinement options
   - [ ] Asset gallery is easy to navigate

7. **Code Quality**
   - [ ] No TypeScript errors
   - [ ] Passes all linting rules
   - [ ] Includes appropriate tests
   - [ ] Follows existing code patterns

## Notes

- Start with Gemini integration only, add Imagen 3 in a follow-up
- **Firebase Storage integration is REQUIRED** - images must persist across sessions
- Focus on single image generation first, then add multi-image support
- Ensure proper error handling for region restrictions
- Consider rate limiting and quota management
- All generated images include a SynthID watermark

## Asset Management System

### Firestore Collection Structure:

```typescript
// Collection: assets
interface Asset {
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
  createdAt: Timestamp;
  source: 'generated' | 'uploaded';
  generationPrompt?: string;      // If AI-generated
  generationModel?: string;       // e.g., "gemini-2.0-flash-preview-image-generation"
  
  // Document associations
  documentIds: string[];          // Array of document IDs using this asset
  stageReferences: Array<{        // Detailed usage tracking
    documentId: string;
    stageId: string;
    addedAt: Timestamp;
  }>;
  
  // Lifecycle
  lastAccessedAt: Timestamp;
  isDeleted: boolean;             // Soft delete flag
  deletedAt?: Timestamp;
  
  // Optional metadata
  tags?: string[];                // User-defined tags
  description?: string;           // User-provided description
}
```

### Asset Service Implementation:

```typescript
// src/lib/asset-manager.ts
export class AssetManager {
  // Create asset record when image is generated
  async createAsset(params: {
    userId: string;
    file: Blob | Buffer;
    metadata: {
      fileName: string;
      mimeType: string;
      source: 'generated' | 'uploaded';
      generationPrompt?: string;
      documentId?: string;
      stageId?: string;
    }
  }): Promise<Asset> {
    // 1. Generate asset ID
    const assetId = nanoid();
    
    // 2. Upload to standardized path
    const ext = mimeType.split('/')[1];
    const storagePath = `assets/${assetId}/original.${ext}`;
    const storageRef = ref(storage, storagePath);
    
    // 3. Upload file
    await uploadBytes(storageRef, file, { contentType: mimeType });
    const publicUrl = await getDownloadURL(storageRef);
    
    // 4. Create asset record
    const asset: Asset = {
      id: assetId,
      userId,
      type: 'image',
      mimeType,
      storageUrl: storagePath,
      publicUrl,
      fileName: metadata.fileName,
      fileSize: file.size,
      createdAt: serverTimestamp(),
      source: metadata.source,
      generationPrompt: metadata.generationPrompt,
      documentIds: metadata.documentId ? [metadata.documentId] : [],
      stageReferences: metadata.documentId && metadata.stageId ? [{
        documentId: metadata.documentId,
        stageId: metadata.stageId,
        addedAt: serverTimestamp()
      }] : [],
      lastAccessedAt: serverTimestamp(),
      isDeleted: false
    };
    
    // 5. Save to Firestore
    await setDoc(doc(db, 'assets', assetId), asset);
    
    return asset;
  }
  
  // Add asset to document (for existing assets)
  async addAssetToDocument(assetId: string, documentId: string, stageId: string) {
    await updateDoc(doc(db, 'assets', assetId), {
      documentIds: arrayUnion(documentId),
      stageReferences: arrayUnion({
        documentId,
        stageId,
        addedAt: serverTimestamp()
      }),
      lastAccessedAt: serverTimestamp()
    });
  }
  
  // Remove asset from document (doesn't delete asset)
  async removeAssetFromDocument(assetId: string, documentId: string) {
    const assetDoc = await getDoc(doc(db, 'assets', assetId));
    const asset = assetDoc.data() as Asset;
    
    await updateDoc(doc(db, 'assets', assetId), {
      documentIds: arrayRemove(documentId),
      stageReferences: asset.stageReferences.filter(ref => ref.documentId !== documentId)
    });
    
    // Check if asset is orphaned
    if (asset.documentIds.length === 1 && asset.documentIds[0] === documentId) {
      // Asset will be orphaned, mark for cleanup
      await this.markAssetForCleanup(assetId);
    }
  }
  
  // Soft delete asset
  async softDeleteAsset(assetId: string, userId: string) {
    // Verify ownership
    const assetDoc = await getDoc(doc(db, 'assets', assetId));
    if (assetDoc.data()?.userId !== userId) {
      throw new Error('Unauthorized');
    }
    
    await updateDoc(doc(db, 'assets', assetId), {
      isDeleted: true,
      deletedAt: serverTimestamp()
    });
  }
  
  // Get user's assets
  async getUserAssets(userId: string, options?: {
    type?: 'image' | 'video' | 'file';
    documentId?: string;
    includeDeleted?: boolean;
    limit?: number;
  }) {
    let q = query(
      collection(db, 'assets'),
      where('userId', '==', userId)
    );
    
    if (!options?.includeDeleted) {
      q = query(q, where('isDeleted', '==', false));
    }
    
    if (options?.type) {
      q = query(q, where('type', '==', options.type));
    }
    
    if (options?.documentId) {
      q = query(q, where('documentIds', 'array-contains', options.documentId));
    }
    
    q = query(q, orderBy('createdAt', 'desc'));
    
    if (options?.limit) {
      q = query(q, limit(options.limit));
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Asset));
  }
  
  // Cleanup orphaned assets (scheduled function)
  async cleanupOrphanedAssets() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const q = query(
      collection(db, 'assets'),
      where('documentIds', '==', []),
      where('lastAccessedAt', '<', thirtyDaysAgo),
      where('isDeleted', '==', false)
    );
    
    const snapshot = await getDocs(q);
    
    for (const doc of snapshot.docs) {
      const asset = doc.data() as Asset;
      // Delete from storage
      await deleteObject(ref(storage, asset.storageUrl));
      // Delete from Firestore
      await deleteDoc(doc.ref);
    }
  }
}
```

### Integration with Image Generation:

```typescript
// In runAiStage after image generation
const assetManager = new AssetManager();

const uploadedImages = await Promise.all(
  resultOutput.images.map(async (img, index) => {
    // Create asset record
    const asset = await assetManager.createAsset({
      userId: params.userId,
      file: await dataURLtoBlob(img.dataUrl),
      metadata: {
        fileName: `generated-${Date.now()}-${index}.png`,
        mimeType: img.mimeType,
        source: 'generated',
        generationPrompt: img.promptUsed,
        documentId: params.documentId,
        stageId: params.stage.id
      }
    });
    
    return {
      ...img,
      assetId: asset.id,
      storageUrl: asset.storageUrl,
      publicUrl: asset.publicUrl
    };
  })
);
```

### Asset Gallery Component:

```typescript
// src/components/asset-gallery/asset-gallery.tsx
export function AssetGallery({ userId, onSelectAsset }: Props) {
  const [assets, setAssets] = useState<Asset[]>([]);
  
  // Load user's assets
  useEffect(() => {
    const assetManager = new AssetManager();
    assetManager.getUserAssets(userId, { type: 'image' }).then(setAssets);
  }, [userId]);
  
  return (
    <div className="grid grid-cols-4 gap-4">
      {assets.map(asset => (
        <AssetCard
          key={asset.id}
          asset={asset}
          onSelect={() => onSelectAsset(asset)}
          onDelete={() => handleDelete(asset.id)}
        />
      ))}
    </div>
  );
}
```

### Firestore Rules for Assets:

```javascript
// firestore.rules
match /assets/{assetId} {
  allow read: if request.auth != null && 
    (resource.data.userId == request.auth.uid || 
     resource.data.documentIds.hasAny(getUserDocumentIds()));
  
  allow create: if request.auth != null && 
    request.auth.uid == request.resource.data.userId;
  
  allow update: if request.auth != null && 
    request.auth.uid == resource.data.userId;
  
  allow delete: if request.auth != null && 
    request.auth.uid == resource.data.userId;
}
```

### Benefits of Asset Management System:

1. **Single Source of Truth**: Each asset has one record, even if used in multiple documents
2. **Efficient Storage**: No duplicate uploads when reusing assets
3. **Easy Deletion**: Users can manage all their assets from one place
4. **Orphan Cleanup**: Automatic cleanup of unused assets after 30 days
5. **Usage Tracking**: Know exactly where each asset is used
6. **Metadata Rich**: Store generation prompts, dimensions, tags for better organization
7. **Future Ready**: Supports video, files, and other asset types
8. **Performance**: Asset URLs are permanent and cacheable

### Simple Asset Reuse Flow:

```typescript
// In a workflow stage that allows asset selection
{
  "id": "select-image",
  "title": "Choose or Generate Image",
  "inputType": "form",
  "formFields": [
    {
      "name": "imageSource",
      "type": "select",
      "options": [
        { "value": "generate", "label": "Generate New Image" },
        { "value": "existing", "label": "Choose from My Assets" }
      ]
    },
    {
      "name": "assetId",
      "type": "asset-picker", // Custom form field type
      "when": { "imageSource": "existing" },
      "assetType": "image"
    }
  ]
}
```

### Asset Usage in Templates:

```handlebars
{{! When using an asset in a template }}
{{#if select-image.output.assetId}}
  <img src="{{getAssetUrl select-image.output.assetId}}" 
       alt="{{getAssetDescription select-image.output.assetId}}">
{{/if}}
```

## Document Persistence Integration

### Image URLs in Document State:
```typescript
// When saving document, image URLs are automatically included in stage output
const documentData = {
  stages: {
    "generate-image": {
      output: {
        provider: "gemini",
        images: [{
          publicUrl: "https://storage.googleapis.com/...",  // This persists
          storageUrl: "images/userId/docId/stageId/...",   // This persists
          // dataUrl is NOT saved to reduce document size
        }]
      }
    }
  }
};
```

### Key Implementation Points:
1. **Always upload to Firebase Storage** - Never rely on data URLs for persistence
2. **Public URLs are permanent** - Can be used in HTML, exports, and external sharing
3. **Storage paths follow convention** - Easy to manage and clean up orphaned images
4. **Images persist with document** - When document loads, images are immediately available
5. **No re-generation needed** - Once created, images stay with the document

## Cross-Stage Image Usage

### How Subsequent Stages Access Generated Images:

```json
{
  "id": "html-generation",
  "title": "Create HTML with Images",
  "dependencies": ["generate-image"],
  "promptTemplate": "Create an HTML article about {{topic}} and include this image: <img src=\"{{generate-image.output.images[0].publicUrl}}\" alt=\"{{generate-image.output.images[0].promptUsed}}\">",
  "description": "The HTML will include the generated image automatically"
}
```

### In Export Stage Templates:
```markdown
# Article with Generated Image

![Generated Image]({{generate-image.output.images[0].publicUrl}})

The image above was generated with the prompt: "{{generate-image.output.images[0].promptUsed}}"
```

### Accessing Multiple Images:
```typescript
// In subsequent stages, you can access all images:
const allImageUrls = contextVars['generate-image'].output.images.map(img => img.publicUrl);
const selectedImage = contextVars['generate-image'].output.images[
  contextVars['generate-image'].output.selectedImageIndex || 0
];
```

### Firebase Storage Rules:
```javascript
// storage.rules
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /images/{userId}/{documentId}/{stageId}/{filename} {
      allow read: if true;  // Public read for generated images
      allow write: if request.auth != null && request.auth.uid == userId;
      allow delete: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Asset Management Architecture Summary

### KISS & DRY Benefits:

1. **One Asset = One Record** (DRY)
   - No duplicate storage when reusing images
   - Single update propagates everywhere
   - Centralized metadata management

2. **Simple Integration** (KISS)
   - Assets automatically tracked when created
   - Stage outputs just store asset IDs
   - Public URLs work everywhere (HTML, exports, sharing)

3. **Automatic Lifecycle** (KISS)
   - Upload → Track → Use → Cleanup
   - No manual cleanup needed
   - Orphaned assets auto-delete after 30 days

4. **Future-Proof** (DRY)
   - Works for images, videos, PDFs, any file type
   - Same system for generated and uploaded assets
   - Extensible metadata structure

### Usage Example:
```typescript
// Generate image → Automatic asset creation
const result = await runAiStage({ stage: imageGenStage });
// result.output.assetId is automatically created

// Later stages just reference the asset
promptTemplate: "Create article using image: {{getAsset imageStage.output.assetId}}"

// User can reuse in another document
const asset = await assetManager.getAsset(assetId);
await assetManager.addAssetToDocument(assetId, newDocId, stageId);
```

## Prompt Engineering Guidelines

### For Better Results:
1. **Structure prompts with**: Subject + Context/Background + Style
2. **Quality modifiers**: "4K", "HDR", "high-quality", "professional", "detailed"
3. **Photography terms**: Lens types (35mm, macro), lighting (natural, dramatic), camera settings
4. **Art styles**: "impressionist", "digital art", "pencil sketch", "photorealistic"
5. **Materials**: "made of [material]", "in the shape of [object]"

### Model Selection Guidelines:

**Choose Gemini when:**
- Need contextually relevant images with world knowledge
- Want to blend text and images seamlessly
- Need to edit images conversationally
- Working with multi-turn image refinement

**Choose Imagen 3 when:**
- Image quality and photorealism are top priorities
- Need specific artistic styles (anime, impressionism)
- Creating logos, product designs, or branding materials
- Require multiple variations of the same concept

## Test Script Example

### API Test Script (`test-scripts/test-image-generation.mjs`):
```javascript
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs/promises';
import path from 'path';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY);

async function testGeminiImageGeneration() {
  console.log('🎨 Testing Gemini Image Generation...\n');

  const testCases = [
    {
      prompt: "A serene mountain landscape at sunset with a lake",
      aspectRatio: "16:9",
      style: "photorealistic"
    },
    {
      prompt: "A cute robot holding a flower, digital art style",
      aspectRatio: "1:1",
      style: "digital art"
    },
    {
      prompt: "An abstract representation of artificial intelligence",
      aspectRatio: "9:16",
      style: "modern art"
    }
  ];

  for (const [index, testCase] of testCases.entries()) {
    try {
      console.log(`Test ${index + 1}: ${testCase.prompt}`);
      console.log(`Aspect Ratio: ${testCase.aspectRatio}, Style: ${testCase.style}`);

      const model = genAI.getGenerativeModel({ 
        model: 'gemini-2.0-flash-preview-image-generation' 
      });

      const result = await model.generateContent({
        contents: [{ 
          text: `Create a ${testCase.style} image: ${testCase.prompt}. Aspect ratio: ${testCase.aspectRatio}` 
        }],
        generationConfig: {
          temperature: 0.4,
          topK: 32,
          topP: 1,
          maxOutputTokens: 4096,
        }
      });

      const response = await result.response;
      console.log('Text response:', response.text());

      // Extract image data
      let imageCount = 0;
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          imageCount++;
          const imageData = part.inlineData.data;
          const mimeType = part.inlineData.mimeType;
          
          // Save image
          const filename = `test-${index + 1}-${imageCount}.png`;
          const filePath = path.join('test-downloads', filename);
          
          await fs.writeFile(filePath, Buffer.from(imageData, 'base64'));
          console.log(`✅ Image saved: ${filename}`);
        }
      }

      if (imageCount === 0) {
        console.log('⚠️  No images generated in response');
      }

      console.log('---\n');
    } catch (error) {
      console.error(`❌ Error in test ${index + 1}:`, error.message);
      console.log('---\n');
    }
  }
}

// Test error handling
async function testErrorHandling() {
  console.log('🧪 Testing Error Handling...\n');

  const errorCases = [
    { prompt: "", description: "Empty prompt" },
    { prompt: "a".repeat(500), description: "Exceeding token limit" },
  ];

  for (const errorCase of errorCases) {
    try {
      console.log(`Testing: ${errorCase.description}`);
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-2.0-flash-preview-image-generation' 
      });

      await model.generateContent(errorCase.prompt);
    } catch (error) {
      console.log(`✅ Expected error caught: ${error.message}`);
    }
  }
}

// Main execution
async function main() {
  // Create test directory
  await fs.mkdir('test-downloads', { recursive: true });

  // Run tests
  await testGeminiImageGeneration();
  await testErrorHandling();

  console.log('🎉 Image generation API tests complete!');
}

main().catch(console.error);
```

### Playwright E2E Test (`tests/e2e/image-generation-workflow.spec.ts`):
```typescript
import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Image Generation Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/w/test-image-generation/new');
    await page.waitForLoadState('networkidle');
  });

  test('should generate image with text prompt', async ({ page }) => {
    // Fill image prompt
    await page.fill('textarea[name="description"]', 
      'A beautiful sunset over mountains with a lake in the foreground');
    
    // Select aspect ratio
    await page.selectOption('select[name="aspectRatio"]', '16:9');
    
    // Continue to generation
    await page.click('button:has-text("Continue")');
    
    // Wait for image generation stage
    await page.waitForSelector('[data-stage-id="generate-image"]', { timeout: 10000 });
    
    // Click generate if not auto-running
    const generateButton = page.locator('button:has-text("Generate Image")');
    if (await generateButton.isVisible()) {
      await generateButton.click();
    }
    
    // Wait for image to appear
    await page.waitForSelector('img[alt*="Generated"]', { timeout: 30000 });
    
    // Verify image is displayed
    const image = page.locator('img[alt*="Generated"]').first();
    await expect(image).toBeVisible();
    
    // Verify download button
    const downloadButton = page.locator('button:has-text("Download")').first();
    await expect(downloadButton).toBeVisible();
    
    // Test download functionality
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      downloadButton.click()
    ]);
    
    // Verify download
    expect(download.suggestedFilename()).toMatch(/\.(png|jpg|jpeg)$/);
  });

  test('should handle AI redo for image refinement', async ({ page }) => {
    // Generate initial image
    await page.fill('textarea[name="description"]', 'A simple red cube');
    await page.click('button:has-text("Continue")');
    
    // Wait for image
    await page.waitForSelector('img[alt*="Generated"]', { timeout: 30000 });
    
    // Click AI Redo
    await page.click('button:has-text("AI Redo")');
    
    // Add refinement instructions
    await page.fill('textarea[placeholder*="What would you like to change"]', 
      'Make the cube blue and add shadows');
    
    // Submit refinement
    await page.click('button:has-text("Regenerate")');
    
    // Wait for new image
    await page.waitForSelector('img[alt*="Generated"]', { timeout: 30000 });
    
    // Verify new image is different (check src attribute changed)
    const imageSrc = await page.locator('img[alt*="Generated"]').first().getAttribute('src');
    expect(imageSrc).toBeTruthy();
  });

  test('should persist images across page reload', async ({ page }) => {
    // Generate image
    await page.fill('textarea[name="description"]', 'A green tree');
    await page.click('button:has-text("Continue")');
    await page.waitForSelector('img[alt*="Generated"]', { timeout: 30000 });
    
    // Get image URL
    const imageUrl = await page.locator('img[alt*="Generated"]').first().getAttribute('src');
    expect(imageUrl).toContain('storage.googleapis.com');
    
    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Verify image still visible with same URL
    const reloadedImageUrl = await page.locator('img[alt*="Generated"]').first().getAttribute('src');
    expect(reloadedImageUrl).toBe(imageUrl);
  });

  test('should use image in subsequent HTML stage', async ({ page }) => {
    // Generate image
    await page.fill('textarea[name="description"]', 'A company logo');
    await page.click('button:has-text("Continue")');
    await page.waitForSelector('img[alt*="Generated"]', { timeout: 30000 });
    
    // Continue to HTML generation stage
    await page.click('button:has-text("Continue to HTML")');
    
    // Wait for HTML preview
    await page.waitForSelector('[data-testid="html-preview"]', { timeout: 10000 });
    
    // Verify image is included in HTML
    const htmlContent = await page.locator('[data-testid="html-preview"]').innerHTML();
    expect(htmlContent).toContain('<img');
    expect(htmlContent).toContain('storage.googleapis.com');
  });

  test('should handle multiple aspect ratios', async ({ page }) => {
    const aspectRatios = ['1:1', '16:9', '9:16', '4:3', '3:4'];
    
    for (const ratio of aspectRatios) {
      await page.fill('textarea[name="description"]', `Test image for ${ratio}`);
      await page.selectOption('select[name="aspectRatio"]', ratio);
      await page.click('button:has-text("Continue")');
      
      await page.waitForSelector('img[alt*="Generated"]', { timeout: 30000 });
      
      // Verify aspect ratio in image data
      const imageData = await page.locator('[data-aspect-ratio]').getAttribute('data-aspect-ratio');
      expect(imageData).toBe(ratio);
      
      // Go back for next test
      await page.click('button:has-text("Back")');
    }
  });

  test('should display error for invalid prompts', async ({ page }) => {
    // Try empty prompt
    await page.fill('textarea[name="description"]', '');
    await page.click('button:has-text("Continue")');
    
    // Should show validation error
    await expect(page.locator('text=required')).toBeVisible();
    
    // Try very short prompt
    await page.fill('textarea[name="description"]', 'abc');
    await page.click('button:has-text("Continue")');
    
    // Should show minimum length error
    await expect(page.locator('text=minimum')).toBeVisible();
  });
});
```