import { aiStageExecution, type AiStageExecutionInput } from './ai-stage-execution';
import { generateWithDirectGemini, generateStreamWithDirectGemini } from '@/ai/direct-gemini';

// Mock the direct-gemini module
jest.mock('@/ai/direct-gemini', () => ({
  generateWithDirectGemini: jest.fn(),
  generateStreamWithDirectGemini: jest.fn(),
}));


describe('aiStageExecution Flow', () => {
  const mockGenerate = ai.generate as jest.MockedFunction<typeof ai.generate>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call ai.generate with text prompt only when no imageData is provided', async () => {
    const input: AiStageExecutionInput = {
      promptTemplate: 'Describe this text.',
      model: 'googleai/gemini-pro',
      temperature: 0.7,
    };

    const mockResponse = {
      text: () => 'AI text response',
      // Add other GenerateResponse properties if needed by the code under test
    } as unknown as GenerateResponse;
    mockGenerate.mockResolvedValue(mockResponse);

    const result = await aiStageExecution(input);

    expect(mockGenerate).toHaveBeenCalledTimes(1);
    expect(mockGenerate).toHaveBeenCalledWith({
      prompt: [{ text: 'Describe this text.' }],
      model: 'googleai/gemini-pro',
      config: { temperature: 0.7 },
    });
    expect(result.content).toBe('AI text response');
  });

  it('should call ai.generate with multimodal prompt when imageData is provided', async () => {
    const input: AiStageExecutionInput = {
      promptTemplate: 'Describe this image and text.',
      model: 'googleai/gemini-pro-vision',
      temperature: 0.5,
      imageData: {
        fileName: 'image.jpg',
        mimeType: 'image/jpeg',
        data: 'base64encodedimagedata',
      },
    };

    const mockResponse = {
      text: () => 'AI multimodal response',
    } as unknown as GenerateResponse;
    mockGenerate.mockResolvedValue(mockResponse);

    const result = await aiStageExecution(input);

    expect(mockGenerate).toHaveBeenCalledTimes(1);
    expect(mockGenerate).toHaveBeenCalledWith({
      prompt: [
        { text: 'Describe this image and text.' },
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: 'base64encodedimagedata',
          },
        },
      ],
      model: 'googleai/gemini-pro-vision',
      config: { temperature: 0.5 },
    });
    expect(result.content).toBe('AI multimodal response');
  });

  it('should use default model and temperature if not provided', async () => {
    const input: AiStageExecutionInput = {
      promptTemplate: 'Just text.',
    };
     const mockResponse = {
      text: () => 'AI default response',
    } as unknown as GenerateResponse;
    mockGenerate.mockResolvedValue(mockResponse);

    await aiStageExecution(input);

    expect(mockGenerate).toHaveBeenCalledWith({
      prompt: [{ text: 'Just text.' }],
      // No model or config here, letting Genkit handle defaults
    });
  });

  it('should handle AI generation error', async () => {
    const input: AiStageExecutionInput = { promptTemplate: 'Test prompt' };
    mockGenerate.mockRejectedValue(new Error('AI failed'));

    await expect(aiStageExecution(input)).rejects.toThrow('AI failed');
  });

   it('should throw error if AI response content is undefined', async () => {
    const input: AiStageExecutionInput = { promptTemplate: 'Test prompt' };
    const mockResponse = {
      text: () => undefined, // Simulate undefined content
    } as unknown as GenerateResponse;
    mockGenerate.mockResolvedValue(mockResponse);

    await expect(aiStageExecution(input)).rejects.toThrow('AI generation returned no content.');
  });

  it('should call ai.generate with enableThinking and extract thinkingSteps if thinkingSettings.enabled is true', async () => {
    const input: AiStageExecutionInput = {
      promptTemplate: 'Solve this complex problem.',
      model: 'googleai/gemini-pro',
      thinkingSettings: { enabled: true },
    };

    // Mock a response that includes tool_calls-like data
    const mockToolCall = { function: { name: 'calculator', args: { query: '2+2' } } };
    const mockResponse = {
      text: () => 'The answer is 4.',
      candidates: [{ message: { toolCalls: [mockToolCall] } }]
    } as any; // Cast to any to easily mock complex GenerateResponse structure
    mockGenerate.mockResolvedValue(mockResponse);

    const result = await aiStageExecution(input);

    expect(mockGenerate).toHaveBeenCalledTimes(1);
    expect(mockGenerate).toHaveBeenCalledWith(expect.objectContaining({
      prompt: [{ text: 'Solve this complex problem.' }],
      model: 'googleai/gemini-pro',
      config: { enableThinking: true },
    }));
    expect(result.content).toBe('The answer is 4.');
    expect(result.thinkingSteps).toBeDefined();
    expect(result.thinkingSteps).toEqual([
      `Tool Call: calculator Args: ${JSON.stringify({ query: '2+2' })}`
    ]);
  });

  it('should not include enableThinking or thinkingSteps if thinkingSettings.enabled is false or undefined', async () => {
    const input: AiStageExecutionInput = {
      promptTemplate: 'Simple prompt.',
      // thinkingSettings.enabled is false by default if thinkingSettings is provided but enabled is missing
      // or thinkingSettings itself is undefined
    };
     const mockResponse = {
      text: () => 'Simple answer.',
      candidates: [{ message: {} }]
    } as any;
    mockGenerate.mockResolvedValue(mockResponse);

    const result = await aiStageExecution(input);

    expect(mockGenerate).toHaveBeenCalledWith(expect.objectContaining({
      prompt: [{ text: 'Simple prompt.' }],
      // config should either be undefined or not contain enableThinking
    }));
    const calledConfig = (mockGenerate.mock.calls[0][0] as any).config;
    expect(calledConfig === undefined || calledConfig.enableThinking === undefined).toBe(true);

    expect(result.content).toBe('Simple answer.');
    expect(result.thinkingSteps).toBeUndefined();
  });

  describe('Function Calling / Tool Usage', () => {
    // Mock the actual tool function from sample-tools
    const mockSimpleCalculatorFn = jest.fn();

    beforeAll(() => {
      // Mock the dynamic import of tools
      jest.mock('@/ai/tools/tool-definitions', () => ({
        simpleCalculatorDefinition: {
          name: 'simpleCalculator',
          description: 'Test calculator',
          inputSchema: {} as any, // Mock schema
          outputSchema: {} as any, // Mock schema
          fn: mockSimpleCalculatorFn, // Use our jest mock here
        },
        weatherToolDefinition: {
          name: 'weatherTool',
          description: 'Another test tool',
          fn: jest.fn(),
        }
      }));
    });

    afterAll(() => {
      jest.unmock('@/ai/tools/tool-definitions'); // Clean up the mock
    });

    beforeEach(() => {
      mockSimpleCalculatorFn.mockClear();
      mockGenerate.mockClear(); // Clear mockGenerate calls too
    });

    it('should call a tool and return its result to the model, then get final answer', async () => {
      const input: AiStageExecutionInput = {
        promptTemplate: 'What is 2 plus 2?',
        toolNames: ['simpleCalculator'], // Make calculator available
      };

      // Mock sequence:
      // 1. Model requests simpleCalculator(2, 2)
      // 2. We provide result: 4
      // 3. Model gives final answer based on result.
      mockGenerate
        .mockResolvedValueOnce({ // First call: model requests tool
          text: () => undefined,
          toolRequests: () => [{ name: 'simpleCalculator', ref: 'ref123', input: { operation: 'add', a: 2, b: 2 } }],
          candidates: [{ message: { content: [{type: 'tool_code', tool_code: {tool_name: 'simpleCalculator', input: { operation: 'add', a: 2, b: 2 }}}]} }]
        } as any)
        .mockResolvedValueOnce({ // Second call: model gives final answer
          text: () => 'The sum is 4.',
          toolRequests: () => [],
          candidates: [{ message: { content: [{type: 'text', text: 'The sum is 4.'}] } }]
        } as any);

      mockSimpleCalculatorFn.mockResolvedValue({ result: 4 }); // Mock tool implementation

      const result = await aiStageExecution(input);

      expect(mockGenerate).toHaveBeenCalledTimes(2);
      // Check first call to AI (initial prompt, tools passed)
      expect((mockGenerate.mock.calls[0][0] as any).tools).toBeDefined();
      expect((mockGenerate.mock.calls[0][0] as any).tools.length).toBe(1);
      expect((mockGenerate.mock.calls[0][0] as any).tools[0].name).toBe('simpleCalculator');

      // Check that simpleCalculatorTool was called correctly
      expect(mockSimpleCalculatorFn).toHaveBeenCalledWith({ operation: 'add', a: 2, b: 2 });

      // Check history for the second AI call (should include tool response)
      const secondCallHistory = (mockGenerate.mock.calls[1][0] as any).history;
      expect(secondCallHistory).toEqual(expect.arrayContaining([
        expect.objectContaining({ role: 'user', content: expect.arrayContaining([expect.objectContaining({tool_response: {tool_request_id: 'ref123', output: {result: 4}}})]) }),
      ]));

      expect(result.content).toBe('The sum is 4.');
      expect(result.thinkingSteps).toEqual([
        { type: 'toolRequest', toolName: 'simpleCalculator', input: { operation: 'add', a: 2, b: 2 } },
        { type: 'toolResponse', toolName: 'simpleCalculator', output: { result: 4 } },
        { type: 'textLog', message: 'Final response received.'}
      ]);
    });

    it('should handle tool execution error and return error to model', async () => {
      const input: AiStageExecutionInput = {
        promptTemplate: 'Divide 5 by 0.',
        toolNames: ['simpleCalculator'],
      };

      mockGenerate
        .mockResolvedValueOnce({
          text: () => undefined,
          toolRequests: () => [{ name: 'simpleCalculator', ref: 'ref123', input: { operation: 'divide', a: 5, b: 0 } }],
           candidates: [{ message: { content: [{type: 'tool_code', tool_code: {tool_name: 'simpleCalculator', input: { operation: 'divide', a: 5, b: 0 }}}]} }]
        } as any)
        .mockResolvedValueOnce({ // Model acknowledges error or explains
          text: () => "I encountered an error: Cannot divide by zero.",
          toolRequests: () => [],
          candidates: [{ message: { content: [{type: 'text', text: "I encountered an error: Cannot divide by zero."}] } }]
        } as any);

      mockSimpleCalculatorFn.mockResolvedValue({ error: "Cannot divide by zero." });

      const result = await aiStageExecution(input);

      expect(mockSimpleCalculatorFn).toHaveBeenCalledWith({ operation: 'divide', a: 5, b: 0 });
      const secondCallHistory = (mockGenerate.mock.calls[1][0] as any).history;
      expect(secondCallHistory).toEqual(expect.arrayContaining([
         expect.objectContaining({ role: 'user', content: expect.arrayContaining([expect.objectContaining({tool_response: {tool_request_id: 'ref123', output: {error: "Cannot divide by zero."}}})]) }),
      ]));
      expect(result.content).toBe("I encountered an error: Cannot divide by zero.");
      expect(result.thinkingSteps).toContainEqual(
        { type: 'toolResponse', toolName: 'simpleCalculator', output: { error: "Cannot divide by zero." } }
      );
    });

    it('should only pass specified tools if toolNames are provided', async () => {
      const input: AiStageExecutionInput = {
        promptTemplate: 'Calculate 1+1',
        toolNames: ['simpleCalculator'], // Only simpleCalculator, not anotherTool
      };
      mockGenerate.mockResolvedValueOnce({ text: () => 'Result is 2.', toolRequests: () => [], candidates: [{message: {content: [{type: 'text', text: 'Result is 2.'}]}}]} as any);

      await aiStageExecution(input);

      expect((mockGenerate.mock.calls[0][0] as any).tools).toBeDefined();
      expect((mockGenerate.mock.calls[0][0] as any).tools.length).toBe(1);
      expect((mockGenerate.mock.calls[0][0] as any).tools[0].name).toBe('simpleCalculator');
    });

    it('should handle situation where requested tool is not found/allowed', async () => {
       const input: AiStageExecutionInput = {
        promptTemplate: 'Use unknownTool.',
        toolNames: ['simpleCalculator'], // unknownTool is not in this list
      };
       mockGenerate.mockResolvedValueOnce({
        text: () => undefined,
        toolRequests: () => [{ name: 'unknownTool', ref: 'ref123', input: {} }],
        candidates: [{message: {content: [{type: 'tool_code', tool_code: {tool_name: 'unknownTool', input: {}}}]}}]
      } as any)
      .mockResolvedValueOnce({ text: () => 'Sorry, I cannot use that tool.', toolRequests: () => [], candidates: [{message: {content: [{type: 'text', text: 'Sorry, I cannot use that tool.'}]}}]} as any);

      const result = await aiStageExecution(input);

      const secondCallHistory = (mockGenerate.mock.calls[1][0] as any).history;
      expect(secondCallHistory).toEqual(expect.arrayContaining([
         expect.objectContaining({ role: 'user', content: expect.arrayContaining([expect.objectContaining({tool_response: {tool_request_id: 'ref123', output: {error: "Tool unknownTool not found or not allowed."}}})]) }),
      ]));
      expect(result.content).toBe('Sorry, I cannot use that tool.');
      expect(result.thinkingSteps).toContainEqual(
        { type: 'toolResponse', toolName: 'unknownTool', output: { error: "Tool unknownTool not found or not allowed." } }
      );
    });

    it('should handle codeInterpreter tool call, execute it, and process output including images', async () => {
      const input: AiStageExecutionInput = {
        promptTemplate: 'Run this python code: print("Hello")\n# Assume code generates an image',
        toolNames: ['codeInterpreter'], // Enable codeInterpreter
      };

      const codeInterpreterRequestInput = { code: 'print("Hello")\n# Imagine matplotlib code here' };
      const codeInterpreterToolOutput = {
        stdout: 'Hello\n',
        outputFiles: [
          { name: 'plot.png', base64Data: 'dummy-base64-image-data', mimeType: 'image/png' }
        ]
      };

      mockGenerate
        .mockResolvedValueOnce({ // 1. Model requests codeInterpreter
          text: () => undefined,
          toolRequests: () => [{ name: 'codeInterpreter', ref: 'ref_code1', input: codeInterpreterRequestInput }],
          candidates: [{ message: { content: [{type: 'tool_code', tool_code: { tool_name: 'codeInterpreter', input: codeInterpreterRequestInput }}]} }]
        } as any)
        .mockResolvedValueOnce({ // 2. Model gives final answer
          text: () => 'The code executed and produced an image.',
          toolRequests: () => [],
          candidates: [{ message: { content: [{type: 'text', text: 'The code executed and produced an image.'}] } }]
        } as any);

      // We don't mock the codeInterpreter fn itself because it's assumed to be a Genkit built-in
      // that the googleAI plugin handles. The flow receives its output via the toolResponse mechanism.
      // So, the *tool.fn* call in the flow for 'codeInterpreter' would effectively be handled by Genkit/GoogleAI plugin.
      // For this test, we simulate this by having the history include the tool_response for codeInterpreter.
      // The important part is that our flow correctly processes this response.

      // To simulate the tool execution loop correctly for code interpreter,
      // we need to adjust how the history is built or how the `tool.fn` is perceived.
      // The current loop calls `tool.fn(toolRequest.input)`.
      // For a built-in tool like codeInterpreter, this `fn` isn't one we define in `tool-definitions.ts`.
      // Let's assume the Genkit `googleAI` plugin handles the execution if `codeInterpreter` is passed.
      // The test for the loop needs to reflect that the response for 'codeInterpreter' comes from the model side after execution.

      // This test needs a more refined mock of how Genkit handles built-in tools if their execution
      // is internal to the Genkit `ai.generate()` call when tools are passed.
      // If the `googleAI` plugin executes built-in tools and returns their responses transparently,
      // then our loop's `tool.fn` call for `codeInterpreter` won't happen.
      // The response from `ai.generate` would *already* be the model's turn *after* the code execution.

      // Re-thinking the mock strategy for built-in tools:
      // The current loop assumes *all* tools in `toolsToUse` have a `fn` we provide.
      // This is true for custom tools. For built-in tools, Genkit might handle them differently.
      // Option 1: The `googleAI` plugin has the `codeInterpreter.fn` internally.
      // Option 2: The model returns a `tool_code_result` directly if it executes it.

      // Let's assume our flow's `tool.fn` call is bypassed for `codeInterpreter`
      // and the response from `ai.generate` would be the model's content *after* code execution.
      // This means the tool loop as written might not execute `codeInterpreter` itself.
      // The `response.toolRequests()` would be for custom tools, and `response.text()` for final answer.
      // If `codeInterpreter` results are embedded in the message parts from the model, that's different.

      // Given the current loop structure, it *will* try to find `codeInterpreter` in `availableTools`.
      // To test the image extraction logic, we need to ensure `codeInterpreter` is "called" and returns image data.
      // So, we add `codeInterpreter` to the `allTools` mock for this test.
      jest.unmock('@/ai/tools/tool-definitions'); // Unmock to re-mock
      const mockCodeInterpreterFn = jest.fn().mockResolvedValue(codeInterpreterToolOutput);
      jest.mock('@/ai/tools/tool-definitions', () => ({
        simpleCalculatorDefinition: { name: 'simpleCalculator', fn: jest.fn() },
        codeInterpreterDefinition: { name: 'codeInterpreter', fn: mockCodeInterpreterFn }
      }));


      const result = await aiStageExecution(input);

      expect(mockGenerate).toHaveBeenCalledTimes(2); // Initial + after tool call
      expect(mockCodeInterpreterFn).toHaveBeenCalledWith(codeInterpreterRequestInput);

      expect(result.content).toBe('The code executed and produced an image.');
      expect(result.thinkingSteps).toEqual(expect.arrayContaining([
        { type: 'toolRequest', toolName: 'codeInterpreter', input: codeInterpreterRequestInput },
        { type: 'toolResponse', toolName: 'codeInterpreter', output: codeInterpreterToolOutput },
        { type: 'textLog', message: 'Final response received.'}
      ]));
      expect(result.outputImages).toBeDefined();
      expect(result.outputImages?.length).toBe(1);
      expect(result.outputImages?.[0]).toEqual({
        name: 'plot.png',
        base64Data: 'dummy-base64-image-data',
        mimeType: 'image/png',
      });

      // Restore original mock for other tests if any
      jest.unmock('@/ai/tools/tool-definitions');
      jest.mock('@/ai/tools/tool-definitions', () => ({
        simpleCalculatorDefinition: { name: 'simpleCalculator', fn: mockSimpleCalculatorFn },
        weatherToolDefinition: { name: 'weatherTool', fn: jest.fn() }
      }));
    });

    it('should correctly add fileData parts to history if fileInputs are provided', async () => {
      const input: AiStageExecutionInput = {
        promptTemplate: 'Analyze this document.',
        fileInputs: [
          { uri: 'files/doc123', mimeType: 'application/pdf' },
          { uri: 'files/img456', mimeType: 'image/jpeg' },
        ],
      };
      mockGenerate.mockResolvedValueOnce({ text: () => 'Analyzed.', toolRequests: () => [], candidates: [{message: {content: [{type: 'text', text: 'Analyzed.'}]}}]} as any);

      await aiStageExecution(input);

      expect(mockGenerate).toHaveBeenCalledTimes(1);
      const history = (mockGenerate.mock.calls[0][0] as any).history;
      expect(history[0].role).toBe('user');
      expect(history[0].content).toEqual(expect.arrayContaining([
        { text: 'Analyze this document.' },
        { fileData: { uri: 'files/doc123', mimeType: 'application/pdf' } },
        { fileData: { uri: 'files/img456', mimeType: 'image/jpeg' } },
      ]));
    });
  });

  describe('Streaming and Chat', () => {
    const mockStreamingCallback = jest.fn();

    beforeEach(() => {
        mockStreamingCallback.mockClear();
        // Ensure ai.stream is a mock for these tests if not globally mocked for generate
        if (!(ai as any).stream || !(ai as any).stream.mockClear) {
            (ai as any).stream = jest.fn();
        }
        (ai as any).stream.mockClear();
    });

    const mockStreamChunkIterator = (chunks: any[]) => {
      let index = 0;
      return {
        async *[Symbol.asyncIterator]() {
          while (index < chunks.length) {
            await Promise.resolve(); // Simulate async delay
            yield chunks[index++];
          }
        },
        // Mock a messages() method if the flow uses it to get final aggregated messages
        messages: () => {
            // This mock for messages() needs to accurately reflect how Genkit aggregates stream chunks
            // For simplicity, assume it concatenates text content from model role.
            const modelParts: any[] = [];
            let finalToolRequests: any[] | undefined = undefined;
            chunks.forEach(chunk => {
                if (chunk.content) modelParts.push({text: chunk.content});
                if (chunk.toolRequests) finalToolRequests = chunk.toolRequests; // Overwrites, assumes tool reqs come in last relevant chunk
            });
            if (modelParts.length > 0 || finalToolRequests) {
                 return [{role: 'model', parts: modelParts, toolRequests: finalToolRequests}];
            }
            return [];
        }
      };
    };

    it('should process a simple text stream and update chat history', async () => {
      const input: AiStageExecutionInput = {
        promptTemplate: 'Hello AI',
        chatHistory: [{ role: 'user', parts: [{ text: 'Previous question' }] }],
        systemInstructions: 'Be brief.',
      };
      const streamChunks = [
        { content: 'Hi ' },
        { content: 'there!' },
      ];
      ((ai as any).stream as jest.Mock).mockResolvedValue(mockStreamChunkIterator(streamChunks));

      const result = await aiStageExecution(input);

      expect((ai as any).stream).toHaveBeenCalledTimes(1);
      const generateOptions = ((ai as any).stream as jest.Mock).mock.calls[0][0];

      // Check system instruction handling (depends on final implementation in flow)
      // For this test, we assume system instruction is passed in options if supported,
      // or prepended to history (which is what the current flow code does if not in options).
      if (generateOptions.system) {
        expect(generateOptions.system).toBe('Be brief.');
      } else {
        expect(generateOptions.history[0]).toEqual( {role: 'system', parts: [{text: 'Be brief.'}]});
        expect(generateOptions.history[1]).toEqual({ role: 'user', parts: [{ text: 'Previous question' }] });
        expect(generateOptions.history[2]).toEqual({ role: 'user', parts: [{ text: 'Hello AI' }] });
      }

      expect(result.content).toBe('Hi there!');
      expect(result.updatedChatHistory).toEqual(expect.arrayContaining([
        // System instruction might be part of history or not, depending on model/Genkit handling
        ...(generateOptions.system ? [] : [{ role: 'system', parts: [{ text: 'Be brief.' }] }]),
        { role: 'user', parts: [{ text: 'Previous question' }] },
        { role: 'user', parts: [{ text: 'Hello AI' }] },
        { role: 'model', parts: [{ text: 'Hi ' }, { text: 'there!' }] },
      ]));
      expect(result.thinkingSteps).toContainEqual({type: 'textLog', message: 'Final response received.'});
      expect(mockStreamingCallback).toHaveBeenCalledWith(expect.objectContaining({ chunk: 'Hi ' }));
      expect(mockStreamingCallback).toHaveBeenCalledWith(expect.objectContaining({ chunk: 'there!' }));
    });

    it('should handle streaming with tool calls, updating history and thinkingSteps', async () => {
        const input: AiStageExecutionInput = {
            promptTemplate: 'What is 5 + 7 using calculator?',
            toolNames: ['simpleCalculator'],
            chatHistory: [],
        };

        const mockToolCallRequestChunk = { toolRequests: [{ name: 'simpleCalculator', ref: 'calc1', input: {a:5, b:7} }] };
        // Simulate model outputting some text before deciding to call a tool
        const mockTextBeforeToolChunk = { content: "Okay, let me calculate that: "};
        const mockTextResponseChunk = { content: 'The result is 12.' };

        // Stream for the first model turn (text then tool request)
        const streamForFirstCall = mockStreamChunkIterator([mockTextBeforeToolChunk, mockToolCallRequestChunk]);
        // Stream for the second model turn (final text answer)
        const streamForSecondCall = mockStreamChunkIterator([mockTextResponseChunk]);

        ((ai as any).stream as jest.Mock)
            .mockResolvedValueOnce(streamForFirstCall)
            .mockResolvedValueOnce(streamForSecondCall);

        // Mock the custom tool function (simpleCalculator is now from the mocked module)
        const mockCalcTool = require('@/ai/tools/tool-definitions').simpleCalculatorDefinition;
        mockCalcTool.fn = jest.fn().mockResolvedValue({ result: 12 });


        const result = await aiStageExecution(input);

        expect((ai as any).stream).toHaveBeenCalledTimes(2);
        expect(mockCalcTool.fn).toHaveBeenCalledWith({a:5, b:7});
        expect(result.content).toBe("Okay, let me calculate that: The result is 12."); // Accumulated from both turns

        expect(result.updatedChatHistory).toEqual([
            {role: 'user', parts: [{text: 'What is 5 + 7 using calculator?'}]},
            {role: 'model', parts: [{text: "Okay, let me calculate that: "}]}, // Model's first turn text part
            {role: 'user', parts: [{tool_response: {tool_request_id: 'calc1', output: {result: 12}}}]},
            {role: 'model', parts: [{text: 'The result is 12.'}]},
        ]);

        expect(result.thinkingSteps).toEqual(expect.arrayContaining([
            {type: 'toolRequest', toolName: 'simpleCalculator', input: {a:5, b:7}},
            {type: 'toolResponse', toolName: 'simpleCalculator', output: {result: 12}},
            {type: 'textLog', message: 'Final response received.'},
        ]));
    });
  });
});
