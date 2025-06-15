# Universal Export Stage Specification

**Created:** 2025-01-15
**Priority:** Critical
**Component:** Workflow System, Export Functionality, Publishing Platform
**Type:** Feature Specification / Architecture Design
**Epic:** Transform Franz AI Writer into a Complete Publishing Platform

## Executive Summary

Design and implement a revolutionary universal export stage that transforms Franz AI Writer from a content generation tool into a complete content publishing platform. This AI-powered export stage will be the crown jewel of every workflow, providing professional-grade export capabilities, instant web publishing, and seamless integration with modern content management systems.

## Vision Statement

> "From AI generation to professional publication in one click"

The export stage will be the moment where users feel the full power of Franz AI Writer - where their carefully crafted content transforms into beautifully formatted, shareable, and professional outputs ready for any platform or purpose.

## Problem Statement

Currently, users invest significant time creating content through our multi-stage workflows, but hit a wall at the end:
- **No Professional Output**: Raw text/markdown isn't ready for professional use
- **Platform Friction**: Copying to other platforms loses formatting and context
- **Sharing Limitations**: No easy way to share work for feedback or publication
- **Format Lock-in**: Users need multiple formats for different purposes
- **Lost Potential**: Beautiful AI-generated content trapped in our system

## The Game-Changing Solution

### 🚀 Introducing the Universal Export Stage

A revolutionary stage type (`"stageType": "export"`) that transforms raw AI output into professional, publish-ready content across multiple formats with a single click. This isn't just an export feature - it's a complete publishing platform.

### Core Magic

1. **AI-Powered Transformation**: 
   - Intelligent formatting that understands content context
   - Professional typography and layout decisions
   - Automatic responsive design generation
   - Smart content structuring for different formats

2. **One Source, Every Format**:
   - AI generates a master styled HTML document
   - All other formats intelligently derived
   - Consistent quality across all exports
   - Format-specific optimizations

3. **Instant Web Publishing**:
   - One-click publishing to shareable URLs
   - Professional presentation without login walls
   - SEO-safe with noindex protection
   - Social sharing optimized

4. **CMS-Ready Output**:
   - Clean HTML strips all styling for perfect CMS paste
   - Maintains semantic structure
   - Preserves formatting intent
   - Works with any modern CMS

### Revolutionary Stage Configuration

```json
{
  "id": "export-publish",
  "name": "Export & Publish ✨",
  "description": "Transform your content into professional formats and publish instantly",
  "stageType": "export",
  "inputType": "none",
  "outputType": "export-interface",
  "dependencies": ["final-content-stage"],
  "autoRun": false,  // User must explicitly trigger export
  "showAsHero": true,  // Special UI treatment for export stage
  "triggerButton": {
    "label": "✨ Export & Publish",
    "variant": "hero",
    "size": "large",
    "description": "Transform your content into professional formats"
  },
  "exportConfig": {
    "aiModel": "googleai/gemini-2.0-flash",  // Can override per workflow
    "temperature": 0.3,  // Lower temp for consistent formatting
    "formats": {
      "html-styled": {
        "enabled": true,
        "label": "🎨 Styled HTML",
        "description": "Beautiful, ready-to-publish HTML with embedded styles",
        "icon": "palette",
        "aiTemplate": "prompts/html-styled-template.md",
        "features": [
          "Professional typography",
          "Responsive design",
          "Print optimized",
          "Dark mode support"
        ]
      },
      "html-clean": {
        "enabled": true,
        "label": "📝 Clean HTML",
        "description": "AI-optimized semantic HTML - perfect for any CMS or platform",
        "icon": "code",
        "aiTemplate": "prompts/html-clean-template.md",
        "features": [
          "Perfect semantic structure",
          "Optimized for markdown conversion",
          "CMS-friendly markup",
          "Accessibility compliant"
        ]
      },
      "markdown": {
        "enabled": true,
        "label": "📄 Markdown",
        "description": "Universal markdown format for GitHub, Notion, Obsidian",
        "icon": "file-text",
        "deriveFrom": "html-clean",  // Now derives from the AI-optimized clean HTML
        "options": {
          "flavor": "github",
          "preserveHtml": false,
          "smartConversion": true
        }
      },
      "pdf": {
        "enabled": true,
        "label": "📕 PDF Document",
        "description": "Professional PDF with custom styling",
        "icon": "file-pdf",
        "deriveFrom": "html-styled",
        "options": {
          "pageSize": "A4",
          "margins": { "top": "2cm", "bottom": "2cm", "left": "2cm", "right": "2cm" },
          "headerFooter": true,
          "pageNumbers": true,
          "tableOfContents": "auto"
        }
      },
      "docx": {
        "enabled": true,
        "label": "📘 Word Document",
        "description": "Microsoft Word format with styles preserved",
        "icon": "file-word",
        "deriveFrom": "html-styled",
        "options": {
          "styles": "professional",
          "compatibility": "office365"
        }
      },
      "epub": {
        "enabled": false,  // Future enhancement
        "label": "📖 eBook (EPUB)",
        "description": "For digital readers and bookstores",
        "deriveFrom": "html-styled"
      }
    },
    "publishing": {
      "enabled": true,
      "instant": true,
      "baseUrl": "/published",
      "customDomains": false,  // Future: user.franzai.com/doc-name
      "formats": ["html-styled", "html-clean", "markdown"],
      "features": {
        "seo": {
          "noindex": true,
          "openGraph": true,
          "twitterCard": true,
          "structuredData": true
        },
        "sharing": {
          "shortUrls": true,  // /p/abc123
          "qrCode": true,
          "socialButtons": true
        },
        "protection": {
          "public": true,
          "passwordOption": false,  // Future enhancement
          "expiration": {
            "default": "never",
            "options": ["24h", "7d", "30d", "never"]
          }
        },
        "branding": {
          "showLogo": true,
          "poweredBy": "Created with Franz AI Writer",
          "customizable": false  // Pro feature later
        }
      }
    },
    "styling": {
      "themes": {
        "default": "elegant",
        "options": ["elegant", "minimal", "newspaper", "magazine", "academic"]
      },
      "customization": {
        "fonts": {
          "heading": "Playfair Display",
          "body": "Inter"
        },
        "colors": {
          "primary": "#1a73e8",
          "background": "#ffffff",
          "text": "#202124"
        }
      },
      "cssTemplate": "prompts/export-styles.css"
    }
  }
}
```

### 🎯 Revolutionary UX Flow

#### The Magic Moment

1. **User Decision Point**: When content is ready, export stage shows a compelling call-to-action
2. **Explicit Trigger**: User clicks the hero "✨ Export & Publish" button when they're ready
3. **AI Processing**: Dual AI generation begins (styled + clean) with progress indicators
4. **Instant Gratification**: User sees beautiful results as they're generated

#### Pre-Export Stage (User Triggered)

```
┌────────────────────────────────────────────────────────┐
│  📝 Your Content is Complete!                          │
│  ─────────────────────────────────────────────────    │
│                                                        │
│  Ready to transform your content into professional     │
│  formats and share it with the world?                 │
│                                                        │
│      ┌────────────────────────────────────┐           │
│      │   ✨ Export & Publish              │           │
│      │                                    │           │
│      │   Create beautiful exports and     │           │
│      │   shareable links instantly        │           │
│      └────────────────────────────────────┘           │
│                                                        │
│  What you'll get:                                      │
│  • Professional HTML (styled & clean)                  │
│  • Markdown for GitHub/Notion                          │
│  • PDF & Word documents                                │
│  • Instant web publishing                              │
│                                                        │
└────────────────────────────────────────────────────────┘
```

#### Post-Trigger Experience (After User Clicks Export)

```
┌────────────────────────────────────────────────────────┐
│  ✨ Creating Your Exports...                           │
│  ─────────────────────────────────────────────────    │
│                                                        │
│  [AI Progress Bar: Generating styled HTML... 45%]      │
│  [AI Progress Bar: Creating clean HTML... 20%]         │
│                                                        │
└────────────────────────────────────────────────────────┘

↓ (After generation completes)

┌────────────────────────────────────────────────────────┐
│  ✨ Your Content is Ready!                             │
│  ─────────────────────────────────────────────────    │
│                                                        │
│  Live Preview                   Format Selection       │
│  ┌─────────────────────┐       ┌──────────────────┐   │
│  │                     │       │ 🎨 Styled HTML    │   │
│  │  [Beautiful styled  │       │ Professional web  │   │
│  │   preview with      │       │ Ready to publish  │   │
│  │   live toggle       │       │ [Download] [Copy] │   │
│  │   between styled/   │       ├──────────────────┤   │
│  │   clean versions]   │       │ 📝 Clean HTML     │   │
│  │                     │       │ Perfect for CMS   │   │
│  │                     │       │ [Download] [Copy] │   │
│  └─────────────────────┘       ├──────────────────┤   │
│                                │ 📄 Markdown       │   │
│  Preview: [Styled] [Clean]     │ GitHub ready      │   │
│                                │ [Download] [Copy] │   │
│                                ├──────────────────┤   │
│  ┌────────────────────────────────────────────────┐   │
│  │  🚀 Publish to Web                             │   │
│  │                                                │   │
│  │  Your content will be available at:           │   │
│  │  ┌──────────────────────────────────────┐     │   │
│  │  │ franzai.com/p/your-amazing-content   │     │   │
│  │  └──────────────────────────────────────┘     │   │
│  │                                                │   │
│  │  Options:                                      │   │
│  │  ☑ Include social sharing buttons             │   │
│  │  ☑ Generate QR code                           │   │
│  │  ☐ Set expiration date                        │   │
│  │                                                │   │
│  │  [🌐 Publish Now]  [Configure...]              │   │
│  └────────────────────────────────────────────────┘   │
│                                                        │
│  More Formats                                          │
│  ┌─────────────┐  ┌─────────────┐                     │
│  │ 📕 PDF      │  │ 📘 Word     │                     │
│  │ Print ready │  │ .docx format│                     │
│  │ [Generate]  │  │ [Generate]  │                     │
│  └─────────────┘  └─────────────┘                     │
└────────────────────────────────────────────────────────┘
```

#### Smart Interactions

- **Live Preview Toggle**: Switch between styled/clean instantly
- **One-Click Actions**: Download, copy, or share any format
- **Smart Defaults**: Best format pre-selected based on workflow
- **Progress Indicators**: Show AI generation status
- **Success Feedback**: Clear confirmation when actions complete

### 🧠 AI Processing Architecture - The Secret Sauce

#### Double AI Generation Strategy

1. **First AI Pass - Styled HTML**: 
   - AI creates beautiful, styled HTML from all workflow stages
   - Understands content hierarchy and importance
   - Applies professional design principles
   - Includes responsive design, animations, print styles
   - Optimizes for web viewing and sharing

2. **Second AI Pass - Clean Semantic HTML**:
   - AI re-processes content with different objectives
   - Creates perfect semantic structure for maximum compatibility
   - Optimizes heading hierarchy for outline generation
   - Ensures clean, accessible markup
   - Prepares ideal structure for markdown conversion
   - Removes all styling but preserves meaning

3. **Smart Derivation Chain**:
   ```
   Workflow Content
        │
        ├── AI Pass 1: Styled HTML (Beautiful presentation)
        │   ├── PDF (render styled HTML)
        │   └── Publishing (styled version)
        │
        └── AI Pass 2: Clean HTML (Perfect structure)
            ├── Markdown (clean conversion)
            ├── DOCX (semantic import)
            └── Publishing (clean version)
   ```

#### Why Double AI Generation?

- **Styled HTML AI Focus**: Beauty, readability, emotional impact
- **Clean HTML AI Focus**: Structure, semantics, portability
- **Result**: Best of both worlds - beautiful AND portable

### Publishing System

1. **URL Structure**: `/published/{documentId}/{format}`
   - Example: `/published/abc123/styled`
   - Example: `/published/abc123/clean`

2. **Publishing Features**:
   - No authentication required
   - `noindex` meta tag for SEO protection
   - Permanent URLs (or configurable expiration)
   - Social sharing metadata support
   - Print-optimized CSS for styled version

### Implementation Architecture

```
src/
├── components/
│   └── wizard/
│       ├── export-stage/
│       │   ├── export-stage-card.tsx
│       │   ├── export-preview.tsx
│       │   ├── export-options.tsx
│       │   └── publish-dialog.tsx
│       └── stage-card.tsx (modified to handle export type)
├── lib/
│   ├── export/
│   │   ├── html-generator.ts
│   │   ├── format-converters.ts
│   │   ├── pdf-generator.ts
│   │   └── docx-generator.ts
│   └── publishing/
│       ├── publish-manager.ts
│       └── public-document-store.ts
├── app/
│   ├── published/
│   │   └── [documentId]/
│   │       └── [format]/
│   │           └── page.tsx
│   └── api/
│       ├── export/
│       │   └── [format]/
│       │       └── route.ts
│       └── publish/
│           └── route.ts
└── workflows/
    └── [workflow-name]/
        └── prompts/
            ├── html-styled-template.md
            └── export-styles.css
```

### 🎨 AI Prompt Engineering - The Art & Science

#### Styled HTML Generation Prompt

```markdown
# prompts/html-styled-template.md

You are a world-class web designer and typographer creating a stunning HTML document that will make readers stop and appreciate the beauty of the content.

## Content Analysis Phase
First, analyze the content type and structure:
- Content Type: {{workflow.type}} (poem/article/recipe/etc)
- Emotional Tone: [Analyze from content]
- Target Audience: {{workflow.audience}}
- Reading Context: [Web/Print/Mobile]

## Available Content
{{#each stages}}
### {{this.name}}
{{this.output}}
{{/each}}

## Design Requirements

### Visual Hierarchy
1. Create clear visual hierarchy using:
   - Font sizes (use modular scale)
   - Font weights (thin to bold)
   - Color contrast
   - Spacing (use vertical rhythm)
   - Decorative elements (when appropriate)

### Typography Selection
- Headlines: Choose fonts that match content personality
- Body: Ensure maximum readability
- Special: Accent fonts for quotes, captions, etc.
- Fallbacks: Include system font stack

### Color Palette
- Generate cohesive color scheme based on content mood
- Ensure WCAG AAA compliance
- Include dark mode variables

### Layout & Spacing
- Use CSS Grid/Flexbox for robust layout
- Implement proper vertical rhythm (1.5-1.8 line height)
- Add generous whitespace for breathing room
- Make it fully responsive (mobile-first)

### Interactive Elements
- Subtle hover effects
- Smooth scroll behavior
- Print-optimized styles
- Loading animations

### Meta & SEO
- Complete meta tags
- Open Graph tags
- Twitter Card tags
- Structured data (JSON-LD)

## Output Format
Generate a complete, self-contained HTML document with:
- All styles embedded in <style> tags
- No external dependencies
- Optimized for performance
- Beautiful at every screen size

Remember: This is the user's masterpiece. Make it shine!
```

#### Clean HTML Generation Prompt

```markdown
# prompts/html-clean-template.md

You are an expert in semantic HTML and document structure. Create perfectly structured HTML optimized for:
1. CMS compatibility (WordPress, Ghost, Medium, etc.)
2. Markdown conversion
3. Accessibility
4. SEO

## Content to Structure
{{#each stages}}
### {{this.name}}
{{this.output}}
{{/each}}

## Requirements

### Semantic Structure
1. Use ONLY semantic HTML5 elements:
   - <article> for main content
   - <header> for introductions
   - <section> for logical divisions
   - <h1>-<h6> for proper hierarchy
   - <p> for paragraphs
   - <blockquote> for quotes
   - <figure>/<figcaption> for images
   - <cite> for citations
   - <time> for dates
   - <address> for author info

2. Heading Hierarchy:
   - ONE <h1> only (document title)
   - Logical nesting (never skip levels)
   - Descriptive, keyword-rich headings

3. Content Organization:
   - Group related content in sections
   - Use lists (<ul>/<ol>) for enumeration
   - Add id attributes to headings for anchors
   - Include aria-labels where helpful

### CMS Optimization
- No inline styles
- No JavaScript
- No custom attributes
- Clean, predictable structure
- Standard HTML entities only

### Markdown Readiness
Structure HTML so it converts perfectly to markdown:
- Clear paragraph separation
- Proper list formatting
- Clean blockquotes
- Simple, flat structure where possible

### Output Requirements
- NO <html>, <head>, or <body> tags
- Start directly with content wrapper
- Use semantic elements throughout
- Include microdata where appropriate
- Add comments for section purposes

## Goal
Create HTML so clean and semantic that it works perfectly when pasted into any CMS, converts flawlessly to markdown, and maintains all meaning and structure without any styling.
```

### State Management

The export stage would store:
```typescript
interface ExportStageState extends StageState {
  output: {
    htmlStyled: string;
    htmlClean: string;
    markdown: string;
    formats: {
      [format: string]: {
        ready: boolean;
        url?: string;
        error?: string;
      }
    };
    publishing: {
      publishedUrl?: string;
      publishedAt?: Date;
      publishedFormats?: string[];
    };
  };
}
```

### Progressive Enhancement

1. **Basic Level**: Show HTML exports only
2. **Enhanced Level**: Add PDF when possible
3. **Full Level**: All formats with publishing

### Error Handling

- If AI generation fails, show error with retry
- If format conversion fails, disable that specific format
- If publishing fails, maintain local export functionality

## 🚀 Implementation Strategy

### Phase 1: Foundation (Week 1-2)
1. Create export stage type in wizard system
2. Build basic UI components
3. Implement AI prompt templates
4. Test with poem workflow

### Phase 2: Core Features (Week 3-4)
1. Dual AI generation pipeline
2. Format converters (HTML → Markdown → Others)
3. Download functionality
4. Basic preview system

### Phase 3: Publishing Platform (Week 5-6)
1. Publishing infrastructure
2. Public routes without auth
3. SEO optimization
4. Social sharing features

### Phase 4: Polish & Scale (Week 7-8)
1. Advanced preview features
2. Export analytics
3. Performance optimization
4. Add to all workflows

## 💡 Technical Innovations

### Smart Caching
- Cache AI-generated exports for 24 hours
- Regenerate on-demand if content changes
- Pre-generate popular formats

### Progressive Enhancement
```typescript
// Start with basics, enhance as resources allow
const exportCapabilities = {
  basic: ['html-styled', 'html-clean', 'markdown'],
  enhanced: ['pdf'],
  premium: ['docx', 'epub'],
  enterprise: ['custom-templates', 'api-access']
};
```

### Responsive AI
- Detect content length and adjust formatting
- Use different models for different content types
- Fallback strategies for failures

## 🎯 Success Metrics

### User Success
- **Export Rate**: >80% of completed workflows export
- **Format Usage**: All formats used regularly
- **Publishing Rate**: >30% publish publicly
- **Sharing Rate**: >50% share their published links

### Technical Success
- **AI Generation Time**: <5 seconds for both passes
- **Export Time**: <2 seconds per format
- **Zero Downtime**: Publishing always available
- **Quality Score**: >95% satisfaction with exports

### Business Impact
- **User Retention**: +40% due to export capabilities
- **Viral Growth**: Published content drives new users
- **Platform Value**: Complete creation-to-publication flow

## 🌟 Competitive Advantages

1. **Only Platform with Dual AI Export**: Both beautiful AND portable
2. **Instant Publishing**: No signup for readers
3. **Format Intelligence**: AI optimizes for each format
4. **Workflow Integration**: Seamless part of creation process
5. **Professional Quality**: Outputs rival manual formatting

## 🔮 Future Enhancements

### Version 2.0
- Custom branding options
- Export templates marketplace
- Batch export for multiple documents
- API access for developers
- White-label publishing

### Version 3.0
- Book compilation from multiple documents
- Interactive exports (embedded forms, etc.)
- Direct integration with CMSs
- Custom domain mapping
- Advanced analytics dashboard

## 🎨 Design Philosophy

> "The export stage should feel like a celebration - the moment where rough ideas transform into polished, shareable reality."

Every design decision should reinforce:
1. **Pride**: Users feel proud to share their work
2. **Power**: Professional results without expertise
3. **Simplicity**: Complex tech, simple interface
4. **Flexibility**: Their content, their way

## 📋 Acceptance Criteria

### Must Have
- ✅ Dual AI generation (styled + clean)
- ✅ All 5 core export formats
- ✅ One-click publishing
- ✅ Live preview
- ✅ Copy/download for all formats
- ✅ Mobile-responsive exports
- ✅ SEO-safe public URLs

### Should Have
- ✅ QR code generation
- ✅ Social sharing metadata
- ✅ Print optimization
- ✅ Dark mode support
- ✅ Export analytics

### Could Have
- ⏳ Custom templates
- ⏳ Password protection
- ⏳ Expiring links
- ⏳ Custom domains

## 🏁 Definition of Done

The export stage is complete when:
1. Users can export in all formats with one click
2. Published URLs work without authentication
3. AI generates beautiful AND semantic HTML
4. All exports maintain content fidelity
5. System handles errors gracefully
6. Performance meets all targets
7. Users report feeling "proud to share"

## 💬 Final Thoughts

This export stage isn't just a feature - it's the bridge between creation and impact. It transforms Franz AI Writer from a tool into a complete creative platform. When users see their content transformed into beautiful, shareable formats, they'll understand the true power of what we've built.

The double AI generation approach (styled + clean) is our secret weapon - no other platform offers this level of intelligent export. We're not just exporting content; we're elevating it.

> "From first word to final publication, Franz AI Writer is where content comes to life."

## 📋 Complete Implementation Task List

### Phase 1: Foundation & Architecture

#### 1.1 Core Export Stage Type
- [ ] Create new `stageType: "export"` in types/index.ts
- [ ] Update StageCard component to recognize export type
- [ ] Add export stage validation to workflow loader
- [ ] Create ExportStageCard component with hero styling
- [ ] Implement trigger button UI with proper states
- [ ] Add export stage to workflow schema validation

#### 1.2 State Management
- [ ] Define ExportStageState interface
- [ ] Add export state to WizardInstance
- [ ] Create export state reducers
- [ ] Implement export progress tracking
- [ ] Add caching layer for generated exports
- [ ] Handle export state persistence

#### 1.3 UI Components Structure
- [ ] Create components/wizard/export-stage/ directory
- [ ] Build ExportStageCard with hero treatment
- [ ] Create ExportPreview component with toggle
- [ ] Build ExportOptions grid layout
- [ ] Design PublishDialog component
- [ ] Add progress indicators for AI generation
- [ ] Implement format download buttons

### Phase 2: AI Generation Pipeline

#### 2.1 Prompt Engineering
- [ ] Create prompts/html-styled-template.md for each workflow
- [ ] Create prompts/html-clean-template.md for each workflow
- [ ] Design content aggregation logic for all stages
- [ ] Add workflow-specific styling rules
- [ ] Implement template variable replacement
- [ ] Test prompts with various content types

#### 2.2 AI Integration
- [ ] Create lib/export/ai-html-generator.ts
- [ ] Implement dual AI generation flow
- [ ] Add progress callbacks for UI updates
- [ ] Handle AI generation errors gracefully
- [ ] Implement retry logic for failed generations
- [ ] Add generation result validation

#### 2.3 Export Config Integration
- [ ] Parse exportConfig from workflow.json
- [ ] Implement model selection from config
- [ ] Apply temperature settings
- [ ] Load workflow-specific prompts
- [ ] Handle format enable/disable flags
- [ ] Process styling configuration

### Phase 3: Format Converters

#### 3.1 HTML Processing
- [ ] Create lib/export/html-processor.ts
- [ ] Implement HTML validation
- [ ] Add HTML beautification
- [ ] Create HTML minification for production
- [ ] Add meta tag injection
- [ ] Implement responsive image handling

#### 3.2 Clean HTML Generation
- [ ] Build lib/export/html-cleaner.ts
- [ ] Strip all styling elements
- [ ] Preserve semantic structure
- [ ] Optimize for CMS compatibility
- [ ] Add accessibility attributes
- [ ] Validate against HTML5 standards

#### 3.3 Markdown Converter
- [ ] Install/build HTML to Markdown converter
- [ ] Create lib/export/markdown-converter.ts
- [ ] Handle complex HTML structures
- [ ] Preserve formatting intent
- [ ] Add GitHub-flavored markdown support
- [ ] Test with various CMS platforms

#### 3.4 PDF Generator
- [ ] Set up Puppeteer/Playwright for PDF
- [ ] Create lib/export/pdf-generator.ts
- [ ] Implement page size configuration
- [ ] Add header/footer support
- [ ] Handle page breaks intelligently
- [ ] Add table of contents generation
- [ ] Optimize for print quality

#### 3.5 DOCX Generator
- [ ] Research DOCX generation libraries
- [ ] Create lib/export/docx-generator.ts
- [ ] Map HTML styles to Word styles
- [ ] Handle images and media
- [ ] Preserve document structure
- [ ] Test with various Word versions

### Phase 4: Publishing Infrastructure

#### 4.1 Publishing Backend
- [ ] Create app/api/publish/route.ts
- [ ] Design publishing data model
- [ ] Implement Firestore collections for published docs
- [ ] Add publishing transaction logic
- [ ] Generate short URLs
- [ ] Handle format selection for publishing

#### 4.2 Public Routes
- [ ] Create app/published/[documentId]/[format]/page.tsx
- [ ] Implement authentication bypass
- [ ] Add noindex meta tags
- [ ] Create loading states
- [ ] Handle 404 for missing documents
- [ ] Add format switching UI

#### 4.3 SEO & Sharing
- [ ] Add OpenGraph meta tag generation
- [ ] Implement Twitter Card tags
- [ ] Create structured data (JSON-LD)
- [ ] Add canonical URL handling
- [ ] Generate social sharing images
- [ ] Implement share button functionality

#### 4.4 QR Code Generation
- [ ] Add QR code library
- [ ] Create QR code generator service
- [ ] Add QR code to publishing UI
- [ ] Implement QR code download
- [ ] Style QR codes with branding

### Phase 5: Export UI/UX

#### 5.1 Preview System
- [ ] Build live preview component
- [ ] Implement styled/clean toggle
- [ ] Add preview zoom controls
- [ ] Create mobile preview mode
- [ ] Add print preview option
- [ ] Implement preview error states

#### 5.2 Export Options UI
- [ ] Design format selection cards
- [ ] Add format descriptions
- [ ] Implement download functionality
- [ ] Add copy-to-clipboard feature
- [ ] Create batch export option
- [ ] Show format file sizes

#### 5.3 Publishing Flow
- [ ] Design publishing dialog
- [ ] Add publishing options checkboxes
- [ ] Create URL preview
- [ ] Implement publish confirmation
- [ ] Add success notifications
- [ ] Create share dialog post-publish

### Phase 6: Integration & Testing

#### 6.1 Workflow Integration
- [ ] Add export stage to poem workflow
- [ ] Configure poem-specific styling
- [ ] Add export stage to article workflow
- [ ] Configure article-specific styling
- [ ] Add export stage to recipe workflow
- [ ] Test all workflow exports

#### 6.2 E2E Testing
- [ ] Write tests for export trigger
- [ ] Test AI generation flow
- [ ] Verify all format exports
- [ ] Test publishing flow
- [ ] Check public URL access
- [ ] Validate SEO tags

#### 6.3 Performance Optimization
- [ ] Implement export caching
- [ ] Add CDN for published content
- [ ] Optimize AI generation calls
- [ ] Minimize format conversion time
- [ ] Add progress streaming
- [ ] Implement lazy loading

### Phase 7: Polish & Enhancement

#### 7.1 Error Handling
- [ ] Add comprehensive error messages
- [ ] Implement fallback strategies
- [ ] Create error recovery flows
- [ ] Add user-friendly error UI
- [ ] Log errors for debugging
- [ ] Add error analytics

#### 7.2 Analytics
- [ ] Track export usage by format
- [ ] Monitor publishing rates
- [ ] Measure generation times
- [ ] Track sharing metrics
- [ ] Add user satisfaction tracking
- [ ] Create analytics dashboard

#### 7.3 Documentation
- [ ] Write user documentation
- [ ] Create workflow author guide
- [ ] Document AI prompt best practices
- [ ] Add troubleshooting guide
- [ ] Create video tutorials
- [ ] Update API documentation

### Phase 8: Advanced Features

#### 8.1 Theme System
- [ ] Design theme architecture
- [ ] Create default themes
- [ ] Add theme preview
- [ ] Implement theme switching
- [ ] Allow custom CSS injection
- [ ] Create theme marketplace structure

#### 8.2 Advanced Publishing
- [ ] Add expiring links feature
- [ ] Implement view analytics
- [ ] Create publishing dashboard
- [ ] Add bulk publishing
- [ ] Design API access
- [ ] Plan custom domain support

#### 8.3 Future Enhancements
- [ ] Research EPUB generation
- [ ] Plan template marketplace
- [ ] Design white-label options
- [ ] Explore interactive exports
- [ ] Plan API developer portal
- [ ] Create enterprise features

### Testing Checklist

#### Unit Tests
- [ ] Test all format converters
- [ ] Test AI prompt generation
- [ ] Test publishing logic
- [ ] Test error handling
- [ ] Test state management
- [ ] Test URL generation

#### Integration Tests
- [ ] Test complete export flow
- [ ] Test publishing pipeline
- [ ] Test format quality
- [ ] Test performance limits
- [ ] Test concurrent exports
- [ ] Test caching behavior

#### User Acceptance Tests
- [ ] Verify export quality
- [ ] Test on mobile devices
- [ ] Validate accessibility
- [ ] Check cross-browser support
- [ ] Test with real content
- [ ] Gather user feedback

### Launch Checklist

- [ ] All core features implemented
- [ ] Performance targets met
- [ ] Security review completed
- [ ] Documentation complete
- [ ] Analytics in place
- [ ] Rollback plan ready
- [ ] Support team trained
- [ ] Marketing materials ready
- [ ] Beta testing completed
- [ ] Launch announcement prepared

## 🎯 Definition of "Shipped"

The export stage is ready to ship when:
1. ✅ All Phase 1-6 tasks completed
2. ✅ All formats export successfully
3. ✅ Publishing works without auth
4. ✅ Performance meets targets
5. ✅ Error handling is robust
6. ✅ User testing shows >90% satisfaction
7. ✅ Documentation is complete
8. ✅ Analytics are tracking
9. ✅ All workflows have export stage
10. ✅ Team is confident in stability

This comprehensive task list provides a clear path from concept to shipped feature, ensuring nothing is missed in creating this game-changing export functionality.