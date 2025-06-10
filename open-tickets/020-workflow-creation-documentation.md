# Create Workflow Creation Documentation

**Created**: 2025-06-10
**Priority**: Medium
**Component**: Documentation

## Description
Create comprehensive documentation for creating new workflows, including best practices, examples, and a workflow builder interface.

## Tasks
- [ ] Write workflow structure documentation
- [ ] Create prompt writing guide
- [ ] Document stage dependencies
- [ ] Add workflow examples
- [ ] Create video tutorials
- [ ] Build workflow validator
- [ ] Add workflow templates
- [ ] Create visual workflow builder

## Documentation Structure

### 1. Getting Started Guide
```markdown
# Creating a Workflow

## Overview
Workflows in Franz AI Writer are JSON-based configurations that define
a series of stages for content creation.

## Basic Structure
- workflow.json - Main configuration
- prompts/ - Directory containing prompt templates
  - stage-1.md
  - stage-2.md
  - etc.

## Workflow Anatomy
{
  "id": "unique-workflow-id",
  "name": "Human Readable Name",
  "description": "What this workflow creates",
  "stages": [...],
  "config": {
    "allowSkip": true,
    "autoSave": true
  }
}
```

### 2. Stage Configuration Guide
```markdown
# Stage Configuration

## Required Fields
- id: Unique identifier
- title: Display name
- promptTemplate: Path to prompt file
- inputType: none|textarea|form|context
- outputType: text|json|markdown

## Optional Fields
- dependencies: Array of stage IDs
- isOptional: Boolean
- autoRun: Boolean
- formFields: Array (for form input)
- model: AI model override
- temperature: 0.0-1.0
```

### 3. Prompt Writing Best Practices
```markdown
# Prompt Engineering Guide

## Structure
1. Clear instruction
2. Context setup
3. Output format
4. Constraints
5. Examples (if needed)

## Variables
- {{variableName}} - Simple replacement
- {{#if condition}} - Conditionals
- {{#each array}} - Loops

## Tips
- Be specific about format
- Include examples
- Set clear constraints
- Test with edge cases
```

### 4. Workflow Examples

#### Blog Post Workflow
```json
{
  "id": "blog-post-seo",
  "name": "SEO Blog Post",
  "stages": [
    {
      "id": "topic",
      "title": "Topic Selection",
      "inputType": "form",
      "formFields": [
        {
          "name": "topic",
          "label": "Blog Topic",
          "type": "text"
        },
        {
          "name": "keywords",
          "label": "Target Keywords",
          "type": "textarea"
        }
      ]
    }
    // ... more stages
  ]
}
```

### 5. Visual Workflow Builder
```typescript
// Drag-and-drop interface for creating workflows
interface WorkflowBuilder {
  stages: Stage[];
  connections: Connection[];
  
  addStage(stage: Stage): void;
  connectStages(from: string, to: string): void;
  exportJSON(): WorkflowConfig;
  validateWorkflow(): ValidationResult;
}
```

### 6. Workflow Templates
- Blog Post Creator
- Press Release Builder
- Product Description
- Email Campaign
- Social Media Posts
- Technical Documentation

### 7. Validation Rules
- Unique stage IDs
- Valid dependencies
- Prompt files exist
- No circular dependencies
- Required fields present

## Interactive Documentation
- Live workflow preview
- Prompt tester
- Dependency visualizer
- Export/import tools

## Acceptance Criteria
- [ ] Complete written guide
- [ ] 5+ workflow examples
- [ ] Prompt writing guide
- [ ] Video tutorials created
- [ ] Workflow validator tool
- [ ] Template library
- [ ] Visual builder (MVP)