# Ticket #116: Fix DOCX Export Image Aspect Ratio Issue

## Priority: High

## Type: Bug Fix / Export Enhancement

## Description
**BUG**: Word document exports embed images with incorrect aspect ratios due to hardcoded dimensions (`width: 600, height: 400`) instead of using the actual image aspect ratio from the generated image data.

## Current Problem

### Root Cause
**File**: `src/lib/export/format-converters.ts` (lines 220-225)

```typescript
new ImageRun({
  type: 'png',
  data: Buffer.from(arrayBuffer),
  transformation: { width: 600, height: 400 }  // ❌ HARDCODED DIMENSIONS!
} as any),
```

### Impact
- **Portrait images (3:4)** → Stretched to 600x400 (wrong ratio)
- **Square images (1:1)** → Stretched to 600x400 (wrong ratio)  
- **Landscape images (16:9)** → Compressed to 600x400 (wrong ratio)
- **All aspect ratios are distorted** in Word documents

## Current Logic Analysis

### How Aspect Ratio Flows Through System
1. **User selects aspect ratio** in `image-briefing` stage → `{{image-briefing.output.aspectRatio}}`
2. **Image generation** uses correct aspect ratio → Images generated with proper dimensions
3. **HTML exports** work correctly → Use CSS `aspect-ratio` property
4. **DOCX export FAILS** → Ignores aspect ratio, uses hardcoded 600x400

### Available Data Sources
The DOCX generator has access to:
- ✅ **Image URL** from HTML `<img src="...">`
- ✅ **Image binary data** (fetched successfully)
- ❌ **Aspect ratio metadata** (not extracted from HTML)
- ❌ **Original dimensions** (not calculated from image data)

## Required Fixes

### 1. Extract Aspect Ratio from HTML
**File**: `src/lib/export/format-converters.ts`

**Current regex**:
```typescript
const imgMatch = /<img[^>]+src="([^"]+)"[^>]*alt="?([^">]*)"?[^>]*>/i.exec(trimmedElement);
```

**Enhanced regex to capture aspect ratio**:
```typescript
const imgMatch = /<img[^>]+src="([^"]+)"[^>]*(?:data-aspect-ratio="([^"]*)"[^>]*)?alt="?([^">]*)"?[^>]*>/i.exec(trimmedElement);
const [, src, aspectRatio, alt] = imgMatch;
```

### 2. Calculate Proper Dimensions
**Add dimension calculation logic**:

```typescript
// Calculate dimensions from aspect ratio
const calculateDimensions = (aspectRatio: string, maxWidth: number = 600): { width: number; height: number } => {
  const [widthRatio, heightRatio] = aspectRatio.split(':').map(Number);
  const ratio = widthRatio / heightRatio;
  
  const width = maxWidth;
  const height = Math.round(width / ratio);
  
  return { width, height };
};

// Usage in image processing
if (aspectRatio) {
  const { width, height } = calculateDimensions(aspectRatio);
  transformation = { width, height };
} else {
  // Fallback: detect dimensions from image buffer
  transformation = await getImageDimensions(arrayBuffer) || { width: 600, height: 400 };
}
```

### 3. Add Image Dimension Detection Fallback
**For cases where aspect ratio is not available**:

```typescript
async function getImageDimensions(arrayBuffer: ArrayBuffer): Promise<{ width: number; height: number } | null> {
  try {
    // Use image-size library or similar to detect actual dimensions
    const sizeOf = (await import('image-size')).default;
    const buffer = Buffer.from(arrayBuffer);
    const dimensions = sizeOf(buffer);
    
    if (dimensions.width && dimensions.height) {
      // Scale to reasonable size for Word document
      const maxWidth = 600;
      const ratio = dimensions.width / dimensions.height;
      const width = Math.min(maxWidth, dimensions.width);
      const height = Math.round(width / ratio);
      
      return { width, height };
    }
  } catch (error) {
    console.warn('[DOCX] Could not detect image dimensions:', error);
  }
  
  return null;
}
```

### 4. Update HTML Generation to Include Aspect Ratio Data
**File**: `src/workflows/poem-generator/prompts/html-styled-template.md` and `html-clean-template.md`

**Ensure images include aspect ratio data attribute**:
```html
<img src="{{generate-poem-image.output.images.0.publicUrl}}" 
     alt="Generated illustration for the poem" 
     data-aspect-ratio="{{image-briefing.output.aspectRatio}}"
     style="aspect-ratio: {{image-briefing.output.aspectRatio}}; object-fit: cover;">
```

## Implementation Plan

### Phase 1: HTML Template Updates
1. Update poem generator HTML templates to include `data-aspect-ratio` attribute
2. Ensure aspect ratio flows from `image-briefing` stage to HTML generation
3. Test HTML exports still work correctly

### Phase 2: DOCX Converter Enhancement  
1. Update regex to capture aspect ratio from HTML
2. Add dimension calculation logic
3. Add image dimension detection fallback
4. Update ImageRun transformation logic

### Phase 3: Testing & Validation
1. Test all aspect ratios (1:1, 3:4, 4:3, 16:9, 9:16)
2. Verify Word documents show correct image proportions
3. Test fallback behavior when aspect ratio is missing
4. Ensure no regression in other export formats

## Aspect Ratio Test Cases

### Test Matrix
| Aspect Ratio | Expected Word Dimensions | Current (Wrong) | Status |
|--------------|-------------------------|-----------------|--------|
| **1:1** (Square) | 600x600 | 600x400 | ❌ Broken |
| **3:4** (Portrait) | 450x600 | 600x400 | ❌ Broken |
| **4:3** (Landscape) | 600x450 | 600x400 | ❌ Broken |
| **16:9** (Widescreen) | 600x338 | 600x400 | ❌ Broken |
| **9:16** (Mobile) | 338x600 | 600x400 | ❌ Broken |

### Calculation Examples
```typescript
// 1:1 → 600x600
// 3:4 → 450x600 (or 600x800 if height-constrained)
// 4:3 → 600x450  
// 16:9 → 600x338
// 9:16 → 338x600
```

## Dependencies

### NPM Packages
```json
{
  "image-size": "^1.0.2"  // For image dimension detection
}
```

### Workflow Dependencies
- `image-briefing` stage must complete before export
- `generate-poem-image` stage must complete before export
- HTML generation must include aspect ratio data

## Files to Modify

### Core Implementation
1. **`src/lib/export/format-converters.ts`**
   - Update `htmlToDocx()` function
   - Add aspect ratio extraction logic
   - Add dimension calculation
   - Add image dimension detection fallback

### Template Updates  
2. **`src/workflows/poem-generator/prompts/html-styled-template.md`**
   - Add `data-aspect-ratio` attribute to image tag
   
3. **`src/workflows/poem-generator/prompts/html-clean-template.md`**
   - Add `data-aspect-ratio` attribute to image tag

### Testing
4. **`tests/e2e/export-copy-download.spec.ts`**
   - Add aspect ratio validation tests
   - Test all supported aspect ratios

5. **`package.json`**
   - Add `image-size` dependency

## Acceptance Criteria

### Core Requirements
- [ ] DOCX exports preserve original image aspect ratios
- [ ] All supported aspect ratios (1:1, 3:4, 4:3, 16:9, 9:16) work correctly
- [ ] Images are not stretched or distorted in Word documents
- [ ] Fallback behavior works when aspect ratio is unavailable

### Quality Requirements  
- [ ] Images maintain reasonable size in Word documents (max 600px width)
- [ ] No regression in HTML, PDF, or Markdown exports
- [ ] Performance impact is minimal
- [ ] Error handling for corrupted/invalid images

### Testing Requirements
- [ ] E2E tests for all aspect ratios
- [ ] Manual verification in Microsoft Word
- [ ] Cross-platform compatibility (Word Online, desktop)
- [ ] Large image handling (memory efficiency)

## Risk Assessment: Medium

### Benefits
- **Correct image display** in Word documents
- **Professional export quality** for all formats
- **User satisfaction** with export functionality
- **Consistent behavior** across all export formats

### Risks
- **Image processing complexity** - dimension detection might fail
- **Memory usage** - loading large images for dimension detection
- **Compatibility** - different Word versions might handle dimensions differently
- **Performance** - additional processing time for each image

### Mitigation
- Comprehensive fallback logic
- Image size limits and validation
- Extensive testing across Word versions
- Performance monitoring and optimization

## Implementation Notes

### Dimension Scaling Strategy
```typescript
// Always maintain aspect ratio, scale to fit document
const MAX_WIDTH = 600;
const MAX_HEIGHT = 800;

function scaleToFit(originalWidth: number, originalHeight: number) {
  const widthRatio = MAX_WIDTH / originalWidth;
  const heightRatio = MAX_HEIGHT / originalHeight;
  const scale = Math.min(widthRatio, heightRatio, 1); // Don't upscale
  
  return {
    width: Math.round(originalWidth * scale),
    height: Math.round(originalHeight * scale)
  };
}
```

### Error Handling Strategy
```typescript
// Graceful degradation
try {
  const dimensions = calculateFromAspectRatio(aspectRatio);
  return dimensions;
} catch (error) {
  try {
    const dimensions = await detectFromImageData(arrayBuffer);
    return dimensions;
  } catch (fallbackError) {
    console.warn('[DOCX] Using default dimensions');
    return { width: 600, height: 400 }; // Current behavior as final fallback
  }
}
``` 