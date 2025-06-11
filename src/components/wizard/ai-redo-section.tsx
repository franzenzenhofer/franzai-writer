"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RotateCcw, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

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

  if (!enabled) {
    return null;
  }

  return (
    <div className={cn("flex items-start gap-3 py-3", className)}>
      {/* Notes textarea on the left */}
      <div className="flex-1">
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Optional notes for AI regeneration..."
          rows={1}
          className="min-h-[2.5rem] resize-none text-sm bg-background"
          disabled={isRunning}
          id={`ai-redo-notes-${stageId}`}
          data-testid={`ai-redo-notes-${stageId}`}
        />
      </div>
      
      {/* AI REDO button on the super right */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleAiRedo}
        disabled={isRunning}
        className="shrink-0 bg-background hover:bg-accent"
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
  );
} 