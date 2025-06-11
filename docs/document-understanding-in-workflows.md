# Enabling Document Understanding in Workflows

This document describes how to integrate document understanding capabilities into your Genkit workflows. This allows your AI stages to receive and process content from uploaded documents (e.g., TXT, PDF, DOCX).

## 1. Workflow Configuration (`workflow.json`)

To enable document input for a specific stage in your workflow, configure its `inputType` and provide a suitable `promptTemplate`.

### Example Stage Configuration:

```json
{
  "id": "document-analysis",
  "title": "Analyze Document (Optional)",
  "description": "Upload a document (e.g., PDF, DOCX, TXT) containing supplementary information. AI will attempt to extract relevant text.",
  "inputType": "document",
  "outputType": "json",
  "dependencies": ["dish-name"],
  "promptTemplate": "The user has uploaded a document named '{{document-analysis.userInput.documentName}}' related to '{{dish-name.output}}'. Extract key information from the provided document content: {{document-analysis.userInput.fileContent}}. Summarize the findings. Output as a JSON object with keys 'extractedTextSummary' (string) and 'rawExtractedText' (string).",
  "model": "googleai/gemini-2.0-flash", // Or a model suitable for document content
  "autoRun": false
}
```

**Key Fields:**

*   `"inputType": "document"`: This tells the UI to render a document upload component for this stage.
*   `"promptTemplate"`: Your prompt should instruct the AI on how to process the document content.
    *   `{{document-analysis.userInput.documentName}}`: Accesses the name of the uploaded document.
    *   `{{document-analysis.userInput.fileContent}}`: Accesses the extracted text content of the document. **Note:** Currently, direct text extraction in the browser is primarily supported for plain text files (`.txt`, `.md`). For other formats (PDF, DOCX), `fileContent` may be empty or incomplete in the current implementation phase, and full backend processing via the Files API is intended for future enhancement.
*   `"outputType": "json"` (Recommended): For structured output like summaries or extracted entities.

## 2. UI Component (`StageInputArea.tsx`)

The `StageInputArea.tsx` component has been updated to support `inputType: "document"`:
*   Displays a file input field for selecting documents (accepts `.pdf, .doc, .docx, .txt, .md`).
*   Shows information about the selected file (name, type, size).
*   For plain text files (`text/plain`), it attempts to read the content using `FileReader` and makes it available as `fileContent` in the stage's `userInput`.
*   For other document types, it currently passes metadata (name, type, size). Full content extraction for these types is planned with backend Gemini Files API integration.

The document data passed to `onInputChange` (and thus available in `stageState.userInput`) includes:
```typescript
// For plain text files:
{
  documentName: string;    // e.g., "my-notes.txt"
  documentType: string;    // e.g., "text/plain"
  documentSize: number;    // e.g., 1024 (bytes)
  fileContent: string;     // Extracted text content
}

// For other files (currently, without Files API integration):
{
  documentName: string;    // e.g., "my-document.pdf"
  documentType: string;    // e.g., "application/pdf"
  documentSize: number;    // e.g., 102400 (bytes)
  // fileContent will be undefined or null
}
```

## 3. AI Flow Handling (`aiStageExecution.ts` via `runAiStage.ts`)

*   The `runAiStage` action uses `substitutePromptVars` to fill in the `promptTemplate`.
*   If `fileContent` was successfully extracted by the UI (e.g., for `.txt` files) and is part of `document-analysis.userInput`, it will be injected into the prompt.
*   For document types where `fileContent` is not extracted by the UI, the corresponding placeholder in the prompt will be empty.
*   No separate `documentData` part is currently added to the `ai.generate()` call in `aiStageExecution.ts` in the same way `imageData` is. Document content (when available) is part of the main text prompt.

## 4. Using Document Analysis Output

The JSON output from the `document-analysis` stage (e.g., `document-analysis.output.extractedTextSummary`) can be referenced in subsequent stages' prompts, similar to any other stage output.

## Future Enhancements: Gemini Files API Integration

For robust handling of various document types (PDF, DOCX, etc.) and larger files, integration with the Gemini Files API is planned. This will involve:
1.  Uploading files from the UI to a backend endpoint.
2.  Using the Files API on the backend to store and process these files.
3.  Passing file references (e.g., a `fileUri`) to the AI model, which can then access the content directly.
This will provide more reliable text extraction and allow for processing of documents that are too large or complex for direct browser handling. The prompt templates and AI flow will be updated accordingly when this is implemented.
