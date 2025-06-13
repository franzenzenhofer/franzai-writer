"use client";

import { useState, useEffect, useCallback } from 'react';
import type { WizardInstance, StageState, Workflow } from '@/types';
import { StageCardSimple } from './stage-card-simple';
import { useToast } from '@/hooks/use-toast';

function initializeStageStates(workflow: Workflow): Record<string, StageState> {
  const stageStates: Record<string, StageState> = {};
  
  workflow.stages.forEach(stage => {
    stageStates[stage.id] = {
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
    };
  });
  
  return stageStates;
}

export default function WizardContainer({ 
  shortName, 
  documentId 
}: { 
  shortName: string; 
  documentId: string 
}) {
  const [loading, setLoading] = useState(true);
  const [wizardInstance, setWizardInstance] = useState<WizardInstance | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    async function loadData() {
      try {
        // Load workflow
        const workflowRes = await fetch(`/api/wizard/workflow/${shortName}`);
        if (!workflowRes.ok) {
          setError('Workflow not found');
          return;
        }
        const workflowData = await workflowRes.json();
        const workflow = workflowData.workflow;

        // Handle new documents
        if (documentId === 'new' || documentId.startsWith('temp-')) {
          const tempId = documentId === 'new' ? `temp-${Date.now()}` : documentId;
          
          setWizardInstance({
            workflow,
            document: {
              id: tempId,
              title: `New ${workflow.name}`,
              workflowId: workflow.id,
              status: 'draft',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              userId: 'temp_user',
            },
            stageStates: initializeStageStates(workflow),
          });
        } else {
          // Load existing document
          const docRes = await fetch(`/api/wizard/document/${documentId}`);
          const docData = await docRes.json();
          
          if (!docData.success || !docData.document) {
            setError('Document not found');
            return;
          }

          const initializedStageStates = initializeStageStates(workflow);
          const mergedStageStates: Record<string, StageState> = { ...initializedStageStates };
          
          // Merge loaded states
          if (docData.stageStates) {
            Object.keys(docData.stageStates).forEach(stageId => {
              if (workflow.stages.some(s => s.id === stageId)) {
                mergedStageStates[stageId] = docData.stageStates[stageId];
              }
            });
          }
          
          setWizardInstance({
            workflow,
            document: docData.document,
            stageStates: mergedStageStates,
          });
        }
      } catch (err) {
        console.error('Error loading wizard data:', err);
        setError('Failed to load wizard data');
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, [shortName, documentId]);

  // Handle stage execution
  const handleStageExecute = useCallback(async (stageId: string, input: string) => {
    if (!wizardInstance) return;
    
    try {
      // Prepare context vars
      const contextVars: Record<string, any> = {};
      Object.entries(wizardInstance.stageStates).forEach(([id, state]) => {
        contextVars[id] = {
          userInput: state.userInput,
          output: state.output
        };
      });

      const stage = wizardInstance.workflow.stages.find(s => s.id === stageId);
      if (!stage) throw new Error('Stage not found');

      // Call API
      const response = await fetch('/api/wizard/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workflow: wizardInstance.workflow,
          stage: stage,
          promptTemplate: stage.promptTemplate,
          model: stage.model,
          temperature: stage.temperature,
          contextVars,
          currentStageInput: input,
          stageOutputType: stage.outputType
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Execution failed');
      }

      const result = await response.json();
      
      // Update stage state
      setWizardInstance(prev => {
        if (!prev) return null;
        return {
          ...prev,
          stageStates: {
            ...prev.stageStates,
            [stageId]: {
              ...prev.stageStates[stageId],
              userInput: input,
              output: result.content,
              status: 'completed' as const,
              completedAt: new Date().toISOString()
            }
          }
        };
      });

      toast({
        title: "Stage completed",
        description: `${stage.title} has been processed successfully.`,
      });
    } catch (error: any) {
      toast({
        title: "Execution failed",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [wizardInstance, toast]);

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  if (error) return <div className="flex items-center justify-center min-h-screen text-red-500">{error}</div>;
  if (!wizardInstance) return <div className="flex items-center justify-center min-h-screen">No data</div>;
  
  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">{wizardInstance.workflow.name}</h1>
      <p className="text-gray-600 mb-8">Document: {wizardInstance.document.title}</p>
      
      <div className="space-y-4">
        {wizardInstance.workflow.stages.map(stage => (
          <StageCardSimple
            key={stage.id}
            stage={stage}
            stageState={wizardInstance.stageStates[stage.id]}
            onExecute={handleStageExecute}
          />
        ))}
      </div>
    </div>
  );
}