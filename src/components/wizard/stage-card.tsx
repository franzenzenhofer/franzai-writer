"use client";

import type { Stage, StageState, Workflow, ExportStageState } from "@/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button"; // Keep for the primary action button
import { Badge } from "@/components/ui/badge"; // Keep for non-dismissible badges
import { StageInputArea, type StageInputAreaRef } from "./stage-input-area";
import { StageOutputArea } from "./stage-output-area";
import { CheckCircle2, AlertCircle, ArrowRight, RotateCcw, Loader2, Edit, Save, Check, Clock, X, Send, Copy, CheckCheck } from "lucide-react"; // X is for DismissibleWarningBadge, others for StageActionButton or status
import { cn } from "@/lib/utils";
import React, { useState, useRef, useEffect } from "react";
import { UpdateRecommendedButton } from "./update-recommended-button";
import { StageActionButton } from "./StageActionButton";
import { AiRedoSection } from "./ai-redo-section";
import { DynamicProgressBar } from "./dynamic-progress-bar";
import { ExportStageCard } from "./export-stage/export-stage-card";
import { StageInfoTrigger } from "./stage-info-overlay";
import { useToast } from "@/hooks/use-toast";
import { KeyboardHint } from "@/components/ui/keyboard-hint";

interface StageCardProps {
  stage: Stage;
  workflow: Workflow; // Added to get stage titles for dependency messages
  stageState: StageState;
  isCurrentStage: boolean;
  onRunStage: (stageId: string, userInput?: any, aiRedoNotes?: string) => void;
  onInputChange: (stageId: string, fieldName: string, value: any) => void; // Still needed for non-form simple inputs
  onFormSubmit: (stageId: string, data: any) => void; // Will be called by StageCard before onRunStage for forms

  onEditInputRequest: (stageId: string) => void;
  onOutputEdit: (stageId: string, newOutput: any) => void;
  onSetEditingOutput: (stageId: string, isEditing: boolean) => void;
  onDismissStaleWarning: (stageId: string) => void; // New handler for dismissing stale warning
  allStageStates: Record<string, StageState>;
  documentId?: string;
  onUpdateStageState?: (stageId: string, updates: Partial<ExportStageState>) => void;
}

// Enhanced error display component with copy functionality
function StageErrorDisplay({ error, stageTitle }: { error: string; stageTitle: string }) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopyError = async () => {
    try {
      // Create a more meaningful error message for copying
      const errorReport = `AI Stage Error Report
Stage: ${stageTitle}
Timestamp: ${new Date().toLocaleString()}
Error: ${error}

Technical Details:
- This error occurred during AI processing
- Check browser console for additional details
- Consider refreshing the page if the error persists`;

      await navigator.clipboard.writeText(errorReport);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      
      // Silent copy - visual feedback (checkmark) is enough
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Unable to copy error details",
        variant: "destructive",
      });
    }
  };

  // Make error message more user-friendly
  const getUserFriendlyError = (error: string): { message: string; isTemplate: boolean } => {
    if (error.includes('Template substitution incomplete') || error.includes('Template variables not found')) {
      return {
        message: "Template variable error: Required data from previous stages is missing or invalid. This usually means a dependency stage didn't complete properly.",
        isTemplate: true
      };
    }
    if (error.includes('AI service not configured')) {
      return {
        message: "AI service configuration error: The AI system is not properly configured. Please check your API keys.",
        isTemplate: false
      };
    }
    if (error.includes('AI not ready') || error.includes('AI system')) {
      return {
        message: "AI system not ready: The AI service is still loading or encountered an initialization error. Try refreshing the page.",
        isTemplate: false
      };
    }
    if (error.includes('Network') || error.includes('fetch')) {
      return {
        message: "Network error: Unable to connect to the AI service. Check your internet connection and try again.",
        isTemplate: false
      };
    }
    return {
      message: error,
      isTemplate: false
    };
  };

  const { message, isTemplate } = getUserFriendlyError(error);

  return (
    <div className="border border-destructive/50 rounded-lg p-4 bg-destructive/5 space-y-3">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <p className="text-destructive font-medium text-sm">AI Stage Error</p>
          <p className="text-destructive text-sm leading-relaxed">{message}</p>
          {isTemplate && (
            <p className="text-muted-foreground text-xs">
              💡 Tip: Try running previous stages again or check that all required form fields were completed.
            </p>
          )}
        </div>
        <Button
          size="icon"
          variant="ghost"
          onClick={handleCopyError}
          title="Copy error details"
        >
          {copied ? <CheckCheck className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}

export function StageCard({
  stage,
  workflow,
  stageState,
  isCurrentStage,
  onRunStage,
  onInputChange,
  onFormSubmit,

  onEditInputRequest,
  onOutputEdit,
  onSetEditingOutput,
  onDismissStaleWarning,
  allStageStates,
  documentId,
  onUpdateStageState,
}: StageCardProps) {
  
  const [isEditingInput, setIsEditingInput] = useState(
    stageState.status !== 'completed' && stage.inputType !== 'none'
  );
  const stageInputAreaRef = useRef<StageInputAreaRef>(null);

  useEffect(() => {
    const shouldBeEditing = stageState.status !== 'completed' && stage.inputType !== 'none';
    if (isEditingInput !== shouldBeEditing) {
      setIsEditingInput(shouldBeEditing);
    }
  }, [stageState.status, stage.inputType, isEditingInput]);


  const handlePrimaryAction = () => {
    if (stage.inputType === 'form' && stageInputAreaRef.current) {
      // Trigger form submission within StageInputArea, which will call onFormSubmit,
      // which in turn updates stageState.userInput. Then proceed to run the stage.
      stageInputAreaRef.current.triggerSubmit(); 
      // Don't run the stage here - let the form submission complete and update state first
      setIsEditingInput(false); 
      onSetEditingOutput(stage.id, false);
      // The dependent stages with autoRun will be triggered by the useEffect in wizard-shell
      // once the state is properly updated
    } else {
      onRunStage(stage.id, stageState.userInput);
      setIsEditingInput(false); 
      onSetEditingOutput(stage.id, false);
    }
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

  const handleAiRedo = (notes?: string) => {
    onRunStage(stage.id, stageState.userInput, notes);
  };

  const getDependencyMessage = () => {
    if (stageState.depsAreMet === false && stage.activationDependencies && stage.activationDependencies.length > 0) {
      const incompleteDeps = stage.activationDependencies
        .filter(depId => allStageStates[depId]?.status !== 'completed')
        .map(depId => workflow.stages.find(s => s.id === depId)?.title || depId);
      
      if (incompleteDeps.length > 0) {
        return `Waiting for: ${incompleteDeps.join(', ')}`;
      }
    }
    return null;
  };
  const dependencyMessage = getDependencyMessage();

  const isAiStage = !!(stage.promptTemplate || stage.promptFile);
  const canRun = stageState.depsAreMet !== false && (stageState.status === "idle" || stageState.status === "error" || (stageState.status === "completed" && isAiStage));
  
  // Button display logic based on stage type
  const isAutoRunAiStage = isAiStage && stage.autoRun && stage.inputType === 'none';
  const isManualAiStage = isAiStage && (!stage.autoRun || stage.inputType !== 'none');
  const isNonAiStage = !isAiStage;
  
  // Primary Action Button (Run AI / Continue): For manual stages and active autorun stages
  const showPrimaryActionButton = 
    (isEditingInput && stage.inputType !== 'none') || 
    (isManualAiStage && (stageState.status === 'idle' || stageState.status === 'error')) ||
    (isAutoRunAiStage && stageState.depsAreMet && (stageState.status === 'idle' || stageState.status === 'error'));

  // Determine if Edit button should be enabled based on configuration or sensible defaults
  const getEditEnabled = () => {
    if (stage.editEnabled !== undefined) return stage.editEnabled;
    // Sensible defaults:
    // - AI stages: can edit output (true)
    // - Non-AI stages with input: can edit input (true)  
    // - Stages with no input/output: no edit needed (false)
    if (isAiStage) return true; // AI stages default to editable
    if (stage.inputType !== 'none') return true; // Input stages default to editable
    return false; // No input/output stages default to non-editable
  };
  
  const editEnabled = getEditEnabled();
  
  // Edit Button: For stages with inputs after completion OR AI stages with output
  const showEditButton = editEnabled && stageState.status === 'completed' && !isEditingInput && !stageState.isEditingOutput && (
    (stage.inputType !== 'none') || // Has input to edit
    (isAiStage && stageState.output !== undefined) // AI stage with output to edit
  );
  
  // Accept Continue: Only for manual AI stages that need user confirmation
  const showAcceptContinueButton = stageState.status === 'completed' && stageState.output !== undefined && !isEditingInput && isManualAiStage;

  // Determine which action is "primary" for CMD+Enter
  const getPrimaryAction = () => {
    if (isEditingInput && stage.inputType !== 'none') return 'submit-form';
    if (stageState.isEditingOutput) return 'save-edits';
    if (showPrimaryActionButton) return 'run-stage';
    return null;
  };

  const primaryAction = getPrimaryAction();
  const showKeyboardHint = primaryAction !== null;

  let statusIcon = null;
  let cardClasses = "mb-4 transition-all duration-200"; // Reduced margin, faster transitions

  switch (stageState.status) {
    case "completed":
      statusIcon = <CheckCircle2 className="text-primary h-5 w-5" />;
      cardClasses = cn(cardClasses, "border-border");
      break;
    case "running":
      statusIcon = <Loader2 className="animate-spin text-primary h-5 w-5" />;
      cardClasses = cn(cardClasses, "border-primary");
      break;
    case "error":
      statusIcon = <AlertCircle className="text-destructive h-5 w-5" />;
      cardClasses = cn(cardClasses, "border-destructive");
      break;

    default: // idle
      if (stageState.depsAreMet === false) {
        cardClasses = cn(cardClasses, "opacity-60");
      } else if (isCurrentStage) {
        cardClasses = cn(cardClasses, "border-primary");
      } else {
        cardClasses = cn(cardClasses, "border-border");
      }
  }
  if (isCurrentStage && stageState.depsAreMet !== false) cardClasses = cn(cardClasses, "shadow-sm");

  // Handle export stage type separately
  if (stage.stageType === 'export') {
    return (
      <ExportStageCard
        stage={stage}
        workflow={workflow}
        stageState={stageState as ExportStageState}
        isCurrentStage={isCurrentStage}
        onRunStage={onRunStage}
        allStageStates={allStageStates}
        onDismissStaleWarning={onDismissStaleWarning}
        onUpdateStageState={onUpdateStageState}
        documentId={documentId}
      />
    );
  }

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
      <CardHeader className="flex flex-row justify-between items-start">
        <div className="flex-1 min-w-0">
          <CardTitle className="font-headline text-xl flex items-center">
            {statusIcon && !dependencyMessage && <span className="mr-2">{statusIcon}</span>}
            {stage.title}
            {stage.isOptional && <Badge variant="outline" className="ml-2 text-xs">Optional</Badge>}
          </CardTitle>
          <CardDescription>{stage.description}</CardDescription>
        </div>
        <div className="flex-shrink-0 ml-2 flex items-center gap-2">
          {stageState.isStale && stageState.status === 'completed' && !stageState.staleDismissed && (
            <UpdateRecommendedButton
              onRegenerate={() => handleAiRedo()}
              size="sm"
            />
          )}
          <StageInfoTrigger stage={stage} workflow={workflow} />
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {isEditingInput && stage.inputType !== 'none' && stageState.status !== 'running' && (
          <div>
            <StageInputArea
              ref={stageInputAreaRef}
              stage={stage}
              stageState={stageState}
              onInputChange={onInputChange}
              onFormSubmit={onFormSubmit} 
              allStageStates={allStageStates}
              onSubmit={handlePrimaryAction}
            />
          </div>
        )}

        {isAutoRunAiStage && stageState.status === 'idle' && !dependencyMessage && (
             <p className="text-sm text-muted-foreground">This stage runs automatically when dependencies are complete.</p>
        )}
        
        {isManualAiStage && stage.inputType === 'none' && stageState.status === 'idle' && !dependencyMessage && (
             <p className="text-sm text-muted-foreground">This stage is processed by AI. Click &quot;Run AI&quot; to generate content.</p>
        )}

        {stageState.status === "running" && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium mb-2 text-muted-foreground">Generating...</h4>
            <div className="bg-muted/30 rounded-lg p-4">
              <DynamicProgressBar isRunning={true} />
            </div>
          </div>
        )}
        
        {(stageState.status === "completed" || stageState.status === 'error') && stageState.output !== undefined && (
           <div>
            <StageOutputArea 
                stage={stage} 
                stageState={stageState} 
                workflow={workflow}
                isEditingOutput={!!stageState.isEditingOutput}
                onOutputChange={(newOutput) => onOutputEdit(stage.id, newOutput)}
            />
          </div>
        )}
        
        {stageState.status === "error" && stageState.error && (
          <StageErrorDisplay error={stageState.error} stageTitle={stage.title} />
        )}
      </CardContent>
      
      {/* AI REDO Section - positioned between content and footer */}
      {stage.aiRedoEnabled && stageState.status === 'completed' && stageState.output !== undefined && (
        <AiRedoSection
          stageId={stage.id}
          enabled={true}
          isRunning={false}
          onAiRedo={handleAiRedo}
          className="mx-5 mb-3"
        />
      )}
      
      <CardFooter className="flex justify-end gap-2 items-center flex-wrap">


        {/* Edit Button: Unified edit functionality - SECONDARY VARIANT (dark gray text) */}
        {showEditButton && !dependencyMessage && (
          <StageActionButton
            variant="secondary"
            onClick={isAiStage && stageState.output ? handleEditOutputClick : handleEditInputClick}
            id={`edit-${stage.id}`}
            datatestid={`edit-${stage.id}`}
            icon={Edit}
          >
            Edit
          </StageActionButton>
        )}

        {/* Accept Continue: Only for manual AI stages */}
        {showAcceptContinueButton && !stageState.isEditingOutput && !dependencyMessage && (
          <StageActionButton
            variant="default"
            onClick={handleAcceptAndContinue}
            id={`accept-continue-${stage.id}`}
            datatestid={`accept-continue-${stage.id}`}
            icon={Check}
          >
            Accept &amp; Continue
          </StageActionButton>
        )}
        
        {/* Save Edits: When editing */}
        {editEnabled && stageState.isEditingOutput && !dependencyMessage && (
          <StageActionButton
            variant="default"
            onClick={handleSaveOutputEdits}
            id={`save-edits-${stage.id}`}
            datatestid={`save-edits-${stage.id}`}
            icon={Save}
          >
            Save Edits
          </StageActionButton>
        )}
        
        {/* Primary Action Button: Kept as direct Button due to complex icon/text logic and custom styling */}
        {showPrimaryActionButton && !stageState.isEditingOutput && !dependencyMessage && (
          <>
            {showKeyboardHint && (
              <KeyboardHint className="text-xs text-muted-foreground" />
            )}
            <Button 
              size="sm" 
              variant="default"
              onClick={handlePrimaryAction} 
              disabled={!canRun || stageState.status === "running"}
              id={`process-stage-${stage.id}`}
              data-testid={`process-stage-${stage.id}`}
            >
              <ArrowRight className="mr-2 h-4 w-4" />
              {stageState.status === "running" ? "Processing..." : (isAiStage ? "Run AI" : "Continue")}
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
}
