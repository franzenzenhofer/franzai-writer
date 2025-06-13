import { getWorkflowByShortName } from '@/lib/workflow-loader';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request, 
  { params }: { params: Promise<{ shortName: string }> }
) {
  const { shortName } = await params;
  const workflow = getWorkflowByShortName(shortName);
  
  if (!workflow) {
    return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
  }
  
  return NextResponse.json({ workflow });
}