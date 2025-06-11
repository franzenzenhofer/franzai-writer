import { getWorkflowById, getWorkflowByShortName } from "@/lib/workflow-loader";
import { notFound, redirect } from "next/navigation";
import type { WizardDocument, WizardInstance, StageState } from "@/types";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { siteConfig } from "@/config/site";
import { WizardPageContent } from "./wizard-page-content";
import { documentPersistence } from '@/lib/document-persistence';

export default async function WizardPage({ 
  params
}: { 
  params: Promise<{ shortName: string; documentId: string }>;
}) {
  const { shortName, documentId } = await params;
  
  // Get workflow by short name
  const workflow = getWorkflowByShortName(shortName);
  
  if (!workflow) {
    notFound();
  }

  let wizardInstance: WizardInstance;
  let dynamicTitle = workflow.name;

  // Try to load existing document by documentId
  try {
    console.log('[WizardPage] Attempting to load document:', documentId);
    
    const result = await documentPersistence.loadDocument(documentId);
    
    if (result.success && result.document && result.stageStates) {
      const { document, stageStates } = result;
      
      // Verify this document belongs to the correct workflow
      if (document.workflowId !== workflow.id) {
        console.log('[WizardPage] Document workflow mismatch:', {
          documentWorkflow: document.workflowId,
          expectedWorkflow: workflow.id
        });
        notFound();
      }
      
      wizardInstance = {
        document,
        workflow,
        stageStates,
      };
      dynamicTitle = document.title;
      
      console.log('[WizardPage] Document loaded successfully:', {
        documentId: document.id,
        title: document.title,
        stageCount: Object.keys(stageStates).length
      });
      
    } else {
      // Document not found - create a new one
      console.log('[WizardPage] Document not found, creating new:', documentId);
      
      dynamicTitle = `New ${workflow.name}`;
      const newDoc: WizardDocument = {
        // Prefix with 'temp-' so the persistence layer knows this document
        // hasn't been saved to Firestore yet and will call saveDocument()
        id: `temp-${documentId}`,
        title: dynamicTitle,
        workflowId: workflow.id,
        status: "draft",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: "temp_user", // Will be updated by persistence layer
      };

      const initialStageStates: Record<string, StageState> = {};
      workflow.stages.forEach(stage => {
        const stageState: StageState = {
          stageId: stage.id,
          status: "idle",
          isStale: false,
          staleDismissed: false,
          depsAreMet: stage.dependencies && stage.dependencies.length > 0 ? false : true,
          shouldAutoRun: stage.autoRun && (!stage.dependencies || stage.dependencies.length === 0),
          isEditingOutput: false,
          userInput: undefined, // Will be set below based on stage type
          output: undefined,
          tokensConsumed: undefined,
          error: undefined,
        };

        // Set userInput based on stage input type
        if (stage.formFields) {
          // Form-based input
          stageState.userInput = Object.fromEntries(
            stage.formFields.map(f => [f.name, f.defaultValue ?? (f.type === 'checkbox' ? false : '')])
          );
        } else if (stage.inputType === 'context') {
          // Context/dropzone input
          stageState.userInput = { manual: "", dropped: "" };
        } else if (stage.inputType === 'textarea') {
          // Simple textarea input
          stageState.userInput = "";
        } else {
          // Default empty string for other input types
          stageState.userInput = "";
        }
        
        initialStageStates[stage.id] = stageState;
      });

      wizardInstance = {
        document: newDoc,
        workflow,
        stageStates: initialStageStates,
      };
    }
  } catch (error) {
    console.error('[WizardPage] Error loading document:', error);
    
    // Check for specific Firestore errors and throw appropriate HTTP errors
    if (error instanceof Error) {
      if (error.message.includes('PERMISSION_DENIED') || error.message.includes('permission-denied')) {
        throw new Error('Firestore API is not properly configured. Please check your Firebase setup.');
      }
      if (error.message.includes('unavailable') || error.message.includes('offline')) {
        throw new Error('Database connection failed. Please check your Firestore configuration.');
      }
    }
    
    // For any other errors, throw a generic error that will result in 500
    throw new Error('Failed to load or create document');
  }

  return <WizardPageContent initialInstance={wizardInstance} />;
} 