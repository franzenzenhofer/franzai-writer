# Gemini Files API Integration

This document describes the integration of the Gemini Files API for handling file uploads (especially complex documents like PDFs) and using these files in AI stages.

## 1. Overview

For large files or document types that cannot be easily processed for text extraction in the browser (e.g., PDFs, DOCX), the Gemini Files API provides a robust way to upload these files and then reference them in prompts to the Gemini models. The model can then process these files directly.

## 2. File Upload Process

### a. Frontend (`StageInputArea.tsx`)

*   When a user selects a file for a stage with `inputType: "document"`:
    *   **Text Files (`.txt`, `.md`)**: For simplicity and immediate use if the content is small, these are still read directly in the browser, and their content is placed in `userInput.fileContent`. The Files API is not used for these by default in the current UI.
    *   **Other Document Types (PDF, DOCX, etc.)**:
        1.  The file is sent to a backend API endpoint (`/api/files/upload`).
        2.  The UI displays an "Uploading..." message.
        3.  Upon successful upload, this endpoint returns a `fileUri` (e.g., `files/your-file-id`), `fileName`, and `mimeType`.
        4.  These details (especially `fileUri`) are stored in the stage's `userInput`. For example:
            ```json
            "userInput": {
              "documentName": "mydoc.pdf",
              "documentType": "application/pdf",
              "fileUri": "files/xxxxxxxxx",
              "documentSize": 123456
            }
            ```
        5.  Error messages are displayed if the upload fails.

### b. Backend API Endpoint (`/api/files/upload/route.ts`)

*   This Next.js API route handles the actual file upload to the Gemini Files API.
*   It receives the file from the frontend.
*   It uses Genkit's Files API abstractions (e.g., `genkit.uploadFile()` - **note: this is currently speculative for Genkit 1.8.0 and is simulated in the endpoint**) or direct Google AI SDK calls to upload the file.
*   It returns the `fileUri`, `fileName`, and `mimeType` of the uploaded file.
*   **(Current Status: The `genkit.uploadFile()` call in this endpoint is simulated. The actual Genkit/SDK call needs to be implemented and verified based on the specific Genkit version's capabilities.)**

## 3. Using Uploaded Files in AI Stages

### a. Workflow Configuration (`workflow.json`)

*   The prompt template for an AI stage that processes an uploaded file should refer to the file indirectly (e.g., by mentioning that a document has been provided) rather than expecting its full content inline via `fileContent` if it's a non-TXT file.
*   The model used should be capable of understanding File API URIs (e.g., `gemini-1.5-pro-latest`).

Example stage:
```json
{
  "id": "document-analysis-via-uri",
  "title": "Analyze Uploaded Document",
  "description": "Upload a PDF or DOCX. AI will analyze it using its File API URI.",
  "inputType": "document",
  "outputType": "json",
  "model": "googleai/gemini-1.5-pro-latest",
  "promptTemplate": "A document titled '{{document-analysis-via-uri.userInput.documentName}}' (MIME type: {{document-analysis-via-uri.userInput.documentType}}) has been uploaded and is available via its URI. Please analyze this document and provide a summary.",
  // No toolNames needed if the model processes fileData parts directly
}
```

### b. AI Flow (`aiStageExecution.ts`)

*   The `runAiStage` action extracts `fileUri` and `documentType` (as `mimeType`) from the stage's `userInput`.
*   These are passed to `aiStageExecution` as `fileInputs`.
*   `aiStageExecution` constructs special `Part` objects for these files in the format `{ fileData: { uri: string, mimeType: string } }`.
*   These file parts are included in the prompt sent to `ai.generate()`. The Gemini model then accesses and processes these files using their URIs.

## 4. Caching and File Reuse

*   The Gemini Files API typically handles de-duplication of identical files on its end. Uploading the same file multiple times might result in the same underlying stored file and ID.
*   Application-level caching of `fileUri` against a content hash of the file could be an optimization to prevent re-uploading the same file bytes from the client, but this is not implemented in the initial version.

## 5. Current Limitations & Future Work

*   **`genkit.uploadFile()` Simulation**: The backend file upload endpoint currently *simulates* the call to `genkit.uploadFile()`. This needs to be replaced with actual, verified Genkit or Google AI SDK calls.
*   **Error Handling for Uploads**: Basic error handling is present, but more robust retry mechanisms or detailed error reporting could be added.
*   **Upload Progress**: UI feedback for uploads is currently basic text messages. Richer progress bar display is not yet implemented.
*   **File Management UI**: There is no UI to view, manage, or delete uploaded files from the Gemini Files API storage. This would be a separate feature.

This integration allows workflows to leverage the power of Gemini for processing complex file types that are not suitable for direct in-browser text extraction or for passing very large text content in prompts.
