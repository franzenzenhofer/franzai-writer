import { describe, it, expect, vi, beforeEach } from 'vitest'
import { aiStageExecution, AiStageExecutionInput } from './ai-stage-execution'

// Mock the genkit 'ai' object and its methods directly in the factory.
vi.mock('@/ai/genkit', () => ({
  ai: {
    generate: vi.fn(),
    defineFlow: vi.fn((config, func) => {
      // The mock for defineFlow will just return the function itself,
      // allowing direct invocation of the flow's logic.
      return func;
    }),
  },
}));

// Import the mocked 'ai' object after the vi.mock call.
import { ai as mockedGenkitAi } from '@/ai/genkit';

describe('aiStageExecution Flow', () => {
  beforeEach(() => {
    // Reset the generate mock before each test.
    (mockedGenkitAi.generate as ReturnType<typeof vi.fn>).mockReset();
    // defineFlow mock is simple, might not need reset unless its implementation changes per test.
    // If it were more complex or stateful:
    // (mockedGenkitAi.defineFlow as ReturnType<typeof vi.fn>).mockReset().mockImplementation((config, func) => func);
  });

  const validInput: AiStageExecutionInput = {
    promptTemplate: 'Translate {{text}} to {{language}}.',
    model: 'gemini-pro',
    temperature: 0.7,
  };

  const validInputMinimal: AiStageExecutionInput = {
    promptTemplate: 'Summarize: {{text}}',
  };

  it('should successfully execute with all inputs', async () => {
    const mockResponseText = 'Generated content from AI.';
    (mockedGenkitAi.generate as ReturnType<typeof vi.fn>).mockResolvedValue({ text: mockResponseText });

    const result = await aiStageExecution(validInput);

    expect(mockedGenkitAi.defineFlow).toHaveBeenCalled();
    expect(mockedGenkitAi.generate).toHaveBeenCalledWith({
      prompt: validInput.promptTemplate,
      model: validInput.model,
      config: { temperature: validInput.temperature },
    });
    expect(result).toEqual({ content: mockResponseText });
  });

  it('should successfully execute with minimal inputs (model and temperature undefined)', async () => {
    const mockResponseText = 'Minimal input summary.';
    (mockedGenkitAi.generate as ReturnType<typeof vi.fn>).mockResolvedValue({ text: mockResponseText });

    const result = await aiStageExecution(validInputMinimal);

    expect(mockedGenkitAi.generate).toHaveBeenCalledWith({
      prompt: validInputMinimal.promptTemplate,
    });
    expect(result).toEqual({ content: mockResponseText });
  });

  it('should correctly pass only temperature if model is undefined', async () => {
    const mockResponseText = 'Temperature only test.';
    (mockedGenkitAi.generate as ReturnType<typeof vi.fn>).mockResolvedValue({ text: mockResponseText });
    const inputWithTempOnly: AiStageExecutionInput = {
        promptTemplate: "Test prompt",
        temperature: 0.9
    };

    await aiStageExecution(inputWithTempOnly);

    expect(mockedGenkitAi.generate).toHaveBeenCalledWith({
      prompt: "Test prompt",
      config: { temperature: 0.9 },
    });
  });

  it('should correctly pass only model if temperature is undefined', async () => {
    const mockResponseText = 'Model only test.';
    (mockedGenkitAi.generate as ReturnType<typeof vi.fn>).mockResolvedValue({ text: mockResponseText });
    const inputWithModelOnly: AiStageExecutionInput = {
        promptTemplate: "Test prompt",
        model: "specific-model"
    };

    await aiStageExecution(inputWithModelOnly);

    expect(mockedGenkitAi.generate).toHaveBeenCalledWith({
      prompt: "Test prompt",
      model: "specific-model",
    });
  });

  it('should throw an error if ai.generate fails', async () => {
    const errorMessage = 'AI generation failed';
    (mockedGenkitAi.generate as ReturnType<typeof vi.fn>).mockRejectedValue(new Error(errorMessage));

    await expect(aiStageExecution(validInput)).rejects.toThrow(errorMessage);
  });

  it('should throw an error if ai.generate returns no content (undefined text)', async () => {
    (mockedGenkitAi.generate as ReturnType<typeof vi.fn>).mockResolvedValue({ text: undefined });

    await expect(aiStageExecution(validInput)).rejects.toThrow('AI generation returned no content.');
  });

  it('should log start and success of execution', async () => {
    const consoleLogSpy = vi.spyOn(console, 'log');
    const consoleErrorSpy = vi.spyOn(console, 'error');
    (mockedGenkitAi.generate as ReturnType<typeof vi.fn>).mockResolvedValue({ text: "Logging test" });

    await aiStageExecution(validInput);

    expect(consoleLogSpy).toHaveBeenCalledWith('[AI Stage] Starting execution with input:', validInput);
    expect(consoleLogSpy).toHaveBeenCalledWith('[AI Stage] Execution successful');
    expect(consoleErrorSpy).not.toHaveBeenCalled();

    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  it('should log failure of execution', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error');
    const errorMessage = 'Simulated failure for logging';
    (mockedGenkitAi.generate as ReturnType<typeof vi.fn>).mockRejectedValue(new Error(errorMessage));

    await expect(aiStageExecution(validInput)).rejects.toThrow(errorMessage);

    expect(consoleErrorSpy).toHaveBeenCalledWith('[AI Stage] Execution failed:', expect.any(Error));

    consoleErrorSpy.mockRestore();
  });
});
