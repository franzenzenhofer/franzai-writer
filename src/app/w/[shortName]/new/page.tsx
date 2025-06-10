import { getWorkflowByShortName } from "@/lib/workflow-loader";
import { notFound, redirect } from "next/navigation";
import { generateUniqueId } from "@/lib/utils";

export default async function NewDocumentPage({ 
  params 
}: { 
  params: Promise<{ shortName: string }>;
}) {
  const { shortName } = await params;
  
  // Get workflow by short name
  const workflow = getWorkflowByShortName(shortName);
  
  if (!workflow) {
    notFound();
  }

  // Generate a unique document ID
  const documentId = generateUniqueId();
  
  // Redirect to the document page with new document query parameter
  redirect(`/w/${shortName}/${documentId}?new=${workflow.id}`);
} 