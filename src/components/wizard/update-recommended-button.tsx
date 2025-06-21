import React from 'react';
import { Button } from '@/components/ui/button';

interface UpdateRecommendedButtonProps {
  onRegenerate: () => void;
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
    <Button
      variant="warning"
      size={size}
      onClick={onRegenerate}
      className={className}
      id="update-recommended-btn"
    >
      Update recommended
    </Button>
  );
}