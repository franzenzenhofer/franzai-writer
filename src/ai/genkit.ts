import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

// Configure Genkit once at application startup.  Tools are registered lazily by
// each flow (see ai-stage-execution.ts) after this configure() call has
// initialised the Genkit runtime store, so we intentionally do NOT import any
// user-defined tools here – importing them before configure() would trigger
// `defineTool()` while the runtime context is still un-initialised and lead to
// the `getStore` undefined error we are fixing.

export const ai = genkit({
  plugins: [
    googleAI({
      apiVersion: 'v1beta',
    }),
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
  // The model and other default settings can still be overridden per-request
  // inside individual flows.
});
