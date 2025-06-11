import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  generateWorkflowOverview,
  GenerateWorkflowOverviewInput,
  GenerateWorkflowOverviewOutput
} from './generate-workflow-overview-flow'

// Mocking @/ai/genkit
// The factory creates an internal vi.fn() for the prompt function.
// It also exports a helper (__getInternalPromptFunction) to access this instance.
vi.mock('@/ai/genkit', () => {
  const internalMockPromptFunction = vi.fn();
  return {
    ai: {
      defineFlow: vi.fn((config, func) => func), // Simple pass-through for defineFlow
      // The mocked ai.definePrompt returns the internalMockPromptFunction instance.
      definePrompt: vi.fn(() => internalMockPromptFunction),
    },
    // Helper function exported by the mock to access the internal instance.
    __getInternalPromptFunction: () => internalMockPromptFunction,
  };
});

// Import after mocks.
// mockedGenkitAi provides access to the mocked 'ai' object (e.g., ai.definePrompt).
// __getInternalPromptFunction allows access to the function instance returned by ai.definePrompt.
import { ai as mockedGenkitAi, __getInternalPromptFunction } from '@/ai/genkit';

describe('generateWorkflowOverview Flow', () => {
  // This variable will hold the reference to the vi.fn() instance
  // that acts as our prompt function for each test.
  let currentTestPromptFunction: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Get the single, shared mock prompt function instance created by the vi.mock factory.
    currentTestPromptFunction = __getInternalPromptFunction();
    // Reset its state (calls, return values, etc.) for the current test.
    currentTestPromptFunction.mockReset();

    // Reset/reconfigure the outer mock for ai.definePrompt itself.
    // This ensures that ai.definePrompt is clean and configured to return
    // our (now reset) currentTestPromptFunction for this test.
    (mockedGenkitAi.definePrompt as ReturnType<typeof vi.fn>)
      .mockClear()
      .mockReturnValue(currentTestPromptFunction);

    // Reset defineFlow if specific call counts or behaviors for it are important per test.
    (mockedGenkitAi.defineFlow as ReturnType<typeof vi.fn>)
      .mockClear()
      .mockImplementation((config, func) => func);
  });

  const validInput: GenerateWorkflowOverviewInput = {
    workflowName: 'Content Creation Workflow',
    workflowDescription: 'A workflow that takes a topic and generates a blog post.',
    stages: [
      { title: 'Brainstorming', description: 'Generates ideas based on the topic.' },
      { title: 'Outline Generation', description: 'Creates a structured outline.' },
      { title: 'Drafting', description: 'Writes the first draft of the blog post.' },
      { title: 'Review', description: 'Reviews the draft for errors and clarity.' },
    ],
    finalOutputStageTitle: 'Drafting',
  };

  const validInputNoFinalOutput: GenerateWorkflowOverviewInput = {
    workflowName: 'Quick Summary Workflow',
    workflowDescription: 'Generates a quick summary from text.',
    stages: [
      { title: 'Summarization', description: 'Condenses the input text.' },
    ],
  };

  it('should successfully generate an overview with all inputs', async () => {
    const mockOutput: GenerateWorkflowOverviewOutput = {
      overview: 'This workflow efficiently creates blog posts, culminating in a well-written first draft.'
    };
    currentTestPromptFunction.mockResolvedValue({ output: mockOutput });

    const result = await generateWorkflowOverview(validInput);

    // Verifying that currentTestPromptFunction (the result of ai.definePrompt) is called is the key.
    // Checking that mockedGenkitAi.definePrompt itself was called can be brittle due to module load vs. test run timing.
    expect(currentTestPromptFunction).toHaveBeenCalledWith(validInput);
    expect(result).toEqual(mockOutput);
  });

  it('should successfully generate an overview when finalOutputStageTitle is not provided', async () => {
    const mockOutput: GenerateWorkflowOverviewOutput = {
      overview: 'This workflow quickly summarizes text using its summarization stage.'
    };
    currentTestPromptFunction.mockResolvedValue({ output: mockOutput });

    const result = await generateWorkflowOverview(validInputNoFinalOutput);

    expect(currentTestPromptFunction).toHaveBeenCalledWith(validInputNoFinalOutput);
    expect(result).toEqual(mockOutput);
  });

  it('should throw an error if the prompt function fails', async () => {
    const errorMessage = 'Prompt execution failed';
    currentTestPromptFunction.mockRejectedValue(new Error(errorMessage));

    await expect(generateWorkflowOverview(validInput)).rejects.toThrow(errorMessage);
  });

  it('should return null if the prompt function provides null output (reflecting current mock behavior)', async () => {
    currentTestPromptFunction.mockResolvedValue({ output: null as any });
    const result = await generateWorkflowOverview(validInput);
    // With current simple defineFlow mock, output! (if output is null) might return null in JS.
    // A real Genkit environment might throw or have schema validation.
    expect(result).toBeNull();
  });

  it('should return undefined if the prompt function provides undefined output (reflecting current mock behavior)', async () => {
    currentTestPromptFunction.mockResolvedValue({ output: undefined as any });
    const result = await generateWorkflowOverview(validInput);
    // Similar to null, output! (if output is undefined) might return undefined in JS.
    expect(result).toBeUndefined();
  });

  it('should return malformed output if schema is not enforced by current mock', async () => {
    const malformedOutput = { someOtherField: "test" };
    currentTestPromptFunction.mockResolvedValue({ output: malformedOutput as any });
    const result = await generateWorkflowOverview(validInput);
    // The unit test with current simple defineFlow mock will pass this through.
    // Real Genkit would throw a Zod schema validation error if outputSchema is defined and mismatched.
    expect(result).toEqual(malformedOutput);
  });
});
