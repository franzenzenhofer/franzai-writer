"use client";

import { AuthGuard } from "@/components/auth/auth-guard";
import { useAuth } from "@/components/layout/app-providers";
import { WizardShellLazy } from "@/components/wizard/wizard-shell-lazy";
import ErrorBoundary from "@/components/error-boundary";
import type { WizardInstance } from "@/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface WizardPageContentProps {
  initialInstance: WizardInstance;
}

function WizardErrorFallback({ error, reset }: { error: Error | null; reset: () => void }) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Alert variant="destructive">
        <AlertTriangle className="h-5 w-5" />
        <AlertTitle>Workflow Error</AlertTitle>
        <AlertDescription className="mt-2 space-y-3">
          <p>An error occurred while processing the workflow.</p>
          <p className="text-sm">{error?.message}</p>
          <div className="flex gap-3 mt-4">
            <Button onClick={reset} variant="outline" size="sm">
              Try again
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard">Back to dashboard</Link>
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}

function WizardPageContent({ initialInstance }: WizardPageContentProps) {
  const { user } = useAuth();
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

  // Update the userId to use the authenticated user's ID or demo user
  if (user && initialInstance.document.userId === "user-123") {
    initialInstance.document.userId = user.uid;
  } else if (isDemoMode && initialInstance.document.userId === "user-123") {
    initialInstance.document.userId = "demo-user";
  }

  return (
    <AuthGuard>
      <ErrorBoundary fallback={WizardErrorFallback}>
        <WizardShellLazy initialInstance={initialInstance} />
      </ErrorBoundary>
    </AuthGuard>
  );
}

export default WizardPageContent;