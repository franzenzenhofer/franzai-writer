"use client";

import type { Stage, Workflow } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import React from "react";

interface StageInfoOverlayProps {
  stage: Stage;
  workflow: Workflow;
  isOpen: boolean;
  onClose: () => void;
  triggerRef?: React.RefObject<HTMLElement>;
}

export function StageInfoOverlay({ 
  stage, 
  workflow, 
  isOpen, 
  onClose, 
  triggerRef 
}: StageInfoOverlayProps) {
  // Don't render if not open
  if (!isOpen) return null;

  // Helper function to get stage title by ID
  const getStageTitle = (stageId: string): string => {
    const foundStage = workflow.stages.find(s => s.id === stageId);
    return foundStage?.title || stageId;
  };

  // Calculate position for overlay
  const getOverlayPosition = () => {
    if (!triggerRef?.current) {
      return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    }

    const rect = triggerRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Default to bottom-right of trigger, closer positioning
    let left = rect.right + 4;
    let top = rect.top - 2;
    
    // Adjust if would go off screen
    if (left + 256 > viewportWidth) { // 256px is overlay width (w-64)
      left = rect.left - 264; // Position to left of trigger
    }
    
    if (top + 180 > viewportHeight) { // Estimated overlay height (ultra compact now)
      top = Math.max(4, viewportHeight - 188);
    }
    
    return { 
      left: `${left}px`, 
      top: `${top}px`,
      transform: 'none'
    };
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
      />
      
      {/* Overlay */}
      <Card 
        className="fixed z-50 w-64 shadow-xl border-2"
        style={getOverlayPosition()}
      >
        <CardHeader className="pb-1 pt-2 px-3">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xs font-semibold leading-tight">{stage.title}</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-4 w-4 p-0 hover:bg-muted rounded-full -mt-0.5"
            >
              <X className="h-2.5 w-2.5" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-1 text-xs pt-0 pb-1.5 px-3">
          {/* Model Information */}
          <div className="grid grid-cols-[auto_1fr] gap-x-1 gap-y-0.5 text-xs">
            <span className="font-medium text-muted-foreground">Model:</span>
            <span className="font-mono">
              {stage.model || workflow.defaultModel || 'gemini-2.0-flash-thinking'}
            </span>
            {stage.temperature !== undefined && (
              <>
                <span className="font-medium text-muted-foreground">Temp:</span>
                <span>{stage.temperature}</span>
              </>
            )}
          </div>

          {/* Tools Information - Always show (includes functions + grounding) */}
          <div className="grid grid-cols-[auto_1fr] gap-x-1 gap-y-0.5 text-xs">
            <span className="font-medium text-muted-foreground">Tools:</span>
            {(() => {
              const tools = [];
              
              // Add function tools
              if (stage.toolNames && stage.toolNames.length > 0) {
                tools.push(...stage.toolNames);
              }
              
              // Add grounding tools (these are also tools in the Gemini API)
              if (stage.groundingSettings?.googleSearch?.enabled) {
                tools.push('googleSearch');
              }
              if (stage.groundingSettings?.urlContext?.enabled) {
                tools.push('urlContext');
              }
              
              return tools.length > 0 ? (
                <span className="break-words font-semibold text-green-600">
                  {tools.join(', ')}
                </span>
              ) : (
                <span className="text-muted-foreground">-</span>
              );
            })()}
          </div>

          {/* Thinking Mode - Separate from tools */}
          {stage.thinkingSettings?.enabled && (
            <div className="grid grid-cols-[auto_1fr] gap-x-1 gap-y-0.5 text-xs">
              <span className="font-medium text-muted-foreground">Thinking:</span>
              <span className="font-semibold text-blue-600">true</span>
            </div>
          )}

          {/* Dependencies for Active */}
          {stage.dependencies && stage.dependencies.length > 0 && (
            <div className="grid grid-cols-[auto_1fr] gap-x-1 gap-y-0.5 text-xs">
              <span className="font-medium text-muted-foreground">Deps:</span>
              <span className="break-words">
                {stage.dependencies.map(getStageTitle).join(', ')}
              </span>
            </div>
          )}

          {/* Dependencies for Auto-run */}
          {stage.autorunDependsOn && stage.autorunDependsOn.length > 0 && (
            <div className="grid grid-cols-[auto_1fr] gap-x-1 gap-y-0.5 text-xs">
              <span className="font-medium text-muted-foreground">Auto deps:</span>
              <span className="break-words">
                {stage.autorunDependsOn.map(getStageTitle).join(', ')}
              </span>
            </div>
          )}

          {/* Auto-run Status */}
          <div className="grid grid-cols-[auto_1fr] gap-x-1 gap-y-0.5 text-xs">
            <span className="font-medium text-muted-foreground">Auto:</span>
            <span>
              {stage.autoRun ? "Yes" : "No"}
            </span>
          </div>

          {/* Optional Status */}
          {stage.isOptional && (
            <div className="grid grid-cols-[auto_1fr] gap-x-1 gap-y-0.5 text-xs">
              <span className="font-medium text-muted-foreground">Optional:</span>
              <span>Yes</span>
            </div>
          )}

          {/* Input/Output Types */}
          <div className="grid grid-cols-[auto_1fr] gap-x-1 gap-y-0.5 text-xs">
            <span className="font-medium text-muted-foreground">Input:</span>
            <span>{stage.inputType}</span>
            <span className="font-medium text-muted-foreground">Output:</span>
            <span>{stage.outputType}</span>
          </div>

          {/* Token Estimate */}
          {stage.tokenEstimate !== undefined && stage.tokenEstimate > 0 && (
            <div className="grid grid-cols-[auto_1fr] gap-x-1 gap-y-0.5 text-xs">
              <span className="font-medium text-muted-foreground">Tokens:</span>
              <span>~{stage.tokenEstimate.toLocaleString()}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}

interface StageInfoTriggerProps {
  stage: Stage;
  workflow: Workflow;
  className?: string;
}

export function StageInfoTrigger({ stage, workflow, className }: StageInfoTriggerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  return (
    <>
      <Button
        ref={triggerRef}
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className={cn(
          "h-5 w-5 p-0 hover:bg-muted/70 rounded-full text-muted-foreground hover:text-foreground transition-colors",
          className
        )}
      >
        <Info className="h-3.5 w-3.5 stroke-[2.5]" />
      </Button>
      
      <StageInfoOverlay
        stage={stage}
        workflow={workflow}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        triggerRef={triggerRef}
      />
    </>
  );
} 