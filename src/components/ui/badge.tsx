import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Badge variant definitions using class-variance-authority.
 * 
 * Defines the visual styles for different badge variants including colors,
 * borders, and hover states. Each variant serves a specific semantic purpose
 * in the application's information hierarchy.
 */
const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-muted text-foreground hover:bg-muted/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "border-border text-foreground bg-background",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

/**
 * Props for the Badge component.
 * 
 * Extends standard HTML div attributes with variant styling options
 * for consistent badge appearance across the application.
 * 
 * @interface BadgeProps
 * @extends React.HTMLAttributes<HTMLDivElement>
 * @extends VariantProps<typeof badgeVariants>
 */
export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

/**
 * Badge - Compact component for displaying status, categories, or metadata.
 * 
 * This component provides a small, styled container for short text or status
 * indicators. It's designed to be visually distinct while remaining unobtrusive,
 * perfect for displaying supplementary information.
 * 
 * ## Design Features
 * - **Compact Size**: Small footprint with xs text and minimal padding
 * - **Rounded Corners**: Modern appearance with rounded border radius
 * - **Color Variants**: Multiple color schemes for different contexts
 * - **Hover Effects**: Subtle hover states for interactive badges
 * - **Focus Support**: Keyboard focus with ring indicators
 * - **Inline Display**: Inline-flex layout for easy text integration
 * 
 * ## Variant Meanings
 * - **Default**: Primary information or positive status (blue theme)
 * - **Secondary**: Neutral information or inactive status (muted colors)
 * - **Destructive**: Warnings, errors, or negative status (red theme)
 * - **Outline**: Subtle emphasis with minimal visual weight (bordered)
 * 
 * ## Common Use Cases
 * - **Status Indicators**: Active, inactive, pending, completed states
 * - **Categories**: Content types, workflow stages, document types
 * - **Counts**: Notification counts, item quantities, progress indicators
 * - **Tags**: Keywords, labels, classification markers
 * - **Metadata**: Version numbers, dates, user roles
 * 
 * ## Accessibility
 * - **Color Independence**: Status conveyed through text, not just color
 * - **Focus Indicators**: Clear focus rings for keyboard navigation
 * - **Screen Reader Support**: Semantic meaning through variant selection
 * - **Contrast Compliant**: High contrast color combinations
 * 
 * @param props - Component props including variant and standard div attributes
 * @returns JSX.Element - Styled badge component
 * 
 * @example
 * ```typescript
 * // Status badge
 * <Badge variant="default">Active</Badge>
 * <Badge variant="destructive">Error</Badge>
 * <Badge variant="secondary">Draft</Badge>
 * 
 * // Count badge
 * <Badge variant="outline">{notificationCount}</Badge>
 * 
 * // Category badge
 * <Badge>AI Generated</Badge>
 * 
 * // Interactive badge with click handler
 * <Badge 
 *   variant="secondary" 
 *   onClick={handleTagClick}
 *   className="cursor-pointer"
 * >
 *   Click me
 * </Badge>
 * ```
 */
function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
