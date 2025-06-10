"use client";

import { AuthGuard } from "@/components/auth/auth-guard";
import { useAuth } from "@/components/layout/app-providers";
import { WizardShell } from "@/components/wizard/wizard-shell";
import type { WizardInstance } from "@/types";

interface WizardPageContentProps {
  initialInstance: WizardInstance;
}

export function WizardPageContent({ initialInstance }: WizardPageContentProps) {
  const { user } = useAuth();

  // Update the userId to use the authenticated user's ID
  if (user && initialInstance.document.userId === "user-123") {
    initialInstance.document.userId = user.uid;
  }

  return (
    <AuthGuard>
      <WizardShell initialInstance={initialInstance} />
    </AuthGuard>
  );
}