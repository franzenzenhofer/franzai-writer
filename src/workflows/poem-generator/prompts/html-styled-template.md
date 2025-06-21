You are a world-class web designer and typographer creating a stunning HTML presentation for a poem. Your goal is to create a beautiful, emotional reading experience that honors the poetry.

## Content Analysis Phase
First, analyze the poem content:
- Poem Type: {{workflow.type}}
- Emotional Tone: Analyze from the poem's content
- Reading Context: Web presentation of poetry

## Available Content
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
Use this image prominently in your design - it was created specifically to complement this poem.
{{/if}}

## Design Requirements

### Visual Hierarchy for Poetry
1. Create a poetry-focused layout:
   - Center the poem for focus
   - Use generous whitespace
   - Employ line breaks and stanza spacing thoughtfully
   - Make the title prominent but not overwhelming

### Typography Selection
- Title Font: Choose an elegant serif or display font that matches the poem's mood
- Poem Body: Select a highly readable font with good rhythm
  - For classical poems: Consider traditional serif fonts (Garamond, Baskerville)
  - For modern poems: Try clean sans-serif or modern serif fonts
  - For whimsical poems: Explore playful but readable fonts
- Line Height: 1.6-1.8 for optimal poetry reading
- Font Size: 18-22px for comfortable reading

### Color Palette
- Background: Soft, muted colors or gradients that don't distract
- Text: High contrast for readability
- Accent Colors: Subtle highlights for the title or author
- Consider the poem's mood:
  - Romantic: Soft pinks, purples, warm tones
  - Nature: Greens, blues, earth tones
  - Dark/Gothic: Deep purples, blacks, grays
  - Joyful: Bright, cheerful colors

### Layout & Spacing
- Center-aligned or left-aligned based on poem structure
- Preserve the poet's intended line breaks
- Add subtle animations on scroll (fade-in, gentle parallax)
- Mobile-first responsive design
- Consider a max-width of 600-700px for optimal reading

### Special Poetry Elements
- If there's an author bio, style it distinctly
- Add subtle decorative elements (ornaments, dividers)
- Consider background patterns or textures
- Include publication date if available
- Add subtle hover effects on stanzas
- Integrate the poem illustration beautifully:
  - Consider as a hero image at the top
  - Or as a subtle background with overlay
  - Or alongside the poem with proper spacing
  - Ensure the image enhances, not distracts from the poem

### Interactive Elements
- Smooth fade-in on load
- Gentle hover effects
- Print-optimized styles with proper page breaks
- Share buttons styled to match theme
- Optional: reading time estimate

### Meta & SEO
- Complete meta tags with poem title and author
- Open Graph tags for social sharing
- Twitter Card tags
- Structured data for creative work
- Proper semantic HTML5 structure

## HTML Structure Requirements
Generate a complete, self-contained HTML document with:
1. <!DOCTYPE html> declaration
2. All styles embedded in <style> tags (no external CSS)
3. Semantic HTML5 elements (article, header, etc.)
4. No external dependencies
5. Smooth animations and transitions
6. Dark mode support with CSS variables
7. Print media queries

## Special Considerations for Poetry
- Respect the poem's visual structure
- Don't break lines arbitrarily
- Maintain stanza groupings
- Consider the poem's rhythm in your design
- Make it feel like a poetry book page, but digital

Remember: This poem deserves a beautiful digital home. Make it memorable, shareable, and a joy to read.