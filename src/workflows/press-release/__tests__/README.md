# Press Release Workflow Unit Tests

This directory contains comprehensive unit tests for the press release workflow.

## Test Files

### 1. `workflow-config.test.ts`
Tests the workflow configuration structure:
- Workflow metadata (ID, name, description)
- All 8 stages are properly configured
- Stage dependencies are valid
- No circular dependencies
- Template variables use correct format
- All referenced stages exist

### 2. `workflow-execution.test.ts`
Tests the workflow execution flow:
- Auto-run behavior for appropriate stages
- Correct execution order based on dependencies
- Model configuration (Gemini for text, Imagen for images)
- Temperature settings for different stages
- Form field configuration and validation
- AI generation features (redo, edit, copy)
- Export configuration and formats

### 3. `template-validation.test.ts`
Tests template variable resolution:
- All template variables are resolvable
- Variables reference only available stages
- JSON output validation
- Cross-stage variable resolution
- Dependency chains are valid

### 4. `prompt-quality.test.ts`
Tests the quality of AI prompts:
- Clear role definitions
- Specific output instructions
- No ambiguous language
- Proper JSON formatting instructions
- All required fields are defined
- Error prevention (no circular references)
- Consistent variable naming

## Running Tests

```bash
# Run all press release tests
npm test -- src/workflows/press-release/__tests__/

# Run specific test file
npm test -- src/workflows/press-release/__tests__/workflow-config.test.ts

# Run with coverage
npm test -- --coverage src/workflows/press-release/__tests__/

# Watch mode
npm test -- --watch src/workflows/press-release/__tests__/
```

## Test Coverage

All tests ensure:
- ✅ Workflow structure is valid
- ✅ Dependencies are properly configured
- ✅ Template variables are resolvable
- ✅ AI prompts are high quality
- ✅ JSON outputs are properly formatted
- ✅ Auto-run stages execute in correct order
- ✅ Export formats are supported
- ✅ No circular dependencies or references