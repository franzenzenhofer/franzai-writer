// Test exact pattern from wizard page
import WizardPageContent from '@/app/w/[shortName]/[documentId]/wizard-page-content';

export default async function TestExactPage() {
  console.log('[TestExactPage] Starting');
  
  const wizardInstance = {
    workflow: {
      id: 'test',
      name: 'Test',
      shortName: 'test',
      description: 'Test',
      stages: []
    },
    document: {
      id: 'test-123',
      title: 'Test',
      workflowId: 'test',
      status: 'draft' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: 'test',
    },
    stageStates: {}
  };
  
  return (
    <>
      <WizardPageContent initialInstance={wizardInstance} />
    </>
  );
}