import { getWorkflowByShortName } from "@/lib/workflow-loader";
import { notFound, redirect } from "next/navigation";
import { generateUniqueId } from "@/lib/utils";
import { documentPersistence } from "@/lib/document-persistence";

export default async function NewDocumentPage({ 
  params 
}: { 
  params: Promise<{ shortName: string }>;
}) {
  const { shortName } = await params;
  
  console.log('[NewDocumentPage] STEP 1: Page accessed', { shortName });
  
  // Get workflow by short name
  const workflow = getWorkflowByShortName(shortName);
  
  if (!workflow) {
    console.error('[NewDocumentPage] STEP 2: FATAL - Workflow not found', { shortName });
    notFound();
  }

  console.log('[NewDocumentPage] STEP 2: Workflow found', { 
    shortName, 
    workflowId: workflow.id,
    workflowName: workflow.name 
  });

  // Generate a unique document ID
  const documentId = generateUniqueId();
  
  console.log('[NewDocumentPage] STEP 3: Generated document ID', { 
    shortName, 
    documentId, 
    workflowId: workflow.id 
  });

  try {
    console.log('[NewDocumentPage] STEP 4: Starting document creation in Firestore');
    
    // Create the document in Firestore BEFORE redirecting
    // This ensures the document exists when WizardPage tries to load it
    const result = await documentPersistence.saveDocument(
      null, // null means create new document
      `New ${workflow.name}`, // title
      workflow.id, // workflowId
      {}, // empty stageStates - will be initialized by WizardPage
      undefined // userId - will be determined by persistence layer
    );

    console.log('[NewDocumentPage] STEP 5: Document creation result', { 
      success: result.success,
      documentId: result.documentId,
      error: result.error,
      originalId: documentId
    });

    if (!result.success) {
      console.error('[NewDocumentPage] STEP 6: Document creation FAILED', { 
        error: result.error,
        documentId,
        workflowId: workflow.id 
      });
      // Redirect back to dashboard with error
      redirect('/dashboard?error=creation_failed');
    }

    const createdDocumentId = result.documentId!;
    console.log('[NewDocumentPage] STEP 6: Document created successfully in Firestore', { 
      originalId: documentId,
      createdId: createdDocumentId,
      workflowId: workflow.id 
    });

    console.log('[NewDocumentPage] STEP 7: Initiating redirect to wizard page', {
      targetUrl: `/w/${shortName}/${createdDocumentId}`
    });

    // Now redirect to the document that definitely exists in Firestore
    // NOTE: redirect() throws NEXT_REDIRECT internally - this is NORMAL behavior
    redirect(`/w/${shortName}/${createdDocumentId}`);
    
  } catch (error: any) {
    console.log('[NewDocumentPage] STEP 8: Caught exception', {
      errorName: error.name,
      errorMessage: error.message,
      isNextRedirect: error.message === 'NEXT_REDIRECT'
    });

    // Check if this is a Next.js redirect error (which is normal)
    if (error.message === 'NEXT_REDIRECT' || error.digest?.startsWith('NEXT_REDIRECT')) {
      console.log('[NewDocumentPage] STEP 9: This is a Next.js redirect - letting it through');
      // Re-throw Next.js redirect errors so they work properly
      throw error;
    }
    
    // Only handle actual application errors
    console.error('[NewDocumentPage] STEP 9: REAL exception during document creation', {
      error: error.message,
      errorType: error.constructor.name,
      documentId,
      workflowId: workflow.id,
      stack: error.stack
    });
    
    // Redirect back to dashboard with error
    redirect('/dashboard?error=creation_exception');
  }
} 