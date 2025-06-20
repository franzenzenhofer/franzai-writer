"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RotateCcw, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { isSubmitShortcut } from "@/lib/platform-utils";
import { KeyboardHint } from "@/components/ui/keyboard-hint";

interface AiRedoSectionProps {
  stageId: string;
  enabled: boolean;
  isRunning?: boolean;
  onAiRedo: (notes?: string) => void;
  className?: string;
}

export function AiRedoSection({ 
  stageId, 
  enabled, 
  isRunning = false,
  onAiRedo, 
  className 
}: AiRedoSectionProps) {
  const [notes, setNotes] = useState("");

  const handleAiRedo = () => {
    onAiRedo(notes.trim() || undefined);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (isSubmitShortcut(e.nativeEvent)) {
      e.preventDefault();
      handleAiRedo();
    }
  };

  if (!enabled) {
    return null;
  }

  return (
    <div className={cn("block space-y-3 py-3", className)}>
      {/* Full-width multiline textarea */}
      <div className="w-full">
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Optional notes for AI regeneration..."
          rows={3}
          className="w-full min-h-[5rem] text-sm bg-background"
          disabled={isRunning}
          id={`ai-redo-notes-${stageId}`}
          data-testid={`ai-redo-notes-${stageId}`}
        />
      </div>
      
      {/* AI REDO button below and to the right */}
      <div className="w-full flex justify-end items-center gap-2">
        <KeyboardHint className="text-xs text-muted-foreground" />
        <Button
          variant="outline"
          size="sm"
          onClick={handleAiRedo}
          disabled={isRunning}
          id={`ai-redo-${stageId}`}
          data-testid={`ai-redo-${stageId}`}
        >
          {isRunning ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RotateCcw className="mr-2 h-4 w-4" />
          )}
          {isRunning ? "Regenerating..." : "AI REDO"}
        </Button>
      </div>
    </div>
  );
} 