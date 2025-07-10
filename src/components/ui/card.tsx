import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Card - The main container component for card-based layouts.
 * 
 * This component provides a flexible container with consistent styling including
 * rounded corners, border, background color, and subtle shadow. It serves as the
 * foundation for more complex card compositions.
 * 
 * ## Design Features
 * - **Rounded Corners**: Consistent border radius for modern appearance
 * - **Border**: Subtle border for definition and separation
 * - **Background**: Card background color from the design system
 * - **Shadow**: Subtle shadow for depth and visual hierarchy
 * - **Responsive**: Adapts to different screen sizes and themes
 * 
 * ## Usage Patterns
 * - **Content Containers**: Grouping related content together
 * - **Interactive Elements**: Base for clickable card components
 * - **Form Sections**: Organizing form fields into logical groups
 * - **Dashboard Widgets**: Individual sections in dashboard layouts
 * 
 * @param props - Standard HTML div attributes
 * @param props.className - Additional CSS classes to apply
 * @param props.children - Card content
 * @returns JSX.Element - Styled card container
 * 
 * @example
 * ```typescript
 * <Card>
 *   <CardHeader>
 *     <CardTitle>Card Title</CardTitle>
 *     <CardDescription>Card description text</CardDescription>
 *   </CardHeader>
 *   <CardContent>
 *     <p>Main card content goes here.</p>
 *   </CardContent>
 * </Card>
 * ```
 */
const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

/**
 * CardHeader - Header section component for card layouts.
 * 
 * This component provides a standardized header area for cards with consistent
 * spacing and layout. It's designed to contain titles, descriptions, and action
 * buttons at the top of a card.
 * 
 * ## Layout Features
 * - **Flexbox Column**: Vertical layout for stacked header elements
 * - **Consistent Spacing**: Standardized gap between header elements
 * - **Padding**: Generous padding for comfortable content spacing
 * - **Flexible Content**: Supports various header content combinations
 * 
 * ## Common Contents
 * - **CardTitle**: Main heading for the card
 * - **CardDescription**: Supplementary description text
 * - **Action Buttons**: Primary actions related to the card
 * - **Status Indicators**: Badges or icons showing current state
 * 
 * @param props - Standard HTML div attributes
 * @param props.className - Additional CSS classes to apply
 * @param props.children - Header content (typically CardTitle and CardDescription)
 * @returns JSX.Element - Styled card header section
 * 
 * @example
 * ```typescript
 * <CardHeader>
 *   <CardTitle>Document Settings</CardTitle>
 *   <CardDescription>Configure your document preferences</CardDescription>
 * </CardHeader>
 * ```
 */
const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-5", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

/**
 * CardTitle - Primary heading component for card content.
 * 
 * This component provides consistent typography for card titles with proper
 * sizing, weight, and spacing. It serves as the main heading within card headers.
 * 
 * ## Typography Features
 * - **Large Text**: 2xl font size for clear hierarchy
 * - **Semibold Weight**: Medium weight for good readability
 * - **Tight Leading**: Optimized line height for headings
 * - **Letter Spacing**: Subtle tracking for professional appearance
 * 
 * ## Usage Guidelines
 * - Use for main card headings
 * - Keep titles concise and descriptive
 * - Typically placed inside CardHeader
 * - Should describe the card's primary purpose
 * 
 * @param props - Standard HTML div attributes
 * @param props.className - Additional CSS classes to apply
 * @param props.children - Title text content
 * @returns JSX.Element - Styled card title heading
 * 
 * @example
 * ```typescript
 * <CardTitle>AI Stage Execution</CardTitle>
 * ```
 */
const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

/**
 * CardDescription - Secondary text component for additional card context.
 * 
 * This component provides supplementary information below the card title,
 * using muted colors and smaller text to maintain visual hierarchy.
 * 
 * ## Typography Features
 * - **Small Text**: Compact sizing for secondary information
 * - **Muted Color**: Subdued color for proper hierarchy
 * - **Flexible Content**: Supports text, links, and inline elements
 * 
 * ## Usage Guidelines
 * - Use for explanatory text about the card's purpose
 * - Keep descriptions brief and informative
 * - Place below CardTitle in CardHeader
 * - Can include formatted text or links
 * 
 * @param props - Standard HTML div attributes
 * @param props.className - Additional CSS classes to apply
 * @param props.children - Description text or elements
 * @returns JSX.Element - Styled card description text
 * 
 * @example
 * ```typescript
 * <CardDescription>
 *   Configure AI models and processing settings for this workflow stage.
 * </CardDescription>
 * ```
 */
const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

/**
 * CardContent - Main content area component for card body.
 * 
 * This component provides the primary content area of a card with consistent
 * padding and spacing. It's designed to contain the main information or
 * interactive elements of the card.
 * 
 * ## Layout Features
 * - **Horizontal Padding**: Consistent side padding aligned with header
 * - **Bottom Padding**: Proper spacing from card edge
 * - **Flexible Content**: Supports any content type (text, forms, lists, etc.)
 * - **Full Width**: Takes full width of card container
 * 
 * ## Content Types
 * - **Text Content**: Paragraphs, lists, formatted text
 * - **Form Elements**: Input fields, buttons, form controls
 * - **Interactive Elements**: Buttons, links, toggles
 * - **Media Content**: Images, videos, embedded content
 * - **Data Display**: Tables, charts, statistics
 * 
 * @param props - Standard HTML div attributes
 * @param props.className - Additional CSS classes to apply
 * @param props.children - Main card content
 * @returns JSX.Element - Styled card content area
 * 
 * @example
 * ```typescript
 * <CardContent>
 *   <form className="space-y-4">
 *     <Input placeholder="Enter your topic" />
 *     <Button type="submit">Generate Content</Button>
 *   </form>
 * </CardContent>
 * ```
 */
const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("px-5 pb-5", className)} {...props} />
))
CardContent.displayName = "CardContent"

/**
 * CardFooter - Footer section component for card actions and metadata.
 * 
 * This component provides a standardized footer area for cards with flexbox
 * layout for action buttons, status information, or metadata. It's typically
 * used for actions related to the card content.
 * 
 * ## Layout Features
 * - **Flexbox Row**: Horizontal layout for footer elements
 * - **Center Alignment**: Vertically centers footer content
 * - **Consistent Padding**: Aligned with card content padding
 * - **Action Spacing**: Proper spacing between multiple actions
 * 
 * ## Common Contents
 * - **Action Buttons**: Primary and secondary actions
 * - **Status Information**: Timestamps, user info, progress
 * - **Navigation Elements**: Links to related content
 * - **Metadata**: File sizes, modification dates, tags
 * 
 * @param props - Standard HTML div attributes
 * @param props.className - Additional CSS classes to apply
 * @param props.children - Footer content (typically buttons or status info)
 * @returns JSX.Element - Styled card footer section
 * 
 * @example
 * ```typescript
 * <CardFooter>
 *   <Button variant="outline">Cancel</Button>
 *   <Button>Save Changes</Button>
 * </CardFooter>
 * ```
 */
const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center px-5 pb-5", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
