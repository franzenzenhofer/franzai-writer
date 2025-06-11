import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { Button, type ButtonProps } from '@/components/ui/button'; // Assuming ButtonProps can be imported

/**
 * @typedef StageActionButtonProps
 * @property {LucideIcon} [icon] - Optional Lucide icon component to display before the text.
 * @property {ButtonProps['variant']} [variant='default'] - The button variant (e.g., 'default', 'destructive', 'outline', 'secondary', 'ghost', 'link').
 * @property {ButtonProps['size']} [size='sm'] - The button size.
 * @property {() => void} [onClick] - Callback function invoked when the button is clicked.
 * @property {boolean} [disabled=false] - Whether the button is disabled.
 * @property {string} [id] - Optional ID for the button.
 * @property {string} [datatestid] - Optional data-testid for testing. (Note: HTML standard is data-testid)
 * @property {string} [className] - Optional additional class names for custom styling.
 * @property {React.ReactNode} children - The text content of the button.
 */

/**
 * A standardized button component for actions within a wizard stage.
 * It wraps the main Button component and provides consistent icon styling.
 *
 * @param {StageActionButtonProps} props - The props for the component.
 * @returns {JSX.Element} The rendered button.
 */
export function StageActionButton({
  icon: IconComponent,
  variant = 'default',
  size = 'sm',
  onClick,
  disabled = false,
  id,
  datatestid, // Will be passed as data-testid
  className,
  children,
}: {
  icon?: LucideIcon;
  variant?: ButtonProps['variant'];
  size?: ButtonProps['size'];
  onClick?: () => void;
  disabled?: boolean;
  id?: string;
  datatestid?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Button
      variant={variant}
      size={size}
      onClick={onClick}
      disabled={disabled}
      id={id}
      data-testid={datatestid} // Ensure it's passed as data-testid
      className={className}
    >
      {IconComponent && <IconComponent className="mr-2 h-4 w-4" />}
      {children}
    </Button>
  );
}
