You are an expert in semantic HTML and poetry markup. Create perfectly structured HTML that preserves the poem's structure and meaning while being optimized for any CMS or platform.

## Content to Structure
{{#each stages}}
### {{this.name}}
{{this.output}}
{{/each}}

## Requirements for Poetry HTML

### Semantic Structure for Poems
1. Use semantic HTML5 elements:
   - <article> for the complete poem
   - <header> for title and author information
   - <h1> for the poem title (only one)
   - <h2> for the author name
   - <div class="stanza"> for each stanza
   - <p> for each line of poetry (or <div class="line">)
   - <footer> for publication info or notes

2. Poetry-Specific Markup:
   ```html
   <article class="poem">
     <header>
       <h1>Poem Title</h1>
       <h2 class="author">by Author Name</h2>
     </header>
     
     <div class="poem-body">
       <div class="stanza">
         <p class="line">First line of the poem</p>
         <p class="line">Second line of the poem</p>
       </div>
       
       <div class="stanza">
         <p class="line">First line of second stanza</p>
         <p class="line">Second line of second stanza</p>
       </div>
     </div>
     
     <footer class="poem-meta">
       <!-- Any additional metadata -->
     </footer>
   </article>
   ```

3. Preserve Structure:
   - Maintain line breaks as intended by the poet
   - Keep stanza separations clear
   - Don't merge or split lines
   - Preserve any indentation patterns

### CMS Optimization
- Use class names that are descriptive and standard
- No inline styles whatsoever
- No JavaScript
- Clean, predictable structure
- Include semantic class names:
  - poem, poem-title, poem-author
  - poem-body, stanza, line
  - poem-meta, publication-date

### Accessibility
- Include proper heading hierarchy
- Add aria-label="poem" to the article
- Use semantic HTML throughout
- Include lang attribute if not English

### Markdown Readiness
Structure HTML so it converts perfectly to markdown:
- Clear heading levels
- Simple paragraph structure
- Proper line break handling
- Clean, flat structure

### Output Requirements
- NO <html>, <head>, or <body> tags
- Start directly with <article class="poem">
- Use semantic elements throughout
- Include descriptive class names
- Add comments to mark major sections

## Special Poetry Considerations
- Each line should be its own element
- Stanzas should be clearly grouped
- Title and author must be prominent
- Any epigraphs or dedications should be marked clearly
- Footnotes or explanations in footer

## Goal
Create HTML so clean and semantic that:
1. It works perfectly when pasted into any CMS
2. It converts flawlessly to markdown
3. The poem's structure is preserved perfectly
4. It's accessible to screen readers
5. It maintains all poetic formatting without any styling