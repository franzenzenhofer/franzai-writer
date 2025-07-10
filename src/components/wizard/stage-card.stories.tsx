import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { StageCard } from './stage-card';
import type { Stage, StageState, Workflow } from '@/types';

// Mock workflow data
const mockWorkflow: Workflow = {
  id: 'sample-workflow',
  name: 'Sample AI Workflow',
  description: 'A sample workflow for Storybook demonstration',
  config: {
    setTitleFromStageOutput: 'topic-selection',
    autoScroll: {
      enabled: true,
      scrollToAutorun: true,
      scrollToManual: false,
    },
  },
  stages: [
    {
      id: 'topic-selection',
      title: 'Topic Selection',
      description: 'Choose your content topic',
      inputType: 'textarea',
      outputType: 'text',
      promptTemplate: 'Generate content about: {{userInput}}',
    },
    {
      id: 'content-generation',
      title: 'Content Generation',
      description: 'AI generates your content',
      inputType: 'none',
      outputType: 'text',
      promptTemplate: 'Create detailed content about: {{topic-selection.userInput}}',
      dependencies: ['topic-selection'],
      autoRun: true,
    },
    {
      id: 'export-stage',
      title: 'Export Document',
      description: 'Export your generated content',
      inputType: 'none',
      outputType: 'text',
      stageType: 'export',
      dependencies: ['content-generation'],
    },
  ],
};

// Mock stage configurations
const mockStages = {
  topicSelection: {
    id: 'topic-selection',
    title: 'Topic Selection',
    description: 'Choose the topic for your AI-generated content',
    inputType: 'textarea' as const,
    outputType: 'text' as const,
    promptTemplate: 'Generate content about: {{userInput}}',
    placeholder: 'Enter your topic here...',
  },
  formStage: {
    id: 'form-stage',
    title: 'Content Details',
    description: 'Provide additional details for content generation',
    inputType: 'form' as const,
    outputType: 'json' as const,
    formFields: [
      {
        name: 'title',
        label: 'Content Title',
        type: 'text',
        required: true,
        placeholder: 'Enter content title',
      },
      {
        name: 'audience',
        label: 'Target Audience',
        type: 'select',
        required: true,
        options: [
          { value: 'general', label: 'General Audience' },
          { value: 'technical', label: 'Technical Audience' },
          { value: 'business', label: 'Business Professionals' },
        ],
      },
      {
        name: 'tone',
        label: 'Content Tone',
        type: 'select',
        required: false,
        options: [
          { value: 'formal', label: 'Formal' },
          { value: 'casual', label: 'Casual' },
          { value: 'friendly', label: 'Friendly' },
        ],
      },
    ],
  },
  aiGeneration: {
    id: 'ai-generation',
    title: 'AI Content Generation',
    description: 'AI generates your content based on the provided information',
    inputType: 'none' as const,
    outputType: 'text' as const,
    promptTemplate: 'Generate content with title: {{form-stage.title}} for {{form-stage.audience}} audience',
    autoRun: true,
    dependencies: ['form-stage'],
  },
  exportStage: {
    id: 'export-stage',
    title: 'Export Document',
    description: 'Export your generated content in various formats',
    inputType: 'none' as const,
    outputType: 'text' as const,
    stageType: 'export' as const,
    dependencies: ['ai-generation'],
  },
} as const;

// Mock stage states
const mockStageStates = {
  idle: {
    stageId: 'topic-selection',
    status: 'idle' as const,
    depsAreMet: true,
    isEditingOutput: false,
    shouldAutoRun: false,
    isStale: false,
    staleDismissed: false,
    userInput: '',
    output: undefined,
    error: undefined,
    completedAt: undefined,
    groundingInfo: undefined,
    thinkingSteps: undefined,
    currentStreamOutput: undefined,
    outputImages: undefined,
  },
  running: {
    stageId: 'ai-generation',
    status: 'running' as const,
    depsAreMet: true,
    isEditingOutput: false,
    shouldAutoRun: false,
    isStale: false,
    staleDismissed: false,
    userInput: undefined,
    output: undefined,
    error: undefined,
    completedAt: undefined,
    groundingInfo: undefined,
    thinkingSteps: undefined,
    currentStreamOutput: 'Generating content about sustainable energy...',
    outputImages: undefined,
  },
  completed: {
    stageId: 'topic-selection',
    status: 'completed' as const,
    depsAreMet: true,
    isEditingOutput: false,
    shouldAutoRun: false,
    isStale: false,
    staleDismissed: false,
    userInput: 'Sustainable energy solutions',
    output: 'Sustainable energy solutions including solar, wind, and hydroelectric power.',
    error: undefined,
    completedAt: new Date('2024-03-15T10:30:00Z').toISOString(),
    groundingInfo: undefined,
    thinkingSteps: undefined,
    currentStreamOutput: undefined,
    outputImages: undefined,
  },
  error: {
    stageId: 'ai-generation',
    status: 'error' as const,
    depsAreMet: true,
    isEditingOutput: false,
    shouldAutoRun: false,
    isStale: false,
    staleDismissed: false,
    userInput: undefined,
    output: undefined,
    error: 'Failed to generate content: AI service temporarily unavailable',
    completedAt: undefined,
    groundingInfo: undefined,
    thinkingSteps: undefined,
    currentStreamOutput: undefined,
    outputImages: undefined,
  },
  stale: {
    stageId: 'ai-generation',
    status: 'completed' as const,
    depsAreMet: true,
    isEditingOutput: false,
    shouldAutoRun: false,
    isStale: true,
    staleDismissed: false,
    userInput: undefined,
    output: 'Generated content about renewable energy...',
    error: undefined,
    completedAt: new Date('2024-03-15T09:00:00Z').toISOString(),
    groundingInfo: undefined,
    thinkingSteps: undefined,
    currentStreamOutput: undefined,
    outputImages: undefined,
  },
  blocked: {
    stageId: 'ai-generation',
    status: 'idle' as const,
    depsAreMet: false,
    isEditingOutput: false,
    shouldAutoRun: false,
    isStale: false,
    staleDismissed: false,
    userInput: undefined,
    output: undefined,
    error: undefined,
    completedAt: undefined,
    groundingInfo: undefined,
    thinkingSteps: undefined,
    currentStreamOutput: undefined,
    outputImages: undefined,
  },
} as const;

const meta = {
  title: 'Wizard/StageCard',
  component: StageCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
The StageCard component represents a single stage in the AI workflow system. It handles all aspects 
of stage interaction including input collection, execution, output display, and state management.

## Core Features
- **Multiple Input Types**: Supports textarea, form, context, and none input types
- **State Management**: Handles idle, running, completed, error, and editing states
- **Real-time Progress**: Shows live progress for AI processing operations
- **Error Handling**: Displays comprehensive error information with recovery options
- **Output Editing**: Allows direct editing of AI-generated content
- **Dependency Tracking**: Visual indication of stage dependencies and blocking

## Stage States
- **Idle**: Ready for input or execution
- **Running**: Currently executing with progress indicators
- **Completed**: Successfully finished with output display
- **Error**: Encountered error with detailed information
- **Blocked**: Dependencies not met, cannot execute

## Interaction Patterns
- **Input Collection**: Various input methods based on stage configuration
- **Execution Control**: Primary action buttons for stage execution
- **Content Editing**: Both input and output editing capabilities
- **AI Regeneration**: AI Redo functionality with user feedback
- **Progress Tracking**: Real-time status and progress indicators
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    stage: {
      control: false,
      description: 'Stage configuration object',
    },
    workflow: {
      control: false,
      description: 'Complete workflow definition',
    },
    stageState: {
      control: false,
      description: 'Current state of the stage',
    },
    isCurrentStage: {
      control: 'boolean',
      description: 'Whether this stage is currently active/focused',
    },
    documentId: {
      control: 'text',
      description: 'Document ID for persistence',
    },
    onRunStage: {
      action: 'run-stage',
      description: 'Callback to execute the stage',
    },
    onInputChange: {
      action: 'input-change',
      description: 'Callback for input changes',
    },
    onFormSubmit: {
      action: 'form-submit',
      description: 'Callback for form submission',
    },
    onEditInputRequest: {
      action: 'edit-input-request',
      description: 'Callback to request input editing',
    },
    onOutputEdit: {
      action: 'output-edit',
      description: 'Callback for output editing',
    },
    onSetEditingOutput: {
      action: 'set-editing-output',
      description: 'Callback to toggle output editing mode',
    },
    onDismissStaleWarning: {
      action: 'dismiss-stale-warning',
      description: 'Callback to dismiss stale warnings',
    },
    onUpdateStageState: {
      action: 'update-stage-state',
      description: 'Callback for stage state updates',
    },
  },
  args: {
    stage: mockStages.topicSelection,
    workflow: mockWorkflow,
    stageState: mockStageStates.idle,
    isCurrentStage: true,
    allStageStates: { 'topic-selection': mockStageStates.idle },
    documentId: 'doc-123',
    onRunStage: fn(),
    onInputChange: fn(),
    onFormSubmit: fn(),
    onEditInputRequest: fn(),
    onOutputEdit: fn(),
    onSetEditingOutput: fn(),
    onDismissStaleWarning: fn(),
    onUpdateStageState: fn(),
  },
} satisfies Meta<typeof StageCard>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic state stories
export const IdleState: Story = {
  args: {
    stage: mockStages.topicSelection,
    stageState: mockStageStates.idle,
    isCurrentStage: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Stage in idle state, ready for user input.',
      },
    },
  },
};

export const RunningState: Story = {
  args: {
    stage: mockStages.aiGeneration,
    stageState: mockStageStates.running,
    isCurrentStage: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Stage currently executing with AI processing indicator.',
      },
    },
  },
};

export const CompletedState: Story = {
  args: {
    stage: mockStages.topicSelection,
    stageState: mockStageStates.completed,
    isCurrentStage: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Successfully completed stage with output display.',
      },
    },
  },
};

export const ErrorState: Story = {
  args: {
    stage: mockStages.aiGeneration,
    stageState: mockStageStates.error,
    isCurrentStage: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Stage with error state showing error message and recovery options.',
      },
    },
  },
};

export const StaleState: Story = {
  args: {
    stage: mockStages.aiGeneration,
    stageState: mockStageStates.stale,
    isCurrentStage: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Completed stage with stale content warning (dependencies changed).',
      },
    },
  },
};

export const BlockedState: Story = {
  args: {
    stage: mockStages.aiGeneration,
    stageState: mockStageStates.blocked,
    isCurrentStage: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Stage blocked by unmet dependencies.',
      },
    },
  },
};

// Input type variations
export const TextareaInput: Story = {
  args: {
    stage: mockStages.topicSelection,
    stageState: {
      ...mockStageStates.idle,
      userInput: 'Sample topic content',
    },
    isCurrentStage: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Stage with textarea input for text content.',
      },
    },
  },
};

export const FormInput: Story = {
  args: {
    stage: mockStages.formStage,
    stageState: {
      ...mockStageStates.idle,
      stageId: 'form-stage',
      userInput: {
        title: 'The Future of AI',
        audience: 'technical',
        tone: 'formal',
      },
    },
    isCurrentStage: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Stage with form input for structured data collection.',
      },
    },
  },
};

export const NoInput: Story = {
  args: {
    stage: mockStages.aiGeneration,
    stageState: {
      ...mockStageStates.idle,
      stageId: 'ai-generation',
    },
    isCurrentStage: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Auto-run stage with no user input required.',
      },
    },
  },
};

// Special stage types
export const ExportStage: Story = {
  args: {
    stage: mockStages.exportStage,
    stageState: {
      ...mockStageStates.completed,
      stageId: 'export-stage',
      output: {
        formats: {
          html: '<h1>Generated Content</h1><p>Content goes here...</p>',
          pdf: 'data:application/pdf;base64,JVBERi0xLjQ...',
          docx: 'data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,UEsDBBQ...',
        },
        publishing: {
          url: 'https://example.com/published/doc-123',
          shortCode: 'abc123',
        },
      },
    },
    isCurrentStage: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Export stage showing multiple format options and publishing results.',
      },
    },
  },
};

// Workflow progression examples
export const WorkflowSequence: Story = {
  render: () => (
    <div className="space-y-6 max-w-2xl">
      <StageCard
        stage={mockStages.topicSelection}
        workflow={mockWorkflow}
        stageState={mockStageStates.completed}
        isCurrentStage={false}
        allStageStates={{
          'topic-selection': mockStageStates.completed,
          'ai-generation': mockStageStates.running,
        }}
        onRunStage={fn()}
        onInputChange={fn()}
        onFormSubmit={fn()}
        onEditInputRequest={fn()}
        onOutputEdit={fn()}
        onSetEditingOutput={fn()}
        onDismissStaleWarning={fn()}
      />
      <StageCard
        stage={mockStages.aiGeneration}
        workflow={mockWorkflow}
        stageState={mockStageStates.running}
        isCurrentStage={true}
        allStageStates={{
          'topic-selection': mockStageStates.completed,
          'ai-generation': mockStageStates.running,
        }}
        onRunStage={fn()}
        onInputChange={fn()}
        onFormSubmit={fn()}
        onEditInputRequest={fn()}
        onOutputEdit={fn()}
        onSetEditingOutput={fn()}
        onDismissStaleWarning={fn()}
      />
      <StageCard
        stage={mockStages.exportStage}
        workflow={mockWorkflow}
        stageState={mockStageStates.blocked}
        isCurrentStage={false}
        allStageStates={{
          'topic-selection': mockStageStates.completed,
          'ai-generation': mockStageStates.running,
          'export-stage': mockStageStates.blocked,
        }}
        onRunStage={fn()}
        onInputChange={fn()}
        onFormSubmit={fn()}
        onEditInputRequest={fn()}
        onOutputEdit={fn()}
        onSetEditingOutput={fn()}
        onDismissStaleWarning={fn()}
      />
    </div>
  ),
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'Complete workflow sequence showing stage progression and dependencies.',
      },
    },
  },
};

// Interactive examples
export const EditableOutput: Story = {
  args: {
    stage: mockStages.topicSelection,
    stageState: {
      ...mockStageStates.completed,
      isEditingOutput: true,
    },
    isCurrentStage: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Stage with output in editing mode for user modifications.',
      },
    },
  },
};

export const LongContent: Story = {
  args: {
    stage: {
      ...mockStages.aiGeneration,
      title: 'Comprehensive Article Generation',
      description: 'Generate a detailed article with multiple sections',
    },
    stageState: {
      ...mockStageStates.completed,
      stageId: 'ai-generation',
      output: `# The Future of Sustainable Energy

## Introduction
Sustainable energy represents one of the most critical challenges and opportunities of our time. As the world grapples with climate change and the depletion of fossil fuel resources, the transition to renewable energy sources has become not just an environmental imperative but an economic necessity.

## Solar Power Revolution
Solar energy has experienced unprecedented growth over the past decade. The cost of solar panels has decreased by more than 80% since 2010, making solar power competitive with traditional energy sources in many markets.

## Wind Energy Advancement
Wind power continues to be one of the fastest-growing renewable energy technologies worldwide. Modern wind turbines are more efficient and can generate electricity even in low-wind conditions.

## Hydroelectric Power
Hydroelectric power remains the world's largest source of renewable electricity, providing clean energy to millions while also offering valuable services like flood control and water storage.

## The Path Forward
The future of sustainable energy lies in a diverse portfolio of renewable technologies, smart grid systems, and energy storage solutions. Investment in research and development, supportive policies, and public awareness will be crucial for achieving a sustainable energy future.`,
    },
    isCurrentStage: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Stage with long-form content demonstrating content overflow and formatting.',
      },
    },
  },
};

// Edge cases and special states
export const EmptyState: Story = {
  args: {
    stage: {
      ...mockStages.topicSelection,
      title: 'Optional Step',
      description: 'This step can be skipped if not needed',
    },
    stageState: {
      ...mockStageStates.idle,
      userInput: '',
    },
    isCurrentStage: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Stage with no content, showing empty state handling.',
      },
    },
  },
};

export const NonCurrentCompleted: Story = {
  args: {
    stage: mockStages.topicSelection,
    stageState: mockStageStates.completed,
    isCurrentStage: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Completed stage that is not currently active, showing condensed view.',
      },
    },
  },
};