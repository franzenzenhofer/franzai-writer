"use client";

import React from 'react';
import type { WizardInstance } from '@/types';
import { StageCard } from './stage-card';
import { AlertTriangle, Check, Info, FileWarning, Save } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useDocumentPersistence } from '@/hooks/use-document-persistence';
import { useWizardInstance } from '@/hooks/use-wizard-instance';
import { useStageProcessing } from '@/hooks/use-stage-processing';
import { useWizardUIState } from '@/hooks/use-wizard-ui-state';
import { useAutorun } from '@/hooks/use-autorun';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/components/layout/app-providers';

interface WizardShellProps {
  initialInstance: WizardInstance;
}

export function WizardShell({ initialInstance }: WizardShellProps) {
  const { effectiveUser } = useAuth();
  
  // Use custom hooks for state management
  const { 
    instance, 
    setInstance, 
    updateStageState, 
    pageTitle, 
    setPageTitle 
  } = useWizardInstance({ initialInstance });
  
  const {
    completedStagesCount,
    totalStages,
    progressPercentage,
    isWizardCompleted,
    currentFocusStage,
    currentStageId,
    scrollToStageById,
  } = useWizardUIState({ instance, pageTitle, setPageTitle, setInstance });
  
  // Callback to sync instance changes from persistence layer
  const updateInstanceForPersistence = (updates: Partial<WizardInstance>) => {
    setInstance(prev => ({ ...prev, ...updates }));
  };

  // Document persistence
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

  const {
    handleRunStage,
    handleInputChange,
    handleFormSubmit,
    handleEditInputRequest,
    handleSetEditingOutput,
    handleOutputEdit,
    handleDismissStaleWarning,
  } = useStageProcessing({ 
    instance, 
    updateStageState, 
    documentId, 
    scrollToStageById 
  });
  
  // Use autorun hook to handle automatic stage execution
  useAutorun({ instance, handleRunStage });



  return (
    <>
      <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <h1 
          className="text-2xl md:text-3xl font-bold font-headline mb-2"
          data-testid="wizard-page-title"
        >
          {pageTitle}
        </h1>
        <div className="flex items-center gap-2 mb-1 text-sm md:text-base text-muted-foreground">
          {!isSaving && lastSaved && (
            <span className="text-xs md:text-sm" data-testid="last-saved-text">
              {`Last saved ${lastSaved.toLocaleString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
              }).replace(',', '')}`}
            </span>
          )}
          {!isSaving && lastSaved && <span className="px-1">|</span>}
          <p>Workflow: {instance.workflow.name}</p>
        </div>
        
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
              currentStreamOutput: undefined,
              outputImages: undefined
            }}
            isCurrentStage={stage.id === currentStageId && !isWizardCompleted}
            onRunStage={handleRunStage}
            onInputChange={handleInputChange}
            onFormSubmit={handleFormSubmit}
            documentId={documentId || undefined}
            
            onEditInputRequest={handleEditInputRequest}
            onOutputEdit={handleOutputEdit}
            onSetEditingOutput={handleSetEditingOutput}
            onDismissStaleWarning={handleDismissStaleWarning}
            onUpdateStageState={updateStageState}
            allStageStates={instance.stageStates}
          />
        ))}


      </div>
    </>
  );
}
