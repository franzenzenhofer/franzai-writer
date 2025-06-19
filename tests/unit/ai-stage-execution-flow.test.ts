import { aiStageExecutionFlow, AiStageExecutionInput, AiStageOutputSchema } from '@/ai/flows/ai-stage-execution';
import { generateWithDirectGemini } from '@/ai/direct-gemini'; // Mocked
import { cleanAiResponse } from '@/lib/ai-content-cleaner'; // Mocked

// Mock dependencies
jest.mock('@/ai/direct-gemini', () => ({
  generateWithDirectGemini: jest.fn(),
}));
jest.mock('@/lib/ai-content-cleaner', () => ({
  cleanAiResponse: jest.fn(content => content), // Simple pass-through mock
}));
jest.mock('@/lib/ai-image-generator', () => ({ // Mock image generation if testing that path
  generateImages: jest.fn().mockResolvedValue({ outputImages: [{ base64Data: 'dummy', mimeType: 'image/png' }] })
}));
// Mock logging to avoid console noise or file writes during tests
jest.mock('@/lib/ai-logger', () => ({
  logToAiLog: jest.fn(),
  logGroundingMetadata: jest.fn(),
  logGroundingSources: jest.fn(),
  logUrlContextMetadata: jest.fn(),
  logThinkingMetadata: jest.fn(),
}));


describe('aiStageExecutionFlow', () => {
  let originalConsoleLog: any;

  beforeAll(() => {
    originalConsoleLog = console.log;
    console.log = jest.fn(); // Suppress console.log
  });

  afterAll(() => {
    console.log = originalConsoleLog; // Restore console.log
  });

  const baseInput: AiStageExecutionInput = {
    promptTemplate: 'Test prompt {{userInput}}',
    model: 'gemini-2.0-flash',
    contextVars: { userInput: 'test input' },
    workflow: { name: 'Test Workflow' },
    stage: { name: 'Test Stage' },
  };

  beforeEach(() => {
    // Clear mock call counts and implementations before each test
    (generateWithDirectGemini as jest.Mock).mockClear();
    (cleanAiResponse as jest.Mock).mockClear().mockImplementation(content => content);
  });

  it('should return response with mapped groundingSources and groundingMetadata when provided by direct-gemini', async () => {
    const mockDirectGeminiResponse = {
      content: 'AI response content.',
      groundingMetadata: {
        webSearchQueries: ['search query 1'],
        groundingChunks: [{ web: { uri: 'http://example.com/chunk1', title: 'Chunk 1 Title' } }],
      },
      groundingSources: [
        { uri: 'http://example.com/source1', title: 'Source 1 Title', snippet: 'Snippet for source 1' },
      ],
      usageMetadata: { promptTokenCount: 10, candidatesTokenCount: 20, totalTokenCount: 30 },
    };
    (generateWithDirectGemini as jest.Mock).mockResolvedValue(mockDirectGeminiResponse);

    const result = await aiStageExecutionFlow(baseInput);

    expect(result.content).toBe('AI response content.');
    expect(result.groundingMetadata).toEqual(mockDirectGeminiResponse.groundingMetadata);
    expect(result.groundingSources).toEqual([
      { type: 'search', url: 'http://example.com/source1', title: 'Source 1 Title', snippet: 'Snippet for source 1' },
    ]);
    expect(result.usageMetadata?.totalTokenCount).toBe(30);
    expect(generateWithDirectGemini).toHaveBeenCalledTimes(1);
  });

  it('should return response with undefined grounding when not provided by direct-gemini', async () => {
    const mockDirectGeminiResponse = {
      content: 'AI response content without grounding.',
      // No groundingMetadata or groundingSources
      usageMetadata: { promptTokenCount: 5, candidatesTokenCount: 10, totalTokenCount: 15 },
    };
    (generateWithDirectGemini as jest.Mock).mockResolvedValue(mockDirectGeminiResponse);

    const result = await aiStageExecutionFlow(baseInput);

    expect(result.content).toBe('AI response content without grounding.');
    expect(result.groundingMetadata).toBeUndefined();
    expect(result.groundingSources).toBeUndefined(); // or .toEqual([]) depending on impl. if sources is empty array vs undefined
    expect(generateWithDirectGemini).toHaveBeenCalledTimes(1);
  });

  it('should handle image generation stage correctly (bypassing grounding)', async () => {
    const imageInput: AiStageExecutionInput = {
      ...baseInput,
      stageOutputType: 'image',
      imageGenerationSettings: { provider: 'gemini' }, // Mock will handle this
    };
    // generateWithDirectGemini should not be called for image generation
    // generateImages (mocked) will be called by aiStageExecutionFlow

    const result = await aiStageExecutionFlow(imageInput);

    expect(result.content).toBeDefined(); // Should be image data
    expect(result.content.outputImages).toBeDefined();
    expect(result.groundingMetadata).toBeUndefined();
    expect(result.groundingSources).toBeUndefined();
    expect(generateWithDirectGemini).not.toHaveBeenCalled();
  });
});
