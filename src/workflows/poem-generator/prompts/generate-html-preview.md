Hello, how are you? Hope you are doing good! You are a world-class mobile-first web designer creating a minimal, beautiful HTML document for a poem with an embedded image.


{{#if html-briefing.output}}
Your goal is to make the client happy, the client had this special requirement:

HTML Briefing:
{{html-briefing.output}}

Think hard about how to make a beautiful desing but still fulfill this requirment 100%.

{{/if}}

## Content to Format
**Poem Title**: {{generate-poem-with-title.output.title}}
**Poem Content**:
{{generate-poem-with-title.output.poem}}

**Image Details**:
- Image URL: {{generate-poem-image.output.images.0.publicUrl}}
- Aspect Ratio: {{image-briefing.output.aspectRatio}}
- Style: {{image-briefing.output.style}}

## Requirements

### 🎯 **CRITICAL: Complete HTML Document Structure**
This HTML will be rendered in an iframe, so you MUST create a complete HTML document:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{generate-poem-with-title.output.title}}</title>
    <style>
        /* Your CSS here */
    </style>
</head>
<body>
    <!-- Your content here -->
</body>
</html>
```

### 🎨 **CSS Requirements for Iframe**
- **Use `body` or `html` selectors**: NOT `:host` (that's for Shadow DOM)
- **Use CSS custom properties**: Define them in `:root` or `body`
- **Example CSS structure**:
```css
:root {
  --bg-color: #your-color;
  --text-color: #your-color;
  --font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
}

body {
  background-color: var(--bg-color);
  color: var(--text-color);
  font-family: var(--font-family);
  margin: 0;
  padding: 20px;
}
```

### 📱 **Responsive Image Requirements**
- **MANDATORY**: All `<img>` tags MUST include: `style="max-width: 100%; height: auto;"`
- **Example**: `<img src="image.jpg" alt="Description" style="max-width: 100%; height: auto;">`
- **This ensures images are responsive and never overflow their containers**

### 🎨 **Design Requirements**
- Create a beautiful, minimal design
- Use the image aspect ratio: {{image-briefing.output.aspectRatio}}
- Consider the image style: {{image-briefing.output.style}}
- Make it mobile-first and responsive
- Use system fonts only (no external fonts)
- Implement responsive image with proper sizing
- Make the design complement the poem's mood and theme

### 🔧 **Technical Requirements**
- **Complete HTML document**: DOCTYPE, html, head, body tags
- **Embedded styles**: All CSS in `<style>` tags in `<head>`
- **No external dependencies**: No CDNs, external fonts, or stylesheets
- **Self-contained**: Everything needed must be in the HTML
- **Responsive**: Works on all screen sizes
- **Clean code**: Well-structured HTML and CSS

### 📝 **Content Guidelines**
- Include the poem title prominently
- Display the full poem text
- Integrate the provided image meaningfully
- Create visual hierarchy and flow
- Ensure readability and accessibility

## Output Format
Return only the complete HTML document, nothing else. No explanations, no code blocks, just the raw HTML starting with `<!DOCTYPE html>`. 