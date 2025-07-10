import React from 'react';
import { Loader2 } from 'lucide-react';
import { Slot } from "@radix-ui/react-slot";
import { 
  BUTTON_VARIANTS, 
  BUTTON_SIZES, 
  BASE_BUTTON_CLASSES, 
  DISABLED_CLASSES, 
  LOADING_CLASSES,
  ButtonVariant,
  ButtonSize 
} from '@/lib/design-system/button-config';

/**
 * Props for the Button component.
 * 
 * Extends standard HTML button attributes with custom design system properties
 * for consistent styling and behavior across the application.
 * 
 * @interface ButtonProps
 * @extends React.ButtonHTMLAttributes<HTMLButtonElement>
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** 
   * Visual style variant that determines the button's appearance and semantic meaning.
   * 
   * @default 'default'
   * 
   * ## Variants
   * - **default**: Primary action button with royal blue background
   * - **secondary**: Secondary actions with light background and dark text
   * - **outline**: Outlined button with blue border and text
   * - **ghost**: Minimal button with no background (hover effects only)
   * - **destructive**: Dangerous actions with red background
   * - **success**: Positive actions with green background
   * - **warning**: Caution actions with orange background
   * - **accent**: Special features with violet background
   */
  variant?: ButtonVariant;
  /** 
   * Size variant that controls the button's dimensions and text size.
   * 
   * @default 'default'
   * 
   * ## Sizes
   * - **default**: Standard button size (44px height minimum for accessibility)
   * - **sm**: Small button for secondary actions
   * - **lg**: Large button for primary actions
   * - **icon**: Square button optimized for icon-only content
   */
  size?: ButtonSize;
  /** 
   * Shows a loading spinner and disables interaction when true.
   * 
   * @default false
   */
  loading?: boolean;
  /** 
   * Renders the button as a child element (using Radix UI Slot).
   * Useful for creating button-styled links or other interactive elements.
   * 
   * @default false
   */
  asChild?: boolean;
  /** Button content (text, icons, or other React elements) */
  children: React.ReactNode;
}

/**
 * Button - The central button component following the Franz AI Writer design system.
 * 
 * This component provides a comprehensive button system with multiple variants, sizes,
 * and states. It implements the design system's accessibility standards and visual
 * hierarchy while supporting advanced features like loading states and polymorphic rendering.
 * 
 * ## Design System Compliance
 * - **Always Visible Borders**: All buttons have clear, visible borders for definition
 * - **High Contrast Colors**: No gray-on-gray combinations for accessibility
 * - **Shadows and Depth**: Subtle shadows provide visual depth and interactivity cues
 * - **Smooth Transitions**: Hover and focus states with smooth 150ms transitions
 * - **44px Minimum Touch Targets**: Accessibility-compliant touch targets
 * - **Mobile-First Design**: Responsive design optimized for all screen sizes
 * 
 * ## Visual Hierarchy
 * - **Primary (default)**: Main actions with royal blue background
 * - **Secondary**: Supporting actions with light background and dark text
 * - **Outline**: Alternative actions with blue border and text
 * - **Ghost**: Minimal actions with hover effects only
 * - **Destructive**: Dangerous actions with red background
 * - **Success**: Positive actions with green background
 * - **Warning**: Caution actions with orange background
 * - **Accent**: Special features with violet background
 * 
 * ## Common Use Cases
 * - **Primary Actions**: Form submissions, main CTAs, continue buttons
 * - **Secondary Actions**: AI regeneration, editing, alternative options
 * - **Outline Actions**: Downloads, exports, copy operations
 * - **Ghost Actions**: Navigation, cancel, back buttons
 * - **Destructive Actions**: Delete, remove, clear operations
 * 
 * ## Accessibility Features
 * - **Keyboard Navigation**: Full keyboard support with focus indicators
 * - **Screen Reader Support**: Proper ARIA labels and descriptions
 * - **Loading States**: Accessible loading indicators with proper announcements
 * - **Color Contrast**: WCAG AA compliant color combinations
 * - **Touch Targets**: Minimum 44px height for mobile accessibility
 * 
 * @param props - Button component props
 * @returns JSX.Element - Styled button element with design system compliance
 * 
 * @example
 * ```typescript
 * // Primary action button
 * <Button variant="default" onClick={handleSubmit}>
 *   Submit Form
 * </Button>
 * 
 * // Loading state
 * <Button variant="default" loading={isSubmitting}>
 *   {isSubmitting ? 'Submitting...' : 'Submit'}
 * </Button>
 * 
 * // Destructive action
 * <Button variant="destructive" onClick={handleDelete}>
 *   Delete Document
 * </Button>
 * 
 * // As a link (polymorphic)
 * <Button asChild>
 *   <Link href="/dashboard">Go to Dashboard</Link>
 * </Button>
 * ```
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'default', size = 'default', loading = false, disabled = false, asChild = false, className = '', children, ...props }, ref) => {
    
    const variantConfig = BUTTON_VARIANTS[variant];
    const sizeConfig = BUTTON_SIZES[size];
    
    // Build complete class string following design system
    const buttonClasses = [
      BASE_BUTTON_CLASSES,
      variantConfig.base,
      variantConfig.hover,
      variantConfig.border,
      variantConfig.shadow,
      variantConfig.active,
      sizeConfig.classes,
      loading ? LOADING_CLASSES : '',
      (disabled || loading) ? DISABLED_CLASSES : '',
      className
    ].filter(Boolean).join(' ');

    if (asChild) {
      return (
        <Slot
          ref={ref}
          className={buttonClasses}
          {...props}
        >
          {children}
        </Slot>
      );
    }

    return (
      <button
        ref={ref}
        className={buttonClasses}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

// SPECIFIC BUTTON COMPONENTS FOR COMMON USE CASES

/**
 * AIRedoButton - Specialized button for AI regeneration actions.
 * 
 * Pre-configured with the secondary variant, providing consistent styling
 * for AI-related regeneration and retry operations throughout the application.
 * 
 * @param props - Button props (excluding variant which is fixed to 'secondary')
 * @returns JSX.Element - Secondary-styled button optimized for AI operations
 * 
 * @example
 * ```typescript
 * <AIRedoButton onClick={handleAiRedo}>
 *   Regenerate Content
 * </AIRedoButton>
 * ```
 */
export const AIRedoButton = React.forwardRef<HTMLButtonElement, Omit<ButtonProps, 'variant'>>(
  (props, ref) => <Button ref={ref} variant="secondary" {...props} />
);
AIRedoButton.displayName = 'AIRedoButton';

/**
 * EditButton - Specialized button for editing actions.
 * 
 * Pre-configured with the secondary variant, providing consistent styling
 * for content editing and modification operations.
 * 
 * @param props - Button props (excluding variant which is fixed to 'secondary')
 * @returns JSX.Element - Secondary-styled button optimized for editing operations
 * 
 * @example
 * ```typescript
 * <EditButton onClick={handleEditContent}>
 *   Edit Content
 * </EditButton>
 * ```
 */
export const EditButton = React.forwardRef<HTMLButtonElement, Omit<ButtonProps, 'variant'>>(
  (props, ref) => <Button ref={ref} variant="secondary" {...props} />
);
EditButton.displayName = 'EditButton';

/**
 * DownloadButton - Specialized button for download actions.
 * 
 * Pre-configured with the outline variant, providing consistent styling
 * for file download and export operations with clear visual distinction.
 * 
 * @param props - Button props (excluding variant which is fixed to 'outline')
 * @returns JSX.Element - Outline-styled button optimized for download operations
 * 
 * @example
 * ```typescript
 * <DownloadButton onClick={handleDownloadFile}>
 *   Download PDF
 * </DownloadButton>
 * ```
 */
export const DownloadButton = React.forwardRef<HTMLButtonElement, Omit<ButtonProps, 'variant'>>(
  (props, ref) => <Button ref={ref} variant="outline" {...props} />
);
DownloadButton.displayName = 'DownloadButton';

/**
 * CopyButton - Specialized button for copy-to-clipboard actions.
 * 
 * Pre-configured with the outline variant, providing consistent styling
 * for copy operations with clear visual indication of the action type.
 * 
 * @param props - Button props (excluding variant which is fixed to 'outline')
 * @returns JSX.Element - Outline-styled button optimized for copy operations
 * 
 * @example
 * ```typescript
 * <CopyButton onClick={handleCopyToClipboard}>
 *   Copy to Clipboard
 * </CopyButton>
 * ```
 */
export const CopyButton = React.forwardRef<HTMLButtonElement, Omit<ButtonProps, 'variant'>>(
  (props, ref) => <Button ref={ref} variant="outline" {...props} />
);
CopyButton.displayName = 'CopyButton';

/**
 * ExportButton - Specialized button for export actions.
 * 
 * Pre-configured with the outline variant, providing consistent styling
 * for document export operations across different formats and destinations.
 * 
 * @param props - Button props (excluding variant which is fixed to 'outline')
 * @returns JSX.Element - Outline-styled button optimized for export operations
 * 
 * @example
 * ```typescript
 * <ExportButton onClick={handleExportDocument}>
 *   Export Document
 * </ExportButton>
 * ```
 */
export const ExportButton = React.forwardRef<HTMLButtonElement, Omit<ButtonProps, 'variant'>>(
  (props, ref) => <Button ref={ref} variant="outline" {...props} />
);
ExportButton.displayName = 'ExportButton';

/**
 * Helper function for creating button class variants for use in other components.
 * 
 * This utility function generates the complete CSS class string for button styling
 * without rendering an actual button element. It's useful for components that need
 * button-like styling but aren't actual buttons (e.g., AlertDialog trigger buttons).
 * 
 * @param options - Configuration object for variant and size
 * @param options.variant - Button variant to style (defaults to 'default')
 * @param options.size - Button size to apply (defaults to 'default')
 * @returns Complete CSS class string for button styling
 * 
 * ## Use Cases
 * - **Dialog Triggers**: Styling non-button elements as buttons
 * - **Custom Components**: Applying button styles to custom interactive elements
 * - **Compound Components**: Creating button-styled parts of larger components
 * - **Style Composition**: Combining button styles with other component styles
 * 
 * @example
 * ```typescript
 * // Create a button-styled div
 * const buttonClasses = buttonVariants({ variant: 'outline', size: 'lg' });
 * <div className={buttonClasses}>Custom Button</div>
 * 
 * // Use in AlertDialog
 * <AlertDialogTrigger className={buttonVariants({ variant: 'destructive' })}>
 *   Delete Item
 * </AlertDialogTrigger>
 * 
 * // Combine with custom classes
 * const customButtonClass = cn(
 *   buttonVariants({ variant: 'ghost' }),
 *   'custom-additional-styles'
 * );
 * ```
 */
export function buttonVariants({ variant = 'default', size = 'default' }: { 
  variant?: ButtonVariant; 
  size?: ButtonSize; 
} = {}) {
  const variantConfig = BUTTON_VARIANTS[variant];
  const sizeConfig = BUTTON_SIZES[size];
  
  return [
    BASE_BUTTON_CLASSES,
    variantConfig.base,
    variantConfig.hover,
    variantConfig.border,
    variantConfig.shadow,
    variantConfig.active,
    sizeConfig.classes,
  ].filter(Boolean).join(' ');
}

// Re-export types
export type { ButtonVariant, ButtonSize };
