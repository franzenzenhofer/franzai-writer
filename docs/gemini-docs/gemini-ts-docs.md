### Google Gemini API – **Ultimate TypeScript Integration Guide**

*(June 2025 edition – covers every officially‑released feature and preview capability)*

---

#### 0  · Installation & project setup

| Step | Action                                                                                           | Notes                             |
| ---- | ------------------------------------------------------------------------------------------------ | --------------------------------- |
| 1    | `npm i @google/genai @types/node`                                                                | Official SDK with full TS typings |
| 2    | Add `GEMINI_API_KEY` to your `.env` file and **never** commit it.                                |                                   |
| 3    | Enable *ES2020* (or later) in `tsconfig.json`; top‑level `await` is used in most snippets.       |                                   |
| 4    | For ESM: set `"type":"module"` in `package.json`; for CJS add `import('dotenv').config()` early. |                                   |

> **Gotchas** – Vite/Next.js/Cloudflare Workers require `"moduleResolution":"bundler"` and `"lib":["DOM","ES2020"]` so that the SDK’s fetch/polyfill targets compile cleanly.

---

#### 1  · Choosing the right model

| Model               | Context  | Strengths                     | \$ / 1 M in | \$ / 1 M out   | Image Gen | Thinking |
| ------------------- | -------- | ----------------------------- | ----------- | -------------- | --------- | -------- |
| 2.0 Flash           |  1 M     | 🏭 Production, lowest latency |  0.10       |  0.40          | ✅         | –        |
| 2.5 Flash (Preview) |  1 M     | adaptive “thinking” on demand |  0.15       |  0.60 / 3.50\* | ❌         | ✅        |
| 1.5 Pro             |  2 M     | giant context, video & audio  | var.        |  var.          | ❌         | –        |
| 2.5 Pro (Preview)   |  1 M     | best reasoning, highest cost  |  1.25–2.5   |  10–15         | ❌         | ✅        |

\* 2.5 Flash adds **thinking tokens** billed separately. Details:

---

#### 2  · Text generation fundamentals

```ts
import { GoogleGenAI } from '@google/genai';
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

const res = await ai.models.generateContent({
  model: 'gemini-2.0-flash',
  contents: 'Explain AC waveforms in 3 sentences.',
});
console.log(res.text);
```

*Add a `GenerateContentConfig` to control `temperature`, `maxOutputTokens`, stop‑sequences, or a `systemInstruction`.*

**Streaming**

```ts
for await (const chunk of ai.models.generateContentStream({ … })) {
  process.stdout.write(chunk.text);
}
```

---

#### 3  · Counting tokens in TS

```ts
const { totalTokens } = await ai.models.countTokens({
  model: 'gemini-2.0-flash',
  contents: 'How many tokens is this?',
});
```

Remember: **images, audio, video & PDFs also cost tokens** (≈ 258 tokens ≤ 384 px tile). 

---

#### 4  · Files API (upload & reuse media > 20 MB)

```ts
const pdf = await ai.files.upload({
  file: fs.readFileSync('whitepaper.pdf'),
  config: { mimeType: 'application/pdf', displayName: 'White Paper' },
});

await ai.models.generateContent({
  model: 'gemini-2.0-flash',
  contents: [
    'Summarise section 3 only',
    createPartFromUri(pdf.uri, pdf.mimeType),
  ],
});
```

Files live **48 h**, max 50 MB.

---

#### 5  · Long‑context patterns (1 M–2 M tokens)

* Put query **after** huge context.
* Use **Context Caching** when the same 100k‑token corpus is reused by many users.
* Avoid redundant history: send only what the model truly needs.

---

#### 6  · Image generation

**Gemini 2.0 Flash (native) – Text → Image**

```ts
import { GoogleGenAI, Modality } from '@google/genai';
const res = await ai.models.generateContent({
  model: 'gemini-2.0-flash-preview-image-generation',
  contents: 'A vintage poster of Vienna at dawn',
  config: { responseModalities: [Modality.TEXT, Modality.IMAGE] },
});
saveInlineImage(res, 'vienna.png');
```

*Choose Imagen 3 for photorealistic marketing shots; Gemini for conversational edits.*

---

#### 7  · Image understanding & computer‑vision tasks

```ts
const base64 = fs.readFileSync('kitchen.jpg', 'base64');
const result = await ai.models.generateContent({
  model: 'gemini-2.0-flash',
  contents: [
    { inlineData: { mimeType: 'image/jpeg', data: base64 } },
    { text: 'Detect all green objects; return bbox [ymin,xmin,ymax,xmax].' },
  ],
});
```

Segmentation masks (2.5 models) return a `mask` PNG plus bounding box metadata.

---

#### 8  · Document understanding (PDF, DOCX, etc.)

```ts
const pdfData = await fetch(pdfUrl).then(r => r.arrayBuffer());
await ai.models.generateContent({
  model: 'gemini-2.0-flash',
  contents: [
    'Draft an abstract:',
    { inlineData: { mimeType: 'application/pdf', data: Buffer.from(pdfData).toString('base64') } },
  ],
});
```

Up to **1 000 pages**; PDFs count \~258 tokens per page.

---

#### 9  · Structured‑output & JSON schemas

```ts
import { Type } from '@google/genai';

await ai.models.generateContent({
  model: 'gemini-2.0-flash',
  contents: 'Give three coffees with origin & roast level.',
  config: {
    responseMimeType: 'application/json',
    responseSchema: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        propertyOrdering: ['name', 'origin', 'roast'],
        properties: {
          name: { type: Type.STRING },
          origin: { type: Type.STRING },
          roast: { type: Type.STRING, enum: ['light', 'medium', 'dark'] },
        },
      },
    },
  },
});
```

*Using schemas increases reliability vs. “JSON in prompt”.*

---

#### 10  · “Thinking” (2.5 series advanced reasoning)

```ts
await ai.models.generateContent({
  model: 'gemini-2.5-pro-preview-06-05',
  contents: 'Prove that √2 is irrational.',
  config: { thinkingConfig: { includeThoughts: true, thinkingBudget: 2048 } },
});
```

`includeThoughts` streams short summaries; full thoughts cost tokens counted in `usageMetadata.thoughtsTokenCount`.

---

#### 11  · Function calling (tools)

```ts
const scheduleMeeting = {
  name: 'schedule_meeting',
  description: 'Schedules a meeting in Google Calendar',
  parameters: { type: Type.OBJECT, properties: {
      date: { type: Type.STRING },
      time: { type: Type.STRING },
      participants: { type: Type.ARRAY, items: { type: Type.STRING } },
  }, required: ['date','time','participants'] },
};

const res = await ai.models.generateContent({
  model: 'gemini-2.0-flash',
  contents: 'Book lunch with Alice & Bob tomorrow at 12:30.',
  config: { tools: [{ functionDeclarations: [scheduleMeeting] }] },
});

if (res.functionCalls?.length) {
  const call = res.functionCalls[0];       // your code executes it
  const confirmation = await calendarApi(call.args);
  // send functionResponse back for a friendly reply
}
```

Parallel & compositional calls are supported; Python SDK can do automatic tool loops.

---

#### 12  · Code execution (Python sandbox)

```ts
await ai.models.generateContent({
  model: 'gemini-2.0-flash',
  contents: 'Plot sin(x) and cos(x) from –π to π.',
  config: { tools: [{ codeExecution: {} }] },
});
```

The response parts include `executableCode` (Python) and a base‑64 PNG from matplotlib. Runtime ≤ 30 s; only whitelisted libraries.

---

#### 13  · URL context tool

```ts
await ai.models.generateContent({
  model: 'gemini-2.5-flash-preview-05-20',
  contents: ['Summarise the pros/cons of ', 'https://example.com/review'],
  config: { tools: [{ urlContext: {} }] },
});
```

`response.candidates[0].urlContextMetadata` lists fetched URLs & status codes.

---

#### 14  · Grounding with Google Search

```ts
await ai.models.generateContent({
  model: 'gemini-2.0-flash',
  contents: 'Who won yesterday’s F1 race?',
  config: { tools: [{ googleSearch: {} }] },
});
```

*Display* the returned **Google Search Suggestion** chip exactly as provided (`groundingMetadata.searchEntryPoint.renderedContent`) and link users directly to the SRP.

Dynamic Retrieval (1.5 Flash): set

```ts
toolConfig: { googleSearch: { dynamicRetrieval: { threshold: 0.5 } } }
```

to trigger search only when prediction‑score ≥ threshold.

---

#### 15  · Combining tools

Tools can be mixed:

```ts
tools: [
  { googleSearch: {} },
  { urlContext: {} },
  { codeExecution: {} },
  { functionDeclarations: [myFn] },
]
```

Live‑API WebSockets enable **real‑time** compositional loops.

---

#### 16  · Performance & cost checklist

* **Batch prompts** and stream results.
* **Cache context** (large PDFs, vectorised KBs).
* Use **2.0 Flash** by default, switch to **Pro/Thinking** only when metrics show gains.
* Keep images ≤ 384×384 px when quality is unimportant to save tokens.
* Ship **source‑map‑aware** builds for Node 20 / Cloud Functions – large bundles can delay cold‑starts.

---

#### 17  · Testing & linting

* Write Jest tests that mock the SDK and assert on generated function calls.
* ESLint rule: ban inline `apiKey` literals.
* Validate JSON schemas with Ajv before sending to `responseSchema`.

---

#### 18  · Security & compliance

* Store keys in **Secret Manager** or CI secrets.
* Respect Gemini **Prohibited Use** (financial advice, medical instructions, disallowed content).
* Follow Google trademark rules when showing Search Suggestions.

---

#### 19  · Migration & future‑proofing

* Replace deprecated `gemini-2.0-flash-exp` with `gemini-2.0-flash`.
* Preview endpoints (`2.5‑*`) change without notice—use feature flags.
* Watch the [release‑notes](https://ai.google.dev/release-notes) feed.

---

### Voilà — Your TypeScript project is ready to leverage *every* Gemini capability, from 1‑line text generation to fully‑grounded, tool‑rich, multimodal workflows. Happy building! 🚀
