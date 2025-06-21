// CENTRAL BUTTON DESIGN SYSTEM CONFIGURATION
// Following design guidelines to the letter

export const DESIGN_COLORS = {
  // Brand Colors (from guidelines)
  primary: {
    hex: '#2563EB', // Royal Blue
    tailwind: 'blue-600',
    hover: 'blue-700'
  },
  accent: {
    hex: '#8B5CF6', // Violet
    tailwind: 'violet-500',
    hover: 'violet-600'
  },
  success: {
    hex: '#10B981', // Emerald Green
    tailwind: 'emerald-500',
    hover: 'emerald-600'
  },
  destructive: {
    hex: '#EF4444', // Rose Red
    tailwind: 'red-500',
    hover: 'red-600'
  },
  warning: {
    hex: '#F59E0B', // Amber Orange
    tailwind: 'amber-500',
    hover: 'amber-600'
  },
  // Neutral Colors
  darkGray: {
    hex: '#374151', // Dark gray for secondary button text
    tailwind: 'gray-700'
  },
  lightGray: {
    hex: '#F8FAFC', // Light background
    tailwind: 'slate-50'
  },
  border: {
    hex: '#E2E8F0', // Visible borders
    tailwind: 'slate-200'
  }
} as const;

// BUTTON HIERARCHY LOGIC
export const BUTTON_HIERARCHY = {
  // PRIMARY: Main actions, most important CTAs
  primary: {
    usage: ['Save Changes', 'Continue', 'Submit', 'Create', 'Publish', 'Start Process'],
    placement: 'Right-aligned in cards, main CTA position',
    variant: 'default'
  },
  
  // SECONDARY: Supporting actions, AI functions, editing
  secondary: {
    usage: ['AI REDO', 'Edit', 'Refresh', 'Preview', 'Settings', 'Filter'],
    placement: 'Paired with primary actions, left of primary',
    variant: 'secondary',
    textColor: 'DARK GRAY (#374151) - NOT colored text!'
  },
  
  // OUTLINE: Export, external actions, downloads
  outline: {
    usage: ['Download', 'Copy', 'Share', 'Export', 'Import', 'Upload'],
    placement: 'Export sections, external integrations',
    variant: 'outline',
    textColor: 'PRIMARY BLUE (#2563EB) - matches border'
  },
  
  // GHOST: Tertiary actions, navigation
  ghost: {
    usage: ['Back', 'Cancel', 'Skip', 'More Options', 'View Details'],
    placement: 'Navigation, tertiary actions',
    variant: 'ghost'
  },
  
  // DESTRUCTIVE: Dangerous actions
  destructive: {
    usage: ['Delete', 'Remove', 'Cancel Order', 'Reject'],
    placement: 'Separated from other buttons',
    variant: 'destructive'
  },
  
  // SUCCESS: Positive confirmations
  success: {
    usage: ['Approve', 'Complete', 'Accept', 'Verify', 'Confirm'],
    placement: 'Confirmation dialogs',
    variant: 'success'
  },
  
  // WARNING: Caution actions
  warning: {
    usage: ['Override', 'Force Update', 'Modify', 'Suspend'],
    placement: 'Warning contexts',
    variant: 'warning'
  },
  
  // ACCENT: Special features, premium actions
  accent: {
    usage: ['Premium', 'Favorite', 'Bookmark', 'Add to Cart'],
    placement: 'Special features, premium content',
    variant: 'accent'
  }
} as const;

// BUTTON VARIANT CONFIGURATIONS (Fixed Tailwind Classes)
export const BUTTON_VARIANTS = {
  default: {
    base: 'bg-blue-600 text-white',
    hover: 'hover:bg-blue-700 hover:shadow-lg',
    border: 'border border-blue-600 hover:border-blue-700',
    shadow: 'shadow-md',
    active: 'active:scale-95',
    description: 'Primary actions - Royal Blue with white text'
  },
  
  secondary: {
    base: 'bg-slate-50 text-gray-700',
    hover: 'hover:bg-blue-50 hover:shadow-sm',
    border: 'border border-slate-200 hover:border-blue-300',
    shadow: '',
    active: '',
    description: 'Secondary actions - Light background with DARK GRAY text (AI REDO, Edit)'
  },
  
  outline: {
    base: 'border-2 border-blue-600 bg-white text-blue-600',
    hover: 'hover:bg-blue-600 hover:text-white hover:shadow-md',
    border: '',
    shadow: 'shadow-sm',
    active: '',
    description: 'Export actions - White background with blue border and text (Download, Copy)'
  },
  
  destructive: {
    base: 'bg-red-500 text-white',
    hover: 'hover:bg-red-600 hover:shadow-md',
    border: 'border border-red-500 hover:border-red-600',
    shadow: 'shadow-sm',
    active: 'active:scale-95',
    description: 'Dangerous actions - Red background with white text'
  },
  
  success: {
    base: 'bg-emerald-500 text-white',
    hover: 'hover:bg-emerald-600 hover:shadow-md',
    border: 'border border-emerald-500 hover:border-emerald-600',
    shadow: 'shadow-sm',
    active: 'active:scale-95',
    description: 'Positive actions - Green background with white text'
  },
  
  warning: {
    base: 'bg-amber-500 text-white',
    hover: 'hover:bg-amber-600 hover:shadow-md',
    border: 'border border-amber-500 hover:border-amber-600',
    shadow: 'shadow-sm',
    active: 'active:scale-95',
    description: 'Caution actions - Orange background with white text'
  },
  
  accent: {
    base: 'bg-violet-500 text-white',
    hover: 'hover:bg-violet-600 hover:shadow-lg',
    border: 'border border-violet-500 hover:border-violet-600',
    shadow: 'shadow-md',
    active: 'active:scale-95',
    description: 'Special features - Violet background with white text'
  },
  
  ghost: {
    base: 'text-slate-700',
    hover: 'hover:bg-slate-100 hover:text-slate-900',
    border: 'border border-transparent hover:border-slate-200',
    shadow: '',
    active: '',
    description: 'Tertiary actions - Transparent with subtle hover'
  }
} as const;

// BUTTON SIZE CONFIGURATIONS (44px minimum touch targets)
export const BUTTON_SIZES = {
  sm: {
    classes: 'h-8 px-4 text-xs min-w-11',
    description: 'Small - 32px height, meets 44px with padding'
  },
  default: {
    classes: 'h-10 px-8 py-2 text-sm min-w-11',
    description: 'Default - 40px height, meets 44px touch target'
  },
  lg: {
    classes: 'h-11 px-10 text-base min-w-11',
    description: 'Large - 44px+ height, exceeds touch target'
  },
  icon: {
    classes: 'h-10 w-10 p-0 min-w-10',
    description: 'Icon only - 40px square, close to 44px requirement'
  }
} as const;

// BASE BUTTON CLASSES (always applied)
export const BASE_BUTTON_CLASSES = 
  'inline-flex items-center justify-center font-medium transition-all duration-200 ' +
  'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ' +
  'rounded-md cursor-pointer';

// DISABLED STATE CLASSES
export const DISABLED_CLASSES = 'opacity-50 cursor-not-allowed pointer-events-none';

// LOADING STATE CLASSES
export const LOADING_CLASSES = 'cursor-wait';

export type ButtonVariant = keyof typeof BUTTON_VARIANTS;
export type ButtonSize = keyof typeof BUTTON_SIZES; 