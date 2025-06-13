Okay, here is the JIRA EPIC and detailed tickets to implement the requested Gemini features into your application.

---

**JIRA EPIC**

**EPIC ID:** GEMINI-ULTIMATE-ENHANCEMENT
**EPIC Name:** Integrate Advanced Gemini Capabilities for Next-Generation AI Features

**Reporter:** Franzenzenhofer
**Assignee:** Engineering Team
**Priority:** Highest

**Summary:**
This EPIC outlines the work required to integrate a suite of advanced Google Gemini API features into our application, specifically focusing on Grounding with Google Search, URL Context, robust Function Calling, Streaming, and Code Execution. The goal is to leverage these capabilities to enhance our product's intelligence, context-awareness, and versatility, ensuring we deliver cutting-edge solutions.

All implementations must be in TypeScript, adhere to our coding standards (lint-perfect, type-safe), and be robust. We will exclusively support Gemini 2.0+ model implementations for features that have different systematics across model versions (e.g., Grounding). Clear error handling for model incompatibility or feature limitations is crucial. Implementations should also be forward-compatible with upcoming Gemini 2.5 models.

**Core Files to be Modified:**
*   `/ai/flows/ai-stage-execution.ts` (Primary logic)
*   `/ai/flows/ai-stage-execution.test.ts` (Unit tests)
*   `/ai/tools/tool-definitions.ts` (If tool definitions need adjustments)
*   `/ai/genkit.ts` (If Genkit config/plugins need updates for new features)

**Acceptance Criteria for EPIC:**
1.  All child User Stories are completed, tested, and merged.
2.  The application successfully utilizes Grounding, URL Context, Function Calling, Streaming, and Code Execution via the `aiStageExecutionFlow`.
3.  Implementations strictly use Gemini 2.0+ approaches where version differences exist.
4.  Comprehensive error handling is in place for model/feature incompatibilities.
5.  The `AiStageOutputSchema` in `ai-stage-execution.ts` accurately reflects all new data points from these features.
6.  Code is well-documented, follows KISS and DRY principles, and is easy for junior developers to understand and maintain.
7.  All new functionalities are covered by unit tests.

---

**USER STORIES / TICKETS:**

---

**Ticket ID:** FEAT-GEMINI-201
**Title:** Implement Grounding with Google Search (Gemini 2.0+ "Search as Tool")
**Status:** Open
**Reporter:** Franzenzenhofer
**Assignee:** Junior Dev
**Parent EPIC:** GEMINI-ULTIMATE-ENHANCEMENT

**Description:**
Enhance the `aiStageExecutionFlow` to support Grounding with Google Search using the Gemini 2.0+ "Search as Tool" mechanism. This involves configuring the Gemini API call to use Google Search as a tool and processing the grounding metadata returned in the response. The implementation must only support the Gemini 2.0+ method for grounding.

**Acceptance Criteria:**
1.  When `groundingSettings.googleSearch.enabled` or `forceGoogleSearchGrounding` is true in `AiStageExecutionInput`, Google Search grounding is activated.
2.  The implementation MUST use the "Search as Tool" approach for Gemini 2.0+ models (e.g., `gemini-2.0-flash`, `gemini-2.5-flash`). This involves adding `{ googleSearch: {} }` to the `tools` array in the API request.
3.  The `temperature` for the API call MUST be set to `0.0` when grounding is enabled, as recommended by Google.
4.  The system instruction for grounding guidance (`groundingSystemInstruction`) MUST be added to the prompt when grounding is active.
5.  The `AiStageOutputSchema`'s `groundingMetadata` field MUST be populated with the full structure from the API response, including `searchEntryPoint` (with `renderedContent`), `groundingChunks` (with `web.uri` and `web.title`), `groundingSupports` (with `segment`, `groundingChunkIndices`, `confidenceScores`), and `webSearchQueries`.
6.  The `extractGroundingMetadata` helper function in `ai-stage-execution.ts` must be updated to correctly parse this detailed structure.
7.  If a model that does not support Search as Tool (e.g., older models, or if the specified model string indicates a non-2.0+ family) is used with grounding enabled, the flow should throw a clear, informative error (e.g., "Google Search Grounding (Search as Tool) is not supported by model 'X'. Please use a Gemini 2.0+ model.").
8.  The legacy Gemini 1.5 `googleSearchRetrieval` and `dynamicRetrievalConfig` logic MUST be removed from `ai-stage-execution.ts` or explicitly throw an error indicating it's unsupported.
9.  Unit tests in `ai-stage-execution.test.ts` must verify:
    *   Correct tool configuration for grounding.
    *   Correct parsing of `groundingMetadata`.
    *   Error handling for incompatible models.
    *   Temperature override to 0.0.
    *   Inclusion of `groundingSystemInstruction`.

**Technical Notes:**
*   **File:** `/ai/flows/ai-stage-execution.ts`
*   **Key Functions/Areas:**
    *   Modify the section where `shouldEnableGoogleSearch` is handled.
    *   Ensure `generateOptions.tools.push({ googleSearch: {} });` is correctly added.
    *   Update `extractGroundingMetadata` function.
    *   Update `AiStageOutputSchema` for `groundingMetadata`.
*   Refer to Google's documentation on Grounding (specifically "Search as a Tool" for Gemini 2.0+ models) and the structure of `groundingMetadata` (from browsed content like `/docs/grounding?lang=python`).
*   The current `ai-stage-execution.ts` has a good starting point for `isGemini20Plus` and adding the Google Search tool. Focus on refining the output parsing and removing 1.5 specific logic.

**TypeScript Code Snippets (Illustrative for `/ai/flows/ai-stage-execution.ts`):**

```typescript
// --- In AiStageOutputSchema within ai-stage-execution.ts ---
// Ensure groundingMetadata matches the detailed structure
groundingMetadata: z.object({
  searchEntryPoint: z.object({
    renderedContent: z.string().describe('HTML/CSS for rendering Google Search Suggestions. Display this as-is.'),
    // Add other fields from searchEntryPoint if necessary based on API response
  }).optional(),
  groundingChunks: z.array(z.object({
    web: z.object({
      uri: z.string().describe('The URI of the grounding source. These are redirect URLs.'),
      title: z.string().describe('The title of the web page from the grounding source.'),
    }),
    // Add other chunk types if relevant, e.g., 'retrievedContext'
  })).optional(),
  groundingSupports: z.array(z.object({
    segment: z.object({
      startIndex: z.number().optional().describe('Start index of the segment in the response text.'),
      endIndex: z.number().describe('End index of the segment in the response text.'),
      text: z.string().describe('The text segment that is supported by grounding.'),
    }),
    groundingChunkIndices: z.array(z.number()).describe('Indices into the groundingChunks array.'),
    confidenceScores: z.array(z.number()).optional().describe('Confidence scores for the grounding.'),
  })).optional(),
  webSearchQueries: z.array(z.string()).optional().describe('Suggested search queries related to the response.'),
}).optional(),

// --- In aiStageExecutionFlow, where grounding is configured ---
if (shouldEnableGoogleSearch) {
  const modelName = modelToUse.toLowerCase();
  // Ensure we only support 2.0+ models for "Search as Tool"
  const isGemini20Plus = modelName.includes('gemini-2.0') || modelName.includes('gemini-2.5') || modelName.includes('gemini-pro') || modelName.includes('gemini-flash'); // Add more robust check if needed

  if (isGemini20Plus) {
    console.log('[AI Stage Flow Enhanced] Enabling Google Search grounding for Gemini 2.0+ model using Search as Tool');
    if (!generateOptions.tools) {
      generateOptions.tools = [];
    }
    // Check if googleSearch tool is already added to prevent duplicates
    if (!generateOptions.tools.some((tool: any) => tool.googleSearch !== undefined)) {
        generateOptions.tools.push({ googleSearch: {} });
    }
    generateOptions.config.temperature = 0.0; // Recommended for grounding
    currentThinkingSteps.push({ type: 'textLog', message: `Google Search grounding enabled (Search as Tool) for model ${modelToUse}. Temperature set to 0.0.` });

    const groundingSystemInstruction = "IMPORTANT: You have access to Google Search. When answering questions that require current information or specific facts, use Google Search to find up-to-date information. Cite your sources from the search results. Do NOT generate code to search; use the built-in Google Search capability.";
    if (systemInstructions) {
        systemInstructions = `${systemInstructions}\n\n${groundingSystemInstruction}`;
    } else {
        systemInstructions = groundingSystemInstruction;
    }
    // Re-apply system instructions if modified
    if (systemInstructions) {
        if (callHistory.length > 0 && callHistory[0].role === 'system') {
            callHistory[0] = { role: 'system', parts: [{ text: systemInstructions }] };
        } else {
            callHistory.unshift({ role: 'system', parts: [{ text: systemInstructions }] });
        }
    }
    console.log('[AI Stage Flow Enhanced] Enhanced system instructions with grounding guidance for Search as Tool.');

  } else {
    // Unsupported model for the required grounding type
    console.error(`[AI Stage Flow Enhanced] Google Search Grounding (Search as Tool) is NOT supported for model '${modelToUse}'. This feature requires a Gemini 2.0+ model.`);
    // Option 1: Throw an error
    throw new Error(`Google Search Grounding (Search as Tool) is not supported by model '${modelToUse}'. Please use a Gemini 2.0+ model (e.g., gemini-2.0-flash, gemini-2.5-flash).`);
    // Option 2: Log and continue without grounding, or return a specific error structure in the output.
    // For this ticket, throwing an error is preferred to enforce the "2.0+ only" rule.
  }
  // Remove any 1.5 specific grounding logic. Example:
  // if (generateOptions.config.googleSearchRetrieval) {
  //   delete generateOptions.config.googleSearchRetrieval;
  //   console.log('[AI Stage Flow Enhanced] Removed legacy googleSearchRetrieval config.');
  // }
}

// --- Update extractGroundingMetadata function ---
function extractGroundingMetadata(response: any): AiStageOutputSchema['groundingMetadata'] {
  // The actual grounding metadata might be nested differently by the Genkit SDK
  // Check common locations: response.metadata.groundingMetadata, response.groundingMetadata, response.response?.groundingMetadata
  const rawMetadata = response.groundingMetadata || response.response?.groundingMetadata || response.metadata?.groundingMetadata;

  if (!rawMetadata) {
      console.log('[AI Stage Flow Enhanced] No raw grounding metadata found in the response object.');
      return undefined;
  }
  console.log('[AI Stage Flow Enhanced] Raw grounding metadata found:', JSON.stringify(rawMetadata, null, 2));

  // Defensive check for crucial parts
  if (!rawMetadata.searchEntryPoint && !rawMetadata.webSearchQueries && !rawMetadata.groundingChunks) {
      console.log('[AI Stage Flow Enhanced] Raw metadata does not contain expected grounding fields (searchEntryPoint, webSearchQueries, groundingChunks).');
      return undefined;
  }
  
  const extracted: AiStageOutputSchema['groundingMetadata'] = {
    searchEntryPoint: rawMetadata.searchEntryPoint ? {
      renderedContent: rawMetadata.searchEntryPoint.renderedContent || '',
      // map other searchEntryPoint fields if they exist
    } : undefined,
    groundingChunks: (rawMetadata.groundingChunks || []).map((chunk: any) => ({
      web: {
        uri: chunk.web?.uri || (typeof chunk.uri === 'string' ? chunk.uri : ''), // Handle slightly different structures
        title: chunk.web?.title || (typeof chunk.title === 'string' ? chunk.title : ''),
      },
    })).filter((chunk:any) => chunk.web.uri), // Filter out empty chunks
    groundingSupports: (rawMetadata.groundingSupports || []).map((support: any) => ({
      segment: {
        startIndex: support.segment?.startIndex,
        endIndex: support.segment?.endIndex,
        text: support.segment?.text || '',
      },
      groundingChunkIndices: support.groundingChunkIndices || [],
      confidenceScores: support.confidenceScores || [],
    })),
    webSearchQueries: rawMetadata.webSearchQueries || [],
  };

  // Only return the object if it has meaningful data
  if (extracted.webSearchQueries?.length || extracted.groundingChunks?.length || extracted.searchEntryPoint?.renderedContent) {
      console.log('[AI Stage Flow Enhanced] Successfully extracted grounding metadata:', JSON.stringify(extracted, null, 2));
      return extracted;
  }
  console.log('[AI Stage Flow Enhanced] Extracted grounding metadata was empty.');
  return undefined;
}
```

---

**Ticket ID:** FEAT-GEMINI-202
**Title:** Implement URL Context using Gemini Tool
**Status:** Open
**Reporter:** Franzenzenhofer
**Assignee:** Junior Dev
**Parent EPIC:** GEMINI-ULTIMATE-ENHANCEMENT

**Description:**
Integrate the Gemini API's URL Context tool into the `aiStageExecutionFlow`. This feature allows the model to retrieve content from specified URLs and use it as context for generating responses. The current manual URL fetching logic in `ai-stage-execution.ts` should be replaced by this tool-based approach. This feature is typically available on newer models (e.g., Gemini 2.5 series, and some 2.0 models like `gemini-2.0-flash` as per documentation).

**Acceptance Criteria:**
1.  If `groundingSettings.urlContext.enabled` is true and `groundingSettings.urlContext.urls` are provided in `AiStageExecutionInput`, the URL Context tool is activated.
2.  The implementation MUST use the Gemini native URL Context tool by adding `{ urlContext: {} }` to the `tools` array in the API request for compatible models. The URLs themselves are typically passed within the user's prompt text.
3.  The existing manual URL fetching and content appending logic within `aiStageExecutionFlow` MUST be removed.
4.  The `AiStageOutputSchema` MUST include a new field, `urlContextMetadata`, to store the metadata returned by the URL Context tool (e.g., retrieved URLs and their status). This should be based on the `url_context_metadata` structure from the Gemini API documentation.
5.  If the selected model does not support the URL Context tool, the flow should throw a clear, informative error (e.g., "URL Context tool is not supported by model 'X'. Please use a compatible model like gemini-2.5-flash-preview or check model documentation."). Note: `gemini-2.0-flash` also supports it according to `/docs/url-context`.
6.  The `promptTemplate` should be constructed to include the URLs in a way the model understands it needs to process them (e.g., "Summarize the content from URL1: [URL1] and URL2: [URL2]").
7.  Unit tests in `ai-stage-execution.test.ts` must verify:
    *   Correct tool configuration for URL Context.
    *   URLs are correctly passed in the prompt.
    *   Parsing of `urlContextMetadata`.
    *   Error handling for incompatible models.
    *   Removal of old manual URL fetching logic.

**Technical Notes:**
*   **File:** `/ai/flows/ai-stage-execution.ts`
*   **Key Functions/Areas:**
    *   Modify how `groundingSettings.urlContext` is handled.
    *   Add `{ urlContext: {} }` to `generateOptions.tools`.
    *   Remove the `fetch('/api/fetch-url', ...)` loop.
    *   Add `urlContextMetadata` to `AiStageOutputSchema` and populate it.
*   Refer to Google's documentation on URL Context (`/docs/url-context`).
*   Model Compatibility: `gemini-2.5-pro-preview-06-05`, `gemini-2.5-flash-preview-05-20`, `gemini-2.0-flash`, `gemini-2.0-flash-live-001`.

**TypeScript Code Snippets (Illustrative for `/ai/flows/ai-stage-execution.ts`):**

```typescript
// --- In AiStageOutputSchema within ai-stage-execution.ts ---
urlContextMetadata: z.object({
  urlMetadata: z.array(z.object({
    retrievedUrl: z.string().describe('The URL from which content was retrieved (may be a redirect).'),
    urlRetrievalStatus: z.string().describe('Status of the URL retrieval (e.g., URL_RETRIEVAL_STATUS_SUCCESS, URL_RETRIEVAL_STATUS_UNSPECIFIED).'),
    // originalUrl: z.string().optional().describe('The original URL provided if different from retrievedUrl.'), // If API provides this
  })).optional(),
}).optional(),

// --- In aiStageExecutionFlow, where URL context is configured ---
// REMOVE this existing block:
/*
if (groundingSettings?.urlContext?.enabled && groundingSettings.urlContext.urls.length > 0) {
  try {
    console.log('[AI Stage Flow Enhanced] Fetching URL context:', groundingSettings.urlContext.urls);
    for (const url of groundingSettings.urlContext.urls) {
      // ... manual fetch logic ...
    }
  } catch (error) {
    console.error('[AI Stage Flow Enhanced] URL grounding failed:', error);
  }
}
*/

// ADD new logic for URL Context Tool:
if (groundingSettings?.urlContext?.enabled && groundingSettings.urlContext.urls.length > 0) {
  const modelName = modelToUse.toLowerCase();
  // Check for models known to support URL Context Tool
  const supportsUrlContextTool = modelName.includes('gemini-2.5') || modelName.includes('gemini-2.0-flash'); // Add other compatible models

  if (supportsUrlContextTool) {
    console.log('[AI Stage Flow Enhanced] Enabling URL Context tool for model:', modelToUse);
    if (!generateOptions.tools) {
      generateOptions.tools = [];
    }
    // Ensure URL Context tool is added if not present
    if (!generateOptions.tools.some((tool: any) => tool.urlContext !== undefined)) {
        generateOptions.tools.push({ urlContext: {} });
    }
    
    // URLs should be part of the promptTemplate, ensure they are present.
    // Example: promptTemplate might be "Analyze these pages: {{urls}}"
    // And input.promptTemplate is "Analyze these pages: https://example.com/page1 https://example.com/page2"
    // The URLs from groundingSettings.urlContext.urls should be embedded in the prompt by the calling system or here.
    // For simplicity, we assume URLs are already in promptTemplate or need to be added.
    // A common pattern is to list them in the prompt.
    let urlsString = groundingSettings.urlContext.urls.join(" ");
    if (promptTemplate.includes("{{urls}}")) { // If a placeholder exists
        promptTemplate = promptTemplate.replace("{{urls}}", urlsString);
    } else { // Append if no placeholder
        promptTemplate += `\n\nRefer to the following URLs for context: ${urlsString}`;
    }
     // Re-build prompt parts if promptTemplate changed
    currentPromptMessageParts.length = 0; // Clear existing parts
    if (promptTemplate) currentPromptMessageParts.push({ text: promptTemplate });
    if (imageData?.data) currentPromptMessageParts.push({ inlineData: { mimeType: imageData.mimeType, data: imageData.data } });
    if (fileInputs?.length) fileInputs.forEach((file: any) => currentPromptMessageParts.push({ fileData: { uri: file.uri, mimeType: file.mimeType } }));

    // Re-build callHistory with updated prompt
    callHistory = chatHistory ? [...chatHistory] : [];
    if (currentPromptMessageParts.length > 0) {
        callHistory.push({ role: 'user', parts: currentPromptMessageParts });
    }
    // Re-apply system instructions if they were set
    if (systemInstructions) {
        if (callHistory.length > 0 && callHistory[0].role === 'system') {
            callHistory[0] = { role: 'system', parts: [{ text: systemInstructions }] };
        } else {
            callHistory.unshift({ role: 'system', parts: [{ text: systemInstructions }] });
        }
    }

    currentThinkingSteps.push({ type: 'textLog', message: `URL Context tool enabled. URLs provided in prompt for model ${modelToUse}.` });
  } else {
    console.error(`[AI Stage Flow Enhanced] URL Context tool is NOT supported for model '${modelToUse}'.`);
    throw new Error(`URL Context tool is not supported by model '${modelToUse}'. Please use a compatible model (e.g., gemini-2.5-flash, gemini-2.0-flash).`);
  }
}

// --- In executeWithStreaming or executeSimpleGeneration, after getting API response ---
// const response = await ai.chat(...) or await ai.generate(...)

// Extract URL Context Metadata
// The exact location might vary based on Genkit SDK, check response.urlContextMetadata or response.metadata.urlContextMetadata etc.
const rawUrlContextMetadata = response.urlContextMetadata || response.response?.urlContextMetadata || response.metadata?.urlContextMetadata;
let parsedUrlContextMetadata: AiStageOutputSchema['urlContextMetadata'];

if (rawUrlContextMetadata && rawUrlContextMetadata.urlMetadata) {
  parsedUrlContextMetadata = {
    urlMetadata: rawUrlContextMetadata.urlMetadata.map((meta: any) => ({
      retrievedUrl: meta.retrievedUrl || meta.url || '', // API might use 'url' or 'retrieved_url'
      urlRetrievalStatus: meta.urlRetrievalStatus || meta.status || 'URL_RETRIEVAL_STATUS_UNSPECIFIED', // API might use 'status'
    })),
  };
  console.log('[AI Stage Flow Enhanced] Extracted URL Context Metadata:', JSON.stringify(parsedUrlContextMetadata, null, 2));
}

// In the return object of the flow:
// return {
//   ...,
//   urlContextMetadata: parsedUrlContextMetadata,
//   ...
// };
```

---

**Ticket ID:** FEAT-GEMINI-203
**Title:** Enhance Function Calling with Modes and Detailed Output
**Status:** Open
**Reporter:** Franzenzenhofer
**Assignee:** Junior Dev
**Parent EPIC:** GEMINI-ULTIMATE-ENHANCEMENT

**Description:**
Refine the function calling capabilities within `aiStageExecutionFlow`. This includes supporting different function calling modes (`AUTO`, `ANY`, `NONE`), ensuring tools defined in `/ai/tools/tool-definitions.ts` are correctly passed to the Gemini API, and providing detailed logging of function calls and their results in the flow's output.

**Acceptance Criteria:**
1.  The `aiStageExecutionFlow` must accept a `functionCallingMode` input (enum: `AUTO`, `ANY`, `NONE`).
2.  This mode MUST be correctly passed to the Gemini API in `generateOptions.config.functionCallingConfig.mode` (or equivalent Genkit/GoogleAI plugin syntax).
3.  If `toolNames` are provided, the corresponding tool definitions (name, description, input/output schema) from `/ai/tools/tool-definitions.ts` are correctly formatted and included in the `tools` array passed to the Gemini API. The `fn` (actual function implementation) is used by the flow to execute the tool, not passed to Gemini.
4.  The `AiStageOutputSchema`'s `functionCalls` array MUST be populated with objects detailing each function call attempted or made, including `toolName`, `input`, `output` (or error), and an optional `timestamp`.
5.  `thinkingSteps` should continue to log `toolRequest` and `toolResponse` events.
6.  The tool execution loop in `executeWithStreaming` must correctly handle responses from tool functions and send results back to the model.
7.  Error handling for tool execution (e.g., tool function throws an error, tool not found) must be robust, with errors reported in the `functionCalls.output` and `thinkingSteps`.
8.  Unit tests in `ai-stage-execution.test.ts` must verify:
    *   Correct application of `functionCallingMode`.
    *   Correct formatting of tool declarations for the API.
    *   Successful execution of a tool and inclusion of its result in the history for the next model call.
    *   Population of `functionCalls` and `thinkingSteps` for tool interactions.
    *   Handling of tool execution errors.

**Technical Notes:**
*   **File:** `/ai/flows/ai-stage-execution.ts`
*   **Key Functions/Areas:**
    *   Modify `generateOptions.config` to include `functionCallingConfig: { mode: functionCallingMode }`.
    *   Ensure the `availableTools` are transformed into `FunctionDeclaration` objects if the SDK/API requires that specific format, or if Genkit handles the conversion from the provided structure. Genkit's `ai.defineTool` typically handles this, but here tools are loaded from definitions. The current code passes `name`, `description` and `fn`. The Gemini API expects schema for parameters. The `tool-definitions.ts` includes `inputSchema` and `outputSchema` (Zod schemas). These need to be converted to JSON schema for the API.
    *   Enhance the tool execution loop in `executeWithStreaming`.
*   Refer to Google's documentation on Function Calling (`/docs/function-calling?example=meeting`), specifically `toolConfig.functionCallingConfig.mode`.
*   The current `ai-stage-execution.ts` loads tools and their `fn`. The schemas (`inputSchema`, `outputSchema` from `tool-definitions.ts`) need to be converted to JSON Schema format to be passed to the Gemini API as part of the tool declaration.

**TypeScript Code Snippets (Illustrative for `/ai/flows/ai-stage-execution.ts`):**

```typescript
// --- In AiStageOutputSchema within ai-stage-execution.ts ---
functionCalls: z.array(z.object({
  toolName: z.string(),
  input: z.any(),
  output: z.any().describe('The result from the tool execution, or an error object/message.'),
  timestamp: z.string().optional(),
})).optional(),

// --- In aiStageExecutionFlow, preparing tools and function calling mode ---
// Inside the tool preparation block:
if (toolNames && toolNames.length > 0) {
  try {
    const { toolDefinitions } = await import('@/ai/tools/tool-definitions');
    const { z } = await import('zod'); // For Zod to JSON Schema conversion
    const { zodToJsonSchema } = await import('zod-to-json-schema'); // Utility

    const requestedToolDefinitions = toolDefinitions.filter(def => toolNames.includes(def.name));

    availableTools = requestedToolDefinitions.map(def => {
      // Convert Zod schema to JSON schema for Gemini API
      const parametersJsonSchema = def.inputSchema ? zodToJsonSchema(def.inputSchema, { target: "openApi3" }) : {};
      // Remove unsupported fields or transform as needed for Gemini's OpenAPI subset
      if (parametersJsonSchema.definitions) delete parametersJsonSchema.definitions; // Often not needed for simple schemas
      // Ensure properties are well-defined
       if (parametersJsonSchema.properties && typeof parametersJsonSchema.properties === 'object') {
        Object.values(parametersJsonSchema.properties).forEach((prop: any) => {
          if (prop.description === undefined) prop.description = ""; // Gemini might require description
        });
      }


      return {
        // This is the FunctionDeclaration part for the API
        functionDeclarations: [{ // Gemini expects an array of FunctionDeclaration
          name: def.name,
          description: def.description,
          parameters: parametersJsonSchema, // Pass the converted JSON Schema
        }],
        // Keep the actual function for local execution by the flow
        fn: def.fn, // The actual function to call
        name: def.name, // Keep name for mapping fn
      };
    });

    // Handle code interpreter as a distinct tool type if needed by API
    if (toolNames.includes('codeInterpreter')) {
        // For codeInterpreter, it's a built-in capability.
        // It's enabled differently (see FEAT-GEMINI-205).
        // Here, we ensure it's not duplicated if handled by FEAT-GEMINI-205.
        // If it's *just* another declared tool, this mapping is okay.
        // However, it's usually { codeExecution: {} }
    }
    console.log(`[AI Stage Flow Enhanced] Prepared ${availableTools.length} tools for API:`, availableTools.map(t => t.name));
  } catch (error) {
    console.error('[AI Stage Flow Enhanced] Failed to prepare tools or convert Zod schemas:', error);
    // Potentially re-throw or handle gracefully
  }
}

// Configure function calling mode
if (availableTools.length > 0 || (generateOptions.tools?.some((t:any) => t.functionDeclarations))) { // Check if any function tools are present
  if (!generateOptions.config.toolConfig) { // Genkit/GoogleAI plugin might use toolConfig
    generateOptions.config.toolConfig = {};
  }
  if (functionCallingMode) {
    generateOptions.config.toolConfig.functionCallingConfig = {
        mode: functionCallingMode,
        // allowedFunctionNames: [] // Can be used with ANY mode if needed
    };
  } else {
     generateOptions.config.toolConfig.functionCallingConfig = { mode: 'AUTO' }; // Default to AUTO
  }

  // Pass the function declarations to generateOptions.tools
  // The current code does generateOptions.tools = availableTools;
  // This needs to be:
  if (!generateOptions.tools) generateOptions.tools = [];
  availableTools.forEach(tool => {
      // Add each tool's functionDeclarations. Genkit might expect a flat list of declarations.
      // Or it might expect an object like { functionDeclarations: [...] } per tool type.
      // Based on Gemini docs, it's usually a flat list under a single "tools" array.
      // The `googleAI` plugin usually takes `tools: [genkitTool1, genkitTool2]`
      // If we are bypassing `ai.defineTool`, we need to structure it as Gemini API expects.
      // The current code `generateOptions.tools.push(...availableTools);` might be problematic
      // if availableTools contains `fn`.
      // Let's refine how tools are added to generateOptions:
      tool.functionDeclarations.forEach((declaration: any) => {
          // Avoid duplicates if tools are added from multiple sources (e.g. grounding + custom)
          if (!generateOptions.tools.find((existingTool: any) => existingTool.functionDeclarations?.find((fd:any) => fd.name === declaration.name))) {
              generateOptions.tools.push({ functionDeclarations: [declaration] });
          }
      });
  });
  // Keep the `fn` part separate for local execution, perhaps in a map.
  const toolExecutionMap = new Map(availableTools.map(tool => [tool.name, tool.fn]));
  // The executeWithStreaming function will need access to this map.
}


// --- In executeWithStreaming, when handling tool requests ---
// const toolResults = [];
// for (const toolRequest of response.toolRequests) { // Genkit might return toolRequests directly on response
//   try {
//     let toolResult;
//     const toolToExecute = toolExecutionMap.get(toolRequest.name); // Use the map
//     if (toolToExecute) {
//       toolResult = await toolToExecute(toolRequest.input);
//     } else if (toolRequest.name === 'codeInterpreter') {
//       // This case is for the built-in code execution tool, results come differently
//       // See FEAT-GEMINI-205. For now, assume it's handled if it appears as a tool request.
//       // The model itself might return codeExecutionResult instead of a toolRequest for this.
//       toolResult = { error: "Code Interpreter execution is handled by the model directly or via specific tool config." };
//     }
//      else {
//       console.error(`[AI Stage Flow Enhanced] Tool ${toolRequest.name} not found in execution map.`);
//       toolResult = { error: `Tool ${toolRequest.name} not found or not executable.` };
//     }
//     // ... rest of loop, populating functionCalls output ...
//     functionCalls.push({
//       toolName: toolRequest.name,
//       input: toolRequest.input,
//       output: toolResult,
//       timestamp: new Date().toISOString(),
//     });
//   } ...
// }
```

---

**Ticket ID:** FEAT-GEMINI-204
**Title:** Implement Robust Streaming Support
**Status:** Open
**Reporter:** Franzenzenhofer
**Assignee:** Junior Dev
**Parent EPIC:** GEMINI-ULTIMATE-ENHANCEMENT

**Description:**
Ensure that the `aiStageExecutionFlow` correctly handles streaming of responses from the Gemini API. This includes streaming text content, updates related to tool usage (e.g., when a tool is called, when its response is processed), and any available real-time grounding information. The `streamingCallback` function should be invoked with meaningful chunks of data as they become available.

**Acceptance Criteria:**
1.  If `streamingSettings.enabled` is true in `AiStageExecutionInput`, or if chat history or tools are used, the flow MUST use a streaming API call to Gemini.
2.  The `streamingCallback` (if provided) MUST be invoked with:
    *   Text chunks as they are generated by the model.
    *   Notifications or data related to tool calls (e.g., "Tool 'X' called with input Y", "Tool 'X' responded with Z"). This can be part of `thinkingSteps` streamed.
    *   Streamed `groundingMetadata` or source updates if the API supports streaming this.
    *   Streamed `codeExecution` steps/outputs if supported.
3.  The `accumulatedContent` variable in `executeWithStreaming` MUST correctly aggregate all text parts from the streamed response.
4.  The final `AiStageOutputSchema` returned after streaming is complete MUST contain the fully accumulated content, all thinking steps, tool call details, grounding metadata, etc.
5.  The streaming implementation should gracefully handle the multi-turn interactions that occur with tool usage (model response -> tool call -> tool response -> model response).
6.  Unit tests in `ai-stage-execution.test.ts` must verify:
    *   `streamingCallback` is called with text chunks.
    *   `streamingCallback` is called with tool-related updates (if feasible to mock/test).
    *   `accumulatedContent` is correct.
    *   Final output schema is correctly populated after streaming.

**Technical Notes:**
*   **File:** `/ai/flows/ai-stage-execution.ts`
*   **Key Functions/Areas:**
    *   Focus on the `executeWithStreaming` function.
    *   The Genkit `ai.chat()` or `ai.generate()` with streaming options typically returns an async iterator. Iterate through this and process different types of chunks (text, tool calls, etc.).
    *   How `streamingCallback` is invoked needs careful consideration. It might receive structured objects indicating the type of update (text, tool_request, tool_response, grounding_update).
*   The current `ai-stage-execution.ts` has a basic structure for streaming. This needs to be expanded to differentiate chunk types. Genkit's streaming responses often yield `GenerateContentResponseChunk` which can have `text`, `toolCalls`, `toolCallResults` etc.

**TypeScript Code Snippets (Illustrative for `/ai/flows/ai-stage-execution.ts`):**

```typescript
// --- In executeWithStreaming ---
// Assuming ai.chat() or ai.stream() returns an async iterator of chunks
// The actual structure of 'chunk' depends on the Genkit/GoogleAI SDK
// let stream;
// if (callHistory.length > 0 || generateOptions.tools?.length > 0) { // chat/tool usage implies streaming
//   stream = await ai.chat({ // or ai.runFlow with streaming for more complex scenarios
//     model: generateOptions.model,
//     config: generateOptions.config,
//     tools: generateOptions.tools, // Ensure these are correctly formatted FunctionDeclarations
//     messages: callHistory, // Genkit's chat usually takes 'messages'
//     stream: true, // Explicitly enable streaming if the method supports it
//   });
// } else { // Simple prompt, but streaming requested
//   stream = await ai.generate({
//     model: generateOptions.model,
//     prompt: promptTemplate || '', // Ensure prompt is correctly passed
//     config: generateOptions.config,
//     tools: generateOptions.tools,
//     stream: true,
//   });
// }

// for await (const chunk of stream) {
//   if (streamingCallback) {
//     // Pass a structured chunk to the callback
//     await streamingCallback({ type: 'chunk', data: chunk });
//   }

//   if (chunk.text) {
//     accumulatedContent += chunk.text;
//     if (streamingCallback) await streamingCallback({ type: 'text', content: chunk.text });
//   }

//   // Process tool requests from the stream chunk
//   if (chunk.toolRequests && chunk.toolRequests.length > 0) {
//     // ... (existing tool execution logic, adapted for streamed requests) ...
//     // Send updates via streamingCallback about tool activity
//     if (streamingCallback) await streamingCallback({ type: 'tool_request', data: chunk.toolRequests });
//     // After execution:
//     // if (streamingCallback) await streamingCallback({ type: 'tool_response', data: toolResults });
//     // Add to callHistory and continue the loop if necessary
//   }
  
//   // Process grounding metadata if streamed (less common for it to be fully streamed chunk by chunk)
//   const currentGroundingMetadata = extractGroundingMetadata(chunk);
//   if (currentGroundingMetadata) {
//       groundingMetadata = { ...groundingMetadata, ...currentGroundingMetadata }; // Merge
//       if (streamingCallback) await streamingCallback({ type: 'grounding_update', data: currentGroundingMetadata });
//   }

//   // Process code execution parts if streamed
//   if (chunk.executableCode) {
//       // ... handle executableCode ...
//       if (streamingCallback) await streamingCallback({ type: 'code_execution_code', data: chunk.executableCode });
//   }
//   if (chunk.codeExecutionResult) {
//       // ... handle codeExecutionResult ...
//       if (streamingCallback) await streamingCallback({ type: 'code_execution_result', data: chunk.codeExecutionResult });
//       // Potentially update codeExecutionResults field here
//   }
// }
// The current loop in ai-stage-execution.ts is turn-based. For true streaming of partial content within a turn,
// the `ai.chat` or `ai.generate` call itself would need to yield chunks that are then processed.
// The existing `executeWithStreaming` function simulates streaming by calling `streamingCallback` with the full accumulated content at the end.
// This ticket requires that `streamingCallback` is called *during* generation with partial chunks.

// Refined executeWithStreaming:
// async function executeWithStreaming(...) {
// ...
//   while (iterationCount < maxLoops) {
//     iterationCount++;
//     // ...
//     const stream = await ai.chat({ model: generateOptions.model, ...messages: currentCallHistory, stream: true });
//     let currentTurnText = "";
//     let currentTurnToolRequests: any[] = [];

//     for await (const chunk of stream) { // Assuming `stream` is an async iterator of response chunks
//        if (chunk.text) {
//            currentTurnText += chunk.text;
//            accumulatedContent += chunk.text; // Keep track of overall content
//            if (streamingCallback) {
//                await streamingCallback({ type: 'text_chunk', content: chunk.text });
//            }
//        }
//        if (chunk.toolRequests && chunk.toolRequests.length > 0) {
//             currentTurnToolRequests.push(...chunk.toolRequests);
//             // Tool requests usually come as a complete block in a chunk, not streamed token by token.
//             // So, process them after iterating through the current model turn's stream.
//        }
//        // Extract other streamed parts like grounding, images, code execution if API streams them
//        const chunkGrounding = extractGroundingMetadata(chunk);
//        if (chunkGrounding) {
//             groundingMetadata = mergeGroundingMetadata(groundingMetadata, chunkGrounding);
//             if (streamingCallback) await streamingCallback({type: 'grounding_update', data: chunkGrounding});
//        }
//        // (similar for outputImages, codeExecutionResults if they are streamed per chunk)
//     }

//     // Add model's completed text part to history for this turn
//     currentCallHistory.push({ role: 'model', parts: [{text: currentTurnText}]});
//     thinkingSteps.push({ type: 'textLog', message: `Model turn ${iterationCount} text: ${currentTurnText.substring(0,100)}...`});


//     if (currentTurnToolRequests.length > 0) {
//         // Log tool requests to thinkingSteps & streamingCallback
//         // Execute tools...
//         // Add tool responses to history & thinkingSteps & streamingCallback
//         // continue; // to next iteration
//     } else {
//         // No tool requests, this is the final response from the model
//         thinkingSteps.push({ type: 'textLog', message: 'Final response received.' });
//         break; // Exit loop
//     }
//   }
//   // ... return final accumulated AiStageOutputSchema ...
// }
```

---

**Ticket ID:** FEAT-GEMINI-205
**Title:** Implement Code Execution (Code Interpreter) Tool
**Status:** Open
**Reporter:** Franzenzenhofer
**Assignee:** Junior Dev
**Parent EPIC:** GEMINI-ULTIMATE-ENHANCEMENT

**Description:**
Integrate Gemini's Code Execution (often referred to as Code Interpreter) tool into the `aiStageExecutionFlow`. This allows the model to generate and run Python code to perform calculations, data analysis, or other tasks, and use the results to inform its response. The implementation needs to handle code generation, execution results (including stdout, stderr), and image outputs (e.g., from Matplotlib).

**Acceptance Criteria:**
1.  If `toolNames` in `AiStageExecutionInput` includes `'codeInterpreter'`, the Code Execution tool MUST be enabled in the Gemini API call by adding `{ codeExecution: {} }` to the `tools` array.
2.  The flow must correctly process API responses containing `executableCode` and `codeExecutionResult` parts.
3.  The `AiStageOutputSchema` MUST include a `codeExecutionResults` field to store the executed code, its `stdout`, `stderr` (if any), and any `images` generated by the code (e.g., Matplotlib plots as base64 encoded data).
4.  Images generated by code execution MUST be added to the `codeExecutionResults.images` array, formatted similarly to `outputImages` (name, base64Data, mimeType).
5.  `thinkingSteps` should log events related to code generation and execution (e.g., "Code generated by model", "Code execution result received").
6.  Error handling for code execution failures (e.g., Python runtime errors reported in `stderr`) must be in place, with errors included in `codeExecutionResults`.
7.  The implementation should support file input/output for code execution if the Gemini API and Genkit plugin make this straightforward (e.g., uploading a CSV for the code to process). This is a secondary priority if complex.
8.  If the selected model does not support Code Execution, the flow should throw a clear, informative error.
9.  Unit tests in `ai-stage-execution.test.ts` must verify:
    *   Correct tool configuration for Code Execution.
    *   Parsing of `executableCode` and `codeExecutionResult`.
    *   Population of `codeExecutionResults` (including stdout, stderr, and images).
    *   Error handling for code execution failures.

**Technical Notes:**
*   **File:** `/ai/flows/ai-stage-execution.ts`
*   **Key Functions/Areas:**
    *   Modify tool preparation logic to add `{ codeExecution: {} }` when `'codeInterpreter'` is requested.
    *   Update response processing in `executeWithStreaming` (and `executeSimpleGeneration` if applicable) to handle `executableCode` and `codeExecutionResult` parts. These might come as distinct parts in a `GenerateContentResponse` or its chunks.
    *   Populate the new `codeExecutionResults` field in `AiStageOutputSchema`.
*   Refer to Google's documentation on Code Execution (`/docs/code-execution`). Pay attention to how input/output (including image outputs like Matplotlib) is handled.

**TypeScript Code Snippets (Illustrative for `/ai/flows/ai-stage-execution.ts`):**

```typescript
// --- In AiStageOutputSchema within ai-stage-execution.ts ---
codeExecutionResults: z.object({
  code: z.string().describe('The Python code executed by the model.'),
  stdout: z.string().optional().describe('Standard output from the code execution.'),
  stderr: z.string().optional().describe('Standard error from the code execution, if any.'),
  images: z.array(z.object({ // For image outputs like Matplotlib plots
    name: z.string().optional().describe('Suggested name for the image file.'),
    base64Data: z.string(),
    mimeType: z.string(),
  })).optional(),
  // inputFileUri: z.string().optional(), // If supporting file inputs for code
  // outputFileUri: z.string().optional(), // If supporting file outputs from code
}).optional(),

// --- In aiStageExecutionFlow, tool preparation ---
// When 'codeInterpreter' is in toolNames:
if (toolNames.includes('codeInterpreter')) {
  const modelName = modelToUse.toLowerCase();
  const supportsCodeExecution = modelName.includes('gemini-2.0-flash') || modelName.includes('gemini-2.5'); // Check specific model docs

  if (supportsCodeExecution) {
    console.log('[AI Stage Flow Enhanced] Enabling Code Execution tool for model:', modelToUse);
    if (!generateOptions.tools) {
      generateOptions.tools = [];
    }
    // Ensure Code Execution tool is added if not present
    if (!generateOptions.tools.some((tool: any) => tool.codeExecution !== undefined)) {
        generateOptions.tools.push({ codeExecution: {} });
    }
    currentThinkingSteps.push({ type: 'textLog', message: `Code Execution (codeInterpreter) tool enabled for model ${modelToUse}.` });
  } else {
    console.error(`[AI Stage Flow Enhanced] Code Execution (codeInterpreter) is NOT supported for model '${modelToUse}'.`);
    throw new Error(`Code Execution (codeInterpreter) is not supported by model '${modelToUse}'. Please use a compatible model.`);
  }
}

// --- In executeWithStreaming or executeSimpleGeneration, processing response parts ---
// The response from ai.chat() or ai.generate() might contain parts for code execution.
// Genkit's `GenerateContentResponse` can have a `content.parts` array.
// Each part can be of type 'text', 'executableCode', or 'codeExecutionResult'.

// Example logic within the response processing loop (e.g., for await (const chunk of stream) or after simple generation):
// This logic would likely be inside the loop processing model responses/chunks if streaming
// or after a non-streaming call if the whole response is processed at once.

// For a non-streaming response:
// const response = await ai.generate(options);
// const parts = response.candidates[0].content.parts; // or similar structure from Genkit
// parts.forEach(part => {
//   if (part.executableCode) {
//     codeExecutionResults = {
//       ...codeExecutionResults, // Keep any previous results if multiple steps
//       code: part.executableCode.code,
//     };
//     thinkingSteps.push({ type: 'textLog', message: `Model generated code to execute: ${part.executableCode.code.substring(0,100)}...`});
//   } else if (part.codeExecutionResult) {
//     codeExecutionResults = {
//       ...(codeExecutionResults || { code: '' }), // Ensure code field exists
//       stdout: part.codeExecutionResult.output, // Gemini API often puts stdout in 'output'
//       // stderr: part.codeExecutionResult.stderr, // Check if SDK provides stderr separately
//     };
//     // Handle images from codeExecutionResult if API nests them here
//     if (part.codeExecutionResult.outputFiles) { // Or similar field for image output
//        codeExecutionResults.images = part.codeExecutionResult.outputFiles.map( (file: any) => ({
//            name: file.name || 'code_output_image.png',
//            base64Data: file.base64Data, // Assuming API provides base64 directly
//            mimeType: file.mimeType || 'image/png'
//        }));
//     }
//     thinkingSteps.push({ type: 'textLog', message: `Code execution result: ${ (part.codeExecutionResult.output || '').substring(0,100)}...`});
//   } else if (part.text) {
//     accumulatedContent += part.text;
//   }
// });

// If streaming, chunks might contain these parts.
// Inside the streaming loop for `chunk`:
// if (chunk.candidates && chunk.candidates[0].content && chunk.candidates[0].content.parts) {
//   for (const part of chunk.candidates[0].content.parts) {
//      if (part.executableCode && part.executableCode.code) {
//          // Update `codeExecutionResults.code`
//          // Add to `thinkingSteps`
//          // Stream via `streamingCallback`
//      }
//      if (part.codeExecutionResult && part.codeExecutionResult.output) {
//          // Update `codeExecutionResults.stdout` and potentially `.images`
//          // Add to `thinkingSteps`
//          // Stream via `streamingCallback`
//      }
//   }
// }

// The exact structure of how `executableCode` and `codeExecutionResult` arrive
// (as separate parts, or within a tool_code/tool_response structure for `codeInterpreter` tool)
// depends on the Genkit GoogleAI plugin's interpretation.
// The docs (https://ai.google.dev/gemini-api/docs/code-execution) show these as distinct parts.
// The flow needs to aggregate these into the `codeExecutionResults` object.
// If code execution produces images, they might be in `part.inlineData` within a `codeExecutionResult` part,
// or a specific field for output files. The documentation says "output files are returned as inline images in the response".

// Final population in the return statement:
// return {
//   ...,
//   codeExecutionResults, // The aggregated object
//   ...
// };
```

---

**Ticket ID:** FEAT-GEMINI-206
**Title:** Implement Centralized Model Compatibility Checks and Error Handling
**Status:** Open
**Reporter:** Franzenzenhofer
**Assignee:** Junior Dev
**Parent EPIC:** GEMINI-ULTIMATE-ENHANCEMENT

**Description:**
Establish a robust system for checking model compatibility for various features (Grounding, URL Context, Code Execution, Thinking, Image Generation if used) within `aiStageExecutionFlow`. Implement clear and user-friendly error messages if a selected model does not support a requested feature, guiding the user to select an appropriate model. Ensure that for features with differing implementations across model versions (like Grounding), only the Gemini 2.0+ version is used.

**Acceptance Criteria:**
1.  Before attempting to use a feature like Grounding, URL Context, Code Execution, or Thinking, the flow MUST check if the selected `modelToUse` supports that feature.
2.  Model capability information should be based on Google's official documentation (provided context files like `gemini-model-comparison-table.md`, `gemini-models-guide-2025.md` can serve as a reference, but ideally, this is managed with an updatable configuration or relies on SDK capabilities if available).
3.  If a feature is requested with an incompatible model:
    *   The flow MUST NOT proceed with the API call for that feature.
    *   It MUST throw an error or return a structured error in `AiStageOutputSchema` clearly stating the incompatibility (e.g., "Model 'gemini-1.0-pro' does not support Code Execution. Please use a model like 'gemini-2.0-flash'.").
4.  For Grounding with Google Search, the flow MUST exclusively use the "Search as Tool" (Gemini 2.0+) method. Any attempt to use it with a non-2.0+ model should result in the error described above.
5.  Model names used in checks should be normalized (e.g., lowercase) to avoid case-sensitivity issues.
6.  The `ai-stage-execution.ts` should be updated to use stable model identifiers (e.g., `gemini-2.0-flash`) instead of experimental ones like `gemini-2.0-flash-exp`, unless explicitly intended for preview features. The input `model` string should be prioritized if valid.
7.  Unit tests in `ai-stage-execution.test.ts` must cover various scenarios of feature requests with compatible and incompatible models, verifying correct behavior and error messages.

**Technical Notes:**
*   **File:** `/ai/flows/ai-stage-execution.ts`
*   **Key Functions/Areas:**
    *   Create a helper function `isModelCompatible(modelName: string, feature: string): boolean` or a configuration object mapping models to supported features.
    *   Call this check before enabling tools like `googleSearch`, `urlContext`, `codeExecution`, or configuring `thinkingBudget`.
*   This ticket is crucial for user experience and stability.
*   Model Naming: Standardize on official model names. The `/gemini-models-guide-2025.md` mentions `googleai/gemini-2.0-flash` should replace `googleai/gemini-2.0-flash-exp`. The `ai/genkit.ts` uses `apiVersion: 'v1beta'`.

**TypeScript Code Snippets (Illustrative for `/ai/flows/ai-stage-execution.ts`):**
```typescript
// --- Helper for model capabilities (can be expanded and put in a separate utils file) ---
type GeminiFeature = 'grounding_search_as_tool' | 'url_context_tool' | 'code_execution_tool' | 'thinking' | 'image_generation_native';

// Simplified capability mapping. In a real app, this might come from a config or more dynamic check.
// Based on provided docs. This needs to be kept up-to-date.
const MODEL_CAPABILITIES: Record<string, Partial<Record<GeminiFeature, boolean>>> = {
  // Gemini 2.5 Series (Previews - use with caution for production ready checks)
  'gemini-2.5-pro-preview': { thinking: true, url_context_tool: true, grounding_search_as_tool: true, code_execution_tool: true }, // Assuming 2.5 Pro has these
  'gemini-2.5-flash-preview': { thinking: true, url_context_tool: true, grounding_search_as_tool: true, code_execution_tool: true }, // Assuming 2.5 Flash has these

  // Gemini 2.0 Series
  'gemini-2.0-flash': { grounding_search_as_tool: true, code_execution_tool: true, url_context_tool: true, image_generation_native: true /* gemini-2.0-flash-preview-image-generation */ },
  // 'gemini-2.0-pro': { /* ... capabilities ... */ }, // Add if used

  // Gemini 1.5 Series (Generally not preferred for features with 2.0+ specific implementations like grounding)
  'gemini-1.5-pro': { /* thinking: false (no, thinking is 2.5), code_execution_tool: false (no, 2.0+), ... */ },
  'gemini-1.5-flash': { /* ... */ },
  // Add other models used by the application, ensure to use normalized base model names if genkit prefixes them e.g. 'googleai/'
};

function checkModelFeatureSupport(modelIdentifier: string, feature: GeminiFeature): boolean {
  const normalizedModelId = modelIdentifier.toLowerCase().replace('googleai/', ''); // Normalize
  
  // Try exact match first
  if (MODEL_CAPABILITIES[normalizedModelId]?.[feature]) {
    return true;
  }

  // Fallback for broader family checks if needed (e.g. all "gemini-2.5" support X)
  if (normalizedModelId.startsWith('gemini-2.5') && (feature === 'thinking' || feature === 'url_context_tool' || feature === 'grounding_search_as_tool' || feature === 'code_execution_tool')) return true;
  if (normalizedModelId.startsWith('gemini-2.0-flash') && (feature === 'grounding_search_as_tool' || feature === 'code_execution_tool' || feature === 'url_context_tool')) return true;
  // Specific model for image gen with 2.0 flash
  if (normalizedModelId === 'gemini-2.0-flash-preview-image-generation' && feature === 'image_generation_native') return true;


  console.warn(`[Model Capability] No explicit capability info for model '${normalizedModelId}' and feature '${feature}'. Assuming not supported or relying on API error.`);
  return false; // Default to false if not explicitly known, or could let API error out
}

// --- In aiStageExecutionFlow, before enabling a feature ---
// Example for Grounding:
if (shouldEnableGoogleSearch) {
  if (!checkModelFeatureSupport(modelToUse, 'grounding_search_as_tool')) {
    throw new Error(`Google Search Grounding (Search as Tool) is not supported by model '${modelToUse}'. Please use a Gemini 2.0+ or 2.5 model.`);
  }
  // ... proceed with grounding setup ...
}

// Example for URL Context:
if (groundingSettings?.urlContext?.enabled && groundingSettings.urlContext.urls.length > 0) {
  if (!checkModelFeatureSupport(modelToUse, 'url_context_tool')) {
    throw new Error(`URL Context tool is not supported by model '${modelToUse}'. Please use a compatible model (e.g., gemini-2.0-flash, gemini-2.5 series).`);
  }
  // ... proceed with URL context setup ...
}

// Example for Code Execution:
if (toolNames.includes('codeInterpreter')) {
  if (!checkModelFeatureSupport(modelToUse, 'code_execution_tool')) {
    throw new Error(`Code Execution (codeInterpreter) is not supported by model '${modelToUse}'. Please use a compatible model (e.g., gemini-2.0-flash, gemini-2.5 series).`);
  }
  // ... proceed with code execution setup ...
}

// Example for Thinking:
if (thinkingSettings?.enabled) {
  // Override model if a specific thinking model is required and not already selected
  // This logic is already in the flow:
  // if (thinkingSettings?.enabled && modelToUse.includes('gemini-2.0-flash') && !modelToUse.includes('thinking')) {
  //    modelToUse = 'googleai/gemini-2.0-flash-thinking-exp'; // This should be updated to a 2.5 model
  // }
  // A better approach would be to check if the *selected* model supports thinking:
   if (!checkModelFeatureSupport(modelToUse, 'thinking')) {
       // Attempt to upgrade to a known thinking model or error out
       if (modelToUse.includes('gemini-2.0-flash')) { // Example: auto-switch for a non-thinking 2.0 flash
           console.warn(`Model ${modelToUse} does not support thinking. Attempting to switch to a Gemini 2.5 Flash model for thinking.`);
           modelToUse = 'googleai/gemini-2.5-flash-preview'; // Or appropriate 2.5 model, ensure it's valid
           if (!checkModelFeatureSupport(modelToUse, 'thinking')) { // Double check
                throw new Error(`Thinking is not supported by model '${input.model || 'default'}' and auto-switch failed. Please select a Gemini 2.5 series model.`);
           }
       } else {
           throw new Error(`Thinking is not supported by model '${modelToUse}'. Please select a Gemini 2.5 series model.`);
       }
   }
  generateOptions.config.thinkingConfig = { // As per Gemini API docs for 2.5 models
    includeThoughts: true, // If you want thought summaries
    thinkingBudget: thinkingSettings.thinkingBudget || (modelToUse.includes('gemini-2.5-pro') ? 8192 : 2048) // Example budget
  };
  // The 'thinkingBudget' under general 'config' might be Genkit specific.
  // Official Gemini API uses 'thinkingConfig.thinkingBudget'. Adapt as needed.
  currentThinkingSteps.push({ type: 'textLog', message: `Thinking mode enabled for model ${modelToUse}` });
}

// Update model selection logic:
// let modelToUse = model || 'googleai/gemini-2.0-flash'; // Prioritize input model
// REMOVE: modelToUse = 'googleai/gemini-2.0-flash-exp';
// Ensure modelToUse is a stable/valid identifier.
// The input `model` string from `AiStageExecutionInputSchema` should be the source of truth,
// and the compatibility checks will run against it.
// The `ai/genkit.ts` should also be checked if it hardcodes any model globally.
```

---

**Ticket ID:** FEAT-GEMINI-207
**Title:** Update Genkit Configuration and Tool Definitions for Advanced Features
**Status:** Open
**Reporter:** Franzenzenhofer
**Assignee:** Junior Dev
**Parent EPIC:** GEMINI-ULTIMATE-ENHANCEMENT

**Description:**
Review and update the Genkit configuration (`/ai/genkit.ts`) and tool definitions (`/ai/tools/tool-definitions.ts`) to ensure they are compatible with the new Gemini features being implemented and use appropriate API versions. This includes ensuring custom tools have their schemas correctly defined and are convertible to the JSON Schema format expected by the Gemini API for function calling.

**Acceptance Criteria:**
1.  The `ai/genkit.ts` file should use a GoogleAI plugin configuration that supports all the targeted Gemini features (e.g., `apiVersion: 'v1beta'` or a newer stable version if recommended by Google for these features).
2.  Custom tool definitions in `/ai/tools/tool-definitions.ts` MUST have their `inputSchema` and `outputSchema` (Zod schemas) correctly defined.
3.  The logic in `aiStageExecutionFlow` that prepares tools for the Gemini API (as part of FEAT-GEMINI-203) MUST correctly convert these Zod schemas to the JSON Schema format required by Gemini's function calling declarations. A utility like `zod-to-json-schema` should be used.
4.  If `codeInterpreter` is used as a named tool, ensure it doesn't conflict with the direct `{ codeExecution: {} }` tool mechanism. Prefer direct mechanism if `codeInterpreter` name is just a convention.
5.  All sample tools (`simpleCalculator`, `weatherTool`, `unitConverter`) must function correctly through the `aiStageExecutionFlow` after the changes.
6.  Dependencies required for schema conversion (e.g., `zod-to-json-schema`) are added to `package.json`.
7.  Unit tests for `ai-stage-execution.test.ts` related to tool usage should pass, confirming tools are correctly declared and executed.

**Technical Notes:**
*   **Files:** `/ai/genkit.ts`, `/ai/tools/tool-definitions.ts`, `/ai/flows/ai-stage-execution.ts`
*   **Key Tasks:**
    *   Verify `googleAI` plugin settings in `genkit.ts`.
    *   Implement Zod to JSON Schema conversion for tool parameters in `ai-stage-execution.ts` as outlined in FEAT-GEMINI-203.
    *   Test existing sample tools with the new setup.
*   The `tool-definitions.ts` already uses Zod. The main work is the conversion to JSON schema format for the API.

**TypeScript Code Snippets (Illustrative for tool schema conversion in `/ai/flows/ai-stage-execution.ts`):**

```typescript
// (Covered by snippet in FEAT-GEMINI-203)
// Example of Zod to JSON schema conversion:
// import { z } from 'zod';
// import { zodToJsonSchema } from 'zod-to-json-schema';

// const myZodSchema = z.object({
//   name: z.string().describe("User's name"),
//   age: z.number().optional().describe("User's age"),
// });

// const jsonSchema = zodToJsonSchema(myZodSchema, { target: "openApi3" });
// // `jsonSchema` would then be used as the `parameters` field in the FunctionDeclaration
// // Ensure to handle potential 'definitions' field or other OpenAPI specifics not directly used by Gemini.

// In ai/genkit.ts:
// ai = genkit({
//   plugins: [
//     googleAI({
//       apiVersion: 'v1beta', // Ensure this version supports all features. Check latest Google recs.
//     }),
//   ],
// });
// Consider if a newer stable apiVersion like 'v1' is available and recommended. 'v1beta' is often for newer features.
```

---

This EPIC and its associated tickets provide a detailed roadmap for implementing the advanced Gemini features. Each ticket focuses on a specific area, with clear acceptance criteria and technical guidance, aiming to be manageable even for a junior developer with proper supervision.