import WizardContainer from './wizard-container';

export default async function WizardPage({ 
  params 
}: { 
  params: Promise<{ shortName: string; documentId: string }> 
}) {
  const { shortName, documentId } = await params;
  return <WizardContainer shortName={shortName} documentId={documentId} />;
}