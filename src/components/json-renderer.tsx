"use client";

import { cn } from "@/lib/utils";

interface JsonRendererProps {
  data: Record<string, any> | any[]; // Keep as any for JSON flexibility
  className?: string;
}

export function JsonRenderer({ data, className }: JsonRendererProps) {
  let jsonDataString;
  try {
    jsonDataString = JSON.stringify(data, null, 2);
  } catch (error) {
    jsonDataString = "Error: Invalid JSON data.";
  }

  return (
    <pre className={cn("p-4 bg-muted rounded-md overflow-x-auto text-sm font-code", className)}>
      <code>{jsonDataString}</code>
    </pre>
  );
}
