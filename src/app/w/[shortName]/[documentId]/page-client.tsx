"use client";

import { notFound } from 'next/navigation';
import { getWorkflowByShortName } from '@/lib/workflow-loader';
import { documentPersistence } from '@/lib/document-persistence';
import WizardPageContent from './wizard-page-content';
import type { WizardDocument, WizardInstance, StageState, Workflow } from '@/types';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

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

interface WizardPageClientProps {
  shortName: string;
  documentId: string;
}

export default function WizardPageClient({ shortName, documentId }: WizardPageClientProps) {
  const [wizardInstance, setWizardInstance] = useState<WizardInstance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadWizardData() {
      try {
        const workflow = getWorkflowByShortName(shortName);
        if (!workflow) {
          setError('Workflow not found');
          return;
        }

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
          const loadResult = await documentPersistence.loadDocument(documentId);
          
          if (!loadResult.success || !loadResult.document || !loadResult.stageStates) {
            setError('Document not found');
            return;
          }

          const initializedStageStates = initializeStageStates(workflow);
          const mergedStageStates: Record<string, StageState> = { ...initializedStageStates };
          
          Object.keys(loadResult.stageStates).forEach(stageId => {
            if (workflow.stages.some(s => s.id === stageId)) {
              mergedStageStates[stageId] = loadResult.stageStates![stageId];
            }
          });
          
          setWizardInstance({
            workflow,
            document: loadResult.document,
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

    loadWizardData();
  }, [shortName, documentId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !wizardInstance) {
    notFound();
  }

  return <WizardPageContent initialInstance={wizardInstance} />;
}