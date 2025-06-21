# Ticket #113: Optimize HTML Preview Generation Prompt for Mobile-First Minimal Design

## Priority: High

## Type: Enhancement / Optimization

## Description
Optimize the `generate-html-preview` stage prompt to create mobile-first, minimal, beautiful HTML with no external dependencies, no JavaScript, modern CSS/HTML, super semantic code, and properly embedded images with correct aspect ratios.

## Current State Analysis

### Current Prompt Location
**File**: `src/workflows/poem-generator/workflow.json` (lines 230-260)

### Current Prompt Issues
1. **Generic styling approach** - not optimized for mobile-first design
2. **Missing aspect ratio communication** - image aspect ratio from `image-briefing` stage not passed to HTML generation
3. **Non-minimal approach** - creates verbose HTML with unnecessary elements
4. **No modern CSS Grid/Flexbox optimization** - uses older layout techniques
5. **Accessibility gaps** - missing modern semantic elements and ARIA features
6. **No dark mode support** - lacks CSS custom properties for theming

### Current Template Flow
```
poem-topic → generate-poem-with-title → image-briefing → create-image-prompt → generate-poem-image → html-briefing → generate-html-preview
```

**Current prompt template**:
```
Convert this poem into beautiful HTML with proper formatting and styling, including the generated image:

Title: {{generate-poem-with-title.output.title}}
Poem: {{generate-poem-with-title.output.poem}}
Image URL: {{generate-poem-image.output.images.0.publicUrl}}
Special instructions: {{html-briefing.output}}
```

## Required Changes

### 1. Enhanced Prompt Template
**File**: `src/workflows/poem-generator/workflow.json`

**Current prompt** (lines ~235-250) should be replaced with:

```markdown
You are a world-class mobile-first web designer creating a minimal, beautiful HTML document for a poem with an embedded image.

## Content to Format
**Poem Title**: {{generate-poem-with-title.output.title}}
**Poem Content**:
{{generate-poem-with-title.output.poem}}

**Image Details**:
- Image URL: {{generate-poem-image.output.images.0.publicUrl}}
- Aspect Ratio: {{image-briefing.output.aspectRatio}}
- Style: {{image-briefing.output.style}}

**Special Instructions**: {{html-briefing.output}}

## CRITICAL OUTPUT REQUIREMENTS

### Document Structure
1. **Complete HTML5 document** with proper DOCTYPE and semantic structure
2. **Mobile-first responsive design** - starts with mobile styles, scales up
3. **No external dependencies** - all styles inline, no CDNs, no external fonts
4. **No JavaScript** - pure HTML and CSS only
5. **Super semantic** - use proper HTML5 semantic elements throughout

### Image Requirements
**CRITICAL**: The image MUST be embedded with the correct aspect ratio:
- Use CSS aspect-ratio property: `aspect-ratio: {{image-briefing.output.aspectRatio}}`
- Implement responsive image with proper sizing
- Add proper alt text describing the poem's visual theme
- Use modern `object-fit: cover` for optimal display

### Content Focus
**ONLY include**:
- The poem title (as H1)
- The poem content (properly structured)
- The single generated image
- NO extra information, NO metadata, NO author bio, NO publication dates

### Modern CSS Requirements
1. **CSS Custom Properties** for theming and dark mode support
2. **CSS Grid or Flexbox** for layout (no floats or absolute positioning)
3. **Modern typography** using system font stack
4. **Perfect mobile experience** - touch-friendly, readable on small screens
5. **Accessibility compliant** - proper contrast ratios, focus states

### Semantic HTML Structure
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>[Poem Title]</title>
  <style>
    /* Modern CSS here */
  </style>
</head>
<body>
  <main>
    <article>
      <header>
        <h1>[Poem Title]</h1>
      </header>
      <figure>
        <img src="[Image URL]" alt="[Descriptive alt text]" style="aspect-ratio: [AspectRatio]; object-fit: cover;">
      </figure>
      <div class="poem-content">
        [Properly structured poem with semantic line breaks]
      </div>
    </article>
  </main>
</body>
</html>
```

## OUTPUT INSTRUCTIONS
- Return ONLY the complete HTML document
- NO markdown code fences (no ```html)
- NO explanatory text
- Start directly with `<!DOCTYPE html>`
- End directly with `</html>`
```

### 2. Update Workflow Dependencies
**File**: `src/workflows/poem-generator/workflow.json`

**Current dependencies**:
```json
"dependencies": ["generate-poem-with-title", "generate-poem-image"]
```

**Should include** `image-briefing` to access aspect ratio:
```json
"dependencies": ["generate-poem-with-title", "generate-poem-image", "image-briefing"]
```

### 3. Add Aspect Ratio Communication
The stage must receive the aspect ratio from the `image-briefing` stage output to properly embed the image.

**Current issue**: The prompt template doesn't access `{{image-briefing.output.aspectRatio}}`

**Solution**: Update template to include aspect ratio data

## Design Specifications

### Mobile-First CSS Framework
```css
:root {
  /* Light theme */
  --bg-primary: #ffffff;
  --text-primary: #1a1a1a;
  --text-secondary: #6b7280;
  --accent: #3b82f6;
  
  /* Dark theme */
  --bg-primary-dark: #0f0f0f;
  --text-primary-dark: #f9fafb;
  --text-secondary-dark: #9ca3af;
  --accent-dark: #60a5fa;
}

body {
  font-family: system-ui, -apple-system, sans-serif;
  line-height: 1.6;
  margin: 0;
  padding: 1rem;
  background: var(--bg-primary);
  color: var(--text-primary);
}

main {
  max-width: 42rem;
  margin: 0 auto;
}

figure img {
  width: 100%;
  height: auto;
  aspect-ratio: var(--image-aspect);
  object-fit: cover;
  border-radius: 0.5rem;
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg-primary: var(--bg-primary-dark);
    --text-primary: var(--text-primary-dark);
    --text-secondary: var(--text-secondary-dark);
    --accent: var(--accent-dark);
  }
}
```

### Semantic Poem Structure
```html
<div class="poem-content">
  <div class="stanza">
    <p class="verse">[Line 1]</p>
    <p class="verse">[Line 2]</p>
  </div>
  <div class="stanza">
    <p class="verse">[Line 3]</p>
    <p class="verse">[Line 4]</p>
  </div>
</div>
```

## Implementation Requirements

### Aspect Ratio Handling
1. **Extract aspect ratio** from `{{image-briefing.output.aspectRatio}}`
2. **Convert to CSS format**: "3:4" → `aspect-ratio: 3/4`
3. **Add CSS custom property**: `--image-aspect: 3/4`
4. **Apply to image element**: `style="aspect-ratio: var(--image-aspect)"`

### Responsive Image Implementation
```css
figure {
  margin: 2rem 0;
}

figure img {
  width: 100%;
  height: auto;
  aspect-ratio: var(--image-aspect);
  object-fit: cover;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}
```

### Typography Optimization
```css
h1 {
  font-size: clamp(1.5rem, 5vw, 2.5rem);
  font-weight: 700;
  margin: 0 0 1.5rem 0;
  text-align: center;
}

.poem-content {
  font-size: clamp(1rem, 3vw, 1.125rem);
  line-height: 1.8;
}

.stanza {
  margin-bottom: 1.5rem;
}

.verse {
  margin: 0.25rem 0;
}
```

## Testing Requirements

### Visual Testing
- [ ] Test on various aspect ratios: 1:1, 3:4, 4:3, 16:9, 9:16
- [ ] Verify mobile responsiveness on different screen sizes
- [ ] Test dark mode appearance
- [ ] Validate image aspect ratio preservation

### Technical Testing
- [ ] HTML validation (W3C validator)
- [ ] Accessibility testing (axe-core)
- [ ] Performance testing (no external resources)
- [ ] Cross-browser compatibility testing

### Content Testing
- [ ] Verify only poem title, content, and image are included
- [ ] Test with different poem lengths and structures
- [ ] Validate proper semantic markup

## Acceptance Criteria

### Core Requirements
- [ ] HTML is mobile-first and responsive
- [ ] Image displays with correct aspect ratio from `image-briefing` stage
- [ ] No external dependencies (fonts, CSS, JS)
- [ ] No JavaScript code
- [ ] Super semantic HTML5 structure
- [ ] Only includes poem title, content, and image

### Design Requirements
- [ ] Beautiful, minimal design
- [ ] Modern CSS with custom properties
- [ ] Dark mode support
- [ ] Perfect mobile experience
- [ ] Proper typography and spacing

### Technical Requirements
- [ ] Valid HTML5 document
- [ ] WCAG accessibility compliance
- [ ] Aspect ratio communicated from `image-briefing` stage
- [ ] CSS Grid or Flexbox layout
- [ ] System font stack usage

### Performance Requirements
- [ ] No external resource loading
- [ ] Optimized for fast rendering
- [ ] Minimal CSS footprint
- [ ] Efficient mobile loading

## Files to Modify

1. **`src/workflows/poem-generator/workflow.json`**
   - Update `generate-html-preview` stage prompt template
   - Add `image-briefing` to dependencies
   - Ensure aspect ratio is accessible in template

2. **Test files** (if applicable)
   - Update E2E tests to verify aspect ratio preservation
   - Add tests for mobile responsiveness

## Implementation Notes

### Aspect Ratio Conversion
```javascript
// Convert "3:4" to CSS aspect-ratio format "3/4"
const aspectRatio = "{{image-briefing.output.aspectRatio}}".replace(':', '/');
```

### CSS Custom Properties Pattern
```css
:root {
  --image-aspect: {{image-briefing.output.aspectRatio.replace(':', '/')}};
}
```

### Modern Font Stack
```css
font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

## Risk Assessment: Medium

### Benefits
- Much better mobile experience
- Proper image aspect ratio preservation
- Modern, maintainable HTML/CSS
- Improved accessibility
- No external dependencies

### Risks
- Template complexity increase
- Need to test across all aspect ratios
- Potential CSS compatibility issues
- Breaking changes to existing HTML output

### Mitigation
- Thorough testing across all aspect ratios
- Gradual rollout with fallbacks
- Comprehensive E2E test coverage
- Document CSS patterns for consistency

## Dependencies
- No new package dependencies
- Requires access to `image-briefing.output.aspectRatio` in template
- Leverages existing template variable system

## Success Metrics
- [ ] Mobile PageSpeed Insights score > 95
- [ ] Perfect aspect ratio preservation across all ratios
- [ ] Zero external dependencies
- [ ] WCAG 2.1 AA compliance
- [ ] User testing shows improved mobile experience 