import type { Meta, StoryObj } from '@storybook/react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { Badge } from './badge';
import { CheckCircle2, AlertCircle, Clock, ArrowRight } from 'lucide-react';

const meta: Meta<typeof Card> = {
  title: 'UI/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Basic Card Stories
export const Basic: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Basic Card</CardTitle>
        <CardDescription>This is a basic card with header and content.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>This is the card content area where you can put any content you need.</p>
      </CardContent>
    </Card>
  ),
};

export const WithFooter: Story = {
  name: 'Card with Footer',
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Card with Footer</CardTitle>
        <CardDescription>This card includes a footer with actions.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>This card demonstrates how to use the footer area for actions and buttons.</p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">Cancel</Button>
        <Button>Continue</Button>
      </CardFooter>
    </Card>
  ),
};

export const StageCard: Story = {
  name: 'Stage Card',
  render: () => (
    <Card className="w-[400px]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Poem Generation</CardTitle>
          <Badge variant="default">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Completed
          </Badge>
        </div>
        <CardDescription>
          Generate a creative poem based on your topic and style preferences.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="p-3 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Input:</h4>
            <p className="text-sm text-muted-foreground">
              Write a poem about nature and mountains with a romantic tone.
            </p>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg">
            <h4 className="font-medium mb-2">Output:</h4>
            <p className="text-sm">
              Among the towering peaks so high,<br />
              Where eagles soar across the sky,<br />
              Your love shines bright like morning dew,<br />
              On mountain flowers, fresh and new.
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="secondary" className="mr-2">
          <ArrowRight className="mr-2 h-4 w-4" />
          AI Redo
        </Button>
        <Button variant="outline">Edit</Button>
      </CardFooter>
    </Card>
  ),
};

export const StageCardPending: Story = {
  name: 'Stage Card - Pending',
  render: () => (
    <Card className="w-[400px] border-dashed">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-muted-foreground">Image Generation</CardTitle>
          <Badge variant="secondary">
            <Clock className="mr-1 h-3 w-3" />
            Waiting
          </Badge>
        </div>
        <CardDescription>
          Generate custom images based on your poem and style preferences.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="p-4 bg-muted/50 rounded-lg text-center">
          <p className="text-sm text-muted-foreground">
            Complete the previous stage to unlock this step.
          </p>
        </div>
      </CardContent>
    </Card>
  ),
};

export const StageCardError: Story = {
  name: 'Stage Card - Error',
  render: () => (
    <Card className="w-[400px] border-red-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">AI Processing</CardTitle>
          <Badge variant="destructive">
            <AlertCircle className="mr-1 h-3 w-3" />
            Error
          </Badge>
        </div>
        <CardDescription>
          Process your content with advanced AI capabilities.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <h4 className="font-medium mb-2 text-red-800">Error Details:</h4>
          <p className="text-sm text-red-700">
            AI service temporarily unavailable. Please try again in a few moments.
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="mr-2">
          Copy Error
        </Button>
        <Button>Retry</Button>
      </CardFooter>
    </Card>
  ),
};

// Layout Examples
export const CardGrid: Story = {
  name: 'Card Grid Layout',
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Topic Definition</CardTitle>
          <CardDescription>Define your content topic and scope.</CardDescription>
        </CardHeader>
        <CardContent>
          <Badge variant="default">Completed</Badge>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Content Generation</CardTitle>
          <CardDescription>Generate content based on your topic.</CardDescription>
        </CardHeader>
        <CardContent>
          <Badge variant="secondary">In Progress</Badge>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Review & Edit</CardTitle>
          <CardDescription>Review and refine your generated content.</CardDescription>
        </CardHeader>
        <CardContent>
          <Badge variant="outline">Pending</Badge>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Export & Publish</CardTitle>
          <CardDescription>Export your content in various formats.</CardDescription>
        </CardHeader>
        <CardContent>
          <Badge variant="outline">Pending</Badge>
        </CardContent>
      </Card>
    </div>
  ),
};

export const CompactCard: Story = {
  name: 'Compact Card',
  render: () => (
    <Card className="w-[300px]">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Quick Action</CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <Button size="sm" className="w-full">
          Execute
        </Button>
      </CardContent>
    </Card>
  ),
};

export const DetailedCard: Story = {
  name: 'Detailed Card',
  render: () => (
    <Card className="w-[500px]">
      <CardHeader>
        <CardTitle>Workflow Overview</CardTitle>
        <CardDescription>
          Complete overview of your current workflow progress and next steps.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Progress</span>
            <span className="text-sm text-muted-foreground">3 of 5 steps</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full w-3/5"></div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium">Next Step</p>
              <p className="text-muted-foreground">Image Generation</p>
            </div>
            <div>
              <p className="font-medium">Est. Time</p>
              <p className="text-muted-foreground">2-3 minutes</p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full">
          Continue Workflow
        </Button>
      </CardFooter>
    </Card>
  ),
};