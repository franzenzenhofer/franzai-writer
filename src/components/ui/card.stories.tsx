import type { Meta, StoryObj } from '@storybook/react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { Badge } from './badge';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';

const meta = {
  title: 'UI/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic card
export const Basic: Story = {
  render: () => (
    <Card>
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card description goes here</CardDescription>
      </CardHeader>
      <CardContent>
        <p>This is the main content of the card.</p>
      </CardContent>
      <CardFooter>
        <Button>Action</Button>
      </CardFooter>
    </Card>
  ),
};

// Stage card example (similar to how it's used in the wizard)
export const StageCard: Story = {
  render: () => (
    <Card className="border-primary">
      <CardHeader className="flex flex-row justify-between items-start">
        <div className="flex-1 min-w-0">
          <CardTitle className="font-headline text-xl flex items-center">
            <CheckCircle2 className="text-primary h-5 w-5 mr-2" />
            Poem Topic
          </CardTitle>
          <CardDescription>
            Define the topic and theme for your poem generation
          </CardDescription>
        </div>
        <Badge variant="outline" className="text-xs">
          Completed
        </Badge>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm">
          A beautiful sunset over the mountains, with golden light filtering through the clouds.
        </p>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="secondary">Edit</Button>
        <Button>Continue</Button>
      </CardFooter>
    </Card>
  ),
};

// Pending stage card
export const PendingStageCard: Story = {
  render: () => (
    <Card className="opacity-60">
      <div className="px-6 pt-4 pb-2 text-center">
        <Badge variant="secondary" className="text-sm">
          <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
          Waiting for: Poem Topic
        </Badge>
      </div>
      <CardHeader>
        <CardTitle className="font-headline text-xl">
          Poem Generation
        </CardTitle>
        <CardDescription>
          AI will generate a poem based on your topic
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          This stage runs automatically when dependencies are complete.
        </p>
      </CardContent>
    </Card>
  ),
};

// Error stage card
export const ErrorStageCard: Story = {
  render: () => (
    <Card className="border-destructive">
      <CardHeader>
        <CardTitle className="font-headline text-xl flex items-center">
          <AlertCircle className="text-destructive h-5 w-5 mr-2" />
          Image Generation
        </CardTitle>
        <CardDescription>
          Generate images based on your poem content
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="border border-destructive/50 rounded-lg p-4 bg-destructive/5 space-y-3">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <p className="text-destructive font-medium text-sm">AI Stage Error</p>
              <p className="text-destructive text-sm leading-relaxed">
                Template variable error: Required data from previous stages is missing or invalid.
              </p>
              <p className="text-muted-foreground text-xs">
                💡 Tip: Try running previous stages again or check that all required form fields were completed.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="outline">Retry</Button>
      </CardFooter>
    </Card>
  ),
};

// Simple content card
export const SimpleContent: Story = {
  render: () => (
    <Card>
      <CardHeader>
        <CardTitle>Simple Card</CardTitle>
      </CardHeader>
      <CardContent>
        <p>This card has minimal content for demonstration purposes.</p>
      </CardContent>
    </Card>
  ),
};

// Card with long content
export const LongContent: Story = {
  render: () => (
    <Card>
      <CardHeader>
        <CardTitle>Long Content Card</CardTitle>
        <CardDescription>
          This card demonstrates how content flows when there's more text
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="mb-4">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor 
          incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis 
          nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
        </p>
        <p className="mb-4">
          Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore 
          eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt 
          in culpa qui officia deserunt mollit anim id est laborum.
        </p>
        <p>
          Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium 
          doloremque laudantium, totam rem aperiam.
        </p>
      </CardContent>
      <CardFooter>
        <Button>Read More</Button>
      </CardFooter>
    </Card>
  ),
};

// Card without footer
export const NoFooter: Story = {
  render: () => (
    <Card>
      <CardHeader>
        <CardTitle>No Footer Card</CardTitle>
        <CardDescription>This card doesn't have a footer</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Content without any footer actions.</p>
      </CardContent>
    </Card>
  ),
};

// Card with multiple actions
export const MultipleActions: Story = {
  render: () => (
    <Card>
      <CardHeader>
        <CardTitle>Multiple Actions</CardTitle>
        <CardDescription>Card with several action buttons</CardDescription>
      </CardHeader>
      <CardContent>
        <p>This card has multiple action buttons in the footer.</p>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="ghost">Cancel</Button>
        <Button variant="outline">Save Draft</Button>
        <Button>Publish</Button>
      </CardFooter>
    </Card>
  ),
};