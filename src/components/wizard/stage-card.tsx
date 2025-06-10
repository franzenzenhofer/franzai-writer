"use client";

import type { Stage, StageState } from "@/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StageInputArea } from "./stage-input-area";
import { StageOutputArea } from "./stage-output-area";
import { CheckCircle2, AlertCircle, Zap, RotateCcw, Loader2, SkipForward, Edit } from "lucide-react";
import { cn } from "@/lib/utils";
import React, { useState } from "react";

interface StageCardProps {
  stage: Stage;
  stageState: StageState;
  isCurrentStage: boolean; // Is this the stage the user is actively working on?
  onRunStage: (stageId: string, userInput?: any) => void;
  onInputChange: (stageId: string, fieldName: string, value: any) => void;
  onFormSubmit: (stageId: string, data: any) => void; // Specifically for form inputs
  onSkipStage?: (stageId: string) => void;
  onEditInput: (stageId: string) => void;
  allStageStates: Record<string, StageState>;
}

export function StageCard({
  stage,
  stageState,
  isCurrentStage,
  onRunStage,
  onInputChange,
  onFormSubmit,
  onSkipStage,
  onEditInput,
  allStageStates,
}: StageCardProps) {
  
  const [isEditing, setIsEditing] = useState(stageState.status !== 'completed' && stage.inputType !== 'none');

  const handleRun = () => {
    if (stage.inputType === 'form') {
      // For forms, "Run" implies submitting the current form data
      // The actual form submission is handled by StageInputArea's submit button, which calls onFormSubmit
      // Then, the parent component should call onRunStage with the submitted form data
      // This button might be more of a "Proceed with this input" or might be removed if form has its own submit.
      // For now, let's assume onFormSubmit sets the input, then onRunStage uses it.
      // A bit complex, might need refactor. For now, this button triggers run with existing state.
      onRunStage(stage.id, stageState.userInput);
    } else {
      onRunStage(stage.id, stageState.userInput);
    }
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
    onEditInput(stage.id);
  };
  
  const handleSaveAndRun = (formData: any) => {
    onFormSubmit(stage.id, formData); // This updates stageState.userInput
    onRunStage(stage.id, formData); // Then run with the new data
    setIsEditing(false);
  };


  const canRun = stageState.status === "idle" || stageState.status === "error" || (stageState.status === "completed" && stage.inputType !== 'none');
  const showRunButton = stage.inputType !== "none" && isEditing;
  const showAiRedoButton = stageState.status === "completed" && stage.promptTemplate;
  const showEditButton = stageState.status === "completed" && stage.inputType !== "none" && !isEditing;
  
  let statusIcon = null;
  let statusColor = "";

  switch (stageState.status) {
    case "completed":
      statusIcon = <CheckCircle2 className="text-green-500" />;
      statusColor = "border-green-500";
      break;
    case "running":
      statusIcon = <Loader2 className="animate-spin text-primary" />;
      statusColor = "border-primary";
      break;
    case "error":
      statusIcon = <AlertCircle className="text-destructive" />;
      statusColor = "border-destructive";
      break;
    case "skipped":
      statusIcon = <SkipForward className="text-muted-foreground" />;
      statusColor = "border-muted";
      break;
    default: // idle
      if (isCurrentStage) statusColor = "border-accent shadow-lg";
      else statusColor = "border-border";
  }

  return (
    <Card id={`stage-${stage.id}`} className={cn("mb-6 transition-all duration-300", statusColor, isCurrentStage ? "shadow-accent/30 shadow-xl" : "")}>
      <CardHeader className="flex flex-row justify-between items-start pb-4">
        <div>
          <CardTitle className="font-headline text-xl flex items-center">
            {statusIcon && <span className="mr-2">{statusIcon}</span>}
            {stage.title}
            {stageState.isStale && stageState.status === 'completed' && <Badge variant="outline" className="ml-2 bg-amber-100 text-amber-700 border-amber-400">Stale</Badge>}
            {stageState.shouldShowUpdateBadge && <Badge variant="outline" className="ml-2">Update Recommended</Badge>}
          </CardTitle>
          <CardDescription>{stage.description}</CardDescription>
          {stage.isOptional && <Badge variant="outline" className="mt-1 text-xs">Optional</Badge>}
        </div>
        {stageState.depsAreMet === false && stageState.status === 'idle' && (
          <Badge variant="secondary">Waiting for dependencies</Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {(isEditing || stage.inputType === 'none') && stage.inputType !== 'none' && stageState.status !== 'running' && (
          <div>
            <h4 className="text-sm font-medium mb-2 text-muted-foreground">Input:</h4>
            <StageInputArea
              stage={stage}
              stageState={stageState}
              onInputChange={onInputChange}
              onFormSubmit={stage.inputType === 'form' ? handleSaveAndRun : onFormSubmit}
              allStageStates={allStageStates}
            />
          </div>
        )}

        {stageState.status === "completed" && stageState.output !== undefined && (
           <div>
            <h4 className="text-sm font-medium mb-2 text-muted-foreground">Output:</h4>
            <StageOutputArea stage={stage} stageState={stageState} />
          </div>
        )}
        
        {stageState.status === "error" && stageState.error && (
          <p className="text-destructive text-sm">{stageState.error}</p>
        )}
      </CardContent>
      <CardFooter className="flex justify-end gap-2 items-center">
        {stage.isOptional && stageState.status === "idle" && onSkipStage && (
          <Button variant="ghost" size="sm" onClick={() => onSkipStage(stage.id)}>
            <SkipForward className="mr-2 h-4 w-4" /> Skip Stage
          </Button>
        )}
        {showEditButton && (
          <Button variant="outline" size="sm" onClick={handleEdit}>
            <Edit className="mr-2 h-4 w-4" /> Edit Input
          </Button>
        )}
        {showRunButton && (
          <Button 
            size="sm" 
            onClick={handleRun} 
            disabled={stageState.status === "running" || stageState.depsAreMet === false}
            className="bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            {stageState.status === "running" ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Zap className="mr-2 h-4 w-4" />
            )}
            {stage.promptTemplate ? "Run AI" : "Save & Continue"}
          </Button>
        )}
        {showAiRedoButton && (
           <Button variant="outline" size="sm" onClick={() => { setIsEditing(true); onRunStage(stage.id, stageState.userInput); }}>
            <RotateCcw className="mr-2 h-4 w-4" /> AI Redo
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
