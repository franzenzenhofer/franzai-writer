import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98] min-h-11 border",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-lg shadow-md border-primary hover:border-primary/90",
        secondary: "bg-secondary text-secondary-foreground hover:bg-primary/10 hover:shadow-sm border-border hover:border-primary/20",
        outline: "border-2 border-primary bg-background text-primary hover:bg-primary hover:text-primary-foreground hover:shadow-md shadow-sm",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:shadow-md shadow-sm border-destructive hover:border-destructive/90",
        success: "bg-success text-success-foreground hover:bg-success/90 hover:shadow-md shadow-sm border-success hover:border-success/90",
        warning: "bg-warning text-warning-foreground hover:bg-warning/90 hover:shadow-md shadow-sm border-warning hover:border-warning/90",
        accent: "bg-accent text-accent-foreground hover:bg-accent/90 hover:shadow-lg shadow-md border-accent hover:border-accent/90",
        ghost: "hover:bg-secondary hover:text-secondary-foreground border-transparent hover:border-border hover:shadow-sm",
        link: "text-primary underline-offset-4 hover:underline border-transparent",
      },
      size: {
        sm: "h-9 px-3 text-xs min-h-11",
        default: "h-11 px-5 py-2",
        lg: "h-12 px-8",
        icon: "h-11 w-11 min-h-11 min-w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
