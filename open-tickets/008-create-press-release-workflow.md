# Create Press Release Builder Workflow

**Created**: 2025-06-10
**Priority**: Medium
**Component**: Workflows

## Description
Create a new workflow from scratch for building professional press releases. This workflow should guide users through creating a newsworthy, properly formatted press release.

## Workflow Structure

### Stage 1: Press Release Type & Angle
- **Input**: Form with radio buttons
- **Fields**: 
  - Release Type (Product Launch, Company News, Event, Award, Partnership)
  - News Angle (Innovation, Social Impact, Financial, Industry First, Milestone)
- **Output**: JSON with selected options

### Stage 2: Company & Product Information
- **Input**: Form
- **Fields**:
  - Company Name
  - Company Description (textarea)
  - Product/Service Name
  - Website URL
  - Media Contact Name
  - Media Contact Email
  - Media Contact Phone
- **Output**: JSON with company details

### Stage 3: Key Message Development
- **Input**: Textarea
- **Prompt**: "What is the main news? What happened? Why does it matter?"
- **AI**: Helps refine into a compelling headline and lead paragraph
- **Output**: Structured key messages

### Stage 4: Supporting Facts & Quotes
- **Input**: Form
- **Fields**:
  - Key Statistics (textarea)
  - Customer Benefits (textarea)
  - Executive Quote Person & Title
  - Executive Quote Content
  - Customer/Partner Quote (optional)
- **Output**: JSON with supporting content

### Stage 5: Press Release Headline
- **Input**: Context from previous stages
- **AI**: Generates 3-5 compelling headline options
- **Output**: Selected headline

### Stage 6: Lead Paragraph
- **Input**: Context
- **AI**: Writes the crucial first paragraph answering Who, What, When, Where, Why
- **Output**: Lead paragraph text

### Stage 7: Body Content
- **Input**: Context
- **AI**: Expands on the news with supporting details, quotes, and context
- **Output**: 2-3 body paragraphs

### Stage 8: Boilerplate & Call to Action
- **Input**: Form + Context
- **Fields**:
  - Company Boilerplate (textarea)
  - Call to Action
  - Additional Resources/Links
- **Output**: Final section content

### Stage 9: Final Press Release
- **Input**: All previous stages
- **AI**: Compiles and formats the complete press release
- **Output**: Formatted press release

### Stage 10: Distribution Checklist
- **Input**: Form (checkboxes)
- **Fields**:
  - Email subject line
  - Target media list created
  - Embargo date (if applicable)
  - Supporting materials ready
  - Social media posts drafted
- **Output**: Distribution readiness checklist

## File Structure
```
src/workflows/press-release-builder/
├── workflow.json
└── prompts/
    ├── key-message-development.md
    ├── headline-generation.md
    ├── lead-paragraph.md
    ├── body-content.md
    └── final-compilation.md
```

## Prompt Templates Examples

### headline-generation.md
```markdown
Generate 5 compelling press release headlines based on:
- Type: {{pressReleaseType}}
- Angle: {{newsAngle}}
- Key Message: {{keyMessage}}
- Company: {{companyName}}

Requirements:
- Under 100 characters
- Active voice
- Newsworthy angle
- Include company name
- Avoid jargon
```

### lead-paragraph.md
```markdown
Write a compelling lead paragraph for a press release with:
- Headline: {{selectedHeadline}}
- Key Message: {{keyMessage}}
- Company Info: {{companyInfo}}

Requirements:
- Answer Who, What, When, Where, Why
- 2-3 sentences maximum
- Include location and date
- Most important info first
- Engaging and newsworthy tone
```

## Acceptance Criteria
- [ ] workflow.json created with all 10 stages
- [ ] All prompt templates written
- [ ] Workflow appears in dashboard
- [ ] All stages flow logically
- [ ] Output is properly formatted press release
- [ ] Follows AP Style guidelines
- [ ] Includes distribution checklist