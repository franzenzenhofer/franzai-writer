import * as React from "react";
import Link from "next/link";
import { NavItem } from "@/types";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { BrainCircuit } from "lucide-react"; // Using BrainCircuit as a placeholder logo icon

interface MainNavProps {
  items?: NavItem[];
  className?: string;
}

export function MainNav({ items, className }: MainNavProps) {
  return (
    <div className={cn("flex gap-6 md:gap-10", className)}>
      <Link 
        href="/" 
        className="flex items-center space-x-2"
        id="main-nav-logo"
        data-testid="main-nav-logo"
      >
        <BrainCircuit className="h-6 w-6 text-primary" />
        <span className="inline-block font-bold font-headline">{siteConfig.name}</span>
      </Link>
      {items?.length ? (
        <nav className="flex gap-6">
          {items?.map(
            (item, index) =>
              item.href && (
                <Link
                  key={index}
                  href={item.href}
                  id={`nav-item-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                  data-testid={`nav-item-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                  className={cn(
                    "flex items-center text-sm font-medium text-muted-foreground hover:text-foreground",
                    item.disabled && "cursor-not-allowed opacity-80"
                  )}
                >
                  {item.title}
                </Link>
              )
          )}
        </nav>
      ) : null}
    </div>
  );
}
