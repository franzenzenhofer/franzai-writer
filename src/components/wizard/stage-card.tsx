
"use client";

import type { Stage, StageState } from "@/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StageInputArea, type StageInputAreaRef } from "./stage-input-area";
import { StageOutputArea } from "./stage-output-area";
import { CheckCircle2, AlertCircle, Zap, RotateCcw, Loader2, SkipForward, Edit, Save, Check, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import React, { useState, useRef, useEffect } from "react";

interface StageCardProps {
  stage: Stage;
  stageState: StageState;
  isCurrentStage: boolean;
  onRunStage: (stageId: string, userInput?: any) => void;
  onInputChange: (stageId: string, fieldName: string, value: any) => void;
  onFormSubmit: (stageId: string, data: any) => void; 
  onSkipStage?: (stageId: string) => void;
  onEditInputRequest: (stageId: string) => void; // Renamed from onEditInput
  onOutputEdit: (stageId: string, newOutput: any) => void;
  onSetEditingOutput: (stageId: string, isEditing: boolean) => void;
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
  onEditInputRequest,
  onOutputEdit,
  onSetEditingOutput,
  allStageStates,
}: StageCardProps) {
  
  const [isEditingInput, setIsEditingInput] = useState(
    (stageState.status !== 'completed' && stageState.status !== 'skipped') && stage.inputType !== 'none'
  );
  const stageInputAreaRef = useRef<StageInputAreaRef>(null);

  useEffect(() => {
    // Sync isEditingInput with stageState status, e.g., if reset externally
    const shouldBeEditing = (stageState.status !== 'completed' && stageState.status !== 'skipped') && stage.inputType !== 'none';
    if (isEditingInput !== shouldBeEditing) {
      setIsEditingInput(shouldBeEditing);
    }
  }, [stageState.status, stage.inputType, isEditingInput]);


  const handlePrimaryAction = () => {
    if (stage.inputType === 'form' && isEditingInput && stageInputAreaRef.current) {
      // For forms being edited, the StageInputArea's internal "Save Input" button should be used first.
      // Then, this primary action button on StageCard will "Run AI" or "Process".
      // We assume form data is up-to-date in stageState.userInput via onFormSubmit.
      onRunStage(stage.id, stageState.userInput);
    } else if (stage.inputType !== 'form' && isEditingInput) { // For textarea/context being edited
      onRunStage(stage.id, stageState.userInput);
    } else if (stage.inputType === 'none' || stageState.status === 'completed' || stageState.status === 'error') {
       // For 'none' type, or if re-running a completed/errored stage
      onRunStage(stage.id, stageState.userInput);
    }
    setIsEditingInput(false); // Typically, after running, input editing is done.
    onSetEditingOutput(stage.id, false); // Ensure output editing is also off.
  };

  const handleEditInputClick = () => {
    setIsEditingInput(true);
    onEditInputRequest(stage.id); // This typically resets stage status to 'idle' or similar in WizardShell
    onSetEditingOutput(stage.id, false); // Turn off output editing if input is being edited
  };

  const handleEditOutputClick = () => {
    onSetEditingOutput(stage.id, true);
  };

  const handleSaveOutputEdits = () => {
    // The actual saving of output is handled by onOutputEdit via StageOutputArea's onChange.
    // This button just confirms and exits editing mode.
    onSetEditingOutput(stage.id, false);
  };
  
  const handleAcceptAndContinue = () => {
    onSetEditingOutput(stage.id, false); // Ensure edits are 'committed' by exiting edit mode
    // Logic to scroll to next stage or highlight can be added in WizardShell if needed
    console.log(`Stage ${stage.id} output accepted.`);
  };

  const canRun = stageState.depsAreMet !== false && (stageState.status === "idle" || stageState.status === "error" || (stageState.status === "completed" && stage.promptTemplate != null));
  
  const showPrimaryActionButton = 
    (isEditingInput && stage.inputType !== 'none') || 
    (stage.inputType === 'none' && (stageState.status === 'idle' || stageState.status === 'error')) ||
    (stageState.status === 'completed' && stage.promptTemplate && !stageState.isEditingOutput); // AI Redo case via primary button

  const showInputRelatedButtons = stageState.status === 'completed' && stage.inputType !== 'none' && !isEditingInput && !stageState.isEditingOutput;
  const showOutputRelatedButtons = stageState.status === 'completed' && stageState.output !== undefined && !isEditingInput;


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
          </CardTitle>
          <CardDescription>{stage.description}</CardDescription>
          {stage.isOptional && <Badge variant="outline" className="mt-1 text-xs">Optional</Badge>}
        </div>
        {stageState.depsAreMet === false && stageState.status === 'idle' && (
          <Badge variant="secondary">Waiting for dependencies</Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {isEditingInput && stage.inputType !== 'none' && stageState.status !== 'running' && (
          <div>
            <h4 className="text-sm font-medium mb-2 text-muted-foreground">Input:</h4>
            <StageInputArea
              ref={stageInputAreaRef}
              stage={stage}
              stageState={stageState}
              onInputChange={onInputChange}
              onFormSubmit={onFormSubmit} 
              allStageStates={allStageStates}
            />
          </div>
        )}

        {stage.inputType === 'none' && stageState.status === 'idle' && (
             <p className="text-sm text-muted-foreground">This stage is processed by AI. Click "Run AI" to generate content.</p>
        )}

        {(stageState.status === "completed" || stageState.status === 'error' || stageState.status === 'running') && stageState.output !== undefined && (
           <div>
            <h4 className="text-sm font-medium mb-2 text-muted-foreground">Output:</h4>
            <StageOutputArea 
                stage={stage} 
                stageState={stageState} 
                isEditingOutput={!!stageState.isEditingOutput}
                onOutputChange={(newOutput) => onOutputEdit(stage.id, newOutput)}
                onSaveEdits={handleSaveOutputEdits}
            />
          </div>
        )}
        
        {stageState.status === "error" && stageState.error && !stageState.output && (
          <p className="text-destructive text-sm">{stageState.error}</p>
        )}
      </CardContent>
      <CardFooter className="flex justify-end gap-2 items-center flex-wrap">
        {stage.isOptional && stageState.status === "idle" && onSkipStage && (
          <Button variant="ghost" size="sm" onClick={() => onSkipStage(stage.id)}>
            <SkipForward className="mr-2 h-4 w-4" /> Skip Stage
          </Button>
        )}

        {/* Input-related buttons */}
        {showInputRelatedButtons && (
          <Button variant="outline" size="sm" onClick={handleEditInputClick}>
            <Edit className="mr-2 h-4 w-4" /> Edit Input
          </Button>
        )}

        {/* Output-related buttons - shown when output exists and not editing input */}
        {showOutputRelatedButtons && !stageState.isEditingOutput && (
          <>
            {stage.promptTemplate && ( /* AI Redo only if it's an AI stage */
              <Button variant="outline" size="sm" onClick={() => onRunStage(stage.id, stageState.userInput)}>
                <RotateCcw className="mr-2 h-4 w-4" /> AI Redo
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={handleEditOutputClick}>
              <Edit className="mr-2 h-4 w-4" /> Edit Output
            </Button>
            <Button variant="default" size="sm" onClick={handleAcceptAndContinue}>
              <Check className="mr-2 h-4 w-4" /> Accept &amp; Continue
            </Button>
          </>
        )}
        {showOutputRelatedButtons && stageState.isEditingOutput && (
             <Button variant="default" size="sm" onClick={handleSaveOutputEdits}>
                <Save className="mr-2 h-4 w-4" /> Save Output Edits
            </Button>
        )}
        
        {/* Primary Action Button (Run AI / Process Stage) */}
        {showPrimaryActionButton && !stageState.isEditingOutput && (
          <Button 
            size="sm" 
            onClick={handlePrimaryAction} 
            disabled={!canRun || stageState.status === "running"}
            className="bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            {stageState.status === "running" ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Zap className="mr-2 h-4 w-4" />
            )}
            {stage.promptTemplate ? "Run AI" : "Process Stage"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
