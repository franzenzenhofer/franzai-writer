
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import type { WizardInstance, Stage, StageState } from '@/types';
import { StageCard } from './stage-card';
import { Button } from '@/components/ui/button';
import { runAiStage } from '@/app/actions/aiActions'; 
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, Check, Info, Lightbulb, DownloadCloud, FileWarning, Save } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { FinalDocumentDialog } from './final-document-dialog';
import { siteConfig } from '@/config/site';
import { useDocumentPersistence } from '@/hooks/use-document-persistence';
import { Badge } from '@/components/ui/badge';

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

  // Auto-scroll utility
  const scrollToStageById = useCallback((stageId: string) => {
    const stageElement = document.getElementById(`stage-${stageId}`);
    if (stageElement) {
      const elementTop = stageElement.getBoundingClientRect().top + window.pageYOffset;
      const headerOffset = 120; // Account for sticky header height + some padding
      window.scrollTo({
        top: elementTop - headerOffset,
        behavior: 'smooth'
      });
    }
  }, []);

  // Document persistence
  const updateInstanceForPersistence = useCallback((updates: Partial<WizardInstance>) => {
    setInstance(prev => ({ ...prev, ...updates }));
  }, []);

  const { 
    isSaving, 
    lastSaved, 
    saveError, 
    documentId,
    saveDocument 
  } = useDocumentPersistence({
    instance,
    updateInstance: updateInstanceForPersistence,
  });


  const updateStageState = useCallback((stageId: string, updates: Partial<StageState>) => {
    setInstance(prevInstance => {
      const newStageStates = {
        ...prevInstance.stageStates,
        [stageId]: {
          ...prevInstance.stageStates[stageId],
          ...updates,
        },
      };
      // After updating state, re-evaluate dependencies
      const evaluatedStageStates = evaluateDependenciesLogic(newStageStates, prevInstance.workflow.stages);
      return { ...prevInstance, stageStates: evaluatedStageStates };
    });
  }, []); // Removed evaluateDependencies from here, it's called internally by updateStageState

  // Enhanced dependency evaluation logic with support for autoRunConditions
  const evaluateDependenciesLogic = (currentStageStates: Record<string, StageState>, stages: Stage[]): Record<string, StageState> => {
    const newStageStates = { ...currentStageStates };
    let changed = false;

    stages.forEach(stage => {
      const currentState = newStageStates[stage.id];
      if (!currentState) return; // Should not happen if initialized correctly

      // Evaluate basic dependencies
      let depsMet = true;
      if (stage.dependencies && stage.dependencies.length > 0) {
        depsMet = stage.dependencies.every(depId => 
          newStageStates[depId]?.status === 'completed'
        );
      }

      // Evaluate autorun conditions (more complex dependency logic)
      let autoRunConditionsMet = true;
      if (stage.autoRunConditions) {
        if (stage.autoRunConditions.requiresAll) {
          autoRunConditionsMet = stage.autoRunConditions.requiresAll.every(depId => 
            newStageStates[depId]?.status === 'completed'
          );
        }
        if (autoRunConditionsMet && stage.autoRunConditions.requiresAny) {
          autoRunConditionsMet = stage.autoRunConditions.requiresAny.some(depId => 
            newStageStates[depId]?.status === 'completed'
          );
        }
      }
      
      let isStale = false;
      if (currentState.status === 'completed') {
        const stageCompletedAt = currentState.completedAt ? new Date(currentState.completedAt).getTime() : 0;
        
        // Check staleness based on basic dependencies
        if (stage.dependencies && stage.dependencies.length > 0) {
          isStale = stage.dependencies.some(depId => {
            const depCompletedAt = newStageStates[depId]?.completedAt ? new Date(newStageStates[depId].completedAt).getTime() : 0;
            return depCompletedAt > stageCompletedAt || newStageStates[depId]?.isStale === true;
          });
        }
        
        // Also check staleness based on autorun conditions
        if (!isStale && stage.autoRunConditions?.requiresAll) {
          isStale = stage.autoRunConditions.requiresAll.some(depId => {
            const depCompletedAt = newStageStates[depId]?.completedAt ? new Date(newStageStates[depId].completedAt).getTime() : 0;
            return depCompletedAt > stageCompletedAt || newStageStates[depId]?.isStale === true;
          });
        }
        
        // Also check staleness based on autorun dependencies
        if (!isStale && stage.autorunDependsOn && stage.autorunDependsOn.length > 0) {
          isStale = stage.autorunDependsOn.some(depId => {
            const depCompletedAt = newStageStates[depId]?.completedAt ? new Date(newStageStates[depId].completedAt).getTime() : 0;
            return depCompletedAt > stageCompletedAt || newStageStates[depId]?.isStale === true;
          });
        }
      }

      // Evaluate autorun dependencies (separate from activation dependencies)
      let autorunDepsMet = true;
      if (stage.autorunDependsOn && stage.autorunDependsOn.length > 0) {
        // Use explicit autorun dependencies
        autorunDepsMet = stage.autorunDependsOn.every(depId => 
          newStageStates[depId]?.status === 'completed'
        );
      } else {
        // Fall back to regular dependencies (backward compatibility)
        autorunDepsMet = depsMet;
      }

      // Determine if stage should auto-run
      let shouldAutoRun = false;
      if (stage.autoRun && currentState.status === 'idle' && !currentState.isEditingOutput) {
        if (stage.autoRunConditions) {
          // Use complex autorun conditions AND autorun dependencies
          shouldAutoRun = depsMet && autoRunConditionsMet && autorunDepsMet;
        } else {
          // Use simple dependency logic - stage must be active (depsMet) AND autorun deps met
          shouldAutoRun = depsMet && autorunDepsMet;
        }
      }

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
          // Reset staleDismissed when stage is no longer stale
          staleDismissed: isStale ? currentState.staleDismissed : false,
        };
        changed = true;
      }
    });
    return changed ? newStageStates : currentStageStates; // Return original if no change to avoid re-render
  };
  
  // Effect for initial and subsequent dependency evaluations
  useEffect(() => {
    setInstance(prevInstance => ({
      ...prevInstance,
      stageStates: evaluateDependenciesLogic(prevInstance.stageStates, prevInstance.workflow.stages)
    }));
  }, []); // Runs once on mount, subsequent calls via updateStageState


  useEffect(() => {
    instance.workflow.stages.forEach(stage => {
      const stageState = instance.stageStates[stage.id];
      // Defensive check: ensure stageState exists before accessing its properties
      if (stageState && stageState.shouldAutoRun && stageState.status === 'idle' && stageState.depsAreMet && !stageState.isEditingOutput) {
        handleRunStage(stage.id, stageState.userInput);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instance.stageStates, instance.workflow.stages]); 


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
            // For page-title-generation, if 'chosenTitle' exists in outline-creation's userInput, use that.
            const outlineStageUserInput = instance.stageStates['outline-creation']?.userInput;
            if (outlineStageUserInput && typeof outlineStageUserInput === 'object' && outlineStageUserInput.chosenTitle) {
                 newTitle = outlineStageUserInput.chosenTitle;
            } else {
                newTitle = titleStageState.output.titles[0]; 
            }
        }
         else if (titleStageId === "dish-name" && typeof titleStageState.output === 'string') { // For Recipe Workflow
            newTitle = titleStageState.output;
        }
        else if (typeof titleStageState.output === 'object' && titleStageState.output !== null && titleStageState.output.title) { // Generic title from object
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
    // This is primarily for simple input types like 'textarea' or 'context' now.
    // Form inputs are handled by onFormSubmit.
    if (fieldName === 'userInput') {
         updateStageState(stageId, { userInput: value, status: 'idle', output: undefined, completedAt: undefined, isStale: true });
    }
  };

  const handleFormSubmit = (stageId: string, data: any) => {
    // This function is called from StageInputArea when form field values change.
    // It updates the central state with the latest form data.
    updateStageState(stageId, { 
        userInput: data, 
        status: 'idle', // Keep as idle, don't clear output yet, user might just be editing
        // output: undefined, // Clearing output here might be too aggressive if user is just tweaking form
        // completedAt: undefined, 
        isStale: true // Mark as stale because input changed
    });
    // toast({ title: "Input Updated", description: `Input for stage "${instance.workflow.stages.find(s=>s.id===stageId)?.title}" is being updated.`});
  };

  const handleRunStage = useCallback(async (stageId: string, currentInput?: any, aiRedoNotes?: string) => {
    console.log('[handleRunStage] Called with:', { stageId, currentInput });
    const stage = instance.workflow.stages.find(s => s.id === stageId);
    if (!stage) return;

    const currentStageState = instance.stageStates[stageId];
    console.log('[handleRunStage] Current stage state:', currentStageState);
    // Use the most up-to-date userInput from the state for the current stage
    const stageInputForRun = currentStageState.userInput ?? currentInput;
    console.log('[handleRunStage] Stage input for run:', stageInputForRun);


    if (currentStageState.depsAreMet === false && stage.dependencies && stage.dependencies.length > 0) {
      toast({ title: "Dependencies Not Met", description: `Please complete previous stages before running "${stage.title}".`, variant: "default" });
      return;
    }

    updateStageState(stageId, { status: "running", error: undefined, isEditingOutput: false });
    
    const contextVars: Record<string, any> = {};
    instance.workflow.stages.forEach(s => {
        const sState = instance.stageStates[s.id];
        if (s.id === stageId) { 
            contextVars[s.id] = { userInput: stageInputForRun, output: sState.output };
        } else if (sState?.status === 'completed') {
            contextVars[s.id] = { userInput: sState.userInput, output: sState.output };
        }
    });


    if (!stage.promptTemplate) { 
      updateStageState(stageId, { 
        status: "completed", 
        output: stage.inputType === 'form' 
            ? stageInputForRun // Output is the submitted form data itself
            : (stage.inputType === 'textarea' || stage.inputType === 'context' 
                ? stageInputForRun // Output is the text/context input
                : undefined),
        completedAt: new Date().toISOString(),
        isStale: false,
      });
      toast({ title: "Stage Processed", description: `Stage "${stage.title}" marked as complete.` });
      
      // Auto-scroll to next stage after a brief delay (configurable)
      const autoScrollConfig = instance.workflow.config?.autoScroll;
      if (autoScrollConfig?.enabled !== false) { // Default to enabled if not configured
        setTimeout(() => {
          const nextStageIndex = instance.workflow.stages.findIndex(s => s.id === stageId) + 1;
          if (nextStageIndex < instance.workflow.stages.length) {
            const nextStage = instance.workflow.stages[nextStageIndex];
            const shouldScroll = nextStage.autoRun ? 
              (autoScrollConfig?.scrollToAutorun !== false) : // Default to true for autorun
              (autoScrollConfig?.scrollToManual === true); // Default to false for manual
            
            if (shouldScroll) {
              scrollToStageById(nextStage.id);
            }
          }
        }, 500);
      }
      
      return;
    }
    
    try {
      // Enhance prompt template with AI REDO notes if provided
      let enhancedPromptTemplate = stage.promptTemplate;
      if (aiRedoNotes && stage.promptTemplate) {
        enhancedPromptTemplate = `${stage.promptTemplate}\n\nAdditional instructions: ${aiRedoNotes}`;
        console.log('[handleRunStage] Enhanced prompt with AI REDO notes:', aiRedoNotes);
      }

      console.log('[handleRunStage] About to call runAiStage with:', {
        hasPromptTemplate: !!enhancedPromptTemplate,
        model: stage.model || "googleai/gemini-2.5-flash-preview-05-20",
        temperature: stage.temperature || 0.7,
        contextVarsKeys: Object.keys(contextVars),
        currentStageInput: stageInputForRun,
        stageOutputType: stage.outputType,
        hasAiRedoNotes: !!aiRedoNotes
      });
      
      const result = await runAiStage({
        promptTemplate: enhancedPromptTemplate,
        model: stage.model || "googleai/gemini-2.5-flash-preview-05-20",
        temperature: stage.temperature || 0.7,
        thinkingSettings: stage.thinkingSettings,
        toolNames: stage.toolNames,
        systemInstructions: stage.systemInstructions, // Pass systemInstructions
        chatHistory: currentStageState.chatHistory, // Pass current chatHistory
        contextVars: contextVars,
        currentStageInput: stageInputForRun,
        stageOutputType: stage.outputType,
      });

      if (result.error) {
        // Preserve chat history on error, but clear current stream
        updateStageState(stageId, { status: "error", error: result.error, currentStreamOutput: "" });
        toast({ title: "AI Stage Error", description: result.error, variant: "destructive" });
        return; // Stop further processing on error
      }
      
      updateStageState(stageId, {
        status: "completed",
        output: result.content, // Final accumulated content
        groundingInfo: result.groundingInfo,
        thinkingSteps: result.thinkingSteps,
        outputImages: result.outputImages,
        chatHistory: result.updatedChatHistory, // Store updated chat history
        currentStreamOutput: "", // Clear stream output
        completedAt: new Date().toISOString(),
        isStale: false,
      });
      toast({ title: "AI Stage Completed", description: `AI processing for "${stage.title}" finished.` });
      
      // Auto-scroll to next stage after a brief delay (configurable)
      const autoScrollConfig = instance.workflow.config?.autoScroll;
      if (autoScrollConfig?.enabled !== false) { // Default to enabled if not configured
        setTimeout(() => {
          const nextStageIndex = instance.workflow.stages.findIndex(s => s.id === stageId) + 1;
          if (nextStageIndex < instance.workflow.stages.length) {
            const nextStage = instance.workflow.stages[nextStageIndex];
            const shouldScroll = nextStage.autoRun ? 
              (autoScrollConfig?.scrollToAutorun !== false) : // Default to true for autorun
              (autoScrollConfig?.scrollToManual === true); // Default to false for manual
            
            if (shouldScroll) {
              scrollToStageById(nextStage.id);
            }
          }
        }, 500);
      }

    } catch (error: any) {
      console.error("Error running AI stage:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        stageId,
        promptTemplate: stage.promptTemplate
      });
      updateStageState(stageId, { status: "error", error: error.message || "AI processing failed." });
      toast({ title: "AI Stage Error", description: error.message || "An error occurred.", variant: "destructive" });
    }
  }, [instance.workflow.stages, instance.stageStates, instance.workflow.config?.autoScroll, updateStageState, toast, scrollToStageById]);


  
  const handleEditInputRequest = (stageId: string) => {
    updateStageState(stageId, { status: "idle", output: undefined, completedAt: undefined, isEditingOutput: false });
    toast({ title: "Editing Input", description: `Input for stage "${instance.workflow.stages.find(s=>s.id===stageId)?.title}" is now editable. Previous output cleared.` });
  };

  const handleSetEditingOutput = (stageId: string, isEditing: boolean) => {
    updateStageState(stageId, { isEditingOutput: isEditing });
  };

  const handleOutputEdit = (stageId: string, newOutput: any) => {
    updateStageState(stageId, { output: newOutput, completedAt: new Date().toISOString(), isStale: false });
  };

  const handleDismissStaleWarning = (stageId: string) => {
    updateStageState(stageId, { staleDismissed: true });
    toast({ title: "Warning Dismissed", description: `Update recommendation for "${instance.workflow.stages.find(s=>s.id===stageId)?.title}" has been dismissed.` });
  };
  
  const completedStagesCount = instance.workflow.stages.filter(
    stage => instance.stageStates[stage.id]?.status === 'completed'
  ).length;
  const totalStages = instance.workflow.stages.length;
  const progressPercentage = totalStages > 0 ? (completedStagesCount / totalStages) * 100 : 0;

  const isWizardCompleted = completedStagesCount === totalStages;

  const currentFocusStage = instance.workflow.stages.find(
    s => {
      const state = instance.stageStates[s.id];
      return state && state.status !== 'completed' && state.depsAreMet !== false;
    }
  ) || instance.workflow.stages.find(s => instance.stageStates[s.id]?.depsAreMet === false) 
    || instance.workflow.stages.find(s => instance.stageStates[s.id]?.status === 'completed' && instance.stageStates[s.id]?.isStale === true && !instance.stageStates[s.id]?.staleDismissed)
    || instance.workflow.stages[instance.workflow.stages.length - 1]; 

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
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 
        className="text-2xl md:text-3xl font-bold font-headline mb-2"
        data-testid="wizard-page-title"
      >
        {pageTitle}
      </h1>
      <p className="text-sm md:text-base text-muted-foreground mb-1">Workflow: {instance.workflow.name}</p>
      <div className="mb-6">
        <div className="flex justify-between text-sm text-muted-foreground mb-1">
            <span>Progress</span>
            <span>{completedStagesCount} / {totalStages} Stages</span>
        </div>
        <Progress 
          value={progressPercentage} 
          className="w-full h-3"
          data-testid="wizard-progress-bar"
        />
        <div className="flex items-center justify-end mt-2 gap-2">
          {isSaving && (
            <Badge variant="secondary" className="text-xs">
              <Save className="w-3 h-3 mr-1 animate-pulse" />
              Saving...
            </Badge>
          )}
          {!isSaving && lastSaved && (
            <Badge variant="outline" className="text-xs text-muted-foreground">
              Last saved {lastSaved.toLocaleTimeString()}
            </Badge>
          )}
          {saveError && (
            <Badge variant="destructive" className="text-xs">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Save failed
            </Badge>
          )}
        </div>
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
            Please complete the preceding stages to unlock &apos;{instance.workflow.stages.find(s => s.id === currentStageId)?.title}&apos;.
          </AlertDescription>
        </Alert>
      )}
      {!isWizardCompleted && instance.stageStates[currentStageId]?.isStale === true && instance.stageStates[currentStageId]?.status === 'completed' && !instance.stageStates[currentStageId]?.staleDismissed && (
         <Alert variant="default" className="mb-6 bg-amber-50 border-amber-300 dark:bg-amber-900/30 dark:border-amber-700">
          <FileWarning className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          <AlertTitle className="text-amber-700 dark:text-amber-300 font-headline">Update Recommended</AlertTitle>
          <AlertDescription className="text-amber-600 dark:text-amber-500">
            The input or dependencies for stage &apos;{instance.workflow.stages.find(s => s.id === currentStageId)?.title}&apos; have changed. You may want to re-run or review its output.
          </AlertDescription>
        </Alert>
      )}


      {instance.workflow.stages.map(stage => (
        <StageCard
          key={stage.id}
          stage={stage}
          workflow={instance.workflow}
          stageState={instance.stageStates[stage.id] || { 
            stageId: stage.id, 
            status: 'idle', 
            depsAreMet: !(stage.dependencies && stage.dependencies.length > 0), 
            isEditingOutput: false,
            shouldAutoRun: false,
            isStale: false,
            staleDismissed: false,
            userInput: undefined,
            output: undefined,
            error: undefined,
            completedAt: undefined,
            groundingInfo: undefined,
            thinkingSteps: undefined,
            chatHistory: undefined,
            currentStreamOutput: undefined,
            outputImages: undefined
          }}
          isCurrentStage={stage.id === currentStageId && !isWizardCompleted}
          onRunStage={handleRunStage}
          onInputChange={handleInputChange}
          onFormSubmit={handleFormSubmit}
          
          onEditInputRequest={handleEditInputRequest}
          onOutputEdit={handleOutputEdit}
          onSetEditingOutput={handleSetEditingOutput}
          onDismissStaleWarning={handleDismissStaleWarning}
          allStageStates={instance.stageStates}
        />
      ))}

      <div className="mt-8 flex justify-center md:justify-end">
        <Button 
          variant="default" 
          size="lg" 
          disabled={!isWizardCompleted}
          onClick={handleFinalizeDocument}
          className="bg-accent hover:bg-accent/90 text-accent-foreground w-full md:w-auto"
          id="finalize-document-button"
          data-testid="finalize-document-button"
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
