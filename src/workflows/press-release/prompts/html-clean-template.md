You are an expert in pure semantic HTML and press release markup. Create perfectly structured HTML that preserves the press release's structure and meaning while being optimized for any CMS or platform.

## Content to Structure
### Basic Information
Company: {{stages.basic-info.company}}
Topic: {{stages.basic-info.topic}}
Message: {{stages.basic-info.message}}
Website: {{stages.basic-info.website}}
Location: {{stages.basic-info.location}}

### Tone & Style Analysis
{{stages.tone-analysis}}

### Company & Industry Research
{{stages.company-research}}

### Generate Headline & Key Facts
{{stages.generate-headline}}

### Generate Contact Information
{{stages.generate-contacts}}

### Fact-Check & Verification
{{stages.fact-check}}

### Final Press Release
{{stages.final-press-release}}

## Available Image
{{#if stages.generate-press-photo.images}}
Press Photo URL: {{stages.generate-press-photo.images.[0].publicUrl}}
Include this image in the HTML using a semantic <figure> element with proper alt text relevant to the press release.

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
- **NO additional commentary** unless explicitly provided in the content
- **NO extra metadata** unless explicitly provided
- **NO generic explanatory text** about the image (except required attribution)
- **NO footer elements** unless there's actual footer content
- **NO extra descriptive text** - only include the press release content and image

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
  <title>[Press Release Headline]</title>
  <meta name="description" content="[Brief description]">
</head>
<body>
  <article>
    [Pure semantic HTML content here]
  </article>
</body>
</html>
```

## Requirements for Press Release HTML

### Pure Semantic Structure for Press Releases (Body Content Only)
1. Use only semantic HTML5 elements in the body:
   - <article> for the complete press release (main wrapper)
   - <header> for press release header information
   - <h1> for the main headline (only one)
   - <h2> for subheadlines or section headers
   - <figure> for the press photo (if available)
   - <img> for the actual image with proper alt text
   - <figcaption> for required AI image attribution only
   - <section> for major press release sections
   - <div> for content groupings when needed
   - <p> for body paragraphs
   - <blockquote> for executive quotes
   - <footer> for contact information or company boilerplate

2. Press Release-Specific Markup Structure for Body:
   ```
   <article>
     <header>
       <p>FOR IMMEDIATE RELEASE</p>
       <h1>[Press Release Headline]</h1>
       <p>[Dateline and location]</p>
     </header>
     
     <figure>
       <img src="[image-url]" alt="[Descriptive alt text based on the press announcement]" style="max-width: 100%; height: auto;">
       <figcaption>Generated with AI using Google Imagen</figcaption>
     </figure>
     
     <section>
       <p>[Opening paragraph]</p>
       <p>[Body paragraphs]</p>
       
       <blockquote>
         <p>"[Executive quote]"</p>
         <footer>— [Name, Title]</footer>
       </blockquote>
       
       <p>[Additional paragraphs]</p>
     </section>
     
     <section>
       <h2>About [Company Name]</h2>
       <p>[Company boilerplate]</p>
     </section>
     
     <footer>
       <h3>Media Contact</h3>
       <p>[Contact Name]</p>
       <p>[Contact Title]</p>
       <p>[Contact Email]</p>
       <p>[Contact Phone]</p>
     </footer>
   </article>
   ```

3. Preserve Structure:
   - Maintain press release flow and hierarchy
   - Keep quote formatting clear and attributed
   - Preserve paragraph breaks and structure
   - Ensure contact information is easily accessible

### Head Section Requirements
- Include proper DOCTYPE declaration
- Set charset to UTF-8
- Include viewport meta tag for responsive design
- Set appropriate title from press release headline
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
- Proper quote formatting
- Clean, flat structure where possible

### Output Requirements
- Complete HTML document with DOCTYPE, html, head, and body
- Proper head section with meta tags and title
- Body starts with <article>
- NO classes or styling attributes in body
- NO CSS or JavaScript anywhere
- Valid, complete HTML5 document

## Special Press Release Considerations
- Each paragraph should be its own <p> element in body
- Quotes should use <blockquote> with proper attribution
- Headlines must be in H1 in body
- **CONTENT FOCUS - ONLY INCLUDE**:
  1. **Press Release Header** - FOR IMMEDIATE RELEASE, headline, dateline
  2. **Press Photo** - single img tag in figure element with attribution
  3. **Press Release Content** - properly structured paragraphs and quotes
  4. **Company Information** - about section and contact details
  5. **NOTHING ELSE** - no extra metadata, no image descriptions beyond attribution

## Goal
Create a complete HTML document where:
1. The full document works perfectly as a standalone HTML file
2. The body content works perfectly when pasted into any CMS
3. The body converts flawlessly to markdown
4. The press release structure is preserved perfectly
5. It's accessible to screen readers
6. It maintains all press release formatting without any styling dependencies
7. No cleanup is needed before use in any system

Generate the complete HTML document now. Return ONLY the HTML document, no markdown, no code fences.