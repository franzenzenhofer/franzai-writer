import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from './badge';
import { CheckCircle2, AlertCircle, Clock, Info, Zap, Star } from 'lucide-react';

const meta: Meta<typeof Badge> = {
  title: 'UI/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'secondary', 'destructive', 'outline'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Basic Badge Variants
export const Default: Story = {
  args: {
    children: 'Default',
    variant: 'default',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Secondary',
    variant: 'secondary',
  },
};

export const Destructive: Story = {
  args: {
    children: 'Error',
    variant: 'destructive',
  },
};

export const Outline: Story = {
  args: {
    children: 'Outline',
    variant: 'outline',
  },
};

// Status Badges with Icons
export const StatusCompleted: Story = {
  name: 'Status - Completed',
  render: () => (
    <Badge variant="default">
      <CheckCircle2 className="mr-1 h-3 w-3" />
      Completed
    </Badge>
  ),
};

export const StatusError: Story = {
  name: 'Status - Error',
  render: () => (
    <Badge variant="destructive">
      <AlertCircle className="mr-1 h-3 w-3" />
      Error
    </Badge>
  ),
};

export const StatusPending: Story = {
  name: 'Status - Pending',
  render: () => (
    <Badge variant="secondary">
      <Clock className="mr-1 h-3 w-3" />
      Pending
    </Badge>
  ),
};

export const StatusInfo: Story = {
  name: 'Status - Info',
  render: () => (
    <Badge variant="outline">
      <Info className="mr-1 h-3 w-3" />
      Info
    </Badge>
  ),
};

// Stage-specific Badges
export const StageStatuses: Story = {
  name: 'Stage Status Examples',
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="default">
        <CheckCircle2 className="mr-1 h-3 w-3" />
        Completed
      </Badge>
      <Badge variant="secondary">
        <Clock className="mr-1 h-3 w-3" />
        Waiting
      </Badge>
      <Badge variant="outline">
        Dependencies Required
      </Badge>
      <Badge variant="destructive">
        <AlertCircle className="mr-1 h-3 w-3" />
        Failed
      </Badge>
    </div>
  ),
};

// Feature Badges
export const FeatureBadges: Story = {
  name: 'Feature Badges',
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="default">
        <Zap className="mr-1 h-3 w-3" />
        AI Powered
      </Badge>
      <Badge variant="secondary">
        Auto-run
      </Badge>
      <Badge variant="outline">
        <Star className="mr-1 h-3 w-3" />
        Premium
      </Badge>
      <Badge variant="default">
        New
      </Badge>
    </div>
  ),
};

// Workflow Type Badges
export const WorkflowTypes: Story = {
  name: 'Workflow Type Badges',
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="default">Poem Generator</Badge>
      <Badge variant="secondary">Press Release</Badge>
      <Badge variant="outline">Recipe</Badge>
      <Badge variant="default">Article</Badge>
    </div>
  ),
};

// Progress Indicators
export const ProgressBadges: Story = {
  name: 'Progress Indicator Badges',
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Workflow Progress:</span>
        <Badge variant="outline">3 of 5 stages</Badge>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Token Usage:</span>
        <Badge variant="secondary">1,234 tokens</Badge>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Export Status:</span>
        <Badge variant="default">
          <CheckCircle2 className="mr-1 h-3 w-3" />
          3 formats ready
        </Badge>
      </div>
    </div>
  ),
};

// Size Variations
export const SizeVariations: Story = {
  name: 'Size Variations',
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <span className="text-sm">Standard:</span>
        <Badge>Default Size</Badge>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm">Small:</span>
        <Badge className="text-xs px-2 py-0.5">Small Badge</Badge>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm">Large:</span>
        <Badge className="text-sm px-3 py-1">Large Badge</Badge>
      </div>
    </div>
  ),
};

// Interactive States
export const InteractiveStates: Story = {
  name: 'Interactive States',
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="default" className="cursor-pointer hover:bg-primary/90">
        Clickable
      </Badge>
      <Badge variant="secondary" className="cursor-pointer hover:bg-muted/90">
        Hoverable
      </Badge>
      <Badge variant="outline" className="cursor-pointer hover:bg-background">
        Interactive
      </Badge>
    </div>
  ),
};

// Real-world Usage
export const StageCardBadges: Story = {
  name: 'Stage Card Usage',
  render: () => (
    <div className="w-[350px] p-4 border rounded-lg space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">AI Content Generation</h3>
        <Badge variant="default">
          <CheckCircle2 className="mr-1 h-3 w-3" />
          Completed
        </Badge>
      </div>
      <p className="text-sm text-muted-foreground">
        Generate creative content using advanced AI models.
      </p>
      <div className="flex gap-2">
        <Badge variant="secondary">
          <Zap className="mr-1 h-3 w-3" />
          AI Powered
        </Badge>
        <Badge variant="outline">Auto-run</Badge>
      </div>
    </div>
  ),
};