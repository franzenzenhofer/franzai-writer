"use client";

import React, { useState, useEffect, useCallback } from 'react';
import type { WizardInstance, Stage, StageState } from '@/types';
import { StageCard } from './stage-card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, Check, Info, Lightbulb, FileWarning, Save } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { siteConfig } from '@/config/site';
import { useDocumentPersistence } from '@/hooks/use-document-persistence';
import { Badge } from '@/components/ui/badge';

// Lazy load the server action to prevent Turbopack static analysis
let runAiStage: any = null;

interface WizardShellProps {
  initialInstance: WizardInstance;
}

export function WizardShell({ initialInstance }: WizardShellProps) {
  const [instance, setInstance] = useState<WizardInstance>(initialInstance);
  const { toast } = useToast();
  const [pageTitle, setPageTitle] = useState(initialInstance.document.title);
  const [aiStageLoaded, setAiStageLoaded] = useState(false);

  // Load the server action dynamically
  useEffect(() => {
    import('@/lib/ai-stage-runner').then(module => {
      runAiStage = module.runAiStage;
      setAiStageLoaded(true);
    });
  }, []);

  // Auto-scroll utility
  const scrollToElement = useCallback((elementId: string, delay: number = 300) => {
    setTimeout(() => {
      const element = document.getElementById(elementId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, delay);
  }, []);

  // Document persistence with complete instance save
  const { 
    saveDocument, 
    isSaving, 
    lastSaved,
    autoSaveEnabled,
    setAutoSaveEnabled 
  } = useDocumentPersistence({
    document: instance.document,
    stageStates: instance.stageStates,
    onSaveSuccess: (savedDoc) => {
      setInstance(prev => ({
        ...prev,
        document: {
          ...prev.document,
          ...savedDoc,
        }
      }));
    },
    onSaveError: (error) => {
      toast({
        title: "Save failed",
        description: error.message || "Failed to save document",
        variant: "destructive",
      });
    }
  });

  // Update page title when document title changes
  useEffect(() => {
    if (pageTitle && pageTitle !== 'New Document') {
      // Update the browser title
      document.title = `${pageTitle} | ${siteConfig.name}`;
      
      // Update the document title if it's different
      if (instance.document.title !== pageTitle) {
        setInstance(prev => ({
          ...prev,
          document: {
            ...prev.document,
            title: pageTitle
          }
        }));
      }
    }
  }, [pageTitle, instance.document.title]);

  // Handle stage execution
  const handleRunStage = useCallback(async (stageId: string) => {
    if (!aiStageLoaded || !runAiStage) {
      toast({
        title: "AI not ready",
        description: "Please wait for AI to load",
        variant: "destructive",
      });
      return;
    }

    const stage = instance.workflow.stages.find(s => s.id === stageId);
    if (!stage) return;

    setInstance(prev => ({
      ...prev,
      stageStates: {
        ...prev.stageStates,
        [stageId]: {
          ...prev.stageStates[stageId],
          status: 'processing',
          error: undefined,
        }
      }
    }));

    try {
      const stageState = instance.stageStates[stageId];
      
      // Create context vars from all stage states
      const contextVars: Record<string, any> = {};
      Object.entries(instance.stageStates).forEach(([id, state]) => {
        contextVars[id] = {
          userInput: state.userInput,
          output: state.output
        };
      });

      const result = await runAiStage({
        workflow: instance.workflow,
        stage: stage,
        promptTemplate: stage.promptTemplate,
        model: stage.model,
        temperature: stage.temperature,
        thinkingSettings: stage.thinkingSettings,
        toolNames: stage.toolNames,
        systemInstructions: stage.systemInstructions,
        contextVars,
        currentStageInput: stageState.userInput,
        stageOutputType: stage.outputType,
        aiRedoNotes: stageState.aiRedoNotes,
        forceGoogleSearchGrounding: stage.forceGoogleSearchGrounding,
        groundingSettings: stage.groundingSettings,
        jsonSchema: stage.jsonSchema,
        jsonFields: stage.jsonFields,
        groundingInfo: stageState.groundingInfo,
        thinkingSteps: stageState.thinkingSteps,
        currentStreamOutput: stageState.currentStreamOutput,
      });

      setInstance(prev => ({
        ...prev,
        stageStates: {
          ...prev.stageStates,
          [stageId]: {
            ...prev.stageStates[stageId],
            status: 'completed',
            output: result.content,
            error: undefined,
            completedAt: new Date().toISOString(),
            groundingInfo: result.groundingInfo || result.groundingMetadata,
            thinkingSteps: result.thinkingSteps,
            outputImages: result.outputImages,

          }
        }
      }));

      // Check if we should auto-run dependent stages
      const dependentStages = instance.workflow.stages.filter(s => 
        s.dependencies?.includes(stageId) && 
        s.shouldAutoRun
      );

      for (const depStage of dependentStages) {
        const allDepsCompleted = depStage.dependencies?.every(depId => 
          instance.stageStates[depId]?.status === 'completed'
        ) ?? true;

        if (allDepsCompleted && instance.stageStates[depStage.id].status === 'idle') {
          // Auto-run the dependent stage
          setTimeout(() => {
            handleRunStage(depStage.id);
            scrollToElement(`stage-${depStage.id}`);
          }, 500);
        }
      }

    } catch (error: any) {
      console.error('Stage execution error:', error);
      setInstance(prev => ({
        ...prev,
        stageStates: {
          ...prev.stageStates,
          [stageId]: {
            ...prev.stageStates[stageId],
            status: 'error',
            error: error.message || 'An error occurred',
          }
        }
      }));
      
      toast({
        title: "Execution failed",
        description: error.message || "An error occurred while processing the stage",
        variant: "destructive",
      });
    }
  }, [instance, toast, scrollToElement, aiStageLoaded]);

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <input
          type="text"
          value={pageTitle}
          onChange={(e) => setPageTitle(e.target.value)}
          className="text-3xl font-bold bg-transparent border-none outline-none w-full"
          placeholder="Enter document title..."
        />
      </div>

      {!aiStageLoaded && (
        <Alert>
          <AlertDescription>Loading AI capabilities...</AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">
        {instance.workflow.stages.map((stage, index) => (
          <StageCard
            key={stage.id}
            stage={stage}
            workflow={instance.workflow}
            stageState={instance.stageStates[stage.id]}
            onRun={() => handleRunStage(stage.id)}
            onInputChange={(input) => {
              setInstance(prev => ({
                ...prev,
                stageStates: {
                  ...prev.stageStates,
                  [stage.id]: {
                    ...prev.stageStates[stage.id],
                    userInput: input,
                  }
                }
              }));
            }}
            isFirstStage={index === 0}
          />
        ))}
      </div>
    </div>
  );
}