You are an expert in pure semantic HTML and poetry markup. Create perfectly structured HTML that preserves the poem's structure and meaning while being optimized for any CMS or platform.

## Content to Structure
### Poem Topic
{{stages.poem-topic}}

### Generate Poem & Title
Title: {{stages.generate-poem-with-title.title}}
Poem: {{stages.generate-poem-with-title.poem}}

### Image Customization
{{stages.image-briefing}}

### Create Image Prompt
{{stages.create-image-prompt}}

### Generate Poem Illustration
{{stages.generate-poem-image}}

### Generate HTML Preview
{{stages.generate-html-preview}}

## Available Image
{{#if stages.generate-poem-image.images}}
Poem Illustration URL: {{stages.generate-poem-image.images.[0].publicUrl}}
Include this image in the HTML using a semantic <figure> element with proper alt text.

### Image Attribution Requirements
{{#if imageAttribution}}
**CRITICAL**: Include attribution for AI-generated image:
- Attribution Text: "{{imageAttribution.text}}"
- Place in a simple <figcaption> element after the <img> tag
- Use plain text only - no styling attributes
{{else}}
**CRITICAL**: Include attribution for AI-generated image:
- Attribution Text: "Generated with AI using Google Imagen"
- Place in a simple <figcaption> element after the <img> tag  
- Use plain text only - no styling attributes
{{/if}}
{{/if}}

## CRITICAL: WHAT NOT TO INCLUDE
- **NO author information** unless explicitly provided in the content
- **NO publication dates or metadata** unless explicitly provided
- **NO "Illustration for the poem" or similar generic text**
- **NO footer elements** unless there's actual footer content
- **NO explanatory text about the image** (except required attribution)
- **NO extra descriptive text** - only include the poem title, image, and poem content

## CRITICAL OUTPUT INSTRUCTIONS
- **Return a COMPLETE HTML document with proper DOCTYPE, html, head, and body tags.**
- **Include proper meta tags, title, and other head elements.**
- **The body content must use ONLY pure semantic HTML.**
- **DO NOT use ANY CSS classes, id attributes, or style attributes in the body.**
- **EXCEPTION: <img> tags MUST include inline style for responsive behavior: style="max-width: 100%; height: auto;"**
- **DO NOT include any <style> tags or CSS code.**
- **DO NOT include any <script> tags or JavaScript.**
- **DO NOT wrap the output in code fences (e.g., ```html).**
- **Start the body content with <article> as the main wrapper.**

## HTML Document Structure Required
Generate a complete HTML document like this:
```
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
    [Pure semantic HTML content here]
  </article>
</body>
</html>
```

## Requirements for Poetry HTML

### Pure Semantic Structure for Poems (Body Content Only)
1. Use only semantic HTML5 elements in the body:
   - <article> for the complete poem (main wrapper)
   - <header> for title and author information
   - <h1> for the poem title (only one)
   - <h2> for the author name or subtitle
   - <figure> for the poem illustration (if available)
   - <img> for the actual image with proper alt text
   - <figcaption> for required AI image attribution only
   - <section> for major poem divisions
   - <div> for stanzas (when logical grouping is needed)
   - <p> for each line of poetry
   - <footer> for publication info or notes

2. Poetry-Specific Markup Structure for Body:
   ```
   <article>
     <header>
       <h1>[Poem Title]</h1>
     </header>
     
     <figure>
       <img src="[image-url]" alt="[Descriptive alt text based on the poem's visual theme]" style="max-width: 100%; height: auto;">
       <figcaption>Generated with AI using Google Imagen</figcaption>
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

3. Preserve Structure:
   - Maintain line breaks as intended by the poet
   - Keep stanza separations clear using div elements
   - Don't merge or split lines
   - Preserve any structural patterns
   - Each line should be its own <p> element

### Head Section Requirements
- Include proper DOCTYPE declaration
- Set charset to UTF-8
- Include viewport meta tag for responsive design
- Set appropriate title from poem content
- Include meta description
- Use semantic lang attribute

### Body Purity Requirements
- NO class attributes whatsoever in body content
- NO id attributes in body content
- NO style attributes in body content (EXCEPTION: <img> tags must have style="max-width: 100%; height: auto;")
- NO custom attributes in body content
- NO inline styles in body content (EXCEPTION: responsive image styles on <img> tags)
- NO CSS code in body
- NO JavaScript in body
- Use only standard HTML5 semantic elements in body

### Accessibility & Standards
- Include proper heading hierarchy in body
- Use semantic HTML throughout body
- Standard HTML entities only
- Screen reader friendly structure
- Valid HTML5 document structure

### Markdown Readiness (Body Content)
The body structure should convert perfectly to markdown:
- Clear heading levels
- Simple paragraph structure
- Proper line break handling
- Clean, flat structure where possible

### Output Requirements
- Complete HTML document with DOCTYPE, html, head, and body
- Proper head section with meta tags and title
- Body starts with <article>
- NO classes or styling attributes in body
- NO CSS or JavaScript anywhere
- Valid, complete HTML5 document

## Special Poetry Considerations
- Each line should be its own <p> element in body
- Stanzas should be grouped with <div> elements in body
- Title must be in H1 in body
- **CONTENT FOCUS - ONLY INCLUDE**:
  1. **Poem Title** - as H1 heading
  2. **Poem Image** - single img tag in figure element, NO caption
  3. **Poem Content** - properly structured verse lines
  4. **NOTHING ELSE** - no metadata, no author bio, no image descriptions

## Goal
Create a complete HTML document where:
1. The full document works perfectly as a standalone HTML file
2. The body content works perfectly when pasted into any CMS
3. The body converts flawlessly to markdown
4. The poem's structure is preserved perfectly
5. It's accessible to screen readers
6. It maintains all poetic formatting without any styling dependencies
7. No cleanup is needed before use in any system

Generate the complete HTML document now. Return ONLY the HTML document, no markdown, no code fences.