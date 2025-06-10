"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      className={cn("prose prose-sm dark:prose-invert max-w-none font-body", className)}
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({node, ...props}) => <h1 className="font-headline" {...props} />,
        h2: ({node, ...props}) => <h2 className="font-headline" {...props} />,
        h3: ({node, ...props}) => <h3 className="font-headline" {...props} />,
        code: ({node, inline, className, children, ...props}) => {
          const match = /language-(\w+)/.exec(className || '')
          return !inline && match ? (
            <pre className={cn(className, "font-code bg-muted p-4 rounded-md overflow-x-auto")} {...props}>
              <code>{String(children).replace(/\n$/, '')}</code>
            </pre>
          ) : (
            <code className={cn(className, "font-code bg-muted text-sm px-1 py-0.5 rounded")} {...props}>
              {children}
            </code>
          )
        }
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
