# Gemini Thinking Mode and Tool Use

This document explains how to enable and use "Thinking Mode" (often related to tool use or function calling) with Gemini models within the Genkit framework for this application. This mode allows the AI to output intermediate steps, reasoning processes, or tool invocation details, providing insight into its decision-making.

## 1. Enabling Thinking Mode for a Stage

Thinking Mode is configured on a per-stage basis within your workflow's `workflow.json` file.

### Example Stage Configuration:

```json
{
  "id": "seo-keywords-recipe",
  "title": "Suggest SEO Keywords",
  "description": "AI will suggest relevant SEO keywords for your recipe.",
  "inputType": "none",
  "promptTemplate": "...",
  "model": "googleai/gemini-2.0-flash", // Or other compatible models
  "outputType": "json",
  "thinkingSettings": {
    "enabled": true
    // "budget": 100 // Conceptual: Future setting for controlling "thinking" resource usage
  },
  "dependencies": ["dish-name", "cuisine-type"],
  "autoRun": true
}
```

**Key Field:**

*   `"thinkingSettings"`: An optional object within a stage definition.
    *   `"enabled": true`: Set to `true` to request thinking steps/tool use information from the model for this stage. If omitted or `false`, the mode is disabled.

## 2. How It Works

*   **Backend Logic**:
    *   When a stage with `thinkingSettings.enabled: true` is processed, the application's backend (`aiStageExecution` flow) passes specific parameters to the Gemini model via the Genkit `ai.generate()` call.
    *   (Current Implementation Note: A hypothetical `enableThinking: true` flag is added to the model's configuration. The actual mechanism for enabling detailed reasoning or tool use with the `googleAI` Genkit plugin might involve more specific parameters, such as providing a list of available tools/functions for the model to use.)
    *   The AI's response may include additional data representing its thinking process, intermediate steps, or tool calls. This data is extracted and stored.

*   **Data Flow**:
    1.  `workflow.json` defines `thinkingSettings` for a stage.
    2.  `WizardShell.tsx` reads these settings and passes them to `runAiStage` action.
    3.  `runAiStage` (in `aiActions.ts`) passes them to the `aiStageExecution` Genkit flow.
    4.  `aiStageExecution` attempts to configure the AI call to elicit thinking/tool use and extracts these steps from the response.
    5.  The extracted `thinkingSteps` are returned to `WizardShell.tsx` and stored in the `StageState`.

## 3. Displaying Thinking Steps in the UI

*   If `thinkingSteps` are available in the `StageState` for a completed stage, they will be displayed in the "Thinking Process" card within the stage's output area (`StageOutputArea.tsx`).
*   Each step or tool call is typically shown in a pre-formatted block.
    *   (Current Implementation Note: The exact format of these steps depends on what the model returns. The UI currently renders them as an array of strings.)

## 4. Pricing and Token Implications

*   **Increased Token Usage**: Enabling thinking mode or tool use will likely increase token consumption. The model needs to generate not only the final answer but also the intermediate reasoning, tool calls, and potentially receive tool responses.
*   **"Thinking Budget"**: While a `budget` property is conceptual in `thinkingSettings` for now, be mindful that extensive reasoning or multiple tool calls can significantly add to the token count for a single prompt.
*   **Model Specifics**: Different Gemini models might have different pricing structures for input tokens, output tokens, and potentially for tool usage or specialized "thinking" tokens. Consult the official Google Cloud pricing documentation for the specific model(s) you are using.
*   **Monitor Usage**: Keep an eye on your token consumption when using this feature, especially for complex tasks or stages that frequently invoke thinking processes.

## 5. Best Practices and Considerations

*   **Use When Needed**: Enable thinking mode for stages where understanding the AI's process is valuable for debugging, transparency, or when the task inherently requires multi-step reasoning or tool interaction. Avoid enabling it unnecessarily for simple, direct prompts.
*   **Interpret with Care**: The "thoughts" are the model's internal reasoning or tool interactions. They can be verbose or highly technical.
*   **Tool Definition (Future Scope)**: For more advanced scenarios, Genkit allows defining specific tools (functions) that the AI can call. "Thinking Mode" in such cases would involve the AI deciding to call these functions, and the "thoughts" would include the function call details and their results. The current implementation is more focused on a generic "show your work" feature.
*   **Iterate on Prompts**: If the thinking steps are not helpful or the AI is not reasoning as expected, you may need to refine your prompt to guide its process more effectively.

By understanding these aspects, you can leverage Gemini's thinking/tool use capabilities to build more transparent, debuggable, and potentially more powerful AI-driven workflows.
