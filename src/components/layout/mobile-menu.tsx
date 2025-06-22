"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Settings } from "lucide-react"

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
          className="md:hidden h-9 w-9 p-0"
          size="icon"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[240px] sm:w-[300px]">
        <SheetHeader>
          <SheetTitle>Navigation Menu</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-4 mt-4">
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
              <div className="flex flex-col gap-2">
                <Button
                  asChild
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => setOpen(false)}
                >
                  <Link href="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </Button>
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
              </div>
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