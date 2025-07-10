"use client";

import React, { Suspense } from 'react';
import { Loader2, FileText, Eye } from 'lucide-react';
import type { Stage, StageState, Workflow } from '@/types';

// Lazy load the input and output components
const StageInputArea = React.lazy(() => import('./stage-input-area').then(module => ({ default: module.StageInputArea })));
const StageOutputArea = React.lazy(() => import('./stage-output-area').then(module => ({ default: module.StageOutputArea })));

// Loading component for input area
function StageInputAreaLoadingFallback({ stage }: { stage: Stage }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <FileText className="h-4 w-4" />
        <span>Loading input area...</span>
      </div>
      <div className="space-y-2">
        {stage.inputType === 'form' && stage.formFields ? (
          // Form fields skeleton
          stage.formFields.map((field, index) => (
            <div key={index} className="space-y-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3"></div>
              <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ))
        ) : (
          // Text area skeleton
          <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
        )}
      </div>
    </div>
  );
}

// Loading component for output area
function StageOutputAreaLoadingFallback() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Eye className="h-4 w-4" />
        <span>Loading output...</span>
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-20 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
      </div>
    </div>
  );
}

// Lazy input area component
interface StageInputAreaLazyProps {
  stage: Stage;
  stageState: StageState;
  onInputChange: (stageId: string, fieldName: string, value: any) => void;
  onFormSubmit: (stageId: string, data: any) => void;
  allStageStates: Record<string, StageState>;
  onSubmit?: () => void;
}

export function StageInputAreaLazy(props: StageInputAreaLazyProps) {
  return (
    <Suspense fallback={<StageInputAreaLoadingFallback stage={props.stage} />}>
      <StageInputArea {...props} />
    </Suspense>
  );
}

// Lazy output area component
interface StageOutputAreaLazyProps {
  stage: Stage;
  stageState: StageState;
  workflow: Workflow;
  isEditingOutput: boolean;
  onOutputChange?: (newOutput: any) => void;
}

export function StageOutputAreaLazy(props: StageOutputAreaLazyProps) {
  return (
    <Suspense fallback={<StageOutputAreaLoadingFallback />}>
      <StageOutputArea {...props} />
    </Suspense>
  );
}