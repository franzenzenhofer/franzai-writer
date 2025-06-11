# Workflow Schema Reference

This document provides a comprehensive reference for the workflow.json schema used in Franz AI Writer.

## Overview

Each workflow is defined in a `workflow.json` file that specifies the stages, their dependencies, and how they interact with the AI system.

## Workflow Structure

```json
{
  "id": "string",
  "shortName": "string",
  "name": "string",
  "description": "string",
  "config": { /* WorkflowConfig */ },
  "stages": [ /* Array of Stage objects */ ]
}
```

### Top-Level Fields

- **id** (required): Unique identifier for the workflow
- **shortName** (optional): Short version of the workflow name (used in URLs)
- **name** (required): Display name for the workflow
- **description** (required): Brief description of what the workflow does
- **config** (optional): Configuration object for workflow behavior
- **stages** (required): Array of stage definitions

## WorkflowConfig Object

```json
{
  "setTitleFromStageOutput": "stage-id",
  "finalOutputStageId": "stage-id",
  "showThinking": false,
  "autoScroll": {
    "enabled": true,
    "scrollToAutorun": true,
    "scrollToManual": false
  },
  "progressAnimation": {
    "dynamicSpeed": true,
    "singleCycle": true
  }
}
```

### Config Fields

- **setTitleFromStageOutput**: Stage ID whose output will be used as the document title
- **finalOutputStageId**: Stage ID that produces the final output for export
- **showThinking**: Global setting to show AI thinking process (default: false)
- **autoScroll**: Auto-scrolling behavior configuration
  - **enabled**: Enable auto-scrolling (default: true)
  - **scrollToAutorun**: Scroll to auto-run stages (default: true)
  - **scrollToManual**: Scroll to manual stages (default: false)
- **progressAnimation**: Progress bar animation settings
  - **dynamicSpeed**: Adjust speed based on stage progress
  - **singleCycle**: Complete animation in one cycle

## Stage Object

```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "inputType": "textarea|form|image|document|context|none",
  "outputType": "text|json|markdown|html",
  "dependencies": ["stage-id-1", "stage-id-2"],
  "autoRun": false,
  "promptTemplate": "string with {{variables}}",
  "model": "model-identifier",
  "temperature": 0.7,
  "isOptional": false,
  "tokenEstimate": 500,
  "formFields": [ /* Array of FormField objects */ ],
  "toolNames": ["codeInterpreter"],
  "systemInstructions": "string",
  "chatEnabled": false,
  "aiRedoEnabled": true,
  "editEnabled": true,
  "showThinking": false,
  "thinkingSettings": {
    "enabled": true
  },
  "autoRunConditions": {
    "requiresAll": ["stage-id-1", "stage-id-2"],
    "requiresAny": ["stage-id-3", "stage-id-4"],
    "customLogic": "string"
  },
  "autorunDependsOn": ["stage-id-1", "stage-id-2"]
}
```

### Stage Fields

#### Required Fields
- **id**: Unique identifier for the stage
- **title**: Display title for the stage
- **description**: Brief description of the stage's purpose
- **inputType**: Type of input the stage accepts
- **outputType**: Format of the stage's output

#### Optional Fields
- **dependencies**: Array of stage IDs that must be completed before this stage becomes active
- **autoRun**: Whether the stage runs automatically when dependencies are met (default: false)
- **promptTemplate**: AI prompt with variable substitution using {{stage-id.output}} syntax
- **model**: Specific AI model to use (defaults to workflow or system default)
- **temperature**: AI temperature setting (0.0-1.0, default varies by model)
- **isOptional**: Whether the stage is optional (default: false)
- **tokenEstimate**: Estimated tokens for progress tracking
- **formFields**: Array of form field definitions (only for inputType: "form")
- **jsonFields**: Array of field definitions for structured JSON display (only for outputType: "json")
- **toolNames**: Array of AI tools/functions to enable (e.g., "codeInterpreter")
- **systemInstructions**: System-level instructions for the AI
- **chatEnabled**: Enable chat interface for this stage (default: false)
- **aiRedoEnabled**: Allow AI redo functionality (default: true for AI stages)
- **editEnabled**: Show edit button (default: varies by stage type)
- **showThinking**: Override global thinking display setting
- **copyable**: Enable copy button for stage output (default: false, works with text/markdown/json outputs)
- **thinkingSettings**: Configure thinking mode for this stage
- **autoRunConditions**: Complex conditions for auto-running (overrides simple dependencies)
- **autorunDependsOn** (new): Separate dependencies specifically for auto-run behavior

### Input Types

1. **textarea**: Multi-line text input
2. **form**: Structured form with multiple fields
3. **image**: Image upload/selection
4. **document**: Document upload (PDF, DOCX, TXT)
5. **context**: Smart dropzone for multiple file types
6. **none**: No user input required

### Output Types

1. **text**: Plain text output
2. **json**: Structured JSON data
3. **markdown**: Markdown-formatted text
4. **html**: HTML content (rendered in preview)

## Dependency System

### Basic Dependencies

The `dependencies` field determines when a stage becomes **active** (available to run):

```json
{
  "id": "stage-2",
  "dependencies": ["stage-1"],
  "autoRun": true
}
```

In this example, `stage-2` becomes active when `stage-1` is completed. If `autoRun` is true, it will also run automatically.

### Auto-Run Dependencies (New)

The `autorunDependsOn` field allows separate control over when a stage **auto-runs** vs when it becomes **active**:

```json
{
  "id": "generate-html-preview",
  "dependencies": ["generate-poem"],
  "autorunDependsOn": ["generate-poem", "html-briefing"],
  "autoRun": true
}
```

In this example:
- The stage becomes **active** (can be manually run) when `generate-poem` is completed
- The stage only **auto-runs** when both `generate-poem` AND `html-briefing` are completed
- If `autorunDependsOn` is not specified, it defaults to using `dependencies`

### Complex Auto-Run Conditions

For more complex logic, use `autoRunConditions`:

```json
{
  "autoRunConditions": {
    "requiresAll": ["stage-1", "stage-2"],
    "requiresAny": ["stage-3", "stage-4"]
  }
}
```

This stage auto-runs when:
- ALL of `stage-1` AND `stage-2` are completed
- AND at least ONE of `stage-3` OR `stage-4` is completed

## Variable Substitution

In `promptTemplate`, use double curly braces to reference outputs from other stages:

```
"promptTemplate": "Write a summary of this text: {{input-stage.output}}"
```

Available variables:
- `{{stage-id.output}}`: The output from a completed stage
- `{{stage-id.userInput}}`: The user input from a stage

## FormField Object (for form input type)

```json
{
  "name": "field-name",
  "label": "Display Label",
  "type": "text|textarea|checkbox|select",
  "defaultValue": "default",
  "placeholder": "Placeholder text",
  "options": [
    { "value": "opt1", "label": "Option 1" }
  ],
  "validation": {
    "required": true,
    "minLength": 10
  }
}
```

## JsonField Object (for json output type)

```json
{
  "key": "field-key",
  "label": "Display Label",
  "type": "text|textarea",
  "displayOrder": 1
}
```

### JsonField Properties
- **key**: The JSON property key to display
- **label**: Human-readable label for the field
- **type**: How to display the field (text for single line, textarea for multiline)
- **displayOrder**: Optional numeric order for display (lower numbers first)

## Best Practices

1. **Stage IDs**: Use kebab-case and descriptive names (e.g., `generate-title`, `create-outline`)
2. **Dependencies**: Keep dependency chains simple and logical
3. **Auto-Run**: Use sparingly for stages that don't require user review
4. **Token Estimates**: Provide realistic estimates for progress tracking
5. **Optional Stages**: Mark stages as optional when they enhance but aren't required
6. **Model Selection**: Only override the model when specific capabilities are needed
7. **Temperature**: Lower values (0.1-0.3) for consistency, higher (0.7-0.9) for creativity
8. **autorunDependsOn**: Use when auto-run conditions differ from activation conditions
9. **copyable**: Add to stages where users might want to copy the output (poems, code, etc.)

## Example Workflow

```json
{
  "id": "blog-writer",
  "name": "Blog Post Writer",
  "description": "Create SEO-optimized blog posts",
  "config": {
    "finalOutputStageId": "generate-html",
    "showThinking": false
  },
  "stages": [
    {
      "id": "topic-input",
      "title": "Blog Topic",
      "description": "What should the blog post be about?",
      "inputType": "textarea",
      "outputType": "text",
      "dependencies": [],
      "autoRun": false
    },
    {
      "id": "generate-outline",
      "title": "Generate Outline",
      "description": "AI creates a structured outline",
      "inputType": "none",
      "outputType": "json",
      "dependencies": ["topic-input"],
      "autoRun": true,
      "promptTemplate": "Create an outline for a blog post about: {{topic-input.output}}",
      "model": "googleai/gemini-2.0-flash-exp",
      "temperature": 0.3
    },
    {
      "id": "seo-keywords",
      "title": "SEO Keywords",
      "description": "Optional SEO keywords to target",
      "inputType": "textarea",
      "outputType": "text",
      "dependencies": [],
      "autoRun": false,
      "isOptional": true
    },
    {
      "id": "generate-content",
      "title": "Generate Blog Post",
      "description": "AI writes the full blog post",
      "inputType": "none",
      "outputType": "markdown",
      "dependencies": ["generate-outline"],
      "autorunDependsOn": ["generate-outline", "seo-keywords"],
      "autoRun": true,
      "promptTemplate": "Write a blog post based on this outline: {{generate-outline.output}}\n\nTarget these SEO keywords: {{seo-keywords.output}}",
      "aiRedoEnabled": true
    }
  ]
}
```

In this example, the blog post generation will only auto-run when both the outline AND SEO keywords are provided, but users can manually run it with just the outline.

## Real-World Example: Poem Generator with Optional HTML Formatting

Here's how the poem generator workflow uses `autorunDependsOn`:

```json
{
  "stages": [
    {
      "id": "generate-poem",
      "title": "Generate Poem",
      "dependencies": ["poem-topic"],
      "autoRun": true
    },
    {
      "id": "html-briefing",
      "title": "HTML Briefing",
      "description": "Special instructions for HTML formatting (optional)",
      "inputType": "textarea",
      "dependencies": [],
      "isOptional": true,
      "autoRun": false
    },
    {
      "id": "generate-html-preview",
      "title": "Generate HTML Preview",
      "dependencies": ["generate-poem"],
      "autorunDependsOn": ["generate-poem", "html-briefing"],
      "autoRun": true,
      "promptTemplate": "Convert poem to HTML with instructions: {{html-briefing.output}}"
    }
  ]
}
```

**Behavior**:
- HTML Preview becomes **active** (manual run button appears) once the poem is generated
- HTML Preview only **auto-runs** when BOTH the poem is generated AND HTML briefing is provided
- Users can click "Run AI" to generate HTML preview without providing briefing
- If briefing is added later, the HTML preview becomes stale and can be re-run

## Copyable Output Example

The `copyable` field adds a copy button to stage outputs:

```json
{
  "id": "generate-poem",
  "title": "Generate Poem",
  "outputType": "json",
  "copyable": true,
  "promptTemplate": "Write a poem..."
}
```

**Behavior**:
- A copy button appears in the top-right corner of the output area
- For JSON outputs with `jsonFields` configured:
  - Copies only the field values (not keys or labels)
  - Respects the `displayOrder` of fields
  - Joins values with double newlines for readability
- For JSON outputs without `jsonFields`: copies raw JSON
- For text/markdown: copies content as-is
- Shows a checkmark and toast notification when copied successfully

### Example with jsonFields:

```json
{
  "id": "generate-content",
  "outputType": "json",
  "copyable": true,
  "jsonFields": [
    { "key": "title", "label": "Title", "type": "text", "displayOrder": 1 },
    { "key": "body", "label": "Content", "type": "textarea", "displayOrder": 2 }
  ]
}
```

When copied, this would output:
```
The Article Title

The full article content goes here...
```