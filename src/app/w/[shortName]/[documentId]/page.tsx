import WizardPageClient from './page-client';

// Force dynamic rendering since this page loads documents from Firestore
export const dynamic = 'force-dynamic';

export default async function WizardPage({ 
  params
}: { 
  params: Promise<{ shortName: string; documentId: string }>; 
}) {
  const { shortName, documentId } = await params;

  return <WizardPageClient shortName={shortName} documentId={documentId} />;
} 