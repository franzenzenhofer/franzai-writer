"use client";

import React, { useState, useEffect, useCallback } from 'react';
import type { WizardInstance, Stage, StageState } from '@/types';
import { StageCard } from './stage-card';
import { Button } from '@/components/ui/button';
import { runAiStage } from '@/app/actions/aiActions'; // Server action
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, Check, Info, Lightbulb } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";

interface WizardShellProps {
  initialInstance: WizardInstance;
}

export function WizardShell({ initialInstance }: WizardShellProps) {
  const [instance, setInstance] = useState<WizardInstance>(initialInstance);
  const { toast } = useToast();
  const [pageTitle, setPageTitle] = useState(initialInstance.document.title);

  const updateStageState = useCallback((stageId: string, updates: Partial<StageState>) => {
    setInstance(prevInstance => {
      const newStageStates = {
        ...prevInstance.stageStates,
        [stageId]: {
          ...prevInstance.stageStates[stageId],
          ...updates,
        },
      };
      return { ...prevInstance, stageStates: newStageStates };
    });
  }, []);

  const evaluateDependencies = useCallback(() => {
    const newStageStates = { ...instance.stageStates };
    let changed = false;

    instance.workflow.stages.forEach(stage => {
      const currentState = newStageStates[stage.id];
      let depsMet = true;
      if (stage.dependencies && stage.dependencies.length > 0) {
        depsMet = stage.dependencies.every(depId => 
          newStageStates[depId]?.status === 'completed' || newStageStates[depId]?.status === 'skipped'
        );
      }
      
      let isStale = false;
      if (currentState.status === 'completed' && stage.dependencies && stage.dependencies.length > 0) {
        const stageCompletedAt = currentState.completedAt ? new Date(currentState.completedAt).getTime() : 0;
        isStale = stage.dependencies.some(depId => {
          const depCompletedAt = newStageStates[depId]?.completedAt ? new Date(newStageStates[depId].completedAt).getTime() : 0;
          return depCompletedAt > stageCompletedAt;
        });
      }

      const shouldAutoRun = stage.autoRun && depsMet && currentState.status === 'idle';
      const shouldShowUpdateBadge = isStale; // Simplified logic

      if (
        currentState.depsAreMet !== depsMet ||
        currentState.isStale !== isStale ||
        currentState.shouldAutoRun !== shouldAutoRun ||
        currentState.shouldShowUpdateBadge !== shouldShowUpdateBadge
      ) {
        newStageStates[stage.id] = {
          ...currentState,
          depsAreMet: depsMet,
          isStale: isStale,
          shouldAutoRun: shouldAutoRun,
          shouldShowUpdateBadge: shouldShowUpdateBadge,
        };
        changed = true;
      }
    });

    if (changed) {
      setInstance(prev => ({ ...prev, stageStates: newStageStates }));
    }
  }, [instance.stageStates, instance.workflow.stages]);


  useEffect(() => {
    evaluateDependencies();
  }, [instance.stageStates, evaluateDependencies]);


  useEffect(() => {
    instance.workflow.stages.forEach(stage => {
      const stageState = instance.stageStates[stage.id];
      if (stageState.shouldAutoRun && stageState.status === 'idle') {
        handleRunStage(stage.id, stageState.userInput);
      }
    });
  }, [instance.stageStates, instance.workflow.stages]); // Re-run if stageStates or its shouldAutoRun flags change


  // Update document title if configured
  useEffect(() => {
    const titleStageId = instance.workflow.config?.setTitleFromStageOutput;
    if (titleStageId) {
      const titleStageState = instance.stageStates[titleStageId];
      if (titleStageState?.status === 'completed' && titleStageState.output) {
        // Assuming output is an object with a 'titles' array or a simple string
        let newTitle = "";
        if (typeof titleStageState.output === 'string') {
            newTitle = titleStageState.output;
        } else if (Array.isArray(titleStageState.output.titles) && titleStageState.output.titles.length > 0) {
            newTitle = titleStageState.output.titles[0]; // Take the first title
        } else if (titleStageState.output.title) {
             newTitle = titleStageState.output.title;
        }
        
        if (newTitle && newTitle.length > 0 && newTitle.length < 100) { // Basic validation
            setPageTitle(newTitle);
            document.title = `${newTitle} - WizardCraft AI`;
            // Persist this to the backend eventually
            // For now, update local instance document
            setInstance(prev => ({
                ...prev,
                document: { ...prev.document, title: newTitle }
            }));
        }
      }
    }
  }, [instance.stageStates, instance.workflow.config?.setTitleFromStageOutput]);


  const handleInputChange = (stageId: string, fieldName: string, value: any) => {
    // fieldName is 'userInput' for simple inputs, or specific field for forms
    if (fieldName === 'userInput') {
         updateStageState(stageId, { userInput: value, status: 'idle' }); // Reset status to idle if input changes
    } else {
        // This case is for form fields, handled by onFormSubmit
    }
    evaluateDependencies(); // Re-evaluate dependencies on input change
  };

  const handleFormSubmit = (stageId: string, data: any) => {
    updateStageState(stageId, { userInput: data, status: 'idle' });
    toast({ title: "Input Saved", description: `Input for stage "${instance.workflow.stages.find(s=>s.id===stageId)?.title}" has been saved.`});
    evaluateDependencies();
  };

  const handleRunStage = async (stageId: string, currentInput?: any) => {
    const stage = instance.workflow.stages.find(s => s.id === stageId);
    if (!stage) return;

    updateStageState(stageId, { status: "running", error: undefined });

    if (!stage.promptTemplate) { // Stage without AI call, e.g., manual input
      updateStageState(stageId, { 
        status: "completed", 
        output: stage.inputType === 'none' ? undefined : currentInput, // For 'none' input, output might be undefined or handled differently
        completedAt: new Date().toISOString() 
      });
      toast({ title: "Stage Completed", description: `Stage "${stage.title}" marked as complete.` });
      evaluateDependencies();
      return;
    }
    
    // Collect context variables
    const contextVars: Record<string, any> = {};
    instance.workflow.stages.forEach(s => {
        if (instance.stageStates[s.id]?.status === 'completed') {
            contextVars[s.id] = instance.stageStates[s.id]; // Pass full stage state
        }
    });
    // Add current stage's own input to context if needed by prompt.
    // Example: If prompt is "{{topic-definition.output}} and also current form input {{this.formInputName}}"
    // This needs more sophisticated templating. For now, pass userInput of current stage.
    if (currentInput) {
        contextVars[stage.id] = { ...instance.stageStates[stage.id], userInput: currentInput, output: currentInput }; // Make current input available
    }


    try {
      const result = await runAiStage({
        promptTemplate: stage.promptTemplate,
        model: stage.model || "gemini-2.0-flash", // Default model
        temperature: stage.temperature || 0.7, // Default temperature
        contextVars: contextVars,
        currentStageInput: currentInput, // Pass current stage's input separately
        stageOutputType: stage.outputType
      });

      if (result.error) {
        throw new Error(result.error);
      }
      
      updateStageState(stageId, {
        status: "completed",
        output: result.content,
        groundingInfo: result.groundingInfo, // If any
        completedAt: new Date().toISOString(),
      });
      toast({ title: "AI Stage Completed", description: `AI processing for "${stage.title}" finished.` });

    } catch (error: any) {
      console.error("Error running AI stage:", error);
      updateStageState(stageId, { status: "error", error: error.message || "AI processing failed." });
      toast({ title: "AI Stage Error", description: error.message || "An error occurred.", variant: "destructive" });
    }
    evaluateDependencies();
  };

  const handleSkipStage = (stageId: string) => {
    updateStageState(stageId, { status: "skipped", completedAt: new Date().toISOString() });
    toast({ title: "Stage Skipped", description: `Stage "${instance.workflow.stages.find(s=>s.id===stageId)?.title}" was skipped.` });
    evaluateDependencies();
  };
  
  const handleEditInput = (stageId: string) => {
    // Logic to allow editing input for a completed stage.
    // This might involve resetting its status or just allowing input modification.
    // For now, we'll reset the status to idle to allow re-running.
    // The StageCard component will set its internal `isEditing` state.
    updateStageState(stageId, { status: "idle" }); // Or a specific 'editing' status if needed
    toast({ title: "Editing Input", description: `You can now edit the input for stage "${instance.workflow.stages.find(s=>s.id===stageId)?.title}".` });
    evaluateDependencies();
  };
  
  const completedStagesCount = instance.workflow.stages.filter(
    stage => instance.stageStates[stage.id]?.status === 'completed' || instance.stageStates[stage.id]?.status === 'skipped'
  ).length;
  const totalStages = instance.workflow.stages.length;
  const progressPercentage = totalStages > 0 ? (completedStagesCount / totalStages) * 100 : 0;

  const isWizardCompleted = completedStagesCount === totalStages;


  // Determine current active stage for highlighting (simplistic: first non-completed/skipped)
  const currentStageId = instance.workflow.stages.find(
    s => instance.stageStates[s.id]?.status !== 'completed' && instance.stageStates[s.id]?.status !== 'skipped'
  )?.id || instance.workflow.stages[instance.workflow.stages.length - 1].id;


  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold font-headline mb-2">{pageTitle}</h1>
      <p className="text-muted-foreground mb-1">Workflow: {instance.workflow.name}</p>
      <div className="mb-6">
        <div className="flex justify-between text-sm text-muted-foreground mb-1">
            <span>Progress</span>
            <span>{completedStagesCount} / {totalStages} Stages</span>
        </div>
        <Progress value={progressPercentage} className="w-full h-3" />
      </div>

      {isWizardCompleted && (
        <Alert className="mb-6 border-green-500 bg-green-50 dark:bg-green-900/30">
          <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
          <AlertTitle className="text-green-700 dark:text-green-300 font-headline">Wizard Completed!</AlertTitle>
          <AlertDescription className="text-green-600 dark:text-green-500">
            All stages have been completed. You can review the outputs or edit any stage.
          </AlertDescription>
        </Alert>
      )}

      {!isWizardCompleted && instance.stageStates[currentStageId]?.depsAreMet === false && (
         <Alert variant="default" className="mb-6 bg-blue-50 border-blue-300 dark:bg-blue-900/30 dark:border-blue-700">
          <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <AlertTitle className="text-blue-700 dark:text-blue-300 font-headline">Next Steps</AlertTitle>
          <AlertDescription className="text-blue-600 dark:text-blue-500">
            Please complete the preceding stages to unlock this one. Dependencies are not yet met for '{instance.workflow.stages.find(s => s.id === currentStageId)?.title}'.
          </AlertDescription>
        </Alert>
      )}


      {instance.workflow.stages.map(stage => (
        <StageCard
          key={stage.id}
          stage={stage}
          stageState={instance.stageStates[stage.id] || { stageId: stage.id, status: 'idle' }}
          isCurrentStage={stage.id === currentStageId && !isWizardCompleted}
          onRunStage={handleRunStage}
          onInputChange={handleInputChange}
          onFormSubmit={handleFormSubmit}
          onSkipStage={stage.isOptional ? handleSkipStage : undefined}
          onEditInput={handleEditInput}
          allStageStates={instance.stageStates}
        />
      ))}

      <div className="mt-8 flex justify-end">
        <Button variant="default" size="lg" disabled={!isWizardCompleted}>
          Finalize Document (Placeholder)
        </Button>
      </div>
    </div>
  );
}
