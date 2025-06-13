"use client";

import dynamic from 'next/dynamic';
import type { WizardInstance } from '@/types';

// Dynamically import WizardPageContent to avoid bundling issues
const WizardPageContent = dynamic(() => import('./wizard-page-content'), {
  loading: () => <div className="flex items-center justify-center min-h-screen">Loading wizard...</div>
});

interface WizardClientWrapperProps {
  initialInstance: WizardInstance;
}

export default function WizardClientWrapper({ initialInstance }: WizardClientWrapperProps) {
  return <WizardPageContent initialInstance={initialInstance} />;
}