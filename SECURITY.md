# Security Implementation Guide

## Input Sanitization

This application implements comprehensive input sanitization to prevent XSS attacks and other security vulnerabilities.

### DOMPurify Integration

The application uses DOMPurify for HTML sanitization with multiple security levels:

- **Default sanitization**: For most user-generated content
- **Strict sanitization**: For completely untrusted content
- **WYSIWYG sanitization**: For rich text editors

### Security Features

#### 1. HTML Content Sanitization
- All `dangerouslySetInnerHTML` usage is secured with DOMPurify
- Shadow DOM content is sanitized before rendering
- AI-generated HTML content is sanitized

#### 2. Template Security
- Handlebars templates have HTML escaping enabled
- Template variables are sanitized to prevent injection attacks
- Template context is recursively sanitized

#### 3. File Upload Security
- All uploaded file content is sanitized based on file type
- HTML files are parsed and sanitized before content extraction
- File processing includes content validation

#### 4. AI Content Security
- AI-generated content is sanitized before rendering
- Content validation for AI outputs
- Removal of dangerous patterns and scripts

### Usage

```typescript
import { 
  sanitizeHtml, 
  sanitizeHtmlStrict, 
  sanitizeHtmlWysiwyg,
  sanitizeTextInput,
  sanitizeAiContent,
  sanitizeFileContent,
  createSafeHtml
} from '@/lib/security/sanitization';

// For general HTML content
const safeHtml = sanitizeHtml(userInput);

// For completely untrusted content
const strictHtml = sanitizeHtmlStrict(untrustedContent);

// For WYSIWYG editors
const editorHtml = sanitizeHtmlWysiwyg(editorContent);

// For dangerouslySetInnerHTML
<div dangerouslySetInnerHTML={createSafeHtml(content)} />
```

### Security Audit

The application includes content auditing functions:

```typescript
import { auditContent, isContentSafe } from '@/lib/security/sanitization';

// Check content for potential security issues
const warnings = auditContent(content);
const isSafe = isContentSafe(content);
```

### Dependencies

- `dompurify`: ^3.2.0 - HTML sanitization library
- `@types/dompurify`: ^3.1.0 - TypeScript definitions

### Files Secured

1. `src/components/wizard/stage-output-area.tsx` - Google Search content
2. `src/components/wizard/grounding-sources-display.tsx` - Grounding sources
3. `src/components/wizard/wysiwyg-editor.tsx` - WYSIWYG editor preview
4. `src/components/wizard/html-preview.tsx` - HTML preview component
5. `src/components/wizard/export-stage/export-preview.tsx` - Export preview
6. `src/lib/template/template-engine.ts` - Template processing
7. `src/lib/export/ai-html-generator.ts` - AI-generated content
8. `src/components/wizard/smart-dropzone.tsx` - File upload processing
9. `src/components/wizard/stage-input-area.tsx` - Input context handling

### Best Practices

1. **Always sanitize user input** before processing or displaying
2. **Use appropriate sanitization level** for the content type
3. **Sanitize AI-generated content** before rendering
4. **Validate file uploads** before processing
5. **Enable template escaping** to prevent injection attacks
6. **Audit content regularly** for security issues

### Testing

Run the following commands to ensure security implementation:

```bash
# Install dependencies
npm install

# Run type checking
npm run typecheck

# Run linting
npm run lint

# Run tests
npm test
```

## Content Security Policy

Consider implementing Content Security Policy (CSP) headers for additional protection:

```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline';
```

## Reporting Security Issues

If you discover a security vulnerability, please report it to the project maintainers immediately.