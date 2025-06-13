// Test the full wizard page flow
import { documentPersistence } from '@/lib/document-persistence';
import { getWorkflowByShortName } from '@/lib/workflow-loader';
import type { WizardInstance, StageState, Workflow } from '@/types';

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

export default async function TestFirebasePage() {
  console.log('[TestFirebasePage] Starting full wizard flow test');
  
  // Test 1: Get workflow
  const workflow = getWorkflowByShortName('poem');
  if (!workflow) {
    return <div>Workflow not found</div>;
  }
  console.log('[TestFirebasePage] Workflow loaded:', workflow.id);
  
  // Test 2: Try loading a document
  try {
    const loadResult = await documentPersistence.loadDocument('test-doc-id');
    console.log('[TestFirebasePage] Document load result:', loadResult);
  } catch (error) {
    console.error('[TestFirebasePage] Document load failed:', error);
  }
  
  // Test 3: Create wizard instance
  const wizardInstance: WizardInstance = {
    workflow,
    document: {
      id: 'temp-123',
      title: 'Test Document',
      workflowId: workflow.id,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: 'temp_user',
    },
    stageStates: initializeStageStates(workflow),
  };
  
  console.log('[TestFirebasePage] Wizard instance created');
  
  // Test 4: Import and render client component
  const WizardPageContent = (await import('@/app/w/[shortName]/[documentId]/wizard-page-content')).default;
  console.log('[TestFirebasePage] WizardPageContent imported');
  
  return (
    <div>
      <div>Test Firebase Page - With Client Component</div>
      <WizardPageContent initialInstance={wizardInstance} />
    </div>
  );
}