# Gemini Function Calling in Workflows

This document outlines how to enable and use Gemini's function calling capabilities within the Genkit framework for this application. Function calling allows the AI model to request execution of specific, predefined tools (functions) and use their output to generate a more informed final response.

## 1. Defining Tools (Functions)

Tools are defined as TypeScript functions using Genkit's `defineTool` utility. These should be placed in a dedicated directory, for example, `src/ai/tools/`.

### Example Tool (`src/ai/tools/sample-tools.ts`):

```typescript
import { defineTool } from 'genkit/tool';
import { z } from 'zod';

export const simpleCalculatorTool = defineTool(
  {
    name: 'simpleCalculator',
    description: 'Performs basic arithmetic operations: addition, subtraction, multiplication, division.',
    inputSchema: z.object({
      operation: z.enum(['add', 'subtract', 'multiply', 'divide']),
      a: z.number().describe('The first operand.'),
      b: z.number().describe('The second operand.'),
    }),
    outputSchema: z.object({
      result: z.number().optional(),
      error: z.string().optional(),
    }),
  },
  async (input) => {
    // ... implementation ...
    if (error) return { error };
    return { result };
  }
);

// Export all tools intended for use
export const allTools = [simpleCalculatorTool];
```

## 2. Registering Tools with Genkit

Genkit needs to be aware of the defined tools. This is done in `src/ai/genkit.ts` by passing the tools to the `googleAI` plugin.

```typescript
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import { allTools } from './tools/sample-tools'; // Import your defined tools

export const ai = genkit({
  plugins: [
    googleAI({
      tools: allTools, // Register tools with the plugin
    }),
  ],
  // ... other Genkit configurations ...
});
```

## 3. Configuring Function Calling in Workflows

In your workflow's `workflow.json` file, specify which tools a particular AI stage can use.

### Example Stage Configuration:

```json
{
  "id": "calculator-stage",
  "title": "AI Calculator",
  "description": "Ask the AI to perform a calculation, e.g., 'What is 25 plus 78?'",
  "inputType": "textarea", // User provides a natural language prompt
  "outputType": "text",
  "model": "googleai/gemini-pro", // Ensure model supports function calling
  "promptTemplate": "{{userInput}}", // Pass user input directly as prompt
  "thinkingSettings": {
    "enabled": true // Recommended to see the tool call process
  },
  "toolNames": ["simpleCalculator"] // Names of tools this stage can use
}
```

**Key Fields for Function Calling:**

*   `"toolNames"`: An array of strings, where each string is the `name` of a tool (as defined in `defineTool`) that this stage is allowed to invoke.
*   `"thinkingSettings": { "enabled": true }`: While optional, enabling this is highly recommended to see the tool invocation details (requests and responses) in the UI's "Thinking Process" section.
*   `"model"`: Use a model that supports function calling (e.g., `gemini-pro`, `gemini-1.5-pro-latest`).

## 4. Execution Flow

1.  **User Prompt**: The user provides input to a stage configured with tools.
2.  **Model Request (Tool Call)**: The `aiStageExecution` flow sends the prompt and the list of available tools (filtered by `toolNames`) to the Gemini model. If the model decides to use a tool, it returns a `toolRequest` object.
3.  **Tool Execution**:
    *   The `aiStageExecution` flow identifies the requested tool (e.g., `simpleCalculatorTool`).
    *   It executes the tool's TypeScript function with the arguments provided by the model.
    *   Errors during tool execution are caught and can be returned to the model.
4.  **Model Response (with Tool Result)**: The result (or error) from the tool execution is packaged as a `toolResponse` and sent back to the model.
5.  **Final Answer**: The model processes the tool's response and generates a final text answer. This may involve further tool calls if necessary (up to a configured maximum).

This entire process (tool requests, executions, and responses) is logged as `thinkingSteps` and displayed in the UI if `thinkingSettings.enabled` is true.

## 5. UI Feedback

*   **Thinking Process Card**: When `thinkingSettings.enabled` is true, the "Thinking Process" card in the stage output area will show:
    *   **Tool Call**: The name of the tool the AI wants to call and the input parameters.
    *   **Result from [toolName]**: The output returned by the executed tool.
*   This provides transparency into the function calling process.

## 6. Error Handling

*   If a tool specified in `toolNames` is not found or not registered correctly, an error will occur.
*   If a tool function itself throws an error during execution, this error is caught and can be sent back to the model. The model might then try to correct its approach or return an error message in its final response.

By integrating function calling, you can create more dynamic and powerful AI workflows that can interact with external systems, fetch data, or perform complex calculations as part of their reasoning process.
