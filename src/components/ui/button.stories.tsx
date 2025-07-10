import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './button';
import { Download, Copy, Edit, RotateCcw } from 'lucide-react';

const meta = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'secondary', 'outline', 'ghost', 'destructive', 'success', 'warning', 'accent'],
    },
    size: {
      control: { type: 'select' },
      options: ['default', 'sm', 'lg', 'icon'],
    },
    loading: {
      control: { type: 'boolean' },
    },
    disabled: {
      control: { type: 'boolean' },
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// Primary story - Default button
export const Primary: Story = {
  args: {
    children: 'Run AI',
    variant: 'default',
  },
};

// Secondary story - AI Redo button
export const Secondary: Story = {
  args: {
    children: 'AI Redo',
    variant: 'secondary',
  },
};

// Outline story - Export button
export const Outline: Story = {
  args: {
    children: 'Export',
    variant: 'outline',
  },
};

// Ghost story - Cancel button
export const Ghost: Story = {
  args: {
    children: 'Cancel',
    variant: 'ghost',
  },
};

// Destructive story - Delete button
export const Destructive: Story = {
  args: {
    children: 'Delete',
    variant: 'destructive',
  },
};

// Success story - Complete button
export const Success: Story = {
  args: {
    children: 'Complete',
    variant: 'success',
  },
};

// Warning story - Override button
export const Warning: Story = {
  args: {
    children: 'Override',
    variant: 'warning',
  },
};

// Accent story - Premium button
export const Accent: Story = {
  args: {
    children: 'Premium',
    variant: 'accent',
  },
};

// Loading state
export const Loading: Story = {
  args: {
    children: 'Processing...',
    loading: true,
  },
};

// Disabled state
export const Disabled: Story = {
  args: {
    children: 'Disabled',
    disabled: true,
  },
};

// Size variants
export const Small: Story = {
  args: {
    children: 'Small',
    size: 'sm',
  },
};

export const Large: Story = {
  args: {
    children: 'Large',
    size: 'lg',
  },
};

// Icon button
export const IconButton: Story = {
  args: {
    children: <Download className="h-4 w-4" />,
    size: 'icon',
    variant: 'outline',
  },
};

// With icon and text
export const WithIcon: Story = {
  args: {
    children: (
      <>
        <Edit className="mr-2 h-4 w-4" />
        Edit
      </>
    ),
    variant: 'secondary',
  },
};

// All variants showcase
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Button variant="default">Default</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="success">Success</Button>
      <Button variant="warning">Warning</Button>
      <Button variant="accent">Accent</Button>
    </div>
  ),
};

// All sizes showcase
export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Button size="sm">Small</Button>
      <Button size="default">Default</Button>
      <Button size="lg">Large</Button>
      <Button size="icon">
        <Download className="h-4 w-4" />
      </Button>
    </div>
  ),
};

// Common use cases
export const CommonUseCases: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button>Run AI</Button>
        <Button variant="secondary">
          <RotateCcw className="mr-2 h-4 w-4" />
          AI Redo
        </Button>
      </div>
      <div className="flex gap-2">
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
        <Button variant="outline">
          <Copy className="mr-2 h-4 w-4" />
          Copy
        </Button>
      </div>
      <div className="flex gap-2">
        <Button variant="secondary">
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </Button>
        <Button variant="ghost">Cancel</Button>
      </div>
    </div>
  ),
};