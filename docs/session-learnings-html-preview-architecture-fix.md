# HTML Preview Architecture Fix - Session Learnings

**Date**: 2025-01-20  
**Session Focus**: Fixing HTML preview rendering, prompt file caching, and AI execution context issues

## 🎯 **Summary of Issues Fixed**

This session addressed several critical architectural issues in the FranzAI Writer workflow system:

1. **Prompt File Caching Issues** - Client-side caching preventing prompt updates
2. **Unknown Workflow/Stage Context** - AI execution logging showing "unknown-workflow → unknown-stage"
3. **Shadow DOM CSS Compatibility** - CSS custom properties not working in HTML previews
4. **Complex HTML Editing** - Overly complex WYSIWYG editor for simple HTML editing
5. **Inconsistent Responsive Images** - Missing responsive image CSS requirements

## 🔧 **Major Architectural Changes**

### 1. **Prompt File Loading: Client-Side → Server-Side Migration**

#### **Problem**
- Prompt files were loaded client-side via API endpoints
- Aggressive caching (1 hour) prevented prompt updates during development
- Security concern: Prompt content exposed to client
- Unnecessary network requests

#### **Solution**
- **Moved prompt file loading to server-side** in `aiActions-new.ts`
- **Updated interface** to support both `promptTemplate?` and `promptFile?`
- **Added server-side security checks** to prevent directory traversal
- **Removed client-side API endpoint** entirely

#### **Code Changes**
```typescript
// NEW: Server-side prompt file loading
if (params.promptFile && params.workflow?.id) {
    console.log('[runAiStage] Loading prompt file server-side:', params.promptFile);
    
    try {
        const fs = await import('fs/promises');
        const path = await import('path');
        
        const promptFilePath = path.join(process.cwd(), 'src/workflows', params.workflow.id, params.promptFile);
        
        // Security check: Ensure path is within allowed directory
        const resolvedPath = path.resolve(promptFilePath);
        const workflowsDir = path.resolve(process.cwd(), 'src/workflows');
        
        if (!resolvedPath.startsWith(workflowsDir)) {
            throw new Error('Invalid prompt file path');
        }
        
        promptTemplate = await fs.readFile(promptFilePath, 'utf-8');
        console.log('[runAiStage] Prompt file loaded successfully, length:', promptTemplate.length);
    } catch (error) {
        console.error('[runAiStage] Failed to load prompt file:', error);
        throw new Error(`Failed to load prompt file: ${params.promptFile}`);
    }
}
```

#### **Client-Side Changes**
```typescript
// OLD: Client fetches prompt content
const promptFileUrl = `/api/workflow/${instance.workflow.id}/prompt/${stage.promptFile}`;
const response = await fetch(promptFileUrl);
promptContent = await response.text();

// NEW: Client passes promptFile reference
const result = await runAiStage({
    promptTemplate: stage.promptTemplate,
    promptFile: stage.promptFile,  // Server loads this
    // ... other params
});
```

### 2. **AI Execution Context Fix**

#### **Problem**
- AI execution was logging "unknown-workflow → unknown-stage" instead of actual workflow/stage names
- Context was lost in the `executeWithDirectGeminiAPI` function call

#### **Solution**
- **Added workflow/stage context** to all AI execution calls
- **Fixed context passing** in `ai-stage-execution.ts`
- **Updated AI HTML generator** to include proper context

#### **Code Changes**
```typescript
// FIXED: Added missing context
return await executeWithDirectGeminiAPI(
    {
        model: modelToUse,
        prompt: promptTemplate,
        temperature: temperature ?? 0.7,
        systemInstruction: systemInstructions,
        tools: availableTools,
        enableGoogleSearch: false,
        enableUrlContext: false,
        // ADD: workflow/stage context for logging
        workflowName: workflow?.name,
        stageName: stage?.name,
        stageId: stage?.id || stageId,
        contextVars: input.contextVars,
    },
    currentThinkingSteps,
    input
);
```

### 3. **HTML Preview: Shadow DOM → Iframe Migration**

#### **Problem**
- **Shadow DOM CSS Issues**: CSS custom properties (`:root`) didn't work properly
- **Complex CSS Conversion**: Required converting `:root` to `:host` selectors
- **Compatibility Issues**: Shadow DOM had various edge cases and limitations

#### **Solution**
- **Switched to iframe with `srcdoc`** for HTML preview
- **Removed all Shadow DOM logic** and CSS conversion
- **Simplified architecture** following export stage pattern

#### **Before vs After**

**Before (Shadow DOM)**:
```typescript
// Complex Shadow DOM setup
if (!shadowRootRef.current) {
    shadowRootRef.current = shadowRef.current.attachShadow({ mode: 'closed' });
}

// CSS conversion required
const fixCssForShadowDom = (content: string): string => {
    let fixed = content.replace(/:root\s*\{/g, ':host {');
    // ... complex CSS manipulation
    return fixed;
};

shadowRootRef.current.innerHTML = shadowDomContent;
```

**After (Iframe)**:
```typescript
// Simple iframe approach
const cleanedContent = cleanHtmlContent(content);
iframeRef.current.srcdoc = cleanedContent;
```

#### **HTML Preview Component**
```typescript
export function HtmlPreview({ content, removeBorder = false, className = "" }: HtmlPreviewProps) {
    const iframeRef = useRef<HTMLIFrameElement>(null);

    useEffect(() => {
        if (!iframeRef.current) return;

        const cleanedContent = cleanHtmlContent(content);
        
        if (!cleanedContent) {
            iframeRef.current.srcdoc = '';
            return;
        }

        // Set the HTML content directly in iframe using srcdoc
        iframeRef.current.srcdoc = cleanedContent;
    }, [content]);

    return (
        <iframe
            ref={iframeRef}
            title="HTML Preview"
            sandbox="allow-same-origin"
            className={cn(
                "w-full h-[400px] bg-white",
                !removeBorder && "border rounded-lg",
                className
            )}
        />
    );
}
```

### 4. **HTML Editing: WYSIWYG → Simple Textarea**

#### **Problem**
- **Complex WYSIWYG Editor**: Unnecessary complexity for raw HTML editing
- **Preview/Source Mode Switching**: Added confusion
- **Not Following KISS Principle**: Over-engineered solution

#### **Solution**
- **Replaced WYSIWYG with simple textarea** for HTML editing
- **Monospace font** for better code readability
- **Removed complex editor logic** entirely

#### **Code Changes**
```typescript
// OLD: Complex WYSIWYG editor
case "html":
    return (
        <WysiwygEditor
            content={String(stageState.output)}
            onChange={onOutputChange}
        />
    );

// NEW: Simple textarea
case "html":
    return (
        <Textarea
            value={String(stageState.output)}
            onChange={handleTextChange}
            rows={15}
            className="font-mono text-sm bg-background"
            placeholder="Enter HTML content..."
        />
    );
```

### 5. **Prompt Template Updates for Iframe Compatibility**

#### **Problem**
- **Prompt instructed AI to use `:host`** (Shadow DOM selector)
- **Missing responsive image requirements**
- **Incomplete HTML document structure**

#### **Solution**
- **Updated prompt to use proper CSS selectors** for iframe
- **Added responsive image requirements** 
- **Ensured complete HTML document structure**

#### **Updated Prompt Requirements**
```markdown
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
```

## 🔄 **Migration Guide: Client-Side to Server-Side Prompt Loading**

### **Step 1: Update Server Action Interface**
```typescript
interface RunAiStageParams {
    promptTemplate?: string;  // Made optional
    promptFile?: string;      // NEW: Server-side loading
    // ... other params
}
```

### **Step 2: Add Server-Side Loading Logic**
```typescript
// In aiActions-new.ts
let promptTemplate = params.promptTemplate;

if (params.promptFile && params.workflow?.id) {
    // Server-side loading logic here
    promptTemplate = await loadPromptFileSecurely(params.promptFile, params.workflow.id);
}
```

### **Step 3: Update Client Calls**
```typescript
// In wizard-shell.tsx
const result = await runAiStage({
    promptTemplate: stage.promptTemplate,
    promptFile: stage.promptFile,  // Pass file reference, not content
    // ... other params
});
```

### **Step 4: Remove Client-Side API Endpoint**
```bash
# Remove this file:
rm src/app/api/workflow/[workflowId]/prompt/[...promptFile]/route.ts
```

## 🎨 **CSS Architecture Best Practices**

### **For Iframe HTML Preview**
```css
/* ✅ CORRECT: Use :root for CSS variables */
:root {
    --primary-color: #your-color;
    --bg-color: #your-bg-color;
    --text-color: #your-text-color;
}

/* ✅ CORRECT: Use body/html selectors */
body {
    background-color: var(--bg-color);
    color: var(--text-color);
}
```

### **For Responsive Images**
```html
<!-- ✅ MANDATORY: All images must include responsive CSS -->
<img src="image.jpg" alt="Description" style="max-width: 100%; height: auto;">
```

### **Complete HTML Document Structure**
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document Title</title>
    <style>
        /* All CSS here */
    </style>
</head>
<body>
    <!-- Content here -->
</body>
</html>
```

## 📊 **Performance Improvements**

### **Before vs After Metrics**

| Aspect | Before | After |
|--------|--------|-------|
| **Prompt Loading** | Client-side + caching issues | Server-side + instant updates |
| **HTML Preview** | Shadow DOM + CSS conversion | Iframe + native CSS |
| **Edit Experience** | Complex WYSIWYG | Simple textarea |
| **Network Requests** | Extra API calls for prompts | None |
| **CSS Compatibility** | Limited, requires conversion | Full compatibility |

## 🔍 **Key Lessons Learned**

### **1. KISS Principle Validation**
- **Complex solutions often hide simple problems**
- **Iframe approach is simpler and more reliable than Shadow DOM**
- **Simple textarea is better than complex WYSIWYG for code editing**

### **2. Server-Side vs Client-Side Loading**
- **Server-side loading eliminates caching issues**
- **Better security (no prompt exposure)**
- **Simpler architecture**

### **3. CSS in Different Contexts**
- **Shadow DOM**: Requires `:host` selectors, limited CSS support
- **Iframe**: Full CSS support, use standard selectors
- **Regular DOM**: Standard CSS rules apply

### **4. Context Propagation**
- **Always pass context through the entire execution chain**
- **Lost context leads to debugging nightmares**
- **Explicit is better than implicit**

## 🚀 **Files Modified**

### **Core Changes**
- `src/app/actions/aiActions-new.ts` - Server-side prompt loading
- `src/components/wizard/wizard-shell.tsx` - Client-side prompt handling
- `src/components/wizard/html-preview.tsx` - Shadow DOM → Iframe
- `src/components/wizard/stage-output-area.tsx` - WYSIWYG → Textarea
- `src/ai/flows/ai-stage-execution.ts` - Context propagation fix
- `src/lib/export/ai-html-generator.ts` - Context for export operations

### **Content Updates**
- `src/workflows/poem-generator/prompts/generate-html-preview.md` - CSS requirements
- `src/components/wizard/export-stage/export-preview.tsx` - Iframe compatibility

### **Removed Files**
- `src/app/api/workflow/[workflowId]/prompt/[...promptFile]/route.ts` - No longer needed

## 🔮 **Future Considerations**

### **1. Prompt File Validation**
- Consider adding schema validation for prompt files
- Implement prompt file linting for common issues

### **2. HTML Preview Enhancements**
- Add viewport size options for responsive testing
- Consider adding accessibility testing tools

### **3. Performance Monitoring**
- Monitor server-side prompt loading performance
- Track iframe rendering performance

### **4. Security Enhancements**
- Review iframe sandboxing options
- Consider Content Security Policy for generated HTML

## 📝 **Testing Checklist**

After applying these changes, verify:

- [ ] **Prompt Updates**: Changes to `.md` prompt files appear immediately
- [ ] **HTML Preview**: CSS custom properties work correctly
- [ ] **Responsive Images**: All images scale properly on mobile
- [ ] **Edit Experience**: HTML editing uses simple textarea
- [ ] **AI Logging**: Shows correct workflow/stage names
- [ ] **Export Preview**: HTML exports render correctly
- [ ] **No Caching Issues**: Prompt changes appear without server restart

## 🎯 **Success Metrics**

This session successfully achieved:

- ✅ **Eliminated prompt file caching issues**
- ✅ **Fixed AI execution context logging**
- ✅ **Simplified HTML preview architecture**
- ✅ **Improved CSS compatibility**
- ✅ **Reduced code complexity**
- ✅ **Enhanced developer experience**

---

## 🔄 **Press Release Workflow Migration to Prompt Files**

### **Applied Session Learnings**

Following the successful HTML preview architecture fix, the press release workflow has been updated to:

1. **Server-Side Prompt Loading**: All inline `promptTemplate` fields converted to `promptFile` references
2. **CSS Iframe Compatibility**: HTML templates updated with proper CSS requirements
3. **Responsive Image Support**: All image generation prompts include responsive CSS requirements
4. **Context Propagation**: Proper workflow/stage context maintained throughout execution

### **Files Created**
- `prompts/tone-analysis.md` - Communication style analysis
- `prompts/company-research.md` - Business intelligence research
- `prompts/generate-headline.md` - Headline and key facts creation
- `prompts/generate-contacts.md` - Contact information generation
- `prompts/fact-check.md` - Fact verification and validation
- `prompts/final-press-release-complete.md` - Complete press release generation
- `prompts/press-photo-briefing.md` - Image specifications
- `prompts/create-press-image-prompt.md` - Imagen prompt optimization
- `prompts/generate-press-photo.md` - Image generation
- `prompts/generate-html-preview.md` - HTML preview with image integration (NEW)

### **Files Updated**
- `src/workflows/press-release/workflow.json` - All stages now use `promptFile` references + HTML preview stage + enhanced export config
- `prompts/html-styled-template.md` - Updated with iframe CSS requirements
- `prompts/html-clean-template.md` - Updated with responsive image requirements

### **Benefits Achieved**
- ✅ **Eliminated client-side prompt loading** - No more caching issues
- ✅ **Improved developer experience** - Prompt changes appear immediately
- ✅ **Better maintainability** - Separate files for each stage prompt
- ✅ **Enhanced security** - No prompt exposure to client-side
- ✅ **Iframe compatibility** - HTML previews work correctly with CSS
- ✅ **Responsive images** - All generated images scale properly

## 🎨 **Applied Poem Generator Best Practices**

### **Added HTML Preview Stage**
Following the poem generator's successful pattern, added a dedicated HTML preview stage:
- **Stage ID**: `generate-html-preview`
- **Purpose**: Creates beautiful HTML with embedded press images
- **Output**: Complete HTML document with iframe compatibility
- **Auto-run**: Automatically triggers after press release and image generation

### **Enhanced Export Configuration**
Applied poem generator's export best practices:
- **Multiple Themes**: Added `news` and `executive` themes for press releases
- **Professional Fonts**: System fonts for consistent rendering
- **Corporate Colors**: Professional color scheme for press releases
- **Publishing Features**: Instant publishing with SEO, sharing, and branding
- **Format Options**: HTML styled, HTML clean, Markdown, PDF, and Word

### **Improved Workflow Structure**
- **Updated finalOutputStageId**: Now points to HTML preview stage
- **Better Dependencies**: Export stage depends on HTML preview
- **Enhanced Image Integration**: Images seamlessly embedded in HTML
- **Professional Presentation**: Press release formatted for media distribution

### **HTML Preview Prompt Features**
- **Complete HTML Document**: Proper DOCTYPE, head, and body structure
- **Responsive Design**: Mobile-first approach with responsive images
- **Press Release Structure**: FOR IMMEDIATE RELEASE header, headlines, contact info
- **Professional Styling**: Corporate typography and clean layout
- **Image Integration**: Strategic placement of press photos

---

**End of Session**: The FranzAI Writer HTML preview system is now more robust, simpler, and developer-friendly. The architecture follows KISS principles while maintaining full functionality. The press release workflow has been successfully migrated to use prompt files, applying all the learnings from this session. 