import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X as XIcon } from 'lucide-react';

/**
 * @typedef DismissibleWarningBadgeProps
 * @property {React.ReactNode} children - The content to display within the badge.
 * @property {() => void} onDismiss - Callback function invoked when the dismiss button is clicked.
 * @property {string} [className] - Optional additional class names for custom styling.
 */

/**
 * A badge component with warning styling (amber colors) and a dismiss button.
 *
 * @param {DismissibleWarningBadgeProps} props - The props for the component.
 * @returns {JSX.Element | null} The rendered badge or null if no children are provided.
 */
export function DismissibleWarningBadge({ children, onDismiss, className }: {
  children: React.ReactNode;
  onDismiss: () => void;
  className?: string;
}) {
  if (!children) {
    return null;
  }

  return (
    <Badge
      variant="outline"
      className={`
        bg-amber-50 border-amber-300 text-amber-700
        dark:bg-amber-900/30 dark:border-amber-700 dark:text-amber-300
        flex items-center gap-x-1 pr-1 ${className || ''}
      `}
    >
      {children}
      <Button
        variant="ghost"
        size="icon-xs" // Assuming a very small size for the icon button
        onClick={(e) => {
          e.stopPropagation(); // Prevent any parent click handlers
          onDismiss();
        }}
        className="ml-1 hover:bg-amber-200 dark:hover:bg-amber-700 rounded-full h-4 w-4 p-0"
        aria-label="Dismiss warning"
      >
        <XIcon className="h-3 w-3" />
      </Button>
    </Badge>
  );
}
