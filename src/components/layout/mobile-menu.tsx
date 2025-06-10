"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"

interface MobileMenuProps {
  items?: {
    title: string
    href: string
  }[]
  isAuthenticated: boolean
  onSignOut: () => void
}

export function MobileMenu({ items, isAuthenticated, onSignOut }: MobileMenuProps) {
  const pathname = usePathname()
  const [open, setOpen] = React.useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="md:hidden"
          size="icon"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[240px] sm:w-[300px]">
        <nav className="flex flex-col gap-4">
          <Link
            href="/"
            className="flex items-center space-x-2"
            onClick={() => setOpen(false)}
          >
            <span className="font-bold">Franz AI Writer</span>
          </Link>
          {items?.length ? (
            <nav className="flex flex-col gap-2">
              {items.map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center text-sm font-medium transition-colors hover:text-primary py-2",
                    pathname === item.href ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {item.title}
                </Link>
              ))}
            </nav>
          ) : null}
          <div className="mt-auto pt-4 border-t">
            {isAuthenticated ? (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  onSignOut()
                  setOpen(false)
                }}
              >
                Sign Out
              </Button>
            ) : (
              <div className="flex flex-col gap-2">
                <Button
                  asChild
                  variant="default"
                  className="w-full"
                  onClick={() => setOpen(false)}
                >
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="w-full"
                  onClick={() => setOpen(false)}
                >
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  )
}