import React from 'react';
import { render } from '@testing-library/react';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StageOutputArea } from './stage-output-area';
import type { Stage, StageState } from '@/types';

// Mock child components
jest.mock('@/components/json-renderer', () => ({
  JsonRenderer: jest.fn(({ data }) => <pre>{JSON.stringify(data, null, 2)}</pre>),
}));
jest.mock('@/components/markdown-renderer', () => ({
  MarkdownRenderer: jest.fn(({ content }) => <div>{content}</div>),
}));

const mockOnOutputChange = jest.fn();

const defaultStageProps: Stage = {
  id: 'test-stage',
  title: 'Test Stage',
  description: 'Test Description',
  inputType: 'none',
  outputType: 'text',
  dependencies: [],
  autoRun: false,
};

const defaultStageState: StageState = {
  stageId: 'test-stage',
  status: 'completed',
  output: 'Default output',
  depsAreMet: true,
  isEditingOutput: false,
  thinkingSteps: undefined,
};

const renderComponent = (props: Partial<{ stage: Stage; stageState: StageState; isEditingOutput: boolean; onOutputChange: jest.Mock<any,any,any>}> = {}) => {
  const combinedProps = {
    stage: defaultStageProps,
    stageState: defaultStageState,
    isEditingOutput: false,
    onOutputChange: mockOnOutputChange,
    ...props,
  };
  // Ensure stageId in stageState matches stage.id for consistency
  combinedProps.stageState.stageId = combinedProps.stage.id;

  return render(<StageOutputArea {...combinedProps} />);
};

describe('StageOutputArea', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders "No output yet" message if status is not completed or output is undefined', () => {
    renderComponent({ stageState: { ...defaultStageState, status: 'running', output: undefined } });
    expect(screen.getByText('AI is generating output...')).toBeInTheDocument();

    renderComponent({ stageState: { ...defaultStageState, status: 'idle', output: undefined } });
    expect(screen.getByText('No output yet for this stage.')).toBeInTheDocument();
  });

  it('renders text output correctly', () => {
    renderComponent({ stageState: { ...defaultStageState, output: 'This is text output.' } });
    expect(screen.getByText('This is text output.')).toBeInTheDocument();
  });

  it('renders Markdown output correctly', () => {
    const markdownContent = "# Hello\nThis is markdown.";
    renderComponent({
      stage: { ...defaultStageProps, outputType: 'markdown' },
      stageState: { ...defaultStageState, output: markdownContent },
    });
    // MarkdownRenderer mock will just render the content in a div
    expect(screen.getByText(markdownContent)).toBeInTheDocument();
  });

  it('renders JSON output correctly using JsonRenderer', () => {
    const jsonData = { key: 'value', nested: { number: 123 } };
    renderComponent({
      stage: { ...defaultStageProps, outputType: 'json' },
      stageState: { ...defaultStageState, output: jsonData },
    });
    expect(screen.getByText(JSON.stringify(jsonData, null, 2))).toBeInTheDocument();
  });

  describe('Thinking Steps Display', () => {
    const stageWithThinking: Stage = {
      ...defaultStageProps,
      id: 'thinking-stage',
      outputType: 'text',
    };

    it('renders structured thinking steps (tool request/response/log) if provided in stageState', () => {
      const thinkingSteps: any[] = [ // Use any for testing flexibility with ThinkingStep structure
        { type: 'toolRequest', toolName: 'simpleCalculator', input: { operation: 'add', a: 1, b: 2 } },
        { type: 'toolResponse', toolName: 'simpleCalculator', output: { result: 3 } },
        { type: 'textLog', message: 'Finalizing answer.'}
      ];
      renderComponent({
        stage: stageWithThinking,
        stageState: {
          ...defaultStageState,
          stageId: stageWithThinking.id,
          status: 'completed',
          output: 'Final Answer is 3.',
          thinkingSteps: thinkingSteps,
        },
      });

      expect(screen.getByText('Thinking Process')).toBeInTheDocument();

      // Check for tool request rendering
      expect(screen.getByText('Tool Call:')).toBeInTheDocument();
      expect(screen.getByText('simpleCalculator')).toBeInTheDocument(); // Tool name
      expect(screen.getByText(/"operation": "add"/)).toBeInTheDocument(); // Part of input JSON

      // Check for tool response rendering
      expect(screen.getByText(/Result from/)).toBeInTheDocument();
      expect(screen.getByText(/"result": 3/)).toBeInTheDocument(); // Part of output JSON

      // Check for text log
      expect(screen.getByText('Finalizing answer.')).toBeInTheDocument();
    });

    it('does not render thinking steps card if not provided or empty', () => {
      renderComponent({
        stage: stageWithThinking,
        stageState: {
          ...defaultStageState,
          stageId: stageWithThinking.id,
          status: 'completed',
          output: 'Final Answer.',
          thinkingSteps: [], // Empty array
        },
      });
      expect(screen.queryByText('Thinking Process')).not.toBeInTheDocument();

      renderComponent({
        stage: stageWithThinking,
        stageState: {
          ...defaultStageState,
          stageId: stageWithThinking.id,
          status: 'completed',
          output: 'Final Answer.',
          thinkingSteps: undefined, // Undefined
        },
      });
      expect(screen.queryByText('Thinking Process')).not.toBeInTheDocument();
    });

    it('does not render thinking steps if isEditingOutput is true', () => {
        const thinkingSteps = ["Step 1: Initial thought."];
        renderComponent({
          stage: stageWithThinking,
          stageState: {
            ...defaultStageState,
            stageId: stageWithThinking.id,
            status: 'completed',
            output: 'Final Answer.',
            thinkingSteps: thinkingSteps as any,
          },
          isEditingOutput: true,
        });

        expect(screen.queryByText('Thinking Process')).not.toBeInTheDocument();
    });
  });

  describe('Generated Images Display', () => {
    const stageWithImageOutput: Stage = {
      ...defaultStageProps,
      id: 'image-output-stage',
      outputType: 'text',
    };

    it('renders generated images if provided in stageState', () => {
      const outputImages = [
        { name: 'plot1.png', base64Data: 'dummyBase64Data1', mimeType: 'image/png' },
        { base64Data: 'dummyBase64Data2', mimeType: 'image/jpeg' }, // Image without a name
      ];
      renderComponent({
        stage: stageWithImageOutput,
        stageState: {
          ...defaultStageState,
          stageId: stageWithImageOutput.id,
          status: 'completed',
          output: 'Generated some images.',
          outputImages: outputImages,
        },
      });

      expect(screen.getByText('Generated Images')).toBeInTheDocument();
      expect(screen.getByAltText('plot1.png')).toHaveAttribute('src', 'data:image/png;base64,dummyBase64Data1');
      expect(screen.getByAltText('Generated Image 2')).toHaveAttribute('src', 'data:image/jpeg;base64,dummyBase64Data2');
    });

    it('does not render generated images card if not provided or empty', () => {
      renderComponent({
        stage: stageWithImageOutput,
        stageState: { ...defaultStageState, stageId: stageWithImageOutput.id, status: 'completed', output: 'No images.', outputImages: [] },
      });
      expect(screen.queryByText('Generated Images')).not.toBeInTheDocument();

      renderComponent({
        stage: stageWithImageOutput,
        stageState: { ...defaultStageState, stageId: stageWithImageOutput.id, status: 'completed', output: 'No images.', outputImages: undefined },
      });
      expect(screen.queryByText('Generated Images')).not.toBeInTheDocument();
    });

    it('does not render generated images if isEditingOutput is true', () => {
      const outputImages = [{ base64Data: 'dummyBase64Data1', mimeType: 'image/png' }];
      renderComponent({
        stage: stageWithImageOutput,
        stageState: {
          ...defaultStageState,
          stageId: stageWithImageOutput.id,
          status: 'completed',
          output: 'Image generated.',
          outputImages: outputImages,
        },
        isEditingOutput: true,
      });
      expect(screen.queryByText('Generated Images')).not.toBeInTheDocument();
    });
  });

  describe('Chat Enabled Output Area', () => {
    const chatStageConfig: Stage = {
      ...defaultStageProps,
      id: 'chat-output-stage',
      chatEnabled: true,
    };

    it('renders chat history if chatEnabled and history exists', () => {
      const chatHistory = [
        { role: 'user' as const, parts: [{ text: 'Hello AI!' }] },
        { role: 'model' as const, parts: [{ text: 'Hello User!' }] },
      ];
      renderComponent({
        stage: chatStageConfig,
        stageState: { ...defaultStageState, stageId: chatStageConfig.id, status: 'completed', chatHistory: chatHistory, output: 'Hello User!' }, // output might be last message
      });

      expect(screen.getByText('user')).toBeInTheDocument(); // Role
      expect(screen.getByText('Hello AI!')).toBeInTheDocument();
      expect(screen.getByText('model')).toBeInTheDocument(); // Role
      expect(screen.getByText('Hello User!')).toBeInTheDocument();
    });

    it('renders "No messages yet" if chatEnabled and no history', () => {
      renderComponent({
        stage: chatStageConfig,
        stageState: { ...defaultStageState, stageId: chatStageConfig.id, status: 'idle', chatHistory: [] },
      });
      expect(screen.getByText('No messages yet. Send a message to start the chat.')).toBeInTheDocument();
    });

    it('renders streaming output if status is running and currentStreamOutput exists', () => {
      const chatHistory = [{ role: 'user' as const, parts: [{ text: 'Tell me a story.' }] }];
      renderComponent({
        stage: chatStageConfig,
        stageState: {
            ...defaultStageState,
            stageId: chatStageConfig.id,
            status: 'running',
            chatHistory: chatHistory,
            currentStreamOutput: "Once upon a time"
        },
      });
      expect(screen.getByText("Once upon a time...")).toBeInTheDocument(); // "..." is added by component
    });
     it('renders "AI is thinking..." if status is running and no currentStreamOutput for chat', () => {
      renderComponent({
        stage: chatStageConfig,
        stageState: { ...defaultStageState, stageId: chatStageConfig.id, status: 'running', chatHistory: [] },
      });
      expect(screen.getByText('AI is thinking...')).toBeInTheDocument();
    });
  });
});
