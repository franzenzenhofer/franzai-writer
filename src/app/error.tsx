'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        <Alert variant="destructive" className="border-destructive/50">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle className="text-lg font-headline">Oops! Something went wrong</AlertTitle>
          <AlertDescription className="mt-2">
            We encountered an error while processing your request. Please try again or contact support if the problem persists.
          </AlertDescription>
        </Alert>
        
        <div className="bg-card p-6 rounded-lg border space-y-4">
          <div className="space-y-2">
            <h3 className="font-medium">Error details</h3>
            <p className="text-sm text-muted-foreground">
              {error.message || 'An unexpected error occurred'}
            </p>
            {error.digest && (
              <p className="text-xs text-muted-foreground">
                Reference: {error.digest}
              </p>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={reset} className="flex-1">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try again
            </Button>
            <Button variant="outline" asChild className="flex-1">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Go home
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}