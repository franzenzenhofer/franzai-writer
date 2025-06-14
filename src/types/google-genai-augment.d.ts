declare module "@google/genai" {
  interface GoogleGenAI {
    /**
     * Returns a generative model instance.
     * This helper exists in the actual SDK but is currently missing from
     * the public TypeScript typings (2025-06-14).
     */
    getGenerativeModel(options: { model: string } & Record<string, any>): any;
    /**
     * The SDK's `models` namespace used in docs but missing in typings.
     */
    models: {
      generateContent(args: any): Promise<any>;
      generateContentStream(args: any): AsyncIterable<any>;
    };
  }

  // The actual SDK exports a *class*. Declare it so TypeScript knows it
  // can be instantiated with `new GoogleGenAI({...})`.
  export const GoogleGenAI: {
    new (options: { apiKey: string }): GoogleGenAI;
  };
} 