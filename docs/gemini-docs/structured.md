Okay, here's a JIRA-style ticket to understand the Gemini API in detail and the corresponding documentation derived from the fetched content.

---

**JIRA Ticket**

**Project:** API Documentation
**Ticket ID:** DOC-GEMINI-001
**Reporter:** AI Assistant
**Assignee:** [Your Name/Team]
**Priority:** High

**Summary:** Create Comprehensive Documentation for the Google Gemini API

**Description:**
The Gemini API offers a suite of powerful generative AI capabilities. To enable developers to effectively integrate and utilize this API, comprehensive documentation is required. This task involves a thorough review of the existing (fetched) Gemini API documentation pages, synthesizing the information, and producing a well-structured, detailed document.

The documentation should cover:
1.  Core Concepts (API Keys, Models, Tokens, Files API).
2.  Key Capabilities:
    *   Text Generation (including streaming, chat, system instructions).
    *   Image Generation (Gemini native vs. Imagen 3, parameters, prompt guidance).
    *   Image Understanding (input methods, bounding boxes, segmentation).
    *   Document Understanding (PDF processing, local/remote, large files).
    *   Long Context capabilities and use cases.
    *   Thinking (reasoning process, thought summaries, budget).
    *   Function Calling (how it works, declarations, modes, MCP).
    *   Code Execution (enabling, I/O, limitations).
    *   URL Context (usage with and without Google Search).
    *   Grounding with Google Search (configuration, suggestions, retrieval).
3.  Prompt Engineering Strategies.
4.  Best practices, limitations, and supported formats/models for each feature.

**Acceptance Criteria:**
1.  A single, coherent document is produced covering all specified areas.
2.  The document is based *only* on the provided fetched content.
3.  Key concepts are clearly explained.
4.  Code examples (preferably in JavaScript as per provided snippets, or a consistent language) are included where relevant.
5.  Parameters, limitations, and best practices for each feature are clearly outlined.
6.  The document is well-organized and easy to navigate.

**Fetched Content (Source Material):**
*   `https://ai.google.dev/gemini-api/docs/image-generation`
*   `https://ai.google.dev/gemini-api/docs/url-context`
*   `https://ai.google.dev/gemini-api/docs/grounding?lang=python`
*   `https://ai.google.dev/gemini-api/docs/grounding/search-suggestions`
*   `https://ai.google.dev/gemini-api/docs/text-generation`
*   `https://ai.google.dev/gemini-api/docs/long-context`
*   `https://ai.google.dev/gemini-api/docs/thinking`
*   `https://ai.google.dev/gemini-api/docs/function-calling?example=meeting`
*   `https://ai.google.dev/gemini-api/docs/document-processing?lang=node`
*   `https://ai.google.dev/gemini-api/docs/image-understanding`
*   `https://ai.google.dev/gemini-api/docs/code-execution`
*   `https://ai.google.dev/gemini-api/docs/prompting-strategies`
*   `https://ai.google.dev/gemini-api/docs/files`
*   `https://ai.google.dev/gemini-api/docs/tokens?lang=node`

---

**Gemini API Documentation**

**Version:** 1.0
**Last Updated:** 2025-06-10 (Based on fetched content)

**Table of Contents:**
1.  Introduction
2.  Getting Started
    *   API Keys
    *   Libraries (SDKs)
3.  Core Concepts
    *   Models
    *   Tokens
        *   Counting Text Tokens
        *   Counting Multi-turn (Chat) Tokens
        *   Counting Multimodal Tokens
        *   System Instructions and Tools
    *   Files API
        *   Uploading a File
        *   Getting Metadata
        *   Listing Files
        *   Deleting Files
        *   Usage Info
4.  Key Capabilities
    *   Text Generation
        *   System Instructions and Configurations
        *   Multimodal Inputs
        *   Streaming Responses
        *   Multi-turn Conversations (Chat)
        *   Supported Models
    *   Image Generation
        *   Choosing the Right Model (Gemini vs. Imagen 3)
        *   Generate Images using Gemini
            *   Image Generation (Text-to-Image)
            *   Image Editing (Text-and-Image-to-Image)
            *   Other Image Generation Modes
            *   Limitations (Gemini)
        *   Generate Images using Imagen 3
            *   Imagen Model Parameters
            *   Imagen Prompt Guide (Basics, Text in Images, Parameterization, Advanced Techniques)
    *   Image Understanding
        *   Image Input Methods
        *   Prompting with Multiple Images
        *   Object Bounding Boxes
        *   Image Segmentation
        *   Supported Image Formats & Technical Details
    *   Document Understanding (PDF Processing)
        *   PDF Input (Inline, Local)
        *   Large PDFs (Files API)
        *   Multiple PDFs
        *   Technical Details & Best Practices
    *   Long Context
        *   What is a Context Window?
        *   Use Cases (Text, Video, Audio)
        *   Optimizations (Context Caching)
        *   Limitations
    *   Thinking (Reasoning)
        *   Generating Content with Thinking
        *   Thought Summaries (Experimental)
        *   Thinking Budgets
        *   Pricing
        *   Supported Models & Best Practices
    *   Function Calling
        *   How it Works
        *   Function Declarations
        *   Parallel & Compositional Function Calling
        *   Function Calling Modes
        *   Automatic Function Calling (Python SDK)
        *   Model Context Protocol (MCP)
        *   Supported Models & Best Practices
    *   Code Execution
        *   Enabling Code Execution
        *   Usage in Chat
        *   Input/Output (I/O) & Pricing
        *   Limitations & Supported Libraries
    *   URL Context
        *   Using URL Context (Standalone, With Grounding)
        *   Contextual Response
        *   Supported Models & Limitations
    *   Grounding with Google Search
        *   Configuring Search Grounding (Search as a Tool)
        *   Google Search Suggestions (Display Requirements)
        *   Google Search Retrieval (Gemini 1.5)
        *   Dynamic Threshold & Retrieval
        *   Grounded Response
5.  Prompt Engineering Strategies
    *   Clear and Specific Instructions
    *   Input Types
    *   Constraints & Response Format
    *   Zero-shot vs. Few-shot Prompts
    *   Adding Context & Prefixes
    *   Breaking Down Prompts
    *   Experimenting with Model Parameters
    *   Iteration Strategies & Fallback Responses
    *   File Prompting Strategies
6.  Conclusion

---

**1. Introduction**

The Google Gemini API provides developers with access to Google's advanced multimodal AI models. These models can process and generate information from various types of input, including text, images, audio, and video. This document provides a comprehensive overview of the Gemini API's capabilities, core concepts, and best practices for effective utilization.

**2. Getting Started**

*   **API Keys:** To use the Gemini API, you need an API key. This key authenticates your requests to the API.
*   **Libraries (SDKs):** Google provides SDKs for various programming languages (e.g., Python, JavaScript, Go) to simplify interaction with the API. The examples in this document will primarily use JavaScript syntax where available in the source material.

**3. Core Concepts**

*   **Models:** The Gemini API offers a family of models with different capabilities and context window sizes (e.g., Gemini 2.0 Flash, Gemini 2.5 Pro, Imagen 3). Refer to the official "Models" page for detailed specifications, pricing, and rate limits.

*   **Tokens:**
    Generative models process input and output in units called tokens. A token can be a character or a word. For Gemini, a token is roughly 4 characters, and 100 tokens equate to about 60-80 English words. Token count affects pricing and model input limits.

    *   **Counting Text Tokens:**
        Use `ai.models.countTokens({ model: "model-name", contents: "your text" })` to get the token count for text input.
        The `generateContent` response includes `usageMetadata` with `promptTokenCount`, `candidatesTokenCount`, and `totalTokenCount`.
        ```javascript
        // Example: Count text tokens
        const ai = new GoogleGenAI({ apiKey: "GEMINI_API_KEY" });
        const prompt = "The quick brown fox jumps over the lazy dog.";
        const countTokensResponse = await ai.models.countTokens({
          model: "gemini-2.0-flash",
          contents: prompt,
        });
        console.log(countTokensResponse.totalTokens); // e.g., 10
        ```

    *   **Counting Multi-turn (Chat) Tokens:**
        Pass the entire chat history to `countTokens`. The `sendMessage` response also provides `usageMetadata`.
        ```javascript
        // Example: Count chat tokens
        const chat = ai.chats.create({ model: "gemini-2.0-flash", history: [...] });
        const countTokensResponse = await ai.models.countTokens({
          model: "gemini-2.0-flash",
          contents: chat.getHistory(),
        });
        console.log(countTokensResponse.totalTokens);
        ```

    *   **Counting Multimodal Tokens:**
        *   **Images (Gemini 2.0+):** Images <=384x384 pixels are 258 tokens. Larger images are tiled into 768x768 pixel tiles, each costing 258 tokens.
        *   **Video:** 263 tokens per second.
        *   **Audio:** 32 tokens per second.
        `countTokens` can be used with multimodal `contents`.
        ```javascript
        // Example: Count image tokens (inline)
        const imageBuffer = fs.readFileSync("path/to/image.jpg");
        const imageBase64 = imageBuffer.toString("base64");
        const contents = createUserContent([
          "Describe this image",
          createPartFromBase64(imageBase64, "image/jpeg"),
        ]);
        const countTokensResponse = await ai.models.countTokens({
          model: "gemini-2.0-flash",
          contents: contents,
        });
        console.log(countTokensResponse.totalTokens);
        ```

    *   **System Instructions and Tools:** These also contribute to the input token count.

*   **Files API:**
    For handling media files, especially those larger than 20MB or reused across multiple requests.
    *   **Uploading a File:**
        ```javascript
        // Example: Upload a file
        const ai = new GoogleGenAI({ apiKey: "GEMINI_API_KEY" });
        const myfile = await ai.files.upload({
          file: "path/to/sample.mp3",
          config: { mimeType: "audio/mpeg" },
        });
        // Use myfile.uri and myfile.mimeType in generateContent
        ```
    *   **Getting Metadata:** `await ai.files.get({ name: myfile.name });`
    *   **Listing Files:** `await ai.files.list({ config: { pageSize: 10 } });`
    *   **Deleting Files:** `await ai.files.delete({ name: myfile.name });` (Files are auto-deleted after 48 hours).
    *   **Usage Info:** Up to 20 GB storage per project, 2 GB max per file. Free to use.

**4. Key Capabilities**

*   **Text Generation:**
    Gemini models can generate text from various inputs.
    *   **System Instructions and Configurations:** Guide model behavior using `GenerateContentConfig` (e.g., `systemInstruction`, `temperature`, `maxOutputTokens`).
        ```javascript
        // Example: System instruction
        const response = await ai.models.generateContent({
          model: "gemini-2.0-flash",
          contents: "Hello there",
          config: {
            systemInstruction: "You are a cat. Your name is Neko.",
          },
        });
        ```
    *   **Multimodal Inputs:** Combine text with media files (images, documents, video, audio).
    *   **Streaming Responses:** Receive responses incrementally using `generateContentStream`.
        ```javascript
        // Example: Streaming
        const responseStream = await ai.models.generateContentStream({
          model: "gemini-2.0-flash",
          contents: "Explain how AI works",
        });
        for await (const chunk of responseStream) {
          console.log(chunk.text);
        }
        ```
    *   **Multi-turn Conversations (Chat):** SDKs provide chat history management (`ai.chats.create`, `chat.sendMessage`). The full history is sent with each turn.
    *   **Supported Models:** All Gemini family models support text generation.

*   **Image Generation:**
    Generate images using Gemini's built-in capabilities or Imagen 3. All generated images include a SynthID watermark.
    *   **Choosing the Right Model:**
        *   **Gemini:** For contextually relevant images, blending text/images, visuals in long text, conversational editing. Use `gemini-2.0-flash-preview-image-generation`.
        *   **Imagen 3:** For critical image quality, photorealism, artistic styles, specialized editing, branding. Paid tier only. Use `imagen-3.0-generate-002`.
    *   **Generate Images using Gemini:**
        Requires `responseModalities: ["TEXT", "IMAGE"]` in configuration.
        *   **Text-to-Image:**
            ```javascript
            // Example: Gemini Text-to-Image
            const response = await ai.models.generateContent({
              model: "gemini-2.0-flash-preview-image-generation",
              contents: "A 3d rendered pig with wings flying over a futuristic city.",
              config: {
                responseModalities: [Modality.TEXT, Modality.IMAGE],
              },
            });
            // Process response parts for text and image data
            ```
        *   **Image Editing (Text-and-Image-to-Image):** Provide an input image along with text instructions.
            ```javascript
            // Example: Gemini Image Editing
            const base64Image = fs.readFileSync("path/to/image.png").toString("base64");
            const contents = [
              { text: "Add a llama next to the image?" },
              { inlineData: { mimeType: "image/png", data: base64Image } },
            ];
            // ... similar generateContent call
            ```
        *   **Other Modes:** Text-to-images with interleaved text, multi-turn conversational editing.
        *   **Limitations (Gemini):** Best with EN, es-MX, ja-JP, zh-CN, hi-IN. No audio/video input. May not always trigger image generation.
    *   **Generate Images using Imagen 3:**
        ```javascript
        // Example: Imagen 3 Image Generation
        const response = await ai.models.generateImages({
          model: 'imagen-3.0-generate-002',
          prompt: 'Robot holding a red skateboard',
          config: { numberOfImages: 4 },
        });
        // Process response.generatedImages
        ```
        *   **Imagen Model Parameters:**
            *   `numberOfImages`: 1-4 (default 4).
            *   `aspectRatio`: "1:1" (default), "3:4", "4:3", "9:16", "16:9".
            *   `personGeneration`: "dont_allow", "allow_adult" (default), "allow_all" (restricted in EU, UK, CH, MENA).
        *   **Imagen Prompt Guide:**
            *   **Basics:** Be descriptive and clear (subject, context, style). Iterate. Max 480 tokens.
            *   **Text in Images:** Keep text short (<25 chars). Can specify font style/size generally.
            *   **Parameterization:** Use placeholders in prompts for dynamic content.
            *   **Advanced:** Photography modifiers (camera proximity/position, lighting, lens types), illustration styles, shapes/materials, historical art references, quality modifiers.

*   **Image Understanding:**
    Gemini models can analyze images to caption, answer questions, detect objects, and segment them.
    *   **Image Input Methods:**
        *   Upload using Files API (for >20MB total request or reuse): `ai.files.upload()`, then use `createPartFromUri()`.
        *   Pass inline data (<20MB total request): Base64 encoded string or direct local file read.
            ```javascript
            // Example: Inline image from local file
            const base64ImageFile = fs.readFileSync("path/to/sample.jpg", { encoding: "base64" });
            const contents = [
              { inlineData: { mimeType: "image/jpeg", data: base64ImageFile } },
              { text: "Caption this image." },
            ];
            const response = await ai.models.generateContent({ model: "gemini-2.0-flash", contents: contents });
            ```
    *   **Prompting with Multiple Images:** Include multiple image `Part` objects in `contents`.
    *   **Object Bounding Boxes:** Models can identify objects and return `[ymin, xmin, ymax, xmax]` coordinates, normalized to 0-1000. Descale based on original image dimensions.
        Prompt: `"Detect all prominent items. The box_2d should be [ymin, xmin, ymax, xmax] normalized to 0-1000."`
    *   **Image Segmentation (Gemini 2.5+):** Returns a JSON list with bounding box, label, and base64 encoded PNG segmentation mask (probability map).
    *   **Supported Image Formats:** PNG, JPEG, WEBP, HEIC, HEIF.
    *   **Technical Details:** Max 3,600 images/request (Gemini 2.5 Pro, 2.0 Flash, 1.5 Pro/Flash). Token calculation varies by model version and image size.

*   **Document Understanding (PDF Processing):**
    Gemini natively processes PDFs (up to 1000 pages), understanding text and visual content.
    *   **PDF Input (Inline, Local):** For PDFs < 20MB.
        ```javascript
        // Example: Inline PDF from URL
        const pdfResp = await fetch('pdf_url').then(r => r.arrayBuffer());
        const contents = [
          { text: "Summarize this document" },
          { inlineData: { mimeType: 'application/pdf', data: Buffer.from(pdfResp).toString("base64") } }
        ];
        // ... generateContent call
        ```
    *   **Large PDFs (Files API):** Use Files API for PDFs > 20MB (up to 50MB per file via Files API).
        Upload file, wait for `state === 'ACTIVE'`, then use `createPartFromUri()`.
    *   **Multiple PDFs:** Process multiple PDFs in one request if total size fits context window.
    *   **Technical Details & Best Practices:** Supported MIME types: PDF, JS, PY, TXT, HTML, CSS, MD, CSV, XML, RTF. Each page ~258 tokens. Images scaled. Rotate pages correctly, avoid blur.

*   **Long Context:**
    Many Gemini models support large context windows (1M+ tokens).
    *   **What is a Context Window?** The amount of information (tokens) a model can process at once. 1M tokens ~ 50k lines of code or 8 average novels.
    *   **Use Cases:** Summarizing large texts, Q&A over large documents, agentic workflows, many-shot in-context learning, long-form video/audio analysis.
    *   **Optimizations:** Use **Context Caching** for frequently reused large contexts to reduce cost and latency.
    *   **Limitations:** Performance can vary with multiple "needles" (pieces of information) in a haystack. Query at the end of the prompt for better performance.

*   **Thinking (Reasoning):**
    Gemini 2.5 series models use an internal "thinking process" for improved reasoning on complex tasks. Enabled by default.
    *   **Generating Content with Thinking:** Specify a 2.5 series model.
        ```javascript
        // Example: Thinking
        const response = await ai.models.generateContent({
          model: "gemini-2.5-pro-preview-06-05",
          contents: "Explain Occam's Razor.",
        });
        ```
    *   **Thought Summaries (Experimental):** Get insights into the model's reasoning. Set `thinkingConfig: { includeThoughts: true }`. Iterate response parts and check `part.thought`.
    *   **Thinking Budgets:** Control thinking tokens.
        *   Gemini 2.5 Pro: `thinkingBudget` (128-32768). Cannot be 0.
        *   Gemini 2.5 Flash: `thinkingBudget` (0-24576). 0 disables thinking.
    *   **Pricing:** Response price = output tokens + thinking tokens. `usageMetadata.thoughtsTokenCount`.
    *   **Supported Models & Best Practices:** See model overview. Review reasoning for debugging. Guide reasoning for lengthy outputs. Works with tools like Search, Code Execution, Function Calling.

*   **Function Calling:**
    Connect models to external tools and APIs. Model suggests function calls with parameters.
    *   **How it Works:**
        1.  Define `FunctionDeclaration` (name, description, parameters using OpenAPI subset).
        2.  Call model with prompt and declarations.
        3.  If model returns a `functionCall` (name, args), your application executes the actual function.
        4.  Send function result back to the model for a user-friendly response.
    *   **Function Declarations:** `name`, `description`, `parameters` (type, properties, description, enum, required).
        ```javascript
        // Example: Function Declaration
        const scheduleMeetingFunctionDeclaration = {
          name: 'schedule_meeting',
          description: 'Schedules a meeting...',
          parameters: { /* ... OpenAPI schema ... */ }
        };
        const config = { tools: [{ functionDeclarations: [scheduleMeetingFunctionDeclaration] }] };
        // ... generateContent call ...
        // if (response.functionCalls) { ... execute function ... }
        ```
    *   **Parallel & Compositional Function Calling:** Call multiple functions at once or in sequence (Live API for compositional).
    *   **Function Calling Modes (`toolConfig.functionCallingConfig.mode`):**
        *   `AUTO` (default): Model decides.
        *   `ANY`: Model must predict a function call. Can specify `allowedFunctionNames`.
        *   `NONE`: Prohibits function calls.
    *   **Automatic Function Calling (Python SDK):** SDK handles declaration, execution, and response cycle for Python functions.
    *   **Model Context Protocol (MCP):** Open standard for connecting AI to tools. SDKs have experimental built-in support.
    *   **Supported Models & Best Practices:** Gemini 2.0 Flash, 1.5 Flash/Pro. Clear descriptions are crucial. Use low temperature.

*   **Code Execution:**
    Enables the model to generate and run Python code, learning iteratively.
    *   **Enabling Code Execution:** Configure `tools: [{ codeExecution: {} }]`.
        ```javascript
        // Example: Code Execution
        let response = await ai.models.generateContent({
          model: "gemini-2.0-flash",
          contents: "Sum of first 50 prime numbers? Generate and run code.",
          config: { tools: [{ codeExecution: {} }] },
        });
        // Response parts can include: text, executableCode, codeExecutionResult
        ```
    *   **Usage in Chat:** Can be used within chat sessions.
    *   **Input/Output (I/O) & Pricing (Gemini 2.0 Flash+):** Supports file input (CSV, text) and Matplotlib graph output (as inline images). Billed for input tokens (prompt) and output tokens (generated code, execution output, summary). Max runtime 30s.
    *   **Limitations & Supported Libraries:** Python only. Max 1M token input file size in AI Studio for Gemini Flash 2.0. Specific list of pre-installed Python libraries (e.g., numpy, pandas, matplotlib). Cannot install custom libraries.

*   **URL Context (Experimental):**
    Provide URLs as context for prompts. Model retrieves content from URLs.
    *   **Using URL Context:**
        *   **URL Context Only:** Provide URLs directly in the prompt. `config: { tools: [{urlContext: {}}] }`.
        *   **Grounding with Google Search + URL Context:** Enable both. Model may search then use URL context on results.
        ```javascript
        // Example: URL Context Only
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash-preview-05-20",
          contents: ["Compare recipes from YOUR_URL1 and YOUR_URL2"],
          config: { tools: [{urlContext: {}}] },
        });
        // Access response.candidates[0].urlContextMetadata
        ```
    *   **Contextual Response:** Includes `url_context_metadata` with retrieved URLs and status.
    *   **Supported Models & Limitations:** `gemini-2.5-pro-preview-06-05`, `gemini-2.5-flash-preview-05-20`, etc. Up to 20 URLs/request. Best with standard web pages. Free during experimental phase. Quotas apply.

*   **Grounding with Google Search:**
    Improve accuracy and recency. Returns grounding sources and Search Suggestions.
    *   **Configuring Search Grounding (Search as a Tool - Gemini 2.0+):**
        ```python
        # Python example for illustration
        # google_search_tool = Tool(google_search=GoogleSearch())
        # config=GenerateContentConfig(tools=[google_search_tool])
        ```
        JavaScript equivalent would involve setting up the tool in the `config` object for `generateContent`.
    *   **Google Search Suggestions (Display Requirements):** Must display suggested queries (`webSearchQueries` in metadata) exactly as provided, linking directly to Google SRP. HTML/CSS for rendering is provided in `renderedContent`.
    *   **Google Search Retrieval (Gemini 1.5):** Older method. `tools=[types.Tool(google_search_retrieval=types.GoogleSearchRetrieval())]`.
    *   **Dynamic Threshold & Retrieval (Gemini 1.5 Flash):** Control when grounding is used based on a prediction score and a configurable threshold.
    *   **Grounded Response:** Includes `groundingMetadata` with `searchEntryPoint` (for suggestions) and `groundingChunks`/`groundingSupports` (source URIs).

**5. Prompt Engineering Strategies**

Effective prompting is key to quality responses.
*   **Clear and Specific Instructions:** Be precise.
*   **Input Types:** Question, task, entity, completion.
*   **Constraints & Response Format:** Specify length, style (table, list, JSON). Use completion strategy for formatting.
*   **Zero-shot vs. Few-shot Prompts:** Few-shot (with examples) is generally better. Examples show desired format and pattern. Use consistent formatting for examples.
*   **Adding Context & Prefixes:** Provide necessary background info. Use prefixes like "Text:", "Output:" to demarcate sections.
*   **Break Down Prompts:** For complex tasks, use one prompt per instruction, chain prompts, or aggregate responses.
*   **Experimenting with Model Parameters:**
    *   `maxOutputTokens`: Max generated tokens.
    *   `temperature`: Randomness (0 for deterministic).
    *   `topK`: Selects from K most probable tokens.
    *   `topP`: Selects from tokens whose cumulative probability sum to P.
    *   `stop_sequences`: Characters to stop generation.
*   **Iteration Strategies:** Rephrase, try analogous tasks, change content order.
*   **Fallback Responses:** If safety filters trigger, try increasing temperature.
*   **File Prompting Strategies:**
    *   Be specific. Add few-shot examples. Break down tasks. Specify output format.
    *   For single-image prompts, place image before text.
    *   Troubleshooting: If irrelevant part of image used, hint at relevant aspects. If output too generic, ask model to describe image first.

**6. Conclusion**

The Gemini API offers a versatile and powerful platform for building AI-driven applications. By understanding its core concepts, diverse capabilities, and effective prompting strategies, developers can unlock innovative solutions across various domains. Always refer to the latest official documentation for model-specific details, pricing, and updates.