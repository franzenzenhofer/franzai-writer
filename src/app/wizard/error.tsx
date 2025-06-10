'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, RotateCcw, FileText } from 'lucide-react';
import Link from 'next/link';

export default function WizardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Wizard error:', error);
  }, [error]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Alert variant="destructive" className="mb-6">
        <AlertTriangle className="h-5 w-5" />
        <AlertTitle className="font-headline">Workflow Error</AlertTitle>
        <AlertDescription className="mt-2">
          We encountered an error while processing your workflow. Your progress has been saved.
        </AlertDescription>
      </Alert>
      
      <div className="bg-card border rounded-lg p-6 space-y-4">
        <div>
          <h3 className="font-medium mb-2">What happened?</h3>
          <p className="text-sm text-muted-foreground">
            {error.message || 'An error occurred during workflow execution'}
          </p>
        </div>
        
        <div className="pt-4 space-y-3">
          <Button onClick={reset} className="w-full">
            <RotateCcw className="mr-2 h-4 w-4" />
            Retry workflow
          </Button>
          <Button variant="outline" asChild className="w-full">
            <Link href="/dashboard">
              <FileText className="mr-2 h-4 w-4" />
              Back to workflows
            </Link>
          </Button>
        </div>
        
        {error.digest && (
          <p className="text-xs text-center text-muted-foreground pt-2">
            Error reference: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}