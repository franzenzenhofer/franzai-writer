
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import type { WizardInstance, Stage, StageState } from '@/types';
import { StageCard } from './stage-card';
import { Button } from '@/components/ui/button';
import { runAiStage } from '@/app/actions/aiActions'; 
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, Check, Info, Lightbulb, DownloadCloud, FileWarning } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { FinalDocumentDialog } from './final-document-dialog';
import { siteConfig } from '@/config/site';

interface WizardShellProps {
  initialInstance: WizardInstance;
}

export function WizardShell({ initialInstance }: WizardShellProps) {
  const [instance, setInstance] = useState<WizardInstance>(initialInstance);
  const { toast } = useToast();
  const [pageTitle, setPageTitle] = useState(initialInstance.document.title);

  const [isFinalizeDialogOpen, setIsFinalizeDialogOpen] = useState(false);
  const [finalDocumentContent, setFinalDocumentContent] = useState("");
  const [hasFinalizedOnce, setHasFinalizedOnce] = useState(false);


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
          // If a dependency was completed *after* this stage, or if a dependency is itself stale, this stage is stale.
          return depCompletedAt > stageCompletedAt || newStageStates[depId]?.isStale === true;
        });
      }
       // If a stage itself was just edited (e.g. input changed or output edited), it might not be "stale" in terms of deps,
      // but its own content might need re-evaluation by subsequent stages.
      // For now, isStale primarily tracks dependency staleness.

      const shouldAutoRun = stage.autoRun && depsMet && currentState.status === 'idle' && !currentState.isEditingOutput;

      if (
        currentState.depsAreMet !== depsMet ||
        currentState.isStale !== isStale ||
        currentState.shouldAutoRun !== shouldAutoRun
      ) {
        newStageStates[stage.id] = {
          ...currentState,
          depsAreMet: depsMet,
          isStale: isStale,
          shouldAutoRun: shouldAutoRun,
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
      if (stageState.shouldAutoRun && stageState.status === 'idle' && stageState.depsAreMet && !stageState.isEditingOutput) {
        handleRunStage(stage.id, stageState.userInput);
      }
    });
  }, [instance.stageStates]); 


  useEffect(() => {
    const titleStageId = instance.workflow.config?.setTitleFromStageOutput;
    if (titleStageId) {
      const titleStageState = instance.stageStates[titleStageId];
      if (titleStageState?.status === 'completed' && titleStageState.output) {
        let newTitle = "";
        if (typeof titleStageState.output === 'string') {
            newTitle = titleStageState.output;
        } 
        else if (titleStageId === "page-title-generation" && typeof titleStageState.output === 'object' && titleStageState.output !== null && Array.isArray(titleStageState.output.titles) && titleStageState.output.titles.length > 0) {
            const outlineStageUserInput = instance.stageStates['outline-creation']?.userInput;
            if (outlineStageUserInput && outlineStageUserInput.chosenTitle) {
                 newTitle = outlineStageUserInput.chosenTitle;
            } else {
                newTitle = titleStageState.output.titles[0]; 
            }
        } 
        else if (typeof titleStageState.output === 'object' && titleStageState.output !== null && titleStageState.output.title) {
             newTitle = titleStageState.output.title;
        }
        
        if (newTitle && newTitle.length > 0 && newTitle.length < 150) { 
            setPageTitle(newTitle);
            if (typeof document !== 'undefined') {
                document.title = `${newTitle} - ${siteConfig.name}`;
            }
            setInstance(prev => ({
                ...prev,
                document: { ...prev.document, title: newTitle }
            }));
        }
      }
    }
  }, [instance.stageStates, instance.workflow.config?.setTitleFromStageOutput]);


  const handleInputChange = (stageId: string, fieldName: string, value: any) => {
    if (fieldName === 'userInput') {
         updateStageState(stageId, { userInput: value, status: 'idle', output: undefined, completedAt: undefined, isStale: true });
    }
    evaluateDependencies();
  };

  const handleFormSubmit = (stageId: string, data: any) => {
    updateStageState(stageId, { userInput: data, status: 'idle', output: undefined, completedAt: undefined, isStale: true });
    toast({ title: "Input Saved", description: `Input for stage "${instance.workflow.stages.find(s=>s.id===stageId)?.title}" has been saved.`});
    evaluateDependencies();
  };

  const handleRunStage = async (stageId: string, currentInput?: any) => {
    const stage = instance.workflow.stages.find(s => s.id === stageId);
    if (!stage) return;

    const currentStageState = instance.stageStates[stageId];
    if (currentStageState.depsAreMet === false && stage.dependencies && stage.dependencies.length > 0) {
      toast({ title: "Dependencies Not Met", description: `Please complete previous stages before running "${stage.title}".`, variant: "default" });
      return;
    }

    updateStageState(stageId, { status: "running", error: undefined, isEditingOutput: false });
    
    // Ensure all upstream dependencies are re-evaluated for their latest output
    const contextVars: Record<string, any> = {};
    instance.workflow.stages.forEach(s => {
        const sState = instance.stageStates[s.id];
        if (s.id === stageId) { // For the current stage, use the provided currentInput or its existing userInput
            contextVars[s.id] = { userInput: currentInput ?? sState.userInput, output: sState.output };
        } else if (sState?.status === 'completed' || sState?.status === 'skipped') {
            contextVars[s.id] = { userInput: sState.userInput, output: sState.output };
        }
    });


    if (!stage.promptTemplate) { // Non-AI stage
      updateStageState(stageId, { 
        status: "completed", 
        output: stage.inputType === 'form' ? currentInput : (stage.inputType === 'textarea' || stage.inputType === 'context' ? currentInput : undefined),
        completedAt: new Date().toISOString(),
        isStale: false,
      });
      toast({ title: "Stage Processed", description: `Stage "${stage.title}" marked as complete.` });
      evaluateDependencies();
      return;
    }
    
    try {
      const result = await runAiStage({
        promptTemplate: stage.promptTemplate,
        model: stage.model || "gemini-2.0-flash",
        temperature: stage.temperature || 0.7,
        contextVars: contextVars,
        currentStageInput: currentInput ?? instance.stageStates[stageId].userInput, 
        stageOutputType: stage.outputType
      });

      if (result.error) {
        throw new Error(result.error);
      }
      
      updateStageState(stageId, {
        status: "completed",
        output: result.content,
        groundingInfo: result.groundingInfo,
        completedAt: new Date().toISOString(),
        isStale: false, 
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
    updateStageState(stageId, { status: "skipped", completedAt: new Date().toISOString(), output: undefined, userInput: undefined, isEditingOutput: false });
    toast({ title: "Stage Skipped", description: `Stage "${instance.workflow.stages.find(s=>s.id===stageId)?.title}" was skipped.` });
    evaluateDependencies();
  };
  
  const handleEditInputRequest = (stageId: string) => {
    // When input is edited, previous output is invalidated.
    updateStageState(stageId, { status: "idle", output: undefined, completedAt: undefined, isEditingOutput: false });
    toast({ title: "Editing Input", description: `Input for stage "${instance.workflow.stages.find(s=>s.id===stageId)?.title}" is now editable. Previous output cleared.` });
    evaluateDependencies();
  };

  const handleSetEditingOutput = (stageId: string, isEditing: boolean) => {
    updateStageState(stageId, { isEditingOutput: isEditing });
  };

  const handleOutputEdit = (stageId: string, newOutput: any) => {
    updateStageState(stageId, { output: newOutput, completedAt: new Date().toISOString(), isStale: false });
    // Note: Marking isStale as false assumes manual edit is the desired final state for this stage.
    // Subsequent dependent stages might become stale due to this change, handled by evaluateDependencies.
  };
  
  const completedStagesCount = instance.workflow.stages.filter(
    stage => instance.stageStates[stage.id]?.status === 'completed' || instance.stageStates[stage.id]?.status === 'skipped'
  ).length;
  const totalStages = instance.workflow.stages.length;
  const progressPercentage = totalStages > 0 ? (completedStagesCount / totalStages) * 100 : 0;

  const isWizardCompleted = completedStagesCount === totalStages;

  const currentFocusStage = instance.workflow.stages.find(
    s => {
      const state = instance.stageStates[s.id];
      return state && state.status !== 'completed' && state.status !== 'skipped' && state.depsAreMet !== false;
    }
  ) || instance.workflow.stages.find(s => instance.stageStates[s.id]?.depsAreMet === false) 
    || instance.workflow.stages.find(s => instance.stageStates[s.id]?.status === 'completed' && instance.stageStates[s.id]?.isStale === true) // Focus stale stage
    || instance.workflow.stages[instance.workflow.stages.length - 1]; // Fallback to last stage

  const currentStageId = currentFocusStage?.id || instance.workflow.stages[0].id;


  const handleFinalizeDocument = () => {
    if (!isWizardCompleted) {
      toast({ title: "Wizard Not Complete", description: "Please complete all stages before finalizing.", variant: "default"});
      return;
    }
    let finalContentStageId = instance.workflow.stages[instance.workflow.stages.length -1].id; 
    if (instance.workflow.config?.finalOutputStageId) {
        finalContentStageId = instance.workflow.config.finalOutputStageId;
    }
    
    if (instance.stageStates[finalContentStageId]?.status === 'completed') {
      const content = instance.stageStates[finalContentStageId]?.output;
      if (typeof content === 'string' || (typeof content === 'object' && content !== null)) {
         setFinalDocumentContent(typeof content === 'string' ? content : JSON.stringify(content, null, 2));
      } else {
        setFinalDocumentContent("No valid content to display or content is not in expected string/object format.");
      }
      setIsFinalizeDialogOpen(true);
      setHasFinalizedOnce(true);
    } else {
      toast({ title: "Final Content Not Ready", description: `The final content stage ('${instance.workflow.stages.find(s=>s.id===finalContentStageId)?.title}') is not yet complete.`, variant: "default"});
    }
  };


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
            All stages have been completed. You can now view and export your document.
          </AlertDescription>
        </Alert>
      )}

      {!isWizardCompleted && instance.stageStates[currentStageId]?.depsAreMet === false && (
         <Alert variant="default" className="mb-6 bg-blue-50 border-blue-300 dark:bg-blue-900/30 dark:border-blue-700">
          <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <AlertTitle className="text-blue-700 dark:text-blue-300 font-headline">Next Steps</AlertTitle>
          <AlertDescription className="text-blue-600 dark:text-blue-500">
            Please complete the preceding stages to unlock '{instance.workflow.stages.find(s => s.id === currentStageId)?.title}'.
          </AlertDescription>
        </Alert>
      )}
      {!isWizardCompleted && instance.stageStates[currentStageId]?.isStale === true && instance.stageStates[currentStageId]?.status === 'completed' && (
         <Alert variant="default" className="mb-6 bg-amber-50 border-amber-300 dark:bg-amber-900/30 dark:border-amber-700">
          <FileWarning className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          <AlertTitle className="text-amber-700 dark:text-amber-300 font-headline">Output May Be Stale</AlertTitle>
          <AlertDescription className="text-amber-600 dark:text-amber-500">
            The input or dependencies for stage '{instance.workflow.stages.find(s => s.id === currentStageId)?.title}' have changed. You may want to re-run or review its output.
          </AlertDescription>
        </Alert>
      )}


      {instance.workflow.stages.map(stage => (
        <StageCard
          key={stage.id}
          stage={stage}
          stageState={instance.stageStates[stage.id] || { stageId: stage.id, status: 'idle', depsAreMet: !(stage.dependencies && stage.dependencies.length > 0), isEditingOutput: false }}
          isCurrentStage={stage.id === currentStageId && !isWizardCompleted}
          onRunStage={handleRunStage}
          onInputChange={handleInputChange}
          onFormSubmit={handleFormSubmit}
          onSkipStage={stage.isOptional ? handleSkipStage : undefined}
          onEditInputRequest={handleEditInputRequest}
          onOutputEdit={handleOutputEdit}
          onSetEditingOutput={handleSetEditingOutput}
          allStageStates={instance.stageStates}
        />
      ))}

      <div className="mt-8 flex justify-end">
        <Button 
          variant="default" 
          size="lg" 
          disabled={!isWizardCompleted}
          onClick={handleFinalizeDocument}
          className="bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          <DownloadCloud className="mr-2 h-5 w-5" />
          {hasFinalizedOnce ? "View/Export Document" : "Finalize Document"}
        </Button>
      </div>

      <FinalDocumentDialog
        open={isFinalizeDialogOpen}
        onOpenChange={setIsFinalizeDialogOpen}
        markdownContent={finalDocumentContent}
        documentTitle={instance.document.title}
      />
    </div>
  );
}
