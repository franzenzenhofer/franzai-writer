import React from 'react';
import { render, act } from '@testing-library/react';
import { screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { WizardShell } from './wizard-shell';
import type { WizardInstance, Stage, StageState } from '@/types';
import * as aiActions from '@/app/actions/aiActions'; // To mock runAiStage
import { useToast } from '@/hooks/use-toast';

// Mock child components and hooks
jest.mock('@/hooks/use-toast', () => ({
  useToast: jest.fn(() => ({ toast: jest.fn() })),
}));
jest.mock('./stage-card', () => ({
  StageCard: jest.fn(({ stage, stageState, onRunStage, isCurrentStage }) => (
    <div data-testid={`stage-card-${stage.id}`}>
      <button data-testid={`run-${stage.id}`} onClick={() => onRunStage(stage.id, stageState.userInput)}>
        Run {stage.title}
      </button>
      {isCurrentStage && <div data-testid="current-stage-indicator">Current</div>}
      <div data-testid={`output-${stage.id}`}>{typeof stageState.output === 'string' ? stageState.output : JSON.stringify(stageState.output)}</div>
      {stageState.thinkingSteps && stageState.thinkingSteps.length > 0 && (
        <div data-testid={`thinking-steps-${stage.id}`}>
          {stageState.thinkingSteps.map((step: any) => step.message || JSON.stringify(step)).join(',')}
        </div>
      )}
    </div>
  )),
}));
jest.mock('@/hooks/use-document-persistence', () => ({
  useDocumentPersistence: jest.fn(() => ({
    isSaving: false,
    lastSaved: null,
    saveError: null,
    documentId: 'test-doc-id',
    saveDocument: jest.fn(),
  })),
}));
jest.mock('./final-document-dialog', () => ({
    FinalDocumentDialog: jest.fn(() => <div data-testid="final-document-dialog">Dialog</div>)
}));


// Mock aiActions.runAiStage
const mockRunAiStage = jest.spyOn(aiActions, 'runAiStage');

const mockStagePlain: Stage = {
  id: 'plain-stage',
  title: 'Plain Stage',
  description: 'A plain stage for testing',
  inputType: 'textarea',
  outputType: 'text',
  dependencies: []
};
const mockStageAi: Stage = {
  id: 's2',
  title: 'AI Stage',
  description: 'An AI stage for testing',
  inputType: 'none',
  outputType: 'text',
  promptTemplate: 'Generate something for {{s1.output}}',
  dependencies: ['s1']
};
const mockStageAiWithThinking: Stage = {
  id: 's2',
  title: 'AI Stage with Thinking',
  description: 'An AI stage with thinking for testing',
  inputType: 'none',
  outputType: 'text',
  promptTemplate: 'Generate something for {{s1.output}}',
  dependencies: ['s1'],
  thinkingSettings: { enabled: true }
};

const initialInstance: WizardInstance = {
  document: { id: 'doc1', title: 'Test Document', workflowId: 'wf1', status: 'draft', createdAt: '', updatedAt: '', userId: '' },
  workflow: {
    id: 'wf1', name: 'Test Workflow', description: '', stages: [mockStagePlain, mockStageAi, mockStageAiWithThinking]
  },
  stageStates: {
    s1: { stageId: 's1', status: 'idle', depsAreMet: true, isEditingOutput: false },
    s2: { stageId: 's2', status: 'idle', depsAreMet: false, isEditingOutput: false },
    s3: { stageId: 's3', status: 'idle', depsAreMet: false, isEditingOutput: false },
  },
};

describe('WizardShell - Thinking Mode', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useToast as jest.Mock).mockReturnValue({ toast: jest.fn() });
  });

  it('passes thinkingSettings to runAiStage and stores thinkingSteps', async () => {
    const thinkingStepsFromAI = [
      { type: 'textLog' as const, message: "AI thought about it" },
      { type: 'textLog' as const, message: "AI decided something" }
    ];
    mockRunAiStage.mockResolvedValue({
      content: 'AI result for s3',
      thinkingSteps: thinkingStepsFromAI
    });

    // Initial render
    render(<WizardShell initialInstance={initialInstance} />);

    // Complete s1 so s3 can run
    // Directly update state for s1 as if it completed (simplifying test focus)
    // This would normally happen via user input and running s1.
    act(() => {
        const s1RunButton = screen.getByTestId('run-s1');
        // Simulate s1 input and completion
        // For this test, we'll manually trigger an update to s1's state
        // to avoid re-implementing all of handleRunStage for non-AI stages.
         fireEvent.click(s1RunButton); // This will call a simplified run for non-AI stage if StageCard mock is more detailed
    });

    // Manually update s1 state to completed to enable s3
    // In a real scenario, this would be more integrated.
    // We'll directly manipulate the instance passed to WizardShell or mock internal state updates.
    // For this test, let's assume s1 completes and its output is 's1 output'.
    // We need to re-render or update the component's state.
    // A better approach would be to mock the state update mechanism.
    // For now, let's assume handleRunStage for s1 correctly sets output.
    // The mock for StageCard is simplified, so we'll focus on s3.

    // Let's simulate s1 completion for dependency satisfaction
    const s1CompletedState: StageState = { ...initialInstance.stageStates.s1, status: 'completed', output: 's1 output', completedAt: new Date().toISOString(), depsAreMet: true };
    const mockStageAiWithTools: Stage = { // Define a stage with toolNames for this test
        ...mockStageAiWithThinking,
        toolNames: ["simpleCalculator"]
    };
    const instanceWithS1DoneAndTools: WizardInstance = {
        ...initialInstance,
        workflow: { ...initialInstance.workflow, stages: [mockStagePlain, mockStageAi, mockStageAiWithTools]}, // Use stage with tools
        stageStates: {
            ...initialInstance.stageStates,
            s1: s1CompletedState,
            s2: { ...initialInstance.stageStates.s2, depsAreMet: true },
            s3: { ...initialInstance.stageStates.s3, depsAreMet: true }  // s3 (now with tools) depends on s1
        }
    };

    // Re-render with s1 completed and s3 configured with tools
    render(<WizardShell initialInstance={instanceWithS1DoneAndTools} />);

    // Run s3 (AI stage with thinking and tools enabled)
    const runS3Button = screen.getByTestId('run-s3'); // StageCard mock uses stage.id for button testid
    await act(async () => {
      fireEvent.click(runS3Button);
      await Promise.resolve();
    });

    expect(mockRunAiStage).toHaveBeenCalledWith(expect.objectContaining({
      promptTemplate: mockStageAiWithTools.promptTemplate,
      thinkingSettings: { enabled: true },
      toolNames: ["simpleCalculator"], // Verify toolNames are passed
      contextVars: expect.objectContaining({
        s1: { userInput: undefined, output: 's1 output' }
      })
    }));

    // Check if thinking steps are displayed (mocked StageCard should show them)
    const thinkingStepsDisplay = screen.getByTestId('thinking-steps-s3');
    expect(thinkingStepsDisplay).toHaveTextContent('AI thought about it,AI decided something');
  });


  it('does not pass thinkingSettings if not defined in stage and returns no thinkingSteps', async () => {
    mockRunAiStage.mockResolvedValue({ content: 'AI result for s2' }); // No thinkingSteps in response

    // Simulate s1 completion
     const s1CompletedState: StageState = { ...initialInstance.stageStates.s1, status: 'completed', output: 's1 output', completedAt: new Date().toISOString(), depsAreMet: true };
     const instanceWithS1Done: WizardInstance = {
         ...initialInstance,
         stageStates: {
             ...initialInstance.stageStates,
             s1: s1CompletedState,
             s2: { ...initialInstance.stageStates.s2, depsAreMet: true },
             s3: { ...initialInstance.stageStates.s3, depsAreMet: true }
         }
     };
    render(<WizardShell initialInstance={instanceWithS1Done} />);

    // Run s2 (AI stage without thinking enabled)
    const runS2Button = screen.getByTestId('run-s2');
    await act(async () => {
      fireEvent.click(runS2Button);
      await Promise.resolve();
    });

    expect(mockRunAiStage).toHaveBeenCalledWith(expect.objectContaining({
      promptTemplate: mockStageAi.promptTemplate,
      thinkingSettings: undefined, // Or expect.not.objectContaining({ thinkingSettings: expect.anything() })
    }));

    // Ensure no thinking steps are displayed for s2
    expect(screen.queryByTestId('thinking-steps-s2')).toBeNull();
    expect(screen.getByTestId('output-s2')).toHaveTextContent('AI result for s2');
  });

  it('stores outputImages in stageState if returned by runAiStage', async () => {
    const mockOutputImages = [{ name: 'test.png', base64Data: 'imgdata', mimeType: 'image/png'}];
    mockRunAiStage.mockResolvedValue({
      content: 'AI result with image output',
      outputImages: mockOutputImages
    });

    // Simulate s1 completion to enable s2 (an AI stage)
    const s1CompletedState: StageState = { ...initialInstance.stageStates.s1, status: 'completed', output: 's1 output', completedAt: new Date().toISOString(), depsAreMet: true };
    const instanceWithS1Done: WizardInstance = {
        ...initialInstance,
        stageStates: { ...initialInstance.stageStates, s1: s1CompletedState, s2: { ...initialInstance.stageStates.s2, depsAreMet: true } }
    };
    const { rerender } = render(<WizardShell initialInstance={instanceWithS1Done} />);


    // Run s2 (AI stage)
    const runS2Button = screen.getByTestId('run-s2');
    await act(async () => {
      fireEvent.click(runS2Button);
      await Promise.resolve(); // allow promises to settle
    });

    // This part of the test relies on StageCard mock correctly passing updated stageState
    // For a direct check, one might need to spy on setInstance or check internal state if possible.
    // The mock for StageCard currently shows output and thinkingSteps. We'd need to extend it for outputImages.
    // However, the core logic being tested here is that WizardShell's handleRunStage correctly calls
    // updateStageState with outputImages. We trust updateStageState to set it.
    // A more integrated test would verify the StageCard displays it, but that depends on StageCard's own rendering.
    // For now, we verify runAiStage was called and assume its result (including outputImages) is passed to updateStageState.

    // To properly test if WizardShell *stores* it, we would need to:
    // 1. Get the updated instance from a callback or state if WizardShell exposed it.
    // 2. Or, ensure StageCard's mock can reflect the outputImages from the passed stageState.

    // Let's refine StageCard mock to reflect outputImages for verification
    jest.unmock('./stage-card'); // Unmock to re-mock
    jest.mock('./stage-card', () => ({
      StageCard: jest.fn(({ stage, stageState, onRunStage }) => (
        <div data-testid={`stage-card-${stage.id}`}>
          <button data-testid={`run-${stage.id}`} onClick={() => onRunStage(stage.id, stageState.userInput)}>Run {stage.title}</button>
          <div data-testid={`output-${stage.id}`}>{stageState.output as string}</div>
          {stageState.outputImages && stageState.outputImages.map((img: any, idx: number) => (
            <img key={idx} data-testid={`img-${stage.id}-${idx}`} src={`data:${img.mimeType};base64,${img.base64Data}`} alt={img.name || ''} />
          ))}
        </div>
      )),
    }));

    // Re-render with the new mock and initial state where s2 can run
    rerender(<WizardShell initialInstance={instanceWithS1Done} />);
    const runS2ButtonAgain = screen.getByTestId('run-s2'); // Get button again after re-render

    await act(async () => {
      fireEvent.click(runS2ButtonAgain);
      await Promise.resolve();
    });

    expect(screen.getByTestId('img-s2-0')).toBeInTheDocument();
    expect(screen.getByTestId('img-s2-0')).toHaveAttribute('src', 'data:image/png;base64,imgdata');
  });

  describe('WizardShell - Chat Functionality', () => {
    const mockStageChat: Stage = {
      id: 'sChat',
      title: 'Chat Stage',
      description: 'A chat stage for testing',
      inputType: 'textarea',
      outputType: 'text',
      chatEnabled: true,
      systemInstructions: 'Be a pirate.',
      dependencies: []
    };
    const initialChatInstance: WizardInstance = {
      document: { ...initialInstance.document },
      workflow: { ...initialInstance.workflow, stages: [mockStageChat] },
      stageStates: {
        sChat: { stageId: 'sChat', status: 'idle', depsAreMet: true, isEditingOutput: false, chatHistory: [] },
      },
    };

    beforeEach(() => {
        // Ensure StageCard mock is the one that can show chat history if needed for assertions
        jest.unmock('./stage-card');
        jest.mock('./stage-card', () => ({
          StageCard: jest.fn(({ stage, stageState, onRunStage }) => (
            <div data-testid={`stage-card-${stage.id}`}>
              <button data-testid={`run-${stage.id}`} onClick={() => onRunStage(stage.id, stageState.userInput)}>
                Send
              </button>
              <div data-testid={`output-${stage.id}`}>{stageState.output as string}</div>
              {stageState.chatHistory && (
                <div data-testid={`chathistory-${stage.id}`}>
                  {stageState.chatHistory.map((msg: any, idx: number) =>
                    <div key={idx} data-testid={`msg-${idx}`}>{`${msg.role}: ${msg.parts.map((p: any)=>p.text).join('')}`}</div>
                  )}
                </div>
              )}
            </div>
          )),
        }));
    });


    it('passes systemInstructions and chatHistory to runAiStage and stores updated history', async () => {
      const initialChatHistory = [{ role: 'user' as const, parts: [{text: 'Avast ye!'}] }];
      const responseChatHistory = [
        ...initialChatHistory,
        { role: 'model' as const, parts: [{text: 'Arrr, matey!'}] }
      ];
      mockRunAiStage.mockResolvedValue({
        content: 'Arrr, matey!',
        updatedChatHistory: responseChatHistory
      });

      const instanceWithChat: WizardInstance = {
        ...initialChatInstance,
        stageStates: {
            sChat: {
                ...initialChatInstance.stageStates.sChat,
                userInput: 'Avast ye!', // Current message from user
                chatHistory: [] // Initial history before this message
            }
        }
      };

      render(<WizardShell initialInstance={instanceWithChat} />);

      const runSChatButton = screen.getByTestId('run-sChat');
      await act(async () => {
        fireEvent.click(runSChatButton);
        await Promise.resolve(); // allow promises to settle
      });

      expect(mockRunAiStage).toHaveBeenCalledWith(expect.objectContaining({
        promptTemplate: 'Avast ye!', // This is the current userInput
        systemInstructions: 'Be a pirate.',
        chatHistory: [], // History *before* current user message
      }));

      // Check if chat history is displayed (mocked StageCard should show it)
      // This tests that WizardShell updated StageState correctly.
      expect(screen.getByTestId('chathistory-sChat')).toBeInTheDocument();
      expect(screen.getByTestId('msg-0')).toHaveTextContent('user: Avast ye!');
      expect(screen.getByTestId('msg-1')).toHaveTextContent('model: Arrr, matey!');
    });
  });
});
