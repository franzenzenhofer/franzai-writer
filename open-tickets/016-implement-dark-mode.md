# Implement Dark Mode Support

**Created**: 2025-06-10
**Priority**: Medium
**Component**: UI/UX

## Description
Implement a system-aware and user-toggleable dark mode using Next.js best practices and Tailwind CSS, ensuring consistency across all components.

## Tasks
- [ ] Set up dark mode with next-themes
- [ ] Update color palette for dark mode
- [ ] Test all components in dark mode
- [ ] Add dark mode toggle component
- [ ] Persist user preference
- [ ] Ensure proper contrast ratios
- [ ] Update charts and visualizations
- [ ] Fix any dark mode visual bugs

## Implementation

### 1. Install next-themes
```bash
npm install next-themes
```

### 2. Configure Theme Provider
```typescript
// app/providers.tsx
import { ThemeProvider } from 'next-themes';

export function Providers({ children }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  );
}
```

### 3. Update Tailwind Config
```javascript
// tailwind.config.ts
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        // Update all color variables
      },
    },
  },
};
```

### 4. Dark Mode Toggle Component
```typescript
// components/theme-toggle.tsx
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
```

### 5. Update CSS Variables
```css
/* globals.css */
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    /* Light mode colors */
  }
  
  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    /* Dark mode colors */
  }
}
```

## Components to Update
- Alert components (different colors)
- Code blocks (syntax highlighting)
- Charts and graphs
- Form inputs and borders
- Card backgrounds
- Shadow effects

## Testing Checklist
- [ ] Toggle works properly
- [ ] System preference detected
- [ ] No flash of wrong theme
- [ ] All text readable
- [ ] Images have proper treatment
- [ ] Charts visible in both modes

## Acceptance Criteria
- [ ] Dark mode toggle in header
- [ ] Smooth theme transitions
- [ ] All components styled
- [ ] Preference persisted
- [ ] No accessibility issues
- [ ] Performance not impacted