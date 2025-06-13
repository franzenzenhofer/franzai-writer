import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

console.log('[GENKIT INIT] STEP 1: Starting Genkit initialization at', new Date().toISOString());
console.log('[GENKIT INIT] STEP 2: Environment check:');
console.log('[GENKIT INIT] - NODE_ENV:', process.env.NODE_ENV);
console.log('[GENKIT INIT] - GOOGLE_GENAI_API_KEY exists:', !!process.env.GOOGLE_GENAI_API_KEY);
console.log('[GENKIT INIT] - GOOGLE_GENAI_API_KEY length:', process.env.GOOGLE_GENAI_API_KEY?.length || 0);

// Configure Genkit once at application startup.  Tools are registered lazily by
// each flow (see ai-stage-execution.ts) after this configure() call has
// initialised the Genkit runtime store, so we intentionally do NOT import any
// user-defined tools here – importing them before configure() would trigger
// `defineTool()` while the runtime context is still un-initialised and lead to
// the `getStore` undefined error we are fixing.

let ai;

try {
  console.log('[GENKIT INIT] STEP 3: Creating Genkit instance...');
  
  ai = genkit({
    plugins: [
      googleAI({
        apiVersion: 'v1beta',
      }),
    ],
  });
  
  console.log('[GENKIT INIT] STEP 4: Genkit instance created successfully');
  console.log('[GENKIT INIT] STEP 5: AI object type:', typeof ai);
  console.log('[GENKIT INIT] STEP 6: AI object keys:', Object.keys(ai));
} catch (error) {
  console.error('[GENKIT INIT] ERROR: Failed to initialize Genkit');
  console.error('[GENKIT INIT] ERROR Details:', error);
  console.error('[GENKIT INIT] ERROR Stack:', error instanceof Error ? error.stack : 'No stack');
  throw error;
}

export { ai };
