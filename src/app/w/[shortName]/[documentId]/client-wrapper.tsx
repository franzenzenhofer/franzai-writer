"use client";

import dynamic from 'next/dynamic';
import type { WizardInstance } from '@/types';

// Lazy import to break the static analysis chain and prevent Turbopack hanging
const WizardPageContent = dynamic(
  () => import('./wizard-page-content'),
  { 
    loading: () => <div className="flex items-center justify-center min-h-screen">Loading wizard...</div>
  }
);

interface ClientWrapperProps {
  wizardInstance: WizardInstance;
}

export default function ClientWrapper({ wizardInstance }: ClientWrapperProps) {
  return <WizardPageContent initialInstance={wizardInstance} />;
}