
"use client";

import type { Stage, StageState, Workflow } from "@/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button"; // Keep for the primary action button
import { Badge } from "@/components/ui/badge"; // Keep for non-dismissible badges
import { StageInputArea, type StageInputAreaRef } from "./stage-input-area";
import { StageOutputArea } from "./stage-output-area";
import { CheckCircle2, AlertCircle, Zap, RotateCcw, Loader2, SkipForward, Edit, Save, Check, Clock, X, Send } from "lucide-react"; // X is for DismissibleWarningBadge, others for StageActionButton or status
import { cn } from "@/lib/utils";
import React, { useState, useRef, useEffect } from "react";
import { DismissibleWarningBadge } from "./dismissible-warning-badge";
import { StageActionButton } from "./StageActionButton";

interface StageCardProps {
  stage: Stage;
  workflow: Workflow; // Added to get stage titles for dependency messages
  stageState: StageState;
  isCurrentStage: boolean;
  onRunStage: (stageId: string, userInput?: any) => void;
  onInputChange: (stageId: string, fieldName: string, value: any) => void; // Still needed for non-form simple inputs
  onFormSubmit: (stageId: string, data: any) => void; // Will be called by StageCard before onRunStage for forms
  onSkipStage?: (stageId: string) => void;
  onEditInputRequest: (stageId: string) => void;
  onOutputEdit: (stageId: string, newOutput: any) => void;
  onSetEditingOutput: (stageId: string, isEditing: boolean) => void;
  onDismissStaleWarning: (stageId: string) => void; // New handler for dismissing stale warning
  allStageStates: Record<string, StageState>;
}

export function StageCard({
  stage,
  workflow,
  stageState,
  isCurrentStage,
  onRunStage,
  onInputChange,
  onFormSubmit,
  onSkipStage,
  onEditInputRequest,
  onOutputEdit,
  onSetEditingOutput,
  onDismissStaleWarning,
  allStageStates,
}: StageCardProps) {
  
  const [isEditingInput, setIsEditingInput] = useState(
    (stageState.status !== 'completed' && stageState.status !== 'skipped') && stage.inputType !== 'none'
  );
  const stageInputAreaRef = useRef<StageInputAreaRef>(null);

  useEffect(() => {
    const shouldBeEditing = (stageState.status !== 'completed' && stageState.status !== 'skipped') && stage.inputType !== 'none';
    if (isEditingInput !== shouldBeEditing) {
      setIsEditingInput(shouldBeEditing);
    }
  }, [stageState.status, stage.inputType, isEditingInput]);


  const handlePrimaryAction = () => {
    if (stage.inputType === 'form' && stageInputAreaRef.current) {
      // Trigger form submission within StageInputArea, which will call onFormSubmit,
      // which in turn updates stageState.userInput. Then proceed to run the stage.
      stageInputAreaRef.current.triggerSubmit(); 
      // Use setTimeout to ensure state updates have propagated
      setTimeout(() => {
        onRunStage(stage.id);
      }, 100);
    } else {
      onRunStage(stage.id, stageState.userInput);
    }
    setIsEditingInput(false); 
    onSetEditingOutput(stage.id, false);
  };

  const handleEditInputClick = () => {
    setIsEditingInput(true);
    onEditInputRequest(stage.id); 
    onSetEditingOutput(stage.id, false);
  };

  const handleEditOutputClick = () => {
    onSetEditingOutput(stage.id, true);
  };

  const handleSaveOutputEdits = () => {
    onSetEditingOutput(stage.id, false);
  };
  
  const handleAcceptAndContinue = () => {
    onSetEditingOutput(stage.id, false); 
    console.log(`Stage ${stage.id} output accepted.`);
  };

  const canRun = stageState.depsAreMet !== false && (stageState.status === "idle" || stageState.status === "error" || (stageState.status === "completed" && stage.promptTemplate != null));
  
  const showPrimaryActionButton = 
    (isEditingInput && stage.inputType !== 'none') || 
    (stage.inputType === 'none' && (stageState.status === 'idle' || stageState.status === 'error')) ||
    (stageState.status === 'completed' && stage.promptTemplate && !stageState.isEditingOutput);

  const showInputRelatedButtons = stageState.status === 'completed' && stage.inputType !== 'none' && !isEditingInput && !stageState.isEditingOutput;
  const showOutputRelatedButtons = stageState.status === 'completed' && stageState.output !== undefined && !isEditingInput;


  let statusIcon = null;
  let cardClasses = "mb-6 transition-all duration-300";

  switch (stageState.status) {
    case "completed":
      statusIcon = <CheckCircle2 className="text-green-500" />;
      cardClasses = cn(cardClasses, "border-green-500");
      break;
    case "running":
      statusIcon = <Loader2 className="animate-spin text-primary" />;
      cardClasses = cn(cardClasses, "border-primary");
      break;
    case "error":
      statusIcon = <AlertCircle className="text-destructive" />;
      cardClasses = cn(cardClasses, "border-destructive");
      break;
    case "skipped":
      statusIcon = <SkipForward className="text-muted-foreground" />;
      cardClasses = cn(cardClasses, "border-muted");
      break;
    default: // idle
      if (stageState.depsAreMet === false) {
        cardClasses = cn(cardClasses, "opacity-70 bg-muted/30");
      } else if (isCurrentStage) {
        cardClasses = cn(cardClasses, "border-accent shadow-lg");
      } else {
        cardClasses = cn(cardClasses, "border-border");
      }
  }
  if (isCurrentStage && stageState.depsAreMet !== false) cardClasses = cn(cardClasses, "shadow-accent/30 shadow-xl ring-2 ring-accent");


  const getDependencyMessage = () => {
    if (stageState.depsAreMet === false && stage.dependencies && stage.dependencies.length > 0) {
      const incompleteDeps = stage.dependencies
        .filter(depId => allStageStates[depId]?.status !== 'completed' && allStageStates[depId]?.status !== 'skipped')
        .map(depId => workflow.stages.find(s => s.id === depId)?.title || depId);
      
      if (incompleteDeps.length > 0) {
        return `Waiting for: ${incompleteDeps.join(', ')}`;
      }
    }
    return null;
  };
  const dependencyMessage = getDependencyMessage();

  return (
    <Card 
      id={`stage-${stage.id}`} 
      data-testid={`stage-card-${stage.id}`}
      className={cardClasses}
    >
      {dependencyMessage && (
        <div className="px-6 pt-4 pb-2 text-center">
          <Badge variant="secondary" className="text-sm whitespace-normal">
            <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
            {dependencyMessage}
          </Badge>
        </div>
      )}
      <CardHeader className="flex flex-row justify-between items-start pb-4 pt-2">
        <div>
          <CardTitle className="font-headline text-xl flex items-center">
            {statusIcon && !dependencyMessage && <span className="mr-2">{statusIcon}</span>}
            {stage.title}
            {stageState.isStale && stageState.status === 'completed' && !stageState.staleDismissed && (
              <DismissibleWarningBadge
                onDismiss={() => onDismissStaleWarning(stage.id)}
                className="ml-2"
              >
                Update recommended
              </DismissibleWarningBadge>
            )}
          </CardTitle>
          <CardDescription>{stage.description}</CardDescription>
          {stage.isOptional && <Badge variant="outline" className="mt-1 text-xs">Optional</Badge>}
        </div>
        {/* Removed the old dependency badge from here */}
      </CardHeader>
      <CardContent className="space-y-4">
        {isEditingInput && stage.inputType !== 'none' && stageState.status !== 'running' && (
          <div>
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

        {stage.inputType === 'none' && stageState.status === 'idle' && !dependencyMessage && (
             <p className="text-sm text-muted-foreground">This stage is processed by AI. Click &quot;Run AI&quot; to generate content.</p>
        )}

        {stageState.status === "running" && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium mb-2 text-muted-foreground">Generating...</h4>
            <div className="bg-muted/30 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">AI is processing your request...</span>
              </div>
              <div className="space-y-2">
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary/50 rounded-full animate-pulse" style={{ width: '60%' }} />
                </div>
                <p className="text-xs text-muted-foreground">This may take a few moments</p>
              </div>
            </div>
          </div>
        )}
        
        {(stageState.status === "completed" || stageState.status === 'error') && stageState.output !== undefined && (
           <div>
            <StageOutputArea 
                stage={stage} 
                stageState={stageState} 
                isEditingOutput={!!stageState.isEditingOutput}
                onOutputChange={(newOutput) => onOutputEdit(stage.id, newOutput)}
            />
          </div>
        )}
        
        {stageState.status === "error" && stageState.error && !stageState.output && (
          <p className="text-destructive text-sm">{stageState.error}</p>
        )}
      </CardContent>
      <CardFooter className="flex justify-end gap-2 items-center flex-wrap">
        {stage.isOptional && stageState.status === "idle" && onSkipStage && !dependencyMessage && (
          <StageActionButton
            variant="ghost"
            onClick={() => onSkipStage(stage.id)}
            id={`skip-stage-${stage.id}`}
            datatestid={`skip-stage-${stage.id}`}
            icon={SkipForward}
          >
            Skip Stage
          </StageActionButton>
        )}

        {/* For AI stages, show Edit Input button */}
        {stage.promptTemplate && showInputRelatedButtons && !dependencyMessage && (
          <StageActionButton
            variant="outline"
            onClick={handleEditInputClick}
            id={`edit-input-${stage.id}`}
            datatestid={`edit-input-${stage.id}`}
            icon={Edit}
          >
            Edit Input
          </StageActionButton>
        )}

        {/* For non-AI stages, show only one Edit button after completion */}
        {!stage.promptTemplate && stageState.status === 'completed' && !isEditingInput && !stageState.isEditingOutput && !dependencyMessage && (
          <StageActionButton
            variant="outline"
            onClick={handleEditInputClick}
            id={`edit-${stage.id}`}
            datatestid={`edit-${stage.id}`}
            icon={Edit}
          >
            Edit
          </StageActionButton>
        )}

        {/* For AI stages, show output-related buttons */}
        {stage.promptTemplate && showOutputRelatedButtons && !stageState.isEditingOutput && !dependencyMessage && (
          <>
            <StageActionButton
              variant="outline"
              onClick={() => onRunStage(stage.id, stageState.userInput)}
              id={`ai-redo-${stage.id}`}
              datatestid={`ai-redo-${stage.id}`}
              icon={RotateCcw}
            >
              AI Redo
            </StageActionButton>
            <StageActionButton
              variant="outline"
              onClick={handleEditOutputClick}
              id={`edit-output-${stage.id}`}
              datatestid={`edit-output-${stage.id}`}
              icon={Edit}
            >
              Edit Output
            </StageActionButton>
            <StageActionButton
              variant="default"
              onClick={handleAcceptAndContinue}
              id={`accept-continue-${stage.id}`}
              datatestid={`accept-continue-${stage.id}`}
              icon={Check}
            >
              Accept &amp; Continue
            </StageActionButton>
          </>
        )}
        {showOutputRelatedButtons && stageState.isEditingOutput && !dependencyMessage && (
          <StageActionButton
            variant="default"
            onClick={handleSaveOutputEdits}
            id={`save-output-${stage.id}`}
            datatestid={`save-output-${stage.id}`}
            icon={Save}
          >
            Save Output Edits
          </StageActionButton>
        )}
        
        {/* Primary Action Button: Kept as direct Button due to complex icon/text logic and custom styling */}
        {showPrimaryActionButton && !stageState.isEditingOutput && !dependencyMessage && (
          <Button 
            size="sm" 
            onClick={handlePrimaryAction} 
            disabled={!canRun || stageState.status === "running"}
            className="bg-accent hover:bg-accent/90 text-accent-foreground" // Unique styling
            id={`process-stage-${stage.id}`}
            data-testid={`process-stage-${stage.id}`}
          >
            {stageState.status === "running" ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              stage.chatEnabled ? <Send className="mr-2 h-4 w-4" /> : <Zap className="mr-2 h-4 w-4" />
            )}
            {stageState.status === "running" ? "Processing..." : (stage.chatEnabled ? "Send" : (stage.promptTemplate ? "Run AI" : "Continue"))}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
