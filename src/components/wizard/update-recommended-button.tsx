import React from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UpdateRecommendedButtonProps {
  onRegenerate: () => void;
  onDismiss: () => void;
  size?: 'sm' | 'default';
  className?: string;
}

/**
 * Update Recommended Button Component
 * 
 * Follows design guidelines:
 * ✅ Uses standard warning button variant (amber with white text)
 * ✅ Proper shadows and hover states
 * ✅ No layout reflows (positioned in card header actions)
 * ✅ Accessible dismiss functionality
 * 
 * Usage: Replace DismissibleWarningBadge with this component
 */
export function UpdateRecommendedButton({
  onRegenerate,
  onDismiss,
  size = 'sm',
  className
}: UpdateRecommendedButtonProps) {
  return (
    <div className="relative inline-flex items-center">
      <Button
        variant="warning"
        size={size}
        onClick={onRegenerate}
        className={cn("pr-8", className)}
        id="update-recommended-btn"
      >
        Update recommended
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={(e) => {
          e.stopPropagation();
          onDismiss();
        }}
        className="absolute right-0 h-full w-8 p-0 hover:bg-amber-600 rounded-r-md"
        aria-label="Dismiss update recommendation"
        id="dismiss-update-btn"
      >
        <X className="h-3 w-3 text-white" />
      </Button>
    </div>
  );
}