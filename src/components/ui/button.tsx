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

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  asChild?: boolean;
  children: React.ReactNode;
}

/**
 * CENTRAL BUTTON COMPONENT
 * 
 * Follows design guidelines exactly:
 * ✅ Always visible borders
 * ✅ High contrast colors (no gray-on-gray)
 * ✅ Shadows and depth effects
 * ✅ Smooth hover transitions
 * ✅ 44px minimum touch targets
 * ✅ Mobile-first design
 * 
 * Button Hierarchy:
 * - PRIMARY (default): Main actions - Royal Blue background
 * - SECONDARY: AI REDO, Edit buttons - Light background with DARK GRAY text
 * - OUTLINE: Download, Copy, Export buttons - Blue border with blue text
 * - GHOST: Back, Cancel, tertiary actions
 * - DESTRUCTIVE: Delete, Remove - Red background
 * - SUCCESS: Approve, Complete - Green background
 * - WARNING: Override, Force Update - Orange background
 * - ACCENT: Premium, Special features - Violet background
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
 * AI REDO BUTTON - Secondary variant with dark gray text
 * Used for AI regeneration actions
 */
export const AIRedoButton = React.forwardRef<HTMLButtonElement, Omit<ButtonProps, 'variant'>>(
  (props, ref) => <Button ref={ref} variant="secondary" {...props} />
);
AIRedoButton.displayName = 'AIRedoButton';

/**
 * EDIT BUTTON - Secondary variant with dark gray text
 * Used for editing actions
 */
export const EditButton = React.forwardRef<HTMLButtonElement, Omit<ButtonProps, 'variant'>>(
  (props, ref) => <Button ref={ref} variant="secondary" {...props} />
);
EditButton.displayName = 'EditButton';

/**
 * DOWNLOAD BUTTON - Outline variant with blue border and text
 * Used for export/download actions
 */
export const DownloadButton = React.forwardRef<HTMLButtonElement, Omit<ButtonProps, 'variant'>>(
  (props, ref) => <Button ref={ref} variant="outline" {...props} />
);
DownloadButton.displayName = 'DownloadButton';

/**
 * COPY BUTTON - Outline variant with blue border and text
 * Used for copy/export actions
 */
export const CopyButton = React.forwardRef<HTMLButtonElement, Omit<ButtonProps, 'variant'>>(
  (props, ref) => <Button ref={ref} variant="outline" {...props} />
);
CopyButton.displayName = 'CopyButton';

/**
 * EXPORT BUTTON - Outline variant with blue border and text
 * Used for all export actions
 */
export const ExportButton = React.forwardRef<HTMLButtonElement, Omit<ButtonProps, 'variant'>>(
  (props, ref) => <Button ref={ref} variant="outline" {...props} />
);
ExportButton.displayName = 'ExportButton';

// Helper function for creating button class variants (used by other components like AlertDialog)
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
