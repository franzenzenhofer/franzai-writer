import { notFound } from 'next/navigation';
import { getWorkflowByShortName } from '@/lib/workflow-loader';
import { documentPersistence } from '@/lib/document-persistence';
import WizardPageContent from './wizard-page-content';
import type { WizardDocument, WizardInstance, StageState } from '@/types';
import { siteConfig } from '@/config/site';

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
  let dynamicTitle = workflow.name;

  // Try to load existing document by documentId
  if (documentId && !documentId.startsWith('temp-') && documentId !== 'new') {
    console.log('[WizardPage] Attempting to load document:', documentId);
    
    try {
      const loadResult = await documentPersistence.loadDocument(documentId);
      
      if (loadResult.success && loadResult.document && loadResult.stageStates) {
        console.log('[WizardPage] Document loaded successfully:', {
          documentId: loadResult.document.id,
          title: loadResult.document.title,
          stageCount: Object.keys(loadResult.stageStates).length
        });
        
        dynamicTitle = loadResult.document.title;
        
        wizardInstance = {
          workflow,
          document: loadResult.document,
          stageStates: loadResult.stageStates,
        };
      } else {
        console.log('[WizardPage] Document not found, creating new:', documentId);
        throw new Error('Document not found');
      }
    } catch (error: any) {
      console.error('[WizardPage] Failed to load document:', { documentId, error: error.message });
      
      // Create new instance with the requested documentId
      wizardInstance = {
        workflow,
        document: {
          id: documentId,
          title: `New ${workflow.name}`,
          workflowId: workflow.id,
          status: 'draft',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          userId: 'temp_user',
        },
        stageStates: {},
      };
    }
  } else {
    // Create new document instance
    console.log('[WizardPage] Creating new document instance');
    
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
      stageStates: {},
    };
  }

  return (
    <>
      <WizardPageContent initialInstance={wizardInstance} />
    </>
  );
} 