import type { Meta, StoryObj } from '@storybook/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './card';
import { Button } from './button';
import { Badge } from './badge';
import { Input } from './input';
import { Label } from './label';
import { CheckCircle2, AlertCircle, Clock, Settings, User, FileText, Download, Share } from 'lucide-react';

const meta = {
  title: 'UI/Card',
  component: Card,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
The Card component system provides a flexible foundation for card-based layouts in the Franz AI Writer application.
It consists of several sub-components that work together to create consistent, well-structured content containers.

## Components
- **Card**: Main container with consistent styling (border, shadow, background)
- **CardHeader**: Header section with standardized spacing for titles and descriptions
- **CardTitle**: Primary heading with proper typography hierarchy
- **CardDescription**: Secondary text with muted colors for additional context
- **CardContent**: Main content area with consistent padding
- **CardFooter**: Footer section for actions and metadata

## Design Features
- Rounded corners for modern appearance
- Subtle borders and shadows for depth
- Consistent padding and spacing throughout
- Responsive design that adapts to different screen sizes
- Theme-aware colors that work in light and dark modes

## Common Use Cases
- Workflow stage cards
- Settings panels
- User profile cards
- Content summaries
- Action cards with buttons
- Form sections
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    className: {
      control: 'text',
      description: 'Additional CSS classes to apply to the card',
    },
    children: {
      control: false,
      description: 'Card content (typically CardHeader, CardContent, CardFooter)',
    },
  },
  args: {
    children: 'Card content',
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic card structure
export const Default: Story = {
  args: {
    children: (
      <>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card description that provides additional context.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>This is the main content area of the card where you can place any content.</p>
        </CardContent>
      </>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Basic card structure with header and content areas.',
      },
    },
  },
};

export const WithFooter: Story = {
  args: {
    children: (
      <>
        <CardHeader>
          <CardTitle>Document Settings</CardTitle>
          <CardDescription>Configure your document preferences and options.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Content area with form fields or other interactive elements.</p>
        </CardContent>
        <CardFooter>
          <Button variant="outline">Cancel</Button>
          <Button>Save Changes</Button>
        </CardFooter>
      </>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Card with footer containing action buttons.',
      },
    },
  },
};

export const MinimalCard: Story = {
  args: {
    children: (
      <CardContent>
        <p>Simple card with just content area for minimal layouts.</p>
      </CardContent>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Minimal card with only content area.',
      },
    },
  },
};

// Real-world examples
export const WorkflowStageCard: Story = {
  render: () => (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            Topic Selection
          </CardTitle>
          <Badge variant="default">Completed</Badge>
        </div>
        <CardDescription>
          Choose the topic for your AI-generated content.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Label htmlFor="topic">Your Topic</Label>
          <Input 
            id="topic" 
            placeholder="Enter your topic here..."
            defaultValue="The benefits of renewable energy"
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="secondary" className="mr-auto">Edit Input</Button>
        <Button>Continue</Button>
      </CardFooter>
    </Card>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Workflow stage card showing completed state with input and actions.',
      },
    },
  },
};

export const UserProfileCard: Story = {
  render: () => (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle>John Doe</CardTitle>
            <CardDescription>Premium Member</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Documents Created</span>
            <span className="font-medium">24</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Member Since</span>
            <span className="font-medium">March 2024</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full">
          <Settings className="mr-2 h-4 w-4" />
          Manage Account
        </Button>
      </CardFooter>
    </Card>
  ),
  parameters: {
    docs: {
      description: {
        story: 'User profile card with avatar, information, and action button.',
      },
    },
  },
};

export const DocumentCard: Story = {
  render: () => (
    <Card className="w-full max-w-sm hover:shadow-md transition-shadow cursor-pointer">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-500" />
            <CardTitle className="text-lg">Marketing Strategy</CardTitle>
          </div>
          <Badge variant="secondary">Draft</Badge>
        </div>
        <CardDescription>
          Comprehensive marketing strategy for Q2 2024 product launch.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            Modified 2h ago
          </div>
          <div>1,234 words</div>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="ghost" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Download
        </Button>
        <Button variant="ghost" size="sm">
          <Share className="mr-2 h-4 w-4" />
          Share
        </Button>
        <Button size="sm" className="ml-auto">
          Open
        </Button>
      </CardFooter>
    </Card>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Document card with metadata, status, and multiple actions.',
      },
    },
  },
};

export const StatusCard: Story = {
  render: () => (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-orange-500" />
          AI Processing Status
        </CardTitle>
        <CardDescription>
          Current status of your document generation.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm">Topic Analysis</span>
            <Badge variant="default">Complete</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Content Generation</span>
            <Badge variant="default">Complete</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Final Review</span>
            <Badge variant="secondary">In Progress</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Status card showing progress of a multi-step process.',
      },
    },
  },
};

export const FormCard: Story = {
  render: () => (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Contact Information</CardTitle>
        <CardDescription>
          Please provide your contact details for the document.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" placeholder="Enter your full name" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input id="email" type="email" placeholder="Enter your email" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="company">Company</Label>
          <Input id="company" placeholder="Enter your company name" />
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline">Clear Form</Button>
        <Button>Save & Continue</Button>
      </CardFooter>
    </Card>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Form card with input fields and action buttons.',
      },
    },
  },
};

// Layout examples
export const CardGrid: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl">
      <Card>
        <CardHeader>
          <CardTitle>Analytics</CardTitle>
          <CardDescription>Document performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">1,234</div>
          <p className="text-xs text-muted-foreground">Total views this month</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Generation Time</CardTitle>
          <CardDescription>Average AI processing time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">2.3s</div>
          <p className="text-xs text-muted-foreground">Faster than 90% of requests</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Success Rate</CardTitle>
          <CardDescription>Successful completions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">99.2%</div>
          <p className="text-xs text-muted-foreground">Last 30 days</p>
        </CardContent>
      </Card>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Grid layout of metric cards showing key performance indicators.',
      },
    },
  },
};

// Individual sub-component stories
export const HeaderOnly: Story = {
  render: () => (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Just a Header</CardTitle>
        <CardDescription>This card only has a header section.</CardDescription>
      </CardHeader>
    </Card>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Card with only a header section.',
      },
    },
  },
};

export const ContentOnly: Story = {
  render: () => (
    <Card className="w-full max-w-md">
      <CardContent>
        <h3 className="font-semibold mb-2">Content-Only Card</h3>
        <p className="text-sm text-muted-foreground">
          This card only uses the content area without header or footer.
        </p>
      </CardContent>
    </Card>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Card with only content area for minimal layouts.',
      },
    },
  },
};

export const FooterOnly: Story = {
  render: () => (
    <Card className="w-full max-w-md">
      <CardFooter>
        <Button variant="outline">Action 1</Button>
        <Button>Action 2</Button>
      </CardFooter>
    </Card>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Card with only footer section for action-focused layouts.',
      },
    },
  },
};