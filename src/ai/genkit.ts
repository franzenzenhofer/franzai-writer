import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import { allTools } from './tools/sample-tools'; // Import the tools

export const ai = genkit({
  plugins: [
    googleAI({
      tools: allTools, // Custom tools
      // Attempt to enable the code interpreter tool.
      // The actual option name might differ, e.g., `enableCodeInterpreter: true`
      // or it might be enabled by default if the model supports it and no specific
      // tool filtering is applied at the request level.
      // Some platforms might require listing it as an allowed built-in tool.
      allowBuiltInTools: ['codeInterpreter'], // Hypothetical option
    }),
  ],
  model: 'googleai/gemini-2.5-flash-preview-05-20',
});
