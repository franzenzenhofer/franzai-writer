import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from './badge';
import { CheckCircle2, Clock, AlertTriangle, X, Zap, Crown, Star } from 'lucide-react';

const meta = {
  title: 'UI/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
The Badge component provides a compact way to display status, categories, or metadata throughout 
the Franz AI Writer application. It's designed to be visually distinct while remaining unobtrusive, 
perfect for supplementary information.

## Features
- Multiple semantic variants (default, secondary, destructive, outline)
- Compact size with xs text and minimal padding
- Rounded corners for modern appearance
- Hover effects for interactive badges
- Focus support with keyboard navigation
- Color-independent status communication for accessibility

## Variant Meanings
- **Default**: Primary information or positive status (blue theme)
- **Secondary**: Neutral information or inactive status (muted colors)
- **Destructive**: Warnings, errors, or negative status (red theme)
- **Outline**: Subtle emphasis with minimal visual weight (bordered)

## Common Use Cases
- Status indicators (active, completed, pending, error)
- Content categories and tags
- Notification counts and progress indicators
- User roles and permissions
- Metadata display (versions, dates, counts)
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'secondary', 'destructive', 'outline'],
      description: 'Visual variant that determines color scheme and semantic meaning',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'default' },
      },
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes to apply to the badge',
    },
    children: {
      control: 'text',
      description: 'Badge content (text, numbers, or short phrases)',
    },
    onClick: {
      action: 'clicked',
      description: 'Click event handler for interactive badges',
    },
  },
  args: {
    children: 'Badge',
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic variant stories
export const Default: Story = {
  args: {
    children: 'Default',
  },
  parameters: {
    docs: {
      description: {
        story: 'Default variant for primary information with blue theme.',
      },
    },
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary',
  },
  parameters: {
    docs: {
      description: {
        story: 'Secondary variant for neutral information with muted colors.',
      },
    },
  },
};

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    children: 'Error',
  },
  parameters: {
    docs: {
      description: {
        story: 'Destructive variant for warnings and errors with red theme.',
      },
    },
  },
};

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Outline',
  },
  parameters: {
    docs: {
      description: {
        story: 'Outline variant for subtle emphasis with minimal visual weight.',
      },
    },
  },
};

// Status indicators
export const StatusActive: Story = {
  args: {
    variant: 'default',
    children: (
      <>
        <CheckCircle2 className="mr-1 h-3 w-3" />
        Active
      </>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Active status badge with icon for enhanced visual communication.',
      },
    },
  },
};

export const StatusPending: Story = {
  args: {
    variant: 'secondary',
    children: (
      <>
        <Clock className="mr-1 h-3 w-3" />
        Pending
      </>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Pending status badge with clock icon.',
      },
    },
  },
};

export const StatusError: Story = {
  args: {
    variant: 'destructive',
    children: (
      <>
        <AlertTriangle className="mr-1 h-3 w-3" />
        Error
      </>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Error status badge with warning icon.',
      },
    },
  },
};

export const StatusCompleted: Story = {
  args: {
    variant: 'default',
    children: 'Completed',
  },
  parameters: {
    docs: {
      description: {
        story: 'Completed status badge for successful operations.',
      },
    },
  },
};

// Count badges
export const NotificationCount: Story = {
  args: {
    variant: 'destructive',
    children: '3',
    className: 'rounded-full h-5 w-5 text-[10px] p-0 flex items-center justify-center',
  },
  parameters: {
    docs: {
      description: {
        story: 'Notification count badge with circular design.',
      },
    },
  },
};

export const ItemCount: Story = {
  args: {
    variant: 'outline',
    children: '24 items',
  },
  parameters: {
    docs: {
      description: {
        story: 'Item count badge for displaying quantities.',
      },
    },
  },
};

// Category and tag badges
export const CategoryAI: Story = {
  args: {
    variant: 'default',
    children: (
      <>
        <Zap className="mr-1 h-3 w-3" />
        AI Generated
      </>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'AI category badge with lightning icon.',
      },
    },
  },
};

export const CategoryPremium: Story = {
  args: {
    variant: 'outline',
    children: (
      <>
        <Crown className="mr-1 h-3 w-3 text-yellow-500" />
        Premium
      </>
    ),
    className: 'border-yellow-500 text-yellow-700',
  },
  parameters: {
    docs: {
      description: {
        story: 'Premium category badge with crown icon and golden theme.',
      },
    },
  },
};

export const TagKeyword: Story = {
  args: {
    variant: 'secondary',
    children: 'keyword',
    className: 'cursor-pointer hover:bg-muted/80',
  },
  parameters: {
    docs: {
      description: {
        story: 'Keyword tag badge with hover effect for interactivity.',
      },
    },
  },
};

// User role badges
export const RoleAdmin: Story = {
  args: {
    variant: 'destructive',
    children: 'Admin',
  },
  parameters: {
    docs: {
      description: {
        story: 'Admin role badge with destructive variant for high authority.',
      },
    },
  },
};

export const RoleMember: Story = {
  args: {
    variant: 'secondary',
    children: 'Member',
  },
  parameters: {
    docs: {
      description: {
        story: 'Member role badge with secondary variant.',
      },
    },
  },
};

export const RoleGuest: Story = {
  args: {
    variant: 'outline',
    children: 'Guest',
  },
  parameters: {
    docs: {
      description: {
        story: 'Guest role badge with outline variant for minimal emphasis.',
      },
    },
  },
};

// Interactive badges
export const DismissibleBadge: Story = {
  args: {
    variant: 'secondary',
    children: (
      <>
        Filter Applied
        <X className="ml-1 h-3 w-3 cursor-pointer hover:text-destructive" />
      </>
    ),
    className: 'cursor-pointer',
  },
  parameters: {
    docs: {
      description: {
        story: 'Dismissible badge with X icon for removable filters or tags.',
      },
    },
  },
};

export const ClickableBadge: Story = {
  args: {
    variant: 'outline',
    children: 'Click me',
    className: 'cursor-pointer hover:bg-muted/50 transition-colors',
    onClick: () => alert('Badge clicked!'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Clickable badge with hover effects and click handler.',
      },
    },
  },
};

// Version and metadata badges
export const VersionBadge: Story = {
  args: {
    variant: 'outline',
    children: 'v2.1.0',
  },
  parameters: {
    docs: {
      description: {
        story: 'Version badge for displaying software or document versions.',
      },
    },
  },
};

export const DateBadge: Story = {
  args: {
    variant: 'secondary',
    children: 'Mar 15, 2024',
  },
  parameters: {
    docs: {
      description: {
        story: 'Date badge for displaying timestamps or dates.',
      },
    },
  },
};

export const SizeBadge: Story = {
  args: {
    variant: 'outline',
    children: '2.4 MB',
  },
  parameters: {
    docs: {
      description: {
        story: 'Size badge for displaying file sizes or data quantities.',
      },
    },
  },
};

// Workflow specific badges
export const WorkflowStage: Story = {
  args: {
    variant: 'default',
    children: 'Stage 3 of 5',
  },
  parameters: {
    docs: {
      description: {
        story: 'Workflow stage badge showing progress through a multi-step process.',
      },
    },
  },
};

export const ProcessingStatus: Story = {
  args: {
    variant: 'secondary',
    children: (
      <>
        <div className="animate-spin mr-1 h-3 w-3 border-2 border-current border-t-transparent rounded-full" />
        Processing
      </>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Processing status badge with animated spinner.',
      },
    },
  },
};

// Badge collections
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="default">Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="outline">Outline</Badge>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All badge variants displayed together for comparison.',
      },
    },
  },
};

export const StatusCollection: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="default">
        <CheckCircle2 className="mr-1 h-3 w-3" />
        Completed
      </Badge>
      <Badge variant="secondary">
        <Clock className="mr-1 h-3 w-3" />
        In Progress
      </Badge>
      <Badge variant="destructive">
        <AlertTriangle className="mr-1 h-3 w-3" />
        Failed
      </Badge>
      <Badge variant="outline">
        <Star className="mr-1 h-3 w-3" />
        Starred
      </Badge>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Collection of status badges with icons for different states.',
      },
    },
  },
};

export const TagCollection: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="secondary" className="cursor-pointer hover:bg-muted/80">
        marketing
      </Badge>
      <Badge variant="secondary" className="cursor-pointer hover:bg-muted/80">
        ai-generated
      </Badge>
      <Badge variant="secondary" className="cursor-pointer hover:bg-muted/80">
        content-strategy
      </Badge>
      <Badge variant="secondary" className="cursor-pointer hover:bg-muted/80">
        blog-post
      </Badge>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Collection of tag badges for content categorization.',
      },
    },
  },
};

export const UserInterface: Story = {
  render: () => (
    <div className="space-y-4 max-w-md">
      <div className="flex items-center justify-between p-4 border rounded-lg">
        <div>
          <h3 className="font-medium">John Doe</h3>
          <p className="text-sm text-muted-foreground">john@example.com</p>
        </div>
        <Badge variant="destructive">Admin</Badge>
      </div>
      <div className="flex items-center justify-between p-4 border rounded-lg">
        <div>
          <h3 className="font-medium">Jane Smith</h3>
          <p className="text-sm text-muted-foreground">jane@example.com</p>
        </div>
        <Badge variant="secondary">Member</Badge>
      </div>
      <div className="flex items-center justify-between p-4 border rounded-lg">
        <div>
          <h3 className="font-medium">Guest User</h3>
          <p className="text-sm text-muted-foreground">guest@example.com</p>
        </div>
        <Badge variant="outline">Guest</Badge>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Real-world usage of badges in a user interface for role indication.',
      },
    },
  },
};