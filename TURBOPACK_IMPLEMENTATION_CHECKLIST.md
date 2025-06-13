# TURBOPACK IMPLEMENTATION CHECKLIST

## Pre-Implementation Setup
- [ ] Start fresh server: `npm run dev`
- [ ] Keep terminal visible to watch for hangs
- [ ] Have `pkill -f 'next-server' || true; pkill -f 'node.*next' || true` ready to copy/paste
- [ ] Create test curl command: `curl -s --max-time 5 http://localhost:9002/e/poem/test -o /dev/null -w "%{http_code}" || echo "TIMEOUT"`

## Step-by-Step Implementation

### Step 1: Create Minimal Server Page
```typescript
// /e/[shortName]/[documentId]/page.tsx
export default function WizardPage() {
  return <div>Wizard Page</div>;
}
```
- [ ] Create file
- [ ] Test with curl - MUST return 200
- [ ] If hang: KILL SERVER, restart, identify issue

### Step 2: Add Route Parameters
```typescript
// /e/[shortName]/[documentId]/page.tsx
export default async function WizardPage({ 
  params 
}: { 
  params: Promise<{ shortName: string; documentId: string }> 
}) {
  const { shortName, documentId } = await params;
  return <div>Wizard: {shortName} - {documentId}</div>;
}
```
- [ ] Update file
- [ ] Test with curl - MUST return 200
- [ ] Verify parameters are displayed

### Step 3: Create Minimal Client Component
```typescript
// /e/[shortName]/[documentId]/wizard-container.tsx
"use client";
export default function WizardContainer({ shortName, documentId }: { shortName: string; documentId: string }) {
  return <div>Client Wizard: {shortName} - {documentId}</div>;
}
```
- [ ] Create file
- [ ] DO NOT import anything yet
- [ ] Test standalone

### Step 4: Connect Server to Client
```typescript
// Update page.tsx
import WizardContainer from './wizard-container';

export default async function WizardPage({ params }: { params: Promise<{ shortName: string; documentId: string }> }) {
  const { shortName, documentId } = await params;
  return <WizardContainer shortName={shortName} documentId={documentId} />;
}
```
- [ ] Update page.tsx
- [ ] Test with curl - MUST return 200
- [ ] If hang: Client component has problematic imports

### Step 5: Create API Route for Workflow
```typescript
// /api/wizard/workflow/[shortName]/route.ts
import { getWorkflowByShortName } from '@/lib/workflow-loader';
import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: Promise<{ shortName: string }> }) {
  const { shortName } = await params;
  const workflow = getWorkflowByShortName(shortName);
  
  if (!workflow) {
    return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
  }
  
  return NextResponse.json({ workflow });
}
```
- [ ] Create file
- [ ] Test API directly: `curl http://localhost:9002/api/wizard/workflow/poem`
- [ ] Must return JSON

### Step 6: Create API Route for Document
```typescript
// /api/wizard/document/[documentId]/route.ts
import { documentPersistence } from '@/lib/document-persistence';
import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: Promise<{ documentId: string }> }) {
  const { documentId } = await params;
  
  if (documentId === 'new' || documentId.startsWith('temp-')) {
    return NextResponse.json({ document: null, isNew: true });
  }
  
  const result = await documentPersistence.loadDocument(documentId);
  return NextResponse.json(result);
}
```
- [ ] Create file
- [ ] Test API directly
- [ ] Must return JSON

### Step 7: Add Data Fetching to Client
```typescript
// Update wizard-container.tsx
"use client";
import { useState, useEffect } from 'react';

export default function WizardContainer({ shortName, documentId }: { shortName: string; documentId: string }) {
  const [loading, setLoading] = useState(true);
  const [workflow, setWorkflow] = useState(null);
  const [document, setDocument] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [workflowRes, docRes] = await Promise.all([
          fetch(`/api/wizard/workflow/${shortName}`),
          fetch(`/api/wizard/document/${documentId}`)
        ]);
        
        const workflowData = await workflowRes.json();
        const docData = await docRes.json();
        
        setWorkflow(workflowData.workflow);
        setDocument(docData.document);
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, [shortName, documentId]);

  if (loading) return <div>Loading...</div>;
  if (!workflow) return <div>Workflow not found</div>;
  
  return <div>Loaded: {workflow.name}</div>;
}
```
- [ ] Update file incrementally
- [ ] Test after EACH addition
- [ ] Must not hang

### Step 8: Create API Route for AI Execution
```typescript
// /api/wizard/execute/route.ts
import { runAiStage } from '@/app/actions/aiActions-new';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await runAiStage(body);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```
- [ ] Create file
- [ ] Test with curl POST
- [ ] Must return JSON

### Step 9: Create Client-Safe Wizard Shell
```typescript
// /e/[shortName]/[documentId]/wizard-shell-turbopack.tsx
"use client";
// Copy wizard-shell.tsx but replace:
// import { runAiStage } from '@/app/actions/aiActions-new';
// with:
async function runAiStage(params: any) {
  const response = await fetch('/api/wizard/execute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  return response.json();
}
```
- [ ] Create new file (don't modify existing)
- [ ] Replace server action with fetch
- [ ] Remove any other server imports

### Step 10: Test Full Integration
- [ ] Import wizard-shell-turbopack in wizard-container
- [ ] Test basic rendering
- [ ] Test AI execution
- [ ] Test document persistence
- [ ] All must work without hanging

## Validation Checklist
- [ ] `curl http://localhost:9002/e/poem/new` returns 200
- [ ] `curl http://localhost:9002/e/poem/test-id` returns 200
- [ ] No compilation hangs during development
- [ ] All wizard features work
- [ ] Can create new documents
- [ ] Can load existing documents
- [ ] Can execute AI stages
- [ ] Can save progress

## If Any Step Fails:
1. IMMEDIATELY kill the server
2. Restart the server
3. Remove the last change
4. Identify what import caused the issue
5. Find an alternative approach
6. Document the issue in TURBOPACK_ISSUES.md