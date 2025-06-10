
"use client";

import type { Stage, StageState } from "@/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StageInputArea } from "./stage-input-area";
import { StageOutputArea } from "./stage-output-area";
import { CheckCircle2, AlertCircle, Zap, RotateCcw, Loader2, SkipForward, Edit } from "lucide-react";
import { cn } from "@/lib/utils";
import React, { useState, useRef } from "react";

interface StageCardProps {
  stage: Stage;
  stageState: StageState;
  isCurrentStage: boolean; // Is this the stage the user is actively working on?
  onRunStage: (stageId: string, userInput?: any) => void;
  onInputChange: (stageId: string, fieldName: string, value: any) => void;
  // onFormSubmit from WizardShell, used to update stageState.userInput
  onFormSubmit: (stageId: string, data: any) => void; 
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
  onFormSubmit, // This is WizardShell's handleFormSubmit
  onSkipStage,
  onEditInput,
  allStageStates,
}: StageCardProps) {
  
  const [isEditing, setIsEditing] = useState(stageState.status !== 'completed' && stage.inputType !== 'none');
  const formRef = useRef<HTMLFormElement>(null);

  // Called by StageInputArea's form submission (for form inputType)
  // Or by the main "Run AI" button if it needs to trigger form submission.
  const handleSaveAndRunForm = (formData: any) => {
    onFormSubmit(stage.id, formData); // Update parent state (WizardShell) with new userInput
    onRunStage(stage.id, formData);   // Run AI with the new formData
    setIsEditing(false);
  };

  const handlePrimaryAction = () => {
    if (stage.inputType === 'form' && formRef.current && isEditing) {
      // Programmatically submit the form inside StageInputArea.
      // Its onSubmit handler will call handleSaveAndRunForm.
      formRef.current.requestSubmit(); 
    } else if (stage.inputType !== 'form') { // For non-form types like textarea or context (if they have a run button) or "none"
      onRunStage(stage.id, stageState.userInput);
      setIsEditing(false); // For "none" type, or if textarea/context input is considered "submitted"
    }
    // setIsEditing(false) is handled by handleSaveAndRunForm for forms,
    // or directly above for non-forms.
  };

  const handleEdit = () => {
    setIsEditing(true);
    onEditInput(stage.id); // This typically resets stage status to 'idle' in WizardShell
  };
  
  const canRunOrSave = stageState.status === "idle" || stageState.status === "error" || (stageState.status === "completed" && stage.inputType !== 'none' && isEditing);
  // The main button visibility logic
  // Show if:
  // 1. Input type is 'none' (AI only, button says "Run AI")
  // 2. Input type is form and isEditing (button submits form, says "Run AI" or "Save & Continue")
  // 3. Input type is textarea/context and isEditing (button runs with current input)
  const showPrimaryActionButton = stage.inputType === 'none' || isEditing;
  
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
        {/* Show input area if stage is not 'none' type AND (isEditing OR inputType is 'none' but it's the initial state for autoRun) */}
        {/* Simplified: Show if isEditing is true (for manual input types) OR if inputType is 'none' (no input area, but might show message) */}
        {(isEditing || stage.inputType === 'none') && stageState.status !== 'running' && (
          <div>
            {stage.inputType !== 'none' && <h4 className="text-sm font-medium mb-2 text-muted-foreground">Input:</h4>}
            <StageInputArea
              ref={stage.inputType === 'form' ? formRef : null} // Only pass ref for forms
              stage={stage}
              stageState={stageState}
              onInputChange={onInputChange}
              // For forms, StageInputArea's submit button calls this, which is handleSaveAndRunForm.
              // For other types, this prop might not be used by StageInputArea's internal buttons.
              onFormSubmit={handleSaveAndRunForm} 
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
        {/* Primary Action Button (Run AI / Save & Continue / Submit Form) */}
        {showPrimaryActionButton && (
          <Button 
            size="sm" 
            onClick={handlePrimaryAction} 
            disabled={stageState.status === "running" || stageState.depsAreMet === false || !canRunOrSave}
            className="bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            {stageState.status === "running" ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Zap className="mr-2 h-4 w-4" />
            )}
            {/* Adjust button text based on context */}
            {stage.promptTemplate ? "Run AI" : (stage.inputType === 'form' ? "Save & Process Form" : "Save & Continue")}
          </Button>
        )}
        {showAiRedoButton && (
           <Button variant="outline" size="sm" onClick={() => { 
             if (stage.inputType === 'form') {
               // For forms, "Redo" implies re-running AI with existing (saved) form input.
               // We don't need to set isEditing to true unless we want to allow input changes before redo.
               // For simplicity, AI Redo uses current saved input.
             } else {
               // For non-forms, if input can be "edited" before redo, set isEditing.
               // However, "AI Redo" usually means re-run with same input.
               // setIsEditing(true); // Uncomment if direct edit before redo is desired for non-forms
             }
             onRunStage(stage.id, stageState.userInput); 
            }}>
            <RotateCcw className="mr-2 h-4 w-4" /> AI Redo
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

