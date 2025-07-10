"use client";

import React, { Suspense } from 'react';
import type { WizardInstance } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

// Lazy load the main wizard shell component
const WizardShell = React.lazy(() => import('./wizard-shell').then(module => ({ default: module.WizardShell })));

// Loading component for the wizard
function WizardLoadingFallback() {
  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
      <div className="space-y-6">
        {/* Title skeleton */}
        <div className="h-8 bg-gray-200 rounded-lg animate-pulse"></div>
        
        {/* Progress bar skeleton */}
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
        </div>
        
        {/* Stage cards skeleton */}
        {[1, 2, 3].map((i) => (
          <Card key={i} className="mb-4">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <div className="h-6 bg-gray-200 rounded animate-pulse flex-1"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-20 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Error boundary for lazy loading failures
class WizardErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Wizard loading error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <h2 className="text-lg font-semibold text-red-800">
                  Failed to Load Wizard
                </h2>
                <p className="text-red-600">
                  There was an error loading the wizard interface. Please refresh the page.
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Refresh Page
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

interface WizardShellLazyProps {
  initialInstance: WizardInstance;
}

export function WizardShellLazy({ initialInstance }: WizardShellLazyProps) {
  return (
    <WizardErrorBoundary>
      <Suspense fallback={<WizardLoadingFallback />}>
        <WizardShell initialInstance={initialInstance} />
      </Suspense>
    </WizardErrorBoundary>
  );
}