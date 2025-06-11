# Gemini Code Execution in Workflows

This document explains how to use Gemini's Code Execution (often referred to as Code Interpreter) capabilities within the application. This feature allows the AI model to execute code (e.g., Python) to perform calculations, data analysis, generate images, and more.

## 1. Enabling Code Execution

Code Execution is typically made available as a built-in tool by the Gemini models.

### a. Genkit Configuration (`src/ai/genkit.ts`)

The Genkit Google AI plugin needs to be configured to allow or enable this built-in tool. This might involve specific options when initializing the `googleAI` plugin.

```typescript
// src/ai/genkit.ts (Example Snippet)
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import { allTools } from './tools/sample-tools'; // Your custom tools

export const ai = genkit({
  plugins: [
    googleAI({
      tools: allTools, // Custom tools
      // Hypothetical option to enable built-in tools like code interpreter:
      allowBuiltInTools: ['codeInterpreter'],
    }),
  ],
  // ... other configurations
});
```
*(Note: The exact option like `allowBuiltInTools` is speculative and depends on the Genkit Google AI plugin's specific API. It might also be enabled by default if the chosen model supports it and no restrictive tool configuration is applied.)*

### b. Workflow Stage Configuration (`workflow.json`)

To allow a specific AI stage to use the Code Interpreter, you must list it in the `toolNames` array for that stage.

```json
// Example stage in workflow.json
{
  "id": "code-execution-stage",
  "title": "AI Code Execution",
  "description": "Provide Python code for the AI to execute.",
  "inputType": "textarea", // User provides code as text
  "outputType": "text",    // The final AI response will be text
  "model": "googleai/gemini-pro", // Or other models supporting code execution
  "promptTemplate": "Execute this Python code and describe the result:\n```python\n{{userInput}}\n```",
  "thinkingSettings": {
    "enabled": true // Essential to see code execution steps
  },
  "toolNames": ["codeInterpreter"] // Enable the code interpreter for this stage
}
```

## 2. Execution Process

1.  **User Input**: The user provides code (e.g., Python snippet) or a prompt that requires code execution.
2.  **Model Request (Tool Call)**: The AI model, if it deems necessary and if the `codeInterpreter` tool is available, will issue a `toolRequest` containing the code to be executed.
3.  **Code Execution (Platform Side)**: The Genkit Google AI plugin (or the underlying Gemini service) executes the code in a sandboxed environment.
    *   This execution can produce various outputs: `stdout`, `stderr`, numerical results, or generated files (like images from Matplotlib).
4.  **Tool Response**: The results of the code execution (stdout, stderr, file references/data) are packaged into a `toolResponse` and sent back to the model.
5.  **Final Answer**: The model processes the code execution results and formulates a final text answer. It might also describe any generated images or data.

This entire interaction (code sent to interpreter, outputs received) is captured in the `thinkingSteps` if `thinkingSettings.enabled` is true.

## 3. Handling Outputs

### a. Textual Output (stdout, stderr, results)

*   The `thinkingSteps` displayed in the UI will show the code executed, any standard output (`stdout`), standard error (`stderr`), and the direct result of the last expression if applicable.

### b. Image Output (e.g., Matplotlib)

*   If the executed code generates images (e.g., using Matplotlib), the `codeInterpreter` tool is expected to return these images.
*   **Current Implementation**: The system attempts to capture these images if they are returned as base64 encoded data with a recognized image MIME type within the `toolResponse.output.outputFiles` array.
*   These extracted images are then stored in `stageState.outputImages` and displayed in a dedicated "Generated Images" card in the UI.
*   *(Note: The exact format in which the code interpreter returns image data (base64 vs. file URI) can vary. The current implementation primarily expects base64 data for direct display.)*

### c. File Inputs

*   Feeding files *into* the code interpreter (e.g., for data analysis) is an advanced use case. It would typically involve:
    1.  Uploading the file using a mechanism like the Gemini Files API (see `docs/document-understanding-in-workflows.md` for initial concepts).
    2.  The uploaded file would receive a URI.
    3.  This URI would be passed to the `codeInterpreter` as part of the code or its parameters, allowing the interpreter to access it.
*   This aspect is not fully implemented in the initial version of code execution support.

## 4. UI Feedback

*   **Thinking Process Card**: Shows the sequence of code execution:
    *   `Tool Call: codeInterpreter` with the input code.
    *   `Result from codeInterpreter` showing `stdout`, `stderr`, and potentially file information.
*   **Generated Images Card**: If images are successfully extracted from the code interpreter's output, they are displayed here.

## 5. Runtime Limits and Error Handling

*   **Runtime Limits**: Code execution is subject to runtime limits imposed by the underlying platform (e.g., Google's code interpreter service). Long-running or resource-intensive code may be terminated.
*   **Error Handling**:
    *   Syntax errors in the provided code or runtime errors during execution are typically caught by the code interpreter.
    *   These errors are returned in the `stderr` field of the `toolResponse`.
    *   The AI model receives these error messages and may use them to try and correct the code or inform the user.

By enabling code execution, workflows can perform dynamic computations, data manipulations, and visualizations, significantly expanding the range of tasks AI can assist with.
