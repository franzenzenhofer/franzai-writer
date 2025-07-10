import type { Meta, StoryObj } from '@storybook/react';
import { StageCard } from './stage-card';
import type { Stage, StageState, Workflow } from '@/types';

// Mock data for stories
const mockWorkflow: Workflow = {
  id: 'poem-generator',
  title: 'Poem Generator',
  description: 'Generate creative poems',
  config: {},
  stages: [
    {
      id: 'poem-topic',
      title: 'Poem Topic',
      description: 'Define the topic for your poem',
      inputType: 'textarea',
      promptTemplate: 'Generate a poem about: {{userInput}}',
    },
    {
      id: 'poem-generation',
      title: 'Poem Generation',
      description: 'Generate the poem content',
      inputType: 'none',
      promptTemplate: 'Write a creative poem about {{poem-topic.userInput}}',
      dependencies: ['poem-topic'],
      autoRun: true,
    },
    {
      id: 'poem-export',
      title: 'Export Poem',
      description: 'Export your poem in various formats',
      inputType: 'none',
      dependencies: ['poem-generation'],
    },
  ],
};

const mockStageStates: Record<string, StageState> = {
  'poem-topic': {
    stageId: 'poem-topic',
    status: 'completed',
    userInput: 'Write a poem about nature and mountains',
    output: 'Write a poem about nature and mountains',
    completedAt: '2024-01-01T12:00:00Z',
    depsAreMet: true,
    isStale: false,
    staleDismissed: false,
    shouldAutoRun: false,
    isEditingOutput: false,
  },
  'poem-generation': {
    stageId: 'poem-generation',
    status: 'completed',
    output: `Among the towering peaks so high,
Where eagles soar across the sky,
Your love shines bright like morning dew,
On mountain flowers, fresh and new.

The whispered winds through pine trees play,
A symphony at break of day,
While crystal streams dance down the stone,
In nature's heart, we're not alone.`,
    completedAt: '2024-01-01T12:05:00Z',
    depsAreMet: true,
    isStale: false,
    staleDismissed: false,
    shouldAutoRun: false,
    isEditingOutput: false,
  },
  'poem-export': {
    stageId: 'poem-export',
    status: 'idle',
    depsAreMet: true,
    isStale: false,
    staleDismissed: false,
    shouldAutoRun: false,
    isEditingOutput: false,
  },
};

const meta: Meta<typeof StageCard> = {
  title: 'Wizard/StageCard',
  component: StageCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-[600px] max-w-full">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Completed Stage
export const CompletedStage: Story = {
  args: {
    stage: mockWorkflow.stages[0],
    workflow: mockWorkflow,
    stageState: mockStageStates['poem-topic'],
    isCurrentStage: false,
    allStageStates: mockStageStates,
    onRunStage: () => console.log('onRunStage called'),
    onInputChange: () => console.log('onInputChange called'),
    onFormSubmit: () => console.log('onFormSubmit called'),
    onEditInputRequest: () => console.log('onEditInputRequest called'),
    onOutputEdit: () => console.log('onOutputEdit called'),
    onSetEditingOutput: () => console.log('onSetEditingOutput called'),
    onDismissStaleWarning: () => console.log('onDismissStaleWarning called'),
  },
};

// Current Active Stage
export const CurrentActiveStage: Story = {
  args: {
    stage: mockWorkflow.stages[1],
    workflow: mockWorkflow,
    stageState: {
      ...mockStageStates['poem-generation'],
      status: 'idle',
      output: undefined,
      completedAt: undefined,
    },
    isCurrentStage: true,
    allStageStates: mockStageStates,
    onRunStage: () => console.log('onRunStage called'),
    onInputChange: () => console.log('onInputChange called'),
    onFormSubmit: () => console.log('onFormSubmit called'),
    onEditInputRequest: () => console.log('onEditInputRequest called'),
    onOutputEdit: () => console.log('onOutputEdit called'),
    onSetEditingOutput: () => console.log('onSetEditingOutput called'),
    onDismissStaleWarning: () => console.log('onDismissStaleWarning called'),
  },
};

// Processing Stage
export const ProcessingStage: Story = {
  args: {
    stage: mockWorkflow.stages[1],
    workflow: mockWorkflow,
    stageState: {
      ...mockStageStates['poem-generation'],
      status: 'processing',
      output: undefined,
      completedAt: undefined,
    },
    isCurrentStage: true,
    allStageStates: mockStageStates,
    onRunStage: () => console.log('onRunStage called'),
    onInputChange: () => console.log('onInputChange called'),
    onFormSubmit: () => console.log('onFormSubmit called'),
    onEditInputRequest: () => console.log('onEditInputRequest called'),
    onOutputEdit: () => console.log('onOutputEdit called'),
    onSetEditingOutput: () => console.log('onSetEditingOutput called'),
    onDismissStaleWarning: () => console.log('onDismissStaleWarning called'),
  },
};

// Error Stage
export const ErrorStage: Story = {
  args: {
    stage: mockWorkflow.stages[1],
    workflow: mockWorkflow,
    stageState: {
      ...mockStageStates['poem-generation'],
      status: 'error',
      error: 'AI service temporarily unavailable. Please try again in a few moments.',
      output: undefined,
      completedAt: undefined,
    },
    isCurrentStage: true,
    allStageStates: mockStageStates,
    onRunStage: () => console.log('onRunStage called'),
    onInputChange: () => console.log('onInputChange called'),
    onFormSubmit: () => console.log('onFormSubmit called'),
    onEditInputRequest: () => console.log('onEditInputRequest called'),
    onOutputEdit: () => console.log('onOutputEdit called'),
    onSetEditingOutput: () => console.log('onSetEditingOutput called'),
    onDismissStaleWarning: () => console.log('onDismissStaleWarning called'),
  },
};

// Pending Dependencies Stage
export const PendingDependenciesStage: Story = {
  args: {
    stage: mockWorkflow.stages[1],
    workflow: mockWorkflow,
    stageState: {
      ...mockStageStates['poem-generation'],
      status: 'idle',
      depsAreMet: false,
      output: undefined,
      completedAt: undefined,
    },
    isCurrentStage: false,
    allStageStates: {
      ...mockStageStates,
      'poem-topic': {
        ...mockStageStates['poem-topic'],
        status: 'idle',
        output: undefined,
        completedAt: undefined,
      },
    },
    onRunStage: () => console.log('onRunStage called'),
    onInputChange: () => console.log('onInputChange called'),
    onFormSubmit: () => console.log('onFormSubmit called'),
    onEditInputRequest: () => console.log('onEditInputRequest called'),
    onOutputEdit: () => console.log('onOutputEdit called'),
    onSetEditingOutput: () => console.log('onSetEditingOutput called'),
    onDismissStaleWarning: () => console.log('onDismissStaleWarning called'),
  },
};

// Stale Data Warning
export const StaleDataWarning: Story = {
  args: {
    stage: mockWorkflow.stages[1],
    workflow: mockWorkflow,
    stageState: {
      ...mockStageStates['poem-generation'],
      isStale: true,
      staleDismissed: false,
    },
    isCurrentStage: false,
    allStageStates: mockStageStates,
    onRunStage: () => console.log('onRunStage called'),
    onInputChange: () => console.log('onInputChange called'),
    onFormSubmit: () => console.log('onFormSubmit called'),
    onEditInputRequest: () => console.log('onEditInputRequest called'),
    onOutputEdit: () => console.log('onOutputEdit called'),
    onSetEditingOutput: () => console.log('onSetEditingOutput called'),
    onDismissStaleWarning: () => console.log('onDismissStaleWarning called'),
  },
};

// Form Input Stage
export const FormInputStage: Story = {
  args: {
    stage: {
      id: 'audience-analysis',
      title: 'Audience Analysis',
      description: 'Define your target audience and content goals',
      inputType: 'form',
      formFields: [
        {
          name: 'targetAudience',
          label: 'Target Audience',
          type: 'text',
          placeholder: 'e.g., Software developers, Marketing professionals',
          required: true,
        },
        {
          name: 'contentType',
          label: 'Content Type',
          type: 'select',
          options: [
            { value: 'technical', label: 'Technical Article' },
            { value: 'marketing', label: 'Marketing Content' },
            { value: 'educational', label: 'Educational Material' },
          ],
          required: true,
        },
        {
          name: 'tone',
          label: 'Desired Tone',
          type: 'select',
          options: [
            { value: 'professional', label: 'Professional' },
            { value: 'casual', label: 'Casual' },
            { value: 'authoritative', label: 'Authoritative' },
          ],
        },
      ],
    },
    workflow: mockWorkflow,
    stageState: {
      stageId: 'audience-analysis',
      status: 'idle',
      depsAreMet: true,
      isStale: false,
      staleDismissed: false,
      shouldAutoRun: false,
      isEditingOutput: false,
    },
    isCurrentStage: true,
    allStageStates: mockStageStates,
    onRunStage: () => console.log('onRunStage called'),
    onInputChange: () => console.log('onInputChange called'),
    onFormSubmit: () => console.log('onFormSubmit called'),
    onEditInputRequest: () => console.log('onEditInputRequest called'),
    onOutputEdit: () => console.log('onOutputEdit called'),
    onSetEditingOutput: () => console.log('onSetEditingOutput called'),
    onDismissStaleWarning: () => console.log('onDismissStaleWarning called'),
  },
};

// Workflow Sequence
export const WorkflowSequence: Story = {
  name: 'Complete Workflow Sequence',
  render: () => (
    <div className="space-y-6">
      <StageCard
        stage={mockWorkflow.stages[0]}
        workflow={mockWorkflow}
        stageState={mockStageStates['poem-topic']}
        isCurrentStage={false}
        allStageStates={mockStageStates}
        onRunStage={() => console.log('onRunStage called')}
        onInputChange={() => console.log('onInputChange called')}
        onFormSubmit={() => console.log('onFormSubmit called')}
        onEditInputRequest={() => console.log('onEditInputRequest called')}
        onOutputEdit={() => console.log('onOutputEdit called')}
        onSetEditingOutput={() => console.log('onSetEditingOutput called')}
        onDismissStaleWarning={() => console.log('onDismissStaleWarning called')}
      />
      <StageCard
        stage={mockWorkflow.stages[1]}
        workflow={mockWorkflow}
        stageState={mockStageStates['poem-generation']}
        isCurrentStage={false}
        allStageStates={mockStageStates}
        onRunStage={() => console.log('onRunStage called')}
        onInputChange={() => console.log('onInputChange called')}
        onFormSubmit={() => console.log('onFormSubmit called')}
        onEditInputRequest={() => console.log('onEditInputRequest called')}
        onOutputEdit={() => console.log('onOutputEdit called')}
        onSetEditingOutput={() => console.log('onSetEditingOutput called')}
        onDismissStaleWarning={() => console.log('onDismissStaleWarning called')}
      />
      <StageCard
        stage={mockWorkflow.stages[2]}
        workflow={mockWorkflow}
        stageState={mockStageStates['poem-export']}
        isCurrentStage={true}
        allStageStates={mockStageStates}
        onRunStage={() => console.log('onRunStage called')}
        onInputChange={() => console.log('onInputChange called')}
        onFormSubmit={() => console.log('onFormSubmit called')}
        onEditInputRequest={() => console.log('onEditInputRequest called')}
        onOutputEdit={() => console.log('onOutputEdit called')}
        onSetEditingOutput={() => console.log('onSetEditingOutput called')}
        onDismissStaleWarning={() => console.log('onDismissStaleWarning called')}
      />
    </div>
  ),
};