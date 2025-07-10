# Franz AI Writer - Storybook Component Library

This directory contains the Storybook configuration for the Franz AI Writer Next.js application, providing comprehensive component documentation and interactive development environment.

## Overview

Storybook serves as our component library documentation system, allowing developers to:
- View and interact with UI components in isolation
- Test different component states and props
- Access comprehensive documentation and usage examples
- Develop components independently from the main application

## Setup and Installation

### Prerequisites
- Node.js 18+ and npm
- Franz AI Writer project dependencies installed

### Installation
```bash
# Install dependencies (if not already installed)
npm install

# Start Storybook development server
npm run storybook
```

The Storybook dev server will start at `http://localhost:6006`.

### Build Production Version
```bash
# Build static Storybook for deployment
npm run build-storybook

# Serve built Storybook locally
npm run storybook:serve
```

## Configuration

### Main Configuration (`main.ts`)
- **Framework**: Next.js with TypeScript support
- **Story Discovery**: Automatically finds `*.stories.tsx` files in `src/`
- **Addons**: Essential Storybook addons for controls, documentation, and interactions
- **TypeScript**: Configured with react-docgen-typescript for automatic prop documentation
- **Features**: Experimental RSC support for React Server Components

### Preview Configuration (`preview.ts`)
- **Global Styles**: Imports the application's global CSS (Tailwind CSS)
- **Controls**: Automatic control generation for colors and dates
- **Viewport**: Responsive breakpoints matching the design system
- **Documentation**: Table of contents enabled for comprehensive docs

## Architecture

### Design System Integration
- **Tailwind CSS**: Full integration with the project's design system
- **Shadcn/UI**: All shadcn/ui components are documented with variants
- **Blue-based Theme**: Consistent with the application's color scheme
- **Space Grotesk**: Typography matches the application's font choices

### Component Coverage
- **UI Components**: Button, Card, Badge, and other foundational components
- **Wizard Components**: Stage cards, wizard shell, and workflow-specific components
- **Layout Components**: Header, footer, navigation components
- **Interactive Examples**: Real-world usage patterns and compositions

## Story Organization

### Naming Convention
Stories follow the pattern: `ComponentName.stories.tsx`

### Categories
- **UI Components** (`src/components/ui/`)
- **Wizard Components** (`src/components/wizard/`)
- **Layout Components** (`src/components/layout/`)

### Story Structure
Each story file includes:
- **Default export**: Component metadata and configuration
- **Multiple stories**: Different states, variants, and use cases
- **Controls**: Interactive props for testing
- **Documentation**: Usage examples and guidelines

## Development Workflow

### Creating New Stories
1. Create a `ComponentName.stories.tsx` file alongside your component
2. Define the default export with component metadata
3. Create individual stories for different states/variants
4. Add controls for interactive testing
5. Include documentation and usage examples

### Best Practices
- **Isolation**: Stories should not depend on external application state
- **Documentation**: Include comprehensive prop documentation
- **Accessibility**: Test components with different accessibility settings
- **Responsive**: Test components across different viewport sizes
- **Real Data**: Use realistic mock data in stories

## Component Documentation

### JSDoc Integration
- All components include comprehensive JSDoc comments
- Prop descriptions are automatically extracted
- Usage examples and best practices are documented
- Type information is preserved and displayed

### Interactive Controls
- **Automatic Controls**: Generated from TypeScript prop types
- **Custom Controls**: Manually configured for complex props
- **Validation**: Real-time validation of prop values
- **Presets**: Common configurations for quick testing

## Usage Examples

### Basic Component Story
```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './button';

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Button',
  },
};
```

### Complex Component with Controls
```typescript
export const AllVariants: Story = {
  render: () => (
    <div className="flex gap-4">
      <Button variant="default">Default</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
    </div>
  ),
};
```

## Integration with Development

### Hot Reloading
- Changes to components are automatically reflected in Storybook
- Stories themselves support hot reloading
- Global styles and configuration updates are reflected immediately

### TypeScript Support
- Full TypeScript support with type checking
- Automatic prop extraction from TypeScript interfaces
- IntelliSense support in story files

## Troubleshooting

### Common Issues

1. **Import Errors**: Ensure all dependencies are installed and paths are correct
2. **Style Issues**: Check that global CSS is properly imported in preview.ts
3. **TypeScript Errors**: Verify that TypeScript configuration is compatible
4. **Build Failures**: Check that all imports are valid and dependencies are available

### Debug Mode
```bash
# Run with debug information
npm run storybook -- --debug

# Check webpack configuration
npm run storybook -- --debug-webpack
```

## Contributing

### Adding New Components
1. Create the component with comprehensive JSDoc documentation
2. Add corresponding `.stories.tsx` file with multiple examples
3. Include accessibility testing and responsive behavior
4. Document any special usage patterns or requirements

### Updating Documentation
1. Update JSDoc comments for any prop changes
2. Add new stories for new features or variants
3. Keep examples realistic and useful for developers
4. Test across different viewport sizes

## Resources

- [Storybook Documentation](https://storybook.js.org/docs)
- [Next.js Storybook Integration](https://storybook.js.org/docs/react/get-started/nextjs)
- [Tailwind CSS in Storybook](https://storybook.js.org/recipes/tailwindcss)
- [TypeScript Configuration](https://storybook.js.org/docs/react/configure/typescript)