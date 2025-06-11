# Enabling Image Understanding in Workflows

This document describes how to integrate image understanding capabilities into your Genkit workflows. This allows your AI stages to receive and process images, enabling use cases like image description, analysis, and multimodal content generation.

## 1. Workflow Configuration (`workflow.json`)

To enable image input for a specific stage in your workflow, you need to configure its `inputType` and provide a suitable `promptTemplate`.

### Example Stage Configuration:

```json
{
  "id": "image-analysis",
  "title": "Analyze Dish Image (Optional)",
  "description": "Upload an image of your dish. AI will analyze it to understand its appearance, ingredients, and presentation.",
  "inputType": "image",
  "outputType": "json",
  "dependencies": ["dish-name"],
  "promptTemplate": "Analyze the provided image of '{{dish-name.output}}'. Describe the dish's appearance, visible ingredients, and overall presentation. If possible, identify key components and their arrangement. Output as a JSON object with a key 'imageDescription' (string) and 'identifiedObjects' (array of strings).",
  "model": "googleai/gemini-2.0-flash", // Or any other vision-capable model
  "autoRun": false
}
```

**Key Fields:**

*   `"inputType": "image"`: This tells the UI to render an image upload component for this stage.
*   `"promptTemplate"`: Your prompt should instruct the AI on how to process the image. The image will be implicitly available to the model when `inputType` is `"image"`.
*   `"outputType": "json"` (Recommended): For image analysis, it's often useful to structure the output as JSON (e.g., descriptions, object lists).
*   `"model"`: Ensure you are using a model that supports vision or multimodal inputs (e.g., Gemini models).

## 2. UI Component (`StageInputArea.tsx`)

The `StageInputArea.tsx` component has been updated to support `inputType: "image"`. It will:
*   Display a file input field for selecting images.
*   Show a preview of the selected image.
*   Convert the image to a base64-encoded string and prepare it in the format expected by the AI backend.

The image data is passed as an object with the following structure to the AI flow:
```typescript
{
  fileName: string; // e.g., "my-dish.jpg"
  mimeType: string; // e.g., "image/jpeg"
  data: string;     // Base64 encoded image data (without the 'data:mime/type;base64,' prefix)
  imageUrl?: string; // Full data URL for preview reloading (e.g. "data:image/jpeg;base64,...")
}
```

## 3. AI Flow Handling (`aiStageExecution.ts`)

The `aiStageExecution` flow is designed to handle multimodal inputs.
*   It checks if `imageData` is provided with the prompt.
*   If `imageData` is present, it constructs a prompt array with both text (from `promptTemplate`) and image parts.
    *   The text part is `{ text: "Your prompt here..." }`.
    *   The image part is `{ inlineData: { mimeType: "image/jpeg", data: "base64..." } }`.
*   This array of parts is then sent to the Genkit `ai.generate()` function.

## 4. Using Image Analysis Output in Subsequent Stages

The output of an image analysis stage (e.g., `image-analysis.output.imageDescription`) can be used in the `promptTemplate` of subsequent stages, just like any other stage output.

### Example: Referencing Image Description
```json
{
  "id": "enhanced-description",
  "title": "Generate Enhanced Description",
  "promptTemplate": "Based on the dish '{{dish-name.output}}' and its visual appearance described as '{{image-analysis.output.imageDescription}}', write a more detailed and appealing marketing text.",
  "dependencies": ["dish-name", "image-analysis"],
  // ... other fields
}
```

This allows you to build sophisticated workflows that combine text, user inputs, and image understanding to generate rich content.
