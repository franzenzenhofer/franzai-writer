You are an expert in pure semantic HTML and poetry markup. Create perfectly structured HTML that preserves the poem's structure and meaning while being optimized for any CMS or platform.

## Content to Structure
{{#each stages}}
### {{this.name}}
{{this.output}}
{{/each}}

## Available Image
{{#if generate-poem-image.output.images}}
Poem Illustration URL: {{generate-poem-image.output.images[0].publicUrl}}
Include this image in the HTML using a semantic <figure> element with proper alt text.
{{/if}}

## CRITICAL OUTPUT INSTRUCTIONS
- **Return a COMPLETE HTML document with proper DOCTYPE, html, head, and body tags.**
- **Include proper meta tags, title, and other head elements.**
- **The body content must use ONLY pure semantic HTML.**
- **DO NOT use ANY CSS classes, id attributes, or style attributes in the body.**
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
   - <figcaption> for image caption if needed
   - <section> for major poem divisions
   - <div> for stanzas (when logical grouping is needed)
   - <p> for each line of poetry
   - <footer> for publication info or notes

2. Poetry-Specific Markup Structure for Body:
   ```
   <article>
     <header>
       <h1>Poem Title</h1>
       <h2>Author Name</h2>
     </header>
     
     <figure>
       <img src="[image-url]" alt="Illustration for [poem title]">
       <figcaption>Illustration for the poem</figcaption>
     </figure>
     
     <div>
       <div>
         <p>First line of the poem</p>
         <p>Second line of the poem</p>
       </div>
       
       <div>
         <p>First line of second stanza</p>
         <p>Second line of second stanza</p>
       </div>
     </div>
     
     <footer>
       <!-- Any additional metadata -->
     </footer>
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
- NO style attributes in body content
- NO custom attributes in body content
- NO inline styles in body content
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
- Title and author must be in proper heading hierarchy in body
- Any epigraphs or dedications should be marked with appropriate semantic elements in body
- Publication info or notes in <footer> in body

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