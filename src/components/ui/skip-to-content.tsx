"use client";

import { cn } from '@/lib/utils';

interface SkipToContentProps {
  targetId?: string;
  className?: string;
  children?: React.ReactNode;
}

export function SkipToContent({ 
  targetId = 'main-content', 
  className,
  children = 'Skip to main content'
}: SkipToContentProps) {
  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    
    const target = document.getElementById(targetId);
    if (target) {
      target.focus();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <a
      href={`#${targetId}`}
      onClick={handleClick}
      className={cn(
        "skip-to-content",
        "sr-only focus:not-sr-only",
        "absolute top-[-40px] left-2",
        "bg-primary text-primary-foreground",
        "px-4 py-2 rounded-md",
        "text-sm font-medium",
        "z-[100]",
        "transition-all duration-300",
        "focus:top-2",
        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
        className
      )}
    >
      {children}
    </a>
  );
}

/**
 * Skip navigation component for wizard stages
 * Provides quick navigation between stages
 */
interface SkipNavigationProps {
  stages: Array<{ id: string; title: string; completed?: boolean }>;
  currentStageId?: string;
  onStageClick?: (stageId: string) => void;
  className?: string;
}

export function SkipNavigation({ 
  stages, 
  currentStageId, 
  onStageClick,
  className 
}: SkipNavigationProps) {
  const handleStageClick = (stageId: string) => {
    const element = document.getElementById(`stage-${stageId}`);
    if (element) {
      element.focus();
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    onStageClick?.(stageId);
  };

  return (
    <nav
      className={cn(
        "sr-only focus-within:not-sr-only",
        "absolute top-16 left-2 right-2",
        "bg-background border border-border rounded-lg",
        "p-4 shadow-lg z-[90]",
        "focus-within:relative focus-within:top-0",
        className
      )}
      aria-label="Skip to stage navigation"
    >
      <h2 className="text-sm font-medium mb-2">Jump to stage:</h2>
      <ul className="space-y-1">
        {stages.map((stage) => (
          <li key={stage.id}>
            <button
              onClick={() => handleStageClick(stage.id)}
              className={cn(
                "w-full text-left px-3 py-2 rounded-md",
                "text-sm hover:bg-muted",
                "focus:outline-none focus:ring-2 focus:ring-primary",
                currentStageId === stage.id ? "bg-primary text-primary-foreground" : "",
                stage.completed ? "text-muted-foreground" : ""
              )}
            >
              <span className="flex items-center gap-2">
                {stage.completed ? "✓" : "○"}
                {stage.title}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}