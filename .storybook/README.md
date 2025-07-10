# Storybook Documentation System

This directory contains the complete Storybook setup for Franz AI Writer, providing comprehensive component documentation and interactive examples.

## Features

- **Interactive Component Library**: View and test components in isolation
- **Comprehensive Documentation**: Auto-generated docs from JSDoc comments
- **Design System Integration**: Follows project's Tailwind CSS and shadcn/ui patterns
- **TypeScript Support**: Full type safety and IntelliSense
- **Responsive Testing**: Test components across different screen sizes

## Getting Started

### Installation

The required Storybook dependencies are listed in `package.json`:

```bash
npm install
```

### Running Storybook

```bash
# Start development server
npm run storybook

# Build static Storybook
npm run build-storybook
```

## Component Stories

Stories are organized by component type:

- **UI Components**: Basic design system components (`src/components/ui/`)
- **Wizard Components**: Complex workflow components (`src/components/wizard/`)
- **Layout Components**: Page structure components (`src/components/layout/`)

### Story Structure

Each story file follows this pattern:

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

## Documentation Guidelines

### JSDoc Comments

All components should have comprehensive JSDoc comments:

```typescript
/**
 * Primary button component for user interactions
 * 
 * @param variant - Button style variant
 * @param size - Button size (default, sm, lg, icon)
 * @param loading - Show loading spinner
 * @param disabled - Disable button interaction
 * @param children - Button content
 */
export const Button = ({ variant = 'default', size = 'default', ...props }) => {
  // Implementation
};
```

### Component Props

Document all props with TypeScript interfaces:

```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button style variant */
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  /** Button size */
  size?: 'default' | 'sm' | 'lg' | 'icon';
  /** Show loading spinner */
  loading?: boolean;
  /** Disable button interaction */
  disabled?: boolean;
  /** Button content */
  children: React.ReactNode;
}
```

## Best Practices

1. **Story Coverage**: Create stories for all major component variants
2. **Interactive Examples**: Use Storybook controls for dynamic testing
3. **Real-world Usage**: Include examples that mirror actual usage patterns
4. **Accessibility**: Document and test accessibility features
5. **Performance**: Test component performance with large datasets

## Integration

Storybook is integrated with the project's existing tooling:

- **Tailwind CSS**: Full design system support
- **TypeScript**: Type checking and IntelliSense
- **Next.js**: Compatible with Next.js patterns
- **ESLint**: Code quality enforcement

## Contributing

When adding new components:

1. Create comprehensive JSDoc comments
2. Add TypeScript interfaces for all props
3. Create stories covering all variants
4. Include real-world usage examples
5. Test accessibility and responsive behavior

## Deployment

Storybook can be deployed as a static site:

```bash
npm run build-storybook
# Deploy contents of storybook-static/
```

This provides a living documentation system that stays synchronized with the codebase.