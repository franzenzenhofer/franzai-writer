import { notFound } from 'next/navigation';
import { getWorkflowByShortName } from '@/lib/workflow-loader';
import { documentPersistence } from '@/lib/document-persistence';
import WizardPageContent from './wizard-page-content';
import type { WizardDocument, WizardInstance, StageState, Workflow } from '@/types';

// Force dynamic rendering since this page loads documents from Firestore
export const dynamic = 'force-dynamic';

/**
 * Initialize proper StageState objects for each stage in the workflow
 * This ensures that every stage has a valid StageState object with all required properties
 */
function initializeStageStates(workflow: Workflow): Record<string, StageState> {
  const stageStates: Record<string, StageState> = {};
  
  workflow.stages.forEach(stage => {
    stageStates[stage.id] = {
      stageId: stage.id,
      status: 'idle',
      depsAreMet: !(stage.dependencies && stage.dependencies.length > 0), // true if no dependencies
      isEditingOutput: false,
      shouldAutoRun: false, // Will be properly calculated by evaluateDependenciesLogic
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

/**
 * Validate that all loaded stage states match current workflow stage IDs
 * FAIL HARD - reject documents with outdated/mismatched stage IDs
 */
function validateStageStatesMatchWorkflow(
  workflow: Workflow, 
  loadedStageStates: Record<string, StageState>
): { isValid: boolean; mismatchedIds: string[]; validIds: string[] } {
  const currentStageIds = new Set(workflow.stages.map(s => s.id));
  const loadedStageIds = Object.keys(loadedStageStates);
  
  const validIds: string[] = [];
  const mismatchedIds: string[] = [];
  
  loadedStageIds.forEach(loadedId => {
    if (currentStageIds.has(loadedId)) {
      validIds.push(loadedId);
    } else {
      mismatchedIds.push(loadedId);
    }
  });
  
  return {
    isValid: mismatchedIds.length === 0,
    mismatchedIds,
    validIds
  };
}

export default async function WizardPage({ 
  params
}: { 
  params: Promise<{ shortName: string; documentId: string }>; 
}) {
  const { shortName, documentId } = await params;

  console.log('[WizardPage] Starting page load', { shortName, documentId });

  // Get the workflow configuration - FAIL HARD if not found
  const workflow = getWorkflowByShortName(shortName);
  if (!workflow) {
    console.error('[WizardPage] FATAL: Workflow not found', { shortName });
    notFound();
  }

  let wizardInstance: WizardInstance;

  // Handle special cases: temp documents or explicit "new"
  if (documentId === 'new' || documentId.startsWith('temp-')) {
    console.log('[WizardPage] Creating temporary document instance', { documentId });
    
    const tempId = documentId === 'new' ? `temp-${Date.now()}` : documentId;
    
    wizardInstance = {
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
    };
  } else {
    // Load existing document from Firestore
    // Document MUST exist since new/page.tsx creates it before redirecting
    console.log('[WizardPage] Loading existing document:', documentId);
    
    const loadResult = await documentPersistence.loadDocument(documentId);
    
    if (!loadResult.success || !loadResult.document || !loadResult.stageStates) {
      console.error('[WizardPage] Document load failed:', { 
        documentId, 
        error: loadResult.error || 'Document or stage states missing',
        hasDocument: !!loadResult.document,
        hasStageStates: !!loadResult.stageStates
      });
      
      // This should rarely happen now since new/page.tsx creates documents
      // If it does happen, it might be a deleted document or permission issue
      notFound();
    }

    // FAIL HARD - Validate stage IDs match current workflow
    const validation = validateStageStatesMatchWorkflow(workflow, loadResult.stageStates);
    
    if (!validation.isValid) {
      console.error('[WizardPage] FATAL: Document stage IDs do not match current workflow', {
        documentId,
        workflowId: workflow.id,
        currentStageIds: workflow.stages.map(s => s.id),
        loadedStageIds: Object.keys(loadResult.stageStates),
        mismatchedIds: validation.mismatchedIds,
        validIds: validation.validIds
      });
      
      // FAIL HARD - No legacy support, reject incompatible documents
      notFound();
    }

    console.log('[WizardPage] Document loaded successfully:', {
      documentId: loadResult.document.id,
      title: loadResult.document.title,
      stageCount: Object.keys(loadResult.stageStates).length,
      validatedStageIds: validation.validIds
    });
    
    // Only use validated stage states that match current workflow
    const initializedStageStates = initializeStageStates(workflow);
    const mergedStageStates: Record<string, StageState> = { ...initializedStageStates };
    
    // Only merge stage states that passed validation
    validation.validIds.forEach(stageId => {
      if (loadResult.stageStates) {
        mergedStageStates[stageId] = loadResult.stageStates[stageId];
      }
    });
    
    wizardInstance = {
      workflow,
      document: loadResult.document,
      stageStates: mergedStageStates,
    };
  }

  return (
    <>
      <WizardPageContent initialInstance={wizardInstance} />
    </>
  );
} 