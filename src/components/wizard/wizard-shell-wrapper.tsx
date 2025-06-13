"use client";

import dynamic from 'next/dynamic';
import type { WizardInstance } from '@/types';
import { Loader2 } from 'lucide-react';

// Dynamic import to avoid Turbopack issues with server action imports
const WizardShell = dynamic(
  () => import('./wizard-shell').then(mod => ({ default: mod.WizardShell })),
  {
    loading: () => (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    ),
    ssr: false // Disable SSR to avoid server/client boundary issues
  }
);

interface WizardShellWrapperProps {
  initialInstance: WizardInstance;
}

export function WizardShellWrapper({ initialInstance }: WizardShellWrapperProps) {
  return <WizardShell initialInstance={initialInstance} />;
}