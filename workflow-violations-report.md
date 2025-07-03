# Workflow Violations Report: Stages with Both Human Input and AI Generation

## Summary
Found 9 violations across 4 workflows where stages have both human input (form/textarea/context) AND AI generation (promptTemplate defined).

## Violations Found:

### 1. targeted-page-seo-optimized-v3/workflow.json

**Stage: page-title-generation**
- Stage ID: `page-title-generation`
- Stage Name: Generate Page Title
- Input Type: `form`
- Has promptTemplate: YES
- Why it violates: This stage has a form input (user selects content angle) AND generates AI output via promptTemplate. Should be split into two stages.

**Stage: outline-creation**
- Stage ID: `outline-creation`
- Stage Name: Create Content Outline
- Input Type: `form`
- Has promptTemplate: YES
- Why it violates: This stage has a form input (user selects page title) AND generates AI output via promptTemplate. Should be split into two stages.

### 2. recipe-seo-optimized/workflow.json

**Stage: code-execution-test**
- Stage ID: `code-execution-test`
- Stage Name: Code Execution Test
- Input Type: `textarea`
- Has promptTemplate: YES
- Why it violates: This stage has textarea input AND AI processing via promptTemplate. Code execution should be a separate AI-only stage.

### 3. gemini-tools-test/workflow.json

**Stage: grounding-google-search**
- Stage ID: `grounding-google-search`
- Stage Name: Grounding with Google Search
- Input Type: `textarea`
- Has promptTemplate: YES
- Why it violates: Has textarea input AND AI processing with promptTemplate. Should separate user input from AI search.

**Stage: grounding-url-context**
- Stage ID: `grounding-url-context`
- Stage Name: Grounding with URL Context
- Input Type: `form`
- Has promptTemplate: YES
- Why it violates: Has form input AND AI processing with promptTemplate. Should separate URL input from AI analysis.

**Stage: multiple-url-grounding**
- Stage ID: `multiple-url-grounding`
- Stage Name: Multiple URL Context Grounding
- Input Type: `textarea`
- Has promptTemplate: YES
- Why it violates: Has textarea input AND AI processing with promptTemplate. Should separate input from AI grounding.

**Stage: thinking-mode-test**
- Stage ID: `thinking-mode-test`
- Stage Name: Thinking Mode Test
- Input Type: `textarea`
- Has promptTemplate: YES
- Why it violates: Has textarea input AND AI processing with promptTemplate. Should separate user input from AI thinking.

**Stage: function-calling-calculator**
- Stage ID: `function-calling-calculator`
- Stage Name: Function Calling - Calculator
- Input Type: `textarea`
- Has promptTemplate: YES
- Why it violates: Has textarea input AND AI processing with promptTemplate. Should separate math input from AI calculation.

**Stage: function-calling-weather**
- Stage ID: `function-calling-weather`
- Stage Name: Function Calling - Weather
- Input Type: `textarea`
- Has promptTemplate: YES
- Why it violates: Has textarea input AND AI processing with promptTemplate. Should separate location input from AI weather lookup.

**Stage: function-calling-unit-converter**
- Stage ID: `function-calling-unit-converter`
- Stage Name: Function Calling - Unit Converter
- Input Type: `textarea`
- Has promptTemplate: YES
- Why it violates: Has textarea input AND AI processing with promptTemplate. Should separate unit input from AI conversion.

**Stage: code-execution-python**
- Stage ID: `code-execution-python`
- Stage Name: Code Execution - Python
- Input Type: `textarea`
- Has promptTemplate: YES
- Why it violates: Has textarea input AND AI processing with promptTemplate. Should separate code input from AI execution.

**Stage: combined-features-test**
- Stage ID: `combined-features-test`
- Stage Name: Combined Features Test
- Input Type: `textarea`
- Has promptTemplate: YES
- Why it violates: Has textarea input AND AI processing with promptTemplate. Should separate test input from AI processing.

### 4. press-release/workflow.json

**Stage: key-facts-generation**
- Stage ID: `key-facts-generation`
- Stage Name: Generate Key Facts
- Input Type: `context`
- Has promptTemplate: YES
- Why it violates: Has context input (dropzone) AND AI generation via promptTemplate. Context gathering should be separate from AI generation.

**Stage: fact-check**
- Stage ID: `fact-check`
- Stage Name: Fact-Checking & Verification
- Input Type: `form`
- Has promptTemplate: YES
- Why it violates: Has form input for fact-checking details AND AI processing via promptTemplate. Should separate human verification input from AI fact-checking.

## Recommended Fix
Each of these stages should be split into two separate stages:
1. A human input stage (form/textarea/context) to collect user data
2. An AI generation stage (inputType: "none") that processes the collected data

This maintains the clear separation between human input collection and AI processing as required by the system architecture.