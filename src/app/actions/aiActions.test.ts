import { runAiStage } from './aiActions';
import type { StageState, Stage } from '@/types';

// Mock the dynamic import of ai-stage-execution
const mockAiStageExecutionFlow = jest.fn();

jest.mock('@/ai/flows/ai-stage-execution', () => ({
  aiStageExecutionFlow: mockAiStageExecutionFlow,
}));

describe('runAiStage Action', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetAllMocks();
    process.env = { ...OLD_ENV, GOOGLE_GENAI_API_KEY: 'test-api-key' }; // Set mock API key
  });

  afterAll(() => {
    process.env = OLD_ENV; // Restore old environment
  });

  const baseParams = {
    promptTemplate: "Analyze this: {{topic.output}}",
    contextVars: {
      topic: { userInput: "AI", output: "Artificial Intelligence" } as StageState,
    },
    stageOutputType: 'text' as Stage['outputType'],
    model: 'gemini-pro',
    temperature: 0.7,
  };

  it('should call aiStageExecutionFlow with text prompt when no image data is in currentStageInput', async () => {
    mockAiStageExecutionFlow.mockResolvedValue({ content: "AI response" });

    await runAiStage({
      ...baseParams,
      currentStageInput: { text: "some text input" }, // Not image data
    });

    expect(mockAiStageExecutionFlow).toHaveBeenCalledTimes(1);
    expect(mockAiStageExecutionFlow).toHaveBeenCalledWith(expect.objectContaining({
      promptTemplate: "Analyze this: Artificial Intelligence",
      model: 'gemini-pro',
      temperature: 0.7,
      // No imageData field expected
    }));
  });

  it('should call aiStageExecutionFlow with imageData when currentStageInput contains image data', async () => {
    mockAiStageExecutionFlow.mockResolvedValue({ content: "AI image response" });
    const imageData = {
      fileName: 'cat.jpg',
      mimeType: 'image/jpeg',
      data: 'base64catdata',
    };

    await runAiStage({
      ...baseParams,
      currentStageInput: imageData,
    });

    expect(mockAiStageExecutionFlow).toHaveBeenCalledTimes(1);
    expect(mockAiStageExecutionFlow).toHaveBeenCalledWith(expect.objectContaining({
      promptTemplate: "Analyze this: Artificial Intelligence",
      model: 'gemini-pro',
      temperature: 0.7,
      imageData: {
        fileName: 'cat.jpg',
        mimeType: 'image/jpeg',
        data: 'base64catdata',
      },
    }));
  });

  it('should handle JSON parsing for stageOutputType "json"', async () => {
    const jsonString = '{"key": "value", "description": "This is a test"}';
    const mockResponse = `\`\`\`json\n${jsonString}\n\`\`\``; // AI might wrap in backticks
    mockAiStageExecutionFlow.mockResolvedValue({ content: mockResponse });

    const result = await runAiStage({
      ...baseParams,
      stageOutputType: 'json',
    });

    expect(result.content).toEqual(JSON.parse(jsonString));
  });

  it('should return raw content if JSON parsing fails for stageOutputType "json"', async () => {
    const malformedJsonString = '{"key": "value", description: "Missing quotes"}';
    mockAiStageExecutionFlow.mockResolvedValue({ content: malformedJsonString });

    const result = await runAiStage({
      ...baseParams,
      stageOutputType: 'json',
    });
    expect(result.content).toBe(malformedJsonString);
  });


  it('should substitute prompt variables correctly', async () => {
    mockAiStageExecutionFlow.mockResolvedValue({ content: "Response" });
    const params = {
      promptTemplate: "User: {{user.userInput.name}}, Output: {{user.output.comment}}",
      contextVars: {
        user: {
          userInput: { name: "Alice" },
          output: { comment: "Great!" }
        } as StageState,
      },
      stageOutputType: 'text' as Stage['outputType'],
    };
    await runAiStage(params);
    expect(mockAiStageExecutionFlow).toHaveBeenCalledWith(expect.objectContaining({
      promptTemplate: 'User: Alice, Output: Great!',
    }));
  });

  it('should substitute fileContent from document analysis stage userInput', async () => {
    mockAiStageExecutionFlow.mockResolvedValue({ content: "Response based on document" });
    const params = {
      promptTemplate: "Document content: {{docInput.userInput.fileContent}}",
      contextVars: {
        docInput: {
          userInput: {
            documentName: "report.txt",
            documentType: "text/plain",
            documentSize: 123,
            fileContent: "This is the document text."
          },
          output: null, // output might be the AI's analysis of the doc
          stageId: "docInput",
          status: "completed",
          depsAreMet: true,
          isEditingOutput: false
        } as StageState,
      },
      stageOutputType: 'text' as Stage['outputType'],
    };
    await runAiStage(params);
    expect(mockAiStageExecutionFlow).toHaveBeenCalledWith(expect.objectContaining({
      promptTemplate: 'Document content: This is the document text.',
    }));
  });

  it('should pass thinkingSettings to aiStageExecutionFlow and return thinkingSteps', async () => {
    const mockThinkingSteps = [
      { type: 'textLog' as const, message: "Step 1: Thought about it." },
      { type: 'textLog' as const, message: "Step 2: Decided." }
    ];
    mockAiStageExecutionFlow.mockResolvedValue({ content: "AI response with thoughts", thinkingSteps: mockThinkingSteps });
    const thinkingSettings = { enabled: true };

    const result = await runAiStage({
      ...baseParams,
      thinkingSettings: thinkingSettings,
    });

    expect(mockAiStageExecutionFlow).toHaveBeenCalledTimes(1);
    expect(mockAiStageExecutionFlow).toHaveBeenCalledWith(expect.objectContaining({
      thinkingSettings: thinkingSettings,
    }));
    expect(result.thinkingSteps).toEqual(mockThinkingSteps);
    expect(result.content).toBe("AI response with thoughts");
  });

  it('should return undefined thinkingSteps if aiStageExecutionFlow does not return them', async () => {
    mockAiStageExecutionFlow.mockResolvedValue({ content: "AI response without thoughts" }); // No thinkingSteps here

    const result = await runAiStage({
      ...baseParams,
      thinkingSettings: { enabled: false }, // Explicitly false
    });

    expect(mockAiStageExecutionFlow).toHaveBeenCalledWith(expect.objectContaining({
      thinkingSettings: { enabled: false },
    }));
    expect(result.thinkingSteps).toBeUndefined();
  });

  it('should pass toolNames to aiStageExecutionFlow', async () => {
    mockAiStageExecutionFlow.mockResolvedValue({ content: "AI response using tools" });
    const toolNames = ["simpleCalculator"];

    await runAiStage({
      ...baseParams,
      toolNames: toolNames,
    });

    expect(mockAiStageExecutionFlow).toHaveBeenCalledTimes(1);
    expect(mockAiStageExecutionFlow).toHaveBeenCalledWith(expect.objectContaining({
      toolNames: toolNames,
    }));
  });

  it('should return outputImages if provided by aiStageExecutionFlow', async () => {
    const mockOutputImages = [{ name: 'plot.png', base64Data: '...', mimeType: 'image/png'}];
    mockAiStageExecutionFlow.mockResolvedValue({
      content: "AI response with image",
      outputImages: mockOutputImages
    });

    const result = await runAiStage(baseParams);

    expect(result.outputImages).toEqual(mockOutputImages);
    expect(result.content).toBe("AI response with image");
  });

  it('should pass fileInputs to aiStageExecutionFlow if fileUri is in currentStageInput', async () => {
    mockAiStageExecutionFlow.mockResolvedValue({ content: "AI response about a file" });
    const fileInputData = {
      documentName: 'mydoc.pdf',
      documentType: 'application/pdf', // This will be used as mimeType
      fileUri: 'files/xxxx-yyyy-zzzz',
      documentSize: 1024,
    };

    await runAiStage({
      ...baseParams,
      currentStageInput: fileInputData,
    });

    expect(mockAiStageExecutionFlow).toHaveBeenCalledWith(expect.objectContaining({
      fileInputs: [{ uri: fileInputData.fileUri, mimeType: fileInputData.documentType }],
    }));
  });

  it('should not pass fileInputs if fileUri is missing, even if other doc fields are present', async () => {
    mockAiStageExecutionFlow.mockResolvedValue({ content: "AI response" });
    const incompleteFileInputData = {
      documentName: 'mydoc.pdf',
      documentType: 'application/pdf',
      documentSize: 1024,
      // fileUri is missing
    };

    await runAiStage({
      ...baseParams,
      currentStageInput: incompleteFileInputData,
    });

    const callArgs = mockAiStageExecutionFlow.mock.calls[0]?.[0];
    expect(!callArgs || callArgs.fileInputs === undefined || callArgs.fileInputs.length === 0).toBe(true);
  });

  it('should pass systemInstructions and chatHistory to aiStageExecutionFlow and return updatedChatHistory', async () => {
    const systemInstructions = "You are a test bot.";
    const chatHistory = [{ role: 'user' as const, parts: [{ text: "Old message" }] }];
    const updatedChatHistory = [
      ...chatHistory,
      { role: 'model' as const, parts: [{ text: "New AI response" }] }
    ];
    mockAiStageExecutionFlow.mockResolvedValue({
      content: "New AI response",
      updatedChatHistory: updatedChatHistory
    });

    const result = await runAiStage({
      ...baseParams,
      promptTemplate: "New message", // currentStageInput would typically be this for chat
      systemInstructions: systemInstructions,
      chatHistory: chatHistory,
    });

    expect(mockAiStageExecutionFlow).toHaveBeenCalledWith(expect.objectContaining({
      systemInstructions: systemInstructions,
      chatHistory: chatHistory,
      promptTemplate: "New message",
    }));
    expect(result.updatedChatHistory).toEqual(updatedChatHistory);
  });

  it('should return original chatHistory on error if chatHistory was provided', async () => {
    const chatHistory = [{ role: 'user' as const, parts: [{ text: "User message" }] }];
    mockAiStageExecutionFlow.mockRejectedValue(new Error("AI execution failed"));

    const result = await runAiStage({
      ...baseParams,
      chatHistory: chatHistory,
    });

    expect(result.error).toBe("AI execution failed");
    expect(result.updatedChatHistory).toEqual(chatHistory);
  });

  it('should return error if GOOGLE_GENAI_API_KEY is missing', async () => {
    delete process.env.GOOGLE_GENAI_API_KEY;
    const result = await runAiStage(baseParams);
    expect(result.error).toBe("AI service not configured. Please check API keys.");
    expect(mockAiStageExecutionFlow).not.toHaveBeenCalled();
  });

  it('should return error if aiStageExecutionFlow throws an error', async () => {
    mockAiStageExecutionFlow.mockRejectedValue(new Error("AI execution failed"));
    const result = await runAiStage(baseParams);
    expect(result.error).toBe("AI execution failed");
  });
});
