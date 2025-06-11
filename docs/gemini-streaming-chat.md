# Gemini Streaming and Chat Support in Workflows

This document describes how to enable and use streaming output and chat capabilities with Gemini models in your workflows.

## 1. Overview

*   **Streaming**: For AI stages that generate long text, streaming allows the output to be displayed token-by-token in real-time, improving perceived performance.
*   **Chat Mode**: For conversational AI stages, chat mode enables the maintenance of conversation history. Each new input from the user is considered in the context of previous turns.

## 2. Workflow Configuration (`workflow.json`)

To enable chat mode and provide system-level instructions for a stage:

```json
{
  "id": "chat-test-stage",
  "title": "Chat with AI",
  "description": "Have a conversation with the AI.",
  "inputType": "textarea", // User input is the current chat message
  "outputType": "text",    // Final AI response (also part of chat history)
  "model": "googleai/gemini-pro", // Or other chat-optimized models
  "thinkingSettings": { "enabled": true }, // Optional, to see tool use if any
  "chatEnabled": true,
  "systemInstructions": "You are a helpful assistant. Be concise."
}
```

**Key Fields:**

*   `"chatEnabled": true`: Enables chat mode for the stage.
    *   The UI will adapt (e.g., input area for messages, display of chat transcript).
    *   Conversation history will be maintained for this stage.
*   `"systemInstructions": "Your instructions here"`: An optional string that provides system-level guidance to the AI for its behavior throughout the chat session (e.g., its persona, response style).

**Streaming Configuration:** Streaming is primarily handled by the AI flow logic (`aiStageExecution.ts`) using `ai.stream()` when making requests to the Gemini model. There isn't a separate `workflow.json` flag to enable/disable streaming itself; it's inherent to how the AI call is made for (potentially all) AI stages.

## 3. Execution Flow (Chat & Streaming)

### a. Backend (`aiStageExecution.ts`)

*   **Chat History Management**:
    *   The `aiStageExecutionFlow` now accepts an optional `chatHistory` array as input.
    *   The current user prompt (from `promptTemplate` and other inputs like images/files) is appended to this history as a "user" turn.
    *   `systemInstructions` are also incorporated into the request to the model (typically by prepending to the history or as a dedicated system prompt parameter if the Genkit plugin supports it).
    *   The full history (including system instructions) is sent to the Gemini model via `ai.stream()`.
    *   The model's response (text, tool calls) is processed. The final textual response is added to the history as a "model" turn.
    *   The `updatedChatHistory` is returned by the flow.
*   **Streaming (`ai.stream()`):**
    *   The flow uses `ai.stream()` to make the call to the Gemini model.
    *   It iterates over chunks received from the stream (`for await (const chunk of stream)`).
    *   `chunk.content`: Text content from the stream is accumulated.
    *   `chunk.toolRequests`: If the model requests tool calls during the stream, these are processed (see Function Calling documentation).
    *   **`streamingCallback`**: The `aiStageExecutionFlow` has a `streamingCallback` parameter. As chunks arrive (text, tool requests, tool responses, image generation), this callback is invoked with the partial data.
*   **Final Output**: The flow returns the fully accumulated text content from the stream, any generated images, thinking steps, and the complete `updatedChatHistory`.

### b. Action Layer (`runAiStage` in `aiActions.ts`)

*   Accepts `systemInstructions` and `chatHistory` from the stage definition/state.
*   Passes them to `aiStageExecutionFlow`.
*   Returns `updatedChatHistory` to the caller (`WizardShell`).
*   **(Current Streaming Limitation):** `runAiStage` as a Next.js Server Action is promise-based and returns the *final* aggregated response from `aiStageExecutionFlow`. It does not currently stream chunks back to the client (e.g., `WizardShell`). Therefore, real-time token-by-token display in the UI is not yet active via this action. The `streamingCallback` in the flow is primarily for Genkit-internal use or future streaming API routes.

### c. UI State (`WizardShell.tsx`)

*   Manages `chatHistory` and `currentStreamOutput` (for the currently generating response) within each `StageState`.
*   When a chat-enabled stage is run:
    *   Sends the current `chatHistory` and `systemInstructions` to `runAiStage`.
    *   Receives the `updatedChatHistory` and the final `content` from `runAiStage`.
    *   Updates its `StageState` with the new history and clears `currentStreamOutput`.
*   **(Streaming UI Update - Conceptual for Server Actions):** If `runAiStage` could stream, `WizardShell` would implement a client-side handler for the stream. This handler would receive chunks from `runAiStage` (forwarded from `aiStageExecutionFlow`'s `streamingCallback`) and update `stageState.currentStreamOutput` and other relevant fields (like `thinkingSteps`, `outputImages`) incrementally.

## 4. UI Display

### a. `StageInputArea.tsx`

*   If `stage.chatEnabled` is true:
    *   The textarea for input is typically smaller (e.g., 3 rows).
    *   The "Run AI" button text changes to "Send" (or similar chat-appropriate text).

### b. `StageOutputArea.tsx`

*   If `stage.chatEnabled` is true:
    *   The primary display becomes the chat transcript, rendered from `stageState.chatHistory`. Each message is styled according to its role (user/model).
    *   **(Conceptual Streaming Display):** If live streaming to the client were active, `stageState.currentStreamOutput` would be appended to the last model message in the transcript, often with a pulsing cursor or similar indicator. Since `runAiStage` currently doesn't stream to the client, this part is not visually active in real-time; the UI updates once the full response is received.
*   Thinking steps and generated images are displayed as usual below the main output area (which, for chat, is the transcript).

## 5. Key Considerations

*   **Model Choice**: Use models designed or fine-tuned for chat interactions for best results in `chatEnabled` stages (e.g., `gemini-pro`).
*   **History Length**: Long chat histories will consume more tokens. Consider strategies for truncating or summarizing history for very long conversations if token limits become an issue.
*   **System Prompt Engineering**: Effective `systemInstructions` are crucial for guiding the AI's persona and behavior in chat mode.
*   **Streaming UI Implementation**: True token-by-token streaming to the end-user requires a streaming-capable backend (e.g., API route returning a `ReadableStream`) and client-side logic to handle the stream. The current Server Action based `runAiStage` does not provide this end-to-end streaming to the UI.

This setup provides the foundation for both streaming AI responses and maintaining conversational context in chat-enabled workflow stages.
