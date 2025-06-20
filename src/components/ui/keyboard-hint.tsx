"use client";

import { getSubmitShortcutText } from "@/lib/platform-utils";
import { cn } from "@/lib/utils";

interface KeyboardHintProps {
  className?: string;
}

export function KeyboardHint({ className }: KeyboardHintProps) {
  const shortcut = getSubmitShortcutText();
  
  if (!shortcut) return null;
  
  return (
    <span className={cn("text-xs text-muted-foreground", className)}>
      {shortcut}
    </span>
  );
}