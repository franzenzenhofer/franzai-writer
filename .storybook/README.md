# Storybook Documentation

This directory contains the Storybook configuration for the Franz AI Writer component documentation system.

## Overview

Storybook provides an isolated environment for developing and documenting UI components. It allows developers to:

- View components in isolation
- Test different component states and props
- Generate automatic documentation from JSDoc comments
- Provide interactive examples for the design system

## Getting Started

### Installation

The necessary Storybook dependencies are included in the project's `package.json`. To install them:

```bash
npm install
```

### Running Storybook

Start the Storybook development server:

```bash
npm run storybook
```

This will start Storybook on `http://localhost:6006`.

### Building Storybook

To build a static version of Storybook for deployment:

```bash
npm run build-storybook
```

## Configuration

### Main Configuration (`main.ts`)

- **Stories**: Automatically discovers `.stories.@(js|jsx|mjs|ts|tsx)` files in the `src` directory
- **Addons**: Includes essential addons for documentation, interactions, and controls
- **Framework**: Configured for Next.js with TypeScript support
- **Autodocs**: Automatically generates documentation pages for tagged stories

### Preview Configuration (`preview.ts`)

- **Global Styles**: Imports the project's global CSS (Tailwind)
- **Controls**: Configures automatic prop detection for color and date types
- **Actions**: Sets up action logging for event handlers

## Writing Stories

### Basic Story Structure

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { YourComponent } from './your-component';

const meta = {
  title: 'Category/YourComponent',
  component: YourComponent,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    // Configure controls for props
  },
} satisfies Meta<typeof YourComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // Default props
  },
};
```

### Best Practices

1. **Categorization**: Use logical categories in the `title` field:
   - `UI/ComponentName` for basic UI components
   - `Wizard/ComponentName` for wizard-specific components
   - `Layout/ComponentName` for layout components

2. **Documentation**: Include JSDoc comments on components and props for automatic documentation generation

3. **Story Variants**: Create stories for different states:
   - Default state
   - Loading state
   - Error state
   - Different variants/sizes
   - Real-world usage examples

4. **Controls**: Configure `argTypes` to provide interactive controls for component props

## Component Categories

### UI Components (`src/components/ui/`)

Basic design system components:
- **Button**: All button variants with different states
- **Card**: Card layouts and compositions
- **Badge**: Status and informational badges
- **Alert**: Alert messages and notifications

### Wizard Components (`src/components/wizard/`)

Workflow-specific components:
- **WizardShell**: Main orchestration component
- **StageCard**: Individual workflow stage
- **StageInputArea**: Input handling for stages
- **StageOutputArea**: Output rendering for stages

### Layout Components (`src/components/layout/`)

Application layout and navigation:
- **MainNav**: Primary navigation
- **SiteHeader**: Application header
- **SiteFooter**: Application footer

## Design System Integration

The Storybook setup is designed to work seamlessly with the project's design system:

- **Tailwind CSS**: Full Tailwind support with project configuration
- **shadcn/ui**: All shadcn/ui components are documented
- **Design Tokens**: Color system and spacing are reflected in stories
- **Typography**: Font choices (Space Grotesk for headlines) are preserved

## Deployment

For production deployment, build the static Storybook and serve the files:

```bash
npm run build-storybook
# Serve the storybook-static directory
```

## Contributing

When adding new components:

1. Add comprehensive JSDoc comments to the component
2. Create a `.stories.tsx` file with multiple story variants
3. Include real-world usage examples
4. Test different component states and edge cases
5. Use appropriate categorization in the story title

## Maintenance

- Keep Storybook dependencies updated with the project
- Review and update stories when component APIs change
- Ensure new components have corresponding stories
- Maintain consistency in story structure and naming