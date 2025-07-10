import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Base card component for creating card-based layouts
 * 
 * This is the foundation component for all card-based UI elements in the application.
 * It provides consistent styling, spacing, and theming for card containers.
 * 
 * @param props - Standard div HTML attributes
 * @param props.className - Additional CSS classes to apply
 * @param ref - React ref for the div element
 * @returns Card container with consistent styling
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
 * Card header component for displaying titles and descriptions
 * 
 * This component provides the header section of a card, typically containing
 * the card title and optional description. It includes consistent padding and
 * spacing for optimal layout.
 * 
 * @param props - Standard div HTML attributes
 * @param props.className - Additional CSS classes to apply
 * @param ref - React ref for the div element
 * @returns Card header with flex layout and consistent spacing
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
 * Card title component for prominent card headings
 * 
 * This component renders the main title of a card with consistent typography
 * and styling. It uses large, semibold text with optimized letter spacing
 * for readability and visual hierarchy.
 * 
 * @param props - Standard div HTML attributes
 * @param props.className - Additional CSS classes to apply
 * @param ref - React ref for the div element
 * @returns Card title with large, semibold typography
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
 * Card description component for supplementary card text
 * 
 * This component provides descriptive text that supports the card title.
 * It uses muted foreground colors and smaller text size to create proper
 * visual hierarchy while maintaining readability.
 * 
 * @param props - Standard div HTML attributes
 * @param props.className - Additional CSS classes to apply
 * @param ref - React ref for the div element
 * @returns Card description with muted, smaller text styling
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
 * Card content component for the main card body
 * 
 * This component provides the main content area of a card with consistent
 * horizontal and bottom padding. It's designed to contain the primary
 * information or interactive elements of the card.
 * 
 * @param props - Standard div HTML attributes
 * @param props.className - Additional CSS classes to apply
 * @param ref - React ref for the div element
 * @returns Card content area with consistent padding
 */
const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("px-5 pb-5", className)} {...props} />
))
CardContent.displayName = "CardContent"

/**
 * Card footer component for actions and secondary information
 * 
 * This component provides the footer area of a card, typically containing
 * action buttons, links, or secondary information. It uses flex layout
 * for easy alignment of footer elements.
 * 
 * @param props - Standard div HTML attributes
 * @param props.className - Additional CSS classes to apply
 * @param ref - React ref for the div element
 * @returns Card footer with flex layout and consistent padding
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
