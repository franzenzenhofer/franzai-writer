export default async function TestWorkflowPage({ params }: { params: Promise<{ workflowId: string }> }) {
  console.log('[TestWorkflowPage] STEP 1: Page function called');
  
  const resolvedParams = await params;
  console.log('[TestWorkflowPage] STEP 2: Params resolved:', resolvedParams);
  
  return (
    <div>
      <h1>Test Workflow Page</h1>
      <p>Workflow ID: {resolvedParams.workflowId}</p>
    </div>
  );
}