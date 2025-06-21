# Ticket #115: Remove Unwanted Figcaption from Clean HTML Template

## Priority: High

## Type: Bug Fix / Template Cleanup

## Description
**BUG**: The clean HTML export is adding unwanted text like "Illustration for the poem" below the image. This is caused by the HTML clean template providing a bad example with `<figcaption>Illustration for the poem</figcaption>` that the AI is following literally.

## Current Problem
The clean HTML output should contain **ONLY**:
- ✅ The poem title (as H1)
- ✅ The image with proper alt text  
- ✅ The poem content
- ❌ **NO extra text like "Illustration for the poem"**

## Root Cause
**File**: `src/workflows/poem-generator/prompts/html-clean-template.md`
**Line**: ~78

**Problematic code in template**:
```html
<figure>
  <img src="[image-url]" alt="Illustration for [poem title]" style="max-width: 100%; height: auto;">
  <figcaption>Illustration for the poem</figcaption>  ← THIS IS THE PROBLEM!
</figure>
```

The AI is literally following this example and adding the figcaption text to every clean HTML export.

## Required Fix

### 1. Remove Figcaption from Template Example
**File**: `src/workflows/poem-generator/prompts/html-clean-template.md`

**Current problematic section** (lines ~65-85):
```html
<figure>
  <img src="[image-url]" alt="Illustration for [poem title]" style="max-width: 100%; height: auto;">
  <figcaption>Illustration for the poem</figcaption>
</figure>
```

**Should be changed to**:
```html
<figure>
  <img src="[image-url]" alt="[Descriptive alt text based on poem content]" style="max-width: 100%; height: auto;">
</figure>
```

### 2. Add Explicit Instructions
Add clear instructions in the template that **NO figcaption should be used**:

```markdown
## CRITICAL: Image Requirements
- Use semantic <figure> element for the image
- Include ONLY the <img> tag inside <figure>
- **DO NOT add <figcaption> - the image should speak for itself**
- Alt text should describe the visual content, not just say "illustration"
- NO additional text or captions around the image
```

### 3. Update Poetry-Specific Markup Structure
**Current problematic example** (lines ~65-95):
```html
<article>
  <header>
    <h1>Poem Title</h1>
    <h2>Author Name</h2>  ← Also remove author if not provided
  </header>
  
  <figure>
    <img src="[image-url]" alt="Illustration for [poem title]" style="max-width: 100%; height: auto;">
    <figcaption>Illustration for the poem</figcaption>  ← REMOVE THIS
  </figure>
  
  <div>
    <!-- poem content -->
  </div>
  
  <footer>  ← Remove footer if no metadata
    <!-- Any additional metadata -->
  </footer>
</article>
```

**Should be**:
```html
<article>
  <header>
    <h1>[Poem Title]</h1>
  </header>
  
  <figure>
    <img src="[image-url]" alt="[Descriptive alt text]" style="max-width: 100%; height: auto;">
  </figure>
  
  <div>
    <div>
      <p>[First line of the poem]</p>
      <p>[Second line of the poem]</p>
    </div>
    
    <div>
      <p>[First line of second stanza]</p>
      <p>[Second line of second stanza]</p>
    </div>
  </div>
</article>
```

### 4. Add Negative Instructions
Add explicit "DO NOT" instructions to prevent this:

```markdown
## WHAT NOT TO INCLUDE
- **NO figcaption elements** - images should not have captions
- **NO author information** unless explicitly provided in the content
- **NO publication dates or metadata** 
- **NO "Illustration for the poem" or similar generic text**
- **NO footer elements** unless there's actual footer content
- **NO explanatory text about the image**
```

## Content Focus Rules
The template should emphasize:

```markdown
## CONTENT FOCUS - ONLY INCLUDE:
1. **Poem Title** - as H1 heading
2. **Poem Image** - single img tag in figure element, NO caption
3. **Poem Content** - properly structured verse lines
4. **NOTHING ELSE** - no metadata, no author bio, no image descriptions
```

## Implementation

### Step 1: Update Template Structure
Remove all references to:
- `<figcaption>` elements
- Author information (`<h2>Author Name</h2>`)
- Footer elements (`<footer>`)
- Generic image captions

### Step 2: Update Example HTML
Provide a clean, minimal example that shows ONLY the essential elements.

### Step 3: Add Explicit Negative Instructions
Make it crystal clear what should NOT be included.

### Step 4: Update Alt Text Instructions
Change from generic "Illustration for [poem title]" to descriptive alt text based on actual image content.

## Expected Result
After this fix, clean HTML exports will contain:
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>[Poem Title]</title>
  <meta name="description" content="[Brief description]">
</head>
<body>
  <article>
    <header>
      <h1>[Poem Title]</h1>
    </header>
    
    <figure>
      <img src="[image-url]" alt="[Descriptive alt text]" style="max-width: 100%; height: auto;">
    </figure>
    
    <div>
      <div>
        <p>[Poem line 1]</p>
        <p>[Poem line 2]</p>
      </div>
      <!-- More stanzas -->
    </div>
  </article>
</body>
</html>
```

**NO MORE**: "Illustration for the poem" or any other unwanted text!

## Testing Requirements
- [ ] Test clean HTML export contains no figcaption elements
- [ ] Verify no "Illustration for the poem" text appears
- [ ] Confirm only title, image, and poem content are present
- [ ] Test with different poem lengths and image types
- [ ] Validate HTML structure remains semantic and accessible

## Acceptance Criteria
- [ ] Clean HTML template removes figcaption example
- [ ] Template includes explicit negative instructions
- [ ] Clean HTML exports contain ONLY title, image, and poem
- [ ] No unwanted descriptive text about images
- [ ] HTML structure remains valid and semantic
- [ ] No breaking changes to other export formats

---

**CRITICAL**: This is a user-facing content quality issue that makes exports look unprofessional. The clean HTML should be truly clean with no unnecessary text. 