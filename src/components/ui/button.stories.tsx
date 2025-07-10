import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { Button, AIRedoButton, EditButton, DownloadButton, CopyButton, ExportButton } from './button';
import { Download, Copy, Edit, RotateCcw, Send, AlertTriangle, Check, Zap } from 'lucide-react';

const meta = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
The Button component is the central button component following the Franz AI Writer design system. 
It provides comprehensive button functionality with multiple variants, sizes, and states while 
maintaining accessibility standards and visual hierarchy.

## Features
- Multiple semantic variants (default, secondary, outline, ghost, destructive, success, warning, accent)
- Responsive sizes (default, sm, lg, icon)
- Loading states with spinner
- Polymorphic rendering with asChild prop
- Full accessibility support with WCAG AA compliance
- Design system compliance with 44px minimum touch targets

## Design Principles
- Always visible borders for clear definition
- High contrast colors (no gray-on-gray)
- Shadows and depth effects for visual hierarchy
- Smooth 150ms transitions for professional feel
- Mobile-first responsive design
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'secondary', 'outline', 'ghost', 'destructive', 'success', 'warning', 'accent'],
      description: 'Visual style variant that determines appearance and semantic meaning',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'default' },
      },
    },
    size: {
      control: 'select', 
      options: ['default', 'sm', 'lg', 'icon'],
      description: 'Size variant controlling dimensions and text size',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'default' },
      },
    },
    loading: {
      control: 'boolean',
      description: 'Shows loading spinner and disables interaction',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    disabled: {
      control: 'boolean',
      description: 'Disables the button and shows disabled state',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    asChild: {
      control: 'boolean',
      description: 'Renders as child element using Radix UI Slot',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    children: {
      control: 'text',
      description: 'Button content (text, icons, or other React elements)',
    },
    onClick: {
      action: 'clicked',
      description: 'Click event handler',
    },
  },
  args: {
    onClick: fn(),
    children: 'Button',
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic variant stories
export const Default: Story = {
  args: {
    children: 'Primary Action',
  },
  parameters: {
    docs: {
      description: {
        story: 'The default variant for primary actions with royal blue background and high contrast text.',
      },
    },
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary Action',
  },
  parameters: {
    docs: {
      description: {
        story: 'Secondary variant for supporting actions with light background and dark text.',
      },
    },
  },
};

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Outline Action',
  },
  parameters: {
    docs: {
      description: {
        story: 'Outline variant for alternative actions with blue border and text.',
      },
    },
  },
};

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: 'Ghost Action',
  },
  parameters: {
    docs: {
      description: {
        story: 'Ghost variant for minimal actions with hover effects only.',
      },
    },
  },
};

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    children: 'Delete',
  },
  parameters: {
    docs: {
      description: {
        story: 'Destructive variant for dangerous actions with red background.',
      },
    },
  },
};

export const Success: Story = {
  args: {
    variant: 'success',
    children: 'Complete',
  },
  parameters: {
    docs: {
      description: {
        story: 'Success variant for positive actions with green background.',
      },
    },
  },
};

export const Warning: Story = {
  args: {
    variant: 'warning',
    children: 'Override',
  },
  parameters: {
    docs: {
      description: {
        story: 'Warning variant for caution actions with orange background.',
      },
    },
  },
};

export const Accent: Story = {
  args: {
    variant: 'accent',
    children: 'Premium Feature',
  },
  parameters: {
    docs: {
      description: {
        story: 'Accent variant for special features with violet background.',
      },
    },
  },
};

// Size variants
export const Small: Story = {
  args: {
    size: 'sm',
    children: 'Small Button',
  },
  parameters: {
    docs: {
      description: {
        story: 'Small size variant for secondary actions and compact layouts.',
      },
    },
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
    children: 'Large Button',
  },
  parameters: {
    docs: {
      description: {
        story: 'Large size variant for primary actions and prominent calls-to-action.',
      },
    },
  },
};

export const Icon: Story = {
  args: {
    size: 'icon',
    children: <Send className="h-4 w-4" />,
  },
  parameters: {
    docs: {
      description: {
        story: 'Icon size variant optimized for icon-only buttons with square dimensions.',
      },
    },
  },
};

// State variants
export const Loading: Story = {
  args: {
    loading: true,
    children: 'Loading...',
  },
  parameters: {
    docs: {
      description: {
        story: 'Loading state with spinner and disabled interaction.',
      },
    },
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    children: 'Disabled',
  },
  parameters: {
    docs: {
      description: {
        story: 'Disabled state with muted appearance and no interaction.',
      },
    },
  },
};

// Button compositions with icons
export const WithIconLeft: Story = {
  args: {
    children: (
      <>
        <Download className="mr-2 h-4 w-4" />
        Download
      </>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Button with icon on the left side for enhanced visual communication.',
      },
    },
  },
};

export const WithIconRight: Story = {
  args: {
    children: (
      <>
        Continue
        <Send className="ml-2 h-4 w-4" />
      </>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Button with icon on the right side for directional actions.',
      },
    },
  },
};

export const IconOnly: Story = {
  args: {
    size: 'icon',
    variant: 'outline',
    children: <Copy className="h-4 w-4" />,
    'aria-label': 'Copy to clipboard',
  },
  parameters: {
    docs: {
      description: {
        story: 'Icon-only button with proper accessibility labeling.',
      },
    },
  },
};

// All variants showcase
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
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
  parameters: {
    docs: {
      description: {
        story: 'Showcase of all button variants for visual comparison.',
      },
    },
  },
};

// All sizes showcase
export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Button size="sm">Small</Button>
      <Button size="default">Default</Button>
      <Button size="lg">Large</Button>
      <Button size="icon">
        <Zap className="h-4 w-4" />
      </Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Showcase of all button sizes for visual comparison.',
      },
    },
  },
};

// Specialized button stories
export const SpecializedButtons: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <AIRedoButton>
        <RotateCcw className="mr-2 h-4 w-4" />
        AI Redo
      </AIRedoButton>
      <EditButton>
        <Edit className="mr-2 h-4 w-4" />
        Edit
      </EditButton>
      <DownloadButton>
        <Download className="mr-2 h-4 w-4" />
        Download
      </DownloadButton>
      <CopyButton>
        <Copy className="mr-2 h-4 w-4" />
        Copy
      </CopyButton>
      <ExportButton>
        <Send className="mr-2 h-4 w-4" />
        Export
      </ExportButton>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Pre-configured specialized buttons for common application actions.',
      },
    },
  },
};

// Real-world usage examples
export const FormActions: Story = {
  render: () => (
    <div className="flex gap-3">
      <Button variant="ghost">Cancel</Button>
      <Button variant="outline">Save Draft</Button>
      <Button variant="default">Submit Form</Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Typical form action button arrangement with proper hierarchy.',
      },
    },
  },
};

export const ConfirmationDialog: Story = {
  render: () => (
    <div className="flex gap-3">
      <Button variant="outline">Keep Document</Button>
      <Button variant="destructive">
        <AlertTriangle className="mr-2 h-4 w-4" />
        Delete Permanently
      </Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Confirmation dialog buttons with clear visual hierarchy for dangerous actions.',
      },
    },
  },
};

export const WorkflowActions: Story = {
  render: () => (
    <div className="flex gap-3">
      <Button variant="secondary">
        <Edit className="mr-2 h-4 w-4" />
        Edit Input
      </Button>
      <Button variant="success">
        <Check className="mr-2 h-4 w-4" />
        Accept & Continue
      </Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Workflow stage actions showing typical AI content approval flow.',
      },
    },
  },
};