"use client";

import { AuthGuard } from "@/components/auth/auth-guard";
import { useAuth } from "@/components/layout/app-providers";
import { WizardShell } from "@/components/wizard/wizard-shell-dynamic";
import EnhancedErrorBoundary from "@/components/enhanced-error-boundary";
import type { WizardInstance } from "@/types";

interface WizardPageContentProps {
  initialInstance: WizardInstance;
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
      <EnhancedErrorBoundary
        component="WizardPageContent"
        userId={user?.uid}
        workflowId={initialInstance.document.workflowId}
        maxRetries={3}
        autoRetryDelay={2000}
      >
        <WizardShell initialInstance={initialInstance} />
      </EnhancedErrorBoundary>
    </AuthGuard>
  );
}

export default WizardPageContent;