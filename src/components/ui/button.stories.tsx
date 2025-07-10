import type { Meta, StoryObj } from '@storybook/react';
import { Button, AIRedoButton, EditButton, DownloadButton, CopyButton, ExportButton } from './button';
import { Loader2, Download, Copy, Edit, RotateCcw, Send } from 'lucide-react';

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'secondary', 'outline', 'ghost', 'destructive', 'success', 'warning', 'accent'],
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon'],
    },
    loading: {
      control: 'boolean',
    },
    disabled: {
      control: 'boolean',
    },
    asChild: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Primary Button Stories
export const Default: Story = {
  args: {
    children: 'Continue',
    variant: 'default',
  },
};

export const Secondary: Story = {
  args: {
    children: 'AI Redo',
    variant: 'secondary',
  },
};

export const Outline: Story = {
  args: {
    children: 'Export',
    variant: 'outline',
  },
};

export const Ghost: Story = {
  args: {
    children: 'Cancel',
    variant: 'ghost',
  },
};

export const Destructive: Story = {
  args: {
    children: 'Delete',
    variant: 'destructive',
  },
};

export const Success: Story = {
  args: {
    children: 'Complete',
    variant: 'success',
  },
};

export const Warning: Story = {
  args: {
    children: 'Override',
    variant: 'warning',
  },
};

export const Accent: Story = {
  args: {
    children: 'Premium',
    variant: 'accent',
  },
};

// Size Variations
export const Small: Story = {
  args: {
    children: 'Small Button',
    size: 'sm',
  },
};

export const Large: Story = {
  args: {
    children: 'Large Button',
    size: 'lg',
  },
};

export const Icon: Story = {
  args: {
    children: <Download className="h-4 w-4" />,
    size: 'icon',
    variant: 'outline',
  },
};

// State Variations
export const Loading: Story = {
  args: {
    children: 'Processing...',
    loading: true,
  },
};

export const Disabled: Story = {
  args: {
    children: 'Disabled',
    disabled: true,
  },
};

// Specialized Button Components
export const AIRedoExample: Story = {
  render: () => (
    <AIRedoButton>
      <RotateCcw className="mr-2 h-4 w-4" />
      AI Redo
    </AIRedoButton>
  ),
};

export const EditExample: Story = {
  render: () => (
    <EditButton>
      <Edit className="mr-2 h-4 w-4" />
      Edit
    </EditButton>
  ),
};

export const DownloadExample: Story = {
  render: () => (
    <DownloadButton>
      <Download className="mr-2 h-4 w-4" />
      Download
    </DownloadButton>
  ),
};

export const CopyExample: Story = {
  render: () => (
    <CopyButton>
      <Copy className="mr-2 h-4 w-4" />
      Copy
    </CopyButton>
  ),
};

export const ExportExample: Story = {
  render: () => (
    <ExportButton>
      <Send className="mr-2 h-4 w-4" />
      Export
    </ExportButton>
  ),
};

// Real-world Usage Examples
export const StageActionButton: Story = {
  name: 'Stage Action Button',
  render: () => (
    <div className="flex flex-col gap-4">
      <Button variant="default" size="lg">
        <Send className="mr-2 h-5 w-5" />
        Process Stage
      </Button>
      <Button variant="secondary" size="default">
        <RotateCcw className="mr-2 h-4 w-4" />
        Regenerate with AI
      </Button>
      <Button variant="outline" size="sm">
        <Edit className="mr-2 h-4 w-4" />
        Edit Input
      </Button>
    </div>
  ),
};

export const ButtonGroup: Story = {
  name: 'Button Group',
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Button variant="default">Save</Button>
      <Button variant="secondary">Save Draft</Button>
      <Button variant="outline">Cancel</Button>
      <Button variant="ghost">Reset</Button>
    </div>
  ),
};

export const LoadingStates: Story = {
  name: 'Loading States',
  render: () => (
    <div className="flex flex-col gap-4">
      <Button loading={true}>Processing...</Button>
      <Button variant="secondary" loading={true}>
        Generating...
      </Button>
      <Button variant="outline" loading={true}>
        Exporting...
      </Button>
    </div>
  ),
};