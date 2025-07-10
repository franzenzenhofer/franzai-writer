import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from './badge';
import { Clock, CheckCircle2, AlertCircle, Star } from 'lucide-react';

const meta = {
  title: 'UI/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'secondary', 'destructive', 'outline'],
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default badge
export const Default: Story = {
  args: {
    children: 'Default',
  },
};

// Secondary badge
export const Secondary: Story = {
  args: {
    children: 'Secondary',
    variant: 'secondary',
  },
};

// Destructive badge
export const Destructive: Story = {
  args: {
    children: 'Error',
    variant: 'destructive',
  },
};

// Outline badge
export const Outline: Story = {
  args: {
    children: 'Outline',
    variant: 'outline',
  },
};

// With icon - Status badges
export const StatusBadges: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="default">
        <CheckCircle2 className="mr-1 h-3 w-3" />
        Completed
      </Badge>
      <Badge variant="secondary">
        <Clock className="mr-1 h-3 w-3" />
        Pending
      </Badge>
      <Badge variant="destructive">
        <AlertCircle className="mr-1 h-3 w-3" />
        Error
      </Badge>
      <Badge variant="outline">
        <Star className="mr-1 h-3 w-3" />
        Optional
      </Badge>
    </div>
  ),
};

// Stage status badges (like those used in wizard)
export const StageStatusBadges: Story = {
  render: () => (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Badge variant="secondary" className="text-sm">
          <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
          Waiting for: Poem Topic
        </Badge>
      </div>
      <div className="flex gap-2">
        <Badge variant="secondary" className="text-xs">
          Saving...
        </Badge>
        <Badge variant="destructive" className="text-xs">
          Save failed
        </Badge>
      </div>
      <div className="flex gap-2">
        <Badge variant="outline" className="text-xs">
          Optional
        </Badge>
        <Badge variant="default" className="text-xs">
          Required
        </Badge>
      </div>
    </div>
  ),
};

// Different sizes
export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Badge className="text-xs">Small</Badge>
      <Badge>Default</Badge>
      <Badge className="text-sm px-3 py-1">Large</Badge>
    </div>
  ),
};

// All variants showcase
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="default">Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="outline">Outline</Badge>
    </div>
  ),
};

// Real-world usage examples
export const RealWorldExamples: Story = {
  render: () => (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-medium mb-2">Workflow Stage Status</h4>
        <div className="flex gap-2">
          <Badge variant="default">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Stage Complete
          </Badge>
          <Badge variant="secondary">
            <Clock className="mr-1 h-3 w-3" />
            Waiting for Dependencies
          </Badge>
        </div>
      </div>
      <div>
        <h4 className="text-sm font-medium mb-2">Document Status</h4>
        <div className="flex gap-2">
          <Badge variant="outline">Draft</Badge>
          <Badge variant="default">Published</Badge>
          <Badge variant="destructive">Failed</Badge>
        </div>
      </div>
      <div>
        <h4 className="text-sm font-medium mb-2">Feature Flags</h4>
        <div className="flex gap-2">
          <Badge variant="outline">
            <Star className="mr-1 h-3 w-3" />
            Optional
          </Badge>
          <Badge variant="secondary">Beta</Badge>
          <Badge variant="default">Stable</Badge>
        </div>
      </div>
    </div>
  ),
};