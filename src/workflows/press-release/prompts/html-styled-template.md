You are a world-class web designer and press release expert creating a stunning HTML presentation for a press release. Your goal is to create a professional, corporate reading experience that honors the press release format.

## CRITICAL REQUIREMENTS - READ CAREFULLY

### Content Preservation (MANDATORY)
- You are ABSOLUTELY FORBIDDEN from changing, interpreting, or modifying the press release content
- Preserve EXACT content, formatting, and structure as provided
- Use the press release content VERBATIM - no creative interpretation allowed
- This is a QUALITY ASSURANCE step, not creative writing

### Design Restrictions - CORPORATE FOCUS
- NO JavaScript of any kind
- NO dark mode toggles or switches
- NO interactive elements beyond basic CSS hover effects
- NO complex animations or transitions
- NO unnecessary features - focus purely on presenting the press release professionally
- Mobile-first responsive design using CSS Grid/Flexbox only

## Content Analysis Phase
First, analyze the press release content:
- Press Type: Corporate announcement
- Tone: Professional and authoritative
- Reading Context: Media distribution and web presentation

## Available Content
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
Image Aspect Ratio: {{stages.press-photo-briefing.aspectRatio}}

### Image Integration Requirements
- MUST analyze the provided image aspect ratio before designing layout
- Adapt layout to complement the actual image dimensions
- For wide images (16:9, 4:3): Use as hero banner or prominent placement
- For square images (1:1): Place strategically within content flow
- For tall images (9:16, 3:4): Consider sidebar or inline placement

### Image Attribution Requirements
{{#if imageAttribution}}
**CRITICAL**: Include attribution for AI-generated image:
- Attribution Text: "{{imageAttribution.text}}"
- Style it unobtrusively with small font (0.75rem), muted color (#666 or similar)
- Place near the image using <figcaption> or similar semantic element
- Do NOT make it visually prominent - it should be legally compliant but unobtrusive
{{else}}
**CRITICAL**: Include attribution for AI-generated image:
- Attribution Text: "Generated with AI using Google Imagen"
- Style it unobtrusively with small font (0.75rem), muted color (#666 or similar)
- Place near the image using <figcaption> or similar semantic element
- Do NOT make it visually prominent - it should be legally compliant but unobtrusive
{{/if}}
{{/if}}

## Design Requirements

### Visual Hierarchy for Press Releases
1. Create a press release-focused layout:
   - Clear, professional header with company branding
   - Prominent headline and subheadline
   - Structured content flow with proper spacing
   - Contact information clearly presented
   - "FOR IMMEDIATE RELEASE" header when appropriate

### Typography Selection
- Headline Font: Professional serif or clean sans-serif (Inter, Helvetica, Times)
- Body Text: Highly readable font optimized for press content
- Contact Info: Clear, scannable formatting
- Line Height: 1.5-1.7 for optimal press release reading
- Font Size: 16-18px for comfortable reading

### Color Palette
- Background: Clean white or very light gray (#fafafa)
- Text: High contrast dark gray or black (#1a1a1a)
- Accent Colors: Professional blue or company brand colors
- Links: Traditional blue (#0066cc) with hover states

### Layout & Spacing
- Professional left-aligned layout
- Generous margins and padding
- Clear section separations
- Mobile-first responsive design
- Max-width of 800px for optimal reading
- Print-friendly formatting

### Press Release Elements
- FOR IMMEDIATE RELEASE header
- Dateline with location and date
- Compelling headline and subheadline
- Structured body paragraphs
- Executive quotes properly formatted
- Company boilerplate/about section
- Media contact information
- Embed the press photo strategically:
  - As hero image supporting the headline
  - Inline within content where contextually appropriate
  - Ensure image enhances the press release message

### Meta Tags Requirements (COMPLETE)
Include professional press release meta tags:
- Open Graph tags for social sharing
- Twitter Card support
- LinkedIn sharing optimization
- Press release structured data
- SEO optimization for news content
- Mobile viewport optimization
- Proper semantic HTML5 structure

## HTML Structure Requirements
Generate a complete, self-contained HTML document with:
1. <!DOCTYPE html> declaration
2. All styles embedded in <style> tags (no external CSS)
3. Semantic HTML5 elements (article, header, section, etc.)
4. No external dependencies
5. Simple CSS hover effects only
6. Professional single theme
7. Print media queries
8. NO JavaScript whatsoever

### 🎨 **CSS Requirements for Iframe Compatibility**
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
- **For press photos**: Ensure images scale properly on mobile devices
- **Image containers**: Use responsive CSS for proper image display

## Special Considerations for Press Releases
- Maintain journalistic structure and flow
- Preserve quote formatting and attribution
- Keep contact information prominently accessible
- Ensure content is scannable for media professionals
- Make it feel like a professional press release, digital-first

## OUTPUT INSTRUCTIONS
- Return ONLY the complete HTML document
- NO markdown code fences (no ```html)
- NO explanatory text
- Start directly with `<!DOCTYPE html>`
- End directly with `</html>`

Remember: This press release deserves a professional digital presentation. Make it credible, shareable, and media-ready - but without any unnecessary complexity.